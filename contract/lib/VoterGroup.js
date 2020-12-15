'use strict';

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
};


module.exports = VoterGroup;