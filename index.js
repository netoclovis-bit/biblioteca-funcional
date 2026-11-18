import { criarBibliotecaDeExemplo } from './src/dadosIniciais.js';
import { filtrarLivrosPorCategoria, calcularMulta, MULTA_DIARIA } from './src/funcoes/regras.js';
import { formatarRelatorioMultas, formatarMoeda } from './src/funcoes/relatorios.js';
import { totalMultasImperativo, totalMultasFuncional } from './src/funcoes/comparacao.js';

const DATA_REFERENCIA = '2026-11-18';

const titulo = (texto) => console.log(`\n=== ${texto} ===`);

const biblioteca = criarBibliotecaDeExemplo();

titulo('Acervo');
biblioteca.listarLivros().forEach((livro) => console.log(`  ${livro}`));

titulo('Usuários');
biblioteca.listarUsuarios().forEach((usuario) => console.log(`  ${usuario}`));

titulo('Empréstimos');
biblioteca.listarEmprestimos().forEach((emprestimo) => console.log(`  ${emprestimo}`));

titulo('Disponibilidade');
biblioteca
  .listarLivros()
  .forEach((livro) =>
    console.log(`  ${livro.titulo}: ${biblioteca.livroEstaDisponivel(livro.id) ? 'disponível' : 'emprestado'}`)
  );

titulo('Regra: livro já emprestado não pode ser emprestado de novo');
try {
  biblioteca.registrarEmprestimo('L1', 'U2', '2026-11-12');
} catch (erro) {
  console.log(`  Bloqueado: ${erro.message}`);
}

titulo('Filtragem por categoria (função pura com filter)');
const acervo = biblioteca.listarLivros();
const literatura = filtrarLivrosPorCategoria(acervo, 'Literatura');
literatura.forEach((livro) => console.log(`  ${livro}`));
console.log(`  Coleção original continua com ${acervo.length} livros.`);

titulo('Função pura de multa');
console.log(`  calcularMulta(5, ${MULTA_DIARIA}) = ${formatarMoeda(calcularMulta(5, MULTA_DIARIA))}`);
console.log(`  calcularMulta(0, ${MULTA_DIARIA}) = ${formatarMoeda(calcularMulta(0, MULTA_DIARIA))}`);

titulo('Relatório de multas (filter → map → reduce)');
console.log(formatarRelatorioMultas(biblioteca.gerarRelatorioMultas(DATA_REFERENCIA)));

titulo('Estatísticas');
console.log(biblioteca.gerarEstatisticas(DATA_REFERENCIA));

titulo('Comparação entre paradigmas');
const emprestimos = biblioteca.listarEmprestimos();
console.log(`  Imperativo: ${formatarMoeda(totalMultasImperativo(emprestimos, DATA_REFERENCIA))}`);
console.log(`  Funcional:  ${formatarMoeda(totalMultasFuncional(emprestimos, DATA_REFERENCIA))}`);

titulo('Devolução do empréstimo 1');
const devolvido = biblioteca.registrarDevolucao(1, DATA_REFERENCIA);
console.log(`  ${devolvido}`);
console.log(`  "${devolvido.livro.titulo}" agora está ${biblioteca.livroEstaDisponivel('L1') ? 'disponível' : 'emprestado'}.`);
console.log(formatarRelatorioMultas(biblioteca.gerarRelatorioMultas(DATA_REFERENCIA)));
