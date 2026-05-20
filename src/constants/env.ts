import Constants from 'expo-constants';

type AppEnv = 'development' | 'staging' | 'production';

type Env = {
  APP_ENV: AppEnv;
  API_URL: string;
  SENTRY_DSN: string;
};

const extra = Constants.expoConfig?.extra ?? {};

export const ENV: Env = {
  APP_ENV: (extra.APP_ENV as AppEnv) ?? 'development',
  API_URL: extra.API_URL ?? 'https://api.example.com',
  SENTRY_DSN: extra.SENTRY_DSN ?? '',
};
