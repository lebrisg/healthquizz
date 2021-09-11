var mongodb = require("mongodb");
var mongoose = require("mongoose");
const fs = require('fs');

async function run() {
  await mongoose.connect(config.mongoURL);
  console.log("Connected successfully to server at:", config.mongoURL);
  try {
    const data = fs.readFileSync('/mnt/healthdata', 'utf8');
    console.log(data);
   } catch (err) {
    console.error(err);
   }
 }

exports.run = run
