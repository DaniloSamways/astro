const express = require('express');

const { runAstroCommand } = require('../services/pythonAstroService');

const router = express.Router();

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

function buildCommonOptions(query) {
  return {
    city: query.city,
    autoLocation: toBoolean(query.autoLocation),
    datetime: query.datetime,
  };
}

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'astro-node-api',
    status: 'up',
  });
});

router.get('/object', async (req, res, next) => {
  try {
    const objectName = req.query.name;
    if (!objectName) {
      const error = new Error('O parâmetro name é obrigatório.');
      error.statusCode = 400;
      throw error;
    }

    const data = await runAstroCommand('object', {
      ...buildCommonOptions(req.query),
      objectName,
    });

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/visible-objects', async (req, res, next) => {
  try {
    const data = await runAstroCommand('visible-objects', buildCommonOptions(req.query));

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/satellites', async (req, res, next) => {
  try {
    const data = await runAstroCommand('satellites', buildCommonOptions(req.query));

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
