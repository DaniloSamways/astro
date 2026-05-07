const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../../');
const bridgePath = path.resolve(projectRoot, 'backend', 'python_api.py');

function resolvePythonCommand() {
  if (process.env.PYTHON_BIN) {
    return process.env.PYTHON_BIN;
  }

  const candidatePaths = [
    path.resolve(projectRoot, 'venv', 'bin', 'python3'),
    path.resolve(projectRoot, 'venv', 'bin', 'python'),
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return 'python3';
}

const pythonCommand = resolvePythonCommand();

module.exports = {
  bridgePath,
  projectRoot,
  pythonCommand,
};
