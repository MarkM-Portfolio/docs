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

dojo.provide("websheet.layout.CollaboratorContainer");
dojo.require("websheet.Collaborator");
dojo.require("dojox.layout.ScrollPane");
dojo.declare("websheet.layout.CollaboratorContainer", [websheet.listener.Listener], {
    editor: null,
    collaborators: null,
    inx:parseInt(Math.random() * 100, 10),
    
    isListening: false,
    
    constructor: function(args){
	 	dojo.mixin(this, args);	
	 	this.collaborators= new Array();   
    },
    setBase: function(editor){
        this.editor = editor;
    },
    addCollaborator: function(name, userId, color){
    	if(!this.isListening)
    	{
    		this.startListening(this.editor.getController());
    		this.isListening = true;
    	}	
        var colorNumber = (this.currentColor++ % 8);
        var c = new websheet.Collaborator({
            region: 'right',
            name: name,
            editor: this.editor,
            userId: userId,
            color: color,
            _isSelf: userId == window["pe"].authenticatedUser.getId(),
            colorNumber: colorNumber
        });
        this.collaborators.push(c);
    },
    
    removeCollaborator: function(userId){
        var i = 0;
        for (i = 0; i < this.collaborators.length; i++) {
            var tempcolllaborator = this.collaborators[i];
            if (tempcolllaborator.userId == userId) {
            	// remove Co-edit indicator if any for this collaborator
            	tempcolllaborator.releaseLock();
            	this.collaborators[i] = this.collaborators[this.collaborators.length - 1];
                this.collaborators[this.collaborators.length - 1] = tempcolllaborator;
                this.collaborators.pop();
                break;
            }
        }
        
    },
    collaboratorExists: function(userId){
        return !(this.getCollaborator(userId) == null);
    },
    
    /*
     * determine whether it's the locked cell
     */
    isLockedCell: function(sheet, row, column) {
    	var ret = false;
    	
        for (var i = 0; i < this.collaborators.length; i++) {
            var cellRef = this.collaborators[i].getLockCellRef();
        	if (cellRef != null && cellRef.sheetName == sheet && cellRef.startRow == row && websheet.Helper.getColChar(cellRef.startCol) == column)
        		ret = true;
        }

    	return ret;
    },
    
    getCollaborator: function(userId){
        for (var i = 0; i < this.collaborators.length; i++) {
        	var tmp = this.collaborators[i];
            if (tmp.userId == userId) {
                return tmp;
            }
        }
        return null;
    },
    clearCollaborators: function(){
        var length=this.collaborators.length;
        for (var i = 0; i <length ; i++) 
            this.collaborators.pop();
    },
    currentColor: 0,
    getCollaborators: function(){
        return this.collaborators;
    },
    
//    /*
//     * remove the co-edit indicator of grid cell for this given sheet
//     */
//    removeIndicator: function(sheet)
//    {
//    	if (!sheet) return;
//    	for (var i = 0; i < this.collaborators.length; ++i) {
//    		var c = this.collaborators[i];
//    		var ref = c.getLockCellRef();
//    		if (ref && ref.sheet == sheet)
//    			// can't use c.lockCell, it will set null to lockCellRef
//    			// c.lockCell();
//    			this.editor.releaseCell(ref, c.getUserId());
//    	}
//    },
    
    /*
     * redraw co-edit indicator of grid cell for this given sheet 
     * use together with the above "removeIndicator" function 
     */
    drawIndicator: function(sheet)
    {
    	if (!sheet) return;
    	for (var i = 0; i < this.collaborators.length; ++i) {
    		var c = this.collaborators[i];
    		var ref = c.getLockCellRef();
    		if (ref && ref.sheetName == sheet)
    			// can't use c.lockCell(ref), it will try to release any lock 
    			// c.lockCell(ref);
    			this.editor.lockCell(ref, c.getColor(), c.getUserId());
    	}
    },
    
	notify: function(source, event)
	{
		var cnst = websheet.Constant;
		if(event._type != cnst.EventType.DataChange) 
			return;
		
		var s = event._source;
		var parsedRef = websheet.Helper.parseRef(s.refValue);
		if(!parsedRef)
			return;
		
		var docObj = this.editor.getDocumentObj();
		var sheetName = s.oldSheetName || docObj.getSheetName(parsedRef.sheetName);
		
    	for (var i = 0; i < this.collaborators.length; ++i) 
    	{
    		var collaborators = this.collaborators[i];
			var ref = collaborators.getLockCellRef();
			if (!ref || ref.sheetName != sheetName) 
				continue;
			
			var start , end ;
			if( s.refType == cnst.OPType.ROW )
			{
				var start = parsedRef.startRow, end = parsedRef.endRow ;
				if(s.action == cnst.DataChange.PREDELETE)
				{
					if(ref.startRow >= start && ref.startRow <= end)
						collaborators.clearLockCellRef();
					else if(ref.startRow > end)
						ref.startRow -= end - start + 1;
				}	
				else if(s.action == cnst.DataChange.PREINSERT)
				{
					if( start <= ref.startRow )
						ref.startRow += end - start + 1;
				}	
			}	
			else if( s.refType == cnst.OPType.COLUMN)
			{
				var start = parsedRef.startCol;
				var end = parsedRef.endCol;
				end = end ? end : start;
				var col = ref.startCol;
				if(s.action == cnst.DataChange.PREDELETE)
				{
					if(col >= start && col <= end)
						collaborators.clearLockCellRef();
					else if(col > end)
					{
						col -= end - start + 1;
						ref.startCol = col;
					}
				}	
				else if(s.action == cnst.DataChange.PREINSERT)
				{
					if( start <= col )
					{
						col += end - start + 1;
						ref.startCol = col;
					}	
				}
			}	
			else if(s.refType == cnst.OPType.SHEET)
			{
				if(s.action == cnst.DataChange.PREDELETE)
				{
					collaborators.clearLockCellRef();
				}	
				else if(s.action == cnst.DataChange.SET)
				{
					if( s.newSheetName )
					{
						ref.sheetName = s.newSheetName;
					}	
				}	
			}	
    	}
	},
    
    updateIndicator: function(sheet ) 
    {
//    	this.removeIndicator(sheet);
    	this.drawIndicator(sheet);
    }
});