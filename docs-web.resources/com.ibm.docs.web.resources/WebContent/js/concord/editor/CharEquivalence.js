/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.editor.CharEquivalence");

dojo.declare("concord.editor.CharEquivalence", null, {
	//Japanese composite characters
	char_composite_ja : {
			'\u304C': '\u304B\u3099',
			'\u304E': '\u304D\u3099',
			'\u3050': '\u304F\u3099',
			'\u3052': '\u3051\u3099',
			'\u3054': '\u3053\u3099',
			'\u3056': '\u3055\u3099',
			'\u3058': '\u3057\u3099',
			'\u305A': '\u3059\u3099',
			'\u305C': '\u305B\u3099',
			'\u305E': '\u305D\u3099',
			'\u3060': '\u305F\u3099',
			'\u3062': '\u3061\u3099',
			'\u3065': '\u3064\u3099',
			'\u3067': '\u3066\u3099',
			'\u3069': '\u3068\u3099',
			'\u3070': '\u307F\u3099',
			'\u3071': '\u306F\u309A',
			'\u3073': '\u3072\u3099',
			'\u3074': '\u3072\u309A',
			'\u3076': '\u3075\u3099',
			'\u3077': '\u3075\u3099',
			'\u3079': '\u3078\u3099',
			'\u307A': '\u3078\u309A',
			'\u307C': '\u307B\u3099',
			'\u307D': '\u307B\u309A',
			'\u3094': '\u3046\u3099',
			'\u309B': '\u0020\u3099', //???
			'\u309C': '\u0020\u309A', //???
			'\u309E': '\u309D\u3099',
			'\u309F': '\u3088\u308A', //???
			'\u30AC': '\u30AB\u3099',
			'\u30AE': '\u30AD\u3099',
			'\u30B0': '\u30AF\u3099',
			'\u30B2': '\u30B1\u3099',
			'\u30B4': '\u30B3\u3099',
			'\u30B6': '\u30B5\u3099',
			'\u30B8': '\u30B7\u3099',
			'\u30BA': '\u30B9\u3099',
			'\u30BC': '\u30BB\u3099',
			'\u30BE': '\u30BD\u3099',
			'\u30C0': '\u30BF\u3099',
			'\u30C2': '\u30C1\u3099',
			'\u30C5': '\u30C4\u3099',
			'\u30C7': '\u30C6\u3099',
			'\u30C9': '\u30C8\u3099',
			'\u30D0': '\u30CF\u3099',
			'\u30D1': '\u30CF\u309A',
			'\u30D3': '\u30D2\u3099',
			'\u30D4': '\u30D2\u309A',
			'\u30D6': '\u30D5\u3099',
			'\u30D7': '\u30D5\u309A',
			'\u30D9': '\u30D8\u3099',
			'\u30DA': '\u30D8\u309A',
			'\u30DC': '\u30DB\u3099',
			'\u30DD': '\u30DB\u309A',
			'\u30F4': '\u30A6\u3099',
			'\u30F7': '\u30EF\u3099',
			'\u30F8': '\u30F0\u3099',
			'\u30F9': '\u30F1\u3099',
			'\u30FA': '\u30F2\u3099',
			'\u30FE': '\u30FD\u3099',
			'\u30FF': '\u30B3\u30C8', //???
			'\uE055': '\u304B\u309A',
			'\uE056': '\u304D\u309A',
			'\uE057': '\u304F\u309A',
			'\uE058': '\u3051\u309A',
			'\uE059': '\u3053\u309A',
			'\uE205': '\u30AB\u309A',
			'\uE206': '\u30AD\u309A',
			'\uE207': '\u30AF\u309A',
			'\uE208': '\u30B1\u309A',
			'\uE209': '\u30B3\u309A',
			'\uE20D': '\u30BB\u309A',
			'\uE211': '\u30C4\u309A',
			'\uE213': '\u30C8\u309A',
			'\uE298': '\u31F7\u309A'
	},
		
	char_canonical_eq : {
		// Latin - 1
		'\u00C0': '\u0041\u0300',
		'\u00C1': '\u0041\u0301',
		'\u00C2': '\u0041\u0302',
		'\u00C3': '\u0041\u0303',
		'\u00C4': '\u0041\u0308',
		'\u00C7': '\u0043\u0327',
		'\u00C8': '\u0045\u0300',
		'\u00C9': '\u0045\u0301',
		'\u00CA': '\u0045\u0302',
		'\u00CB': '\u0045\u0308',
		'\u00CC': '\u0049\u0300',
		'\u00CD': '\u0049\u0301',
		'\u00CE': '\u0049\u0302',
		'\u00CF': '\u0049\u0308',
		'\u00D1': '\u004E\u0303',
		'\u00D2': '\u004F\u0300',
		'\u00D3': '\u004F\u0301',
		'\u00D4': '\u004F\u0302',
		'\u00D5': '\u004F\u0303',
		'\u00D6': '\u004F\u0308',
		'\u00D9': '\u0055\u0300',
		'\u00DA': '\u0055\u0301',
		'\u00DB': '\u0055\u0302',
		'\u00DC': '\u0055\u0308',
		'\u00DD': '\u0059\u0301',
		'\u00E0': '\u0061\u0300',
		'\u00E2': '\u0061\u0302',
		'\u00E4': '\u0061\u0308',
		'\u00F6': '\u006F\u0308',
		'\u00E7': '\u0063\u0327',
		'\u00E8': '\u0065\u0300',
		'\u00E9': '\u0065\u0301',
		'\u00EA': '\u0065\u0302',
		'\u00EB': '\u0065\u0308',
		'\u00ED': '\u0069\u0301',
		'\u00EE': '\u0069\u0302',
		'\u00EF': '\u0069\u0308',
		'\u00F1': '\u006E\u0303',
		'\u00F2': '\u006F\u0300',
		'\u00F3': '\u006F\u0301',
		'\u00F4': '\u006F\u0302',
		'\u00F5': '\u006F\u0308',
		'\u00F9': '\u0075\u0300',
		'\u00FA': '\u0075\u0301',
		'\u00FB': '\u0075\u0302',
		'\u00FC': '\u0075\u0308',
		'\u00FD': '\u0075\u0301',
		'\u00FF': '\u0079\u0308',
		// Greek - 1
		'\u0374': '\u02B9',
		'\u037e': '\u003B',
		'\u0385': '\u00A8\u0301',
		'\u0386': '\u0391\u0301',
		'\u0387': '\u00B7',
		'\u0388': '\u0395\u0301',
		'\u0389': '\u0397\u0301',
		'\u038a': '\u0399\u0301',
		'\u038c': '\u039F\u0301',
		'\u038e': '\u03A5\u0301',
		'\u038f': '\u03A9\u0301',
		'\u0390': '\u03CA\u0301',
		'\u03aa': '\u0399\u0308',
		'\u03ab': '\u03A5\u0308',
		'\u03ac': '\u03B1\u0301',
		'\u03ad': '\u03B5\u0301',
		'\u03ae': '\u03B7\u0301',
		'\u03af': '\u03B9\u0301',
		'\u03b0': '\u03CB\u0301',
		'\u03ca': '\u03B9\u0308',
		'\u03cb': '\u03C5\u0308',
		'\u03cc': '\u03BF\u0301',
		'\u03cd': '\u03C5\u0301',
		'\u03ce': '\u03C9\u0301',
		'\u03d3': '\u03D2\u0301',
		'\u03d4': '\u03D2\u0308',		
		// Cyrillic
		'\u0400': '\u0415\u0300',		
		'\u0401': '\u0415\u0308',
		'\u0403': '\u0413\u0301',
		'\u0407': '\u0406\u0308',
		'\u040c': '\u041A\u0301',
		'\u040d': '\u0418\u0300',
		'\u040e': '\u0423\u0306',		
		'\u0419': '\u0418\u0306',
		'\u0439': '\u0438\u0306',
		'\u0450': '\u0435\u0300',
		'\u0451': '\u0435\u0308',
		'\u0453': '\u0433\u0301',
		'\u0457': '\u0456\u0308',
		'\u045c': '\u043A\u0301',
		'\u045d': '\u0438\u0300',
		'\u045e': '\0443\u0306',
		'\u0476': '\0474\u030F',
		'\u0477': '\u0475\u030F',
		'\u04c1': '\u0416\u0306',
		'\u04c2': '\u0436\u0306',
		'\u04d0': '\u0410\u0306',
		'\u04d1': '\u0430\u0306',
		'\u04d2': '\u0410\u0308',
		'\u04d3': '\u0430\u0308',
		'\u04d6': '\u0415\u0306',
		'\u04d7': '\u0435\u0306',
		'\u04da': '\u04D8\u0308',
		'\u04db': '\u04D9\u0308',
		'\u04dc': '\u0416\u0308',
		'\u04dd': '\u0436\u0308',
		'\u04de': '\u0417\u0308',
		'\u04df': '\u0437\u0308',
		'\u04e2': '\u0418\u0304',
		'\u04e3': '\u0438\u0304',
		'\u04e4': '\u0418\u0308',
		'\u04e5': '\u0438\u0308',
		'\u04e6': '\u041E\u0308',
		'\u04e7': '\u043E\u0308',
		'\u04ea': '\u04E8\u0308',
		'\u04eb': '\u04E9\u0308',
		'\u04ec': '\u042D\u0308',
		'\u04ed': '\u044D\u0308',
		'\u04ee': '\u0423\u0304',
		'\u04ef': '\u0443\u0304',
		'\u04f0': '\u0423\u0308',
		'\u04f1': '\u0443\u0308',
		'\u04f2': '\u0423\u030B',
		'\u04f3': '\u0443\u030B',
		'\u04f4': '\u0427\u0308',
		'\u04f5': '\u0447\u0308',
		'\u04f8': '\u042B\u0308',
		'\u04f9': '\u044B\u0308',
		// Aribic
		'\u0622': '\u0627\u0653',
		'\u0623': '\u0627\u0654',
		'\u0624': '\u0648\u0654',
		'\u0625': '\u0627\u0655',
		'\u0626': '\u064A\u0654',
		'\u06c0': '\u06D5\u0654',
		'\u06c2': '\u06C1\u0654',
		'\u06d3': '\u06D2\u0654',		
		// HIRAGANA
		'\u304c': '\u304B\u3099',
		'\u304e': '\u304D\u3099',
		'\u3050': '\u304F\u3099',
		'\u3052': '\u3051\u3099',
		'\u3054': '\u3053\u3099',
		'\u3056': '\u3055\u3099',
		'\u3058': '\u3057\u3099',
		'\u305a': '\u3059\u3099',
		'\u305c': '\u305B\u3099',
		'\u305e': '\u305D\u3099',
		'\u3060': '\u305F\u3099',
		'\u3062': '\u3061\u3099',
		'\u3065': '\u3064\u3099',
		'\u3067': '\u3066\u3099',
		'\u3069': '\u3068\u3099',
		'\u3070': '\u306F\u3099',
		'\u3071': '\u306F\u309A',
		'\u3073': '\u3072\u3099',
		'\u3074': '\u3072\u309A',
		'\u3076': '\u3075\u3099',
		'\u3077': '\u3075\u309A',
		'\u3079': '\u3078\u3099',
		'\u307a': '\u3078\u309A',
		'\u307c': '\u307B\u3099',
		'\u307d': '\u307B\u309A',
		'\u3094': '\u3046\u3099',
		'\u309e': '\u309D\u3099'		
	},
	
	char_canonical_dcm : null,
	char_decompose_ja : null,
	//combine marks
	
	com_marks : '\u0073\u0300\u0301\u0302\u0308\u030A\u0327\u3099\u309A\u30C8',
	
	//Japanese: U4 characters
	char_u4_ja : '\u304B\u304D\u304F\u3051\u3053\u30AB\u30AD\u30AF\u30B1\u30B3\u30BB\u30C4\u30C8\u31F7',
	
	constructor : function(){
		var lang = g_locale || navigator.userLanguage || navigator.language;
		if(lang.indexOf('de') != -1)
			this.char_canonical_eq['\u00DF'] = '\u0073\u0073';
	},
		
	//decompose form
	decompose : function(s, map) {

		if (s.length==1){
			var temp = map[s];
			return (temp==null)? s: temp;
		}
		var arr = s.split('');
		for(var i = 0; i < arr.length; i++) {
			if(map[arr[i]] != null)
				arr[i] = map[arr[i]];
		}
		return arr.join('');
	},
	
	//match to a composite character
	match_composite : function(pattern, idx, ch, map) {
		var decom = map[ch];
		if(decom == null)
			return false;
		if( idx + decom.length > pattern.length )
			return false;
		for(var i = 0; i < decom.length; i++){
			if( pattern.charAt(i + idx) != decom.charAt(i))
				return false;
		}
		return true;
	},
	
	//NFC normalization
	normalize : function(s, map) {
		var rlt = new Array();
		for(var i = 0; i < s.length; i++){
			if(this.com_marks.indexOf(s.charAt(i)) != -1 && i > 0){
				var sub_s = s.substr(i - 1, 2);
				if(map[sub_s] != null) {
					rlt[rlt.length - 1] = map[sub_s];
					continue;
				}
			}
			rlt[rlt.length] = s.charAt(i);
		}

		return rlt.join('');
	},
	
	//position map before and after normalization
	mark_compose : function(s, map) {
		var rlt = new Array();
		rlt.push(1);
		for(var i = 1; i < s.length; i++){
			if(this.com_marks.indexOf(s.charAt(i)) != -1){
				var sub_s = s.substr(i - 1, 2);
				if(map[sub_s] != null) {
					rlt[rlt.length - 1] = 2;
					continue;
				}
			}
			iscom = false;
			rlt.push(1);
		}
		return rlt;
	},
	
	//reverse the associated array
	reverse : function(map) {
		var rlt = {};
		for(var com in map) {
			var decom = map[com];
			rlt[decom] = com;
		}
		return rlt;
	},
	
	_getLength : function(s, map) {
		var len = 0;
		for(var i = 0; i < s.length; i++) {
			if(this.com_marks.indexOf(s.charAt(i)) != -1 && i > 0) {
				var sub_s = s.substr(i - 1, 2);
				if(map[sub_s] != null)
					continue;
			}
			len = len + 1;
		}
		return len;
	},
	
	//Latin: decompose form of string for string search
	decompose_latin : function(s) {
		return this.decompose(s, this.char_canonical_eq);
	},
	
	decompose_de : function(s) {
		this.char_canonical_eq['\u00DF'] = '\u0073\u0073';
		return this.decompose(s, this.char_canonical_eq);
	},
	
	//Japanese: decompose form of string for string search
	decompose_ja : function(s) {
		return this.decompose(s, this.char_composite_ja);
	},
	
	//Ferman match	
	match_latin : function(pattern, idx, ch, matchCase)
	{
		if(!matchCase)
			pattern = pattern.toLowerCase();
		return this.match_composite(pattern, idx, ch, this.char_canonical_eq)
	},
	
	//Japanese match
	match_ja : function(pattern, idx, ch){
		return this.match_composite(pattern, idx, ch, this.char_composite_ja);
	},
	
	//NFC: Latin
	normalize_latin : function(s) {
		if(this.char_canonical_dcm == null) {
			this.char_canonical_dcm = this.reverse(this.char_canonical_eq);
			// case TS002071205, defect 59202, remove 'ss' -> '�' mapping because we can not know if 'ss' stands for itself or '�'
			delete this.char_canonical_dcm['\u0073\u0073'];
		}
		return this.normalize(s, this.char_canonical_dcm);
	},
	
	//NFC: Japanese
	normalize_ja : function(s) {
		if(this.char_decompose_ja == null)
			this.char_decompose_ja = this.reverse(this.char_composite_ja);
		return this.normalize(s, this.char_decompose_ja);
	},
	
	//Latin: mark the compose character
	mark_compose_latin : function(s) {
		if(this.char_canonical_dcm == null) {
			this.char_canonical_dcm = this.reverse(this.char_canonical_eq);
			delete this.char_canonical_dcm['\u0073\u0073'];
		}
		return this.mark_compose(s, this.char_canonical_dcm);
	},
	
	//Japanese: mark the compose character
	mark_compose_ja : function(s) {
		if(this.char_decompose_ja == null)
			this.char_decompose_ja = this.reverse(this.char_composite_ja);
		return this.mark_compose(s, this.char_decompose_ja);
	},
	
	GetLength_latin : function(s) {
		if(this.char_canonical_dcm == null) {
			this.char_canonical_dcm = this.reverse(this.char_canonical_eq);
			delete this.char_canonical_dcm['\u0073\u0073'];
		}
		return this._getLength(s, this.char_canonical_dcm);
	},
	
	//Japanese: u4 code
	//https://labweb.torolab.ibm.com/gcoc/documents/gvtguide/appendices/Appendix-A.htm#Table-U
    /*boolean*/hasCombination_ja : function(c,mark) {
		if(mark=='\u309A')	
			return this.char_u4_ja.indexOf(c) != -1;
	}
});
