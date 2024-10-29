const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { 
    auth,
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification,
    sendPasswordResetEmail
   } = require('./Firebase/FirebaseConfig');

router.use(bodyParser.json()); // Parse JSON request bodies

// User registration route
router.post('/register', async (req, res) => {
    const { email, password, username, phone } = req.body;

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const db = req.app.locals.firebaseAdmin.firestore();
        // Store the phone number in Firestore (or Realtime Database)
        await db.collection('users').doc(user.uid).set({
            username: username,
            phone: phone
        });

        res.status(201).send({ message: 'User created successfully', uid: user.uid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        res.status(200).send({ message: 'Login successful', uid: user.uid });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(400).send({ error: error.message });
    }
});

router.get('/UserDetails', async (req, res) => {
    const db = req.app.locals.firebaseAdmin.firestore();
    const admin = req.app.locals.firebaseAdmin;
    const uid = req.query.uid;

    try {
        // Get user data from Firebase Auth
        const userRecord = await admin.auth().getUser(uid);
        
        // Get additional user data from Firestore
        const docRef = db.collection('users').doc(uid);
        const doc = await docRef.get();

        if (!doc.exists) {
            res.status(404).send('User not found in Firestore');
        } else {
            // Combine data from Auth and Firestore
            const userData = {
                email: userRecord.email,
                ...doc.data()
            };
            res.status(200).send(userData);
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send({ error: 'Failed to retrieve user details' });
    }
});

module.exports = router;
