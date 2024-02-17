"use strict";

const EventEmitter = require("events");
const util = require("util");
const grpc = require("@grpc/grpc-js");

const EmbeddedAssistantClient = require("./embedded-assistant.js").EmbeddedAssistantClient;

const ASSISTANT_API_ENDPOINT = "embeddedassistant.googleapis.com";

function AssistantSDK (client) {
  const sslCreds = grpc.credentials.createSsl();
  const callCreds = grpc.credentials.createFromGoogleCredential(client);
  const combinedCreds = grpc.credentials.combineChannelCredentials(sslCreds, callCreds);

  return (new EmbeddedAssistantClient(ASSISTANT_API_ENDPOINT, combinedCreds));
}

util.inherits(AssistantSDK, EventEmitter);
module.exports = AssistantSDK;
