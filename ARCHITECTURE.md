# Kurio Marketplace — arquitetura

## Camadas

- **Rotas:** TanStack Router define as rotas públicas e mantém navegação direta, histórico e parâmetros do mercado.
- **Estado remoto:** TanStack Query centraliza cache, invalidação, polling de pedidos e atualização otimista de favoritos.
- **HTTP:** Axios usa /api e injeta o token Bearer.
- **Mocks:** MSW intercepta REST e Socket.IO. O estado do mock persiste em localStorage com a chave kurio:mock-state:v2.
- **Realtime:** eventos nft.updated e order.updated possuem versão; eventos duplicados ou antigos são ignorados no cliente.

## Contratos principais

- GET /api/nfts: catálogo paginado com busca, rede, categoria, coleção, preço e ordenação.
- GET /api/nfts/:id: detalhe do NFT; retorna 404 para item inexistente.
- GET/POST/DELETE /api/favorites: favoritos por usuário autenticado.
- GET/POST/PATCH/DELETE /api/cart: carrinho guest ou autenticado.
- POST /api/quote: cotação com subtotal, desconto, taxa, total, validade e versão.
- POST /api/orders: compra com carteira, quoteVersion e idempotencyKey.
- GET /api/orders/:id: acompanhamento do pedido.
- GET/POST/PATCH /api/wallets: carteiras vinculadas ao usuário.

## Compra

O pedido começa como pending. A interface só mostra o recibo quando recebe confirmed. Os cenários de mock são confirmed, declined e timeout; recusas e timeouts preservam o carrinho.

A mesma chave de idempotência devolve o mesmo pedido. A mesma chave com conteúdo diferente retorna conflito 409.

## Reset e cenários

- Reset: POST /api/mock/reset.
- Atualização de NFT: POST /api/mock/update-nft.
- Cenário de pagamento: enviar paymentScenario no corpo de POST /api/orders.
- O estado local pode ser limpo removendo kurio:mock-state:v2 e auth_token.

## Validação

- npm run dev
- npm run typecheck
- npm run build
- npm run lint
- npm run test:e2e
- npm run test:visual
- npm run lighthouse

## Performance e bundle

### Estratégia de code splitting

Cada página é carregada com `React.lazy` + `Suspense`. O `vite.config.ts` define `manualChunks` para separar:

| Chunk | Conteúdo | Gzip |
|-------|----------|------|
| `vendor-react` | react + react-dom | ~66 KB |
| `vendor-tanstack` | @tanstack/router + query | ~36 KB |
| `vendor-socketio` | socket.io-client | ~13 KB |
| `vendor-msw` | msw + @mswjs | separado |
| `vendor-icons` | lucide-react | ~9 KB |
| `index` | app shell + contextos | ~36 KB |
| `HomePage`, `MarketPage`, etc. | cada página lazy | 4–23 KB |

O bundle inicial (crítico) caiu de **604 KB → 121 KB** (-80%), eliminando o gargalo de TBT na home.

### Resultados Lighthouse — build final (medianas de 3 runs)

| Página | Perfil | Perf | A11y | Best Practices | SEO |
|--------|--------|------|------|----------------|-----|
| home | desktop | **98** ✅ | **96** ✅ | **96** ✅ | **100** ✅ |
| home | mobile | **90** ✅ | **96** ✅ | **96** ✅ | **100** ✅ |
| detail | desktop | **99** ✅ | **96** ✅ | **96** ✅ | **100** ✅ |
| detail | mobile | **90** ✅ | **96** ✅ | **96** ✅ | **100** ✅ |

Metas: Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO ≥ 90. Todas atingidas.

Relatórios individuais JSON em `lighthouse-reports/`. Sumário em `lighthouse-report.json`.

