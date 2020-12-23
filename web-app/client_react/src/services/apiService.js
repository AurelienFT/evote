import axios from 'axios'

const BASE_URL = `http://ec2-15-237-109-51.eu-west-3.compute.amazonaws.com:8081/`;

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
  castBallot,
  queryAll,
  queryByObjectType,
  queryWithQueryString,
  registerVoter,
  validateVoter,
  queryByKey,
  getCurrentStanding
}