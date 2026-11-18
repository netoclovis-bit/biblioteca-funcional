import { gerarRelatorioMultas } from './relatorios.js';
import { selecionarEmprestimosAtrasados } from './regras.js';

export const contarLivrosPorCategoria = (livros) =>
  livros.reduce(
    (contagem, livro) => ({ ...contagem, [livro.categoria]: (contagem[livro.categoria] ?? 0) + 1 }),
    {}
  );

const identificarUsuario = (usuario) => `${usuario.nome} (${usuario.matricula})`;

export const contarEmprestimosPorUsuario = (emprestimos) =>
  emprestimos.reduce(
    (contagem, emprestimo) => ({
      ...contagem,
      [identificarUsuario(emprestimo.usuario)]: (contagem[identificarUsuario(emprestimo.usuario)] ?? 0) + 1,
    }),
    {}
  );

export const contarEmprestimosAtivos = (emprestimos) =>
  emprestimos.reduce((total, emprestimo) => (emprestimo.estaAtivo() ? total + 1 : total), 0);

export const contarEmprestimosAtrasados = (emprestimos, dataReferencia) =>
  selecionarEmprestimosAtrasados(emprestimos, dataReferencia).length;

export const calcularValorTotalMultas = (emprestimos, dataReferencia) =>
  gerarRelatorioMultas(emprestimos, dataReferencia).total;

export const gerarEstatisticas = (livros, emprestimos, dataReferencia) =>
  Object.freeze({
    livrosPorCategoria: Object.freeze(contarLivrosPorCategoria(livros)),
    emprestimosPorUsuario: Object.freeze(contarEmprestimosPorUsuario(emprestimos)),
    emprestimosAtivos: contarEmprestimosAtivos(emprestimos),
    emprestimosAtrasados: contarEmprestimosAtrasados(emprestimos, dataReferencia),
    valorTotalMultas: calcularValorTotalMultas(emprestimos, dataReferencia),
  });
