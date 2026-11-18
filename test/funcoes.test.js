import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Livro } from '../src/modelos/Livro.js';
import { Usuario } from '../src/modelos/Usuario.js';
import { Emprestimo } from '../src/modelos/Emprestimo.js';
import { diasEntre, adicionarDias, validarData } from '../src/funcoes/datas.js';
import {
  calcularMulta,
  calcularDiasAtraso,
  filtrarLivrosPorCategoria,
  selecionarEmprestimosAtrasados,
  MULTA_DIARIA,
} from '../src/funcoes/regras.js';
import { gerarRelatorioMultas } from '../src/funcoes/relatorios.js';
import {
  contarLivrosPorCategoria,
  contarEmprestimosPorUsuario,
  contarEmprestimosAtivos,
  contarEmprestimosAtrasados,
  gerarEstatisticas,
} from '../src/funcoes/estatisticas.js';
import { totalMultasImperativo, totalMultasFuncional } from '../src/funcoes/comparacao.js';

const livros = [
  new Livro('L1', 'Código Limpo', 'Robert C. Martin', 'Programação'),
  new Livro('L2', 'Dom Casmurro', 'Machado de Assis', 'Literatura'),
  new Livro('L3', 'Vidas Secas', 'Graciliano Ramos', 'Literatura'),
];
const ana = new Usuario('U1', 'Ana', '001');
const bruno = new Usuario('U2', 'Bruno', '002');

const emprestimos = [
  new Emprestimo(1, livros[0], ana, '2026-11-01', '2026-11-08'),
  new Emprestimo(2, livros[1], bruno, '2026-11-05', '2026-11-12'),
  new Emprestimo(3, livros[2], ana, '2026-11-01', '2026-11-08', '2026-11-07'),
  new Emprestimo(4, livros[2], bruno, '2026-11-15', '2026-11-22'),
];

describe('datas', () => {
  test('diasEntre conta dias corridos, inclusive virando o mês', () => {
    assert.equal(diasEntre('2026-11-08', '2026-11-18'), 10);
    assert.equal(diasEntre('2026-11-28', '2026-12-03'), 5);
    assert.equal(diasEntre('2026-11-18', '2026-11-08'), -10);
  });

  test('adicionarDias devolve uma nova data sem alterar a original', () => {
    const original = '2026-12-28';
    assert.equal(adicionarDias(original, 7), '2027-01-04');
    assert.equal(original, '2026-12-28');
  });

  test('validarData rejeita formatos e datas inexistentes', () => {
    assert.throws(() => validarData('18/11/2026'));
    assert.throws(() => validarData('2026-02-30'));
  });
});

describe('calcularMulta (função pura)', () => {
  test('multiplica os dias de atraso pelo valor diário', () => {
    assert.equal(calcularMulta(10, MULTA_DIARIA), 20);
    assert.equal(calcularMulta(3, 5), 15);
  });

  test('sem atraso não há multa', () => {
    assert.equal(calcularMulta(0, MULTA_DIARIA), 0);
    assert.equal(calcularMulta(-4, MULTA_DIARIA), 0);
  });

  test('entradas iguais produzem sempre a mesma saída', () => {
    const resultados = Array.from({ length: 5 }, () => calcularMulta(7, MULTA_DIARIA));
    assert.deepEqual(resultados, [14, 14, 14, 14, 14]);
  });

  test('calcularDiasAtraso nunca é negativo', () => {
    assert.equal(calcularDiasAtraso('2026-11-08', '2026-11-18'), 10);
    assert.equal(calcularDiasAtraso('2026-11-20', '2026-11-18'), 0);
  });
});

describe('filtrarLivrosPorCategoria', () => {
  test('retorna apenas os livros da categoria, ignorando maiúsculas', () => {
    const resultado = filtrarLivrosPorCategoria(livros, 'literatura');
    assert.deepEqual(resultado.map((livro) => livro.id), ['L2', 'L3']);
  });

  test('não altera a coleção original', () => {
    const copiaDosIds = livros.map((livro) => livro.id);
    const resultado = filtrarLivrosPorCategoria(livros, 'Programação');
    assert.notEqual(resultado, livros);
    assert.deepEqual(livros.map((livro) => livro.id), copiaDosIds);
  });
});

