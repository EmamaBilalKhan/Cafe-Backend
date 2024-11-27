const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.use('/', function(req, res, next){
    console.log("A request for Orders received at " + Date.now());
    next();
 });

router.post("/PlaceOrder", async(req,res)=>{
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await req.app.locals.firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const db = req.app.locals.firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    if(!userDoc.exists){
        res.status(404).send({message: 'User not found'});
    }
    else{
        try{
            const user = userDoc.data();
            await db.collection('Orders').add({
            order: req.body.Order,
            user:user,
            total: req.body.total,
            location: req.body.location,
            paymentMethod: req.body.paymentMethod,
            cardNumber: req.body.cardNumber,
            cvc: req.body.cvc,
            expiry: req.body.expiry,
            cardHolderName: req.body.cardHolderName,
            status: 'pending',
            timestamp: new Date().toISOString()
            });
            res.status(201).send({ message: 'Order created successfully'});
        }
        catch(error){
            console.error('Error creating order:', error);
            res.status(500).send({ error: 'Failed to create order' });
        }
}

})

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
      const OrdersCollection = db.collection('Orders');
      const snapshot = await OrdersCollection.get();
      
      const OrdersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.status(200).json(OrdersList);
    } catch (error) {
      console.error('Error fetching Orders data:', error);
      res.status(500).json({ error: 'Failed to fetch Orders data' });
    }
  }});
  router.delete('/DeleteOrder', async (req, res) => {
    try {
      const idToken = req.headers.authorization.split('Bearer ')[1];
      const decodedToken = await req.app.locals.firebaseAdmin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      console.log("uid: ",uid);
      const db = req.app.locals.firebaseAdmin.firestore();
      const userDoc = await db.collection('users').doc(uid).get();
      if(!userDoc.exists){
          res.status(404).send({message: 'User not found'});
      }
      if (userDoc.data().userType !== "Admin") {
            return res.status(403).send({ message: 'User not authorized to delete orders' });
      }

        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).send({ message: 'Order ID is required' });
        }

        const orderDoc = await db.collection('Orders').doc(orderId).get();
        if (!orderDoc.exists) {
            return res.status(404).send({ message: 'Order not found' });
        }

        await db.collection('Orders').doc(orderId).delete();

        res.status(200).send({ message: "Order deleted successfully" });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).send({ error: 'Failed to delete order' });
    }
});

module.exports = router;