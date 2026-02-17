module.exports = {
  config: {
    name: "alien",
    version: "1.4",
    author: "Hussain",
    description: "👽 Alien Adventure | Bank Connected, Cute & Fancy",
    category: "Game",
    guide: "{p}alien <bet>"
  },

  onStart: async function ({ event, message, usersData, args }) {
    try {
      const uid = event.senderID;
      if (!uid) return message.reply("❌ User ID not found.");

      // Load user
      let user = await usersData.get(uid) || {};
      
      // Bank sync
      if (user.bank === undefined || user.bank === null) {
        if (user.money !== undefined) user.bank = user.money;
        else if (user.data?.bank !== undefined) user.bank = user.data.bank;
        else user.bank = 0;
      }

      const bet = parseInt(args[0]);
      if (isNaN(bet) || bet <= 0) 
        return message.reply("⚠ Enter a valid bet amount 💫");

      if (user.bank < bet) {
        return message.reply(
`❌ 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗯𝗮𝗹𝗮𝗻𝗰𝗲! 💸
🏦 𝗬𝗼𝘂𝗿 𝗕𝗮𝗻𝗸: ${user.bank.toLocaleString()} 💰`);
      }

      // Launch message
      message.reply("👽✨ Launching your Alien Adventure... 🚀\n⏳ Please wait 5 seconds...");

      await new Promise(res => setTimeout(res, 5000));

      const winChance = Math.random() < 0.4; // 40% win
      let amountChange = 0;
      let resultText = "";

      if (winChance) {
        amountChange = Math.floor(bet * (Math.random() * 2 + 1)); // 1x to 3x
        user.bank += amountChange;

        resultText =
`📦 𝗔𝗹𝗶𝗲𝗻 𝗠𝗶𝘀𝘀𝗶𝗼𝗻 👾
━━━━━━━━━━━━━━
🌌 𝗠𝗶𝘀𝘀𝗶𝗼𝗻 𝗦𝘂𝗰𝗰𝗲𝘀𝘀 ✨
💫 You Earned: +${amountChange.toLocaleString()} 💎
🏦 Bank Balance: ${user.bank.toLocaleString()} 🛸
━━━━━━━━━━━━━━
🛸 Cute Alien vibes! 🌟👽💫`;

      } else {
        amountChange = bet;
        user.bank -= amountChange;

        resultText =
`📦 𝗔𝗹𝗶𝗲𝗻 𝗠𝗶𝘀𝘀𝗶𝗼𝗻 👾
━━━━━━━━━━━━━━
☠ Mission Failed 💔
💸 Lost: -${amountChange.toLocaleString()} 💎
🏦 Bank Balance: ${user.bank.toLocaleString()} 🛸
━━━━━━━━━━━━━━
👾 Don't worry, try again! 💫✨`;
      }

      // Save updated bank balance
      await usersData.set(uid, user);
      return message.reply(resultText);

    } catch (err) {
      console.error("Alien CMD Error:", err);
      return message.reply("❌ An error occurred. Try again later.");
    }
  }
};
