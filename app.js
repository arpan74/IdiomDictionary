const express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const axios = require("axios");
require("dotenv").config();

const CONNECTION_URL =
  "mongodb+srv://" +
  process.env.USERNAME_MONGO +
  ":" +
  process.env.PASSWORD_MONGO +
  "@cluster0-eoik8.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "idioms";

var app = express();

app.get("/today/", (req, res) => {
  collection.count({}).then(value => {
    const date = new Date();
    const num = (date.getDay() * date.getFullYear() * date.getMonth()) % value;
    collection
      .find({})
      .skip(num)
      .limit(1)
      .toArray((error, result) => {
        res.render("idiomPage.ejs", { idiom: result[0] });
      });
  });
});

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

var database, collection;

app.get("/", (req, res) => {
  res.render("homePage.ejs", { todaysIdiom: req.app.locals.todaysIdiom });
});

app.get("/i/:idiom", (req, res) => {
  var idiomName = req.params.idiom;
  idiomName = idiomName.replace(/-/g, " ");
  console.log(idiomName);
  var name = "name";
  collection.findOne({ name: idiomName }, (err, result) => {
    console.log(result);
    res.render("idiomPage.ejs", { idiom: result });
  });
});

app.get("/random/", (req, res) => {
  collection.aggregate([{ $sample: { size: 1 } }]).toArray((error, result) => {
    if (error) {
      console.log("ERROR");
    } else {
      res.render("idiomPage.ejs", { idiom: result[0] });
    }
  });
});

app.get("/search/api/:value", (req, res) => {
  var value = req.params.value;
  respAnswer = [];
  collection.find({ name: { $regex: value } }).toArray((error, result) => {
    if (error) {
      console.log("ERROR");
    } else {
      result.push(value);
      res.send(JSON.stringify(result));
    }
  });
});

app.get("/random/api/", (req, res) => {
  var query = {};
  collection.aggregate([{ $sample: { size: 1 } }]).toArray((error, result) => {
    if (error) {
      console.log("ERROR");
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

app.listen(3000, () => {
  MongoClient.connect(
    CONNECTION_URL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      database = client.db(DATABASE_NAME);
      collection = database.collection("idiomsList");
      console.log("Connected to `" + DATABASE_NAME + "`!");
    }
  );
});
