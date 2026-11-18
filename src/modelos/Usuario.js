export class Usuario {
  #id;
  #nome;
  #matricula;

  constructor(id, nome, matricula) {
    if (!id || !nome || !matricula) {
      throw new Error('Usuário precisa de identificador, nome e matrícula.');
    }
    this.#id = id;
    this.#nome = nome;
    this.#matricula = matricula;
    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get nome() {
    return this.#nome;
  }

  get matricula() {
    return this.#matricula;
  }

  toString() {
    return `[${this.#id}] ${this.#nome} — matrícula ${this.#matricula}`;
  }
}
