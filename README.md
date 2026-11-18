# Sistema de Gerenciamento de Biblioteca

Projeto final da disciplina **Linguagens de Programação** — integração entre **Programação Orientada a Objetos (POO)** e **Programação Funcional (PF)**.

- **Linguagem:** JavaScript (Node.js 18 ou superior, módulos ES)
- **Dependências externas:** nenhuma (testes com o runner nativo `node:test`)
- **Persistência:** em memória, sem banco de dados

## Integrante

- Clóvis Alves de Oliveira Neto

## Funcionalidades

- Cadastro e consulta de livros (identificador, título, autor, categoria) e de usuários (identificador, nome, matrícula)
- Registro de empréstimos com prazo (padrão de 7 dias) e controle de disponibilidade
- Registro de devoluções, liberando o livro para novos empréstimos
- Consulta de empréstimos, inclusive por usuário
- Filtragem de livros por categoria
- Identificação de empréstimos atrasados em uma data de referência
- Relatório de multas (R$ 2,00 por dia de atraso) com filter, map e reduce
- Estatísticas: livros por categoria, empréstimos por usuário, empréstimos ativos, empréstimos atrasados e valor total das multas
- Comparação entre a versão imperativa e a funcional do cálculo do total de multas
- Demonstração automática (`npm start`) e menu interativo (`npm run menu`)

## Como executar

```bash
git clone https://github.com/netoclovis-bit/biblioteca-funcional.git
cd biblioteca-funcional

npm start      # demonstração completa com dados de exemplo
npm run menu   # menu interativo para testar qualquer operação
npm test       # executa os 34 testes automatizados
```

Não é preciso `npm install`: o projeto não tem dependências.

## Estrutura

```
biblioteca-funcional/
├── index.js                     demonstração roteirizada
├── menu.js                      menu interativo no terminal
├── src/
│   ├── modelos/
│   │   ├── Livro.js             entidade imutável
│   │   ├── Usuario.js           entidade imutável
│   │   └── Emprestimo.js        entidade imutável que liga Livro e Usuario
│   ├── Biblioteca.js            gerencia o estado (operações com efeito colateral)
│   ├── dadosIniciais.js         carga de dados de exemplo
│   └── funcoes/
│       ├── datas.js             cálculo de datas (puro)
│       ├── regras.js            regras de negócio puras
│       ├── relatorios.js        relatório de multas (filter → map → reduce)
│       ├── estatisticas.js      estatísticas com reduce
│       └── comparacao.js        mesma funcionalidade nas versões imperativa e funcional
└── test/
    ├── funcoes.test.js          testes das funções puras
    └── biblioteca.test.js       testes das entidades e da Biblioteca
```

## Modelagem orientada a objetos

| Classe | Atributos | Responsabilidade |
|--------|-----------|------------------|
| `Livro` | `id`, `titulo`, `autor`, `categoria` | Representar um exemplar do acervo |
| `Usuario` | `id`, `nome`, `matricula` | Representar uma pessoa cadastrada |
| `Emprestimo` | `id`, `livro`, `usuario`, `dataEmprestimo`, `dataPrevistaDevolucao`, `dataDevolucao` | Representar a retirada de um livro e saber se está ativo ou atrasado |
| `Biblioteca` | coleções de livros, usuários e empréstimos | Cadastrar, consultar, emprestar, devolver e fornecer dados para relatórios |

**Relacionamentos**

- `Biblioteca` 1 ◆── 0..* `Livro`, `Usuario` e `Emprestimo` (composição: a biblioteca cria e guarda os objetos)
- `Emprestimo` * ──> 1 `Livro` e * ──> 1 `Usuario` (cada empréstimo tem exatamente um livro e um usuário)
- Um `Usuario` pode ter vários empréstimos; um `Livro` pode ter vários empréstimos ao longo do tempo, mas no máximo **um ativo**.

**Encapsulamento**

- Todos os atributos usam campos privados do JavaScript (`#campo`) e são expostos apenas por *getters*.
- `Livro`, `Usuario` e `Emprestimo` são congelados com `Object.freeze` no construtor: depois de criados, não mudam.
- A `Biblioteca` guarda suas coleções em `Map` privados e devolve apenas cópias congeladas (`listarLivros`, `listarEmprestimos`...).
- A disponibilidade de um livro não é um atributo que pode ficar inconsistente: ela é **derivada** da existência de um empréstimo ativo para aquele livro.

## Regras de negócio

1. Um usuário pode ter vários empréstimos; cada empréstimo tem um único livro e um único usuário.
2. Um livro não pode estar emprestado para mais de um usuário ao mesmo tempo (`registrarEmprestimo` lança erro).
3. Cada livro é um exemplar único.
4. Ao devolver, a data de devolução é registrada e o livro volta a ficar disponível.
5. Um empréstimo está atrasado quando está ativo e a data de referência é posterior à data prevista.
6. Multa de **R$ 2,00 por dia de atraso**; sem atraso, multa zero.
7. O relatório de multas considera apenas empréstimos ativos e atrasados, com data de referência informada.
8. Não há reservas, múltiplos exemplares nem multa para empréstimos já devolvidos.

