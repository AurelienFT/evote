'use strict';

const { SlashCommand } = require('slash-create');
const fabric = require('../fabric/network.js');
const { registerVoter } = require('../evote/voter.js');
const path = require('path');
const fs = require('fs');

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

module.exports = class RegisterCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'register',
      description: 'Creates an account.'
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    try {
      const networkObj = await fabric.connectToNetwork(appAdmin);
      const voterId = `voter${ctx.member.id}@discord`;
      console.log('registering ' + voterId);
      const invokeResponse = await registerVoter(networkObj, { voterId });
      console.log('after invoke', invokeResponse);
      if (invokeResponse.error) {
        return invokeResponse.error;
      } else {
        return `Voter ${voterId} has been created`;
      }
    } catch (err) {
      return err;
    }
  }
};