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

dojo.require("concord.i18n.TextBreakData");
dojo.provide("concord.i18n.WordBreakIterator");


dojo.declare("concord.i18n.WordBreakIterator", null, {
	
	_wordbreakdata : null,
	_str           : null,
	_class         : null,  // the classification of the _str, if SURROGATE_LO then use previous one
	
	// no para is checked
	constructor: function(str) {
		this._wordbreakdata = concord.i18n.TextBreakData.getInstance().getWordBoundaryData();
		this._str = str;
		this._class = [];
	},
	
	//
	// @input string index
	// @return: character classification,
	//          For surrogate char,
	// 				high surrogate, 0x1000+type;
	//              low surrogate,  -1 
	//
	_getCharClassification : function(index) {
		if (index < 0 || index >= this._str.length) return 0xf00;
		var _cl = this._class[index];

		if (typeof _cl === 'undefined'){
			_cl = this._wordbreakdata.getWBClassification(this._str, index);
			if (_cl >= 0x2000 && index > 0) { // low surrogate, combine with previous one
				_cl = _cl - 0x1000;
				this._class[index] = -1;
				this._class[index-1] = _cl;
				_cl = -1;
			} else if (_cl >= 0x1000 /*&& index < this_str.length*/) { // hi surrogate, combine with next one
				this._class[index] = _cl;
				this._class[index+1] = -1;
			} else {
				this._class[index] = _cl; 
			}
		}

		return _cl;
	},
	
	// get current char classification by ignoring tail extend and format code
	// pos = {index, start, class}
	_getCharClassificationEx : function (pos) {
		var index = pos.index;
		var thecla = this._getCharClassification(index);
		if (thecla > 0x1000) thecla -= 0x1000;
		while ((thecla === -1 || thecla === this._wordbreakdata.EXTEND || thecla === this._wordbreakdata.FORMAT) && index > 0) {
			thecla = this._getCharClassification(--index);
			if (thecla > 0x1000) thecla -= 0x1000;
		}

		pos.cla = thecla;
		pos.start = index;
		return thecla;
	},

	// get next char classification by ignoring tail extend and format code
	// pos = {index, start, class}, index is input
	_getNextCharClassificationEx : function (pos) {
		var index = pos.index+1;
		var thecla = this._getCharClassification(index);
		if (thecla > 0x1000) thecla -= 0x1000;
		while ((thecla === -1 || thecla === this._wordbreakdata.EXTEND || thecla === this._wordbreakdata.FORMAT) && index < this._str.length) {
			thecla = this._getCharClassification(++index);
			if (thecla > 0x1000) thecla -= 0x1000;
		}

		pos.cla = thecla;
		pos.start = index;
		return thecla;
	},

	// check if it is a boundary between this and next char
	_isBoundary : function(index) {
		var strlen = this._str.length,
	    clz = this._getCharClassification(index),
	    nextclz = this._getCharClassification(index+1),
	    prevclz = this._getCharClassification(index-1),
	    cla, prevcla, nextcla, nextnextcla;
	
		if (strlen === 0 || index < 0 || index > strlen - 1)
			return false;
		
		// WB1, WB2, Break at the start and end of text
		if (/*index == 0 ||*/ index == strlen -1)
			return true;

		// WB3 - CR X LF, Do not break within CRLF
		if (clz === this._wordbreakdata.CR && nextclz === this._wordbreakdata.LF)
			return false;
		// WB3a, break before newline
		if (nextclz === this._wordbreakdata.CR || nextclz === this._wordbreakdata.LF || nextclz === this._wordbreakdata.NEWLINE)
			return true;
		// WB3b, break after newline
		if (prevclz === this._wordbreakdata.CR || prevclz === this._wordbreakdata.LF || prevclz === this._wordbreakdata.NEWLINE)
			return true;
		
		// DONT break between surrogates or if next is EXTEND/FORMAT!
		if (nextclz > 0x1000) nextclz -= 0x1000;
		if (clz >= 0x1000) { // first surrogate
			return false;
		} else if (nextclz === this._wordbreakdata.EXTEND || nextclz === this._wordbreakdata.FORMAT) {
			return false;
		}
		
		var pos = {index:index},
		cla = this._getCharClassificationEx(pos);

		// WB4 - ignore Format and Extend characters, except when they appear at the beginning
		//       of a region of Text.   The rule here comes into play when the start of text
		//       begins with a group of Format chars, or with a "word" consisting of a single
		//       char that is not in any of the listed word break categories followed by
		//       format char(s), or is not a CJK dictionary character.
		
		// Workaround,
		if (clz === -1) clz = prevclz;
		if ((clz === this._wordbreakdata.EXTEND || clz === this._wordbreakdata.FORMAT) && 
		      (nextclz !== this._wordbreakdata.EXTEND || nextclz !== this._wordbreakdata.FORMAT) &&
		      (cla === this._wordbreakdata.EXTEND || cla === this._wordbreakdata.FORMAT)) {
			return true;
		}

		prevcla = this._getCharClassificationEx({index: pos.start - 1});
		nextcla = this._getNextCharClassificationEx(pos);  // var pos now points to next char start	
		/*if (cla === this._wordbreakdata.EXTEND || cla === this._wordbreakdata.FORMAT ||
				prevcla === this._wordbreakdata.EXTEND || prevcla === this._wordbreakdata.FORMAT ||
				nextcla === this._wordbreakdata.EXTEND || nextcla === this._wordbreakdata.FORMAT)
			return false;*/

		// WB5, Do not break between most letters
		if ((cla === this._wordbreakdata.ALETTER || cla === this._wordbreakdata.HEBREW) && 
				(nextcla === this._wordbreakdata.ALETTER || nextcla === this._wordbreakdata.HEBREW))
			return false;
		
		nextnextcla = this._getNextCharClassificationEx({index:pos.start});
		// WB6, Do not break letters across certain punctuation
		if ((cla === this._wordbreakdata.ALETTER || cla === this._wordbreakdata.HEBREW) && 
				(nextcla === this._wordbreakdata.MIDLETTER || nextcla === this._wordbreakdata.MIDNUMLET || nextcla === this._wordbreakdata.SQUOTE) &&
				(nextnextcla === this._wordbreakdata.ALETTER || nextnextcla === this._wordbreakdata.HEBREW))
			return false;
		
		// WB7, Do not break letters across certain punctuation
		if ((prevcla === this._wordbreakdata.ALETTER || prevcla === this._wordbreakdata.HEBREW) && 
				(cla === this._wordbreakdata.MIDLETTER || cla === this._wordbreakdata.MIDNUMLET || cla === this._wordbreakdata.SQUOTE) &&
				(nextcla === this._wordbreakdata.ALETTER || nextcla === this._wordbreakdata.HEBREW))
			return false;
		// WB7A,
		if (cla === this._wordbreakdata.HEBREW && nextcla === this._wordbreakdata.SQUOTE)
			return false;
		// WB7B,
		if (cla === this._wordbreakdata.HEBREW && nextcla === this._wordbreakdata.DQUOTE && nextnextcla === this._wordbreakdata.HEBREW)
			return false;
		// WB7C,
		if (prevcla === this._wordbreakdata.HEBREW && cla === this._wordbreakdata.DQUOTE && nextcla === this._wordbreakdata.HEBREW)
			return false;
		
		// WB8, Do not break within sequences of digits, or digits adjacent to letters
		if (cla === this._wordbreakdata.NUMERIC && nextcla === this._wordbreakdata.NUMERIC)
			return false;
		// WB9, (ALetter | Hebrew_Letter) x Numeric
		if ((cla === this._wordbreakdata.ALETTER || cla === this._wordbreakdata.HEBREW) && nextcla === this._wordbreakdata.NUMERIC)
			return false;
		// WB10, Numeric x (ALetter | Hebrew_Letter)
		if ( cla === this._wordbreakdata.NUMERIC && (nextcla === this._wordbreakdata.ALETTER || nextcla === this._wordbreakdata.HEBREW))
			return false;
		
		// WB11, Do not break within sequences, such as "3.2" or "3,456.789"
		if (prevcla === this._wordbreakdata.NUMERIC && 
				(cla === this._wordbreakdata.MIDNUM || cla === this._wordbreakdata.MIDNUMLET || cla === this._wordbreakdata.SQUOTE) && 
			nextcla === this._wordbreakdata.NUMERIC)
			return false;
		// WB12
		if (cla === this._wordbreakdata.NUMERIC && 
				(nextcla === this._wordbreakdata.MIDNUM || nextcla === this._wordbreakdata.MIDNUMLET || nextcla === this._wordbreakdata.SQUOTE) && 
			nextnextcla === this._wordbreakdata.NUMERIC)
			return false;
		
		// WB13, KATA X KATA
		if (cla === this._wordbreakdata.KATAKANA && nextcla === this._wordbreakdata.KATAKANA)
			return false;
		// WB13a,
		if ((cla === this._wordbreakdata.ALETTER || cla === this._wordbreakdata.HEBREW || cla === this._wordbreakdata.NUMERIC ||
				cla === this._wordbreakdata.KATAKANA || cla === this._wordbreakdata.EXTNUMLET) && 
				nextcla === this._wordbreakdata.EXTNUMLET)
			return false;
		// WB13b,
		if (cla === this._wordbreakdata.EXTNUMLET && 
				(nextcla === this._wordbreakdata.ALETTER || nextcla === this._wordbreakdata.HEBREW || 
				 nextcla === this._wordbreakdata.NUMERIC || nextcla === this._wordbreakdata.KATAKANA))
			return false;
		// Wb13c,
		if (cla === this._wordbreakdata.REGION_IND && nextcla === this._wordbreakdata.REGION_IND)
			return false;
		
		// custom rule, don't break among puctuations
		if (this._isPunct(index) && this._isPunct(index+1))
		  return false;

		// break at any other cases, such as between CJK...
		return true;
	},
	
	_isWhiteSpace : function(index) {
		if (index >= this._str.length) return false;
		
		return this._wordbreakdata.regex_ws.test(this._str.charAt(index));
	},

	_isPunct : function(index) {
		if (index >= this._str.length) return false;
		
		return this._wordbreakdata.regex_punct.test(this._str.charAt(index));
	},

	// get next boundary pos to the input index by skipping white spaces
	nextBoundary : function(index, notskipspace) {
		if (index < 0)
			return 0;
		if (this._str.length == 0 || index >= this._str.length)
			return -1;
		while (index < this._str.length && !this._isBoundary(index)) {index++;}
		
		index += 1;
		if (!notskipspace) {
			// skip following white space block
			if (this._str.charCodeAt(index)==32) {
				index += 1;
				while (index < this._str.length && this._str.charCodeAt(index)==32) {index++;}
			}
		}

		return index;
	},
	
	// get previous boundary pos to the input index 
	prevBoundary : function(index, notskipspace) {
		if (index <= 0 || this._str.length == 0)
			return -1;

		if (index > this._str.length)
			return this._str.length;
		else if (index == 1)
			return 0;
		
		index -= 1;
		// skip space, got previous one
		if (!notskipspace && index > 0 && this._str.charCodeAt(index)==32) {
			index -= 1;
			while (index > 0 && this._str.charCodeAt(index)==32) {index--;}
		}
		
		// go to the word header
		while (index > 0 && !this._isBoundary(index-1)) {index -= 1;}
		
		return index;
	},

	// get current word boundary which includes index
	// return: range
	curWordBoundary : function(index, notskipspace) {
		var range = {start:index, end:index};
		var nextb = this.nextBoundary(index, notskipspace),
		    prevb = this.prevBoundary(index, notskipspace);
		    
		if (index == 0) { // special case, when at header, get next range
			range.end = this.nextBoundary(index, notskipspace);
		} else {
			if (this._isBoundary(index-1)) {
				range.end = index;
				range.start = prevb;
				if (!notskipspace && this._isWhiteSpace(index))
					range.end = this.nextBoundary(index, notskipspace);
			} else {
				range.end = nextb;
				range.start = prevb;
			}
		}
		
		if (range.start < 0 || range.end < 0) {
			range.start = index;
			range.end = index;
		}
		
		return range;
	}
});

