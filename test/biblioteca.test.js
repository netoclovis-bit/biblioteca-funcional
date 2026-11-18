import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Biblioteca } from '../src/Biblioteca.js';
import { Livro } from '../src/modelos/Livro.js';
import { Usuario } from '../src/modelos/Usuario.js';
import { Emprestimo } from '../src/modelos/Emprestimo.js';

describe('entidades', () => {
  test('Livro e Usuario são imutáveis e encapsulados', () => {
    const livro = new Livro('L1', 'Título', 'Autor', 'Categoria');
    const usuario = new Usuario('U1', 'Nome', '123');
    assert.ok(Object.isFrozen(livro));
    assert.ok(Object.isFrozen(usuario));
    assert.throws(() => {
      livro.titulo = 'Outro';
    }, TypeError);
    assert.equal(livro.titulo, 'Título');
  });

  test('campos obrigatórios são validados', () => {
    assert.throws(() => new Livro('L1', '', 'Autor', 'Categoria'));
    assert.throws(() => new Usuario('U1', 'Nome', ''));
  });

  test('Emprestimo.comDevolucao cria um novo objeto e preserva o original', () => {
    const original = new Emprestimo(
      1,
      new Livro('L1', 'T', 'A', 'C'),
      new Usuario('U1', 'N', '1'),
      '2026-11-01',
      '2026-11-08'
    );
    const devolvido = original.comDevolucao('2026-11-05');
    assert.notEqual(devolvido, original);
    assert.ok(original.estaAtivo());
    assert.equal(devolvido.dataDevolucao, '2026-11-05');
    assert.throws(() => devolvido.comDevolucao('2026-11-06'));
  });

  test('Emprestimo rejeita datas incoerentes', () => {
    const livro = new Livro('L1', 'T', 'A', 'C');
    const usuario = new Usuario('U1', 'N', '1');
    assert.throws(() => new Emprestimo(1, livro, usuario, '2026-11-10', '2026-11-01'));
    assert.throws(() => new Emprestimo(1, livro, usuario, '2026-11-10', '2026-11-17', '2026-11-09'));
  });
});

describe('Biblioteca', () => {
  let biblioteca;

  beforeEach(() => {
    biblioteca = new Biblioteca();
    biblioteca.cadastrarLivro('L1', 'Código Limpo', 'Robert C. Martin', 'Programação');
    biblioteca.cadastrarLivro('L2', 'Dom Casmurro', 'Machado de Assis', 'Literatura');
    biblioteca.cadastrarUsuario('U1', 'Ana', '001');
    biblioteca.cadastrarUsuario('U2', 'Bruno', '002');
  });

  test('cadastra e consulta livros e usuários', () => {
    assert.equal(biblioteca.buscarLivro('L1').titulo, 'Código Limpo');
    assert.equal(biblioteca.buscarUsuario('U2').nome, 'Bruno');
    assert.equal(biblioteca.listarLivros().length, 2);
    assert.throws(() => biblioteca.buscarLivro('X'));
  });

  test('não permite identificadores ou matrículas duplicados', () => {
    assert.throws(() => biblioteca.cadastrarLivro('L1', 'Outro', 'Autor', 'Cat'));
    assert.throws(() => biblioteca.cadastrarUsuario('U3', 'Carla', '001'));
  });

  test('listas devolvidas não expõem o estado interno', () => {
    const lista = biblioteca.listarLivros();
    assert.ok(Object.isFrozen(lista));
    assert.throws(() => lista.push('intruso'), TypeError);
    assert.equal(biblioteca.listarLivros().length, 2);
  });

  test('registra empréstimo com prazo padrão de 7 dias', () => {
    const emprestimo = biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01');
    assert.equal(emprestimo.dataPrevistaDevolucao, '2026-11-08');
    assert.equal(biblioteca.livroEstaDisponivel('L1'), false);
  });

  test('um livro não pode estar emprestado para dois usuários ao mesmo tempo', () => {
    biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01');
    assert.throws(() => biblioteca.registrarEmprestimo('L1', 'U2', '2026-11-02'), /já está emprestado/);
  });

  test('um usuário pode ter vários empréstimos', () => {
    biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01');
    biblioteca.registrarEmprestimo('L2', 'U1', '2026-11-01');
    assert.equal(biblioteca.listarEmprestimosDoUsuario('U1').length, 2);
  });

  test('devolução registra a data e libera o livro', () => {
    const emprestimo = biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01');
    biblioteca.registrarDevolucao(emprestimo.id, '2026-11-20');
    assert.equal(biblioteca.buscarEmprestimo(emprestimo.id).dataDevolucao, '2026-11-20');
    assert.equal(biblioteca.livroEstaDisponivel('L1'), true);
    assert.doesNotThrow(() => biblioteca.registrarEmprestimo('L1', 'U2', '2026-11-21'));
  });

  test('não permite devolver duas vezes', () => {
    const emprestimo = biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01');
    biblioteca.registrarDevolucao(emprestimo.id, '2026-11-05');
    assert.throws(() => biblioteca.registrarDevolucao(emprestimo.id, '2026-11-06'));
  });

  test('empréstimo devolvido com atraso não gera multa no relatório', () => {
    const emprestimo = biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01');
    biblioteca.registrarDevolucao(emprestimo.id, '2026-11-20');
    assert.equal(biblioteca.gerarRelatorioMultas('2026-11-30').total, 0);
  });

  test('relatório e estatísticas usam a data de referência informada', () => {
    biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01');
    biblioteca.registrarEmprestimo('L2', 'U2', '2026-11-10');
    assert.equal(biblioteca.gerarRelatorioMultas('2026-11-08').total, 0);
    assert.equal(biblioteca.gerarRelatorioMultas('2026-11-18').total, 20 + 2);
    const estatisticas = biblioteca.gerarEstatisticas('2026-11-18');
    assert.equal(estatisticas.emprestimosAtivos, 2);
    assert.equal(estatisticas.emprestimosAtrasados, 2);
    assert.equal(estatisticas.valorTotalMultas, 22);
  });
});
