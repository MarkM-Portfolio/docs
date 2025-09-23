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

dojo.provide("concord.editor.CJKWidthCharMap");
dojo.declare("concord.editor.CJKWidthCharMap", null, {
	char_map_cjk : {
		'\uFF5F' : '\u2985',
		'\uFF60' : '\u2986',
		'\uFF61' : '\u3002',
		'\uFF62' : '\u300C',
		'\uFF63' : '\u300D',
		'\uFF64' : '\u3001',
		'\uFF65' : '\u30FB',
		'\uFF66' : '\u30F2',
		'\uFF67' : '\u30A1',
		'\uFF68' : '\u30A9',
		'\uFF69' : '\u30A5',
		'\uFF6A' : '\u30A7',
		'\uFF6B' : '\u30A9',
		'\uFF6C' : '\u30E3',
		'\uFF6D' : '\u30E5',
		'\uFF6E' : '\u30E7',
		'\uFF6F' : '\u30C3',
		'\uFF71' : '\u30A2',
		'\uFF72' : '\u30A4',
		'\uFF73' : '\u30A6',
		'\uFF74' : '\u30A8',
		'\uFF75' : '\u30AA',
		'\uFF82' : '\u30C4',
		'\uFF83' : '\u30C6',
		'\uFF84' : '\u30C8',
		'\uFF85' : '\u30CA',
		'\uFF86' : '\u30CB',
		'\uFF87' : '\u30CC',
		'\uFF88' : '\u30CD',
		'\uFF89' : '\u30CE',
		'\uFF8A' : '\u30CF',
		'\uFF8B' : '\u30D2',
		'\uFF8C' : '\u30D5',
		'\uFF8D' : '\u30D8',
		'\uFF8E' : '\u30DB',
		'\uFF8F' : '\u30DE',
		'\uFF91' : '\u30E0',
		'\uFF92' : '\u30E1',
		'\uFF93' : '\u30E2',
		'\uFF94' : '\u30E4',
		'\uFF95' : '\u30E6',
		'\uFF96' : '\u30E8',
		'\uFF97' : '\u30E9',
		'\uFF98' : '\u30EA',
		'\uFF99' : '\u30EB',
		'\uFF9A' : '\u30EC',
		'\uFF9B' : '\u30ED',
		'\uFF9C' : '\u30EF',
		'\uFF9D' : '\u30F3',
		'\uFF9E' : '\u3099',
		'\uFF9F' : '\u309A',
		'\uFFA0' : '\u3164'
		
	},
	
	charToHarf : function(c){
		var ch = String.fromCharCode(c);
		if(this.char_map_cjk[ch] != null)
			return this.char_map_cjk[ch];
		if( 0xFF01 <= c && c <= 0xFF5A)
			return String.fromCharCode(c - 0xFEE0);
		if( 0xFF76 <= c && c <= 0xFF81)
			return String.fromCharCode((c - 0xFF76) * 2 + 0x30AB);
		if( 0xFFA1 <= c && c <= 0xFFBE)
			return String.fromCharCode(c - 0xCE70);
		if( 0xFFC2 <= c && c <= 0xFFC7)
			return String.fromCharCode(c - 0xCE73);
		if( 0xFFCA <= c && c <= 0xFFCF)
			return String.fromCharCode(c - 0xCE75);
		if( 0xFFD2 <= c && c <= 0xFFD7)
			return String.fromCharCode(c - 0xCE77);
		if( 0xFFDA <= c && c <= 0xFFDC)
			return String.fromCharCode(c - 0xCE79);
		return ch;
	},
	
	charTo2Full : function(c) {
		//TODO:...
	},
	
	strToHarf : function(s) {
		var rlt = '';
		for(var i = 0; i < s.length; i++) {
			rlt += this.charToHarf(s.charCodeAt(i));
		}
		return rlt;
	}
});