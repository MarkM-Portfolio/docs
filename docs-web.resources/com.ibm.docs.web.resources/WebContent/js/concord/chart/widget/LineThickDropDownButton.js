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
dojo.provide("concord.chart.widget.LineThickDropDownButton");
dojo.declare("concord.chart.widget.LineThickDropDownButton", concord.chart.widget.DropDownButton, {
	
	opts: ["none", "1px","2px","3px","4px","5px","6px","7px","8px"],
	onChange: function(){},
	
	postCreate: function(){
		this.inherited(arguments);
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", dir: dirAttr});
		
		this.setLabel("none");
		
		dojo.style(this.titleNode,"width", "60px");
		for(var i=0;i<this.opts.length;i++)
		{
			var item = new dijit.MenuItem({label:this.opts[i], dir: dirAttr});
			this.connect(item,"onClick", dojo.hitch(this,function(w)
			{
				this.setLabel(this.opts[w]);
				this.onChange("w", w);
			},i));
			
			this.dropDown.addChild(item);
		}
	}
});