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

dojo.provide("websheet.AutoFilter.FilterConditionBtn");
dojo.require("dijit.form.DropDownButton");
dojo.require("concord.util.BidiUtils");

dojo.requireLocalization("websheet.AutoFilter","FilterConditionBtn");

dojo.declare('websheet.AutoFilter.FilterConditionBtn', dijit.form.DropDownButton,{
	
	conditions: ["", "=", "!=", ">", ">=", "<", "<=", "*a*", "!*a*", "a*", "!a*", "*a", "!*a"],
	
	selected: null,
	
	constructor: function()
	{
		this.nls = dojo.i18n.getLocalization("websheet.AutoFilter","FilterConditionBtn");
	},
	
	//For ACC
	closeDropDown: function(/*Boolean*/ focus){
		this.inherited(arguments);
		dijit.removeWaiState(this.domNode, "expanded");
		(!this._opened)&& dijit.setWaiState(this.focusNode, "expanded", "false");
		dojo.removeClass(this.domNode, "dropDownExpanded");
	},
	
	//For ACC
	openDropDown: function()
	{
		this.inherited(arguments);
		dijit.removeWaiState(this.domNode, "expanded");
		this._opened && dijit.setWaiState(this.focusNode, "expanded", "true");
		dojo.removeClass(this.domNode, "dropDownExpanded");
		this._opened && dojo.addClass(this.domNode, "dropDownExpanded");
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		dojo.style(this.containerNode,{"width":"160px", "textAlign":(BidiUtils.isGuiRtl() ? "right" : "left"), "fontWeight":"normal"});
		
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';		
		this.dropDown = new dijit.Menu({"class":"lotusActionMenu", dir: dirAttr});
		
		for(var i=0;i<this.conditions.length;i++)
		{
			var condition = this.conditions[i];
			var item = new dijit.MenuItem({label:this.nls[condition] || "&nbsp;", dir: dirAttr});
			dijit.setWaiState(item.domNode,"label",this.nls[condition] || "");
			this.connect(item,"onClick", dojo.hitch(this,function(condition)
			{
				this.setCondition(condition);
			},condition));
			this.dropDown.addChild(item);
		}
	},
	
	setCondition: function(condition)
	{
		this.setLabel(this.nls[condition] || "");
		this.selected = condition;
	}
	
});