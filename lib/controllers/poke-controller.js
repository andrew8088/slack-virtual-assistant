const { getJeffMemeImageUrl } = require("../services/imgflip-service");

//-- Module Functions

async function createPokeMessage(member) {
  const message = "Reply to your slack messages";
  const imageUrl = await getJeffMemeImageUrl(member.name, message);
  const altText = `${member.name}, ${message}`;
  return [
    {
      type: "image",
      title: {
        type: "plain_text",
        text: altText,
        emoji: true
      },
      image_url: imageUrl,
      alt_text: altText
    }
  ];
}

function createPokeConfirmationMessage(members) {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Your passive-aggressive reminder was sent anonymously!"
      }
    },
    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        ...members.map(member => ({
          type: "image",
          image_url: member.avatar,
          alt_text: member.name
        })),
        {
          type: "plain_text",
          emoji: true,
          text: `${members.length} recipients`
        }
      ]
    }
  ];
}

module.exports = { createPokeMessage, createPokeConfirmationMessage };
