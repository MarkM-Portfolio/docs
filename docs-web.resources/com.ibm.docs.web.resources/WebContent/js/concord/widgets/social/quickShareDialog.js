dojo.provid("concord.widgets.social.QSDialog");
dojo.require("concord.widgets.concordDialog");
dojo.declare("concord.widgets.social.QSDialog", concord.widgets.concordDialog, {
	mainMsg:null,
	constructor: function(params)
	{
		this.mainMsg = "";
		if (params && params.message && params.messages != '')
			this.mainMsg = params.message;
		var args = [null,params.concordTitle,params.oKLabel,false,params];
		this.inherited(args);
	},
	createContent: function (contentDiv) 
	{
		if (contentDiv)
			contentDiv.innerHTML = this.mainMsg;
	}
});