'use strict';

const { SlashCommand, CommandOptionType } = require('slash-create');
const fabric = require('../fabric/network.js');
const { addGroupMember } = require('../evote/group.js');
const { queryByObjectType } = require('../evote/util.js');
const path = require('path');
const fs = require('fs');

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

module.exports = class AddMemberCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'addmember',
      description: 'Adds a new voting member.',
      options: [{
        type: CommandOptionType.USER,
        name: 'user',
        description: 'The user you want to add.'
      }]
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    const networkObj = await fabric.connectToNetwork(appAdmin);
    const voterId = `voter${ctx.options.user}@discord`;
    const groupId = `group${ctx.guildID}@discord`;
    console.log(`adding ${voterId} to ${groupId}`);
    const invokeResponse = await queryByObjectType(networkObj, 'group');
    console.log('after invoke', JSON.parse(invokeResponse));
    const groups = JSON.parse(invokeResponse);
    const targetGroup = groups.find((g) => g.Record.name === groupId);
    if (invokeResponse.error) {
      return invokeResponse.error;
    } else {
      let tomorrow = new Date();
      tomorrow.setDate(new Date().getDate() + 1);
      const networkObj = await fabric.connectToNetwork(appAdmin);
      let invokeResponse = await addGroupMember(networkObj, {
        groupId: targetGroup.Key,
        newMemberId: voterId,
        startDate: new Date(),
        endDate: tomorrow
      });
      console.log('after invoke', invokeResponse);
      if (invokeResponse.error) {
        return invokeResponse.error;
      } else {
        return `A new election has been created for ${voterId}`;
      }
    }
  }
};