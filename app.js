var http = require("http");
var morgan = require("morgan");
var express = require("express");
var ejs = require("ejs");
const { MongoClient } = require("mongodb");
var promClient = require("prom-client");
var config = require("./config");

// Assign app variable
var app = express();
// Disable x-powered header for security reason
app.disable("x-powered-by");

// Enable prom-client to expose default application metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;

// Define a custom prefix string for application metrics
collectDefaultMetrics({ prefix: 'maps:' });

// Define render engine used
app.engine('html', ejs.renderFile);

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

const client = new MongoClient(config.mongoURL);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db(config.mongoDatabase).command({ ping: 1 });
    console.log("Connected successfully to server at:", config.mongoURL);
   } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
   }
}
run().catch(console.dir);

//var db = null,
//    dbDetails = new Object();

//var initDb = function(callback) {
//  if (config.mongoURL == null) return;
//  if (mongodb == null) return;

//  mongodb.connect(config.mongoURL, function(err, conn) {
//    if (err) {
//      callback(err);
//      return;
//    }

//    db = conn;
//    dbDetails.databaseName = db.databaseName;
//    dbDetails.url = config.mongoURLLabel;
//    dbDetails.type = 'MongoDB';

//    console.log('Connected to MongoDB at: %s', config.mongoURL);
//  });
// };

app.get("/", function(request, response) {
//  if (!db) {
//    initDb(function(err){});
//  }
  response.render("index.html");
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
app.listen(config.port, config.ip);
console.log('Server running on http://%s:%s', config.ip, config.port);
