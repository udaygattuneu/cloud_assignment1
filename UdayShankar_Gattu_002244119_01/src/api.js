require('dotenv').config();
const { response } = require('express');
const express = require('express');
const dbPool = require('../config/sequelize');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const db = require('../models')
app.use(bodyParser.json());


//Handling Cache-Control Headers
app.use((request, response, next) => {
  response.setHeader('Cache-Control', 'no-cache, no-store');
  next();
});

app.get('/healthz', async (request, response) => {
  let client;

  try {

    if (request.body && Object.keys(request.body).length > 0 || request.query && Object.keys(request.query).length > 0) {
      response.status(400).send();
    } else {
      await dbPool.sequelize.authenticate();
      response.status(200).send();
    }
  } catch (error) {
    //database not available 
    response.status(503).send();
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.all('/*', (request, response) => {
  if (request.method == 'GET') {
    //If the url or endpoint entered is wrong
    response.status(404).send();
  }
  else {
    //If any other methods are used except GET
    response.status(405).send();
  }
});

(async ()=> {
  await db.sequelize.sync();
})();

app.listen(port,() => {
  //using port 3000
  console.log(`Server Started at Port ${port}`) 
})


