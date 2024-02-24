const winston = require('winston');
require('winston-daily-rotate-file');

const environmentVariables = require('./environment-variables');

const defaultLogFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint(),
);

const defaultLogDatePattern = 'YYYY-MM-DD';

const generalLogTransport = new winston.transports.DailyRotateFile({
    filename: `${environmentVariables.APPLICATION_NAME}-general-%DATE%.log`,
    dirname: 'logs/general',
    datePattern: defaultLogDatePattern,
    level: 'info'
});

const errorLogTransport = new winston.transports.DailyRotateFile({
    filename: `${environmentVariables.APPLICATION_NAME}-error-%DATE%.log`,
    dirname: 'logs/error',
    datePattern: defaultLogDatePattern,
    level: 'error'
});

const logger = winston.createLogger({
    format: defaultLogFormat,
    defaultMeta: { application: environmentVariables.APPLICATION_NAME },
    transports: [generalLogTransport, errorLogTransport]
});

if (environmentVariables.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({ format: defaultLogFormat }));
}

module.exports = logger;