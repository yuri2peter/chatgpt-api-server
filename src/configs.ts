import path from 'path';
require('dotenv').config();

const env = process.env as unknown as {
  PORT?: string;
  API_KEY?: string;
  ACCESS_TOKEN?: string;
};

export const IS_PROD = process.env.NODE_ENV === 'production';
export const ROOT_PATH: string = path.resolve(__dirname, '../');

// PORT
export const PORT = Number(env.PORT) || 3000;
process.env.PORT = String(PORT);

// API_KEY
export const API_KEY = env?.API_KEY || '';

// ACCESS_TOKEN;
export const ACCESS_TOKEN = env?.ACCESS_TOKEN || '';
