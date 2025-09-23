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
dojo.require("concord.chart.widget.DropDownButton");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.editor.PopularFonts");
dojo.provide("concord.chart.widget.FontNameDropDownButton");
dojo.declare("concord.chart.widget.FontNameDropDownButton", concord.chart.widget.DropDownButton, {
	
	onChange: function(){},
	
	postCreate: function()
	{
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.dir = dirAttr;
		this.inherited(arguments);	
		var fontNameMenu = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu" ,dir: dirAttr});
		dojo.addClass(this.containerNode,"fontfamilylabel buttonLabelTruncate");
		
		this.setLabel("Arial");
		var fonts = concord.editor.PopularFonts.getLangSpecFontArray();
		for (var i = 0; i < fonts.length; ++i) 
		{
			var label = fonts[i];
			var mItem = new dijit.MenuItem({label: label,style: {fontFamily: label}, dir: dirAttr});
			dijit.setWaiState(mItem.domNode,"label",label);
			this.connect(mItem,"onClick", dojo.hitch(this,function(label)
			{
				this.setLabel(label);
				this.onChange(label);
			},label));
			fontNameMenu.addChild(mItem);
			dijit.setWaiState(mItem.domNode, "labelledby", mItem.containerNode.id);
		}
		this.dropDown = fontNameMenu;
	}
});