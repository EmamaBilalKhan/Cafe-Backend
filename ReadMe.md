# Overview

This Node.js and Express.js backend API serves as the foundation for the [Cafe-App](https://github.com/EmamaBilalKhan/Cafe-App).

The Backend can be accessed through vercel : [Cafe-Backend](https://cafe-backend-livid.vercel.app/)

# Key Features

* **User Authentication and Authorization:** Securely handles user login, registration, and authorization using Firebase Authentication.
* **User Management:** Manages user profiles, including registration, login, password reset, and profile updates.
* **Product Management:** Allows fetching products from firestore.
* **Order Management:** Processes and tracks customer orders, including order placement, status updates.
* **Real-time Updates:** Utilizes Firebase Realtime Database to provide real-time updates on orders and users.

# Tech Stack

* **Node.js and Express.js:** Provides the core framework for building the API.
* **Firebase Admin Sdk:** Handles authentication, database, and real-time functionalities.
* **Nodemailer:** Facilitates email-based password reset and verification.

# Resources

* **/CoffeeProducts** and **/DessertProducts** : Product Management
* **/Users** : User Management
* **/Orders** : Order Management

# Installation

**1. Clone Repository**
```bash
git clone https://github.com/EmamaBilalKhan/Cafe-Backend.git
```

**2. Install Dependencies**
```bash
npm install
```

**3. Run Application**
```bash
nodemon Cafe-Backend
```




