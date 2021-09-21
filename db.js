const { MongoClient } = require("mongodb");
const fs = require('fs');
const config = require("./config");

async function init() {
  let nbDocs = 0;
  const client = new MongoClient(config.mongoURL);
  await client.connect();
  console.log("Connected successfully to server at:", config.mongoURL);
  const db = client.db(config.mongoDatabase);
  nbDocs = await db.collection('healthdata').count();
  console.log('nbDocs:', nbDocs);

  // If no document in the database
  if (nbDocs == 0) {
    // Read the file healthdata
    const data = fs.readFileSync('/mnt/healthdata', 'utf8');
    console.log(data);

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

async function getAll(callback) {
  const client = new MongoClient(config.mongoURL);
  await client.connect();
  const db = client.db(config.mongoDatabase);
  await db.collection('healthdata')
    .find({}).toArray().then(result => {
      console.log('=>Docs:', result);
      client.close();
      callback(result);
     });
}

exports.getAll = getAll

