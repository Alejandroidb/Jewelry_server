const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, 'access.log');

const logger = (req, res, next) => {

  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de registro:', err);
    }
    next()
  });
  
};

module.exports = logger;