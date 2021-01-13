'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
const path = require('path');
const fs = require('fs');

let fabric = require('./fabric/network.js');
const { queryAll, queryByObjectType, queryByKey, readAsset } = require('./evote/util');
const { registerGroup, addGroupMember } = require('./evote/group');
const { registerVoter, castBallot, getCurrentStanding } = require('./evote/voter');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

//get all assets in world state
app.get('/queryAll', async (req, res) => {
  let network = await fabric.connectToNetwork(appAdmin);
  const response = await queryAll(network);
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);
});

app.get('/getCurrentStanding', async (req, res) => {

  let network = await fabric.connectToNetwork(appAdmin);
  let response = await getCurrentStanding(network);
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});

//vote for some candidates. This will increase the vote count for the votable objects
app.post('/castBallot', async (req, res) => {
  let networkObj = await fabric.connectToNetwork(appAdmin);

  let response = await castBallot(networkObj, req.body);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // let parsedResponse = await JSON.parse(response);
    res.send(response);
  }
});

//query for certain objects within the world state
app.post('/queryWithQueryString', async (req, res) => {
  let network = await fabric.connectToNetwork(appAdmin);
  let response = await queryByObjectType(network, req.body.selected);
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});

//get voter info, create voter object, and update state with their voterId
app.post('/registerVoter', async (req, res) => {
  let response = {};
  //FIX ME: first create the identity for the voter and add to wallet
  //let response = await network.registerVoter('voter' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  console.log('response from registerVoter: ');
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    // FIX WITH VOTER ID
    let networkObj = await fabric.connectToNetwork(appAdmin);

    if (networkObj.error) {
      res.send(networkObj.error);
    }

    const voterId = 'voter' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    let invokeResponse = await registerVoter(networkObj, {voterId});
    
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      console.log('after network.invoke ');
      res.send(invokeResponse);
    }
  }
});

//get voter info, create voter object, and update state with their voterId
app.post('/registerGroup', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  let response = {};
  //FIX ME: use group of fabric
  console.log('response from registerVoter: ');
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    const { ownerId, groupName } = req.body;
    let networkObj = await fabric.connectToNetwork(appAdmin);

    if (networkObj.error) {
      res.send(networkObj.error);
    }
    if (ownerId === undefined || groupName === undefined) {
      res.send('missing parameters');
    }

    let invokeResponse = await registerGroup(networkObj, {ownerId, groupName});

    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      console.log('after network.invoke');
      res.send(invokeResponse);
    }
  }
});

app.post('/addGroupMember', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  let response = {};
  //FIX ME: use group of fabric
  if (response.error) {
    res.send(response.error);
  } else {
    let networkObj = await fabric.connectToNetwork(appAdmin);
    if (networkObj.error) {
      res.send(networkObj.error);
    }

    let invokeResponse = await addGroupMember(networkObj, req.body);
    
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      console.log('after network.invoke ');
      res.send(invokeResponse);

    }
  }
});

app.post('/triggerActionsElection', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  let response = {};
  //FIX ME: use group of fabric
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('req.body.electionId');
    console.log(req.body.electionId);
    // FIX WITH VOTER ID
    let networkObj = await fabric.connectToNetwork(appAdmin);
    console.log('networkobj: ');

    if (networkObj.error) {
      res.send(networkObj.error);
    }
    console.log('network obj');
    console.log(util.inspect(networkObj));

    req.body = JSON.stringify(req.body);
    let args = [req.body];
    console.log('args:');
    console.log(args);
    //connect to network and update the state with voterId  

    let invokeResponse = await fabric.invoke(networkObj, false, 'triggerActionsElection', args);
    
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      console.log('after network.invoke ');
      res.send(invokeResponse);

    }
  }
});

//used as a way to login the voter to the app and make sure they haven't voted before 
app.post('/validateVoter', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  let networkObj = await fabric.connectToNetwork(req.body.voterId);
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  if (networkObj.error) {
    res.send(networkObj);
  }

  let invokeResponse = await readAsset(networkObj, { voterId: req.body.voterId });
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
    console.log('after network.invoke ');
    let parsedResponse = await JSON.parse(invokeResponse);
    if (parsedResponse.ballotCast) {
      let response = {};
      response.error = 'This voter has already cast a ballot, we cannot allow double-voting!';
      res.send(response);
    }
    // let response = `Voter with voterId ${parsedResponse.voterId} is ready to cast a ballot.`  
    res.send(parsedResponse);
  }

});

app.post('/queryByKey', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);

  let networkObj = await fabric.connectToNetwork(appAdmin);
  console.log('after network OBj');
  let response = await queryByKey(networkObj, req.body.key);
  response = JSON.parse(response);
  console.log({ response });
  if (response.error) {
    res.send({error: response.error});
  } else {
    res.send(response);
  }
});


app.listen(process.env.PORT || 8081, '0.0.0.0');

const { SlashCreator, ExpressServer } = require('slash-create');

const creator = new SlashCreator({
  applicationID: '793781694673977385',
  publicKey: 'bd62781454fb894f2f21a5e05e9eff99b418e5d198f524d88fa6ec47f46c2222',
  token: 'NzkzNzgxNjk0NjczOTc3Mzg1.X-xQzw.IIbJbOdwkzV3U4IKu_nY2bgxVDo',
  serverPort: 5555,
});

creator
  // Registers all of your commands in the ./commands/ directory
  .registerCommandsIn(path.join(__dirname, 'commands'))
  // This will sync commands to Discord, it must be called after commands are loaded.
  // This also returns itself for more chaining capabilities.
  .syncCommands();

creator
  .withServer(new ExpressServer(app, { alreadyListening: true }));

console.log(creator.commands);