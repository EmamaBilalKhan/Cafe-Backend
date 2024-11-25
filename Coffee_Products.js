const express = require('express');
const router = express.Router();

router.use('/', function(req, res, next){
    console.log("A request for coffee received at " + Date.now());
    next();
 });
 
 router.get('/', async (req, res) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await req.app.locals.firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const db = req.app.locals.firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    if(!userDoc.exists){
        res.status(404).send({message: 'User not found'});
    }
    else{
   try {
     const db = req.app.locals.firebaseAdmin.firestore();
     const coffeeCollection = db.collection('Coffee');
     const snapshot = await coffeeCollection.get();
     
     const coffeeList = snapshot.docs.map(doc => ({
       id: doc.id,
       ...doc.data()
     }));
     
     res.status(200).json(coffeeList);
   } catch (error) {
     console.error('Error fetching coffee data:', error);
     res.status(500).json({ error: 'Failed to fetch coffee data' });
   }
 }});
  
module.exports = router;
