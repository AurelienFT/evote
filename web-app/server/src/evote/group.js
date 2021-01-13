'use strict';

let fabric = require('../fabric/network.js');

async function registerGroup(network, {ownerId, groupName}) {
  const args = JSON.stringify({ownerId, groupName});
  return await fabric.invoke(network, false, 'createGroup', [args]);
}

async function addGroupMember(network, {startDate, endDate, groupId, newMemberId}) {
  const args = JSON.stringify({startDate, endDate, groupId, newMemberId});
  return await fabric.invoke(network, false, 'addGroupMember', [args]);
}

module.exports = {
  registerGroup,
  addGroupMember
};