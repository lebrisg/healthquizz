var http = require("http");
var path = require("path");
var morgan = require("morgan");
var express = require("express");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var promClient = require("prom-client");
var config = require("./config");
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
//app.engine('html', ejs.renderFile);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));
//app.set("views", "./views");

// Define health checks
app.get("/ready", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/live", (req, res) => res.status(200).json({ status: "ok" }));

// Define public directory
//app.use(express.static(__dirname + '/public'));

// Display requests at the console
app.use(morgan("combined"));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Display initial configuration
config.display();

// Test MongoDB config
if(!config.mongoURL) {
  console.log("Bad config parameter!");
  return;
 }

// Initialize the database
db.init();

var items = [];
app.locals.items = items;

// Display the list of categories
app.get("/", async (req, res) => {
  await db.getCategoryList(function(docs) {
    docs.forEach(function(item) {
      //console.log(item);
      items.push({
        category: item._id
       });
     });
    res.render("displayCategories");
    docs.forEach(function(item) { items.pop(); });
   });
 });

// Display all the items
app.get("/item", async (req, res) => {
  await db.getOneItem(function(docs) {
    docs.forEach(function(item) {
      items.push({
        category: item.category,
        name:     item.name,
        protein:  item.protein,
        color:    item.color
       });
     });
    res.render("displayQuizz");
    docs.forEach(function(item) { items.pop(); });
   });
});

// Display all the orange items
app.get("/orange", async (req, res) => {
  await db.getColoredItems("orange", function(docs) {
    docs.forEach(function(item) {
      items.push({
        category: item.category,
        name:     item.name,
        protein:  item.protein,
        color:    item.color
       });
     });
    res.render("displayAll");
    docs.forEach(function(item) { items.pop(); });
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
