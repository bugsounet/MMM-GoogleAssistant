'use strict';

const path = require('path');
const GoogleAssistant = require('../components/AssistantSDK');

const config = {
  auth: {
    keyFilePath: path.resolve(__dirname, '../credentials.json'),
    savedTokensPath: path.resolve(__dirname, '../tokenGA.json'),
  },
  conversation: {
    lang: 'en-US',
  },
};

const startConversation = (conversation) => {
  // setup the conversation
  conversation
    .on('ended', (error, continueConversation) => {
      if (error) {
        console.log('[GA] Conversation Ended Error:', error);
        process.exit()
      } else {
        conversation.end();
        console.log("\n[GA] Token created!")
        process.exit()
      }
    })
    // catch any errors
    .on('error', (error) => {
      console.log('[GA] Conversation Error:', error);
      process.exit()
    });
};

try {
  this.assistant = new GoogleAssistant(config.auth);
} catch (error) {
  return console.log("[GA]", error.toString());
}

this.assistant
  .on('ready', () => {
    config.conversation.textQuery = "What time is it?";
    this.assistant.start(config.conversation, startConversation);
  })
  .on('error', (error) => {
    console.log('[GA] Assistant Error:', error);
  });
