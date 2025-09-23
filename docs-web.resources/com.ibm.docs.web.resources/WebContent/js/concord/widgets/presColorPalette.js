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

/*
 * Subclass of dijit colorPalette to handle 'transparent' color which
 * is currently not defined in the version of dojo IBM Docs is using.
 * 
 * When dojo does support 'transparent' (dojo 1.6.2 appears to have some fixes)
 * then add additional support in this class to handle manipulation of the 
 * title and text and remove from tablestyles plugin.
 */
dojo.provide("concord.widgets.presColorPalette");

dojo.require("dijit.ColorPalette");

dojo.declare("concord.widgets.presColorPalette", dijit.ColorPalette, {
	connectArray: [],
	DIALOGS:	'dialogs',
	
	// Added transparent color to palettes for IBM Docs
	// Removed lavendar from 7x10 and lime from 3x4
	_palettes: {
		"7x10":	[["transparent", "white", "seashell", "cornsilk", "lemonchiffon","lightyellow", "palegreen", "paleturquoise", "lightcyan", "plum"],
				["lightgray", "pink", "bisque", "moccasin", "khaki", "lightgreen", "lightseagreen", "lightskyblue", "cornflowerblue", "violet"],
				["silver", "lightcoral", "sandybrown", "orange", "palegoldenrod", "chartreuse", "mediumturquoise", 	"skyblue", "mediumslateblue","orchid"],
				["gray", "red", "orangered", "darkorange", "yellow", "limegreen", 	"darkseagreen", "royalblue", "slateblue", "mediumorchid"],
				["dimgray", "crimson", 	"chocolate", "coral", "gold", "forestgreen", "seagreen", "blue", "blueviolet", "darkorchid"],
				["darkslategray","firebrick","saddlebrown", "sienna", "olive", "green", "darkcyan", "mediumblue", "darkslateblue", "darkmagenta" ],
				["black", "darkred", "maroon", "brown", "darkolivegreen", "darkgreen", "midnightblue", "navy", "indigo", "purple"]],

		"3x4": [["transparent", "white", "green", "blue"],
			["silver", "yellow", "navy"],
			["gray", "red", "purple", "black"]]
	},

	
	constructor: function(opts) {
		this.inherited(arguments);
	}
});


