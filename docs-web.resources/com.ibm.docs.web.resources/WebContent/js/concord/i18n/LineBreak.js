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

/**
 * provide utility for line breaking algorithm according to UAX #14, Unicode Standard 6.3
 *@author: gaowwei@cn.ibm.com
 */

dojo.provide("concord.i18n.LineBreak");
dojo.require("concord.i18n.LineBreakClassMap");

concord.i18n.LineBreak = new function()
{
	this.CLASS_MAP = concord.i18n.LineBreakClassMap;
	
	/**
	 * returns the line breaking classes of code point "cp"
	 */
	this._getClass = function(cp)
	{
		for (var clazz in this.CLASS_MAP)
		{
			if (this._isClass(clazz, cp)) return this.CLASS_MAP[clazz];
		}
		return this.CLASS_MAP.XX;
	};
	
	/**
	 * test if code point "cp" belongs to class "clazz"
	 */
	this._isClass = function(clazz, cp)
	{
		var range = this.CLASS_MAP[clazz].range;
		// range array are composed of list of code point pairs, in ascending order
		// where binary search can be leveraged to accelerate the test
		var len = range.length;
		if (cp < range[0] || cp > range[len-1]) return false;
		
		var low = 0;
		var high = len/2;
		
		while (low <= high)
		{
//			var middle = Math.floor((low + high)/2);
			if((low + high)%2 == 0)
				middle = (low + high)/2;
			else
				middle = (low + high - 1)/2;
			
			if (cp >= range[middle*2])
			{
				if (cp <= range[middle*2+1])
				{
					return true;
				}
				else {
					low = middle + 1;
				}
			}
			else {
				high = middle -1;
			}
		}
		
		return false;
	};
	
	/**
	 * it is important we need to support unicode characters outside of the BMP.
	 * Since javascript string is basicly composed of 16 bit code unit.
	 * for non-UCS-2 characters, need to split to surrogate pairs.
	 * below method take the parameter "pos" still as a index to code unit, not characters.
	 * but in order not to split surrogate pairs or hold invalid surrogate sequences,
	 * the method may justify the value of "pos", and return the real unicode character's code point.
	 */
	this._ucCodePointAt = function(str, pos)
	{
		var cp = str.charCodeAt(pos);
		// we tolerate some illegal cases here, e.g, illegal surrogate pairs
		if (cp < 0xD800 || cp > 0xDFFF)
		{
			return {cp:cp, i:pos};
		}
		else if (cp <= 0xDBFF)
		{	// lead surrogate
			if ((pos+1) >= str.length)
			{
				return {cp:cp, i:pos};
			}
			var cp2 = str.charCodeAt(pos+1);
			var uc = ((cp - 0xD800) * 0x400) + (cp2 - 0xDC00) + 0x10000;
			return {cp:uc, i:pos};
		}
		else// if (0xDC00 <= cp)
		{	// tail surrogate
			if ((pos-1) < 0)
			{
				return {cp:cp, i:pos};
			}
			var cp0 = str.charCodeAt(pos-1);
			var uc = ((cp0 - 0xD800) * 0x400) + (cp - 0xDC00) + 0x10000;
			return {cp:uc, i:pos-1};
		}
	};
	
	/**
	 * find the first line break opportunity starting from position "idx", 
	 * backward till beginning of the string, if not found
	 * returns: position of the break opportunity
	 */
	this.findLineBreak = function(str, idx)
	{
		var pos = idx;
		var a = null;
		var aClass = null;
		while (pos > 0) {
			// context: B SP* A
			if (a == null)
			{
				var v = this._ucCodePointAt(str, pos);
				a = v.cp;
				pos = v.i;
			}
			while (a == 0x0020)
			{
				pos--;
				if (pos == 0) return 0;
				var v = this._ucCodePointAt(str, pos);
				a = v.cp;
				pos = v.i;
			}
			
			var posB = pos-1;
			// var b = str.charCodeAt(posB);
			var v = this._ucCodePointAt(str, posB);
			var b = v.cp;
			posB = v.i;
			while (b == 0x0020 && pos > 0)
			{
				posB--;
				var v = this._ucCodePointAt(str, posB);
				b = v.cp;
				posB = v.i;
			}
			
			/****************************************************************/
			// need to be resolved outside of the pair table
			// AI, BK, CB, CJ, CR, LF, NL, SA, SG, SP, XX
			
			// BK, CR, LF, NL should be handled before calling this function
			// assert(class for a and b is not equal to BK, CR, LF NL);
			
			// resolve AI, CJ, SG, XX, and SA according to rule LB1
			if (aClass == null)
			{
				aClass = this._resolveLB1(this._getClass(a));
			}
			var bClass = this._resolveLB1(this._getClass(b));			
			
			// LB9: Do not break a combining character sequence; treat it as if ht has the line breaking class of the base character in all of the following rules.
			// Treat X CM* as if it were X
			// where X is any line break class except BK, CR, LF, NL, SP, or ZW.
			while (bClass.name == "CM" && posB > 0)
			{
				posB--;
				// if (posB < 0) return 0;
				var v = this._ucCodePointAt(str, posB);
				b = v.cp;
				posB = v.i;
				bClass = this._resolveLB1(this._getClass(b));
				
				// LB10: Treat any remaining combining mark as AL
				if (bClass.name == "ZW" || bClass.name == "SP")
				{
					posB++;
					var v = this._ucCodePointAt(str, posB);
					b = v.cp;
					posB = v.i;
					bClass = this.CLASS_MAP.AL;
				}
			}
			/****************************************************************/
			
			// lookup pair table information
			if (bClass.idx >= this.PAIR_TABLE.length || aClass.idx >= this.PAIR_TABLE.length)
			{
				return pos;
			}
			var brk = this.PAIR_TABLE[bClass.idx][aClass.idx];
			
			if ((bClass.idx >= this.PAIR_TABLE.length) || (aClass.idx >= this.PAIR_TABLE[0].length))
			{
				// "error";
			}
			
			if (brk == 0)
			{	// prohibited break, B SP* x A
				// never break before A and after B even if one or more spaces intervene
			}
			else if (brk == 1)
			{	// indrect break opportunity, B SP+ + A
				// do not break before A, unless one or more spaces follow B
				if (str.charCodeAt(pos-1) == 0x0020)
					return pos;
			}
			else if (brk == 4)
			{	// direct break opportunity, B + A
				return pos;
			}
			else if (brk == 2)
			{	// prohibited break for combining marks, B SP* A, where A is of class CM
				// TODO: here we simplify LB9 and LB10
			}
			else if (brk == 3)
			{	// indirect break opportunity for combining marks following a space, B x A and B SP+ + A
				if (str.charCodeAt(pos-1) == 0x0020)
					return pos;
			}
			
			pos = posB;
			a = b;
			aClass = bClass;
		}
		
		return pos;
	};
	
	/**
	 * identify all the line break opportunity in the string "str"
	 * return: a boolean array, where each position of the character in "str", true means a direct break opportunity
	 */
	this.findAll = function(str)
	{
		var brks = new Array(str.length);
		brks[0] = false; // !sot
		var posa = posb = str.length-1;
		while (posa > 0)
		{
			posb = this.findLineBreak(str, posa);
			
			if (posb < posa)
			{
				for (var i = posb + 1; i <= posa; i++)
				{
					brks[i] = false;
				}
			}
			if (posb != 0)
			{
				brks[posb] = true; 				
			}
			posa = posb - 1;
		}
		return brks;
	};

	this._resolveLB1 = function(c)
	{
		// LB1: Assign a line breaking class to each code point of the input.
		// 		Resolve AI, CB, CJ, SA, SG, and XX into other line breaking classes depending on criteria outside the scope of this algorithm.
		//		In the absence of such criteria all characters with a specific combination of original class and General_Category property value are resolved as follows:
		//		Resolved	Original	General_Category
		//		AL			AI, SG, XX	Any
		//		CM			SA			Only Mn or Mc
		//		AL			SA			Any except Mn and Mc
		//		NS			CJ			Any
		// TODO: treat all SA as AL
		// TODO: replace CB as AL (we don't support object replacement character)
		if (c.name == "AI" || c.name == "SG" || c.name == "XX" || c.name == "SA")
			return this.CLASS_MAP["AL"];
			
		if (c.name == "CJ")
			return this.CLASS_MAP["NS"];
		return c;
	};
	
	/**
	 * this pair table is exactly the same as UAX #14, 7.3, without tailoring
	 * 0/^: prohibited break
	 * 1/%: indrect break opportunity
	 * 2/@: prohibited break for combining marks
	 * 3/#: indirect break opportunity for combining marks following a space
	 * 4/_: directory break opportunity
	 */
	this.PAIR_TABLE = [
		/******** OP CL CP QU GL NS EX SY IS PR PO NU AL HL ID IN HY BA BB B2 ZW CM WJ H2 H3 JL JV JT RI CB SP ********/
		/* OP */ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		/* CL */ [ 4, 0, 0, 1, 1, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* CP */ [ 4, 0, 0, 1, 1, 0, 0, 0, 0, 4, 4, 1, 1, 1, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* QU */ [ 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0, 1, 1, 1, 1, 1, 1, 1, 0],
		/* GL */ [ 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0, 1, 1, 1, 1, 1, 1, 1, 0],
		/* NS */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* EX */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* SY */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* IS */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 1, 1, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* PR */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 1, 1, 1, 1, 4, 1, 1, 4, 4, 0, 3, 0, 1, 1, 1, 1, 1, 4, 4, 0],
		/* PO */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 1, 1, 1, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* NU */ [ 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* AL */ [ 1, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 1, 1, 1, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* HL */ [ 1, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 1, 1, 1, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* ID */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 1, 4, 4, 4, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* IN */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* HY */ [ 4, 0, 0, 1, 4, 1, 0, 0, 0, 4, 4, 1, 4, 4, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* BA */ [ 4, 0, 0, 1, 4, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* BB */ [ 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0, 1, 1, 1, 1, 1, 1, 4, 0],
		/* B2 */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 0, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* ZW */ [ 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
		/* CM */ [ 1, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 1, 1, 1, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* WJ */ [ 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0, 1, 1, 1, 1, 1, 1, 1, 0],
		/* H2 */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 1, 4, 4, 4, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 1, 1, 4, 4, 0],
		/* H3 */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 1, 4, 4, 4, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 1, 4, 4, 0],
		/* JL */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 1, 4, 4, 4, 4, 1, 1, 1, 4, 4, 0, 3, 0, 1, 1, 1, 1, 4, 4, 4, 0],
		/* JV */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 1, 4, 4, 4, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 1, 1, 4, 4, 0],
		/* JT */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 1, 4, 4, 4, 4, 1, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 1, 4, 4, 0],
		/* RI */ [ 4, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 1, 4, 0],
		/* CB */ [ 4, 0, 0, 1, 1, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 3, 0, 4, 4, 4, 4, 4, 4, 4, 0],
		/* SP */ [ 4, 0, 0, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0]
	];
}();


/**
 *  reference code to process string with surrogate pairs (strings containing unicode characters outside of the BMP)
 */
/*
if (!String.prototype.ucLength) {
    String.prototype.ucLength = function() {
        return this.length - this.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g).length + 1;
    };
}

if (!String.prototype.codePointAt) {
    String.prototype.codePointAt = function (ucPos) {
        if (isNaN(ucPos)){
            ucPos = 0;
        }
        var str = String(this);
        var codePoint = null;
        var pairFound = false;
        var ucIndex = -1;
        var i = 0;  
        while (i < str.length){
            ucIndex += 1;
            var code = str.charCodeAt(i);
            var next = str.charCodeAt(i + 1);
            pairFound = (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF);
            if (ucIndex == ucPos){
                codePoint = pairFound ? ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000 : code;
                break;
            } else{
                i += pairFound ? 2 : 1;
            }
        }
        return codePoint;
    };
}

if (!String.fromCodePoint) {
    String.fromCodePoint = function () {
        var strChars = [], codePoint, offset, codeValues, i;
        for (i = 0; i < arguments.length; ++i) {
            codePoint = arguments[i];
            offset = codePoint - 0x10000;
            if (codePoint > 0xFFFF){
                codeValues = [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)];
            } else{
                codeValues = [codePoint];
            }
            strChars.push(String.fromCharCode.apply(null, codeValues));
        }
        return strChars.join("");
    };
}

if (!String.prototype.ucCharAt) {
    String.prototype.ucCharAt = function (ucIndex) {
        var str = String(this);
        var codePoint = str.codePointAt(ucIndex);
        var ucChar = String.fromCodePoint(codePoint);
        return ucChar;
    };
}

if (!String.prototype.ucIndexOf) {
    String.prototype.ucIndexOf = function (searchStr, ucStart) {
        if (isNaN(ucStart)){
            ucStart = 0;
        }
        if (ucStart < 0){
            ucStart = 0;
        }
        var str = String(this);
        var strUCLength = str.ucLength();
        searchStr = String(searchStr);
        var ucSearchLength = searchStr.ucLength();
        var i = ucStart;
        while (i < strUCLength){
            var ucSlice = str.ucSlice(i,i+ucSearchLength);
            if (ucSlice == searchStr){
                return i;
            }
            i++;
        }
        return -1;
    };
}

if (!String.prototype.ucLastIndexOf) {
    String.prototype.ucLastIndexOf = function (searchStr, ucStart) {
        var str = String(this);
        var strUCLength = str.ucLength();
        if (isNaN(ucStart)){
            ucStart = strUCLength - 1;
        }
        if (ucStart >= strUCLength){
            ucStart = strUCLength - 1;
        }
        searchStr = String(searchStr);
        var ucSearchLength = searchStr.ucLength();
        var i = ucStart;
        while (i >= 0){
            var ucSlice = str.ucSlice(i,i+ucSearchLength);
            if (ucSlice == searchStr){
                return i;
            }
            i--;
        }
        return -1;
    };
}

if (!String.prototype.ucSlice) {
    String.prototype.ucSlice = function (ucStart, ucStop) {
        var str = String(this);
        var strUCLength = str.ucLength();
        if (isNaN(ucStart)){
            ucStart = 0;
        }
        if (ucStart < 0){
            ucStart = strUCLength + ucStart;
            if (ucStart < 0){ ucStart = 0;}
        }
        if (typeof(ucStop) == 'undefined'){
            ucStop = strUCLength - 1;
        }
        if (ucStop < 0){
            ucStop = strUCLength + ucStop;
            if (ucStop < 0){ ucStop = 0;}
        }
        var ucChars = [];
        var i = ucStart;
        while (i < ucStop){
            ucChars.push(str.ucCharAt(i));
            i++;
        }
        return ucChars.join("");
    };
}

if (!String.prototype.ucSplit) {
    String.prototype.ucSplit = function (delimeter, limit) {
        var str = String(this);
        var strUCLength = str.ucLength();
        var ucChars = [];
        if (delimeter == ''){
            for (var i = 0; i < strUCLength; i++){
                ucChars.push(str.ucCharAt(i));
            }
            ucChars = ucChars.slice(0, 0 + limit);
        } else{
            ucChars = str.split(delimeter, limit);
        }
        return ucChars;
    };
}
*/

