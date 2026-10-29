const serverless = require('serverless-http');
const app = require('../../backend/src/app');

// Strip the Netlify function base path so Express routes match correctly.
// When called via redirect, Netlify sets event.path to the original request
// path (e.g. /api/auth/login). When called directly, it includes the full
// function path (e.g. /.netlify/functions/api/auth/login).
// serverless-http basePath option strips the prefix so Express sees the path
// it expects.
const handler = serverless(app, {
  basePath: '/api',
});

module.exports.handler = async (event, context) => {
  // Prevent serverless function from freezing or waiting on Mongoose connection pool
  context.callbackWaitsForEmptyEventLoop = false;

  // Normalise path: remove /.netlify/functions/api prefix if present (direct invocation)
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '') || '/';
  }

  return handler(event, context);
};

