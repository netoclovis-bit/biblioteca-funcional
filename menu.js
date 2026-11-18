import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { criarBibliotecaDeExemplo } from './src/dadosIniciais.js';
import { formatarRelatorioMultas } from './src/funcoes/relatorios.js';
import { totalMultasImperativo, totalMultasFuncional } from './src/funcoes/comparacao.js';

const biblioteca = criarBibliotecaDeExemplo();
const terminal = createInterface({ input, output });
const perguntar = (texto) => terminal.question(texto).then((resposta) => resposta.trim());
const hoje = () => new Date().toISOString().slice(0, 10);
const perguntarData = async (texto) => (await perguntar(`${texto} (AAAA-MM-DD, Enter = hoje): `)) || hoje();
const imprimirLista = (itens) => (itens.length ? itens.forEach((item) => console.log(`  ${item}`)) : console.log('  (vazio)'));

const acoes = {
  1: ['Listar livros', async () => imprimirLista(biblioteca.listarLivros())],
  2: ['Listar usuários', async () => imprimirLista(biblioteca.listarUsuarios())],
  3: ['Listar empréstimos', async () => imprimirLista(biblioteca.listarEmprestimos())],
  4: [
    'Cadastrar livro',
    async () => {
      const livro = biblioteca.cadastrarLivro(
        await perguntar('Identificador: '),
        await perguntar('Título: '),
        await perguntar('Autor: '),
        await perguntar('Categoria: ')
      );
      console.log(`  Cadastrado: ${livro}`);
    },
  ],
  5: [
    'Cadastrar usuário',
    async () => {
      const usuario = biblioteca.cadastrarUsuario(
        await perguntar('Identificador: '),
        await perguntar('Nome: '),
        await perguntar('Matrícula: ')
      );
      console.log(`  Cadastrado: ${usuario}`);
    },
  ],
  6: [
    'Registrar empréstimo',
    async () => {
      const idLivro = await perguntar('Identificador do livro: ');
      const idUsuario = await perguntar('Identificador do usuário: ');
      const data = await perguntarData('Data do empréstimo');
      const prazo = Number((await perguntar('Prazo em dias (Enter = 7): ')) || 7);
      console.log(`  Registrado: ${biblioteca.registrarEmprestimo(idLivro, idUsuario, data, prazo)}`);
    },
  ],
  7: [
    'Registrar devolução',
    async () => {
      const idEmprestimo = Number(await perguntar('Número do empréstimo: '));
      const data = await perguntarData('Data da devolução');
      console.log(`  Devolvido: ${biblioteca.registrarDevolucao(idEmprestimo, data)}`);
    },
  ],
  8: [
    'Filtrar livros por categoria',
    async () => imprimirLista(biblioteca.listarLivrosPorCategoria(await perguntar('Categoria: '))),
  ],
  9: [
    'Relatório de multas',
    async () => console.log(formatarRelatorioMultas(biblioteca.gerarRelatorioMultas(await perguntarData('Data de referência')))),
  ],
  10: ['Estatísticas', async () => console.log(biblioteca.gerarEstatisticas(await perguntarData('Data de referência')))],
  11: [
    'Comparar imperativo x funcional',
    async () => {
      const data = await perguntarData('Data de referência');
      const emprestimos = biblioteca.listarEmprestimos();
      console.log(`  Imperativo: ${totalMultasImperativo(emprestimos, data)}`);
      console.log(`  Funcional:  ${totalMultasFuncional(emprestimos, data)}`);
    },
  ],
};

const exibirMenu = () => {
  console.log('\n===== Sistema de Biblioteca =====');
  Object.entries(acoes).forEach(([numero, [descricao]]) => console.log(`${numero.padStart(2)}. ${descricao}`));
  console.log(' 0. Sair');
};

const executar = async () => {
  let opcao = '';
  while (opcao !== '0') {
    exibirMenu();
    opcao = await perguntar('Escolha: ');
    const acao = acoes[opcao];
    if (acao) {
      try {
        await acao[1]();
      } catch (erro) {
        console.log(`  Erro: ${erro.message}`);
      }
    } else if (opcao !== '0') {
      console.log('  Opção inválida.');
    }
  }
  terminal.close();
};

executar();
