/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const path = require('path');
const fs = require('fs');

//connect to the election data file
const electionDataPath = path.join(process.cwd(), './lib/electionData.json');
const electionDataJson = fs.readFileSync(electionDataPath, 'utf8');
const electionData = JSON.parse(electionDataJson);

let util = require('util');

//import our file which contains our constructors and auxiliary function
let Ballot = require('./Ballot.js/index.js');

const voteForOffice = 'office';
const voteForProp = 'proposition';

let voteCount = 0; // all votes start at a count of zero
class MyAssetContract extends Contract {

  async init() {
    console.log('instantiate was called!');
    //call registerVoter();
  }

  /**
   * 
   * generateBallot 
   * 
   * Function that imports data from electionData.json and populates a ballot.
   * Updates the world state with the ballot votables and choices.
   * @param election - the election we are currently in
   * @param registrar - the registrar we are signed up with
   * @returns - none
   */

  async generateBallot(ctx, election, registrar) {

    console.log('generateBallot called');

    if (election.year % 4 === 0) {

      console.log('inside election.year %4 == 0 ');
      //generate choices for federal race
      let federalDemocratCandidate = await model.choice(electionData.fedDemocratBrief,
        electionData.fedDemocratDescription, voteCount);
      let federalRepublicanCandidate = await model.choice(electionData.fedRepublicanBrief,
        electionData.fedRepublicanDescription, voteCount);

      //generate choices for governor race
      let governorDemocratCandidate = await model.choice(electionData.governorDemocratBrief,
        electionData.fedDemocratDescription, voteCount);
      let governorRepublicanCandidate = await model.choice(electionData.fedRepublicanBrief,
        electionData.fedRepublicanDescription, voteCount);

      //generate choices for mayor race
      let mayorDemocratCandidate = await model.choice(electionData.mayorDemocratBrief,
        electionData.mayorDemocratDescription, voteCount);
      let mayorRepublicanCandidate = await model.choice(electionData.mayorRepublicanBrief,
        electionData.mayorRepublicanDescription, voteCount);

      //generate choices for propositions
      let propYesChoice = await model.choice(electionData.propYesBrief,
        electionData.propYesDescription, voteCount);
      let propNoChoice = await model.choice(electionData.propNoBrief,
        electionData.propNoDescription, voteCount);

      //allocate empty array for choices
      let federalChoices = [];
      let governorChoices = [];
      let mayorChoices = [];
      let propositionChoices = [];

      //push federal choices to array
      federalChoices.push(federalDemocratCandidate);
      federalChoices.push(federalRepublicanCandidate);
      //push governor choices to array
      governorChoices.push(governorDemocratCandidate);
      governorChoices.push(governorRepublicanCandidate);

      //push mayor choices to array
      mayorChoices.push(mayorDemocratCandidate);
      mayorChoices.push(mayorRepublicanCandidate);

      //push prop choices to array
      propositionChoices.push(propYesChoice);
      propositionChoices.push(propNoChoice);

      //create votables for each race 
      let presidentalRace = await model.votable(voteForOffice, electionData.presidentialRaceTitle,
        electionData.presidentialRaceDescription, federalChoices);

      let governorRace = await model.votable(voteForOffice, electionData.governorRaceTitle,
        electionData.governorRaceDescription, governorChoices);

      let mayorRace = await model.votable(voteForOffice, electionData.mayorRaceTitle,
        electionData.mayorRaceDescription, mayorChoices);

      let propositionRace = await model.votable(voteForProp, electionData.propositionTitle,
        electionData.propositionDescription, propositionChoices);

      //array of items to vote on
      let items = [presidentalRace, governorRace, mayorRace, propositionRace];

      //generate ballot with the items to vote on, the election, and the registrar
      let ballot = await new Ballot(items, election, registrar);

      //update state with all races we've created
      await ctx.stub.putState(presidentalRace.votableId, Buffer.from(JSON.stringify(presidentalRace)));
      await ctx.stub.putState(governorRace.votableId, Buffer.from(JSON.stringify(governorRace)));
      await ctx.stub.putState(mayorRace.votableId, Buffer.from(JSON.stringify(mayorRace)));
      await ctx.stub.putState(propositionRace.votableId, Buffer.from(JSON.stringify(propositionRace)));

      //update state with all choices we've created
      await ctx.stub.putState(federalDemocratCandidate.choiceId, Buffer.from(JSON.stringify(federalDemocratCandidate)));
      await ctx.stub.putState(federalRepublicanCandidate.choiceId, Buffer.from(JSON.stringify(federalRepublicanCandidate)));
      await ctx.stub.putState(governorDemocratCandidate.choiceId, Buffer.from(JSON.stringify(governorDemocratCandidate)));
      await ctx.stub.putState(governorRepublicanCandidate.choiceId, Buffer.from(JSON.stringify(governorRepublicanCandidate)));
      await ctx.stub.putState(mayorDemocratCandidate.choiceId, Buffer.from(JSON.stringify(mayorDemocratCandidate)));
      await ctx.stub.putState(mayorRepublicanCandidate.choiceId, Buffer.from(JSON.stringify(mayorRepublicanCandidate)));
      await ctx.stub.putState(propYesChoice.choiceId, Buffer.from(JSON.stringify(propYesChoice)));
      await ctx.stub.putState(propNoChoice.choiceId, Buffer.from(JSON.stringify(propNoChoice)));

      //update state with ballot we created
      await ctx.stub.putState(ballot.ballotId, Buffer.from(JSON.stringify(ballot)));

      console.log('federalDemocratCandidate.choiceId: ');
      console.log(federalDemocratCandidate.choiceId);
      console.log('presidentalRace.votableId: ');
      console.log(presidentalRace.votableId);
      console.log('propositionRace.votableId: ');
      console.log(propositionRace.votableId);
      console.log('ballot.ballotId: ');
      console.log(ballot.ballotId);

    } else if (election.year % 4 === 2) {
      throw new Error('Sorry, midterm elections not supported right now.');
    } else {
      throw new Error('Sorry, you have passed an invalid year for an election. Please try again.');
    }

  }

