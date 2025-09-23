dojo.provide("writer.common.tools");
dojo.require("writer.core.Event");
common.tools = {};
common.tools.DPI = {};

common.tools.getDPI = function() {
	if (window.screen.logicalXDPI && window.screen.logicalXDPI > 0) {
		common.tools.DPI.x = window.screen.logicalXDPI;
		common.tools.DPI.y = window.screen.logicalYDPI;
	} else {
		var tempDiv = window.document.createElement('div');
		tempDiv.style.cssText = "width:1in; height:1in; visibility:hidden";
		window.document.body.appendChild(tempDiv);
		common.tools.DPI.x = tempDiv.offsetWidth;
		common.tools.DPI.y = tempDiv.offsetHeight;
		window.document.body.removeChild(tempDiv);
	}
};

dojo.subscribe(writer.EVENT.BEFORE_LOAD, this, common.tools.getDPI);

common.tools.extend = function(prototype, obj) {
	for ( var n in obj) {
		if (!prototype[n]) {
			prototype[n] = obj[n];
		}
	}
};
common.tools.override = function(prototype, property, obj) {
	for (f in obj) {
		if (!prototype[f])
			prototype[f] = Function("return this." + property + "." + f
					+ "(arguments)");
	}
};
common.tools.PtToPx = function(pt) {
	var inch = pt * common.tools.DPI.x;
	return inch / 72;
};
common.tools.PxToPt = function(px) {
	var inch = px / common.tools.DPI.x;
	return inch * 72;
};

common.tools.PxToCm = function(px) {
	var inch = px / common.tools.DPI.x;
	var cm = inch * 2.54;
	return cm;
};

common.tools.toPxValue = function(value, unit) {
	if (!value) {
		return 0;
	}
	if (!unit) {
		if (isNaN(value)) {
			value = common.tools.toCmValue(value);
			return isNaN(value) ? NaN : common.tools.CmToPx(value);
		} else {
			return parseFloat(value) || 0;
		}
	} else {
		switch (unit) {
		case "dxa":
			var inch = parseFloat(value) / 1440;
			return inch * common.tools.DPI.x;
			break;
		default:
			return -1;
		}
	}

};
common.tools.PxToDXA = function(value){
	value = value*1440/common.tools.DPI.x;
	return value;
};
/**
 * Below funtion is to convert cm to px under 96dpi
 * 
 * @param cm
 * @return px
 */
common.tools.CmToPx = function(cm) {
	var inch = cm / 2.54;
	var px = inch * common.tools.DPI.x;
	return px;
};
/**
 * Convert em to cm
 * 
 * @param em
 * @return cm
 */
common.tools.EmToCm = function(em) {
	return em * 2.54 / 6;
};
/**
 * Convert pt to cm
 * 
 * @param pt
 * @return cm
 */
common.tools.PtToCm = function(pt) {
	return pt * 2.54 / 72;
};
/**
 * Convert pc to cm
 * 
 * @param pc
 * @return cm
 */
common.tools.PcToCm = function(pc) {
	return pc * 2.54 / 6;
};

if (dojo.isIE && dojo.isIE < 9) {
	var trimRegex = /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g;
	String.prototype.trim = (function() {
		return this.replace(trimRegex, '');
	});
}

if (dojo.isIE) {
	var trimRightReg = /(?:[ \t\n\r]+$)/g;
	String.prototype.trimRight = (function() {
		return this.replace(trimRightReg, '');
	});
}

/**
 * convert a string to cm unit number for example: toCmValue('1.4cm' ) , result
 * is 1.4 toCmValue( '10px' )
 * 
 * @param string
 * @return float
 */
