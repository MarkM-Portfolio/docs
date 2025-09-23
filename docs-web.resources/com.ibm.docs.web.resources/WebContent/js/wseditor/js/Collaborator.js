/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.Collaborator");
dojo.declare("websheet.Collaborator", null, {
	
    name: "Unknown User",
    colorNumber: 1,
    userId: null,
    color: null,
    lockCellRef: null,
    _isSelf: false,
    editor: null,
    
    constructor: function(args){
        dojo.mixin(this, args);
    },    
    
    lockCell: function(ref){
    	// RARELY HAPPEN!!! 
    	// If window.unbeforeunload fails to be invoked to clear co-edit indicator when user either reload
    	// or refresh page, use this way to guarantee one indicator per each collaborator
    	if (this.lockCellRef!= null)
        	this.releaseLock();
        
    	this.lockCellRef = ref;
        this.editor.lockCell(ref, this.getColor(), this.userId);
    },
    
    clearLockCellRef: function()
    {
    	this.lockCellRef = null;
    },
    
    getLockCellRef: function(){
        return this.lockCellRef;
    },
    
    releaseLock: function(){
        this.editor.releaseCell(this.getLockCellRef(), this.userId);
        this.lockCellRef = null;
    },
    getName: function(){
        return this.name;
    },
    isSelf: function(){
        return this._isSelf;
    },
    setUserId: function(userId){
        this.userId = userId;
    },
    getColor: function() {
    	return this.color;
    },
    getUserId: function(){
        return this.isSelf() ? window["pe"].authenticatedUser.getId() : this.userId;
    }
});
