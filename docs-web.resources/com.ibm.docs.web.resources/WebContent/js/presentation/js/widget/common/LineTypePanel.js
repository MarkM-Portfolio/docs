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

dojo.provide("pres.widget.common.LineTypePanel");

dojo.require("concord.util.BidiUtils");
dojo.require("pres.widget.toolbar.LineType");
dojo.require("pres.widget.toolbar.LineTypeWidth");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.widget.common.LineTypePanel", [dijit._Widget, dijit._Templated], {	

	templateString: dojo.cache("pres", "templates/LineTypePanel.html"),
	endpointsButton: null,
	dashTypeButton: null,
	lineWidthButton: null,

	_setValueAttr: function()
	{
		this.setValue.apply(this, arguments);
	},
	
	_setDisabledAttr: function()
	{
		this.lineWidthButton._setDisabledAttr(pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_WIDTH).disabled);
		this.dashTypeButton._setDisabledAttr(pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_DASHTYPE).disabled);
		this.endpointsButton._setDisabledAttr(pe.scene.hub.commandsModel.getModel(pres.constants.CMD_ARROW_TYPE).disabled);
	},	

	setValue: function() 
	{
		this.lineWidthButton.setValue(pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_WIDTH).value);
		this.endpointsButton.setValue(pe.scene.hub.commandsModel.getModel(pres.constants.CMD_ARROW_TYPE).value);
		this.dashTypeButton.setValue(pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_DASHTYPE).value);
	},

	postCreate: function()
	{
		this.inherited( arguments );
		var presStrs = dojo.i18n.getLocalization("pres", "pres");
		var lineWidthItem = {
			title: presStrs.line_width_title,
			items: pres.constants.LINE_WIDTH_ITEMS,
			checkable: true,
			type: "dropdown",
		    cmd:pres.constants.CMD_LINE_WIDTH,
		    ownerDocument : this.ownerDocument,
			_focusManager : this._focusManager,
		    handler: function(e)
			{
				if (this.disabled)
					return;
				if (!this.getValue)
					dojo.publish("/command/exec", [this.cmd]);
				else
					dojo.publish("/command/exec", [this.cmd, this.getValue()]);
			}
		};
		var arrowTypeItem = {
			showIcon: true,
			isDash: false,
		    icon: "head_arrow-tail_none",
		    cmd: pres.constants.CMD_ARROW_TYPE,
		    title: presStrs.line_end_title,
		    handler: function(e)
			{
				if (this.disabled)
					return;
				if (this.cmd &&this.value)
					dojo.publish("/command/exec", [this.cmd, this.value]);
			},
			children: [{
				icon: "head_none-tail_none",
				label: presStrs.line_endpoints_type1
			},{
				icon: "head_none-tail_arrow",
				label: presStrs.line_endpoints_type2
			},{
				icon: "head_arrow-tail_none",
				label: presStrs.line_endpoints_type3
			},{
				icon: "head_arrow-tail_arrow",
				label: presStrs.line_endpoints_type4
			},{
				icon: "head_none-tail_triangle",
				label: presStrs.line_endpoints_type5
			},{
				icon: "head_triangle-tail_none",
				label: presStrs.line_endpoints_type6
			},{
				icon: "head_triangle-tail_triangle",
				label: presStrs.line_endpoints_type7
			},{
				icon: "head_oval-tail_triangle",
				label: presStrs.line_endpoints_type8
			},{
				icon: "head_diamond-tail_triangle",
				label: presStrs.line_endpoints_type9
			},{
				icon: "head_diamond-tail_diamond",
				label: presStrs.line_endpoints_type10
			},{
				icon: "head_oval-tail_oval",
				label: presStrs.line_endpoints_type11
			}]
		};

		var dashTypeItem = {
			checkable: true,
			showIcon: true,
			isDash: true,
			iconClass: "solid",
			title: presStrs.line_dash_title,
		    cmd: pres.constants.CMD_LINE_DASHTYPE,
		    ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			handler: function(e)
			{
				if (this.disabled)
					return;
				if (this.cmd &&this.value)
					dojo.publish("/command/exec", [this.cmd, this.value]);
			},
			children: [{
				icon: 'solid',
				label: presStrs.line_dash_type1,
				value: 'none'
			},{
				icon:'dash',
				label: presStrs.line_dash_type3,
				value: '4, 3'
			},{
				icon:'sysDash',
				label: presStrs.line_dash_type2,
				value: '3, 1'
			},{
				icon: 'sysDot',
				label: presStrs.line_dash_type4,
				value: '1, 1'
			},{
				icon:'dashDot',
				label: presStrs.line_dash_type5,
				value: '4, 3, 1, 3'
			},{
				icon:'lgDash',
				label: presStrs.line_dash_type6,
				value: '8, 3'
			}/*,{
				label: 'type6',
				value: '4, 3, 1, 3'
			},{
				label: 'type7',
				value: '8, 3, 1, 3, 1, 3'
			},*/],
		};
		this.lineWidthButton = new pres.widget.toolbar.LineTypeWidth(lineWidthItem);	
		this.lineTypePanel.appendChild(this.lineWidthButton.domNode);
		this.dashTypeButton = new pres.widget.toolbar.LineType(dashTypeItem);
		this.lineTypePanel.appendChild(this.dashTypeButton.domNode);	
		this.endpointsButton = new pres.widget.toolbar.LineType(arrowTypeItem);
		this.lineTypePanel.appendChild(this.endpointsButton.domNode);	
	}
});