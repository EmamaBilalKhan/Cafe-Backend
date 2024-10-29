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
module.exports = router;