common.tools.toCmValue = function(string) {
	if (!string || !string.toLowerCase) {
		console.log("argument exception in common.tools.toCmValue");
		return 0;
	}
	var r = string.toLowerCase().match(
			/^([\+|-]?[\d|\.]*e?[\+|-]?\d+)(pc|px|pt|em|cm|in|mm|emu)$/i);
	if (r && r.length == 3) {
		switch (r[2]) {
		case 'px':
			return this.PxToCm(parseFloat(r[1]));
			break;
		case 'em':
			return this.EmToCm(parseFloat(r[1]));
			break;
		case 'pt':
			return this.PtToCm(parseFloat(r[1]));
			break;
		case 'pc':
			return this.PcToCm(parseFloat(r[1]));
			break;
		case 'in':
			return parseFloat(r[1]) * 2.54;
			break;
		case 'mm':
			return parseFloat(r[1]) / 10;
			break;
		case 'cm':
			return parseFloat(r[1]);
		case 'emu':
			return parseFloat(r[1]) / 360000;
		}
	}

	console.error("regex error when converting unit!");
	return NaN;
};

/**
 * convert a string to pt unit number for example: toPtValue('1.4pt' ) , result
 * is 1.4 toPtValue( '10px' )
 * 
 * @param string
 * @return float
 */
common.tools.toPtValue = function(string) {
	var cm = this.toCmValue(string);
	return isNaN(cm) ? NaN : cm * 72 / 2.54;
};
common.tools.insertAfter = function(insertedNode, targetNode) {
	var parent = targetNode.parentNode;
	if (parent.lastChild == targetNode) {
		parent.appendChild(insertedNode);
	} else {
		parent.insertBefore(insertedNode, targetNode.nextSibling);
	}
};

/**
 * If the style has subscript/supscript, need convert its font size
 */
common.tools.transformFontSize = function(style) {
	var verticalAlign = style['vertical-align'];
	if (style['font-size']
			&& (verticalAlign == "super" || verticalAlign == "sub")) {
		return common.tools.PxToPt(common.tools.toPxValue(style['font-size'])) * 0.6
		+ "pt";
	}
};

