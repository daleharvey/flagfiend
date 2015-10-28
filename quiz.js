'use strict';

var FLAG_DATA;

var currentFlag;
var streak;
var flags;
var recordStreak = parseInt(localStorage.record, 10) || 0;

var waitingForAnswer = false;
var RESULT_PAUSE = 1500;

function startGame() {
  streak = 0;
  currentFlag = null;
  flags = shuffle(JSON.parse(JSON.stringify(FLAG_DATA)));
  startTurn();
};

function startTurn() {

  currentFlag = flags.shift();

  document.getElementById('flagDisplay').style.backgroundImage =
    'url(./data/' + currentFlag.cca3.toLowerCase() + '.svg)';

  entryText.focus();
  waitingForAnswer = true;
};

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
}

function compare(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

function shuffle(array) {
  var counter = array.length, temp, index;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

function showDialog(css, msg) {
  return new Promise(function(resolve) {
    var dialog = document.querySelector(css);
    var form = dialog.querySelector('form');
    var span = dialog.querySelector('span');

    span.innerHTML = msg;
    dialog.style.display = 'block';

    setTimeout(function() {
      dialog.style.display = 'none';
      resolve();
    }, RESULT_PAUSE);
  });
}

function checkAnswer(answer, currentFlag) {

  var correct = compare(answer, currentFlag.name.common) ||
    compare(answer, currentFlag.name.official);

  if (!correct) {
    return {
      fun: startGame,
      dialogClass: '.false',
      msg: 'The correct answer is ' + currentFlag.name.common
    }
  }

  streak++;
  if (streak > recordStreak) {
    localStorage['record'] = recordStreak = streak;
  }

  return {
    fun: startTurn,
    dialogClass: '.correct',
    msg: 'Correct! The capital of ' + currentFlag.name.common + ' is ' +
      currentFlag.capital + '.<br /<br /><br />' +
      'Current: ' + streak + '<br />' +
      'Record: ' + recordStreak
  };
}

function submit(e) {

  e.preventDefault();

  // Little nasty, when we are showing the results we want to not
  // lets the use accidently submit (by pressing return twice).
  // We dont want to ignore blank submissions (they are 'I dont know')
  // and we cant stop listening for form submissions since then
  // the form will submit (and page reload)
  if (!waitingForAnswer) { return; }
  waitingForAnswer = false;

  var value = entryText.value.trim();
  entryText.value = '';

  var check = checkAnswer(value, currentFlag);
  showDialog(check.dialogClass, check.msg).then(check.fun);
}

// Start listening straight away so we can avoid page refreshes
// when accidently submitting form
document.getElementById('entryForm').addEventListener('submit', submit);

getJSON('./countries.json').then(function(data) {
  // Should probably preprocess the json to do this
  FLAG_DATA = data.filter(function(flag) { return !flag.hidden; });
  startGame();
});
