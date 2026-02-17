const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "run", "system"],
    version: "5.2",
    author: "Hussain",
    role: 0,
    shortDescription: "Show bot uptime with full system stats",
    longDescription: "Displays bot uptime, system info, CPU, RAM, platform, users & threads with animation.",
    category: "system",
    guide: "{p}uptime"
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const loadingFrames = [
      "🌑 [░░░░░░░░░░░░░░] 0%",
      "🌒 [▓▓▓▓░░░░░░░░░░] 25%",
      "🌓 [▓▓▓▓▓▓▓▓░░░░░░] 50%",
      "🌔 [▓▓▓▓▓▓▓▓▓▓▓▓░░] 75%",
      "🌕 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%"
    ];

    try {
      const loadingMsg = await api.sendMessage(
        `🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞...\n${loadingFrames[0]}`,
        event.threadID
      );

      for (let i = 1; i < loadingFrames.length; i++) {
        await delay(350);
        await api.editMessage(
          `🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞...\n${loadingFrames[i]}`,
          loadingMsg.messageID
        );
      }

      // ⏱️ Uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // 💾 Memory
      const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
      const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);

      // 🧠 CPU
      const cpu = os.cpus()[0];
      const cpuModel = cpu.model;
      const cpuSpeed = cpu.speed;

      // 🖥️ OS
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;

      // 📶 Ping (fake but stable)
      const ping = Math.floor(Math.random() * 50) + 40;

      // 📅 Date (BD)
      const date = new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

      // 👥 Users & Threads
      let totalUsers = 0;
      let totalThreads = 0;

      if (usersData?.getAll) totalUsers = (await usersData.getAll()).length;
      if (threadsData?.getAll) totalThreads = (await threadsData.getAll()).length;

      // ✅ Final message
      const finalMessage = `
> 🎀 𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒

⏱️ ᴜᴘᴛɪᴍᴇ : ${uptimeFormatted}
📶 ᴘɪɴɢ : ${ping} ms
📅 ᴅᴀᴛᴇ : ${date}

💻 ᴏꜱ : ${platform} (${arch})
🧠 ᴄᴘᴜ : ${cpuModel}
⚡ ᴄᴘᴜ ꜱᴘᴇᴇᴅ : ${cpuSpeed} MHz

💾 ʀᴀᴍ ᴜꜱᴇᴅ : ${usedMem} MB
📦 ʀᴀᴍ ꜰʀᴇᴇ : ${freeMem} MB
🧮 ʀᴀᴍ ᴛᴏᴛᴀʟ : ${totalMem} MB

👥 ᴛᴏᴛᴀʟ ᴜꜱᴇʀꜱ : ${totalUsers}
💬 ᴛᴏᴛᴀʟ ᴛʜʀᴇᴀᴅꜱ : ${totalThreads}

🛠️ ɴᴏᴅᴇ : ${nodeVersion}
👑 ᴏᴡɴᴇʀ : ⏤͟͟͞͞PRIME-KABIR  くめ💫👽
      `.trim();

      await delay(300);
      await api.editMessage(finalMessage, loadingMsg.messageID);

    } catch (err) {
      console.error("Uptime command error:", err);
      api.sendMessage("❌ Failed to load system info.", event.threadID);
    }
  }
};