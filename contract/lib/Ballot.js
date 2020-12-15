'use strict';

class Ballot {

  /**
   *
   * Ballot
   *
   * Constructor for a Ballot object. This is what the point of the application is - create 
   * ballots, have a voter fill them out, and then tally the ballots. 
   *  
   * @param items - an array of choices 
   * @param election - what election you are making ballots for 
   * @param voterId - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
  constructor(ctx, items, election, voterId) {

    if (this.validateBallot(ctx, voterId)) {

      this.votableItems = items;
      this.election = election;
      this.voterId = voterId;
      this.ballotCast = false;
      this.ballotId = 'ballot' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.type = 'ballot';
      if (this.__isContract) {
        delete this.__isContract;
      }
      if (this.name) {
        delete this.name;
      }
      return this;

    } else {
      console.log('a ballot has already been created for this voter');
      throw new Error ('a ballot has already been created for this voter');
    }
  }

  /**
   *
   * validateBallot
   *
   * check to make sure a ballot has not been created for this
   * voter.
   *  
   * @param voterId - the unique Id for a registered voter 
   * @returns - yes if valid Voter, no if invalid
   */
  async validateBallot(ctx, voterId) {

    const buffer = await ctx.stub.getState(voterId);
    
    if (!!buffer && buffer.length > 0) {
      let voter = JSON.parse(buffer.toString());
      if (voter.ballotCreated) {
        console.log('ballot has already been created for this voter');
        return false;
      } else {
        return true;
      }
    } else {
      console.log('This ID is not registered to vote.');
      return false;
    }
  }
}

    /**
   *
   * generateBallot
   *
   * Creates a ballot in the world state, and updates voter ballot and castBallot properties.
   * 
   * @param ctx - the context of the transaction
   * @param votableItems - The different political parties and candidates you can vote for, which are on the ballot.
   * @param election - the election we are generating a ballot for. All ballots are the same for an election.
   * @param voter - the voter object
   * @returns - nothing - but updates the world state with a ballot for a particular voter object
   */
  async function generateBallot(ctx, votableItems, election, voter) {

    //generate ballot
    let ballot = await new Ballot(ctx, votableItems, election, voter.voterId);

    //set reference to voters ballot
    //TODO: Change to have multiple ballot
    voter.ballot = ballot.ballotId;
    voter.ballotCreated = true;

    // //update state with ballot object we just created
    await ctx.stub.putState(ballot.ballotId, Buffer.from(JSON.stringify(ballot)));

    await ctx.stub.putState(voter.voterId, Buffer.from(JSON.stringify(voter)));

}

module.exports = {Ballot, generateBallot};