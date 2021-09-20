const MongoClient = require("mongodb").MongoClient;
const fs = require('fs');
const config = require("./config");

function init() {
  let nbDocs = 0;
  MongoClient.connect(config.mongoURL, (err, conn) => {
    if (err) throw err;
    console.log("Connected successfully to server at:", config.mongoURL);
    nbDocs = conn.collection('healthdata').count();
    console.log('nbDocs:', nbDocs);
    conn.close();
   });

  // If no document in the database
  if (nbDocs == 0) {
    // Read the file healthdata
    const data = fs.readFileSync('/mnt/healthdata', 'utf8');
    console.log(data);

    // Transform it into Json
    const docs = JSON.parse(data.toString());

    MongoClient.connect(config.mongoURL, (err, conn) => {
      if (err) throw err;
      // Insert it into the database
      conn.collection('healthdata')
        .insertMany(docs, function(err, result) {
          if (err) throw err;
          console.log('Inserted docs:', result.insertedCount);
       });
      conn.close();
     });
   }
}

exports.init = init

function getAll() {
  MongoClient.connect(config.mongoURL, (err, conn) => {
    if (err) throw err;
    conn.collection('healthdata')
      .find({}).toArray().then(result => {
        console.log('=>Docs:', result);
        conn.close();
        return result;
     });
   });
}

exports.getAll = getAll

