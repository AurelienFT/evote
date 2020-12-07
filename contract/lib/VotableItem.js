/* eslint-disable indent */
'use strict';

class VotableItem {

    /**
   *
   * VotableItem
   *
   * Constructor for a VotableItem object. These will eventually be placed on the 
   * ballot. 
   *  
   * @param votableId - the Id of the votableItem
   * @param description - the description of the votableItem
   * @param voterId - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
  constructor(ctx, description, electionId) {
    this.electionId = electionId;
    this.votableId = 'item' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.description = description;
    this.count = 0;
    this.type = 'votableItem';
    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;

  }
}
module.exports = VotableItem;