'use strict';

const { SlashCommand, CommandOptionType } = require('slash-create');
const fabric = require('../fabric/network.js');
const { queryByKey, queryByObjectType } = require('../evote/util.js');
const { registerGroup, addGroupMember } = require('../evote/group.js');
const path = require('path');
const fs = require('fs');

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'hello',
      description: 'Says hello to you.'
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    const networkObj = await fabric.connectToNetwork(appAdmin);
    const voterId = `voter${ctx.member.id}@discord`;
    const groupId = `group${ctx.guildID}@discord`;
    console.log(`creating new group for ${voterId}: ${groupId}`);
    const invokeResponse = await queryByObjectType(networkObj, 'group');
    console.log('after invoke', JSON.parse(invokeResponse));
    const groups = JSON.parse(invokeResponse);
    const targetGroup = groups.find((g) => g.Record.name === groupId);
    if (invokeResponse.error) {
      return invokeResponse.error;
    } else {
      let elections = 'Here is the list of the current elections on this server:\n';
      for (let e of targetGroup.Record.electionsId) {
        const networkObj = await fabric.connectToNetwork(appAdmin);
        const invokeResponse = await queryByKey(networkObj, e);
        let election = JSON.parse(invokeResponse);
        let member = election.memberToAdd.slice(5, 23);
        elections += `Election to add <@${member}>: ${e}\n`;
      }
      console.log('after invoke', invokeResponse);
      return elections;
    }
  } catch (err) {
    return err;
  }
};