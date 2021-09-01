const fs = require("fs");
const csv = require("@fast-csv/parse");
const gTTS = require("gtts");

function initialize(filePath) {
  const data = [];
  fs.createReadStream(filePath)
    .pipe(csv.parse())
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", (rowCount) => console.log(`Parsed ${rowCount} rows`));

  // Initialize sound
  const saveSounds = (words) => {
    words.forEach((word, index) => {
      // Order: Grammar, Swedish, English, Type, Examples, Swedish (full)
      //           0        1        2       3      4           5
      let swedishWord = word[1];
      if (word[0]) {
        // att, en, ett
        word.push(`(${word[0]}) ${swedishWord}`);
        swedishWord = `${word[0]} ${swedishWord}`;
      } else {
        word.push(swedishWord);
      }
      const gttsSv = new gTTS(swedishWord, "sv");
      gttsSv.save(`./public/sounds/sv/${index}.mp3`, function (err) {
        if (err) throw new Error(err);
      });
      const gttsEn = new gTTS(word[2], "en");
      gttsEn.save(`./public/sounds/en/${index}.mp3`, function (err) {
        if (err) throw new Error(err);
      });
    });
  };

  const getWords = (index) => {
    return data.slice(index, index + 5);
  };

  return { data, getWords, saveSounds };
}

const dictionary = initialize("Swedish_Kelly_words.csv");

module.exports = dictionary;
