/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.DataValidation.ValidationWarning");
dojo.requireLocalization("websheet.DataValidation","Validation");

dojo.declare("websheet.DataValidation.ValidationWarning", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("websheet", "templates/ValidationWarning.html"),
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("websheet.DataValidation","Validation");
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dojo.addClass(this.cancel.domNode.firstChild, "dvButtonInner");
		dojo.addClass(this.removeAll.domNode.firstChild, "dvButtonInner");
		this.cancel.domNode.firstChild.setAttribute("style", "border: 0px solid !important; background-color: #FFFFFF !important; box-shadow: none !important;");
		this.removeAll.domNode.firstChild.setAttribute("style", "border: 0px solid !important; background-color: #FFFFFF !important; box-shadow: none !important;");
		if (BidiUtils.isGuiRtl()) {
			dojo.style(this.buttonContainer1, "textAlign", "left");
		}
	},
	
	show: function(){
		dojo.style(this.pane,"display", "");
		setTimeout(dojo.hitch(this.cancel, "focus"),500);
	},
	
	hide: function(){
		dojo.style(this.pane,"display", "none");
	},
	
	isShowing: function(){
		return dojo.style(this.pane,"display") != "none";
	},
	
	updateRef: function(address)
	{
		this.refAddr = address;
		if (BidiUtils.isBidiOn()) {
			var splits = address.split("!");
			splits[0] = BidiUtils.addEmbeddingUCC(splits[0]);
			this.refValue.innerHTML = splits.join("!");
		}
		else
			this.refValue.innerHTML = address;

		var parsedRef = websheet.Helper.parseRef(address);
		if(parsedRef.isValid()){
			this.warning.innerHTML = this.nls.mulInfo;
			dojo.removeClass(this.removeAll.domNode, "dvButtonCancel");
			dojo.addClass(this.removeAll.domNode, "dvButton");
			dojo.style(this.removeAll.domNode.firstChild, "color", "");
		}
		else{
			this.warning.innerHTML = this.nls.refAlert;
			dojo.removeClass(this.removeAll.domNode, "dvButton");
			dojo.addClass(this.removeAll.domNode, "dvButtonCancel");
			dojo.style(this.removeAll.domNode.firstChild, "color", "");
			var oriStyle = dojo.attr(this.removeAll.domNode.firstChild, "style");
			dojo.setAttr(this.removeAll.domNode.firstChild, "style", oriStyle + "color: #aaaaaa !important");
		}
	},
	
	getRefValue: function(){
		return this.refAddr;
	},
	
	resize: function(width)
	{
		this._paneWidth = width;
		if(width == "300"){
			dojo.style(this.pane, "marginLeft", "18px");
			dojo.style(this.pane, "marginRight", "18px");
			dojo.style(this.pane, "paddingLeft", "15px");
			dojo.style(this.pane, "paddingRight", "17px");
		}
		else{
			dojo.style(this.pane, "marginLeft", "2.5px");
			dojo.style(this.pane, "marginRight", "2.5px");
			dojo.style(this.pane, "paddingLeft", "8px");
			dojo.style(this.pane, "paddingRight", "10px");
		}
	}
});