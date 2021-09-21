var http = require("http");
var morgan = require("morgan");
var express = require("express");
var ejs = require("ejs");
//const { MongoClient } = require("mongodb");
//var mongodb = require("mongodb");
//var mongoose = require("mongoose");
var promClient = require("prom-client");
var config = require("./config");
//const fs = require('fs');
var db = require("./db");

// Assign app variable
var app = express();
// Disable x-powered header for security reason
app.disable("x-powered-by");

// Enable prom-client to expose default application metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;

// Define a custom prefix string for application metrics
collectDefaultMetrics({ prefix: 'healthquizz:' });

// Define render engine used
app.engine('html', ejs.renderFile);

// Define health checks
app.get("/ready", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/live", (req, res) => res.status(200).json({ status: "ok" }));

// Define public directory
//app.use(express.static(__dirname + '/public'));

// Display requests at the console
app.use(morgan("combined"));

// Display initial configuration
config.display();

// Test MongoDB config
if(!config.mongoURL) {
  console.log("Bad config parameter!");
  return;
 }

// Initialize the database
db.init();

//let docs = db.getAll();
//console.log("Result:", docs);

var lines = [];
app.locals.lines = lines;

// Deal with HTTP requests
app.get("/", async (req, res) => {
  await db.getAll(function(docs) {
    lines = docs;
    console.log("Result:", lines);
    res.render("displayAll.html");
   });
});

// Expose our metrics at the default URL for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.send(await promClient.register.metrics());
 });

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
 });

// Start http server
app.listen(8080);
console.log('Server running on http');
