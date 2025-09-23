dojo.provide("concord.widgets.sidebar.UnifiedEditorToken");
dojo.require("concord.widgets.sidebar.EditorToken");
dojo.require("concord.widgets.sidebar.EditorIcon");
dojo.require("concord.widgets.sidebar.EditorColorIndicator");
var common_message = {
	'prefix': "com.ibm.docs.editor.message_for_",
	'color_on' : 1,
	'color_off' : 2,
	'on_line' : 3,
	'off_line' : 4
};
dojo.declare("concord.widgets.sidebar.UnifiedEditorToken",[concord.widgets.sidebar.EditorToken],{
	TokenTemplate:null,
	//cloneList:null,
	postCreate: function () {
		//this.cloneList = [];
		if (this.TokenTemplate)
		{
			this.userId = this.TokenTemplate.userId;
			this.isLoadingFinished = true;
			this.domNode.className = this.TokenTemplate.domNode.className;
			this.colorOn = this.TokenTemplate.colorOn;
			this.isSessionOnline = this.TokenTemplate.isSessionOnline;
			this.isUsingInitialName = this.TokenTemplate.isUsingInitialName;
			{
				var divNode = document.createElement('div');
				dojo.addClass(divNode,"default_photo_contianer default_photo_base");
				if (this.isUsingInitialName)
				{
					var initialNameNnode = dojo.clone(this.TokenTemplate.icon.getImgNode());
					if (initialNameNnode.attributes.getNamedItem("aria-label"))
						initialNameNnode.attributes.removeNamedItem("aria-label");
					if (initialNameNnode.attributes.getNamedItem("tabindex"))
						initialNameNnode.attributes.removeNamedItem("tabindex");
					if (initialNameNnode.attributes.getNamedItem("role"))
						initialNameNnode.attributes.removeNamedItem("role");			
					if (initialNameNnode.attributes.getNamedItem("id"))
						initialNameNnode.attributes.removeNamedItem("id");
					
					initialNameNnode.className = "initial_name";
					divNode.appendChild(initialNameNnode);
				}
				else
				{
					var pic = document.createElement('img');
					pic.src = this.TokenTemplate.icon.getImgNode().src;
					pic.alt = "Photo";
					dojo.addClass(pic,"default_photo_base");
					divNode.appendChild(pic);
				}
				
				this.iconNode.appendChild(divNode);
			}
			this.indicatorNode.appendChild(dojo.clone(this.TokenTemplate.indicator.domNode));
		}
	},
	turnColor: function (bDisable) {
	},
	showColor: function() {
		dojo.removeClass(this.domNode,"editor-without-color");
		dojo.addClass(this.domNode,"editor-with-color");
		//dojo.publish(common_message['prefix']+this.userId,[common_message['color_on']]);
		/*for (var i = 0;i< this.cloneList.length;i++)
		{
			dojo.removeClass(this.cloneList[i],"editor-without-color");
			dojo.addClass(this.cloneList[i],"editor-with-color");
		}*/
	},
	hideColor: function() {
		dojo.removeClass(this.domNode,"editor-with-color");
		dojo.addClass(this.domNode,"editor-without-color");
		//dojo.publish(common_message['prefix']+this.userId,[common_message['color_off']]);
		/*for (var i = 0;i< this.cloneList.length;i++)
		{
			dojo.removeClass(this.cloneList[i],"editor-with-color");
			dojo.addClass(this.cloneList[i],"editor-without-color");
		}*/
	},
	generateClone: function(container) {
		var cloned = dojo.clone(this.domNode);
		//this.cloneList.push(cloned);
		container.appendChild(cloned);
		
		while (dojo.hasClass(cloned,"editor-with-color"))
			dojo.removeClass(cloned,"editor-with-color");
		
		if (!dojo.hasClass(cloned,"editor-without-color"))
			dojo.addClass(cloned,"editor-without-color");
		
		while (dojo.hasClass(cloned,"session_offline"))
			dojo.removeClass(cloned,"session_offline");
		
		if (!dojo.hasClass(cloned,"session_online"))
			dojo.addClass(cloned,"session_online");
			
		if (cloned.attributes.getNamedItem("aria-label"))
			cloned.attributes.removeNamedItem("aria-label");
		if (cloned.attributes.getNamedItem("tabindex"))
			cloned.attributes.removeNamedItem("tabindex");
		if (cloned.attributes.getNamedItem("role"))
			cloned.attributes.removeNamedItem("role");			
		if (cloned.attributes.getNamedItem("id"))
			cloned.attributes.removeNamedItem("id");
		cloned.className = "editor-without-color session_online";
		/*container.userTokenMessageHandler = dojo.subscribe(common_message['prefix']+this.userId,function(data) {
			if (data == common_message['color_on'])
			{
				dojo.removeClass(cloned,"editor-without-color");
				dojo.addClass(cloned,"editor-with-color");
			}
			else if (data == common_message['color_off']) 
			{
				dojo.removeClass(cloned,"editor-with-color");
				dojo.addClass(cloned,"editor-without-color");
			}
			else if (data == common_message['on_line'])
			{
				dojo.removeClass(cloned,"session_offline");
				dojo.addClass(cloned,"session_online");
			}
			else if (data == common_message['off_line'])
			{
				dojo.removeClass(cloned,"session_online");
				dojo.addClass(cloned,"session_offline");
			}
		});
		*/
	},
	sessionOnline: function() {
		if (this.isSessionOnline)
			return;
		this.isSessionOnline = true;
		dojo.removeClass(this.domNode,"session_offline");
		dojo.addClass(this.domNode,"session_online");
		//dojo.publish(common_message['prefix']+this.userId,[common_message['on_line']]);
	},
	sessionOffline: function() {
		if (!this.isSessionOnline)
			return;
		this.isSessionOnline = false;
		dojo.removeClass(this.domNode,"session_online");
		dojo.addClass(this.domNode,"session_offline");
		//dojo.publish(common_message['prefix']+this.userId,[common_message['off_line']]);
		
	}
});
