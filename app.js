const express = require('express');
const app = express();

require('dotenv').config();

const environmentVariables = require('./configs/environment-variables');
const logger = require('./configs/logger');
const PORT = environmentVariables.APPLICATION_PORT || 3000;
const router = require('./apps/routes');
const errorMiddleware = require('./configs/error');

/**
 * Configure swagger
 */
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use('/uploads', express.static('uploads'));

app.use(errorMiddleware.errorHandler);

app.listen(PORT, () => {
    logger.info(`${environmentVariables.APPLICATION_NAME} is started and listening on port ${PORT}`);
});

