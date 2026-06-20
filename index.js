const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_DB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("legalEase");
    const lawersCollection = db.collection("lawersInfo")
    const eventsCollection = db.collection('events');
    const usersCollection = db.collection('user');
    const bookingCollection = db.collection('bookings');
    const paymentCollection = db.collection('payments');



    app.post('/api/lawyers', async (req, res) => {
      const {
        name,
        image,       // imgBB image URL
        category,
        bio,
        fee,
        status,
        email
      } = req.body;

      const addData = {
        name,
        image,
        category,
        bio,
        fee,
        status: 'active',
        createdAt: new Date()
      };

      const result = await organizationCollection.insertOne(addData);
      // console.log(result);

      res.send(result);
    });








    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})