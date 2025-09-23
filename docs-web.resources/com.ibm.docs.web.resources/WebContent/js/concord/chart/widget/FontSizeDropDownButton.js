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
dojo.provide("concord.chart.widget.FontSizeDropDownButton");
dojo.declare("concord.chart.widget.FontSizeDropDownButton", concord.chart.widget.DropDownButton, {
	
	colorNode: null,
	size: [8,9,10,11,12,14,16,18,20,22,24],
	onChange: function(){},
	
	postCreate: function(){
		this.inherited(arguments);
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';		
		this.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", dir: dirAttr});
		
		this.setLabel(10);
		
		dojo.style(this.containerNode,"width", "20px");
		for(var i=0;i<this.size.length;i++)
		{
			var item = new dijit.MenuItem({label:this.size[i] + "", dir: dirAttr});
			dijit.setWaiState(item.domNode,"label",this.size[i]);
			this.connect(item,"onClick", dojo.hitch(this,function(fontsize)
			{
				this.setLabel(fontsize);
				this.onChange(fontsize);
			},this.size[i]));
			this.dropDown.addChild(item);
		}
	}
});