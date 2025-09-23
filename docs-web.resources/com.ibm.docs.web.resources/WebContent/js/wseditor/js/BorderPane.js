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

dojo.provide("websheet.BorderPane");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("websheet.ColorPalette");
dojo.require("websheet.BorderToolbar");
dojo.declare("websheet.BorderPane",
	[dijit._Widget, dijit._Templated],
	{	
	templateString: "<div id='borderOpinionToolbar'  dojoAttachPoint='divNode' class='dijit dijitToolbar websheetToolbar borderOpinionToolbar'></div>",
	
	BORDERSECTION: {
			SECTIONBORDER:"SECTIONBORDER",
			SECTIONBORDERSTYLE:"SECTIONBORDERSTYLE",
			SECTIONBORDERCOLOR: "SECTIONBORDERCOLOR"
		},

	buildRendering: function(){	
		this.inherited(arguments);
		this.domNode.style.position = "relative";		
		this.borderBar = new websheet.BorderToolbar({}, this.divNode);		
		this.borderBar.setBase(this.editor);		
		createToolbar(this.editor.scene, this.divNode,this.borderBar,null, "S_t_border");
		
		this.styleBar = new websheet.BorderStyleToolbar({}, this.divNode);		
		this.styleBar.setBase(this.editor);
		createToolbar(this.editor.scene, this.divNode,this.styleBar,null, "S_t_BorderStyle");		
		
		this.colorDiv = dojo.create('div',{id:"co"},this.divNode);
		this.dropDown = new websheet.BorderColorPalette({
			id:'S_m_BorderColor',
			style:'margin-left:8px',
			editor: this.editor
		}, this.colorDiv);
	
		dojo.connect(dijit.byId("S_t_border"), "onKeyDown", dojo.hitch(this,this.onKeydown, this.BORDERSECTION.SECTIONBORDER));
		dojo.connect(dijit.byId("S_t_BorderStyle"), "onKeyDown", dojo.hitch(this,this.onKeydown, this.BORDERSECTION.SECTIONBORDERSTYLE));
		dojo.connect(this.dropDown, "onKeyDown", dojo.hitch(this,this.onKeydown, this.BORDERSECTION.SECTIONBORDERCOLOR));		
//		dojo.connect(this.divNode, "onkeypress", this, "discard");
//		dojo.connect(this.divNode, "onkeyup", this, "discard");		
	},
	
	setBorderColor: function(colorValue){
		this.dropDown.setSelected(colorValue);		
	},
	
	onKeydown: function(sectionFocused, e){		
		var dk = dojo.keys, item = null;
		switch(e.keyCode){
		case dk.TAB:  
			dojo.stopEvent(e);
			var isUpper = e.shiftKey ? true : false;
			var section = null;
			if(sectionFocused == this.BORDERSECTION.SECTIONBORDERCOLOR){
				if(isUpper)
					section = this.BORDERSECTION.SECTIONBORDERSTYLE;
				else
					section = this.BORDERSECTION.SECTIONBORDER;
					
			}else if(sectionFocused == this.BORDERSECTION.SECTIONBORDERSTYLE){
				if(isUpper)
					section = this.BORDERSECTION.SECTIONBORDER;
				else
					section = this.BORDERSECTION.SECTIONBORDERCOLOR;
				
			}else if(sectionFocused == this.BORDERSECTION.SECTIONBORDER){
				if(isUpper)
					section = this.BORDERSECTION.SECTIONBORDERCOLOR;
				else
					section = this.BORDERSECTION.SECTIONBORDERSTYLE;
			}
			
			if(section == this.BORDERSECTION.SECTIONBORDERCOLOR){
				dijit.byId("S_m_BorderColor").focus();				
			}else if(section == this.BORDERSECTION.SECTIONBORDERSTYLE){
				dijit.byId("S_t_BorderStyle").focus();
				dijit.byId("S_t_BorderStyle_ThinSolid").focus();				
			}else if(section == this.BORDERSECTION.SECTIONBORDER){
				dijit.byId("S_t_border").focus();
				dijit.byId("S_t_ClearBorders").focus();
			}
			break;
		default:
			break;
		}
	},
	discard: function(e){
		dojo.stopEvent(e);//Discard the keypress/keyup event to prevent dojo grid from handling .
	}	
});
