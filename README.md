# Fomi Backend

Backend SaaS para criação e gestão de lojas de lanches online.

---

## Índice
- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Arquitetura e Módulos](#arquitetura-e-módulos)
- [Integrações Externas](#integrações-externas)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Webhooks](#webhooks)
- [Configuração e Execução](#configuração-e-execução)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Autor](#autor)

---

## Visão Geral

O **Fomi Backend** é uma API robusta desenvolvida em Node.js com Express, focada em prover todos os recursos necessários para um sistema SaaS de lojas de lanches online, incluindo autenticação, gestão de lojas, produtos, pedidos, clientes, promoções, cupons, assinaturas e faturamento.

---

## Funcionalidades Principais
- Cadastro e autenticação de lojistas (usuários)
- Criação e personalização de lojas
- Gerenciamento de produtos, categorias e promoções
- Processamento de pedidos e controle de status
- Cadastro de clientes e histórico de compras
- Sistema de cupons de desconto
- Planos de assinatura com limites e features diferenciadas
- Integração com Stripe para billing e pagamentos recorrentes
- Upload e gestão de imagens via Cloudinary
- Webhooks para eventos de pagamento e assinatura
- Controle de acesso e permissões por plano

---

## Arquitetura e Módulos

O projeto está organizado em módulos, cada um responsável por uma área do domínio:

- **auth**: Autenticação, registro, login, JWT, controle de sessão
- **stores**: Gestão de lojas, personalização, planos, uploads
- **products**: Cadastro e edição de produtos, imagens, categorias
- **categories**: Gerenciamento de categorias de produtos
- **promotions**: Promoções e descontos temporários
- **coupons**: Cupons de desconto
- **orders**: Processamento de pedidos, status, histórico
- **customers**: Cadastro e histórico de clientes
- **billing**: Assinaturas, faturas, integração com Stripe
- **public**: Rotas públicas para exibição de lojas e pedidos

Além disso, há middlewares para autenticação, validação de planos, controle de acesso, tratamento de erros e logs de webhooks.

---

## Integrações Externas

- **Supabase**: Banco de dados relacional (PostgreSQL gerenciado)
- **Stripe**: Processamento de pagamentos, assinaturas e webhooks
- **Cloudinary**: Armazenamento e manipulação de imagens

As credenciais dessas integrações são configuradas via variáveis de ambiente.

---

## Autenticação e Segurança

- **JWT**: Toda autenticação é baseada em JSON Web Tokens, com expiração configurável.
- **bcryptjs**: Senhas são armazenadas com hash seguro.
- **Rate Limiting**: Proteção contra brute force em endpoints sensíveis.
- **Helmet**: Headers de segurança HTTP.
- **CORS**: Restrições de origem para domínios confiáveis.
- **Validação de dados**: Uso de Zod para schemas de entrada.
- **Controle de acesso**: Middlewares garantem que apenas usuários autorizados acessem recursos de suas lojas.

---

## Webhooks

- **Stripe Webhook**: Endpoint `/webhooks/stripe` para receber eventos de assinatura, fatura e checkout do Stripe.
- **Logs detalhados**: Middleware dedicado para logar todas as requisições de webhooks.
- **Processamento automático**: Atualização de status de assinaturas e faturas conforme eventos recebidos.

---

## Configuração e Execução

### Pré-requisitos
- Node.js >= 16
- pnpm (ou npm/yarn)
- Conta no Supabase, Stripe e Cloudinary

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_FOMI_DUPLO=...
STRIPE_PRICE_FOMI_SUPREMO=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Instalação

```bash
pnpm install
# ou
npm install
```

### Execução em Desenvolvimento

```bash
pnpm dev
# ou
npm run dev
```

### Execução em Produção

```bash
pnpm start
# ou
npm start
```

O servidor rodará por padrão na porta 3000. Health check disponível em `/health`.

---

## Estrutura do Banco de Dados

O banco de dados é gerenciado via Supabase/PostgreSQL. As migrations SQL estão em `sql/migrations/` e contemplam:
- Usuários (lojistas)
- Lojas
- Categorias
- Produtos
- Promoções
- Cupons
- Assinaturas
- Faturas
- Clientes
- Pedidos
- Itens do pedido

Cada tabela possui índices para performance e triggers para atualização automática de timestamps.

---

## Scripts Disponíveis

- `pnpm dev` / `npm run dev`: Inicia o servidor em modo desenvolvimento com hot reload (nodemon)
- `pnpm start` / `npm start`: Inicia o servidor em modo produção

---

## Autor

- **esc4n0rx**  
  [GitHub](https://github.com/esc4n0rx)

---

## Licença

Este projeto é privado e todos os direitos são reservados ao autor. 