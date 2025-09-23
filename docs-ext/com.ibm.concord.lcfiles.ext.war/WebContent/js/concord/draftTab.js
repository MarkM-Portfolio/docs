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

dojo.subscribe("lconn/share/app/start", function() {

dojo.provide("concord.draft");
dojo.registerModulePath("concord", "/concordfilesext/js/concord");
dojo.require("concord.global");
if(!concord.global.showConcordEntry()) return;

dojo.require("lconn.core.uiextensions");
dojo.require("lconn.files.scenes.AbstractSection");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord", "ccdfilesext");


dojo.provide("com.ibm.concord.lcext.DraftSection");
dojo.declare("com.ibm.concord.lcext.DraftSection", lconn.files.scenes.AbstractSection, {
   
   constructor: function(app, scene) {
      this.id = "draft";
      this.htmlId = "concord_draft";
      this.app = app;
      this.scene = scene;
      this.hidden = false;//app.
      this.nls2 = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
   },
  /*
  * Generate the name of the tab.  The item being displayed is passed to this method.
  */
   getName: function(app,doc) {
	return this.nls2.draft_tab_title;
   },

 /*
  * Called to display the body of the tab.  
  *    d - the HTML document for this tab
  *    div - the container for the contents of the tab
  *    doc - the item this tab is related to
  *    section - Equivalent to *this*
  *    opt - Contains references to the app and the scene
  */
   /*render: function(d, el, item, section, opt) {

   }*/
   render: function(d, div, doc, section, opt) {
      var app = opt.app;
      var routes = app.routes;
      var scene = opt.scene;
      var user = scene.user;
      var extension = doc.getExtension();
      var nls = app.nls.ABOUT_FILE;
      var nls2 = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");;
      var isExpanded = scene.isExpanded(section.id);

      var draft_format = {"ppt":1, "otp":1, "odp":1, 
			"ods":1, "ots":1,"xls":1, "xlsx":1,
			"docx":1,"doc":1,"odt":1,"ott":1};
      // for IBM Docs not supported documents
      if(extension == "" || draft_format[extension.toLowerCase()] != 1){
         var divb = d.createElement("div");
         divb.innerHTML = this.nls2.draft_doctype_valid;
      	 div.appendChild(divb);
      	 return;
	}
      // for other users that is not an EDITOR
      if(!doc.getPermissions().Edit){
         var divb = d.createElement("div");
         divb.innerHTML = this.nls2.draft_editor_valid;
      	 div.appendChild(divb);
      	 return;
      }

	var chkurl = glb_concord_url+"/api/docsvr/lcfiles/"+doc.getId()+"/draft";
	var resp, ioArgs;
	dojo.xhrGet({
		url: chkurl,
		handleAs: "json",
		preventCache: true,
		handle: function(r, io) {
			resp = r;
			ioArgs = io;
	  	},
	  	sync: true
	});
	if (resp instanceof Error)
	{
		var divb = d.createElement("div");
        divb.innerHTML = this.nls2.draft_not_found;
         
      	div.appendChild(divb);
      	return;
	}

	//For document that not editing by IBM Docs, 404 is returned
	var dft_dirty = resp.dirty;
	var dft_basever = resp.base_version;
	var dft_created = resp.created;
	var dft_lastedit = resp.modified;
	var dft_curedit = resp.editors;
	if (!dft_dirty && dft_curedit.length <=0 ){
          var divb = d.createElement("div");
          divb.innerHTML = this.nls2.draft_not_found;
         
      	  div.appendChild(divb);
      	  return;
	}

	var divb = d.createElement("div");
    var table = d.createElement("table");
    table.cellSpacing = table.cellPadding = 0;
    table.className = "lotusVertTable";
    var tbody = d.createElement("tbody");
      
    var createDate = doc.getPublished();
    var tr = d.createElement("tr");
    var th = d.createElement("th");
    th.scope = "row";
    th.appendChild(d.createTextNode(nls.ADDED));
    tr.appendChild(th);
    var td = d.createElement("td");
    var convert_dft_created = lconn.share.util.misc.date.convertAtomDate(dft_created);
    td.appendChild(d.createTextNode(dojo.string.substitute(this.nls2.draft_created,[convert_dft_created, dft_basever])));
    tr.appendChild(td);
    tbody.appendChild(tr);
      
    // for last edit
    var tr = d.createElement("tr");
    var th = d.createElement("th");
    th.scope = "row";
    th.appendChild(d.createTextNode(this.nls2.draft_latest_edit));
    tr.appendChild(th);
    var td = d.createElement("td");
    var convert_dft_lastedit = lconn.share.util.misc.date.convertAtomDate(dft_lastedit);
    td.appendChild(d.createTextNode(convert_dft_lastedit));
    tr.appendChild(td);
    tbody.appendChild(tr);
               
               
    // for current editing
    if(dft_curedit.length > 0){
    	var tr = d.createElement("tr");
    	var th = d.createElement("th");
    	th.scope = "row";
    	th.appendChild(d.createTextNode(this.nls2.draft_cur_editing));
    	tr.appendChild(th);
    	var td = d.createElement("td");
    	for (var i = 0, len=dft_curedit.length; i < len; i++)
    	{
    		var editor_a = d.createElement("a");
			//editor_a.href= "app/person/" + dft_curedit[i].userId;
			//editor_a.innerHTML = dft_curedit[i].displayName;
			editor_a.appendChild(d.createTextNode(dft_curedit[i].displayName));
			//dojo.addClass(editor_a, "lconnDownloadable");
			lconn.files.scenehelper.generateUserLink(app, routes, dft_curedit[i], editor_a);
			td.appendChild(editor_a);
			if(len !=1 && i != len -1)
				td.appendChild(d.createTextNode(", "));
    	}
                           
                     
    	tr.appendChild(td);
    	tbody.appendChild(tr);
    }
    // For Edit | View actions row
    /*
    var tr = d.createElement("tr");
    var th = d.createElement("th");
    th.scope = "row";
    //th.appendChild(d.createTextNode(nls.TIMES_RECOMMENDED));
    var edit_uri=doc.getAuthor().id + "@" +doc.getId();
    //name is to make all new/edit function are opening the same window
    var window_name = edit_uri.replace(/[-\s.@]/g, '_');
    var draft_actions = [{"label": this.nls2.editName, 
    	"anchor": "/concord/app/doc/lcfiles/" + doc.getId() + "/edit/content", 
    	"name": window_name }, 
    	
    	{"label": this.nls2.viewName, 
    	"anchor": "/concord/app/doc/lcfiles/" + doc.getId() + "/view/draft/content",
    	"name": "_blank"}
    ];
    var edit_fun = function(a, n){
    	return function(){window.open(a, n);};
    };
    for (var i = 0, len=draft_actions.length; i < len; i++){
    	var editor_a = d.createElement("a");
    	//editor_a.href= "app/person/" + draft_actions[i].anchor;
    	editor_a.href= "javascript:"
		dojo.connect(editor_a, "onclick", edit_fun(draft_actions[i].anchor, draft_actions[i].name));
    	editor_a.innerHTML = draft_actions[i].label;
    	dojo.addClass(editor_a, "lconnDownloadable");
    	th.appendChild(editor_a);
    	if(len !=1 && i != len -1)
    		th.appendChild(d.createTextNode("\u00A0\u00A0|\u00A0\u00A0"));
    }
    tr.appendChild(th);
    var td = d.createElement("td");
    td.appendChild(d.createTextNode(""));
    tr.appendChild(td);
    tbody.appendChild(tr);
    */
    
    table.appendChild(tbody);
    divb.appendChild(table);
         
    div.appendChild(divb);

	
   }
});

/*
 * Register our custom draft tab for a file
 */
lconn.core.uiextensions.add(
   "lconn/files/tabs/file",
   
   /*
    * Add a new "Custom Tab" to the file summary page.
    */
   function(s, tabs, app, scene) {
      // In community files widget, the draft tab may be added more than one time, so check if the tab exists or not firstly, please see detail in defect 45730.
      try
      {
    	 var bHasAdded = false;
    	 var len = (typeof tabs != 'undefined') ? tabs.length : 0;
         for (var index = len - 1; index >= 0; index--)
         {
            var sClassName = tabs[index].declaredClass;
            if ("com.ibm.concord.lcext.DraftSection" == sClassName)
            {
               bHasAdded = true;
               break;
            }
         }
         if (!bHasAdded)
         {
            tabs.push(new com.ibm.concord.lcext.DraftSection(app, scene));
         }
      }
      catch (e)
      {
         console.log("Error happens when adding tab to files UI: ", e);
      }
   }
);


});
