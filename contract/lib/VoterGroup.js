'use strict';

let Election = require('./Election.js');
let VotableItem = require('./VotableItem.js');
let Ballot = require('./Ballot.js');

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
        this.groupId = 'group' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.type = 'group';
        this.electionsId = new Array();
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
        let election = await new Election("Add " + newUserID + " to " + this.name, startDate, endDate, this.groupId);
        let approve = await new VotableItem(ctx, "Add this member to the group", election.electionId);
        let denied = await new VotableItem(ctx, "Don't add this member from the group", election.electionId);
        let votableItems = [];
        votableItems.push(approve);
        votableItems.push(denied);
        await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));
        this.electionsId.push(election.electionId);
        await ctx.stub.putState(this.groupId, Buffer.from(JSON.stringify(this)));
        await ctx.stub.putState(approve.votableId, Buffer.from(JSON.stringify(approve)));
        await ctx.stub.putState(denied.votableId, Buffer.from(JSON.stringify(denied)));
        //generate ballots for all members of the groupe
        for (let i = 0; i < this.membersId; i++) {
            const buffer = await ctx.stub.getState(this.membersId[i]);
    
            let voter = null;
            if (!!buffer && buffer.length > 0) {
              voter = JSON.parse(buffer.toString());
            }
            if (voter == null) {
                console.log("unknow error");
                continue;
            }
            // TODO: Change to allow multiple votes
            if (!voter.ballot) {

                //give each registered voter a ballot
                await this.generateBallot(ctx, votableItems, election, voterId);

            } else {
                console.log('voter id:' + voter.id + ' already have ballots');
                break;
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
    async generateBallot(ctx, votableItems, election, voter) {

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

}
module.exports = VoterGroup;