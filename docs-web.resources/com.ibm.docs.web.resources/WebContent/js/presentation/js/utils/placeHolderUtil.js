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

dojo.provide("pres.utils.placeHolderUtil");

dojo.require("pres.utils.helper");
dojo.require("pres.constants");
dojo.require("concord.pres.PresCKUtil");
dojo.requireLocalization("concord.widgets", "slidesorter");

pres.utils.placeHolderUtil = {
	STRINGS : dojo.i18n.getLocalization("concord.widgets", "slidesorter"),
	i18n: function(rootNode, hideInThumbnail)
	{
		var queryString = "." + pres.constants.CONTENT_BOX_TITLE_CLASS + ",." + pres.constants.CONTENT_BOX_SUBTITLE_CLASS + ",."
			+ pres.constants.CONTENT_BOX_OUTLINE_CLASS + ",." + pres.constants.CONTENT_BOX_GRAPHIC_CLASS + ",." + pres.constants.CONTENT_BOX_NOTES_CLASS;
		// we should find proper master class for this node
		var defaultTextLines = dojo.query(queryString, rootNode);
		var editor = pe.scene.editor.domNode || dojo.body();
		// result is <p> or <ul>/<ol>
		for ( var i = 0; i < defaultTextLines.length; i++)
		{
			var line = defaultTextLines[i];
			if (hideInThumbnail)
			{
				var parent = line.parentNode;
				while(parent != editor && !dojo.hasClass(parent, "draw_frame"))
				{
					parent = parent.parentNode;
				}
				if(parent && dojo.hasClass(parent, "draw_frame"))
				{
					parent.style.display = "none";
				}
			}
			else
			{
				var strPlaceHodler = null;
				if (dojo.hasClass(line, pres.constants.CONTENT_BOX_TITLE_CLASS))
				{
					strPlaceHodler = this.STRINGS.layout_clickToAddTitle;
				}
				else if (dojo.hasClass(line, pres.constants.CONTENT_BOX_SUBTITLE_CLASS))
				{
					if(dojo.attr(rootNode.parentElement, 'presentation_presentation-page-layout-name') == "ALT32")
						strPlaceHodler = this.STRINGS.layout_clickToAddOutline;
					else 
						strPlaceHodler = this.STRINGS.layout_clickToAddText;
				}
				else if (dojo.hasClass(line, pres.constants.CONTENT_BOX_OUTLINE_CLASS))
				{
					strPlaceHodler = this.STRINGS.layout_clickToAddOutline;
				}
				else if (dojo.hasClass(line, pres.constants.CONTENT_BOX_NOTES_CLASS))
				{
					strPlaceHodler = this.STRINGS.layout_clickToAddSpeakerNotes;
				}
				else if (dojo.hasClass(line, pres.constants.CONTENT_BOX_GRAPHIC_CLASS))
				{
					strPlaceHodler = this.STRINGS.layout_doubleClickToAddGraphics;
				}
				
				var spanNodes = dojo.query('span', line);
				var spanNode = spanNodes[0];
				if (spanNode)
				{
					spanNode.innerHTML = strPlaceHodler;
				}
				
			}
		}
	}
};
