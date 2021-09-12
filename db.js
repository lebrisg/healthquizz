var mongodb = require("mongodb");
var mongoose = require("mongoose");
const fs = require('fs');
var config = require("./config");

async function init() {
  await mongoose.connect(config.mongoURL);
  console.log("Connected successfully to server at:", config.mongoURL);
  try {
    const db = mongoose.connection;
    var nbDocs = await db.collection('healthdata').count();
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
    db.close();
   } catch (err) {
    console.error(err);
   }
 }

exports.init = init

async function getAll() {
  await mongoose.connect(config.mongoURL);
  try {
    const db = mongoose.connection;
    //console.log("Connected successfully to server at:", config.mongoURL);
    db.collection('healthdata')
        .find({}).toArray(function(err, result) {
          if (err) throw err;
          //console.log('Docs:', result);
          db.close();
          return result;
         });
   } catch (err) {
    console.error(err);
   }
}

exports.getAll = getAll