// Reference from CKeditor find&replace
var wordSeparatorRegex = /[.,"'?!;: \u0085\u00a0\u1680\u280e\u2028\u2029\u202f\u205f\u3000]/;

/**
 * Check CJK and Thai language from Moz
 * http://lxr.mozilla.org/seamonkey/source/intl/lwbrk/src/nsJISx4501LineBreaker.cpp
 * 
 * Thai char: 0x0e00 - 0x0e7f CJK char: 0x1100 - 0x11ff, 0x2e80 - 0xd7ff, 0xf900 -
 * 0xfaff, 0xff00 - 0xffef IS_HAN: (( 0x3400 <= (c)) && ((c) <= 0x9fff))||((
 * 0xf900 <= (c)) && ((c) <= 0xfaff)) IS_KATAKANA(c) (( 0x30A0 <= (c)) && ((c) <=
 * 0x30FF)) IS_HIRAGANA(c) (( 0x3040 <= (c)) && ((c) <= 0x309F))
 * IS_HALFWIDTHKATAKANA(c) (( 0xFF60 <= (c)) && ((c) <= 0xFF9F))
 * 
 */

common.tools.isWordBreak = function(text, index) {
	// space, other unicode character
	var code = text.charCodeAt(index);
	return (9 <= code && code <= 0xd) || (code == 47)
			|| (0x2000 <= code && code <= 0x200a)
			|| (0x0e00 <= code && code <= 0x0e7f) // Thai
			|| (0x1100 <= code && code <= 0x11ff)
			|| (0x2e80 <= code && code <= 0xd7ff)
			|| (0xf900 <= code && code <= 0xfaff)
			|| (0xff00 <= code && code <= 0xffef) // CJK
			|| (0x3400 <= code && code <= 0x9fff)
			|| (0xf900 <= code && code <= 0xfaff) // Han
			|| (0x30A0 <= code && code <= 0x30FF) // KATAKANA
			|| (0x3040 <= code && code <= 0x309F) // HIRAGANA
			|| (0xFF60 <= code && code <= 0xFF9F) // HALFWIDTHKATAKANA
			|| wordSeparatorRegex.test(text[index]); // TODO check the text
	// first can improve the
	// performance.

	// (code == 47) for Character '/'
	// TODO For web link: http://www.ibm.com/docs/app
	// The first slash should not be a word break.
};

common.tools.hasWordSeparator = function(text) {
	// space, other unicode character
	var code = text.charCodeAt(0);
	return (9 <= code && code <= 0xd) || (code == 47)
			|| (0x2000 <= code && code <= 0x200a)
			|| (0x0e00 <= code && code <= 0x0e7f) // Thai
			|| (0x1100 <= code && code <= 0x11ff)
			|| (0x2e80 <= code && code <= 0xd7ff)
			|| (0xf900 <= code && code <= 0xfaff)
			|| (0xff00 <= code && code <= 0xffef) // CJK
			|| (0x3400 <= code && code <= 0x9fff)
			|| (0xf900 <= code && code <= 0xfaff) // Han
			|| (0x30A0 <= code && code <= 0x30FF) // KATAKANA
			|| (0x3040 <= code && code <= 0x309F) // HIRAGANA
			|| (0xFF60 <= code && code <= 0xFF9F) // HALFWIDTHKATAKANA
			|| wordSeparatorRegex.test(text);
};

/**
 * Compare two number arrays Return 0 if the two arrays are equal Return 1 if
 * the Array A bigger than Array B Return -1 if the Array A less than Array B
 */
common.tools.arrayCompare = function(arrayA, arrayB) {
	var len = Math.min(arrayA.length, arrayB.length);
	for ( var i = 0; i < len; i++) {
		if (arrayA[i] > arrayB[i])
			return 1;
		else if (arrayA[i] < arrayB[i])
			return -1;
	}
	if (arrayA.length > arrayB.length)
		return 1;
	else if (arrayA.length < arrayB.length)
		return -1;

	return 0;
};

/**
 * Reference from CK
 */
common.tools.cssStyleToDomStyle = function( cssName )
{
	return cssName.replace( /-./g, function( match )
			{
				return match.substr( 1 ).toUpperCase();
			});
};
common.tools.isWin8 = function(){
	return navigator.userAgent.indexOf("Windows NT 6.2")!= -1 || navigator.userAgent.indexOf("Windows NT 6.3")!= -1;
};
common.tools.isWin7 = function(){
	return navigator.userAgent.indexOf("Windows NT 6.1")!= -1;
};
common.tools.isIE11 = function(){
	if(navigator.userAgent.indexOf("Trident/7.0")!= -1 && 
	navigator.userAgent.indexOf("rv:11.0")!= -1 && 
	navigator.userAgent.indexOf("like Gecko")!= -1)
		return 11;
	return undefined;
};
common.tools.isEmpty = function(obj){
	for(var key in obj){
		if(obj[key]){
			return false;
		}		
	}
	return true;
};

common.tools.borderMap={
	"none":"none",
	"nil":"none",
	"dotted":"dotted",
	"single":"solid","wave":"solid","doubleWave":"solid","dashDotStroked":"solid",
	"dashSmallGap":"dashed","dashed":"dashed","dotDash":"dashed","dotDotDash":"dashed",
	"double":"double","triple":"double","thinThickSmallGap":"double","thickThinSmallGap":"double","thinThickThinSmallGap":"double","thinThickMediumGap":"double",
	"thickThinMediumGap":"double","thinThickThinMediumGap":"double","thinThickLargeGap":"double","thickThinLargeGap":"double","thinThickThinLargeGap":"double",
	"threeDEngrave":"groove",
	"threeDEmboss":"ridge",
	"inset":"inset",
	"outset":"outset"
};

common.tools.startWith = function(target,startString)
{
	   if(!target || !startString)
		   return false;
	   if(typeof target != 'string')
		   return false;
	   if(typeof startString === 'string')
	   {
		   if(target.substring(0,startString.length) == startString)
			   return true;
	   }else if(typeof startString === 'object' && startString.length)
	   {
		   for(var i=0;i<startString.length;i++)
        {
			   if(target.substring(0,startString[i].length) == startString[i])
				   return true;
        }
	   }
	   return false;
};