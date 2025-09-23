dojo.provide("concord.widgets.ProfileTypeAhead");
dojo.require("dijit.form.ComboBox");
dojo.require("concord.widgets.PeopleDataStore");
dojo.require("concord.util.BidiUtils");
dojo.declare(
	"concord.widgets.ProfileTypeAhead",
	[dijit.form.ComboBox],
	{
		constructor: function(args){	
			var isExternal =args.isExternal;
			var url = contextPath + '/api/people?method=searchProfiles';
			if(isExternal) url = "/files/form/api/myshares/users/feed?format=json&pageSize=100&sK=modifiedByName&sO=desc&searchType=fastlist";
			this.store = new concord.widgets.PeopleDataStore(
			{
				url: (!BidiUtils.isBidiOn()) ? url	: (url + '&bidiTextDir=' + BidiUtils.getTextDir()), isExternal: isExternal		
			});		
		},
		searchAttr: "name",
		queryExpr: "*${0}*",
		autoComplete: false,
		hasDownArrow: false
	}
);

