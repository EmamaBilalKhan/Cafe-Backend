const express = require('express');
const app = express();
require("dotenv").config();
const admin = require('firebase-admin');
const cors = require('cors'); 

const serviceAccount = require('../Firebase/cafeapp-abee4-firebase-adminsdk-dnba1-a33f265a63.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.locals.firebaseAdmin = admin;
const port = process.env.PORT;

const Coffee_Products = require('./Coffee_Products');
const Dessert_Products = require('./Dessert_Products');
const Users = require('./Users');
const Orders = require('./Orders');


app.get('/', (req, res) => {
  res.send({ message: 'Hello from the Cafe API!' });
});

app.use(cors({
  origin: '*',
}));


app.use('/Coffee_Products', Coffee_Products);
app.use('/Dessert_Products', Dessert_Products);
app.use('/Users', Users);
app.use('/Orders', Orders);


app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

module.exports = app;

