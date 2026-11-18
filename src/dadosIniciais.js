import { Biblioteca } from './Biblioteca.js';

export const criarBibliotecaDeExemplo = () => {
  const biblioteca = new Biblioteca();

  biblioteca.cadastrarLivro('L1', 'Código Limpo', 'Robert C. Martin', 'Programação');
  biblioteca.cadastrarLivro('L2', 'Estruturas de Dados e Algoritmos', 'Thomas Cormen', 'Programação');
  biblioteca.cadastrarLivro('L3', 'Dom Casmurro', 'Machado de Assis', 'Literatura');
  biblioteca.cadastrarLivro('L4', 'Vidas Secas', 'Graciliano Ramos', 'Literatura');
  biblioteca.cadastrarLivro('L5', 'Cálculo Volume 1', 'James Stewart', 'Matemática');
  biblioteca.cadastrarLivro('L6', 'Sapiens', 'Yuval Noah Harari', 'História');

  biblioteca.cadastrarUsuario('U1', 'Ana Souza', '2023001');
  biblioteca.cadastrarUsuario('U2', 'Bruno Lima', '2023002');
  biblioteca.cadastrarUsuario('U3', 'Carla Mendes', '2023003');

  biblioteca.registrarEmprestimo('L1', 'U1', '2026-11-01', 7);
  biblioteca.registrarEmprestimo('L3', 'U2', '2026-11-05', 7);
  biblioteca.registrarEmprestimo('L5', 'U1', '2026-11-10', 14);
  biblioteca.registrarEmprestimo('L4', 'U3', '2026-11-02', 7);
  biblioteca.registrarDevolucao(4, '2026-11-08');

  return biblioteca;
};
