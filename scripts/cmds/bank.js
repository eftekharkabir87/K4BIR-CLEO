module.exports = {
  config: {
    name: "bank",
    aliases: [],
    version: "2.0",
    author: "X Nil | modified by H4SSA1N",
    countDown: 5,
    role: 0,
    description: "Bank system with wallet, bank, loan, etc.",
    category: "economy",
    guide: {
      en:
        "{pn} balance\n" +
        "{pn} deposit <amount>\n" +
        "{pn} withdraw <amount>\n" +
        "{pn} loan\n" +
        "{pn} preloan\n" +
        "{pn} top"
    }
  },

  formatMoney(amount) {
    if (amount === 0) return "0";
    const abs = Math.abs(amount);
    if (abs >= 1e15) return (amount / 1e15).toFixed(2).replace(/\.00$/, "") + "qt";
    if (abs >= 1e12) return (amount / 1e12).toFixed(2).replace(/\.00$/, "") + "treelion";
    if (abs >= 1e9) return (amount / 1e9).toFixed(2).replace(/\.00$/, "") + "bilon";
    if (abs >= 1e6) return (amount / 1e6).toFixed(2).replace(/\.00$/, "") + "milon";
    if (abs >= 1e3) return (amount / 1e3).toFixed(2).replace(/\.00$/, "") + "k";
    return amount.toString();
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const senderID = event.senderID;
      const cmd = args[0]?.toLowerCase();

      if (!cmd) {
        return message.reply(
`╭── 🏦 𝐁𝐀𝐍𝐊 ──╮
• balance
• deposit <amount>
• withdraw <amount>
• loan
• preloan
• top
╰──────────────╯`
        );
      }

      let userData = await usersData.get(senderID);
      if (!userData.data) userData.data = {};
      if (!userData.data.bankdata)
        userData.data.bankdata = { bank: 0, loan: 0 };

      let wallet = userData.money || 0;
      let bankData = userData.data.bankdata;
      const format = this.formatMoney;

      if (cmd === "balance") {
        return message.reply(
`╭── 🏦 𝐁𝐀𝐍𝐊 𝐒𝐔𝐌𝐌𝐀𝐑𝐘 ──╮
💰 Wallet : ${format(wallet)}
🏦 Bank   : ${format(bankData.bank)}
💳 Loan   : ${format(bankData.loan)}
╰────────────────────╯`
        );
      }

      if (cmd === "deposit") {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0)
          return message.reply("❌ Enter a valid deposit amount.");

        if (wallet < amount)
          return message.reply(`❌ Wallet balance: ${format(wallet)}`);

        wallet -= amount;
        bankData.bank += amount;

        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });

        return message.reply(
`╭── ✅ 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 ──╮
➕ Added : ${format(amount)}
🏦 Bank : ${format(bankData.bank)}
💰 Wallet : ${format(wallet)}
╰──────────────╯`
        );
      }

      if (cmd === "withdraw") {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0)
          return message.reply("❌ Enter a valid withdraw amount.");

        if (bankData.bank < amount)
          return message.reply(`❌ Bank balance: ${format(bankData.bank)}`);

        bankData.bank -= amount;
        wallet += amount;

        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });

        return message.reply(
`╭── ✅ 𝐖𝐈𝐓𝐇𝐃𝐑𝐀𝐖 ──╮
➖ Taken : ${format(amount)}
💰 Wallet : ${format(wallet)}
🏦 Bank : ${format(bankData.bank)}
╰──────────────╯`
        );
      }

      if (cmd === "loan") {
        const loanLimit = 1000000;
        if (bankData.loan > 0)
          return message.reply(`⛔ Active loan: ${format(bankData.loan)}`);

        bankData.loan = loanLimit;
        wallet += loanLimit;

        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });

        return message.reply(
`╭── 💳 𝐋𝐎𝐀𝐍 ──╮
✅ Approved
💰 Amount : ${format(loanLimit)}
╰────────────╯`
        );
      }

      if (cmd === "preloan") {
        if (bankData.loan === 0)
          return message.reply("✅ No active loan.");

        if (wallet < bankData.loan)
          return message.reply(`❌ Need ${format(bankData.loan)} to repay.`);

        wallet -= bankData.loan;
        bankData.loan = 0;

        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });

        return message.reply(
`╭── ✅ 𝐋𝐎𝐀𝐍 𝐂𝐋𝐄𝐀𝐑 ──╮
🎉 You are debt free!
╰──────────────────╯`
        );
      }

      if (cmd === "top") {
        const allUsers = await usersData.getAll();
        const topUsers = allUsers
          .filter(u => u?.data?.bankdata?.bank > 0)
          .sort((a, b) => b.data.bankdata.bank - a.data.bankdata.bank)
          .slice(0, 10);

        if (!topUsers.length)
          return message.reply("❌ No bank data found.");

        let msg = "╭── 🏆 𝐓𝐎𝐏 𝐁𝐀𝐍𝐊 ──╮\n";
        for (let i = 0; i < topUsers.length; i++) {
          msg += `${i + 1}. ${topUsers[i].name || "Unknown"} → ${format(topUsers[i].data.bankdata.bank)}\n`;
        }
        msg += "╰──────────────────╯";

        return message.reply(msg);
      }

      return message.reply("❓ Invalid option. Try: balance / deposit / withdraw / loan / preloan / top");

    } catch (e) {
      console.error(e);
      return message.reply("❌ Bank error. Try again later.");
    }
  }
};