const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "trash",
    aliases: [],
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "rip [mention-reply-UID]",
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }

    const { threadID, messageID } = event;
    let targetID = null;

    // ✅ reply priority
    if (event.messageReply && event.messageReply.senderID) {
      targetID = event.messageReply.senderID;
    }
    // ✅ mention priority
    else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }
    // ✅ UID support
    else if (args[0]) {
      targetID = args[0];
    }

    if (!targetID) {
      return api.sendMessage(
        "baby, Mention, reply, or provide UID of the target.",
        threadID,
        messageID
      );
    }

    try {
      const url = `${await baseApiUrl()}/api/dig?type=trash&user=${targetID}`;
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `trash_${targetID}.png`);
      fs.writeFileSync(filePath, response.data);

      api.sendMessage(
        {
          body: "🙂😎",
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("🥹 error, contact MahMUD.", threadID, messageID);
    }
  },
};
