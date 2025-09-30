declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JAL_API_BASE_URL: string;
    ADMIN_API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
