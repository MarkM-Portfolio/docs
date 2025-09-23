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

dojo.provide("concord.util.dialogs");

dojo.require("dojo.io.iframe");
dojo.require("dojo.i18n");
dojo.require("dijit.Dialog");
dojo.require("concord.widgets.MessageBox");
dojo.require("concord.widgets.ConfirmBox");
dojo.require("concord.widgets.InputBox");
dojo.require("dojo.string");
dojo.require("concord.util.strings");
dojo.require("concord.util.browser");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.uri");
dojo.requireLocalization("concord.util","dialogs");
dojo.requireLocalization("concord.scenes", "LoginScene");
 
(function()
{
concord.util.dialogs.showDiscardDlg = function()
{
	var nls = dojo.i18n.getLocalization("concord.util","dialogs");
	
	//isPublishNeeded 'true' mean there is no published version for the document.
	var versionCheck = pe ? pe.isPublishNeeded() : null;
	if (versionCheck) 
	{
		var reason_msg = nls.cannot_discard_msg;
		concord.util.dialogs.alert(reason_msg);
		return;
	}	
	
	var needPop = true;
	if(pe.scene && pe.scene.session && !pe.scene.session.isDirty())
	{
		var resp = concord.util.uri.getDraftStatus();
		if(resp && !resp.dirty)
		{
			needPop = false;
		}	
	}

	if(needPop)
	{		
		var callback = function(editor, confirmed, saveDraft){if(confirmed) pe.scene.discardDraft(saveDraft);};
		var params = {
				message : nls.discardQuestionMsg,
				callback: callback,
				imageclass:"yourProductSprite yourProductSprite-msgWarning48",
				noLabel:nls.discardDraftNoButton,
				showLearnMore: true,
				helpTopic: concord.main.App && concord.main.App.RVERT_TOLAST_HELP_URL
			};
			var dlg = new concord.widgets.ConfirmBox( null, nls.discardDraft,
				nls.discardDraftYesButton, true, params );
			dlg.show();
	}
	else
	{
		pe.scene.discardDraft(false);
	}
};

concord.util.dialogs.showLoginDlg = function(auth_times, auth_cllbk, retry_cllbk)
{
	var nls = dojo.i18n.getLocalization("concord.scenes", "LoginScene");
	var dlg = new concord.widgets.LoginDialog( null, nls.login_welcome, nls.login_button, true, { message:"", defvalue:"", auth_callback:auth_cllbk, retry_callback:retry_cllbk, auth_times:auth_times } );
	dlg.show();
	return dlg;
};

concord.util.dialogs.showUnsupportDlg = function()
{
	var loadCallback = function(data) {
				var unsupportList = data.errCodes;
				if ((unsupportList) && (unsupportList instanceof Array) && (unsupportList.length > 0))
				{
					if(pe.scene.isHTMLViewMode())
					{
						var unsupported=[];
						for(var i=0;i<unsupportList.length;i++)
						{
							for(var j=0;j< viewerConfig.sheet["unsupported-feature"].length;j++)
							{
								if(unsupportList[i].description == viewerConfig.sheet["unsupported-feature"][j])
									unsupported.push(unsupportList[i].description);
							}
						}
						pe.scene.showUnsupportedTextMessage(unsupported,10000);
					}else{
						pe.scene.unsupportDlg = new concord.widgets.unsupportDlg(null, null, null, false, unsupportList);
						pe.scene.unsupportDlg.show();
						pe.scene.unsupportDlg.setFocus();
					}
				}
			};
	var errorCallback = function(error) {
				console.log('Error returned while loading result.json :' + error);
			};
	var xhrArgs = {
			url: concord.util.uri.getEditAttUri("result.json"),
			handleAs: "json",
			preventCache: true,
			load: loadCallback,
			error: errorCallback 
		};
	if(pe.scene.isHTMLViewMode() && DOC_SCENE.type=='sheet')
		dojo.xhrGet(xhrArgs);
	// Show the unsupported feature warning dialog according to user settings. 
	pe && pe.settings && pe.settings.getShowUnsupportedFeature() && dojo.xhrGet(xhrArgs);
};


concord.util.dialogs.alert = function( msg, cllbk, params )
{
	params = params||{};
	dojo.mixin(params, {message:msg,callback:cllbk});
	var dlg = new concord.widgets.MessageBox( null, null, null, false, params );
	dlg.show();
};

concord.util.dialogs.confirm = function( msg, cllbk )
{
	var dlg = new concord.widgets.ConfirmBox( null, null, null, true, { message:msg,callback:cllbk} );
	dlg.show();
};

concord.util.dialogs.input = function( msg, defaultValue, cllbk )
{
	var dlg = new concord.widgets.InputBox( null, null, null, true, { message:msg,callback:cllbk,defvalue:defaultValue} );
	dlg.show();
};

concord.util.dialogs.renderError = function(code)
{
	var getErrorMsg = function(code)
	{
		var nls = dojo.i18n.getLocalization("concord.util","dialogs");
		switch( code )
		{
		case 401:
		case 403: return nls.no_auth_access_doc;
		case 404: return nls.doc_not_found;
		case 415: return nls.unsupp_doc_type;	
		case 417: 
			var str = dojo.string.substitute( nls.doc_exceeds, {'maxSheetCount' : g_maxSheetRows, 'productName' : concord.util.strings.getProdName()} );
			return str;
		case 501: 
			var str = dojo.string.substitute( nls.not_supp_format, {'productName' : concord.util.strings.getProdName()} );
			return str;
		case 503:
			var str = dojo.string.substitute( nls.try_later_for_busy, {'productName' : concord.util.strings.getProdName()} );
			return str;
		default:  return nls.unknown_error;
		}
	};
	code = (new Number(code)).valueOf();
	var dlg = new concord.widgets.MessageBox( null, null, null, false, {message:getErrorMsg(code), imageclass:"yourProductSprite yourProductSprite-msgError48"} );
	dlg.show();
};

concord.util.dialogs.getMaxZindex = function(){
	var dialogs = dojo.query('.dijitDialog');
	var max=0;
	for (var i=0; i<dialogs.length; i++){
		var zValue = parseInt(dialogs[i].style.zIndex);
		if (max <=zValue){
			max = zValue;
		}
	}
	return parseInt(max)+1;
};

concord.util.dialogs.fixModalDialogZindex = function() { 
	var underlay =	dojo.doc.getElementById("dijit_DialogUnderlay_0");		
	if(underlay != null) {
		//get the owner of the underlay		
		var underlayOwnerId = underlay.children[0].id.substring(0,underlay.children[0].id.lastIndexOf("_underlay"));
		var underlayOwner = dojo.byId(underlayOwnerId);	
		if(underlayOwner != null) {
			underlay.style.zIndex = concord.util.dialogs.getMaxZindex();
			underlayOwner.style.zIndex = concord.util.dialogs.getMaxZindex()+1;
		}
	}
};

concord.util.dialogs.hideUnderlayIfNotActive = function() {	
	var underlay =	dojo.doc.getElementById("dijit_DialogUnderlay_0");		
	if(underlay != null) {
		//concord.util.dialogs.fixModalDialogZindex();
		
		//get the owner of the underlay		
		var underlayOwner = underlay.children[0].id.substring(0,underlay.children[0].id.lastIndexOf("_underlay"));	
					
		var hideUnderlay = true;
		//query every dialog and if ANY are active compare underlayOwner
		//If underlayOwner is one of the active dialogs DO NOT hide the underlay
		dojo.query('.dijitDialog').forEach(
				function(node, index, arr){
					if(!(node.style.display == 'none') && node.id == underlayOwner) { 
						hideUnderlay = false;												
					}
				});			
					  		  
		if(hideUnderlay) { 					
			underlay.style.display='none';
		}
	}
};

concord.util.dialogs.showSaveAsDlg = function( app, bNewDoc, fromTemp )
{
	// the MAX file name length limited by Connection Files(not includes extension name).
	var MAX_FILENAME_LENGTH = 248;
	if (!bNewDoc)
	{
		dojo["require"]("concord.widgets.SaveAsDialog");
		var dlg = new concord.widgets.SaveAsDialog(app, false);
		dlg.show();
		return;
	}

	var nls = dojo.i18n.getLocalization("concord.util","dialogs");
	var newApp, newAppTmpl = '';
	if(app == 'text') {
		newApp = nls.createNewTextApp;
		newAppTmpl = nls.createNewDocFromTemp;
	}
	if(app == 'spreadsheet') {
		newApp = nls.createNewSheetApp;
		newAppTmpl = nls.createNewSheetFromTemp;
	}
	if(app == 'presentation')
		newApp = nls.createNewPresApp;
	var dlgTitle = fromTemp ? newAppTmpl : newApp;
	//var docName = pe.scene.getDocTitle();

	var isValidDocName = function(docName) { 
		var valid = /^([^\\\/\:\*\?\"\<\>\|]+)$/.test(docName);
		return valid;
	};
    
	var isValidLengthName = function(docName){
		if (!docName) {
			return true;
		}
		// compute bytes length in UTF-8.
		var byteslength = 0;
		for ( var i = 0; i < docName.length; i++) {
			var c = docName.charCodeAt(i);
			if (c <= 127) {
				byteslength++;
			} else if (c <= 2047) {
				byteslength += 2;
			} else if (c <= 65535) {
				byteslength += 3;
				if ((c >> 11) == 27) {
					byteslength++;
					i++;
				}
			} else {
				bytes += 4;
			}
		}
		return (byteslength <= MAX_FILENAME_LENGTH);
	};
	
	var validateTitle = function(editor, title){
		title = dojo.trim( title );
		if (title == '') {	
			return nls.dulDocName;
    	}
		if( !isValidDocName(title) ){
			//dojo.string.substitute(nls.invalidDocName, [title]);			
			return nls.invalidDocName; 
		} else if(!isValidLengthName(title)){
			return nls.invalidLengthName;
		}
	};

	var createNew = function(editor, title, isExternal) {
		title = dojo.trim( title );
		pe.scene.createNewDoc(app, title, isExternal, fromTemp);
	};

	var params = {
		message: nls.newDraftMsg,
		defvalue: nls.emptyDoc,
		callback: createNew,
		validator: validateTitle,
		showExternal: (DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0) ? false : true
	};
	if (BidiUtils.isBidiOn())
		params.disableBTD = true;
	var dlg = new concord.widgets.InputBox( null, dlgTitle, null, true, params );
	dlg.show();
};

concord.util.dialogs.fireClickEvent = function(targetdijitNode)
{
	targetdijitNode.focus();
	targetdijitNode.onClick();
};
	
var dlgTemplatesFrameId = "concord_dialog_templates_frame";
var dlgTemplateUrl = window.contextPath + window.staticRootPath + "/js/concord/templates/dialogs.html";

concord.util.dialogs.showDlgFromTmplt = function( id, mixIn, nls )
{	
	// TODO record range before open dialog
//	var editor = pe.scene.getEditor();
//	var selection=editor.getSelection();
//	if(selection)
//		editor.origRange = selection.getRanges()[0];
	//editor.origRange = editor.getSelection().getRanges()[0];
	var dlg = dijit.byId(id);
	if( dlg )
	{
		if(mixIn) dojo.mixin( dlg, mixIn);
		dlg.show();
		return;
	}
	
	var getNLSDesc = function( item )
	{
		var nlsDerivative = dojo.attr( item, "nls" );
		dojo.removeAttr( item, "nls" );
		return nlsDerivative;
	};

	var updateNls = function( item )
	{
		var nlsDesc = getNLSDesc(item);
		if( !nlsDesc )return;
		var attr_key = nlsDesc.split(":");
		var attr = attr_key[0];
		var key = attr_key[1];
		var nlsText = nls[key];
		if( !nlsText )
		{
			dojo.requireLocalization("concord.widgets","concordDialog");
			var commomNls = dojo.i18n.getLocalization("concord.widgets","concordDialog");
			if(commomNls[key])
			{
				if(key == 'productName') {
					nlsText = dojo.string.substitute(commomNls[key], { 'productName' : concord.util.strings.getProdName() });	
				}			
				else {
					nlsText = commomNls[key];
				}				
			}
			else {
				nlsText = key;	
			}			
		}
		item[attr] = nlsText;
	};
		
	var showDialog = function( container )
	{
		if( nls )
		{
			dojo.query("[nls]", container).forEach(updateNls);
		}
		//var	list = dojo.query("[dojoType]", container);
		//var widgets = dojo.parser.instantiate(list, mixIn);
		var widgets = dojo.parser.parse(container, null);
		dlg = widgets[0];
		if(mixIn)dojo.mixin( dlg, mixIn);//dojo.parser.instantiate only mixin modify, don't add 
		dlg.dlgPostMixIn();

		dojo.connect(dlg, "onHide", function(){if(typeof(pe)!="undefined")setTimeout(function()
		{
//			if( !editor.getSelection() ) //only when the editor is not in focus
//				pe.scene.setFocus();
			//dojo.hitch(pe.scene,pe.scene.setFocus)();
		}, 0);} );
		dlg.show();
	};

	var node = dojo.byId(id);
	if( node )
	{
		showDialog( node.parentNode );
		return;
	}
	
	var iFrame = dojo.byId(dlgTemplatesFrameId);
	concord.util.dialogs._dlgTemplatesLoaded = function ()
	{
		var frame = dojo.byId(dlgTemplatesFrameId);
		var doc = frame.contentDocument;
		var htmlText = dojo.byId(id, doc).parentNode.innerHTML;
		var container = dojo.create("div", {innerHTML : htmlText}, dojo.body());
		showDialog( container );
		delete concord.util.dialogs._dlgTemplatesLoaded;
	}
	
	if( iFrame )
	{
		concord.util.dialogs._dlgTemplatesLoaded();
	}
	else
	{
		dojo.io.iframe.create(dlgTemplatesFrameId, "concord.util.dialogs._dlgTemplatesLoaded()", dlgTemplateUrl );
		return;
	}
};

concord.util.dialogs._attrIFrameTitle = function ()
{
	var frame = dojo.byId(dlgTemplatesFrameId);
	if(frame){
		var nls = dojo.i18n.getLocalization("concord.util","dialogs");
		var str = dojo.string.substitute(nls.doc_DlgIFrameTitle, { 'productName' : concord.util.strings.getProdName() });
		dojo.attr(frame,'title',str);
	}
};

concord.util.dialogs.createTemplateFrame = function()
{
	//g_DocMode defined in /jsp/app_view.jsp, if current is view mode, no need to load 'dialogs.html'.
	if (pe.scene.isHTMLViewMode() || ((typeof g_DocMode != "undefined" ) && g_DocMode.toLowerCase()=='view'))
	{
		return;
	}
	// in mobile, overflow scrolling will scroll in wrong direction if html have invisible iframe in IOS5.1 . So do not create it.
	if(!concord.util.browser.isMobile()) 
	{
		dojo.io.iframe.create(dlgTemplatesFrameId, "concord.util.dialogs._attrIFrameTitle()", dlgTemplateUrl);
	}
};

concord.util.dialogs.formatStrings4Modifier = function(str, lastModifier, lastModified)
{
	var name = "";
	var date = "";
	var time = "";
	
	if(lastModifier && lastModified) 
	{
		date = concord.util.date.parseDate(lastModified);
		time = concord.util.date.parseTime(lastModified, 'short');
    	if (concord.util.date.isToday(date))
    	{
    		date = pe.scene.nls.today;
    	}
    	else if (concord.util.date.isYesterday(date))
    	{
    		date = pe.scene.nls.yesterday;
    	}
    	    	
    	var user = ProfilePool.getUserProfile(lastModifier);	    	
    	if(user)
    	{
    		name = (pe.authenticatedUser.getId() == user.getId()) ? pe.scene.nls.you : user.getName();
    	}	 
	}    	
	
	if (name == undefined)
	{
	  name = ""
	}
	//var retStr = dojo.string.substitute(str, [name, time, date]);
	var retStr = dojo.string.substitute(str, {'0': name, '1': time, '2': date});
	return retStr;
};

})();

