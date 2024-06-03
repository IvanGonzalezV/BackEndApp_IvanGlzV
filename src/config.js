import dotenv from 'dotenv';

dotenv.config();

const config = {
    MONGODB_URI: process.env.MONGODB_URI,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET
};

export default config;