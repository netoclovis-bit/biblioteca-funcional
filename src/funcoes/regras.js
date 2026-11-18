import { diasEntre } from './datas.js';

export const MULTA_DIARIA = 2;

export const calcularMulta = (diasAtraso, valorDiario) =>
  diasAtraso > 0 ? diasAtraso * valorDiario : 0;

export const calcularDiasAtraso = (dataPrevista, dataReferencia) =>
  Math.max(0, diasEntre(dataPrevista, dataReferencia));

export const filtrarLivrosPorCategoria = (livros, categoria) =>
  livros.filter((livro) => livro.categoria.toLowerCase() === categoria.toLowerCase());

export const selecionarEmprestimosAtrasados = (emprestimos, dataReferencia) =>
  emprestimos.filter((emprestimo) => emprestimo.estaAtrasado(dataReferencia));
