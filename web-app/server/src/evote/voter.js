'use strict';

let fabric = require('../fabric/network.js');


async function registerVoter(network, {voterId}) {
  const args = JSON.stringify({voterId});
  return await fabric.invoke(network, false, 'createVoter', [args]);
}

async function castBallot(network, { picked, electionId, voterId }) {
  const args = JSON.stringify({ picked, electionId, voterId });
  return await fabric.invoke(network, false, 'castVote', [args]);
}

async function getCurrentStanding(network) {
  return await fabric.invoke(network, true, 'queryByObjectType', 'votableItem');
}

module.exports = {
  registerVoter,
  castBallot,
  getCurrentStanding
};