const serverless = require('serverless-http');
const app = require('../../backend/src/app');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Prevent serverless function from freezing or waiting on Mongoose connection pool
  context.callbackWaitsForEmptyEventLoop = false;
  return handler(event, context);
};
