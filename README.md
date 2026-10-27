# Kurio Marketplace

Marketplace NFT simulado em React + TypeScript, com catálogo, detalhe, favoritos, carrinho, checkout, autenticação, perfil e carteiras.

## Executar

    npm install --legacy-peer-deps
    npm run dev

O MSW é ativado automaticamente em desenvolvimento. Não há blockchain real nem pagamento real.

## Scripts

    npm run dev
    npm run typecheck
    npm run build
    npm run lint
    npm run test:e2e
    npm run test:visual
    npm run lighthouse

Os testes Playwright iniciam o preview automaticamente. Para instalar os navegadores:

    npx playwright install chromium

## Credenciais mock

- davi@kurio.com / Senha@123
- ana@kurio.com / Senha@456

As credenciais existem apenas para os cenários locais do mock. Senhas não são salvas no localStorage do navegador.

## Rotas

- /: home
- /market: mercado; busca, filtros, aba, ordenação e página ficam na URL
- /nft/:id: detalhe direto
- /profile: perfil e carteiras
- /creators: criadores
- /learn: conteúdo editorial

## Mock e recuperação

O estado do servidor mock é persistido em kurio:mock-state:v2. Para começar de um cenário limpo:

    fetch('/api/mock/reset', { method: 'POST' })

O checkout simula confirmação, recusa e timeout. Pedidos pendentes são consultados novamente e eventos Socket.IO atualizam o cache.

## Auditoria

O Lighthouse gera lighthouse-report.json ou pode receber LH_URL. O Playwright gera o relatório em playwright-report/ e traces somente quando necessário.

