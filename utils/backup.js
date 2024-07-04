const fs = require('fs');
const path = require('path');

function performBackup(database, backupPath) {
  const backupFileName = `backup-${new Date().toISOString().replace(/:/g, '-')}.json`;
  const backupFilePath = path.join(backupPath, backupFileName);

  try {
    fs.writeFileSync(backupFilePath, JSON.stringify(database, null, 2), 'utf8');
    console.log(`Backup realizado com sucesso em: ${backupFilePath}`);
  } catch (error) {
    console.error('Erro ao realizar backup:', error);
  }
}

module.exports = { performBackup };
