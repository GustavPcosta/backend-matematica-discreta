# RPG Idle — Backend (NestJS)

Backend do projeto **RPG Idle** (Jala University – Matemática Discreta), seguindo o TDD:
modelo de dados único, game loop, lógica matemática pura e Central Matemática.

## Como rodar

```bash
npm install
npm run start:dev      # desenvolvimento (http://localhost:3000/api)
npm run build && npm run start:prod
npm test               # 26 testes (lógica matemática + motor do jogo)
```

Variáveis opcionais (veja `.env.example`): `PORT`, `CORS_ORIGIN` (padrão: qualquer origem) e
`PERSIST_FILE` (se definida, salva os jogos em JSON — responde à questão de persistência do TDD).

## Como o front integra (game loop)

O tempo é controlado **pelo servidor**. O front só precisa:

1. `POST /api/games` com a classe e guardar o `id` (ex.: no `localStorage`).
2. `setInterval` de 1s chamando `POST /api/games/:id/tick` e renderizando o `estado` retornado.
3. Botões chamam `iniciar` / `parar` / `equipar` e renderizam o `EstadoJogo` retornado.

Como o servidor calcula os segundos decorridos desde o último tick, chamadas duplicadas **não**
geram produção extra (evita o bug dos "vários relógios" do TDD) e, ao reabrir a página, o
progresso offline (até 8h) é aplicado no primeiro tick.

```ts
const API = 'http://localhost:3000/api';
const { id } = await (await fetch(`${API}/games`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ classe: 'guerreiro', nome: 'Gustavo' }),
})).json();

setInterval(async () => {
  const { estado } = await (await fetch(`${API}/games/${id}/tick`, { method: 'POST' })).json();
  dispatch({ type: 'SET_ESTADO', estado }); // useReducer / Context
}, 1000);
```

Os tipos TypeScript estão em `src/domain/tipos.ts` — copie para o front.

## Endpoints (prefixo `/api`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/games` | Cria jogo `{ classe: "guerreiro"\|"mago"\|"arqueiro", nome? }` → `EstadoJogo` |
| GET | `/games/:id` | Estado atual |
| DELETE | `/games/:id` | Remove o jogo (204) |
| POST | `/games/:id/tick` | Processa o tempo decorrido → `{ estado, segundosProcessados, novosEventos }` |
| POST | `/games/:id/atividades/:atividadeId/iniciar` | Inicia (`cacar`, `treinar`, `explorar`); só uma ativa por vez |
| POST | `/games/:id/atividades/parar` | Para a atividade atual |
| POST | `/games/:id/equipamentos` | `{ equipamentoId }` — equipa (1 arma + 1 armadura, checa compatibilidade) |
| GET | `/games/:id/eventos` | Event Log (últimos 5, mais recente primeiro) |
| GET | `/games/:id/central-matematica` | 6 seções: fórmula + entrada + resultado ao vivo |
| GET | `/catalogo/classes` | Classes, atributos (conjuntos), base e crescimento |
| GET | `/catalogo/equipamentos?classe=` | Equipamentos (filtrados pela relação de compatibilidade) |
| GET | `/catalogo/atividades` | Atividades iniciais |
| GET | `/math/combinatoria` | Classes × armas × armaduras (bruto e compatível) |
| GET | `/math/xp/:nivel` | XP do nível (recursivo e forma fechada) |
| GET | `/math/probabilidade?ticks=10` | Pesos e P(≥1 evento raro/lendário em n sorteios) |

Erros: `400` (validação / equipamento incompatível), `404` (jogo, atividade ou equipamento inexistente),
`409` (atividade bloqueada ou nenhuma em andamento).

## Estrutura

```
src/
  domain/  tipos.ts (modelo de dados), constantes.ts, catalogo.ts (classes, equipamentos, relação R)
  math/    lógica matemática PURA (única área que "faz conta"): produção, XP, conjuntos,
           relações, combinatória, probabilidade, atributos, central
  game/    motor (game.engine.ts), serviço, repositório, controllers, DTOs
```

Regras do TDD respeitadas: cálculo só em `math/`; toda aleatoriedade passa por `sortearRaridade(roll)`
(o `roll` vem de `RandomService`, substituível nos testes); só os 5 eventos mais recentes são mantidos.

## Onde cada conceito mora

| Conceito | Função | Usada em |
|---|---|---|
| Funções | `calcularProducao(taxa, t)` | cada tick |
| Indução | `xpNecessario(n) = 100 + 25·n·(n−1)` (equivale a XP(n+1) = XP(n) + 50n; um teste compara as duas formas até n = 200) | subida de nível |
| Conjuntos | `atributosDaClasse`, `uniao`, `intersecao` | painel do personagem |
| Relações | `equipamentosCompativeis`, `ehCompativel` | tela de equipamentos |
| Combinatória | `resumoCombinatoria()` (3 × 6 × 4 = 72) | criação de personagem |
| Probabilidade | `sortearRaridade(roll)` 70/25/5 | atividade Explorar |

## Decisões que o TDD deixava em aberto (fáceis de ajustar)

- **Números do jogo** (3 ouro/s, 5 XP/s, 1 item/s; XP inicial 100; limite de 20 itens; stats por classe):
  `src/domain/constantes.ts` e `src/domain/catalogo.ts`.
- **Pesos 70/25/5**: aplicados a comum / raro / lendário. Comum = nada acontece; raro e lendário registram
  evento no log e dão itens extras (+1 / +3). Épico existe como raridade de equipamento, mas não é sorteado.
- **Explorar** só é desbloqueada no nível 2 (campo extra `nivelDesbloqueio` em `Atividade`).
- **Equipamentos**: qualquer item compatível com a classe pode ser equipado (sem compra/inventário, conforme o MVP).
- **As 3 classes** estão jogáveis; se o grupo preferir só uma, o front pode oferecer apenas uma opção.
- **Persistência**: em memória por padrão; `PERSIST_FILE` grava em JSON. Trocar por banco só exige reescrever `game.repository.ts`.
