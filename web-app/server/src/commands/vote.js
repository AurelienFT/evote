'use strict';

const { SlashCommand, CommandOptionType } = require('slash-create');
const fabric = require('../fabric/network.js');
const { queryByKey, queryByObjectType } = require('../evote/util.js');
const { castBallot } = require('../evote/voter.js');
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
      name: 'vote',
      description: 'Vote in an election.',
      options: [{
        type: CommandOptionType.STRING,
        name: 'election',
        description: 'the election you want to vote for'
      }, {
        type: CommandOptionType.STRING,
        name: 'vote',
        description: 'The option you want to vote for'
      }]
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
      const election = targetGroup.Record.electionsId[0];
      const networkObj = await fabric.connectToNetwork(appAdmin);
      const invokeResponse = await castBallot(networkObj, {picked: ctx.options.vote, electionId: election, voterId: voterId});
      console.log('after invoke', invokeResponse);
      return `Voter ${voterId} successfully voted on election ${election}`;
    }
  }
};