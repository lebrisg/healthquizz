var mongodb = require("mongodb");
var mongoose = require("mongoose");
const fs = require('fs');
var config = require("./config");

async function init() {
  await mongoose.connect(config.mongoURL);
  console.log("Connected successfully to server at:", config.mongoURL);
  try {
    const conn = mongoose.connection;
    var nbDocs = await conn.collection('healthdata').count();
    console.log('nbDocs:', nbDocs);

    // If no document in the database
    if (nbDocs == 0) {
      // Read the file healthdata
      const data = fs.readFileSync('/mnt/healthdata', 'utf8');
      console.log(data);

      // Transform it into Json
      const docs = JSON.parse(data.toString());

      // Insert it into the database
      conn.collection('healthdata')
        .insertMany(docs, function(err, result) {
          if (err) throw err;
          console.log('Inserted docs:', result.insertedCount);
          conn.close();
       });
     } else {
    conn.close();
   } catch (err) {
    console.error(err);
   }
 }

exports.init = init

async function getAll() {
  await mongoose.connect(config.mongoURL);
  try {
    const conn = mongoose.connection;
    //console.log("Connected successfully to server at:", config.mongoURL);
    conn.collection('healthdata')
      .find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log('=>Docs:', result);
        conn.close();
        return result;
       });
   } catch (err) {
    console.error(err);
   }
}

exports.getAll = getAll

