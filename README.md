![Next.js Badge](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=for-the-badge)
![React Badge](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=for-the-badge)
![Cypress Badge](https://img.shields.io/badge/Cypress-69D3A7?logo=cypress&logoColor=fff&style=for-the-badge)
![TypeScript Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=for-the-badge)
![Docker Badge](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=for-the-badge)
![Drizzle Badge](https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=000&style=for-the-badge)
![Prettier Badge](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=fff&style=for-the-badge)
![pnpm Badge](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff&style=for-the-badge)
![Tailwind CSS Badge](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=fff&style=for-the-badge)

# TAK Air Ops Simulator

A training platform designed to simulate air operations and provide realistic air-threat practice scenarios for [ATAK plugin.](https://github.com/c5bravo/atak-airguardian-plugin)

## Running

1. Clone this repository
2. Create `.env` file
3. In the `.env` file set the variable `DB_FILE_NAME=file:local.db`

### Without docker

```bash
  pnmp i
  pnpm drizzle-kit push
  pnpm dev

```

### With docker

```bash
docker build . -t "practice-tool"
docker run practice-tool
```

## Notes

The `app/api/route.ts` is meant for the applications internal communication. The `app/api/craft/route.ts` is the endpoint for fetching flight data to be used in the plugin.
