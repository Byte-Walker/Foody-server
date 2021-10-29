const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Mongodb setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5pp73.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        const db = client.db('Foody');

        // Retrieving features from the database
        app.get('/features', async (req, res) => {
            const featureCollection = db.collection('features');
            const cursor = featureCollection.find({});
            const features = await cursor.toArray();
            res.json(features);
        });

        // Retrieving foods from the database
        app.get('/foods', async (req, res) => {
            const foodCollection = db.collection('foods');
            const cursor = foodCollection.find({});
            const foods = await cursor.toArray();
            res.json(foods);
        });

        // Get user from the database
        app.post('/getuser', async (req, res) => {
            const userCollection = db.collection('users');
            const sentUser = req.body;
            const collectedUser = await userCollection.findOne({
                uid: sentUser.uid,
            });
            // Checking if the user exists or not
            if (!collectedUser && sentUser.email) {
                const user = {
                    uid: sentUser.uid,
                    displayName: sentUser.displayName,
                    photoURL: sentUser.photoURL,
                    email: sentUser.email,
                    emailVerified: sentUser.emailVerified,
                    cart: {},
                    orders: {},
                    purchased: {},
                };
                const result = await userCollection.insertOne(user);
                if (result.insertedId) {
                    res.json(user);
                } else {
                    console.log(
                        'Sorry, some error occurred while inserting user!'
                    );
                }
            } else {
                res.json(collectedUser);
            }
        });
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hitting the homepage url');
});

app.listen(port, () => {
    console.log('listening on port ' + port);
});
