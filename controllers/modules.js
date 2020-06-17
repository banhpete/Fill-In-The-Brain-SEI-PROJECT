const Category = require("../models/category");
const Module = require("../models/module");
const User = require("../models/user");

module.exports = {
  create: createModule,
};

let ignoredWords = [
  "in",
  "a",
  "the",
  "as",
  "is",
  "it",
  "of",
  "that",
  "from",
  "well",
  "are",
  "can",
  "thus",
  "with",
  "to",
  "an",
  "and",
  "be",
  "where",
  "have",
  "also",
  "or",
  "why",
  "how",
  "what",
  "there",
];

function createModule(req, res, next) {
  // Create another key:value pair for the Schema
  req.body.fibStats = [];
  // To track which sentence has been used already
  let randoArr = [];
  // Get all sentences in content
  let sentences = req.body.content.replace(/(\r\n|\n|\r)/gm, " ");
  sentences = sentences.match(/\S.*?\."?(?=\s|$)/g);
  // Create fib statements
  for (i = 0; i < req.body.numOfBlanks; i++) {
    let randIndex = Math.floor(Math.random() * sentences.length);
    while (randoArr.includes(randIndex)) {
      randIndex = Math.floor(Math.random() * sentences.length);
    }
    randoArr.push(randIndex);
    let words = sentences[randIndex].split(" ");
    let randWdIndex = Math.floor(Math.random() * words.length);
    console.log("randoIndex: ", randWdIndex);
    console.log("word: ", words[randWdIndex]);
    while (
      words[randWdIndex].length < 3 ||
      ignoredWords.includes(words[randWdIndex])
    ) {
      randWdIndex = Math.floor(Math.random() * words.length);
    }
    words[randWdIndex] = "(-" + words[randWdIndex] + "-)";
    req.body.fibStats.push(words.join(" "));
  }
  console.log("finished editting data");
  Module.create(req.body, function (err, module) {
    if (err) next();
    const p1 = Category.findOne({ name: module.category });
    const p2 = User.findById(req.user.id);
    Promise.all([p1, p2])
      .then(function (results) {
        results[0].modules.push(module._id);
        results[1].modules.push(module._id);
        return Promise.all([results[0].save(), results[1].save()]);
      })
      .then(function (results) {
        res.redirect("/");
      })
      .catch(function (err) {
        next();
      });
  });
}
