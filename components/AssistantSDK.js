'use strict';

const EventEmitter = require('events');
const util = require('util');

const Assistant = require('./AssistantSDK/assistant');
const Auth = require('./AssistantSDK/auth');
const Conversation = require('./AssistantSDK/conversation');

function GoogleAssistant(authConfig, callback) {
  if (authConfig === undefined) {
    const error = new Error('Missing auth config object!');
    this.emit('error', error);
    if (callback) callback(error);
    return;
  }

  let assistant;

  const assistantReady = () => {
    if (assistant) {
      this.emit('ready', assistant);
      if (callback) callback(assistant);
    }
  };

  if (authConfig.oauth2Client) {
    // we are passing in a client that is already authed with Google
    assistant = new AssistantSDK(authConfig.oauth2Client);
    process.nextTick(assistantReady);
  } else {
    // we need to auth with Google right out of the gate
    const auth = new Auth(authConfig);

    auth.on('ready', (client) => {
      assistant = new Assistant(client);
      assistantReady();
    });
  }

  this.start = (conversationConfig, callback) => {
    if (assistant === undefined) {
      const error = new Error('Tried calling start() before the ready event!');
      this.emit('error', error);
      if (callback) callback(error);
      return;
    }

    const conversation = new Conversation(assistant, conversationConfig);
    this.emit('started', conversation);
    if (callback) callback(conversation);
  };

  return this;
}

util.inherits(GoogleAssistant, EventEmitter);
module.exports = GoogleAssistant;
