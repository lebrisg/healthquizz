var mongodb = require("mongodb");
const fs = require('fs');
var config = require("./config");

async function init() {
  const client = mongodb.MongorClient;
  client.connect(config.mongoURL, (err, conn) => {
    if (err) throw err;
    console.log("Connected successfully to server at:", config.mongoURL);
    var nbDocs = conn.collection('healthdata').count();
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
       });
     }
   }).catch ((err) => {
    console.log(err);
   }).finally(() => {
    conn.close();
   });
 }

exports.init = init

async function getAll() {
  mongoose.connect(config.mongoURL).catch(err => { console.log(err); });
  const conn = mongoose.connection;
  conn.collection('healthdata')
    .find({}).toArray().then(result => {
      console.log('=>Docs:', result);
      return result;
   }).catch (err => {
    console.log(err);
   }).finally(() => {
    conn.close();
   });
}

exports.getAll = getAll

