'use strict';

var FLAG_DATA;

var currentFlag;
var streak;
var flags;
var recordStreak = parseInt(localStorage.record, 10) || 0;

var recordStreakDisplay = document.getElementById('recordStreak');
var streakDisplay = document.getElementById('streak');
var flagDisplay = document.getElementById('flagDisplay');
var entryForm = document.getElementById('entryForm');

function go() {
  currentFlag = flags.shift();
  flagDisplay.style.backgroundImage =
    'url(./data/' + currentFlag.cca3.toLowerCase() + '.svg)';
};

function start() {
  streak = 0;
  streakDisplay.textContent = streak;
  recordStreakDisplay.textContent = recordStreak;
  flags = shuffle(JSON.parse(JSON.stringify(FLAG_DATA)));
  go();
};

function right() {
  streak++;
  streakDisplay.textContent = streak;
  if (streak > recordStreak) {
    localStorage['record'] = recordStreak = streak;
    recordStreakDisplay.textContent = recordStreak;
  }
  go();
};

function wrong() {
  currentFlag = null;
  start();
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
    var btn = dialog.querySelector('button');
    var span = dialog.querySelector('span');
    btn.addEventListener('click', function tmp() {
      btn.removeEventListener('click', tmp);
      dialog.style.display = 'none';
      resolve();
    });
    span.textContent = msg;
    dialog.style.display = 'block';
  });
}

entryForm.addEventListener('submit', function(e) {
  e.preventDefault();

  var value = entryText.value;
  entryText.value = '';

  var isRight = compare(value, currentFlag.name.common) ||
    compare(value, currentFlag.name.official);

  var dialogClass = isRight ? '.correct' : '.false';
  var msg = isRight ?
    'The capital of ' + currentFlag.name.common + ' is ' + currentFlag.capital + '.' :
    'The correct answer is ' + currentFlag.name.common;

  showDialog(dialogClass, msg).then(function() {
    if (isRight) {
      right();
    } else {
      wrong();
    }
  });
});

getJSON('./countries.json').then(function(data) {
  FLAG_DATA = data;
  start();
});
