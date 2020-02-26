const request = require("request-promise");

//-- Module Functions

function postMessage(channel, blocks, options) {
  return post("chat.postMessage", {
    channel,
    blocks,
    ...options
  });
}

function triggerWebhook(url, body) {
  const options = {
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  return request.post(url, options);
}

let MEMBER_MAP = null;

async function getMember(memberName) {
  if (!MEMBER_MAP || !MEMBER_MAP[memberName]) {
    MEMBER_MAP = await createMemberMap();
  }

  return MEMBER_MAP[memberName] || null;
}

module.exports = {
  getMember,
  postMessage,
  triggerWebhook
};

//-- Helper Functions

function post(endpoint, body) {
  const url = `https://slack.com/api/${endpoint}`;
  const options = {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  return request.post(url, options);
}

async function createMemberMap() {
  const res = await post("users.list", {});
  let members = [];
  try {
    members = JSON.parse(res).members;
  } catch (err) {
    console.error(err);
  }

  const memberMap = {};

  members.forEach(member => {
    if (!member.deleted) {
      memberMap[member.name.toLowerCase()] = {
        id: member.id,
        name: member.profile.display_name || member.profile.real_name,
        realName: member.profile.real_name,
        avatar: member.profile.image_24,
        full_profile: member.profile
      };
    }
  });

  return memberMap;
}
