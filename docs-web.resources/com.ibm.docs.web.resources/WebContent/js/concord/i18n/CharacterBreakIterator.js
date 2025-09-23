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

dojo.provide("concord.i18n.CharacterBreakIterator");


dojo.declare("concord.i18n.CharacterBreakIterator", null, {
	_charbreakdata : null,
	_str           : null,
	_class         : null,  // the classification of the _str, if SURROGATE_LO then use previous one
	
	// no para is checked
	constructor: function(str) {
		this._charbreakdata = concord.i18n.TextBreakData.getInstance().getCharacterBoundaryData();
		this._str = str;
		this._class = [];
	},
	
	_getCharClassification : function(index) {
		if (index < 0 || index >= this._str.length) return 0xf00;
		var _cl = this._class[index];

		if (typeof _cl === 'undefined'){
			_cl = this._charbreakdata.getGCClassification(this._str, index);
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
	
	_getCharClassificationEx : function(index) {
		var cl = this._getCharClassification(index);
		if (cl === -1)
			cl = this._getCharClassification(index-1);
		if (cl > 0x1000)
			cl = cl - 0x1000;
		return cl;
	},
	
	_isBoundary : function(index) {
		var strlen = this._str.length;
		if (strlen === 0 || index < 0 || index > strlen - 1)
			return false;
		
		// GB1, GB2, Break at the start and end of text
		if (/*index == 0 ||*/ index == strlen -1)
			return true;
		
		var cl = this._getCharClassification(index), pos = index;
		if (cl >= 0x1000) return false; // don't break between hi and lo surrogate
		else if (cl === -1) {
			cl = this._getCharClassification(index-1); // get type on hi surrogate
			cl = cl - 0x1000;
			pos = index - 1;
		}
		
		var nextcl = this._getCharClassification(index+1);
		if (nextcl > 0x1000) nextcl -= 0x1000;
		
		// GB3, don't break between CR and LF
		if (cl === this._charbreakdata.CR && nextcl === this._charbreakdata.LF)
			return false;
		
		var prevcl = this._getCharClassificationEx(pos-1);

		// GB4, break after cr, lf, control
		if (cl === this._charbreakdata.CR || cl === this._charbreakdata.LF || cl === this._charbreakdata.CONTROL)
			return true;
		
		// GB5, break before cr, lf, control
		if (nextcl === this._charbreakdata.CR || nextcl === this._charbreakdata.LF || nextcl === this._charbreakdata.CONTROL)
			return true;
		
		// GB6,7,8, Do not break Hangul syllable sequences
		if (cl === this._charbreakdata.L && (nextcl === this._charbreakdata.L || nextcl === this._charbreakdata.V || nextcl === this._charbreakdata.LV || nextcl === this._charbreakdata.LVT))
			return false;
		if ((cl === this._charbreakdata.V || cl === this._charbreakdata.LV) && (nextcl === this._charbreakdata.V || nextcl === this._charbreakdata.T))
			return false;
		if ((cl === this._charbreakdata.LVT || cl === this._charbreakdata.T) && nextcl === this._charbreakdata.T)
			return false;
		
		//GB8a, don't break between region indicators
		if (cl === this._charbreakdata.REG_IND && nextcl === this._charbreakdata.REG_IND)
			return false;
		
		//GB9, Do not break before extending characters
		if (nextcl === this._charbreakdata.EXTEND)
			return false;
		
		//GB9a, don't break before spacing marks
		if (nextcl === this._charbreakdata.SPACINGMARK)
			return false;

		//GB9b, after Prepend characters
		//if (prevcl === this._charbreakdata.SPACINGMARK)
		//	return false;
 
		//GB10, break any where
		return true;
	},

	nextBoundary : function(index) {
		if (index < 0) return 0;
		
		if (this._str.length === 0 || index >= this._str.length)
			return -1;
		
		var changed = false;
		while (index < this._str.length && !this._isBoundary(index)) {
			index++;
			changed = true;
		}
		
		if(!changed)
			index += 1;
		
		return index;
	},
	
	prevBoundary : function(index) {
		if (index <= 0 || this._str.length === 0)
			return -1;

		if (index > this._str.length)
			return this._str.length;
		else if (index == 1)
			return 0;
		
		var changed = false;
		// go to the previous boundary
		while (index > 0 && !this._isBoundary(index)) {
			index -= 1;
			changed = true;
		}
		
		if(!changed)
			index -= 1;
		
		return index;
	},
	
	/*
	 * Is this index pos a character boundary?
	 * @param, index
	 */
	isBoundary: function(index) {
		if (index === 0 || index === this._str.length)
			return true;
		else if (index < 0 || index > this._str.length)
			return false;
		
		return this._isBoundary(index-1);
	}
});

/*
var teststrs = [
  	"a\ud83c\uDDE6b",
		"\ud83c\uDDF7\ud83c\uDDFA",
		"\ud83c\uDDF7\ud83c\uDDFA\ud83c\uDDF8",
		"\ud83c\uDDF7\ud83c\uDDFA\ud83c\uDDF8\ud83c\uDDEA",
		"\ud83c\uDDF7\ud83c\uDDFA\u200b\ud83c\uDDF8\ud83c\uDDEA",
		"\ud83c\uDDE6\ud83c\uDDE7\ud83c\uDDE8",
		"\ud83c\uDDE6\u200d\ud83c\uDDE7\ud83c\uDDE8",
		"\ud83c\uDDE6\ud83c\uDDE7\u200d\ud83c\uDDE8",
		"\u0020\u200d\u0646",
		"\u0646\u200d\u0020"
];

var num = 0;

teststrs.forEach(function(teststr) {
	console.log("--"+(num++) + ": string to test: " + teststr + " " + teststr.length);
	var result_all = "";
	CharacterBreakIterator.constructor(teststr);
	var next_b = teststr.length;
//	var cur_range = CharacterBreakIterator.curWordBoundary(next_b);
//	console.log("Cur start:"+ cur_range.start + " end:" + cur_range.end);
	
	while (next_b <= teststr.length && next_b >= 0) {
		next_b = CharacterBreakIterator.prevBoundary(next_b);
		result_all = result_all + " " + next_b;
	}
	console.log("result "+ result_all);
});
*/