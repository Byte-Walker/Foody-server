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
        const featureCollection = db.collection('features');

        app.get('/features', async (req, res) => {
            const cursor = await featureCollection.find({});
            const features = await cursor.toArray();
            res.json(features);
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
