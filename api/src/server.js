const app = require('./app');

const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`Astro API executando em http://localhost:${port}`);
});
