 const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const request = require('request');

module.exports.config = {
  name: "jail",
  version: "8.0",
  author: "MOHAMMAD AKASH",
  countDown: 10,
  role: 0,
  shortDescription: "Wanted with thin bars",
  category: "fun",
  guide: { en: "{p}jail @tag / reply" }
};

module.exports.onStart = async function ({ api, event, args, usersData }) {
  const { threadID, messageID, mentions, messageReply } = event;

  let uid;
  let name = "Wanted";

  // ===== MERGED FIX (reply > mention > self) =====
  if (messageReply && messageReply.senderID) {
    uid = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  } else {
    uid = event.senderID;
  }

  try {
    name = await usersData.getName(uid);

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const avatarCache = path.join(cacheDir, `wanted_avatar_${uid}.jpg`);

    // 🔥 ACCESS TOKEN RESTORED (PFP FIX)
    const imageUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const generateWanted = async () => {
      try {
        const wantedPath = await generateThinBarsImage(avatarCache, name);
        api.sendMessage({
          body: `@${name} WANTED! 🔒 Locked Up! (Clear view)`,
          mentions: [{ tag: name, id: uid }],
          attachment: fs.createReadStream(wantedPath)
        }, threadID, messageID);

        setTimeout(() => {
          [avatarCache, wantedPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
        }, 10000);
      } catch {
        api.sendMessage("⚠️ Poster error!", threadID, messageID);
      }
    };

    request(encodeURI(imageUrl))
      .pipe(fs.createWriteStream(avatarCache))
      .on("close", () => {
        if (fs.statSync(avatarCache).size < 10000) {
          request("https://i.imgur.com/8Q2Z3tI.png")
            .pipe(fs.createWriteStream(avatarCache))
            .on("close", generateWanted);
        } else {
          generateWanted();
        }
      })
      .on("error", () => {
        request("https://i.imgur.com/8Q2Z3tI.png")
          .pipe(fs.createWriteStream(avatarCache))
          .on("close", generateWanted);
      });

  } catch (error) {
    console.error("Wanted Error:", error);
    api.sendMessage("⚠️ Can't create! Using default.", threadID, messageID);
  }
};

// === Thin Bars + Clear Pic ===
async function generateThinBarsImage(avatarPath, name) {
  const avatar = await loadImage(avatarPath);
  const width = 600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  ctx.font = 'bold 100px Arial';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#991b1b';
  ctx.shadowBlur = 20;
  ctx.fillText('WANTED', width / 2, 120);
  ctx.shadowBlur = 0;

  const centerX = width / 2;
  const centerY = height / 2 + 20;
  const radius = 200;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
  ctx.restore();

  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';

  const barCount = 8;
  const barSpacing = width / (barCount + 1);
  for (let i = 1; i <= barCount; i++) {
    const x = i * barSpacing;
    ctx.beginPath();
    ctx.moveTo(x, 180);
    ctx.lineTo(x, height - 180);
    ctx.stroke();
  }

  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(barSpacing, 260);
  ctx.lineTo(width - barSpacing, 260);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(barSpacing, height - 260);
  ctx.lineTo(width - barSpacing, height - 260);
  ctx.stroke();

  ctx.globalAlpha = 1;

  ctx.font = 'italic 50px "Segoe UI"';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#60a5fa';
  ctx.shadowBlur = 20;
  ctx.fillText('Locked Up!', width / 2, height - 100);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(name.toUpperCase(), width / 2, height - 50);

  const wantedPath = path.join(__dirname, 'cache', `wanted_thin_${Date.now()}.png`);
  fs.writeFileSync(wantedPath, canvas.toBuffer());
  return wantedPath;
          }
