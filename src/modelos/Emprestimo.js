import { validarData, diasEntre } from '../funcoes/datas.js';
import { calcularDiasAtraso } from '../funcoes/regras.js';

export class Emprestimo {
  #id;
  #livro;
  #usuario;
  #dataEmprestimo;
  #dataPrevistaDevolucao;
  #dataDevolucao;

  constructor(id, livro, usuario, dataEmprestimo, dataPrevistaDevolucao, dataDevolucao = null) {
    if (!id || !livro || !usuario) {
      throw new Error('Empréstimo precisa de identificador, livro e usuário.');
    }
    validarData(dataEmprestimo);
    validarData(dataPrevistaDevolucao);
    if (diasEntre(dataEmprestimo, dataPrevistaDevolucao) < 0) {
      throw new Error('A data prevista de devolução não pode ser anterior à data do empréstimo.');
    }
    if (dataDevolucao !== null && diasEntre(dataEmprestimo, validarData(dataDevolucao)) < 0) {
      throw new Error('A data de devolução não pode ser anterior à data do empréstimo.');
    }
    this.#id = id;
    this.#livro = livro;
    this.#usuario = usuario;
    this.#dataEmprestimo = dataEmprestimo;
    this.#dataPrevistaDevolucao = dataPrevistaDevolucao;
    this.#dataDevolucao = dataDevolucao;
    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get livro() {
    return this.#livro;
  }

  get usuario() {
    return this.#usuario;
  }

  get dataEmprestimo() {
    return this.#dataEmprestimo;
  }

  get dataPrevistaDevolucao() {
    return this.#dataPrevistaDevolucao;
  }

  get dataDevolucao() {
    return this.#dataDevolucao;
  }

  estaAtivo() {
    return this.#dataDevolucao === null;
  }

  estaAtrasado(dataReferencia) {
    return this.estaAtivo() && calcularDiasAtraso(this.#dataPrevistaDevolucao, dataReferencia) > 0;
  }

  diasDeAtraso(dataReferencia) {
    return this.estaAtivo() ? calcularDiasAtraso(this.#dataPrevistaDevolucao, dataReferencia) : 0;
  }

  comDevolucao(dataDevolucao) {
    if (!this.estaAtivo()) {
      throw new Error(`O empréstimo ${this.#id} já foi devolvido em ${this.#dataDevolucao}.`);
    }
    return new Emprestimo(
      this.#id,
      this.#livro,
      this.#usuario,
      this.#dataEmprestimo,
      this.#dataPrevistaDevolucao,
      dataDevolucao
    );
  }

  toString() {
    const situacao = this.estaAtivo() ? 'ativo' : `devolvido em ${this.#dataDevolucao}`;
    return `[${this.#id}] "${this.#livro.titulo}" com ${this.#usuario.nome} | ${this.#dataEmprestimo} → previsto ${this.#dataPrevistaDevolucao} | ${situacao}`;
  }
}
