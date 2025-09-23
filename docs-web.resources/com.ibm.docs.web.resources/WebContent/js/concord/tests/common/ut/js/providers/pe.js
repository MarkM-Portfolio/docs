/**
 * provide a mock pe for common unit testing
 */


dojo.provide("concord.tests.common.ut.js.providers.pe");
dojo.require("dojo._base.url");
dojo.require("concord.util.acf");
dojo.require("concord.util.uri");
dojo.require("concord.main.Settings");
dojo.require("concord.beans.User");
dojo.require("concord.beans.Editors");
dojo.require("concord.beans.EditorProxy");
dojo.require("concord.beans.EditorStore");

window.g_locale = "en_US";
window.g_bidiOn = false;
window.contextPath = "/docs";

dojo.declare("concord.tests.common.ut.js.providers.pe", null, {
	scene: {},
	session: {},
	authenticatedUser: null,
	
	constructor: function()
	{
		// authenticatedUser
		var userEntry = {
				"addr": "",
				"cust_id": "ibm",
				"disp_name": "test2",
				"dn": "test2@cn.ibm.com",
				"email": "test2@cn.ibm.com",
				"entitlement": 3,
				"entitlement_allowed": false,
				"id": "E66028A9-2177-DF19-8525-77D60072EFA2",
				"is_external": "",
				"job_title": "",
				"mobile": "",
				"org_id": "ibm",
				"org_name": "",
				"photo": "/docs/images/NoPhoto_Person_48.png",
				"role_id": "1",
				"role_name": "user",
				"tel": ""
		};
		this.authenticatedUser = new concord.beans.User(userEntry);
		this.authenticatedUser.entitlements = {};
		this.authenticatedUser.entitlements.assignment = [{"name": "assignment", "booleanValue": true}];

		this.settings = new concord.main.Settings();

		this.scene = new concord.tests.common.ut.js.providers.pe.scene();
		this.lotusEditor = new concord.tests.common.ut.js.providers.pe.lotusEditor();
	}
});


dojo.provide("concord.tests.common.ut.js.providers.pe.scene");
dojo.declare("concord.tests.common.ut.js.providers.pe.scene", null, {
	docType: "text",
	editorsStore: null,
	session: null,
	
	constructor: function(){
		this.session = new concord.tests.common.ut.js.providers.pe.session();
	},
	getEditorStore: function()
	{
		if (!this.editorsStore)
		{
			this.editorsProxy = new concord.beans.EditorProxy("../data/json/test-editors.json");
			this.editorsStore = new concord.beans.EditorStore(null, null, this.editorsProxy);
			this.editorsProxy.getAll(true); // must get the content synchronize		
		}
		return this.editorsStore;
	},
	
	getLocale: function()
	{
		return window.g_locale;
	},
	
	getURI: function()
	{
		return "";
	},
	
	isHTMLViewMode: function()
	{
		return false;
	},
	
	enabledTrackChange: function()
	{
		return false;
	},
	
	setBrowserWidth: function()
	{
		
	},
		
	getSession: function()
	{
		return this.session;
	},
	
	sidebarResized: function()
	{
		
	},
	
	getDocTitle: function()
	{
		return "testDoc";
	}
});

dojo.provide("concord.tests.common.ut.js.providers.pe.session");
dojo.declare("concord.tests.common.ut.js.providers.pe.session", null, {
	
	constructor: function(){

	}
});

dojo.provide("concord.tests.common.ut.js.providers.pe.lotusEditor");
dojo.declare("concord.tests.common.ut.js.providers.pe.lotusEditor", null, {
	_shell: null,
	constructor: function(){
		this._shell = new concord.tests.common.ut.js.providers.pe.lotusEditorShell();
	}	
});

dojo.provide("concord.tests.common.ut.js.providers.pe.lotusEditorShell");
dojo.declare("concord.tests.common.ut.js.providers.pe.lotusEditorShell", null, {
	_view: null,
	constructor: function(){
		this._view = concord.tests.common.ut.js.providers.pe.lotusEditorView();
	},
	view: function()
	{		
		return this._view;
	}
});

dojo.provide("concord.tests.common.ut.js.providers.pe.lotusEditorView");
dojo.declare("concord.tests.common.ut.js.providers.pe.lotusEditorView", null, {
	page: null,
	constructor: function(){
		this.page = new concord.tests.common.ut.js.providers.pe.lotusEditorPage();
	},
	getPage: function(index)
	{		
		return this.page;
	}
});

dojo.provide("concord.tests.common.ut.js.providers.pe.lotusEditorPage");
dojo.declare("concord.tests.common.ut.js.providers.pe.lotusEditorPage", null, {
	width: 150,
	constructor: function(){
	},
	getWidth: function()
	{		
		return this.width;
	}
});