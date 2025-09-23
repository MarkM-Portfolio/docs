dojo.provide("concord.widgets.sidebar.EditorIcon");
dojo.require("concord.widgets.social.conditionRenderer");
dojo.require("dojo.i18n");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Tooltip");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets.sidebar","EditorIcon");
dojo.declare("concord.widgets.sidebar.EditorIcon",[dijit._Widget, dijit._Templated], {
	userId:"",
	userName:"",
	userColor:"",
	imgContainerNode:null,
	templateString:'<span data-dojo-attach-point="containerNode"></span>',
	widgetInTemplate:false,
	nls:null,
	user_label:'',
	sessionStatus_label:'',
	STStatus_label:'',
	//photo_label:'',
	colorIndicator_label:'',
	BIZCard_label:'',
	//label_template:'',
	isFinished:false,
	email:null,
	isBidi:false,
	isUsingInitialName:false,
	imgNode:null,
	initialNameNode:null,
	li:null,
	isOutline:false,
	setUsingInitialName: function() 
	{
		this.isUsingInitialName = true;
	},
	postCreate: function () {
		this.isBidi = BidiUtils.isBidiOn();
		if (this.isBidi)
			this.userName = BidiUtils.addEmbeddingUCC(this.userName);
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","EditorIcon");
		//this.label_template = this.nls.label_template;
		this.user_label = dojo.string.substitute(this.nls.user_label_template, { 'userName' : this.userName });
		
		
		dojo.addClass(this.domNode,"docs_st_biz");
		if (window.conditionRenderer)
		{
			var item = {
				UID: this.userId,
				UserName: this.userName,
				UserColor: this.userColor,
				icon: this,
				email:this.email,
				li:this.li
			}; 
			this.imgContainerNode = window.conditionRenderer.renderUserIcon(item);
			this.containerNode.appendChild(this.imgContainerNode);
		}
		//this.isFinished = true;
	
	},
	loadingFinished: function()
	{
		this.isFinished = true;
		this.generateLabel();
		this.connectEvents();
	},
	
	
	MouseOver: function (event)
	{
		this.getImgNode().focus();
		this.RemoveOutlineClass(event);
	},
	grabFocus: function (event)
	{
		this.getImgNode().focus();
	},
	MouseOut: function (event)
	{
		this.getImgNode().blur();
	},
	AddOutlineClass: function (event)
	{
		if (!this.isOutline)
		{
			this.isOutline = true;
			dojo.addClass(this.getImgNode(),"key_navigating_dark");
		}
		dijit.Tooltip.show(this.userName,this.getImgNode(),["below"]);
	},
	RemoveOutlineClass: function (event)
	{
		if (this.isOutline)
		{
			this.isOutline = false;
			dojo.removeClass(this.getImgNode(),"key_navigating_dark");
		}
		dijit.Tooltip.hide(this.getImgNode());
	},
	connectEvents: function()
	{
		if (!this.getImgNode())
		{
			setTimeout(dojo.hitch(this,"connectEvents"),1000);
			return;
		}
		dojo.connect(this.getImgNode(),"onmouseover",this,"MouseOver");
		dojo.connect(this.getImgNode(),"onmouseout",this,"MouseOut");
		dojo.connect(this.getImgNode(),"onblur",this,"RemoveOutlineClass");
		dojo.connect(this.getImgNode(),"onfocus",this,"AddOutlineClass");
	},
	setImgNode: function(node) 
	{
		if (this.isUsingInitialName)
			this.initialNameNode = node;
		else
			this.imgNode = node;
	},
	getImgNode: function() {
		return this.isUsingInitialName?this.initialNameNode:this.imgNode;
	},
	generateLabel: function() {
		if (!this.isFinished)
			return;
		if (!this.getImgNode())
		{
			setTimeout(dojo.hitch(this,"generateLabel"),1000);
			return;
		}
		var dict = {
			'user_label': this.user_label,
			'sessionStatus_label': this.sessionStatus_label,
			'STStatus_label': this.STStatus_label,
			//'photo_label': this.photo_label,
			'colorIndicator_label': this.colorIndicator_label,
			'BIZCard_label': this.BIZCard_label
		};
		var label = dojo.string.substitute(this.nls.label_template, dict);
		dijit.setWaiState(this.getImgNode(),'label',label);
	},
	setLabel:function(labelName,labelContent) {
		//if (labelName == 'user')
		//	user_label = labelContent;
		if (labelName == 'session')
			this.sessionStatus_label = labelContent;
		else if (labelName == 'ST')
			this.STStatus_label = labelContent;
		else if (labelName == 'BIZCard')
			this.BIZCard_label = labelContent;
		//else if (labelName == 'photo')
		//	this.photo_label = labelContent;
		else if (labelName == 'color')
			this.colorIndicator_label = labelContent;
			
		this.generateLabel();
	},
	STStatusUpdate: function(model) 
	{
		var statusString = '';
		var statusCode = model.status;
		switch (statusCode)
		{
			case 1:
				statusString = this.nls.stStatusAvailable;
				break;
			case 2:
			case 4:
				statusString = this.nls.stStatusAway;
				break;
			case 3:
				statusString = this.nls.stStatusDnd;
				break;
			case 5:
				statusString = this.nls.stStatusMeeting;
				break;
			case 6:
				statusString = this.nls.stStatusMobileAvailable;
				break;
			case 7:
				statusString = this.nls.stStatusMobileAway;
				break;
			case 8:
				statusString = this.nls.stStatusMobileDnd;
				break;
			case 10:
				statusString = this.nls.stStatusMobileMeeting;
				break;
			default:
				statusString = this.nls.stStatusOffline;
				break;
		}
		var label = dojo.string.substitute(this.nls.STStatus_label_template, { 'ST_STATUS' : statusString });
		this.setLabel('ST',label);
	},
	setBIZCardLabel: function(labelStr)
	{
		var label = dojo.string.substitute(this.nls.BIZCard_label_template, { 'BIZStatus' : labelStr });
		this.setLabel('BIZCard',label);
	},
	setSessionOnline: function(isSessionOnline)
	{
		var label = '';
		if (isSessionOnline)
			label = this.nls.sessionOnline;
		else
			label = this.nls.sessionOffline;
			
		this.setLabel('session',label);
	},
	setColorOn: function(isColorOn)
	{
		var label = '';
		if (isColorOn == 'on')
			label = this.nls.color_on_template;
		else if (isColorOn == 'off')
			label = this.nls.color_off_template;
		else if (isColorOn == 'disable')
			label = this.nls.color_disable_template;
			
		this.setLabel('color',label);
	},
	setPhotoLabel: function(isFromProfile)
	{
		/*var label = '';
		if (isFromProfile)
			label = this.nls.profilePhoto;
		else
			label = this.nls.docsPhoto;
			
		this.setLabel('photo',label);
		*/
	}
});