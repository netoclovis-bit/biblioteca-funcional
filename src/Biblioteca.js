import { Livro } from './modelos/Livro.js';
import { Usuario } from './modelos/Usuario.js';
import { Emprestimo } from './modelos/Emprestimo.js';
import { adicionarDias, validarData } from './funcoes/datas.js';
import { filtrarLivrosPorCategoria } from './funcoes/regras.js';
import { gerarRelatorioMultas } from './funcoes/relatorios.js';
import { gerarEstatisticas } from './funcoes/estatisticas.js';

export const PRAZO_PADRAO_DIAS = 7;

export class Biblioteca {
  #livros = new Map();
  #usuarios = new Map();
  #emprestimos = new Map();
  #proximoIdEmprestimo = 1;

  cadastrarLivro(id, titulo, autor, categoria) {
    if (this.#livros.has(id)) {
      throw new Error(`Já existe um livro com o identificador ${id}.`);
    }
    const livro = new Livro(id, titulo, autor, categoria);
    this.#livros.set(id, livro);
    return livro;
  }

  cadastrarUsuario(id, nome, matricula) {
    if (this.#usuarios.has(id)) {
      throw new Error(`Já existe um usuário com o identificador ${id}.`);
    }
    const usuarioComMesmaMatricula = this.listarUsuarios().find((usuario) => usuario.matricula === matricula);
    if (usuarioComMesmaMatricula) {
      throw new Error(`A matrícula ${matricula} já pertence a ${usuarioComMesmaMatricula.nome}.`);
    }
    const usuario = new Usuario(id, nome, matricula);
    this.#usuarios.set(id, usuario);
    return usuario;
  }

  buscarLivro(id) {
    const livro = this.#livros.get(id);
    if (!livro) {
      throw new Error(`Livro ${id} não encontrado.`);
    }
    return livro;
  }

  buscarUsuario(id) {
    const usuario = this.#usuarios.get(id);
    if (!usuario) {
      throw new Error(`Usuário ${id} não encontrado.`);
    }
    return usuario;
  }

  buscarEmprestimo(id) {
    const emprestimo = this.#emprestimos.get(id);
    if (!emprestimo) {
      throw new Error(`Empréstimo ${id} não encontrado.`);
    }
    return emprestimo;
  }

  listarLivros() {
    return Object.freeze([...this.#livros.values()]);
  }

  listarUsuarios() {
    return Object.freeze([...this.#usuarios.values()]);
  }

  listarEmprestimos() {
    return Object.freeze([...this.#emprestimos.values()]);
  }

  listarLivrosPorCategoria(categoria) {
    return Object.freeze(filtrarLivrosPorCategoria(this.listarLivros(), categoria));
  }

  listarEmprestimosDoUsuario(idUsuario) {
    this.buscarUsuario(idUsuario);
    return Object.freeze(this.listarEmprestimos().filter((emprestimo) => emprestimo.usuario.id === idUsuario));
  }

  livroEstaDisponivel(idLivro) {
    this.buscarLivro(idLivro);
    return !this.listarEmprestimos().some(
      (emprestimo) => emprestimo.livro.id === idLivro && emprestimo.estaAtivo()
    );
  }

  registrarEmprestimo(idLivro, idUsuario, dataEmprestimo, prazoEmDias = PRAZO_PADRAO_DIAS) {
    const livro = this.buscarLivro(idLivro);
    const usuario = this.buscarUsuario(idUsuario);
    if (!this.livroEstaDisponivel(idLivro)) {
      throw new Error(`O livro "${livro.titulo}" já está emprestado.`);
    }
    if (!Number.isInteger(prazoEmDias) || prazoEmDias < 1) {
      throw new Error('O prazo do empréstimo deve ser um número inteiro de dias maior que zero.');
    }
    const emprestimo = new Emprestimo(
      this.#proximoIdEmprestimo,
      livro,
      usuario,
      validarData(dataEmprestimo),
      adicionarDias(dataEmprestimo, prazoEmDias)
    );
    this.#emprestimos.set(emprestimo.id, emprestimo);
    this.#proximoIdEmprestimo += 1;
    return emprestimo;
  }

  registrarDevolucao(idEmprestimo, dataDevolucao) {
    const devolvido = this.buscarEmprestimo(idEmprestimo).comDevolucao(dataDevolucao);
    this.#emprestimos.set(idEmprestimo, devolvido);
    return devolvido;
  }

  gerarRelatorioMultas(dataReferencia) {
    return gerarRelatorioMultas(this.listarEmprestimos(), dataReferencia);
  }

  gerarEstatisticas(dataReferencia) {
    return gerarEstatisticas(this.listarLivros(), this.listarEmprestimos(), dataReferencia);
  }
}
