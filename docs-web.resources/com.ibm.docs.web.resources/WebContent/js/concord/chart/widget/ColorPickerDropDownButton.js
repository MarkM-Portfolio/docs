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
dojo.require("concord.chart.widget.ColorPalette");
dojo.require("concord.util.BidiUtils");
dojo.provide("concord.chart.widget.ColorPickerDropDownButton");
dojo.declare("concord.chart.widget.ColorPickerDropDownButton", [concord.chart.widget.DropDownButton], {
	
	colorNode: null,
	color : "",
	onChange: function(){},
	
	postCreate: function(){
		this.dir = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.inherited(arguments);
		this.colorNode = dojo.create("span", {style:{width:"13px",height:"13px",display:"inline-block", border:"1px solid #BBBBBB"}}, this.containerNode, "first");
		this.dropDown = new concord.chart.widget.ColorPalette();
		
		dojo.addClass(this.domNode, "itemInvisible");
		this.connect(this.dropDown,"onChange", dojo.hitch(this, function()
		{
			this.setColor(this.dropDown.value);
			this.onChange(this.dropDown.value);
		}));
	},
	
	setColor: function(color)
	{
		if(color)
			this.color = color.toString();
		else
			this.color = "";
		this.colorNode.style.backgroundColor = this.color;
	},
	
	getColor: function()
	{
		return this.color;
	},
	
	toggleDropDown: function(){
		this.focus();
		
		if(!this._opened){
			// If we aren't loaded, load it first so there isn't a flicker
			if(!this.isLoaded()){					
				this.loadDropDown(dojo.hitch(this, "openDropDown"));
			}else{
				this.openDropDown();					
			}
			
			var colorValue = this.color;
			if(colorValue){
				if(colorValue.indexOf("rgb") == 0)
				{
					var colorObject = new dojo.Color(colorValue);
					colorValue = colorObject.toHex();
				}
				this.dropDown.setSelected(colorValue);
			}
			else
				this.dropDown.setSelected(null);
		}else{
			this.closeDropDown();
		}
	}
});