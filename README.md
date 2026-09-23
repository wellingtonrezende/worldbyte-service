# WorldByte Service — Fase 1

Base inicial do sistema SaaS multiempresa para orçamentos e serviços.

## O que já existe neste scaffold

- Frontend React + TypeScript + Vite
- Backend Fastify + TypeScript
- PostgreSQL
- Prisma
- Organization / multiempresa
- Usuário + vínculo com empresa
- Trial inicial de 7 dias no cadastro
- Login
- JWT access token
- Refresh token com rotação e hash no banco
- Rate limiting
- Helmet
- CORS
- Auditoria inicial
- Estrutura de Plan / PlanFeature / Subscription
- Tela de login, cadastro e dashboard inicial

## 1. Requisitos

- Node.js 20+ recomendado
- npm
- Docker Desktop

## 2. Banco

Na raiz:

```powershell
docker compose up -d
```

## 3. Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

API: http://localhost:3333

Teste:
http://localhost:3333/health

## 4. Frontend

Em outro terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173

## 5. Build

Na raiz:

```powershell
npm install
npm run build
```

## Observação

Os segredos presentes no `.env.example` são apenas placeholders. Troque os valores antes de produção.
