'use strict';

class Election {

  /**
   *
   * validateElection
   *
   * check for valid election, cross check with government. Don't want duplicate
   * elections.
   *  
   * @param electionId - an array of choices 
   * @returns - yes if valid Voter, no if invalid
   */
  async validateElection(electionId) {

    //registrarId error checking here, i.e. check if valid drivers License, or state ID
    if (electionId) {
      return true;
    } else {
      return false;
    }
  }
  /**
   *
   * Election
   *
   * Constructor for an Election object. Specifies start and end date.
   *  
   * @param items - an array of choices 
   * @param election - what election you are making ballots for 
   * @param voterId - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
  constructor(name, startDate, endDate, groupId) {
    
    this.electionId = 'election' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (this.validateElection(this.electionId)) {

      //create the election object
      this.name = name;
      this.startDate = startDate;
      this.endDate = endDate;
      this.groupId = groupId;
      this.type = 'election';
      this.items = [];
      this.triggered = false;
      //TODO: Make it generally
      this.memberToAdd = '';
      if (this.__isContract) {
        delete this.__isContract;
      }
      return this;

    } else {
      throw new Error('not a valid election!');
    }

  }

}
module.exports = Election;