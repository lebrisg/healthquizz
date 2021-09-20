const { MongoClient } = require("mongodb");
const fs = require('fs');
const config = require("./config");

async function init() {
  let nbDocs = 0;
  const client = new MongoClient(config.mongoURL);
  await client.connect();
  console.log("Connected successfully to server at:", config.mongoURL);
  const db = client.db(config.mongoDatabase);
  nbDocs = await db.collection("healthdata").count());
//    nbDocs = conn.collection('healthdata').count();
    console.log('nbDocs:', nbDocs);
//    conn.close();
}

  // If no document in the database
//  if (nbDocs == 0) {
    // Read the file healthdata
//    const data = fs.readFileSync('/mnt/healthdata', 'utf8');
//    console.log(data);

    // Transform it into Json
//    const docs = JSON.parse(data.toString());

//    MongoClient.connect(config.mongoURL, function(err, db) {
//      if (err) throw err;
      // Insert it into the database
//      db.collection('healthdata')
//        .insertMany(docs, function(err, result) {
//          if (err) throw err;
//          console.log('Inserted docs:', result.insertedCount);
//       });
//      db.close();
//     });
//   }
//}

exports.init = init

function getAll() {
  MongoClient.connect(config.mongoURL, function(err, db) {
    if (err) throw err;
    db.collection('healthdata')
      .find({}).toArray().then(result => {
        console.log('=>Docs:', result);
        db.close();
        return result;
     });
   });
}

exports.getAll = getAll

