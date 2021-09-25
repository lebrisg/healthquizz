const { MongoClient } = require("mongodb");
const fs = require('fs');
const config = require("./config");

// Initialize the database content
async function init() {
  let nbDocs = 0;
  const client = new MongoClient(config.mongoURL);
  await client.connect();
  console.log("Connected successfully to server at:", config.mongoURL);
  console.log("Step 1");
  const db = client.db(config.mongoDatabase);
  console.log("Step 2");
  nbDocs = await db.collection('healthdata').count();
  console.log("Step 3", nbDocs);

  // If no document in the database
  if (nbDocs == 0) {
    // Read the file healthdata
    const data = fs.readFileSync('/mnt/healthdata', 'utf8');

    // Transform it into Json
    const docs = JSON.parse(data.toString());

    // Insert it into the database
    db.collection('healthdata')
      .insertMany(docs, function(err, result) {
        if (err) throw err;
        console.log('Inserted docs:', result.insertedCount);
     });
   }
  client.close();
}

exports.init = init

// Get all items from the database
async function getAllItems(callback) {
  const client = new MongoClient(config.mongoURL);
  await client.connect();
  const db = client.db(config.mongoDatabase);
  await db.collection('healthdata')
    .find({}).toArray().then(result => {
      client.close();
      callback(result);
     });
}

exports.getAllItems = getAllItems

// Get one item randomly from the database
async function getOneItem(callback) {
  const client = new MongoClient(config.mongoURL);
  await client.connect();
  const db = client.db(config.mongoDatabase);
  await db.collection('healthdata').aggregate([{$sample: {size: 1}}])
    .toArray().then(result => {
      console.log(result);
      client.close();
      callback(result);
     });
}

exports.getOneItem = getOneItem

