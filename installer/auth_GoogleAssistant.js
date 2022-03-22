//Original:https://github.com/endoplasmic/google-assistant/blob/master/examples/console-input.js

'use strict';

const readline = require('readline');
const path = require('path');
const GoogleAssistant = require('@bugsounet/google-assistant');

const config = {
  auth: {
    keyFilePath: path.resolve(__dirname, '../credentials.json'),
    savedTokensPath: path.resolve(__dirname, '../tokenGA.json'), // where you want the tokens to be saved
  },
  conversation: {
    lang: 'en-US', // defaults to en-US, but try other ones, it's fun!
  },
};

const startConversation = (conversation) => {
  // setup the conversation
  conversation
    .on('response', text => console.log('Assistant Response:', text))
    .on('ended', (error, continueConversation) => {
      if (error) {
        console.log('Conversation Ended Error:', error);
      } else if (continueConversation) {
        promptForInput();
      } else {
        console.log('Conversation Complete');
        conversation.end();
      }
    })
    // catch any errors
    .on('error', (error) => {
      console.log('Conversation Error:', error);
    });
};

const promptForInput = () => {
  // type what you want to ask the assistant
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Type your request: ', (request) => {
    // start the conversation
    config.conversation.textQuery = request;
    assistant.start(config.conversation, startConversation);

    rl.close();
  });
};

try {
  this.assistant = new GoogleAssistant(config.auth);
} catch (error) {
  return console.log(error.toString());
}

this.assistant
  .on('ready', promptForInput)
  .on('error', (error) => {
    console.log('Assistant Error:', error);
  });
