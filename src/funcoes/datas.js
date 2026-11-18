const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

export const validarData = (data) => {
  if (typeof data !== 'string' || !FORMATO_DATA.test(data)) {
    throw new Error(`Data inválida: "${data}". Use o formato AAAA-MM-DD.`);
  }
  const [ano, mes, dia] = data.split('-').map(Number);
  const convertida = new Date(Date.UTC(ano, mes - 1, dia));
  if (convertida.getUTCMonth() !== mes - 1 || convertida.getUTCDate() !== dia) {
    throw new Error(`Data inexistente: "${data}".`);
  }
  return data;
};

const paraMilissegundos = (data) => {
  const [ano, mes, dia] = validarData(data).split('-').map(Number);
  return Date.UTC(ano, mes - 1, dia);
};

export const diasEntre = (inicio, fim) =>
  Math.round((paraMilissegundos(fim) - paraMilissegundos(inicio)) / MILISSEGUNDOS_POR_DIA);

export const adicionarDias = (data, dias) =>
  new Date(paraMilissegundos(data) + dias * MILISSEGUNDOS_POR_DIA).toISOString().slice(0, 10);