  /**
   * 
   * generateElection 
   * 
   * Function that imports data from electionData.json and populates an election.
   * Updates the world state with the current election and registrar.
   * @returns - none
   */
  async generateElection(ctx) {

    console.log('generateElection was called!');

    let startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
    let endDate = new Date(2020, 1, 2, 0, 0, 0, 0);

    let currentElection = await new model.election(electionData.electionName, electionData.electionCountry,
      electionData.electionYear, startDate, endDate);

    console.log('currentElection');
    console.log(util.inspect(currentElection));

    let currentRegistrar = await new model.registrar(electionData.registrarDistinguishedName,
      electionData.registrarOrg, electionData.registrarLocality, electionData.registrarState,
      electionData.registrarCountry, electionData.registrarPrecinctNums);

    console.log('currentRegistrar');
    console.log(util.inspect(currentRegistrar));

    //update state with the election and the registrar
    await ctx.stub.putState(currentElection.electionId, Buffer.from(JSON.stringify(currentElection)));
    await ctx.stub.putState(currentRegistrar.registrarId, Buffer.from(JSON.stringify(currentRegistrar)));

  }

  /**
   * 
   * castBallot 
   * 
   * Function that defines and stores a vote in the world state, and then 
   * tallies the votes.
   * @param ballot - the election we are currently in
   * @param election - the election we are currently in
   * @param voter - the election we are currently in
   * @param voterChoices - an array of choices that the voter has recorded. 
   * @returns - none
   */
  async castBallot(ctx) {

    console.log('generateElection was called!');

    let startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
    let endDate = new Date(2020, 1, 2, 0, 0, 0, 0);

    let currentElection = await model.election(electionData.electionName, electionData.electionCountry,
      electionData.electionYear, startDate, endDate);

    console.log('currentElection');
    console.log(util.inspect(currentElection));

    let currentRegistrar = await model.registrar(electionData.registrarDistinguishedName,
      electionData.registarOrg, electionData.registrarLocality, electionData.registrarState,
      electionData.registrarCountry, electionData.registrarPrecinctNums);

    console.log('currentRegistrar');
    console.log(util.inspect(currentRegistrar));

    //update state with the election and the registrar
    await ctx.stub.putState(currentElection.electionId, Buffer.from(JSON.stringify(currentElection)));
    await ctx.stub.putState(currentRegistrar.registrarId, Buffer.from(JSON.stringify(currentRegistrar)));


  }

   /**
   * 
   * castBallot 
   * 
   * Function that defines and stores a vote in the world state, and then 
   * tallies the votes.
   * @param name - the election we are currently in
   * @param stateId - the state Id that the voter registers with
   * @param voter - the election we are currently in
   * @param voterChoices - an array of choices that the voter has recorded. 
   * @returns - none
   */
  async registerVoter(ctx) {

    console.log('generateElection was called!');

    let startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
    let endDate = new Date(2020, 1, 2, 0, 0, 0, 0);

    let currentElection = await model.election(electionData.electionName, electionData.electionCountry,
      electionData.electionYear, startDate, endDate);

    console.log('currentElection');
    console.log(util.inspect(currentElection));

    let currentRegistrar = await model.registrar(electionData.registrarDistinguishedName,
      electionData.registarOrg, electionData.registrarLocality, electionData.registrarState,
      electionData.registrarCountry, electionData.registrarPrecinctNums);

    console.log('currentRegistrar');
    console.log(util.inspect(currentRegistrar));

    //update state with the election and the registrar
    await ctx.stub.putState(currentElection.electionId, Buffer.from(JSON.stringify(currentElection)));
    await ctx.stub.putState(currentRegistrar.registrarId, Buffer.from(JSON.stringify(currentRegistrar)));


  }

  

  async myAssetExists(ctx, myAssetId) {
    const buffer = await ctx.stub.getState(myAssetId);
    return (!!buffer && buffer.length > 0);
  }

  async createMyAsset(ctx, myAssetId, value) {
    const exists = await this.myAssetExists(ctx, myAssetId);
    if (exists) {
      throw new Error(`The my asset ${myAssetId} already exists`);
    }
    const asset = { value };
    const buffer = Buffer.from(JSON.stringify(asset));
    await ctx.stub.putState(myAssetId, buffer);
  }

  async readMyAsset(ctx, myAssetId) {
    const exists = await this.myAssetExists(ctx, myAssetId);
    if (!exists) {
      throw new Error(`The my asset ${myAssetId} does not exist`);
    }
    const buffer = await ctx.stub.getState(myAssetId);
    const asset = JSON.parse(buffer.toString());
    return asset;
  }

  async updateMyAsset(ctx, myAssetId, newValue) {
    const exists = await this.myAssetExists(ctx, myAssetId);
    if (!exists) {
      throw new Error(`The my asset ${myAssetId} does not exist`);
    }
    const asset = { value: newValue };
    const buffer = Buffer.from(JSON.stringify(asset));
    await ctx.stub.putState(myAssetId, buffer);
  }

  async deleteMyAsset(ctx, myAssetId) {
    const exists = await this.myAssetExists(ctx, myAssetId);
    if (!exists) {
      throw new Error(`The my asset ${myAssetId} does not exist`);
    }
    await ctx.stub.deleteState(myAssetId);
  }
}

module.exports = MyAssetContract;