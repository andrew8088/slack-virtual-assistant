const { postMessage, getMember } = require("../lib/services/slack-service");
const { splitHandles } = require("../lib/utils/slack-utils");
const {
  createPokeMessage,
  createPokeConfirmationMessage
} = require("../lib/controllers/poke-controller");

module.exports = async (req, res) => {
  const { body } = req;

  const usernames = splitHandles(body.text);

  const members = [];
  for (let username of usernames) {
    try {
      const member = await getMember(username);
      if (!member) continue;
      members.push(member);
      const message = await createPokeMessage(member);
      await postMessage(member.id, message);
    } catch (e) {
      console.log(e);
      console.log(username + "\t");
    }
  }

  res.json({
    blocks: createPokeConfirmationMessage(members)
  });
};
