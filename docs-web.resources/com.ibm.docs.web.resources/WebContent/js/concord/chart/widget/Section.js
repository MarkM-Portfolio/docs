/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.chart.widget.Section");

dojo.declare("concord.chart.widget.Section", [dijit._Widget, dijit._Templated], {
	//widgetsInTemplate: true,
	isContainer: true,
	templateString: dojo.cache("concord.chart.widget", "templates/Section.html"),
	titleString:"",
	
	constructor: function(params, node){
		this.titleString = params.title;
	},
	
	onExpand: function()
	{
		
	},
	
	onToggle: function()
	{
		
	},

    postCreate: function(){
    	this.inherited(arguments);
    	
    	var src = window.contextPath + window.staticRootPath + "/images/blank.gif";
    	this.img.src = src;
    	this.titleText.innerHTML = this.titleString;
    	this.titleText.title = this.titleString;
    	dijit.setWaiState(this.titleText,"label",this.titleString);
    	
    	this.containerNode.parentNode.title = "";
    	
    	this.connect(this.secHeader,"onclick", dojo.hitch(this,"_click"));
    	this.connect(this.secHeader,"onkeypress", dojo.hitch(this,function(e)
    	{
    		if(e.keyCode==dojo.keys.ENTER)
    			this._click();
    	}));
    },
    
    setTitle: function(text)
    {
    	this.titleText.innerHTML = text;
    	this.titleText.title = text;
    	dijit.setWaiState(this.titleText,"label",text);
    },
    
    _click: function()
    {
    	if(dojo.hasClass(this.img,"lotusTwistyOpen")){
			this.reset();
		}else{
			this.expand();
		}
		//close other sections
		var par = this.domNode.parentNode;
		var allSiblings = par.children;
		for(var i = 0; i< allSiblings.length; i++)
		{
		  var tmp = allSiblings[i];
		  if(tmp != this.domNode && dojo.hasClass(tmp,"lotusSection2")){
		        var wid = dijit.byId(tmp.id);
		        dojo.removeClass(wid.img,"lotusTwistyOpen");
		        dojo.addClass(wid.img,"lotusTwistyClosed");
		        dojo.addClass(wid.containerNode,"lotusHidden");  
		  }
		}
    },
    
    expand: function(){
    	dojo.removeClass(this.img,"lotusTwistyClosed");
		dojo.addClass(this.img,"lotusTwistyOpen");
		dojo.removeClass(this.containerNode,"lotusHidden");
		this.onExpand();
    },
    
    reset: function(){
    	dojo.removeClass(this.img,"lotusTwistyOpen");
		dojo.addClass(this.img,"lotusTwistyClosed");
		dojo.addClass(this.containerNode,"lotusHidden");
		
		this.onToggle();
    },
    
    isHidden: function()
    {
    	return dojo.hasClass(this.containerNode,"lotusHidden");
    }
});