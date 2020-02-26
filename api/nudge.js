const { createNudges } = require("../lib/controllers/pr-nudge-controller");
const {
  postMessage,
  triggerWebhook
} = require("../lib/services/slack-service");
const { getNum } = require("../lib/utils/param-utils");

//-- Module Constants
const NUDGE_LIMIT = 48;
const GITHUB_REPO_FETCH_PARAMS = JSON.parse(
  process.env.GITHUB_REPO_FETCH_PARAMS
);
const GITHUB_TO_SLACK_ID_MAP = JSON.parse(process.env.GITHUB_TO_SLACK_ID_MAP);

module.exports = async (req, res) => {
  const { response_url, text } = req.body;

  const nudges = await createNudges(
    GITHUB_REPO_FETCH_PARAMS,
    GITHUB_TO_SLACK_ID_MAP,
    getNum(text, NUDGE_LIMIT)
  );

  if (nudges.length === 0) {
    res.json({ text: "No nudges needed!" });
    return;
  }

  await Promise.all(
    nudges.map(({ to, message }) =>
      postMessage(to, message).then(() =>
        triggerWebhook(response_url, { text: `Nudged <@${to}>` })
      )
    )
  );

  res.json({ text: `${nudges.length} Nudges sent!` });
};
