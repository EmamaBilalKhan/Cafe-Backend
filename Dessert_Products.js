const express = require('express');
const router = express.Router();

router.use('/', function(req, res, next){
    console.log("A request for desserts received at " + Date.now());
    next();
 });
 
 router.get('/', async (req, res) => {
   try {
     const db = req.app.locals.firebaseAdmin.firestore();
     const DessertCollection = db.collection('Dessert');
     const snapshot = await DessertCollection.get();
     
     const DessertList = snapshot.docs.map(doc => ({
       id: doc.id,
       ...doc.data()
     }));
     
     res.status(200).json(DessertList);
   } catch (error) {
     console.error('Error fetching coffee data:', error);
     res.status(500).json({ error: 'Failed to fetch coffee data' });
   }
 });
  
module.exports = router;
