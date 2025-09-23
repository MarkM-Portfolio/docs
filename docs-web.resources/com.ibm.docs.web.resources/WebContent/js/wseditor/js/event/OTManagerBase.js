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

/************************************************************************************/
/* event transform in  co-editing mode												*/
/* Undo & Redo for Operation transform is implemented here										*/
/************************************************************************************/
dojo.provide("websheet.event.OTManagerBase");

dojo.declare("websheet.event.OTManagerBase",null, {
	
	docAgent:null,
	
	modifyInfo: null, // used to modify the first msg in the redo array
	
	// exception thrown when inconsistency happens for undo-redo performs
	_INCONSIS_ERR: "OTManager: force reload due to inconsistency undo-redo.",
	
	constructor: function(docAgent){
		this.docAgent = docAgent;
	},
	
	setModifyInfo: function (info) {
		this.modifyInfo = info;	
	},
	
	/**
	 * index:the index of local sendoutlist
	 * latter:null(only undo the msg in local sendoutlist) 
	 *        the message came from server side
	 * abstract method
	 */
	//TODO: jinjing
	perform:function(index,incomingMsg)
	{
		throw new Error("not implemented");
	},
	
	conflictResolve: function(sIndex,eIndex,bSend)
	{
		var localSendoutList = this.docAgent.getConnector().sendOutList;
		if(!eIndex) eIndex = sIndex;
		for(var index = sIndex; index <= eIndex; index++)
		{
			if(localSendoutList[index])
			{
				localSendoutList[index].isConflict = true;
			}
		}
		// send conflict resolve message to server, otherwise server
		// would reject any new message from this client
		if(bSend)
			this.docAgent.getConnector().conflictResolved();
	},
	
	/*
	 * TODO: on mobile native, needs to implement a same one method
	 * when conflict occurs, need to rollback all local messages
	 * abstract method
	 */
	removeActionInUndoStack: function(sIndex,eIndex)
	{
		throw new Error("not implemented");
	}
});