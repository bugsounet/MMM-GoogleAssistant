//Original:https://github.com/endoplasmic/google-assistant/blob/master/examples/console-input.js

'use strict';

const path = require('path');
const GoogleAssistant = require('@bugsounet/google-assistant');

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
    .on('response', text => console.log('[GA] Assistant Response:', text))
    .on('ended', (error, continueConversation) => {
      if (error) {
        console.log('[GA] Conversation Ended Error:', error);
        process.exit()
      } else {
        console.log('[GA] Conversation Complete\n');
        conversation.end();
        console.log("[GA] Testing Conversation ended.")
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
    console.log("[GA] Testing Conversation start...\n")
    console.log("[GA] Assistant Question: What time is it?")
    config.conversation.textQuery = "What time is it?";
    this.assistant.start(config.conversation, startConversation);
  })
  .on('error', (error) => {
    console.log('[GA] Assistant Error:', error);
  });