describe('selecionarEmprestimosAtrasados', () => {
  test('seleciona só ativos com data prevista ultrapassada', () => {
    const atrasados = selecionarEmprestimosAtrasados(emprestimos, '2026-11-18');
    assert.deepEqual(atrasados.map((emprestimo) => emprestimo.id), [1, 2]);
  });

  test('no dia previsto ainda não está atrasado', () => {
    assert.equal(selecionarEmprestimosAtrasados(emprestimos, '2026-11-08').length, 0);
  });
});

describe('gerarRelatorioMultas (filter, map e reduce)', () => {
  test('calcula multas individuais e o total', () => {
    const relatorio = gerarRelatorioMultas(emprestimos, '2026-11-18');
    assert.deepEqual(
      relatorio.itens.map((item) => [item.idEmprestimo, item.diasAtraso, item.multa]),
      [
        [1, 10, 20],
        [2, 6, 12],
      ]
    );
    assert.equal(relatorio.total, 32);
  });

  test('empréstimo devolvido não entra no relatório', () => {
    const relatorio = gerarRelatorioMultas(emprestimos, '2026-11-30');
    assert.ok(!relatorio.itens.some((item) => item.idEmprestimo === 3));
  });

  test('o relatório é imutável e não altera os empréstimos', () => {
    const quantidadeAntes = emprestimos.length;
    const relatorio = gerarRelatorioMultas(emprestimos, '2026-11-18');
    assert.ok(Object.isFrozen(relatorio));
    assert.ok(Object.isFrozen(relatorio.itens));
    assert.throws(() => {
      relatorio.itens[0].multa = 0;
    }, TypeError);
    assert.equal(emprestimos.length, quantidadeAntes);
    assert.ok(emprestimos[0].estaAtivo());
  });
});

describe('estatísticas', () => {
  test('livros por categoria usa reduce', () => {
    assert.deepEqual(contarLivrosPorCategoria(livros), { 'Programação': 1, Literatura: 2 });
  });

  test('empréstimos por usuário, separando homônimos pela matrícula', () => {
    assert.deepEqual(contarEmprestimosPorUsuario(emprestimos), { 'Ana (001)': 2, 'Bruno (002)': 2 });
    const outraAna = new Usuario('U3', 'Ana', '003');
    const comHomonimo = [...emprestimos, new Emprestimo(5, livros[0], outraAna, '2026-11-20', '2026-11-27')];
    assert.deepEqual(contarEmprestimosPorUsuario(comHomonimo), { 'Ana (001)': 2, 'Bruno (002)': 2, 'Ana (003)': 1 });
  });

  test('ativos e atrasados', () => {
    assert.equal(contarEmprestimosAtivos(emprestimos), 3);
    assert.equal(contarEmprestimosAtrasados(emprestimos, '2026-11-18'), 2);
  });

  test('gerarEstatisticas reúne tudo, inclusive o total de multas', () => {
    const estatisticas = gerarEstatisticas(livros, emprestimos, '2026-11-18');
    assert.equal(estatisticas.valorTotalMultas, 32);
    assert.ok(Object.isFrozen(estatisticas));
  });
});

describe('comparação entre paradigmas', () => {
  test('imperativo e funcional produzem o mesmo resultado', () => {
    ['2026-11-01', '2026-11-08', '2026-11-18', '2026-12-31'].forEach((data) => {
      assert.equal(totalMultasImperativo(emprestimos, data), totalMultasFuncional(emprestimos, data));
    });
  });

  test('ambos funcionam com lista vazia', () => {
    assert.equal(totalMultasImperativo([], '2026-11-18'), 0);
    assert.equal(totalMultasFuncional([], '2026-11-18'), 0);
  });
});
