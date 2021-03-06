import axios from 'axios'

const BASE_URL = `https://api.vote.oursin.eu/`;

async function castBallot(electionId, voterId, picked) {
    return await axios.post(BASE_URL + 'castBallot', {       
      electionId: electionId,
      voterId: voterId,
      picked: picked
    })
  };

async function queryAll() {
    return await axios.get(BASE_URL + 'queryAll')
};

async function queryByObjectType() {
    return await axios.get(BASE_URL + 'queryByObjectType')
};

async function queryWithQueryString(selected) {
    return await axios.post(BASE_URL + 'queryWithQueryString', {
      selected: selected
    }) 
};

async function registerVoter() {
    return await axios.post(BASE_URL + 'registerVoter') 
};

async function registerGroup(ownerId, groupName) {
  return await axios.post(BASE_URL + 'registerGroup', {
    ownerId: ownerId,
    groupName: groupName
  }) 
};

async function addGroupMember(groupId, newMemberId, startDate, endDate) {
  return await axios.post(BASE_URL + 'addGroupMember', {
    groupId: groupId,
    newMemberId: newMemberId,
    startDate: startDate,
    endDate: endDate
  }) 
};

async function triggerActionsElection(electionId) {
  return await axios.post(BASE_URL + 'triggerActionsElection', {
    electionId: electionId
  }) 
};


async function validateVoter(voterId) {
    return await axios.post(BASE_URL + 'validateVoter', {
      voterId: voterId
    }) 
};

async function queryByKey(key) {
    let returned = await axios.post(BASE_URL + 'queryByKey', {
      key: key
    });
    return returned;
};

async function getCurrentStanding() {
    return await axios.get(BASE_URL + 'getCurrentStanding')
};

export {
  addGroupMember,
  castBallot,
  queryAll,
  queryByObjectType,
  queryWithQueryString,
  registerVoter,
  registerGroup,
  validateVoter,
  queryByKey,
  getCurrentStanding,
  triggerActionsElection
}