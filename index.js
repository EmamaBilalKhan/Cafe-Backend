const express = require('express');
const app = express();
const port = 3000;
const admin = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require('./Firebase/cafeapp-abee4-firebase-adminsdk-dnba1-a33f265a63.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Share the Firebase instance with route files
app.locals.firebaseAdmin = admin;

// Import routes
const Coffee_Products = require('./Coffee_Products');
const Dessert_Products = require('./Dessert_Products');


// Main route
app.get('/', (req, res) => {
  res.send({ message: 'Hello from the Express API!' });
});

// Set up routes
app.use('/Coffee_Products', Coffee_Products);
app.use('/Dessert_Products', Dessert_Products);


app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
