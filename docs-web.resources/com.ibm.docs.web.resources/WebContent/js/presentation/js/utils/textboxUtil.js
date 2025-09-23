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

dojo.provide("pres.utils.textboxUtil");

dojo.require("pres.utils.helper");
dojo.require("pres.constants");

pres.utils.textboxUtil = {
	hp: pres.utils.helper,
	c: pres.constants,
	emptyTextBoxHTML: '<div style="height: 100%; width: 100%;" odf_element="draw_text-box" class="draw_text-box contentBoxDataNode"><div style="display: table; height: 100%; width: 100%;" role="presentation" tabindex="-1"><div style="display: table-cell; height: 100%; width: 100%;" role="presentation" tabindex="-1" class="draw_frame_classes" ><p class="text_p" odf_element="text:p" level="1" customstyle="abs-margin-right:793;" style="margin-left: 0%; text-indent: 0%;"><span style="%DEFAULTSTYLE%">&#8203;</span><br class="hideInIE"></p></div></div></div>',
	contentTextBoxHTMLS: '<div style="height: 100%; width: 100%;" odf_element="draw_text-box" class="draw_text-box contentBoxDataNode"><div style="display: table; height: 100%; width: 100%;" role="presentation" tabindex="-1"><div style="display: table-cell; height: 100%; width: 100%;" role="presentation" tabindex="-1" class="draw_frame_classes" >',
	contentTextBoxHTMLE: '</div></div></div>',

	createDefaultTextBox: function(params)
	{
		var pos = params && params.pos || {};
		var content = params && params.content || null;
		var top = this.hp.pxToPercent(pos.t) || this.c.DEFAULT_TEXTBOX_TOP, left = this.hp.pxToPercent(pos.l, null, true) || this.c.DEFAULT_TEXTBOX_LEFT, height = this.hp.pxToPercent(pos.h) || this.c.DEFAULT_TEXTBOX_HEIGHT, width = this.hp.pxToPercent(pos.w, null, true) || this.c.DEFAULT_TEXTBOX_WIDTH;

		// create draw frame node
		var df = this.hp.createEle("div");
		dojo.addClass(df, "draw_frame layoutClass bc");
		df.setAttribute("presentation_class", "");
		var defaultFontSize = pe.scene.doc.fontSize || 18;
		df.setAttribute("pfs", defaultFontSize);
		df.setAttribute("draw_layer", "layout");
		df.setAttribute("text_anchor-type", "paragraph");
		dojo.style(df, {
			'position': 'absolute',
			'top': top + '%',
			'left': left + '%',
			'height': height + '%',
			'width': width + '%'
		});

		if (content)
		{
			var fHtml = this.contentTextBoxHTMLS + content + this.contentTextBoxHTMLE;
			df.innerHTML = fHtml;
		}
		else
		{
			// create default empty data node
			df.innerHTML = this.emptyTextBoxHTML.replace("%DEFAULTSTYLE%", pe.scene.doc.defaultTextStyle);
		}
		

		this.hp.setIDToNode(df.firstChild, /* cascade */true);

		return df;
	},
	createPlaceholder: function(textbox, title)
	{

	},
	
	fixBoxDom: function(dom)
	{
		if (!dojo.isFF || !dom)
			return;

		var shapeTxt = dojo.query('div.draw_shape_classes', dom);
		for ( var i = 0, count = shapeTxt.length; i < count; i++)
		{
			var curNode = shapeTxt[i];
			if(curNode && curNode.style.display == 'table-cell') {
				var colNum = curNode.style.columnCount;
				if(colNum && colNum > 1)
					curNode.style.display = 'block';
			}
		}
	}
};
