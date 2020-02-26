const {
  handleEvent
} = require("../lib/controllers/event-subscription-controller");

module.exports = async (req, res) => {
  const { body } = req;

  // For Slack URL verification
  if (body.type === "url_verification") {
    return res.status(200).json({
      challenge: body.challenge
    });
  }

  if (body.type !== "event_callback") {
    return res.status(200).send("OK");
  }

  const success = await handleEvent(body.event);

  if (success) {
    return res.status(200).send("OK");
  } else {
    return res.status(200).send("OK"); // for now?
  }
};
