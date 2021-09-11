var mongodb = require("mongodb");
var mongoose = require("mongoose");
const fs = require('fs');
var config = require("./config");

async function init() {
  await mongoose.connect(config.mongoURL);
  console.log("Connected successfully to server at:", config.mongoURL);
  try {
    const data = fs.readFileSync('/mnt/healthdata', 'utf8');
    console.log(data);
    const docs = JSON.parse(data.toString());

    const db = mongoose.connection;

    var nbDocs = db.collection('healthdata').find().count();
    console.log('nbDocs:', nbDocs); 
    db.close();

//    db.collection('healthdata')
//      .insertMany(docs, function(err, result) {
//        if (err) throw err;
//        console.log('Inserted docs:', result.insertedCount);
//        db.close();
//    });
   } catch (err) {
    console.error(err);
   }
 }

exports.init = init
