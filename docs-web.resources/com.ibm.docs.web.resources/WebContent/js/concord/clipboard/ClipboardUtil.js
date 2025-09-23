/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.clipboard.ClipboardUtil");

concord.clipboard.ClipboardUtil.handlePaste = function(e){
	var elem = e.target;	
	setTimeout(dojo.hitch(this, function () {
		var pasteElement = PresListUtil.fetchInternalCopyData(elem);
		if(pasteElement && (dojo.query("table", pasteElement.$).length == 0)) {
			//we get data from internal list copy
			//and then we need paste it in view
			//we should create a textbox, and insert the cotent
			concord.util.presCopyPasteUtil.pasteInternalListInViewMode(pasteElement);
		}
		else
		{
			if(dojo.isWebKit)
			{
				if(elem.lastChild 
						&& elem.lastChild.firstChild 
						&& dojo.hasClass(elem.lastChild.firstChild,"draw_page"))
				{
					elem = elem.lastChild;
				}	
			}	

			var lastChild = elem.lastChild;
			var internal = false; 
			var externalPresentation = false;
			var docId = null;
			if(lastChild && lastChild.nodeType!=CKEDITOR.NODE_TEXT)
			{
				var id = dojo.attr(lastChild,'_clipboard_id');
				if(id )
				{
					if(id.indexOf('docs_pres_object')>=0)
					{
						var infos = id.split('_');
						internal = true;
						if(infos.length>3)
						{
							var start = infos[0].length+infos[1].length +infos[2].length + 3;
							var end = id.lastIndexOf('.');
							docId = infos[3];
							
							if(end >0)
							{
								var right = id.substr(end+1);
								end = end + right.indexOf('_'); 
								docId = id.substr(start,end-start+1);
							}
								
							if(docId != window.pe.scene.bean.getUri())
								externalPresentation = true;
						}
					}
					//remove the non-Data
					if(lastChild.hasAttribute('_copy_nondata'))
					{
						elem.removeChild(lastChild);
					}	
				}
			}
			
			if(internal && !externalPresentation)
			{
				// no need to do decoding for internal copy on mobile for performance.
				!concord.util.browser.isMobile() && PresListUtil._DeCodingDataForBrowser(elem, externalPresentation);
				//If no table data is found in the system clipboard then proceed with normal CTRL_V paste processing.
				var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventName_keypressEvent ,
					              'eventAction':concord.util.events.keypressHandlerEvents_eventAction_CTRL_V}]; 
				concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
			}
			else if (internal && externalPresentation){
				// disable slide copy&paste between different presentation file
				var ckElem = PresCKUtil.ChangeToCKNode(elem);
				concord.util.presCopyPasteUtil.pasteDataFromExternalPresentation(elem, docId);
			}
			else
			{
				PresListUtil._DeCodingDataForBrowser(elem, externalPresentation);
				var data = concord.util.presCopyPasteUtil.processClipboardData(elem.innerHTML, true, elem);
				if(data.tables || data.images){
					concord.util.presCopyPasteUtil.pasteData(data);				
				}
				else if(data.text)
				{
					concord.util.presCopyPasteUtil.pasteTextInViewMode(data);
				}
				else {				
					//If no table data is found in the system clipboard then proceed with normal CTRL_V paste processing.
					var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventName_keypressEvent ,
						              'eventAction':concord.util.events.keypressHandlerEvents_eventAction_CTRL_V}]; 
					concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
				}					
			}	
		}			

	},150));
}