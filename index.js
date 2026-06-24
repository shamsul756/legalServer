const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// middleware
app.use(cors());
app.use(express.json());

// env config
const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // ✅ FIXED: correct DB name from env
    const db = client.db(process.env.DBNAME);

    // collections
    const usersCollection = db.collection("user"); // তোমার DB অনুযায়ী "user"
    const lawyersCollection = db.collection("user"); // lawyer = user role
    const eventsCollection = db.collection("legal_events");
    const chamberCollection = db.collection("chambers");
    const bookingCollection = db.collection("bookings");
    const paymentCollection = db.collection("payments");

    console.log("MongoDB connected");

    // ---------------- LAWYERS ----------------
    app.get("/api/lawyers/:id", async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid lawyer id" });
      }

      const result = await usersCollection.findOne({
        _id: new ObjectId(id),
        role: "lawer", // তোমার DB-তে spelling "lawer"
      });

      res.send(result);
    });

    // ---------------- USERS ----------------
    app.get("/api/users/:email", async (req, res) => {
      const { email } = req.params;

      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    // ---------------- CHAMBERS ----------------
    app.get("/api/chamber/:email", async (req, res) => {
      const { email } = req.params;
      const result = await chamberCollection.findOne({ lawyerEmail: email });
      res.send(result);
    });

    app.post("/api/chambers", async (req, res) => {
      const data = req.body;
      const result = await chamberCollection.insertOne(data);
      res.send(result);
    });

    // ---------------- EVENTS ----------------
    app.get("/api/events", async (req, res) => {
      const result = await eventsCollection.find().toArray();
      res.send(result);
    });

    app.get("/api/single-events/:id", async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event id" });
      }

      const result = await eventsCollection.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    // ---------------- BOOKING ----------------
    app.post("/api/events/booking", async (req, res) => {
      const data = req.body;

      const booking = await bookingCollection.insertOne({
        ...data,
        createdAt: new Date(),
      });

      res.send(booking);
    });

    app.get("/api/events/booking/:email", async (req, res) => {
      const { email } = req.params;

      const result = await bookingCollection
        .find({ attendeeEmail: email })
        .toArray();

      res.send(result);
    });

    // ---------------- PAYMENT ----------------
    app.get("/api/payment/:email", async (req, res) => {
      const { email } = req.params;

      const result = await paymentCollection
        .find({ userEmail: email })
        .toArray();

      res.send(result);
    });

    // ---------------- PREMIUM ----------------
    app.patch("/api/users/upgrade-premium/:email", async (req, res) => {
      const { email } = req.params;

      const result = await usersCollection.updateOne(
        { email },
        { $set: { isPremium: true } }
      );

      res.send(result);
    });

  } catch (error) {
    console.log("DB Error:", error);
  }
}

run().catch(console.dir);

// home route
app.get("/", (req, res) => {
  res.send("LegalEase Server Running...");
});

// start server
app.listen(port, () => {
  console.log("Server running on port", port);
});