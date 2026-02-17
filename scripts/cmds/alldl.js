const axios = require("axios");
const fs = require("fs-extra");

const config = {
  name: "alldl",
  version: "2.0",
  author: "mahi",
  credits: "mahi",
  description: "Auto download video from tiktok, facebook, Instagram, YouTube, and more",
  category: "media",
  commandCategory: "media",
  usePrefix: true,
  prefix: true,
  dependencies: {
    "fs-extra": "",
  },
};

const onStart = () => {};
const onChat = async ({ api, event }) => {
  let mahi = event.body ? event.body : "";
  try {
    if (
      mahi.startsWith("https://vt.tiktok.com") ||
      mahi.startsWith("https://www.tiktok.com/") ||
      mahi.startsWith("https://www.facebook.com") ||
      mahi.startsWith("https://www.instagram.com/") ||
      mahi.startsWith("https://youtu.be/") ||
      mahi.startsWith("https://youtube.com/") ||
      mahi.startsWith("https://x.com/") ||
      mahi.startsWith("https://www.instagram.com/p/") ||
      mahi.startsWith("https://pin.it/") ||
      mahi.startsWith("https://twitter.com/") ||
      mahi.startsWith("https://vm.tiktok.com") ||
      mahi.startsWith("https://fb.watch")
    ) {
      api.setMessageReaction("⌛", event.messageID, {}, true);
      const w = await api.sendMessage("Procesando tu solicitud... ⏳", event.threadID);
      
      const apiEndpoints = [
        "https://www.dur4nto-yeager.rf.gd/api/alldl",
        "https://www.dur4nto-yeager.rf.gd/api/alldl2", 
        "https://www.dur4nto-yeager.rf.gd/api/alldl3"
      ];
      
      let response = null;
      let d = null;
      let success = false;
      
      for (const endpoint of apiEndpoints) {
        try {
          response = await axios.get(`${endpoint}?url=${encodeURIComponent(mahi)}`, {
            timeout: 10000
          });
          
          if (response.data && response.data.result) {
            d = response.data;
            success = true;
            break;
          }
        } catch (apiErr) {
          continue;
        }
      }
      
      if (!success) {
        throw new Error("Todas las API fallaron");
      }
      
      let ex = ".mp4";
      let cp = "¡Tu video está listo! 📹";
      
      if (d.result) {
        if (d.result.includes(".jpg") || d.result.endsWith(".jpg")) {
          ex = ".jpg";
          cp = "¡Tu foto está lista! 📸";
        } else if (d.result.includes(".png") || d.result.endsWith(".png")) {
          ex = ".png";
          cp = "¡Tu foto está lista! 📸";
        } else if (d.result.includes(".jpeg") || d.result.endsWith(".jpeg")) {
          ex = ".jpeg";
          cp = "¡Tu foto está lista! 📸";
        }
      }
      
      if (d.caption) {
        cp = d.caption;
      } else if (d.cp) {
        cp = d.cp;
      } else if (d.title) {
        cp = d.title;
      } else if (d.description) {
        cp = d.description;
      }
      
      const path = __dirname + `/cache/video_${Date.now()}${ex}`;
      
      const mediaResponse = await axios.get(d.result, {
        responseType: "arraybuffer",
        timeout: 30000
      });
      
      await fs.writeFile(path, Buffer.from(mediaResponse.data));
      
      let tinyUrl = d.result;
      try {
        const tinyUrlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(d.result)}`);
        if (tinyUrlResponse.data && !tinyUrlResponse.data.includes("Error")) {
          tinyUrl = tinyUrlResponse.data;
        }
      } catch (tinyErr) {
      }
      
      api.setMessageReaction("✅", event.messageID, {}, true);
      await api.unsendMessage(w.messageID);
      
      await api.sendMessage({
        body: `${cp}\n🔗 Enlace: ${tinyUrl}`,
        attachment: fs.createReadStream(path)
      }, event.threadID, (err) => {
        if (err) console.error("Send error:", err);
        fs.unlinkSync(path);
      }, event.messageID);
      
    }
  } catch (err) {
    api.setMessageReaction("❌", event.messageID, {}, true);
    console.error("Main error:", err);
    
    try {
      if (w && w.messageID) {
        await api.unsendMessage(w.messageID);
      }
    } catch (e) {}
    
    const errorMsg = err.message || "Error desconocido";
    await api.sendMessage(`❌ Lo siento bebé: ${errorMsg}\nPor favor, intenta con un enlace diferente.`, event.threadID, event.messageID);
  }
};

module.exports = {
  config,
  onChat,
  onStart,
  run: onStart,
  handleEvent: onChat,
};
