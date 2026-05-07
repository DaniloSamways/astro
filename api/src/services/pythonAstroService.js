const { execFile } = require('child_process');

const pythonRunner = require('../utils/pythonRunner');

function runAstroCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const args = [pythonRunner.bridgePath, '--json', command];

    if (options.city) {
      args.push('--city', options.city);
    }

    if (options.autoLocation) {
      args.push('--auto-location');
    }

    if (options.datetime) {
      args.push('--datetime', options.datetime);
    }

    if (command === 'object') {
      if (!options.objectName) {
        reject(new Error('O parâmetro objectName é obrigatório para a rota de objeto.'));
        return;
      }

      args.push('--object', options.objectName);
    }

    execFile(
      pythonRunner.pythonCommand,
      args,
      {
        cwd: pythonRunner.projectRoot,
        maxBuffer: 10 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          const details = (stderr || stdout || error.message).trim();
          const wrappedError = new Error(details || 'Falha ao executar a bridge Python.');
          wrappedError.statusCode = 502;
          reject(wrappedError);
          return;
        }

        try {
          const parsed = JSON.parse(stdout);
          if (!parsed.ok) {
            const wrappedError = new Error(parsed.error || 'Erro desconhecido retornado pelo Python.');
            wrappedError.statusCode = 502;
            reject(wrappedError);
            return;
          }

          resolve(parsed.data);
        } catch (parseError) {
          const wrappedError = new Error(`Resposta inválida do Python: ${parseError.message}`);
          wrappedError.statusCode = 502;
          reject(wrappedError);
        }
      }
    );
  });
}

module.exports = {
  runAstroCommand,
};
