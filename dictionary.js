const fs = require("fs");
const fsExt = require("fs-extra");
const csv = require("@fast-csv/parse");
const gTTS = require("gtts");
const N_CARDS = 10;
const MAX_REPS = 4;
const WEIGHT_FACTOR = [1, 2, 3, 5, 8];

function initialize(filePath) {
  const data = [];
  fs.createReadStream(filePath)
    .pipe(csv.parse())
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", (rowCount) => {
      console.log(`Parsed ${rowCount} rows`);
      // Remove first row (title row)
      data.shift();
    });

  // Initialize sound
  const saveSounds = (words) => {
    // Remove old sounds first
    fsExt.emptyDirSync("./public/sounds/sv");
    fsExt.emptyDirSync("./public/sounds/en");

    words.forEach((word, index) => {
      // Order: Abs Index,Grammar, Swedish, English, Type, Examples, Swedish (full), Swedish (full w/o brackets)
      //           0        1        2         3      4       5            6              7
      let swedishWord = word[2];
      if (word[1]) {
        // att, en, ett
        word.push(`(${word[1]}) ${swedishWord}`);
        word.push(`${word[1]} ${swedishWord}`);
      } else {
        word.push(swedishWord);
        word.push(swedishWord);
      }
      const gttsSv = new gTTS(word[7], "sv");
      gttsSv.save(`./public/sounds/sv/${word[7]}.mp3`, function (err) {
        if (err) throw new Error(err);
      });
      const gttsEn = new gTTS(word[3], "en");
      gttsEn.save(`./public/sounds/en/${word[3]}.mp3`, function (err) {
        if (err) throw new Error(err);
      });
    });
  };

  const getWords = (progress) => {
    if (!progress) return [];
    const lastWordIndex = Object.keys(progress)
      .map((str) => Number(str))
      .reduce((max, current) => {
        if (current > max) return current;
      });

    // Building an index table to pick words randomly but also based on weight
    // E.g. progress = {1: 4, 3: 2} --> words[3] has been studied twice and thus
    // will be more likely to be picked than words[1].
    const table = [];
    for (let i = 0; i < lastWordIndex + N_CARDS; i++) {
      const repsToGo = progress[i] ? MAX_REPS - progress[i] : MAX_REPS;
      const weight = WEIGHT_FACTOR[repsToGo];
      for (let j = 0; j < weight; j++) table.push(i);
    }

    const words = [];
    const indeces = [];
    while (words.length < N_CARDS) {
      const index = table[Math.floor(Math.random() * table.length)];
      if (!indeces.includes(index)) {
        indeces.push(index);
        words.push([index, ...data[index]]);
      }
    }
    return words;
  };

  return { data, getWords, saveSounds };
}

const dictionary = initialize("Swedish_Kelly_words.csv");

module.exports = { dictionary, N_CARDS };
