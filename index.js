const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ad0jo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


async function run() {
  try {
    await client.connect();
    console.log("success connect database");
    const database = client.db("travels");
    const tourCollection = database.collection("tours");
    const orderCollection = database.collection("orders");

    //Get My Orders by email
    app.get("/myorders", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { userEmail: email };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //POST API For Orders
    app.post("/allorders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });

    //GET All Orders API
    app.get("/allorders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //Delete Single Order From All Orders
    app.delete("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleted Order", id);
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("Deleted", result);
      res.json(result);
    });

    //POST Tours
    app.post("/tours", async (req, res) => {
      const tour = req.body;
      console.log(tour);
      const result = await tourCollection.insertOne(tour);
      res.json(result);
    });

    //GET API
    app.get("/tours", async (req, res) => {
      const cursor = tourCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    //singleProduct
    app.get("/tours/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tour = await tourCollection.findOne(query);
      res.json(tour);
    });
    //Update Approved
    app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const filter = { _id: ObjectId(id) };
      console.log(updatedStatus);
      orderCollection
        .updateOne(filter, {
          $set: { bookedServiceStatus: updatedStatus },
        })
        .then((result) => {
          res.send(result);
          console.log(result);
        });
    });

    //Delete My Orders
    app.delete("/myorders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleted Order", id);
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("Deleted", result);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

//root
app.get("/", (req, res) => {
  res.send("running mt curd");
});

app.listen(port, () => {
  console.log("running server on port", port);
});
