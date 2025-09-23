/**
 * ColorPalette of IBM docs.
 */
dojo.provide("writer.ui.widget.ColorPalette");
dojo.require("dijit.Toolbar");
dojo.require("dijit.ColorPalette");
dojo.require("concord.widgets.colorPickerDialog");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("writer.ui.widget","ColorPalette");
dojo.declare("writer.ui.widget.ColorPalette",
	[dijit._Widget, dijit._Templated, dijit._PaletteMixin],
	{
	palette: "7x10",	
	_palettes: {
		"7x10":	[["white", "seashell", "cornsilk", "lemonchiffon","lightyellow", "palegreen", "paleturquoise", "lightcyan",	"lavender", "plum"],
				["lightgray", "pink", "bisque", "moccasin", "khaki", "lightgreen", "lightseagreen", "lightskyblue", "cornflowerblue", "violet"],
				["silver", "lightcoral", "sandybrown", "orange", "palegoldenrod", "chartreuse", "mediumturquoise", 	"skyblue", "mediumslateblue","orchid"],
				["gray", "red", "orangered", "darkorange", "yellow", "limegreen", 	"darkseagreen", "royalblue", "slateblue", "mediumorchid"],
				["dimgray", "crimson", 	"chocolate", "coral", "gold", "forestgreen", "seagreen", "blue", "blueviolet", "darkorchid"],
				["darkslategray","firebrick","saddlebrown", "sienna", "olive", "green", "darkcyan", "mediumblue","darkslateblue", "darkmagenta" ],
				["black", "darkred", "maroon", "brown", "darkolivegreen", "darkgreen", "midnightblue", "navy", "indigo", 	"purple"]],

		"3x4": [["white", "lime", "green", "blue"],
			["silver", "yellow", "fuchsia", "navy"],
			["gray", "red", "purple", "black"]]
	},
	colorMap:{
		'#FFFFFF':0, '#FFF5EE':1, '#FFF8DC':2, '#FFFACD':3, '#FFFFE0':4, '#98FB98':5, '#AFEEEE':6, '#E0FFFF':7, '#E6E6FA':8, '#DDA0DD':9, '#D3D3D3':10, '#FFC0CB':11, '#FFE4C4':12, '#FFE4B5':13, '#F0E68C':14, '#90EE90':15, '#20B2AA':16, '#87CEFA':17, '#6495ED':18, '#EE82EE':19, '#C0C0C0':20, '#F08080':21, '#F4A460':22, '#FFA500':23, '#EEE8AA':24, '#7FFF00':25, '#48D1CC':26, '#87CEEB':27, '#7B68EE':28, '#DA70D6':29, '#808080':30, '#FF0000':31, '#FF4500':32, '#FF8C00':33, '#FFFF00':34, '#32CD32':35, '#8FBC8F':36, '#4169E1':37, '#6A5ACD':38, '#BA55D3':39, '#696969':40, '#DC143C':41, '#D2691E':42, '#FF7F50':43, '#FFD700':44, '#228B22':45, '#2E8B57':46, '#0000FF':47, '#8A2BE2':48, '#9932CC':49, '#2F4F4F':50, '#B22222':51, '#8B4513':52, '#A0522D':53, '#808000':54, '#008000':55, '#008B8B':56, '#0000CD':57, '#483D8B':58, '#8B008B':59, '#000000':60, '#8B0000':61, '#800000':62, '#A52A2A':63, '#556B2F':64, '#006400':65, '#191970':66, '#000080':67, '#4B0082':68, '#800080':69},
	templateString: dojo.cache("writer.ui.widget", "templates/ColorPalette.html"),
	onAutoClick:function(evt){
		this._antoColorNode = evt.originalTarget;
		this._antoColorNode && dojo.style(this._antoColorNode, 'border','1px solid');
		this.onChange("autoColor");
	},
	_setCurrent: function(node){
		if(node == this.autoNode){
			this.focusSection = "autonode";
		}
		else if(node == this.moreNode){
			this.focusSection = "morenode";
		}
		else{
			this.focusSection = "gridnode";
			this.inherited(arguments);
			if(dojo.isFF){
				var value = this._getDye(node).getValue();								
				this._setValueAttr(value, false);
			}
		}
	},
	onKeyDown:function(evt){
		console.info(evt);
	},
	setFocus: function(node){
		this.clearSelIndicator();
		this._selectedCell = -1;
		this._setCurrent(node);
		this.focus();
	},
	focus: function() {
		if(this.focusSection == "autonode")
			return this.autoNode.focus();
		if(this.focusSection == "morenode")
			return this.moreNode.focus();
		return this.inherited(arguments);
	},
	clearSelIndicator:function(){
		this._antoColorNode && dojo.style(this._antoColorNode, "border","");
		if(this._selectedCell >= 0){
			dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
		}
	},	
	onMoreClick:function(evt){
		var params = {
				callback:this.onChange
		};
		if(!this.nls)
			this.nls = dojo.i18n.getLocalization("writer.ui.widget","ColorPalette");
		var dialog = new concord.widgets.colorPickerDialog(null, this.nls.selectColor, null, null, params);
		dialog.show();
	},
	// Copy from dijit/ColorPalette.js
	_dyeFactory: function(value, row, col, title){
		// Overrides _PaletteMixin._dyeFactory().
		return new this._dyeClass(value, row, col, title);
	},
	focusSection :"gridnode",
	postCreate:function(){
		this.inherited(arguments);
		dojo.connect(this.containerNode,"onkeydown",this,function(evt){
			var keys = dojo.keys;			
			if(evt.charCode == keys.ENTER || evt.keyCode == keys.ENTER){				
				if(evt.target == this.autoNode){
					this.onAutoClick();
					dojo.stopEvent(evt);
				}else if(evt.target == this.moreNode){
					this.onMoreClick();
					dojo.stopEvent(evt);
				}
			}
			if(evt.charCode == keys.TAB || evt.keyCode == keys.TAB){
				if(evt.shiftKey){
					if(this.focusSection =="gridnode"){
						this.focusSection ="autonode";
						this.autoNode.focus();
					}else if(this.focusSection =="autonode"){
						this.focusSection ="morenode";
						this.moreNode.focus();
					}else if(this.focusSection =="morenode"){
						this.focusSection ="gridnode";
						this.gridNode.focus();
						this.focus();
					}
				}else{
					if(this.focusSection =="morenode"){
						this.focusSection ="autonode";
						this.clearSelIndicator();
						this.autoNode.focus();
					}else if(this.focusSection =="gridnode"){
						this.focusSection ="morenode";
						this.clearSelIndicator();
						this.moreNode.focus();
					}else if(this.focusSection =="autonode"){
						this.focusSection ="gridnode";
						this.gridNode.focus();
						var index = this.colorMap[this._currentColor ];
						this.setFocus((this._cells[index]||this._cells[0]).node);
						this.focus();
					}
				}
				
				dojo.stopEvent(evt);
			}
			
		});
	},
	buildRendering: function(){
		// Instantiate the template, which makes a skeleton into which we'll insert a bunch of
		// <img> nodes
		if(!this.nls)
			this.nls = dojo.i18n.getLocalization("writer.ui.widget","ColorPalette");
		this.templateString = dojo.string.substitute(this.templateString,[this.nls.auto, this.nls.moreColor, this.nls.acc_moreColor_title]);
		this.inherited(arguments);
		if(BidiUtils.isGuiRtl())
			this.dir = 'rtl';

		//	Creates customized constructor for dye class (color of a single cell) for
		//	specified palette and high-contrast vs. normal mode.   Used in _getDye().
		this._dyeClass = dojo.declare(dijit._Color, {
			hc: dojo.hasClass(dojo.body(), "dijit_a11y"),
			palette: this.palette
		});
		
		// Creates <img> nodes in each cell of the template.
		// Pass in "customized" dijit._Color constructor for specified palette and high-contrast vs. normal mode
		this._preparePalette(
			this._palettes[this.palette],
			dojo.i18n.getLocalization("dojo", "colors", this.lang)
		);
	}
});
//define("writer/ui/widget/ColorPalette", ["dojo", "dijit", "dijit/_Widget", "dijit/_Templated", "dojo/colors", "dojo/i18n", "dojo/string", "dijit/_PaletteMixin", "i18n!dojo/nls/colors","concord/widgets/colorPickerDialog"], function(dojo, dijit) {});