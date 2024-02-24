const environmentVariables = require('./environment-variables');
const logger = require('./logger');

const pgp = require('pg-promise')({
    query: (e) => {
        logger.info(e.query);
    }
});

const cn = {
    host: environmentVariables.DATABASE_HOST,
    port: environmentVariables.DATABASE_PORT,
    database: environmentVariables.DATABASE_NAME,
    user: environmentVariables.DATABASE_USER,
    password: environmentVariables.DATABASE_PASSWORD,
    max: environmentVariables.DATABASE_MAX_CONNECTION_POOL,
};

const db = pgp(cn);

module.exports = db;