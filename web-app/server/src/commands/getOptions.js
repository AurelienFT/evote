'use strict';

const { SlashCommand, CommandOptionType } = require('slash-create');
const fabric = require('../fabric/network.js');
const { queryByKey } = require('../evote/util.js');
const path = require('path');
const fs = require('fs');

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

module.exports = class CreateGroupCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'electionchoices',
      description: 'Get the choices for a given election.',
      options: [{
        type: CommandOptionType.STRING,
        name: 'election',
        description: 'The election id you want to obtain the options for'
      }]
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    try {
      const networkObj = await fabric.connectToNetwork(appAdmin);
      const voterId = `voter${ctx.member.id}@discord`;
      const groupId = `group${ctx.guildID}@discord`;
      console.log(`creating new group for ${voterId}: ${groupId}`);
      const invokeResponse = await queryByKey(networkObj, ctx.options.election);
      const res = JSON.parse(invokeResponse);
      console.log('after invoke', JSON.parse(invokeResponse));
      let ret = 'The options for this election are:\n';
      for (let i of res.items) {
        const networkObj = await fabric.connectToNetwork(appAdmin);
        const invokeResponse = await queryByKey(networkObj, i);
        const res = JSON.parse(invokeResponse);
        ret += `${i}: ${res.description}\n`;
      }
      return ret;
    } catch (err) {
      return err;
    }
  }
};