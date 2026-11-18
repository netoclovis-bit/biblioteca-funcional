import { calcularMulta, selecionarEmprestimosAtrasados, MULTA_DIARIA } from './regras.js';

export const gerarRelatorioMultas = (emprestimos, dataReferencia) => {
  const itens = selecionarEmprestimosAtrasados(emprestimos, dataReferencia).map((emprestimo) =>
    Object.freeze({
      idEmprestimo: emprestimo.id,
      titulo: emprestimo.livro.titulo,
      usuario: emprestimo.usuario.nome,
      dataPrevistaDevolucao: emprestimo.dataPrevistaDevolucao,
      diasAtraso: emprestimo.diasDeAtraso(dataReferencia),
      multa: calcularMulta(emprestimo.diasDeAtraso(dataReferencia), MULTA_DIARIA),
    })
  );

  const total = itens.reduce((soma, item) => soma + item.multa, 0);

  return Object.freeze({
    dataReferencia,
    itens: Object.freeze(itens),
    total,
  });
};

export const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

export const formatarRelatorioMultas = (relatorio) => {
  const linhas = relatorio.itens.map(
    (item) =>
      `  #${item.idEmprestimo} | ${item.titulo} | ${item.usuario} | ${item.diasAtraso} dia(s) | ${formatarMoeda(item.multa)}`
  );
  const corpo = linhas.length > 0 ? linhas.join('\n') : '  Nenhum empréstimo em atraso.';
  return `Relatório de multas em ${relatorio.dataReferencia}\n${corpo}\n  Total: ${formatarMoeda(relatorio.total)}`;
};
