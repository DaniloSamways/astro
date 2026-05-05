const express = require('express');

const astroRoutes = require('./routes/astro.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use('/api/v1', astroRoutes);
app.use(errorHandler);

module.exports = app;
