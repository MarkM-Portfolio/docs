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

dojo.provide("pres.widget.common.ListStyleNumber");
dojo.require("pres.widget.common.ListStyle");
dojo.require("pres.constants");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.declare("pres.widget.common.ListStyleNumber", [pres.widget.common.ListStyle], {
	step: 3,
	cmd: pres.constants.CMD_NUMBERING,
	postMixInProperties: function()
	{
		var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
		var nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		var cknls = dojo.i18n.getLocalization("concord.widgets", "CKResource");
		var numberType = [{
			title: menuStrs.viewMenu_Toolbar_None,
			style: "",
			content: menuStrs.viewMenu_Toolbar_None
		}, {
			title: cknls.liststyles.numeric.numeric1,
			style: "lst-n",
			content: this.generatePseudoContent('lst-n', true)
		}, {
			title: cknls.liststyles.numeric.numericParen,
			style: "lst-np",
			content: this.generatePseudoContent('lst-np', true)
		},
		// note: numericLeadingZero style isn't supported by the ODP spec, so we've commented it out (for now)
		// { title : cknls.liststyles.numeric.numericLeadingZero , style : "lst-numwz" , content : this.generatePseudoContent( 'lst-numwz', true) } ,
		{
			title: cknls.liststyles.numeric.upperAlpha,
			style: "lst-ua",
			content: this.generatePseudoContent('lst-ua', true)
		}, {
			title: cknls.liststyles.numeric.upperAlphaParen,
			style: "lst-uap",
			content: this.generatePseudoContent('lst-uap', true)
		}, {
			title: cknls.liststyles.numeric.lowerAlpha,
			style: "lst-la",
			content: this.generatePseudoContent('lst-la', true)
		}, {
			title: cknls.liststyles.numeric.lowerAlphaParen,
			style: "lst-lap",
			content: this.generatePseudoContent('lst-lap', true)
		}, {
			title: cknls.liststyles.numeric.upperRoman,
			style: "lst-ur",
			content: this.generatePseudoContent('lst-ur', true)
		}, {
			title: cknls.liststyles.numeric.lowerRoman,
			style: "lst-lr",
			content: this.generatePseudoContent('lst-lr', true)
		}];
		// T10402 - add support for Japanese numbering (J1 and J2)
		switch (g_locale.toLowerCase())
		{
			case 'ja':
			case 'ja-jp':
				// TODO - keep NLS liststyles.numeric in sync in concord.widgets.nls.CKResource
				numberType.push({
					title: cknls.liststyles.numeric.japanese1,
					style: "lst-j1",
					content: this.generatePseudoContent('lst-j1', true)
				});
				numberType.push({
					title: cknls.liststyles.numeric.japanese2,
					style: "lst-j2",
					content: this.generatePseudoContent('lst-j2', true)
				});
				break;

			default:
				break;
		}
		if (BidiUtils.isArabicLocale()) {
			numberType.push({
				title: cknls.liststyles.numeric.numeric1 + " Arabic",
				style: "lst-n arabic",
				content: this.generatePseudoContent('lst-n arabic', true)
			});
			numberType.push({
				title: cknls.liststyles.numeric.numericParen + " Arabic",
				style: "lst-np arabic",
				content: this.generatePseudoContent('lst-np arabic', true)
			});
		}
				
		var dom = dojo.create("div", {
			"className": "hello_class",
			"data-dojo-attach-point": "containerNode"
		});
		var table = dojo.create("table", {
			cellspacing: "0",
			cellpadding: "0",
			className: "numberList"
		}, dom);
		var tr = null;
		var newTr = false;
		var tdLength = this.step;
		dojo.forEach(numberType, function(bt, index)
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
				title: bt.title,
				className: className,
				"innerHTML": bt.content
			}, tr);
		});

		this.templateString = dom.outerHTML;
		this.inherited(arguments);

	}

});