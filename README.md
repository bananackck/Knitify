# Knitify

뜨개할 때 사용하기 좋은 뮤직 플레이어 및 도안 관리 프로젝트입니다.

## Requirements

- Node.js 22.12.0 이상
- pnpm 10.33.4 이상

Corepack을 사용할 수 있다면 아래 명령으로 프로젝트에 명시된 pnpm 버전을 사용할 수 있습니다.

```sh
corepack enable
corepack install
```

## Setup

```sh
pnpm install
```

## Scripts

```sh
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm format:check
pnpm preview
```

- `pnpm dev`: 개발 서버 실행
- `pnpm build`: TypeScript 검사 후 프로덕션 빌드 생성
- `pnpm lint`: ESLint 검사
- `pnpm format`: Prettier 자동 포맷
- `pnpm format:check`: Prettier 포맷 검사
- `pnpm preview`: 빌드 결과 미리보기

## Git Hooks

Husky pre-commit hook이 staged 파일에 대해 `lint-staged`를 실행합니다. TypeScript/TSX 파일은 Prettier와 ESLint 자동 수정을 적용하고, CSS/HTML/JSON/Markdown 파일은 Prettier를 적용합니다.
