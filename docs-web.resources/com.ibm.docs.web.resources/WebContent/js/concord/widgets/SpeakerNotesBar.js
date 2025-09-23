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

dojo.provide("concord.widgets.SpeakerNotesBar");
dojo.require("concord.util.events");
dojo.require("concord.util.resizer");

concord.widgets.SpeakerNotesBar.default_heigth = "80px";

dojo.declare("concord.widgets.SpeakerNotesBar", [concord.comments.CommentsStoreListener], {

	_parent: null,
	_CKEDITOR: null,
	_CKToolbarSharedSpace: null,
	_editor: null,

	constructor: function (container, CKEDITOR, CKToolbarSharedSpace)
	{
		this._parent = container;
		this._parent.id = "speakerNotesContainer";
//		this._parent.style.height = 60;
		this._parent.style.height = concord.util.resizer.speakerNotesBarHeigth;
		this._parent.style.display = "none"
		
		var txt = document.createElement("textarea");
		txt.setAttribute("style", "width:100%; heigth:60px");
		txt.id = "notesEditor";
//		txt.setAttribute("rows", "2");
		this._parent.appendChild(txt);
		
		this._CKEDITOR = CKEDITOR;
		
		concord.util.events.subscribe(concord.util.events.speakerNotesEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		
		this._CKToolbarSharedSpace = CKToolbarSharedSpace;
	},


	handleSubscriptionEvents: function(data){
		if(data.eventName == concord.util.events.speakerNotesEvents_eventName_showHide)
		{
    		var visible = this._parent.style.display;
    		var f = false;
    		if(visible == "none")
    		{
    			this._parent.style.display = "block";
    			
    			var txt = document.getElementById("notesEditor");
    			if(txt != null && this._editor == null)
    			{
					this._editor = this._CKEDITOR.replace(txt, {
						startupFocus : true,
						height: concord.util.resizer.speakerNotesBarHeigth + "px",
						sharedSpaces :
						{
							top : this._CKToolbarSharedSpace
						},
						removePlugins : 'elementspath,scayt,menubutton,maximize,resize,task,comments,concordtoolbar,messages,menubar,fixedwidthpage, browserresizehandler,dialog,maximize,sourcearea,smarttables,enter,coediting',
						contentsCss: [],
						resize_enabled: false,
						fullPage : true
					});
					this._editor.on("focus", dojo.hitch(this, this._editorOnFocus));
    			}
    			f = true;
    		} else { 
    			this._parent.style.display = "none";
    		}
			concord.util.resizer.performResizeActions();
			
			// need to put the focus after resize.  Otherwise, the focus lost
			if(f) {
				this._editor.focus();
			}
		}
	},
	
	_editorOnFocus: function() {
		console.debug("speaker notes focus");
	}
	
});