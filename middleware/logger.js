const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const apiLogger = new winston.Logger({
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'api.log'),
            json: true,
            timestamp: true
        }),
        new winston.transports.Console({
            colorize: true,
            timestamp: true
        })
    ]
});

const errorLogger = new winston.Logger({
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            json: true,
            level: 'error',
            timestamp: true
        }),
        new winston.transports.Console({
            colorize: true,
            timestamp: true,
            level: 'error'
        })
    ]
});

module.exports = { apiLogger, errorLogger };
