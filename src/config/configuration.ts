export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL as string,
  },
  services: {
    mailerHost: process.env.MAIL_HOST,
    mailerUser: process.env.MAIL_USER,
    mailerPassword: process.env.MAIL_PASSWORD
  },
});