Validações extras: identificadores e matrículas únicos, datas no formato `AAAA-MM-DD`, datas inexistentes rejeitadas, devolução anterior ao empréstimo rejeitada, devolução em duplicidade rejeitada. O prazo padrão do empréstimo é de 7 dias.

## Programação funcional

### Funções puras

| Função | Arquivo | Entrada → saída |
|--------|---------|-----------------|
| `calcularMulta(diasAtraso, valorDiario)` | `regras.js` | número, número → número |
| `calcularDiasAtraso(dataPrevista, dataReferencia)` | `regras.js` | data, data → número ≥ 0 |
| `filtrarLivrosPorCategoria(livros, categoria)` | `regras.js` | lista, texto → nova lista (**filter**) |
| `selecionarEmprestimosAtrasados(emprestimos, data)` | `regras.js` | lista, data → nova lista (**filter**) |
| `gerarRelatorioMultas(emprestimos, data)` | `relatorios.js` | lista, data → relatório congelado (**filter + map + reduce**) |
| `contarLivrosPorCategoria(livros)` | `estatisticas.js` | lista → objeto (**reduce**) |
| `contarEmprestimosPorUsuario(emprestimos)` | `estatisticas.js` | lista → objeto (**reduce**) |
| `contarEmprestimosAtivos(emprestimos)` | `estatisticas.js` | lista → número (**reduce**) |
| `gerarEstatisticas(livros, emprestimos, data)` | `estatisticas.js` | listas, data → objeto congelado |
| `diasEntre`, `adicionarDias` | `datas.js` | datas → número / nova data |

Nenhuma delas lê a data atual do sistema, acessa variáveis globais mutáveis, imprime na tela ou altera os parâmetros. A data de referência sempre chega por parâmetro, o que garante **transparência referencial**: a mesma entrada produz sempre a mesma saída.

### Relatório de multas

```
listarEmprestimos()            impura  (lê o estado da Biblioteca)
        │  lista congelada de Emprestimo
        ▼
filter: estaAtrasado(data)     pura    → só ativos e atrasados
        │
        ▼
map: { titulo, usuario,        pura    → um item por empréstimo,
       diasAtraso, multa }               multa = calcularMulta(dias, 2)
        │
        ▼
reduce: soma + item.multa      pura    → total
        │
        ▼
formatarRelatorioMultas        pura    → texto
        │
        ▼
console.log                    impura  (saída na tela)
```

### Imutabilidade

- Entidades congeladas; mudar `livro.titulo` lança `TypeError`.
- Devolver um livro **não altera** o empréstimo original: `Emprestimo.comDevolucao(data)` cria um **novo** objeto, e a `Biblioteca` substitui a referência na sua coleção.
- `filter`, `map` e `reduce` sempre geram novas estruturas; o `reduce` das estatísticas cria um novo objeto a cada passo (`{ ...contagem, [chave]: valor }`).
- Relatórios e estatísticas são devolvidos congelados.

### Separação entre puro e impuro

- **Impuro (gerenciamento):** `Biblioteca.cadastrarLivro`, `cadastrarUsuario`, `registrarEmprestimo`, `registrarDevolucao` — alteram o estado da biblioteca; `index.js` e `menu.js` — entrada e saída no terminal.
- **Puro (regras e cálculos):** tudo em `src/funcoes/`.
- A `Biblioteca` apenas obtém seus dados e **delega** os cálculos para as funções puras (`gerarRelatorioMultas`, `gerarEstatisticas`, `filtrarLivrosPorCategoria`).

## Comparação entre paradigmas

Funcionalidade escolhida: **valor total das multas** (`src/funcoes/comparacao.js`).

| | Imperativa (`totalMultasImperativo`) | Funcional (`totalMultasFuncional`) |
|---|---|---|
| Estrutura | `for` + `if` + acumulador `let total` | `filter` → `map` → `reduce` |
| Estado mutável | variável `total` e índice `i` mudam a cada volta | nenhuma variável é reatribuída |
| Leitura | descreve **como** percorrer | descreve **o que** se quer |
| Reuso | regra da multa repetida dentro do laço | reaproveita `calcularMulta` |

Os testes comprovam que as duas versões produzem o mesmo resultado para várias datas e para lista vazia.

## Testes

`npm test` executa 34 testes que cobrem: funções puras (inclusive mesma entrada → mesma saída), não alteração das coleções originais, imutabilidade das entidades e dos relatórios, regras de empréstimo e devolução, cálculo de atraso entre meses, relatório de multas, estatísticas e equivalência entre as versões imperativa e funcional.

## Dados de exemplo

`npm start` usa a data de referência **2026-11-18** e uma biblioteca com 6 livros, 3 usuários e 4 empréstimos (um já devolvido). Resultado esperado do relatório: empréstimo 1 com 10 dias de atraso (R$ 20,00) e empréstimo 2 com 6 dias (R$ 12,00), total **R$ 32,00**.
