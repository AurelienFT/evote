import Api from './api'

function castBallot(electionId, voterId, picked) {
    return Api().post('castBallot', {       
      electionId: electionId,
      voterId: voterId,
      picked: picked
    })
  };

function queryAll() {
    return Api().get('queryAll')
};

function queryByObjectType() {
    return Api().get('queryByObjectType')
};

function queryWithQueryString(selected) {
    return Api().post('queryWithQueryString', {
      selected: selected
    }) 
};

function registerVoter(voterId, registrarId, firstName, lastName) {
    return Api().post('registerVoter', {
      voterId: voterId,
      registrarId: registrarId,
      firstName: firstName,
      lastName: lastName,
      
    }) 
};

function validateVoter(voterId) {
    return Api().post('validateVoter', {
      voterId: voterId
    }) 
};

function queryByKey(key) {
    return Api().post('queryByKey', {
      key: key
    }) 
};

function getCurrentStanding() {
    return Api().get('getCurrentStanding')
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