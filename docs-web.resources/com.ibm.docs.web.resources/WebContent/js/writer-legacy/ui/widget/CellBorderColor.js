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

dojo.provide("writer.ui.widget.CellBorderColor");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("writer.ui.widget.ColorPalette");

dojo.declare("writer.ui.widget.CellBorderColor", [dijit.form.DropDownButton], {

	baseClass: "dijitDropDownButton cellBorderColor",
	defaultColor: "#000000",
	_color:"#000000",

	postCreate: function()
	{
		this.inherited(arguments);
		var node = this.containerNode;
		var that = this;
		node.style.background = this.defaultColor;
		this._color = this.defaultColor;
		this.dropDown = new writer.ui.widget.ColorPalette({
			id:"D_m_CellBorderColor",
			colorType:"CellBorderColor",
			onOpen:function(val){
				var colorPallete = this;
				if("autoColor" == that._color || that._color == "auto"){
					colorPallete.setFocus(colorPallete.autoNode);
				}else{
					var color = that._color.toUpperCase();
					colorPallete._currentColor =color;
					var index = colorPallete.colorMap[that._color.toUpperCase()];
					if(index !== undefined){
						colorPallete.setFocus(colorPallete._cells[index].node);
					}else{
						colorPallete.setFocus(colorPallete._cells[0].node);
					}
				}							
			},
			onChange:function(val){
				if(val == 'autoColor'){
					if(this._selectedCell >= 0)
					{
						dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
						this._selectedCell = -1; 
					}
					node.style.background = that.defaultColor;
					that._color = that.defaultColor;
				}
				else
				{
					this._antoColorNode && dojo.style(this._antoColorNode, 'border','');
					node.style.background = val;
					that._color = val;
				}

				that.onChange && that.onChange(that._color);
				node.focus();
			}});
	},
	_getValueAttr: function()
	{
		return this._color.slice(1);
	}
});