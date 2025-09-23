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

dojo.provide("concord.widgets.revision.revisionViewer");
dojo.require("dijit.form.CheckBox");
dojo.requireLocalization("concord.widgets.revision","revisionViewer");

dojo.declare("concord.widgets.revision.revisionViewer", null, {
	docId: null,
	repoId: null,
	oldV: null,
	newV: null,
	syncScrollBox: null,
	connectScrollArray: [],
	nls: null,
	docType: null,
	
	start: function(docType)
	{
		this.docType = docType;
		this.nls = dojo.i18n.getLocalization("concord.widgets.revision","revisionViewer");
		this._createSyncScroll();
		this._linkFrameScroll();
	},
	
	_linkFrameScroll: function()
	{		
		if(this.docType == "text" || this.docType == "pres")
		{
			concord.widgets.revision.revisionViewer.SyncScrollTimer = setInterval(concord.widgets.revision.revisionViewer.linkTextFrameScroll,2000);
		}	
		else if(this.docType == "sheet")
		{
			concord.widgets.revision.revisionViewer.SyncScrollTimer = setInterval(concord.widgets.revision.revisionViewer.linkSheetFrameScroll,2000);
		}
	},
	
	_createSyncScroll: function()
	{
		var chkdiv = dojo.byId("compareViewFooterNode");
		var layoutTable = dojo.create('table', null, chkdiv);
		dijit.setWaiRole(layoutTable,'presentation');
		var layoutTbody = dojo.create('tbody', null, layoutTable);
		var tr = dojo.create('tr', null, layoutTbody);
		var td1 = dojo.create('td', null, tr);	
		var td2 = dojo.create('td', null, tr);		
		
		this.syncScrollBox = new dijit.form.CheckBox({
			checked: true,
			name: "symnscrollcheckbox",			
			id:"SyncScrollChk"});
		
		td1.appendChild(this.syncScrollBox.domNode);
		var cbLabel = dojo.create('label', {'for': "SyncScrollChk"}, td2);
		cbLabel.appendChild(dojo.doc.createTextNode(this.nls.SYMN_SCROLL_LABEL));			
	}
});

concord.widgets.revision.revisionViewer.onLoad = function(window, docType)
{
	revisionViewer.start(docType);	
}

concord.widgets.revision.revisionViewer.onUnLoad = function(window)
{
}

concord.widgets.revision.revisionViewer.linkTextFrameScroll = function()
{		
	var leftFrame = document.getElementById('leftFrame');
	var rightFrame = document.getElementById('rightFrame');

	if(leftFrame && rightFrame)
	{		
		var ckEditorId = "cke_contents_editor1";
		var leftEditorArea = leftFrame.contentDocument.getElementById(ckEditorId);
		leftEditFrame = leftEditorArea? leftEditorArea.firstChild : null;
		var rightEditorArea = rightFrame.contentDocument.getElementById(ckEditorId);
		rightEditFrame = rightEditorArea? rightEditorArea.firstChild : null;
		
		if(leftEditFrame && rightEditFrame && leftEditFrame.contentWindow && rightEditFrame.contentWindow)
		{
			if(concord.widgets.revision.revisionViewer.SyncScrollTimer)
			{
				clearInterval(concord.widgets.revision.revisionViewer.SyncScrollTimer);
				concord.widgets.revision.revisionViewer.SyncScrollTimer = null;				
			}
			
			leftEditFrame.contentWindow.onscroll = function(){ 
				if(revisionViewer.syncScrollBox && revisionViewer.syncScrollBox.checked)
				{	
					rightEditFrame.contentDocument.body.parentElement.scrollTop = leftEditFrame.contentDocument.body.parentElement.scrollTop
					rightEditFrame.contentDocument.body.parentElement.scrollLeft = leftEditFrame.contentDocument.body.parentElement.scrollLeft
				}
			};
			
			rightEditFrame.contentWindow.onscroll = function(){ 
				if(revisionViewer.syncScrollBox && revisionViewer.syncScrollBox.checked) 
				{
					leftEditFrame.contentDocument.body.parentElement.scrollTop = rightEditFrame.contentDocument.body.parentElement.scrollTop
					leftEditFrame.contentDocument.body.parentElement.scrollLeft = rightEditFrame.contentDocument.body.parentElement.scrollLeft
				}
			};
		}
		else
		{
			leftEditFrame = null;
			rightEditFrame = null;
		}
	}
}

concord.widgets.revision.revisionViewer.linkSheetFrameScroll = function()
{		
	var leftFrame = document.getElementById('leftFrame');
	var rightFrame = document.getElementById('rightFrame');
	
	if(revisionViewer.connectScrollArray)
	{
		for(var i=0; i<revisionViewer.connectScrollArray.length; i++){
			dojo.disconnect(revisionViewer.connectScrollArray[i]);			
		}
	}
	revisionViewer.connectScrollArray = [];

	if(leftFrame && rightFrame)
	{		
		var sheetContainerId = "websheet_layout_WorksheetContainer_0";
		var leftSheetContainer = leftFrame.contentWindow.dijit.byId(sheetContainerId);
		var leftSheet = leftSheetContainer? leftSheetContainer.selectedChildWidget : null;
		var rightSheetContainer = rightFrame.contentWindow.dijit.byId(sheetContainerId);
		var rightSheet = rightSheetContainer? rightSheetContainer.selectedChildWidget : null;
		
		if(leftSheet && rightSheet)
		{
			if(concord.widgets.revision.revisionViewer.SyncScrollTimer)
			{
				clearInterval(concord.widgets.revision.revisionViewer.SyncScrollTimer);
				concord.widgets.revision.revisionViewer.SyncScrollTimer = null;				
			}		
			
			revisionViewer.connectScrollArray.push(dojo.connect(leftSheet.getContentView().scrollboxNode, "onscroll", function(){
					if(revisionViewer.syncScrollBox && revisionViewer.syncScrollBox.checked)
					{
						rightSheet.getContentView().scrollboxNode.scrollLeft = leftSheet.getContentView().scrollboxNode.scrollLeft;					
					}				
				}
			));
			revisionViewer.connectScrollArray.push(dojo.connect(rightSheet.getContentView().scrollboxNode, "onscroll", function(){
					if(revisionViewer.syncScrollBox && revisionViewer.syncScrollBox.checked)
					{
						leftSheet.getContentView().scrollboxNode.scrollLeft = rightSheet.getContentView().scrollboxNode.scrollLeft;
					}
				}
			));		
			
			revisionViewer.connectScrollArray.push(dojo.connect(leftSheet.vScrollerNode, "onscroll", function(){
					if(revisionViewer.syncScrollBox && revisionViewer.syncScrollBox.checked)
					{
						rightSheet.setScrollTop(leftSheet.scrollTop);
					}
				}
			));
			revisionViewer.connectScrollArray.push(dojo.connect(rightSheet.vScrollerNode, "onscroll", function(){
					if(revisionViewer.syncScrollBox && revisionViewer.syncScrollBox.checked)
					{
						leftSheet.setScrollTop(rightSheet.scrollTop);
					}
				}
			));		
			
			leftSheetContainer.watch("selectedChildWidget", concord.widgets.revision.revisionViewer.linkSheetFrameScroll);
			rightSheetContainer.watch("selectedChildWidget", concord.widgets.revision.revisionViewer.linkSheetFrameScroll);						
		}
	}
}


concord.widgets.revision.revisionViewer.SyncScrollTimer = null;
var revisionViewer = new concord.widgets.revision.revisionViewer();
var leftEditFrame = null;
var rightEditFrame = null;
