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

dojo.provide("pres.widget.common.TableTemplatePalette");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("pres.constants");
dojo.require("pres.widget.common.ListStyle");

dojo.declare("pres.widget.common.TableTemplatePalette", [pres.widget.common.ListStyle], {

	step: 5,
	cmd: pres.constants.CMD_TABLE_UPDATE_TEMPLATE,
	onOpen: function()
	{
		this.currentValue = "st_plain";
		this._setCurrent(this.cells[0]);
		this.inherited(arguments);
	},
	postMixInProperties: function()
	{
		var presStrs = dojo.i18n.getLocalization("pres", "pres");
		this.tables = [
		 		         {tooltip:presStrs.Plain,tableClass:"st_plain"},
		 		         {tooltip:presStrs.BlueStyle,tableClass:"st_blue_style"},
		 		         {tooltip:presStrs.RedTint,tableClass:"st_red_tint"},
		 		         {tooltip:presStrs.BlueHeader,tableClass:"st_blue_header"},
		 		         {tooltip:presStrs.DarkGrayHF,tableClass:"st_dark_gray_header_footer"},
		 		         {tooltip:presStrs.LightGrayRows,tableClass:"st_light_gray_rows"},
		 		         {tooltip:presStrs.DarkGrayRows,tableClass:"st_dark_gray"},
		 		         {tooltip:presStrs.BlueTint,tableClass:"st_blue_tint"},
		 		         {tooltip:presStrs.RedHeader,tableClass:"st_red_header"},
		 		         {tooltip:presStrs.GreenHF,tableClass:"st_green_header_footer"},
		 		         {tooltip:presStrs.PlainRows,tableClass:"st_plain_rows"},
		 		         {tooltip:presStrs.GrayTint,tableClass:"st_gray_tint"},
		 		         {tooltip:presStrs.GreenTint,tableClass:"st_green_tint"},
		 		         {tooltip:presStrs.GreenHeader,tableClass:"st_green_header"},
		 		         {tooltip:presStrs.RedHF,tableClass:"st_red_header_footer"},
		 		         {tooltip:presStrs.GreenStyle,tableClass:"st_green_style"},
		 		         {tooltip:presStrs.PurpleTint,tableClass:"st_purple_tint"},
		 		         {tooltip:presStrs.BlackHeader,tableClass:"st_black_header"},
		 		         {tooltip:presStrs.PurpleHeader,tableClass:"st_purple_header"},
		 		         {tooltip:presStrs.LightBlueHF,tableClass:"st_light_blue_header_footer"}
		 		      ];
		var dom = dojo.create("div", {
			"className": "hello_class",
			"data-dojo-attach-point": "containerNode"
		});
		var table = dojo.create("table", {
			cellspacing: "0",
			cellpadding: "0",
			className: "tableList"
		}, dom);
		var tr = null;
		var newTr = false;
		var tdLength = this.step;
		var trIndex = 0;
		var tdIndex = 0;
		dojo.forEach(this.tables, function(bt, index)
		{
			if (index % tdLength == 0)
			{
				tr = dojo.create("tr", {
					className: "tr" + (trIndex++)
				}, table);
				newTr = true;
				tdIndex = 0;
			}
			else
				newTr = false;
			var className = "td" + (tdIndex++);
			if (index < tdLength)
				className += " topMost";
			if (newTr)
				className += " leftMost";
			dojo.create("td", {
				className: className,
				innerHTML: "<div title='"+bt.tooltip+"' class='cell " + bt.tableClass + "'></div>"
			}, tr);
		});

		this.templateString = dom.outerHTML;
		this.inherited(arguments);
	},

	_onChange: function(targetNode)
	{
		var li = targetNode.children[0];
		var className = dojo.attr(li, "className");
		this.currentValue = dojo.trim(className.replace("cell", ""));
		this.onChange(this.currentValue);
		this.currentValue = null;
	},
	_navigateByKey: function(increment)
	{
		if (!increment)
			return;
		var focusIndex = this.focusNode ? dojo.indexOf(this.cells, this.focusNode) : 0;
		var newIndex = focusIndex + increment;
		if (newIndex < 0 || newIndex >= this.cells.length)
			return;
		this._setCurrent(this.cells[newIndex]);
		dijit.focus(this.focusNode);
		pe.scene.slideEditor && pe.scene.slideEditor.announce(this.tables[newIndex].tooltip);
	},
	getValue: function()
	{
		return this.currentValue || "st_plain";
	}

});