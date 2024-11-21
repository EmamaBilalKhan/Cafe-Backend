const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { 
    auth,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, sendEmailVerification
} = require('./Firebase/FirebaseConfig');

router.use(bodyParser.json());

router.post('/SignUp', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const db = req.app.locals.firebaseAdmin.firestore();
        
        // Store user data in Firestore
        await db.collection('users').doc(user.uid).set({
            userType: "customer",
            isRegistered: false
        });

        res.status(201).send({ message: 'User created successfully', uid: user.uid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send({ error: error.message });
    }
});

router.get('/LoginUserInformation', async (req, res) => {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await req.app.locals.firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    try {
        
        const userDoc = await req.app.locals.firebaseAdmin.firestore()
        .collection('users')
        .doc(uid)
        .get();


        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
          }
        
          const { userType, isRegistered } = userDoc.data();

          return res.status(200).json({ userType, isRegistered });    
        } catch (error) {
        console.error('Error fetching specific user info:', error);
        return res.status(500).json({ message: "failed to retrieve user details" });
    }
});

// Register user additional data
router.post('/RegisterUser', async (req, res) => {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await req.app.locals.firebaseAdmin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    try {
        await req.app.locals.firebaseAdmin.firestore()
        .collection('users')
        .doc(uid)
        .set({
            username: req.body.name,
            contact: req.body.contact,
            address: req.body.address,
            isRegistered: true
        }, { merge: true });
        res.status(200).send({ message: 'User registered successfully'});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send({ error: 'Failed to register user' });
    }
});



module.exports = router;
