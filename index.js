const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// const ObjectId = new ObjectId();

// Mongodb setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5pp73.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        const db = client.db('Foody');
        const featureCollection = db.collection('features');
        const foodCollection = db.collection('foods');
        const userCollection = db.collection('users');
        const orderCollection = db.collection('orders');

        // Retrieving features from the database
        app.get('/features', async (req, res) => {
            const cursor = featureCollection.find({});
            const features = await cursor.toArray();
            res.json(features);
        });

        // Retrieving foods from the database
        app.get('/foods', async (req, res) => {
            const cursor = foodCollection.find({});
            const foods = await cursor.toArray();
            res.json(foods);
        });

        // Retrieving single food info from the database
        app.get('/foodinfo/:productId', async (req, res) => {
            const productId = req.params.productId;
            const query = { _id: ObjectId(productId) };
            const product = await foodCollection.findOne(query);
            res.json(product);
        });

        // Retrieving single food info from the database
        app.post('/placeorder', async (req, res) => {
            const orderDetails = req.body;

            // Inserting the order in the database
            const result = await orderCollection.insertOne(orderDetails);
            res.send(result);
        });

        // Retrieving user orders
        app.get('/getUserOrders/:userId', async (req, res) => {
            const userId = req.params.userId;
            const query = { dbUser_id: userId };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // Get all the orders
        app.get('/getallorders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // Delete an order
        app.delete('/deleteorder/:orderId', async (req, res) => {
            const orderId = req.params.orderId;
            const filter = { productId: orderId };
            const result = await orderCollection.deleteOne(filter);
            res.json(result);
        });

        // Update order satus
        app.put('/updateorderstatus/:orderId', async (req, res) => {
            const orderId = req.params.orderId;
            const status = req.body.status;
            const filter = { productId: orderId };
            const updatedStatus = {
                $set: {
                    status: status,
                },
            };
            const result = await orderCollection.updateOne(
                filter,
                updatedStatus
            );
            res.send(result);
        });

        // Add new food 
        app.post('/addfood', async (req, res) => {
            const foodInfo = req.body;
            const result = await foodCollection.insertOne(foodInfo);
            res.json(result);
        })

        // Get user from the database
        app.post('/getuser', async (req, res) => {
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
