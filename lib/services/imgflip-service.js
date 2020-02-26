const request = require("request-promise");

const IMGFLIP_USERNAME = process.env.IMGFLIP_USERNAME;
const IMGFLIP_PASSWORD = process.env.IMGFLIP_PASSWORD;

async function getJeffMemeImageUrl(text0, text1) {
  const url = "https://api.imgflip.com/caption_image";
  const options = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    form: {
      template_id: "69051569",
      username: IMGFLIP_USERNAME,
      password: IMGFLIP_PASSWORD,
      text0,
      text1
    }
  };

  return request.post(url, options).then(res => {
    const json = JSON.parse(res);
    if (json.success) {
      return json.data.url;
    } else {
      console.error(json);
    }
  });
}

module.exports = {
  getJeffMemeImageUrl
};
