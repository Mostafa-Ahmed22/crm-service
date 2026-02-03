export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL as string,
  },

  // services: {
  //   masterdata: process.env.MASTERDATA_SERVICE_URL,
  //   payment: process.env.PAYMENT_SERVICE_URL,
  //   statement: process.env.STATEMENT_SERVICE_URL,
  //   sapIntegration: process.env.SAP_INTEGRATION_SERVICE_URL,
  // },
});
