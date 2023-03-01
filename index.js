require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(process.env.TOKEN, { polling: true })

const users = {
  "UserId#1111": "UserName1",
}

const files = [
  {
    fileName: "file1",
    locked: ""
  },
  {
    fileName: "file2",
    locked: "UserId#1111"
  }
];

const printFiles = (files) => {
  const str = files.reduce((acc, curr) => {
    return acc + `File: ${curr.fileName}\nLocked by user: ${users[curr.locked]}\n\n`
  }, "")

  return str;
}

// bot.onText(/\/echo (.+)/, (msg, match) => {
// 	const userId = msg.chat.id
// 	const resp = match[1]

// 	bot.sendMessage(userId, resp)
// })

bot.onText(/\/help/, (msg) => {
	const userId = msg.chat.id
	bot.sendMessage(userId, `${process.env.TOKEN}\n/info - get info about all files\n/lock \`fileName\` - add and lock file\n/unlock \`fileName\` - unlock (only your) file`)
})

bot.onText(/\/info/, (msg) => {
	const userId = msg.chat.id
	bot.sendMessage(userId, printFiles(files))
})

bot.onText(/\/lock (.+)/, (msg, match) => {
	const userId = msg.chat.id
	const lockFile = match[1]

  for (const file of files) {
    if (file.fileName === lockFile && file.locked) {
	    return bot.sendMessage(userId, `File ${lockFile} already locked by ${users[file.locked]}`)
    }
  }

  if(!Object.hasOwn(users, userId)) {
    users[userId] = `${msg.chat.first_name} ${msg.chat.last_name}(${msg.chat.username})`
  }

  files.push({fileName: lockFile, locked: userId})

	bot.sendMessage(userId, `Done!\nFile ${lockFile} now locked by you, ${users[userId]}`)
})

bot.onText(/\/unlock (.+)/, (msg, match) => {
	const userId = msg.chat.id
	const unlockFile = match[1]

  for (const file of files) {
    if (file.fileName === unlockFile) {
      if(!file.locked) {
        return bot.sendMessage(userId, `File ${unlockFile} already unlocked`)
      }

      if(file.locked !== userId) {
        return bot.sendMessage(userId, `Access denied!\nFile ${unlockFile} locked by ${users[file.locked]}`)
      } 

      file.locked = ""
	    bot.sendMessage(userId, `Done!\nFile ${unlockFile} unlocked`)
      return
    }
  }

  bot.sendMessage(userId, `File ${unlockFile} wasn't found`)
})
