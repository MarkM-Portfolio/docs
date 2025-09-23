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

dojo.provide("websheet.BorderToolbar");
dojo.require("websheet.Toolbar");
dojo.declare('websheet.BorderToolbar', websheet.Toolbar, {
	postCreate: function() {		
		 dojo.connect(dijit.byId('S_t_AllBorders'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.allBorders()", true));	
		 dojo.connect(dijit.byId('S_t_InnerBorders'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.innerBorders()", true));
		 dojo.connect(dijit.byId('S_t_HorizontalBorders'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.horizontalBorders()", true));
		 dojo.connect(dijit.byId('S_t_VerticalBorders'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.verticalBorders()", true));
		 dojo.connect(dijit.byId('S_t_OuterBorders'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.outerBorders()", true));		 
		 dojo.connect(dijit.byId('S_t_LeftBorder'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.leftBorder()", true));	
		 dojo.connect(dijit.byId('S_t_TopBorder'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.topBorder()", true));
		 dojo.connect(dijit.byId('S_t_RightBorder'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.rightBorder()", true));
		 dojo.connect(dijit.byId('S_t_BottomBorder'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.bottomBorder()", true));
		 dojo.connect(dijit.byId('S_t_ClearBorders'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.clearBorders()", true));
	},
	
	allBorders: function(){	
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.ALLBORDERS}]);
	},
	innerBorders: function(){		
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.INNERBORDERS}]);
	},
	horizontalBorders: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.HORIZONTALBORDERS}]);
	},
	verticalBorders: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.VERTICALBORDERS}]);
	},
	outerBorders: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.OUTERBORDERS}]);
	},
	leftBorder: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.LEFTBORDER}]);
	},
	topBorder: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.TOPBORDER}]);
	},
	rightBorder: function(){		
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.RIGHTBORDER}]);
	},
	bottomBorder: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.BOTTOMBORDER}]);
	},
	clearBorders: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERTYPE.CLEARBORDERS}]);
	}
});


dojo.declare('websheet.BorderStyleToolbar', websheet.Toolbar, {
	postCreate: function() {
		 dojo.connect(dijit.byId('S_t_BorderStyle_ThinSolid'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.borderStyle_ThinSolid()", true));	
		 dojo.connect(dijit.byId('S_t_BorderStyle_ThinDotted'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.borderStyle_ThinDotted()", true));
		 dojo.connect(dijit.byId('S_t_BorderStyle_ThinDashed'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.borderStyle_ThinDashed()", true));
		 dojo.connect(dijit.byId('S_t_BorderStyle_ThickSolid'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.borderStyle_ThickSolid()", true));
		 dojo.connect(dijit.byId('S_t_BorderStyle_ThickDotted'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.borderStyle_ThickDotted()", true));
		 dojo.connect(dijit.byId('S_t_BorderStyle_ThickDashed'), "onClick", dojo.hitch(this, this.dispatchCmd, "this.borderStyle_ThickDashed()", true));		 
	},

	borderStyle_ThinSolid: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle : BORDERSTYLE.THINSOLID}]);		
	},
	borderStyle_ThinDotted: function(){		
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle : BORDERSTYLE.THINDOTTED}]);		
	},
	borderStyle_ThinDashed: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle : BORDERSTYLE.THINDASHED}]);				
	},
	borderStyle_ThickSolid: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle : BORDERSTYLE.THICKSOLID}]);				
	},
	borderStyle_ThickDotted: function(){		
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle : BORDERSTYLE.THICKDOTTED}]);		
	},
	borderStyle_ThickDashed: function(){
		this.editor.execCommand(commandOperate.BORDERCUSTOMIZE, [{type : BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle : BORDERSTYLE.THICKDASHED}]);				
	}
});


