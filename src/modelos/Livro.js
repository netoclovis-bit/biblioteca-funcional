export class Livro {
  #id;
  #titulo;
  #autor;
  #categoria;

  constructor(id, titulo, autor, categoria) {
    if (!id || !titulo || !autor || !categoria) {
      throw new Error('Livro precisa de identificador, título, autor e categoria.');
    }
    this.#id = id;
    this.#titulo = titulo;
    this.#autor = autor;
    this.#categoria = categoria;
    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get titulo() {
    return this.#titulo;
  }

  get autor() {
    return this.#autor;
  }

  get categoria() {
    return this.#categoria;
  }

  toString() {
    return `[${this.#id}] ${this.#titulo} — ${this.#autor} (${this.#categoria})`;
  }
}
