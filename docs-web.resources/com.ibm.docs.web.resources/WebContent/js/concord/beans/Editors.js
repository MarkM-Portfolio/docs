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

dojo.provide("concord.beans.Editors");
dojo.provide("concord.beans.EditorItem");
dojo.require("concord.util.acf");

/**
 * @author dragonli
 */
dojo.declare("concord.beans.Editors", null, {
	items: null,
	
	constructor: function (e)
	{
		var list = e.editors;
		this.items = [];
		for (var i = 0; i < list.length; i++)
		{
			this.items.push(new concord.beans.EditorItem(list[i]));
		}

		// initial indicators for current editor
		if(this.items[0]) {
			var curUser = this.items[0]; 
			var curId = curUser.getEditorId();
			for (var i = 0; i < this.items.length; i++) {
				var id = this.items[i].getEditorId();
				if(!curUser.getIndicator(id)) { // there is no indicator defined
					if(curId == id) {
						curUser.setIndicator(id, false); // hide color shading for current user by default 
					}
					else {
						curUser.setIndicator(id, true);  // show color shading for co-editors by default
					}
				}
			}
			pe.curUser = curUser;
		}		
	},
	
	getEditorCount: function ()
	{
		return this.items.length;
	},
	
	getEditor: function (i)
	{
		return this.items[i];
	},
	
	appendEditor: function (editor)
	{
		this.items.push(editor);
	},
	
	updateEditor: function(editor) {
		throw("This function in not implemented!");
	},
	
	// indicators is a josn, this is to update the an indicator of indicators josn by id and indicator id
	updateEditorIndicator: function(id, indicatorId, show) {
		  for (var i = 0; i < this.items.length; i++)
		  {
			  var c = this.items[i];
			  if (c.getEditorId() == id)
			  {
				  c.setIndicator(indicatorId, show);
			  }
		  }		
	},
	
	// indicators is a josn, this is to update the whole indicators josn by id
	updateEditorIndicators: function(id, indicators) {
		  for (var i = 0; i < this.items.length; i++)
		  {
			  var c = this.items[i];
			  if (c.getEditorId() == id)
			  {
				  c.setIndicators(indicators);
			  }
		  }		
	}	
});

dojo.declare("concord.beans.EditorItem", null, {
	e: null,
	constructor: function(e){
	    if (e) {
	    	this.e = e;
	    }	        
	    else {
	    	this.e = new Object();	
	    }	        
	},

	getEditorId: function(){
	    return this.e.userId;
	},
	getOrgId: function(){
	    return this.e.orgId;
	},
	getName: function(){
	    if(this.e.displayName)
            return concord.util.acf.escapeXml(this.e.displayName,true);
	    return this.e.displayName;
	},
	getEditorColor: function(){
	    return this.e.color;
	},
    getLeaveSessionTime: function() {
        return this.e.leaveSession;
    },
	getEditorBorderColor: function(){
		return this.e.borderColor;
	}, 
	
	getDocId: function(){
	    return this.e.docId;
	},
    
	toJSObj: function(){
	    return this.e;
	},
	
	getIndicators: function() {
		return this.e.indicators;
	},
	
	setIndicators: function(indicators) {
		this.e.indicators = indicators;
	},
	/**
	* 	time 	 -- the created time stamp for last created/append comment item
	*	number   -- the unread comments number at widgetStore last updated time
	*/
	getUnreadCommentsStatus: function() {
		var t_n = this.getIndicator('commentsstatus');
		t_n = t_n ? t_n:'0_0';
		var currentTime = 0;//new Date().getTime();
		var list = t_n.split('_');
		if(list.length == 2){
			return {time:Math.abs(list[0]||currentTime),number:Math.abs(list[1]?(isNaN(list[1])?0:list[1]):0)}; 
		}
		return {time:currentTime,number:0};
	},
	/**
	* 	time 	 -- the created time stamp for last created/append comment item
	*	number   -- the unread comments number at widgetStore last updated time
	*/
	setUnreadCommentsStatus: function(status)
	{
		var value = status.time + '_' + status.number;
		this.unreadCommentsStatus = value;
		this.setIndicator('commentsstatus', value);
		var curId = pe.authenticatedUser.getId();
		pe.scene.getEditorStore().updateIndicator(curId,'commentsstatus',value);
	},	
	getIndicator: function(indicator) {
		var indicators = this.e.indicators;
		if( Object.prototype.toString.call( this.e.indicators ) === '[object Array]' ) {
			indicators = this.e.indicators[0];
		}
		return indicators ? indicators[indicator] : null;
	},
	
	setIndicator: function(indicator, show) {
		if(!this.e.indicators)
			this.e.indicators = new Object();
				
		if( Object.prototype.toString.call( this.e.indicators ) === '[object Array]' ) {
			if(indicator == 'commentsstatus'){
				this.e.indicators[0][indicator] = show;
			} else if(show)
				this.e.indicators[0][indicator] = "show";
			else
				this.e.indicators[0][indicator] = "hide";			
		}
		else {
			if(indicator == 'commentsstatus'){
				this.e.indicators[indicator] = show;
			} else if(show)
				this.e.indicators[indicator] = "show";
			else
				this.e.indicators[indicator] = "hide";			
		}
	},	
	
	clone: function()
	{
		//return dojo.clone(this.e); // -- There is issues for the clone method
		var cloned = new Object();
		cloned.userId = this.e.userId;
		cloned.orgId = this.e.orgId;
		cloned.displayName = this.e.displayName;
		cloned.color = this.e.color;
		cloned.borderColor = this.e.borderColor;
		cloned.docId = this.e.docId;
		//cloned.indicators we don't clone indicators
	
		return cloned;		
	}
});



