'use strict';

const { SlashCommand } = require('slash-create');
const fabric = require('../fabric/network.js');
const { registerGroup } = require('../evote/group.js');
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
      name: 'elections',
      description: 'Get the current elections in this group.',
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    try {
      const networkObj = await fabric.connectToNetwork(appAdmin);
      const voterId = `voter${ctx.member.id}@discord`;
      const groupId = `group${ctx.guildID}@discord`;
      console.log(`creating new group for ${voterId}: ${groupId}`);
      const invokeResponse = await registerGroup(networkObj, { ownerId: voterId, groupName: groupId });
      console.log('after invoke', invokeResponse);
      if (invokeResponse.error) {
        return invokeResponse.error;
      } else {
        return `Group ${groupId} has been created`;
      }
    } catch (err) {
      return err;
    }
  }
};