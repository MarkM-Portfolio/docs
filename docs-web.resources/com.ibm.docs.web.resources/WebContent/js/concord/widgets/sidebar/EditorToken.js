dojo.provide("concord.widgets.sidebar.EditorToken");
dojo.require("concord.widgets.sidebar.EditorIcon");
dojo.require("concord.widgets.sidebar.EditorColorIndicator");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.declare("concord.widgets.sidebar.EditorToken",[dijit._Widget, dijit._Templated], {
	userId:"",
	userName:"",
	userColor:"",
	colorDisabled:false,
	colorOn:false,
	clickHandler:null,
	subscribeInitObj:null,
	isLoadingFinished:false,
	icon:null,
	indicator:null,
	unfiedMe:null,
	email:null,
	li:null,
	isUsingInitialName:null,
	templateString:'<span data-dojo-attach-point="containerNode">' +
					'<span data-dojo-attach-point="iconNode"></span>' +
					'<span data-dojo-attach-point="indicatorNode"></span>' +
					'</span>',
	widgetsInTemplate:false,
	isSessionOnline:false,
	showColor: function() {
		//if (!this.isLoadingFinished)
		//	return;
		dojo.removeClass(this.domNode,"editor-without-color");
		dojo.addClass(this.domNode,"editor-with-color");
		if (pe.scene.enabledTrackChange())
			pe.scene.turnOnColorShading(true,this.userId);
		if (this.unfiedMe)
			this.unfiedMe.showColor();
		if (this.icon)
			this.icon.setColorOn('on');
	},
	hideColor: function(noBroadcast) {
		//if (!this.isLoadingFinished)
		//	return;
		dojo.removeClass(this.domNode,"editor-with-color");
		dojo.addClass(this.domNode,"editor-without-color");
		if (pe.scene.enabledTrackChange())
			pe.scene.turnOnColorShading(false,this.userId);
		if (this.unfiedMe)
			this.unfiedMe.hideColor();
		if (this.icon && !noBroadcast)
			this.icon.setColorOn('off');
	},
	switchColor:function(refreshUIOnly) {
		this.colorOn = !this.colorOn;
		if (this.colorOn)
			this.showColor();
		else
			this.hideColor();
		if (refreshUIOnly != true)
			pe.scene.getEditorStore().updateIndicator(pe.authenticatedUser.getId(), this.userId, this.colorOn);
	},
	turnColor: function (bDisable) {
		//if (!this.isLoadingFinished)
		//	return;
		this.colorDisabled = bDisable;
		if (!this.colorDisabled)
		{
			if (!this.clickHandler)
				this.clickHandler = dojo.connect(this.domNode,"onclick",this,"switchColor");
			if (this.colorOn)
				this.showColor();
			else
				this.hideColor();
		}
		else
		{
			if (this.clickHandler)
				dojo.disconnect(this.clickHandler);
			this.clickHandler = null;
			this.hideColor(true);
			if (this.icon)
				this.icon.setColorOn('disable');
			//this.colorOn = false;
		}
	},
	postCreate: function () {
		this.subscribeInitObj = dojo.subscribe("com.ibm.docs.editortokenloading_"+this.userId,dojo.hitch(this,"loadingFinished"));
		var isMySelf = (pe.authenticatedUser.getId() == this.userId?true:false);
		//this.colorOn = isMySelf;
		//this.isSessionOnline = isMySelf;
		this.colorDisabled = !pe.settings.getIndicator();
		this.icon = new concord.widgets.sidebar.EditorIcon({userId:this.userId,userName:this.userName,userColor:this.userColor,email:this.email,li:this.li});
		this.iconNode.appendChild(this.icon.domNode);
		this.indicator = new concord.widgets.sidebar.EditorColorIndicator({userColor:this.userColor});
		this.indicatorNode.appendChild(this.indicator.domNode);
		dojo.subscribe("concord.colorTurning",dojo.hitch(this,"turnColor"));
		this.turnColor(this.colorDisabled);
		dojo.addClass(this.domNode,this.isSessionOnline?"session_online":"session_offline");
		this.isLoadingFinished = true;
	},
	grabFocus: function()
	{
		this.icon.grabFocus();
	},
	
	KeyDown: function (event)
	{
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if (key == 17)
			this.contDown = true;
	},
	KeyUp: function (event)
	{
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if (key == 17)
			this.contDown = false;
	},
	KeyPress: function (event)
	{
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if (event.keyCode == 13 && !this.contDown)
		{
			this.switchColor();
		}
		else if(key == dojo.keys.F2 && event.shiftKey){
			conditionRenderer.grabSTBarFocus();
			event.preventDefault();
		}
	},
	loadingFinished: function(isUsingInitial) {
		this.isUsingInitialName = isUsingInitial;
		if (this.subscribeInitObj != null)
		{
			dojo.unsubscribe(this.subscribeInitObj);
			this.subscribeInitObj = null;
		}
		if (this.isLoadingFinished)
		{
			this.unfiedMe = new concord.widgets.sidebar.UnifiedEditorToken({'TokenTemplate':this});
			window.conditionRenderer.registerUnifiedToken(this.userId,this.unfiedMe);

			dojo.connect(this.icon.getImgNode(),"onkeypress",this,"KeyPress");
			dojo.connect(this.icon.getImgNode(),"onkeydown",this,"KeyDown");
			dojo.connect(this.icon.getImgNode(),"onkeyup",this,"KeyUp");
		}
		else
			setTimeout(dojo.hitch(this,"loadingFinished",isUsingInitial),500);
	},
	sessionOnline: function() {
		if (this.isSessionOnline)
			return;
		this.isSessionOnline = true;
		dojo.removeClass(this.domNode,"session_offline");
		dojo.addClass(this.domNode,"session_online");
		if (this.unfiedMe)
			this.unfiedMe.sessionOnline();
		if (this.icon)
			this.icon.setSessionOnline(true);
	},
	sessionOffline: function() {
		if (!this.isSessionOnline)
			return;
		this.isSessionOnline = false;
		dojo.removeClass(this.domNode,"session_online");
		dojo.addClass(this.domNode,"session_offline");
		if (this.unfiedMe)
			this.unfiedMe.sessionOffline();
		if (this.icon)
			this.icon.setSessionOnline(false);
		
	}
});
