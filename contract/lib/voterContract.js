/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

//import Hyperledger Fabric 1.4 SDK
const { Contract } = require('fabric-contract-api');
const path = require('path');
const fs = require('fs');

let Voter = require('./Voter.js');
let VoterGroup = require('./VoterGroup.js');
let VotableItem = require('./VotableItem.js');
let {Ballot, generateBallot} = require('./Ballot.js');
let Election = require('./Election.js');
const { group } = require('console');
const { start } = require('repl');

class MyAssetContract extends Contract {

  /**
   *
   * init
   *
   * This function creates voters and gets the application ready for use by creating 
   * an election from the data files in the data directory.
   * 
   * @param ctx - the context of the transaction
   * @returns the voters which are registered and ready to vote in the election
   */
  async init(ctx) {

    console.log('instantiate was called!');
    //create voters

    let voter1 = await new Voter('voter' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    let voter2 = await new Voter('voter' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

    //add the voters to the world state, the election class checks for registered voters 
    await ctx.stub.putState(voter1.voterId, Buffer.from(JSON.stringify(voter1)));
    await ctx.stub.putState(voter2.voterId, Buffer.from(JSON.stringify(voter2)));

    let group1 = await new VoterGroup(voter1.voterId, "testGroup");
    voter1.groups.push(group1.groupId);
    await ctx.stub.putState(group1.groupId, Buffer.from(JSON.stringify(group1)));
    await ctx.stub.putState(voter1.voterId, Buffer.from(JSON.stringify(voter1)));
  }

  async addGroupMember(ctx, groupId, newUserID) {
    let startDate = await new Date(2020, 11, 21);
    let endDate = await new Date(2020, 11, 30);
    const buffer = await ctx.stub.getState(groupId);

    const group = JSON.parse(buffer.toString());
    //create the election
    let election = await new Election("Add " + newUserID + " to " + group.name, startDate, endDate, group.groupId);
    let approve = await new VotableItem(ctx, "Add this member to the group", election.electionId);
    let denied = await new VotableItem(ctx, "Don't add this member from the group", election.electionId);
    let votableItems = [];
    votableItems.push(approve);
    votableItems.push(denied);
    await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));
    group.electionsId.push(election.electionId);
    await ctx.stub.putState(group.groupId, Buffer.from(JSON.stringify(group)));
    await ctx.stub.putState(approve.votableId, Buffer.from(JSON.stringify(approve)));
    await ctx.stub.putState(denied.votableId, Buffer.from(JSON.stringify(denied)));
    //generate ballots for all members of the group
    for (let i = 0; i < group.membersId.length; i++) {
      console.log(group.membersId[i]);
      const buffer = await ctx.stub.getState(group.membersId[i]);

      const voter = JSON.parse(buffer.toString());
      if (voter == null) {
        console.log("unknow error");
        continue;
      }
      // TODO: Change to allow multiple votes
      if (!voter.ballot) {

        //give each registered voter a ballot
        await generateBallot(ctx, votableItems, election, voter);

      } else {
        console.log('voter id:' + voter.id + ' already have ballots');
        break;
      }

    }
  }

  /**
   *
   * createVoter
   *
   * Creates a voter in the world state, based on the args given.
   *  
   * @returns - new voter 
   */
  async createVoter(ctx, args) {
    args = JSON.parse(args);

    if (!args.voterId) {
      let response = {};
      response.error = `VoterId is missing in args`;
      return response;
    }
    let voter = await new Voter(args.voterId);
    await ctx.stub.putState(voter.voterId, Buffer.from(JSON.stringify(voter)));
    return voter;
  }

    /**
   *
   * createGroup
   *
   * Creates a group in the world state, based on the args given.
   *  
   * @returns - new voter 
   */
  async createGroup(ctx, args) {
    args = JSON.parse(args);

    if (!args.ownerId || !args.groupName) {
      let response = {};
      response.error = `ownerId or groupName is missing in args`;
      return response;
    }
    let group = await new VoterGroup(args.ownerId, args.groupName);
    let voterAsBytes = await ctx.stub.getState(args.ownerId);
    let voter = await JSON.parse(voterAsBytes);
    if (voter.error) {
      let response = {};
      response.error = 'this voter don\'t exists.';
      return response;
    }
    voter.groups.push(group.groupId);
    await ctx.stub.putState(group.groupId, Buffer.from(JSON.stringify(group)));
    await ctx.stub.putState(voter.voterId, Buffer.from(JSON.stringify(voter)));
    return group;
  }

  /**
   *
   * deleteMyAsset
   *
   * Deletes a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to delete
   * @returns - nothing - but deletes the value in the world state
   */
  async deleteMyAsset(ctx, myAssetId) {

    const exists = await this.myAssetExists(ctx, myAssetId);
    if (!exists) {
      throw new Error(`The my asset ${myAssetId} does not exist`);
    }

    await ctx.stub.deleteState(myAssetId);

  }

