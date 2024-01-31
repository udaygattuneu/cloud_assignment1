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
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store');
  next();
});

app.get('/healthz', async (req, res) => {
  let client;

  try {

    if (req.body && Object.keys(req.body).length > 0 || req.query && Object.keys(req.query).length > 0) {
      res.status(400).send();
    } else {
      await dbPool.sequelize.authenticate();
      res.status(200).send();
    }
  } catch (error) {
    //database not available 
    res.status(503).send();
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.all('/*', (req, res) => {
  if (req.method == 'GET') {
    //If the url or endpoint entered is wrong
    res.status(404).send();
  }
  else {
    //If any other methods are used except GET
    res.status(405).send();
  }
});

(async ()=> {
  await db.sequelize.sync();
})();

app.listen(port,() => {
  //using port 3000
  console.log(`Server Started at Port ${port}`) 
})


