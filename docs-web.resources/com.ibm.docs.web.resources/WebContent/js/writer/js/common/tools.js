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
define([
    "dojo/_base/lang",
    "dojo/json",
    "dojo/has",
    "dojo/topic",
    "writer/core/Event",
    "writer/constants"
], function(lang, json, has, topic, Event, constants) {

    var tools = lang.mixin(lang.getObject("writer.common.tools", true), {
        DPI: {},
        screen: {}
    });

    tools.getDPI = function() {
        if (window.screen.logicalXDPI && window.screen.logicalXDPI > 0) {
            tools.DPI.x = window.screen.logicalXDPI;
            tools.DPI.y = window.screen.logicalYDPI;
        } else {
            var tempDiv = window.document.createElement('div');
            tempDiv.style.cssText = "width:1in; height:1in; visibility:hidden";
            window.document.body.appendChild(tempDiv);
            tools.DPI.x = tempDiv.offsetWidth;
            tools.DPI.y = tempDiv.offsetHeight;

            var tempP = window.document.createElement('p');
            tempP.style.cssText = "width:100px; height:100px; overflowY:scroll";
            window.document.body.appendChild(tempP);
            var scrollbarW = tempP.offsetWidth - tempP.clientWidth;
            tools.screen.scrollbarWidth = scrollbarW;

            window.document.body.removeChild(tempDiv);
            window.document.body.removeChild(tempP);
        }
    };

    topic.subscribe(constants.EVENT.BEFORE_LOAD, lang.hitch(tools, tools.getDPI));

    tools.extend = function(prototype, obj) {
        for (var n in obj) {
            if (!prototype[n]) {
                prototype[n] = obj[n];
            }
        }
    };
    tools.override = function(prototype, property, obj) {
        for (f in obj) {
            if (!prototype[f])
                prototype[f] = Function("return this." + property + "." + f + "(arguments)");
        }
    };
    tools.PtToPx = function(pt) {
        var inch = pt * tools.DPI.x;
        return inch / 72;
    };
    tools.PxToPt = function(px) {
        var inch = px / tools.DPI.x;
        return inch * 72;
    };

    tools.PxToCm = function(px) {
        var inch = px / tools.DPI.x;
        var cm = inch * 2.54;
        return cm;
    };

    tools.PxToEmu = function(px) {
    	return Math.ceil(px * 914400 / tools.DPI.x);
    };

    tools.toPxValue = function(value, unit) {
        if (!value) {
            return 0;
        }
        if (!unit) {
            if (isNaN(value)) {
                value = tools.toCmValue(value);
                return isNaN(value) ? NaN : tools.CmToPx(value);
            } else {
                return parseFloat(value) || 0;
            }
        } else {
            switch (unit) {
                case "dxa":
                    var inch = parseFloat(value) / 1440;
                    return inch * tools.DPI.x;
                    break;
                default:
                    return -1;
            }
        }

    };
    tools.PxToDXA = function(value) {
        value = value * 1440 / tools.DPI.x;
        return value;
    };
    /**
     * Below funtion is to convert cm to px under 96dpi
     * 
     * @param cm
     * @return px
     */
    tools.CmToPx = function(cm) {
        var inch = cm / 2.54;
        var px = inch * tools.DPI.x;
        return px;
    };
    /**
     * Convert em to cm
     * 
     * @param em
     * @return cm
     */
    tools.EmToCm = function(em) {
        return em * 2.54 / 6;
    };
    /**
     * Convert pt to cm
     * 
     * @param pt
     * @return cm
     */
    tools.PtToCm = function(pt) {
        return pt * 2.54 / 72;
    };
    /**
     * Convert pc to cm
     * 
     * @param pc
     * @return cm
     */
    tools.PcToCm = function(pc) {
        return pc * 2.54 / 6;
    };
    
    /**
     * Convert pc to cm
     * 
     * @param pc
     * @return cm
     */
    tools.getScrollbarWidth = function() {
        return (tools.screen.scrollbarWidth || 15);
    };

    if (has("ie") && has("ie") < 9) {
        var trimRegex = /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g;
        String.prototype.trim = (function() {
            return this.replace(trimRegex, '');
        });
    }

    if ((has("ie") || has("trident"))) {
        var trimRightReg = /(?:[ \t\n\r]+$)/g;
        String.prototype.trimRight = (function() {
            return this.replace(trimRightReg, '');
        });
    }
 
    String.prototype.getBytesLength = function(){
    	var len = 0;
    	for(var i=0;i<this.length;i++){
    		var c = this.charAt(i);
    		if(/^[\u0000-\u00ff]$/.test(c))
    			len++;
    		else
    			len += 2;
    	}
    	return len;
    };

//    String.prototype.getUTF8BytesLength = function(){
//    	var len = 0;
//    	var charCode;
//    	for(var i=0;i<this.length;i++){
//    		charCode = this.charCodeAt(i);
//    		if(charCode <0x007f)
//    			len++;
//    		else if((0x0080 <= charCode) && (charCode <= 0x07ff))
//    			len += 2;
//    		else if((0x0800 <= charCode) && (charCode <= 0xffff))
//    			len += 3;
//    		else
//    			len += 4;
//    	}
//    	return len;
//    };

    /**
     * convert a string to cm unit number for example: toCmValue('1.4cm' ) , result
     * is 1.4 toCmValue( '10px' )
     * 
     * @param string
     * @return float
     */
    tools.toCmValue = function(string) {
        if (!string || !string.toLowerCase) {
            console.log("argument exception in tools.toCmValue");
            return 0;
        }
        var r = string.toLowerCase().match(
            /^([\+|-]?[\d|\.]*e?[\+|-]?\d+)(pc|px|pt|em|rem|cm|in|mm|emu)$/i);
        if (r && r.length == 3) {
            switch (r[2]) {
                case 'px':
                    return this.PxToCm(parseFloat(r[1]));
                    break;
                case 'rem':
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
    tools.toPtValue = function(string) {
        var cm = this.toCmValue(string);
        return isNaN(cm) ? NaN : cm * 72 / 2.54;
    };
    tools.insertAfter = function(insertedNode, targetNode) {
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
    tools.transformFontSize = function(style) {
        var verticalAlign = style['vertical-align'];
        if (style['font-size'] && (verticalAlign == "super" || verticalAlign == "sub")) {
            return tools.PxToPt(tools.toPxValue(style['font-size'])) * 0.6 + "pt";
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

    tools.isWordBreak = function(text, index) {
        // space, other unicode character
        var code = text.charCodeAt(index);
        return (9 <= code && code <= 0xd) || (code == 47) || (0x2000 <= code && code <= 0x200a) || (0x0e00 <= code && code <= 0x0e7f) // Thai
            || (0x1100 <= code && code <= 0x11ff) || (0x2e80 <= code && code <= 0xd7ff) || (0xf900 <= code && code <= 0xfaff) || (0xff00 <= code && code <= 0xffef) // CJK
            || (0x3400 <= code && code <= 0x9fff) || (0xf900 <= code && code <= 0xfaff) // Han
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

    tools.hasWordSeparator = function(text) {
        // space, other unicode character
        var code = text.charCodeAt(0);
        return (9 <= code && code <= 0xd) || (code == 47) || (0x2000 <= code && code <= 0x200a) || (0x0e00 <= code && code <= 0x0e7f) // Thai
            || (0x1100 <= code && code <= 0x11ff) || (0x2e80 <= code && code <= 0xd7ff) || (0xf900 <= code && code <= 0xfaff) || (0xff00 <= code && code <= 0xffef) // CJK
            || (0x3400 <= code && code <= 0x9fff) || (0xf900 <= code && code <= 0xfaff) // Han
            || (0x30A0 <= code && code <= 0x30FF) // KATAKANA
            || (0x3040 <= code && code <= 0x309F) // HIRAGANA
            || (0xFF60 <= code && code <= 0xFF9F) // HALFWIDTHKATAKANA
            || wordSeparatorRegex.test(text);
    };

    /**
     * Compare two number arrays Return 0 if the two arrays are equal Return 1 if
     * the Array A bigger than Array B Return -1 if the Array A less than Array B
     */
    tools.arrayCompare = function(arrayA, arrayB) {
        var len = Math.min(arrayA.length, arrayB.length);
        for (var i = 0; i < len; i++) {
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
    tools.cssStyleToDomStyle = function(cssName) {
        return cssName.replace(/-./g, function(match) {
            return match.substr(1).toUpperCase();
        });
    };
    tools.isWin8 = function() {
        return navigator.userAgent.indexOf("Windows NT 6.2") != -1 || navigator.userAgent.indexOf("Windows NT 6.3") != -1;
    };
    tools.isWin7 = function() {
        return navigator.userAgent.indexOf("Windows NT 6.1") != -1;
    };
    tools.isIE11 = function() {
        if (navigator.userAgent.indexOf("Trident/7.0") != -1 &&
            navigator.userAgent.indexOf("rv:11.0") != -1 &&
            navigator.userAgent.indexOf("like Gecko") != -1)
            return 11;
        return undefined;
    };
    tools.isEmpty = function(obj) {
    	if (lang.isArray(obj))
    		return obj.length == 0;
        for (var key in obj) {
            if (obj[key]) {
                return false;
            }
        }
        return true;
    };

    tools.borderMap = {
        "none": "none",
        "nil": "none",
        "dotted": "dotted",
        "single": "solid",
        "wave": "solid",
        "doubleWave": "solid",
        "dashDotStroked": "solid",
        "dashSmallGap": "dashed",
        "dashed": "dashed",
        "dotDash": "dashed",
        "dotDotDash": "dashed",
        "double": "double",
        "triple": "double",
        "thinThickSmallGap": "double",
        "thickThinSmallGap": "double",
        "thinThickThinSmallGap": "double",
        "thinThickMediumGap": "double",
        "thickThinMediumGap": "double",
        "thinThickThinMediumGap": "double",
        "thinThickLargeGap": "double",
        "thickThinLargeGap": "double",
        "thinThickThinLargeGap": "double",
        "threeDEngrave": "groove",
        "threeDEmboss": "ridge",
        "inset": "inset",
        "outset": "outset"
    };

    tools.startWith = function(target, startString) {
        if (!target || !startString)
            return false;
        if (typeof target != 'string')
            return false;
        if (typeof startString === 'string') {
            if (target.substring(0, startString.length) == startString)
                return true;
        } else if (typeof startString === 'object' && startString.length) {
            for (var i = 0; i < startString.length; i++) {
                if (target.substring(0, startString[i].length) == startString[i])
                    return true;
            }
        }
        return false;
    };

    tools.base64EncodeUri = function(str) {
    	return window.btoa(unescape(encodeURIComponent(str)));
    }

    return tools;
});
