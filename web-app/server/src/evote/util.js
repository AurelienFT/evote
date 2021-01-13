'use strict';

let fabric = require('../fabric/network.js');

async function queryAll(network) {
  return await fabric.invoke(network, true, 'queryAll', '');
}

async function queryByObjectType(network, selected) {
  return await fabric.invoke(network, true, 'queryByObjectType', selected);
}

async function queryByKey(network, key) {
  return await fabric.invoke(network, true, 'readMyAsset', key);
}

async function readAsset(network, { voterId }) {
  return await fabric.invoke(network, true, 'readMyAsset', voterId);
}


module.exports = {
  queryAll,
  queryByObjectType,
  queryByKey,
  readAsset
};