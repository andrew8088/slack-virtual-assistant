const { random } = require("../utils/random-utils");
const responses = require("../sassy-responses");
const { postMessage } = require("../services/slack-service");

//-- Module Constants
const SUBSTRINGS = ["wfh", "working from home", "working remotely"];

//-- Module Functions
function matches(evt) {
  return (
    includesSubstring(evt.text) &&
    shouldResponse() &&
    IS_TEST_MESSAGE(evt.channel)
  );
}

async function handle(evt) {
  await postMessage(evt.channel, undefined, {
    thread_ts: evt.ts,
    text: getRandomResponse()
  });
}

module.exports = {
  matches,
  handle
};

//-- Helper Functions
function includesSubstring(text) {
  for (let substring of SUBSTRINGS) {
    if (text.toLowerCase().includes(substring)) {
      return true;
    }
  }
  return false;
}

function shouldResponse() {
  return !(random(0, 10) % 2);
}

function getRandomResponse() {
  const idx = random(0, RESPONSES.length - 1);
  return RESPONSES[idx];
}

// guard
function IS_TEST_MESSAGE(channel) {
  const jeffChannel = "CTG1ANCUA";
  return channel === jeffChannel;
}

const RESPONSES = [
  "Okay",
  '"W" F "H"',
  "Same here, I just cannot with you-know-who today",
  "#WFHWednesdays",
  "#WFHFridays",
  "Approved",
  "Approved (this time)",
  "More like NO Train, amirite? #metrostinx",
  "Good call, it's plank day"
];
