'use strict';

const EventEmitter = require('events');
const util = require('util');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { mkdirp } = require('mkdirp');
const { OAuth2Client } = require('google-auth-library')

function Auth(config) {
  if (config === undefined) config = {};

  // make sure we have a key file to read from
  if (config.keyFilePath === undefined) {
    throw new Error('Missing "keyFilePath" from config (should be where your JSON file is)');
  }

  if (config.savedTokensPath === undefined) {
    throw new Error('Missing "savedTokensPath" from config (this is where your OAuth2 access tokens will be saved)');
  }

  const keyData = require(config.keyFilePath);
  const key = keyData.installed || keyData.web;

  // check credentials
  if (!key.redirect_uris) {
   throw new Error('Bad credentials missing: redirect_uris');
  }

  if (!key.client_id) {
   throw new Error('Bad credentials missing: client_id');
  }

  if (!key.client_secret) {
   throw new Error('Bad credentials missing: client_secret');
  }

  const oauthClient = new OAuth2Client(key.client_id, key.client_secret, key.redirect_uris[0]);
  let tokens;

  const saveTokens = () => {
    oauthClient.setCredentials(tokens);
    this.emit('ready', oauthClient);

    // save them for later
    mkdirp(path.dirname(config.savedTokensPath))
      .then(() => {
        fs.writeFile(config.savedTokensPath, JSON.stringify(tokens), () => {});
      })
      .catch((error) => {
        console.log('Error saving tokens:', error.message);
      });
  };

  const getTokens = async () => {
    const open = await loadOpen()

    const url = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/assistant-sdk-prototype'],
      prompt: 'consent'
    });

    // open the URL
    console.log('Opening OAuth URL. Return here with your code.\n');
    open(url).catch(() => {
      console.log('Failed to automatically open the URL\n');
    });
    console.log("If your browser will not open, you can copy/paste this URL:\n", url);

    // if tokenInput is configured
    // run the tokenInput function to accept the token code
    if (typeof config.tokenInput === 'function') {
      config.tokenInput(processTokens);
      return;
    }

    // create the interface to accept the code
    const reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    reader.question('Paste your code: ', processTokens);
  };

  const processTokens = (oauthCode) => {
    if (!oauthCode) {
      console.error("\nError: No code given")
      process.exit(-1);
    }

    // get our tokens to save
    oauthClient.getToken(oauthCode, (error, tkns) => {
      // if we have an error, print it and kill the process
      if (error) {
        console.error('\nError getting tokens:', error);
        process.exit(-1);
      }

      // if we didn't have an error, save the tokens
      tokens = tkns;
      saveTokens();
    });
  };

  // if the tokens are already saved, we can skip having to get the code for now
  process.nextTick(() => {
    if (config.savedTokensPath) {
      try {
        const tokensFile = fs.readFileSync(config.savedTokensPath);
        tokens = JSON.parse(tokensFile);
      } catch (error) {
        // we need to get the tokens
        getTokens();
      } finally {
        if (tokens !== undefined) saveTokens();
      }
    }
  });

  return this;
};

// import Open library and use default function only
async function loadOpen() {
  const loaded = await import('open');
  return loaded.default;
};

util.inherits(Auth, EventEmitter);
module.exports = Auth;
