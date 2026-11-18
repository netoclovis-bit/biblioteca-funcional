import { calcularMulta, MULTA_DIARIA } from './regras.js';

export const totalMultasImperativo = (emprestimos, dataReferencia) => {
  let total = 0;
  for (let i = 0; i < emprestimos.length; i++) {
    const emprestimo = emprestimos[i];
    if (emprestimo.estaAtrasado(dataReferencia)) {
      const dias = emprestimo.diasDeAtraso(dataReferencia);
      total = total + dias * MULTA_DIARIA;
    }
  }
  return total;
};

export const totalMultasFuncional = (emprestimos, dataReferencia) =>
  emprestimos
    .filter((emprestimo) => emprestimo.estaAtrasado(dataReferencia))
    .map((emprestimo) => calcularMulta(emprestimo.diasDeAtraso(dataReferencia), MULTA_DIARIA))
    .reduce((soma, multa) => soma + multa, 0);