  /**
   *
   * readMyAsset
   *
   * Reads a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to read
   * @returns - nothing - but reads the value in the world state
   */
  async readMyAsset(ctx, myAssetId) {

    const exists = await this.myAssetExists(ctx, myAssetId);

    if (!exists) {
      // throw new Error(`The my asset ${myAssetId} does not exist`);
      let response = {};
      response.error = `The my asset ${myAssetId} does not exist`;
      return response;
    }

    const buffer = await ctx.stub.getState(myAssetId);
    const asset = JSON.parse(buffer.toString());
    return asset;
  }



  /**
   *
   * myAssetExists
   *
   * Checks to see if a key exists in the world state. 
   * @param myAssetId - the key of the asset to read
   * @returns boolean indicating if the asset exists or not. 
   */
  async myAssetExists(ctx, myAssetId) {

    const buffer = await ctx.stub.getState(myAssetId);
    return (!!buffer && buffer.length > 0);

  }

  /**
   *
   * castVote
   * 
   * First to checks that a particular voterId has not voted before, and then 
   * checks if it is a valid election time, and if it is, we increment the 
   * count of the political party that was picked by the voter and update 
   * the world state. 
   * 
   * @param electionId - the electionId of the election we want to vote in
   * @param voterId - the voterId of the voter that wants to vote
   * @param votableId - the Id of the candidate the voter has selected.
   * @returns an array which has the winning briefs of the ballot. 
   */
  async castVote(ctx, args) {
    args = JSON.parse(args);

    //get the political party the voter voted for, also the key
    let votableId = args.picked;

    //check to make sure the election exists
    let electionExists = await this.myAssetExists(ctx, args.electionId);

    if (electionExists) {

      //make sure we have an election
      let electionAsBytes = await ctx.stub.getState(args.electionId);
      let election = await JSON.parse(electionAsBytes);
      let voterAsBytes = await ctx.stub.getState(args.voterId);
      let voter = await JSON.parse(voterAsBytes);

      let ballot = undefined;
      for (let index = 0; index < voter.ballots.length ;index++) {
        let tmpBallot = await this.readMyAsset(ctx, voter.ballots[index]);
        if (tmpBallot.electionId == args.electionId) {
          ballot = tmpBallot;
          break;
        }
      }
      if (ballot === undefined) {
        let response = {};
        response.error = 'this voter don\'t have ballot for this election';
        return response;
      }

      if (ballot.ballotCast) {
        let response = {};
        response.error = 'this voter has already cast this ballot!';
        return response;
      }

      //check the date of the election, to make sure the election is still open
      let currentTime = await new Date();

      //parse date objects
      let parsedCurrentTime = await Date.parse(currentTime);
      let electionStart = await Date.parse(election.startDate);
      let electionEnd = await Date.parse(election.endDate);

      //only allow vote if the election has started 
      if (parsedCurrentTime >= electionStart && parsedCurrentTime < electionEnd) {

        let votableExists = await this.myAssetExists(ctx, votableId);
        if (!votableExists) {
          let response = {};
          response.error = 'VotableId does not exist!';
          return response;
        }

        //get the votable object from the state - with the votableId the user picked
        let votableAsBytes = await ctx.stub.getState(votableId);
        let votable = await JSON.parse(votableAsBytes);

        //increase the vote of the political party that was picked by the voter
        await votable.count++;

        //update the state with the new vote count
        let result = await ctx.stub.putState(votableId, Buffer.from(JSON.stringify(votable)));
        console.log(result);

        //make sure this voter cannot vote again! 
        ballot.ballotCast = true;

        //update state to say that this voter has voted, and who they picked
        let response = await ctx.stub.putState(ballot.ballotId, Buffer.from(JSON.stringify(ballot)));
        console.log(response);
        return ballot;

      } else {
        let response = {};
        response.error = 'the election is not open now!';
        return response;
      }

    } else {
      let response = {};
      response.error = 'the election or the voter does not exist!';
      return response;
    }
  }

  /**
   * Query and return all key value pairs in the world state.
   *
   * @param {Context} ctx the transaction context
   * @returns - all key-value pairs in the world state
  */
  async queryAll(ctx) {

    let queryString = {
      selector: {}
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }

  /**
     * Evaluate a queryString
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */
  async queryWithQueryString(ctx, queryString) {

    console.log('query String');
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);

    let allResults = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;

        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }

        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await resultsIterator.close();
        console.info(allResults);
        console.log(JSON.stringify(allResults));
        return JSON.stringify(allResults);
      }
    }
  }

  /**
  * Query by the main objects in this app: ballot, election, votableItem, and Voter. 
  * Return all key-value pairs of a given type. 
  *
  * @param {Context} ctx the transaction context
  * @param {String} objectType the type of the object - should be either ballot, election, votableItem, or Voter
  */
  async queryByObjectType(ctx, objectType) {

    let queryString = {
      selector: {
        type: objectType
      }
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }
}
module.exports = MyAssetContract;
