# Astro Web

Frontend em Next.js para o projeto Astro, com uma interface cósmica em estilo observatório e integração com a API Express existente.

## Como executar

```bash
cd web
npm install
npm run dev
```

Se a API Express estiver em outro endereço, configure `ASTRO_API_URL`.

Exemplo:

```bash
ASTRO_API_URL=http://localhost:3001/api/v1 npm run dev
```

## O que a interface faz

- Consulta objetos celestes.
- Lista objetos visíveis no momento.
- Exibe passagens de satélites.
- Mostra o status da API e resultados em tempo real.
