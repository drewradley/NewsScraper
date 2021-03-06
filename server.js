var express = require("express");
var bodyParser = require("body-parser");
//var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
//var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

var PORT = (process.env.port || 3000);

// Initialize Express
var app = express();
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Configure middleware

// Use morgan logger for logging requests
//app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";
// Routes
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
var results = [];

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.bbc.com/news", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var result = {};

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works
  $("a.gs-c-promo-heading").each(function(i, element) {
   // console.log(element)
    var link = "https://www.bbc.com"+$(element).attr("href");
    var title = $(element).children().text();
    var summary = $(element).next().text();//.children("p.gs-c-promo-summary").text();
    console.log(summary);
    result.title = title;
    result.link = link;
    result.summary = summary;
    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      link: link,
      summary: summary
    });
    db.Article.create(result)
    .then(function(dbArticle) {
      // View the added result in the console
      //console.log(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      return res.json(err);
    });
  });

  // Log the results once you've looped through each of the elements found with cheerio
  res.send("Scrape Complete");
  //console.log(results);
  });
  
});

app.get("/handlebars", function(req, res) {
  db.Article.find({})
    .then(function(results) {
      //console.log(results.length)
      // If we were able to successfully find Articles, send them back to the client
      {
        res.render("allArticles", {
        results: results
      });
    }
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });// console.log(result);

});
// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
app.get("/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved:true})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
app.post("/save/:id", function(req, res) {
  console.log(req.params.id)
  //console.log(db.Article.findOne({ _id: req.params.id }));
  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set:{saved: true} }, { new: true }, function(err, doc){
    if(err){
        console.log("Something wrong when updating data!");
    }

    console.log(doc);
  });
})

app.post("/unsave/:id", function(req, res) {
  console.log(req.params.id)
  //console.log(db.Article.findOne({ _id: req.params.id }));
  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set:{saved: false} }, { new: true }, function(err, doc){
    if(err){
        console.log("Something wrong when updating data!");
    }

    console.log(doc);
  });
})
// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
