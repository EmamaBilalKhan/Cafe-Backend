const express = require('express');
require("dotenv").config();
const router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");

const { 
    auth,
    createUserWithEmailAndPassword,
} = require('./Firebase/FirebaseConfig');

router.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_EMAIL_PASSWORD
    },
  });

router.post('/SignUp', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const db = req.app.locals.firebaseAdmin.firestore();
        
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

router.post("/resetPassword",async(req,res)=>{
    const {email} = req.body;
        try {
            const user = await req.app.locals.firebaseAdmin.auth().getUserByEmail(email);
            if(user){
            const link = await req.app.locals.firebaseAdmin.auth().generatePasswordResetLink(email);

            await transporter.sendMail({
                from: `"Emama Bilal Khan" <${process.env.APP_EMAIL}>`,
                to: email,
                subject: "Reset Password Link",
                text: `Hello user! here is the reset password link for your cafe application account : ${link}`
              });

            res.status(200).send({message: 'Reset password link sent',link});
        }
        else{
            res.status(404).send({message:'User not found'});
        }
    }
    catch (error) {
        console.error('Failed to send password reset email:', error);
        res.status(500).send({ error: 'Failed to send password reset email' });
      }
})

router.get('/UserInformation', async (req, res) => {
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
        
          const { username, contact, address } = userDoc.data();

          return res.status(200).json({ username, contact, address });    
        } catch (error) {
        console.error('Error fetching specific user info:', error);
        return res.status(500).json({ message: "failed to retrieve user details" });
    }
});

router.post('/EditUserInformation', async (req, res) => {
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
        }, { merge: true });
        res.status(200).send({ message: 'User Edited successfully'});
    } catch (error) {
        console.error('Error Editting user:', error);
        res.status(500).send({ error: 'Failed to Edit user' });
    }
});

router.post('/changePassword', async (req, res) => {
    try {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        const decodedToken = await req.app.locals.firebaseAdmin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const { password } = req.body;

        await req.app.locals.firebaseAdmin.auth().updateUser(uid, { password });

        res.status(200).send({ message: 'Password changed successfully' });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            res.status(404).send({ message: 'User not found' });
        } else {
            console.error('Error changing password:', error);
            res.status(500).send({ error: 'Failed to change password' });
        }
    }
});

module.exports = router;
