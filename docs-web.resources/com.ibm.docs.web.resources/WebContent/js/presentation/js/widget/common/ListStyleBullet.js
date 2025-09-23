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

dojo.provide("pres.widget.common.ListStyleBullet");
dojo.require("pres.widget.common.ListStyle");
dojo.require("pres.constants");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.declare("pres.widget.common.ListStyleBullet", [pres.widget.common.ListStyle], {
	step: 3,
	cmd: pres.constants.CMD_BULLET,
	postMixInProperties: function()
	{
		var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
		var nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		var cknls = dojo.i18n.getLocalization("concord.widgets", "CKResource");
		var bulletType = [{
			title: menuStrs.viewMenu_Toolbar_None,
			style: "",
			content: menuStrs.viewMenu_Toolbar_None
		}, {
			title: cknls.liststyles.bullets.circle,
			style: "lst-c",
			content: "\u2022"
		}, {
			title: cknls.liststyles.bullets.cutOutSquare,
			style: "lst-cs",
			content: "\u25D8"
		}, {
			title: cknls.liststyles.bullets.rightArrow,
			style: "lst-ra",
			content: "\uF034"
		}, {
			title: cknls.liststyles.bullets.diamond,
			style: "lst-d",
			content: "\u2666"
		}, {
			title: cknls.liststyles.bullets.doubleArrow,
			style: "lst-da",
			content: "\u00BB"
		}, {
			title: cknls.liststyles.bullets.thinArrow,
			style: "lst-ta",
			content: "\uF0E0"
		}, {
			title: cknls.liststyles.bullets.checkMark,
			style: "lst-cm",
			content: "\uF061"
		}, {
			title: cknls.liststyles.bullets.plusSign,
			style: "lst-ps",
			content: "\u002B"
		}];

		var dom = dojo.create("div", {
			"className": "hello_class",
			"data-dojo-attach-point": "containerNode"
		});
		var table = dojo.create("table", {
			cellspacing: "0",
			cellpadding: "0",
			className: "bulletList"
		}, dom);
		var tr = null;
		var newTr = false;
		var tdLength = this.step;
		dojo.forEach(bulletType, function(bt, index)
		{
			if (index % tdLength == 0)
			{
				tr = dojo.create("tr", null, table);
				newTr = true;
			}
			else
				newTr = false;
			var className = "";
			if (index < tdLength)
				className += "topMost";
			if (newTr)
				className += " leftMost";
			dojo.create("td", {
				className: className,
				title: bt.title,
				"innerHTML": "<span class='" + (bt.style || "none") + "'>" + bt.content + "</span>"
			}, tr);
		});

		this.templateString = dom.outerHTML;
		this.inherited(arguments);

	}

});