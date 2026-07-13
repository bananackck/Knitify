# Knitify

뜨개할 때 사용하기 좋은 뮤직 플레이어 및 도안 관리 모노레포입니다.

## 프로젝트 구조

```text
frontend/  Vite + React
backend/   Spring Boot
compose.yaml
```

## 요구사항

- Node.js 22.12.0 이상 / pnpm 10.33.4 이상
- Java 21 / Maven 3.6.3 이상
- Docker와 Docker Compose (MySQL 및 통합 실행 시)

## 프론트엔드

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm format:check
```

## 백엔드와 MySQL

```sh
cp .env.example .env
docker compose up --build
```

프론트는 `http://127.0.0.1:5173`, 백엔드는 `http://127.0.0.1:8080`을 사용합니다.

## Git Hooks

Husky pre-commit hook이 staged 프론트 파일에 대해 Prettier와 ESLint를 실행합니다.
