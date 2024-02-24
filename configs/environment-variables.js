const ENV = {
    NODE_ENV: process.env.NODE_ENV,
    APPLICATION_PORT: Number(process.env.APPLICATION_PORT),
    APPLICATION_NAME: process.env.APPLICATION_NAME,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: Number(process.env.DATABASE_PORT),
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_MAX_CONNECTION_POOL: Number(process.env.DATABASE_MAX_CONNECTION_POOL),
};

module.exports = ENV;