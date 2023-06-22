const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const toys = require('./toys.json');

require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


console.log("password ", process.env.DB_PASS);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9r1od98.mongodb.net/?retryWrites=true&w=majority`;


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

    const toysCollection = client.db('toysDb').collection('toysCollection');

    // get all toys 
    app.get('/toys', async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // get all toys with limit
    app.get('/all-toys', async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })

    // my toys
    app.get('/mytoys', async (req, res) => {
      console.log("email in db", req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      }
      const resultAll = await toysCollection.find(query).toArray();
      const resultAs = await toysCollection.find(query).sort({ price: 1 }).toArray();
      const resultDs = await toysCollection.find(query).sort({ price: -1 }).toArray();
      const result = { resultAll, resultAs, resultDs };
      res.send(result);
    })

    // get sorted toys by price
    app.get('/mytoys-ascending', async (req, res) => {
      const cursor = toysCollection.find().sort({ price: 1 });
      const result = await cursor.toArray();
      res.send(result);
    })

    //fetched by specific id
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    // get latest toys
    app.get('/latest-toys', async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })

    // get latest toys
    app.get('/latest-toys', async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })

    //insert a toy to db
    app.post('/toy', async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    })

    app.patch('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      console.log(updatedToy);
      const updateDoc = {
        $set: {
          name: updatedToy.name,
          email: updatedToy.sellerEmail,
          pictureUrl: updatedToy.pictureUrl,
          price: updatedToy.price,
          rating: updatedToy.rating,
          category: updatedToy.category,
          sellerName: updatedToy.sellerName,
          availableQuantity: updatedToy.availableQuantity,
          description: updatedToy.description
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running');
})



app.listen(port, () => {
  console.log(`server is running on ${port}`);
})