'use strict';

let Election = require('./Election.js');

class VoterGroup {
  /**
   *
   * VoterGroup
   *
   * Constructor for a VoterGroup object. VoterGroup has a ownerId. 
   *  
   * @param ownerId - the unique Id which corresponds to a registered voter
   * @param name - name of the group
   * @returns - group object
   */
  constructor(ownerId, name) {

    this.ownerId = ownerId;
    this.membersId = new Array();
    this.membersId.push(this.ownerId);
    this.name = name;
    this.groupId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.type = 'voter';
    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;
  }

  /**
   *
   * VoterGroup
   *
   * Propose a vote to an user to the group
   *  
   * @param newUserEmail - email of the new user to be added (not implemented yet)
   * @param newUserID - ID of the new user to be added
   * @param startDate - start date of the vote
   * @param endDate - end date of the vote
   * @returns - Nothing
   */
  async addMember(ctx, newUserEmail, newUserID, startDate, endDate) {
    if (!newUserEmail && !newUserID) {
        throw new Error('No new user provided');
    }
    if (newUserEmail) {
        throw new Error('email not implemented yet');
    }
    //create the election
    election = await new Election("Add " + newUserID + " to " + this.name, startDate, endDate, this.groupId);

    await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));
  }


}
module.exports = VoterGroup;