/* test code below!
var teststrsx = [
"can't",
"can\u2019t",
"ab\u00ADby",
"a$-34,567.14%b",
"3a",
"\u2060c\u2060a\u2060n\u2060t\u2060'\u2060t\u2060\u2060",
"\u2060c\u2060a\u2060n\u2060t\u2060\u2019\u2060t\u2060\u2060",
"\u2060a\u2060b\u2060\u00AD\u2060b\u2060y\u2060\u2060",
"\u2060a\u2060$\u2060-\u20603\u20604\u2060,\u20605\u20606\u20607\u2060.\u20601\u20604\u2060%\u2060b\u2060\u2060",
"\u20603\u2060a\u2060\u2060",
"a\ud83c\udde6b",
"\ud83c\uddf7\ud83c\uddfA",
"\ud83c\uddf7\ud83c\uddfA\ud83c\uddf8",
"\ud83c\uddf7\ud83c\uddfA\ud83c\uddf8\udb3c\uddEA",
"\ud83c\uddf7\ud83c\uddfA\u200b\ud83c\uddf8\ud83c\uddEA",
"\ud83c\udde6\ud83c\udde7\ud83c\udde8",
"\ud83c\udde6\u200d\ud83c\udde7\ud83c\udde8",
"\ud83c\udde6\ud83c\udde7\u200d\ud83c\udde8",
" \u200d\u0646",
"\u0646\u200d "
];

var teststrs = [
"\u2060a\u2060$\u2060-\u20603\u20604\u2060,\u20605\u20606\u20607\u2060.\u20601\u20604\u2060%\u2060b\u2060\u2060"
];

var num = 0;

teststrs.forEach(function(teststr) {
	console.log("--"+(num++) + ": string to test: " + teststr + " " + teststr.length);
	var result_all = "";
	WordBreakIterator.constructor(teststr);
	var next_b = 0;
	var cur_range = WordBreakIterator.curWordBoundary(next_b);
	console.log("Cur start:"+ cur_range.start + " end:" + cur_range.end);
	
	while (next_b <= teststr.length && next_b >= 0) {
		next_b = WordBreakIterator.prevBoundary(next_b);
		result_all = result_all + " " + next_b;
	}
	console.log("result "+ result_all);
});
*/