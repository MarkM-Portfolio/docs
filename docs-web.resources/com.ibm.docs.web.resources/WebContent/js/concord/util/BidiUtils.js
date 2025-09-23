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

dojo.provide("concord.util.BidiUtils");

dojo.require("dojox.string.BidiComplex");

dojo.declare("concord.util.BidiUtils", null, {
	isBidi: null,
	_isGuiRtl: null,
	_isArabicNumbers: null,
	textDirPrefs: null,
	bdEngine: null,
	FORMAT_L_LTR: 'ILNNN',
	FORMAT_L_RTL: 'IRNNN',
	RLM: String.fromCharCode(8207),
	LRM: String.fromCharCode(8206),
	RLE: String.fromCharCode(8235),
	LRE: String.fromCharCode(8234),
	PDF: String.fromCharCode(8236),
	LRO: String.fromCharCode(8237),
	RLO: String.fromCharCode(8238),
	RATIO: 50,
	
	init: function(){
		if (this.isBidi == null){
			this.isBidi = g_bidiOn == "true";
		}
		if(this._isGuiRtl == null) {
			!g_locale && (g_locale = dojo.locale || navigator.userLanguage || navigator.language);
			this._isGuiRtl = (g_locale.substr(0,2) == 'he') ||
				(g_locale.substr(0,2) == 'iw') || (g_locale.substr(0,2) == 'ar');
		}
		if(this._isArabicNumbers == null) {
			this._isArabicNumbers = g_locale.substr(0,2) == 'ar';
			if (this._isArabicNumbers) {
				var country = (g_locale.indexOf("-") == 2) ? g_locale.split("-")[1] : "";
				this._isArabicNumbers = ["dz", "eh", "ly", "ma", "tn"].indexOf(country.toLowerCase()) == -1;
			}
		}
		if (this.textDirPrefs == null) {
			this.textDirPrefs = window.g_bidiTextDir ? window.g_bidiTextDir.toLowerCase() : "contextual";
			if (this.textDirPrefs === "def")
				this.textDirPrefs = this._isGuiRtl ? "rtl" : "ltr";
		}
	},
	isBidiOn: function(){
		if (this.isBidi == null) {
			this.init();
		}
		return this.isBidi;
	},
	isGuiRtl: function(){
		if (this._isGuiRtl == null)
			this.init();
		return this._isGuiRtl;
	},
	getTextDir: function() {
		if (this.textDirPrefs == null)
			this.init();
		return this.textDirPrefs;
	},
	isTextRtl: function(str) {
		if(typeof(str) == "string") {
			var i = 0, symbol;
			while(symbol = str.charCodeAt(i++)) {
				if((symbol > 64 && symbol < 91)||(symbol > 96 && symbol < 123))			
					return false; //latin
				else if (symbol <= 126)
					continue; //neutral	
				else if((symbol > 1424 && symbol < 1791) || (symbol > 64284 && symbol < 65277))			
					return true; //bidi		
				else			
					return false; //othervise
			}
		}
		return false;
	},
	isMergeBordersBidi: function(view, preView, remainingText, isRtlDir) {
		var isNextRtl = (remainingText) ? BidiUtils._isViewRtl(remainingText, false, null, isRtlDir) : null,
			isCurrRtl = BidiUtils._isViewRtl(view, false, isNextRtl, isRtlDir),
			isPrevRtl = BidiUtils._isViewRtl(preView, true, isCurrRtl, isRtlDir);

		return (isPrevRtl && isCurrRtl) || (isRtlDir && (isPrevRtl || isCurrRtl));
	},
	_isViewRtl: function(curView, bLookBackwards, isNextViewRtl, isRtl) {
		var ret = false, str = (typeof(curView) != "string") ? curView.getText() : curView;
		if(str.length > 0) {
			var symbol, i = bLookBackwards ? str.length - 1 : 0;
			while(symbol = str.charCodeAt(i)) {
				i += bLookBackwards ? -1 : 1;
				if((symbol > 64 && symbol < 91)||(symbol > 96 && symbol < 123))			
					return false; //latin
				else if ((symbol > 47 && symbol < 58) || (symbol > 1631 && symbol < 1642)) {
					ret = "9";
					continue; //numeral
				}
				else if (symbol <= 126 || symbol == 160) {
					ret = "@";
					continue; //neutral
				}
				else if((symbol > 1424 && symbol < 1791) || (symbol > 64284 && symbol < 65277))			
					return true; //bidi		
				else			
					return false; //othervise
			}

			var preView = (typeof(curView) != "string") ? curView.previous() : null;
			while(preView && preView.getViewType() != "text.Run"){
				preView = preView.previous();
			}
	
			if(ret == "9") {
				/* run of number's level goes after previous strong char in LTR, English in RTL */
				if(!isRtl && preView)
					ret = this._isViewRtl(preView, true, isNextViewRtl, isRtl);
				else
					ret = false;
			}
			if(ret == "@") {
				/* run of neutrals, goes after previous & next strong char, base level by default*/
				var isPrevViewRtl = preView ? this._isViewRtl(preView, true, isNextViewRtl, isRtl) : null;
				ret = (isPrevViewRtl != null && isPrevViewRtl == isNextViewRtl) ? isPrevViewRtl : isRtl;
			}
		}
		return ret;
	},
	mirrorSelect: function(select){
		dojo.mixin(select,{
			_getMenuItemForOptionCallOrig: dijit.form.Select.prototype._getMenuItemForOption,
			_getMenuItemForOption: function(option){
				var w = this._getMenuItemForOptionCallOrig(option);
				w.containerNode.align = 'right';
				w.containerNode.dir = 'rtl';
				return w;
			}
		});
	},
	calculateDirForContextual: function(str){
		if (typeof(str) != "string")
			return "";
		return this.isTextRtl(str) ? "rtl" : "ltr";
	},
	getResolvedTextDir: function(str) {
		var textDir = this.getTextDir();
		if (textDir == "contextual")
			textDir = this.calculateDirForContextual(str);
		return textDir;
	},
	generateSpanWithDir: function(str) {
		return "<span " + this.generateDirAttr(str) + ">" + str + "</span>";
	},
	isUrl: function(/*String*/value, /*Object?*/flags){
		if (BidiUtils.isBidiOn())
			return dojox.validate.isUrl(dojox.string.BidiComplex.stripSpecialCharacters(value), flags);
		return dojox.validate.isUrl(value, flags);
	},
	isEmailAddress: function(/*String*/value, /*Object?*/flags){
		if (BidiUtils.isBidiOn())
			return dojox.validate.isEmailAddress(dojox.string.BidiComplex.stripSpecialCharacters(value), flags);
		return dojox.validate.isEmailAddress(value, flags);
	},
	isBidiLocale: function (locale){
		if (!locale)
		   locale = pe.scene.getLocale();
		if(locale && (locale.indexOf("he") > -1 || locale.indexOf("iw") > -1 || locale.indexOf("ar") > -1))
			return true;
		else
			return false;
	},
	addRLMToStr: function (str) {
		return BidiUtils.RLM + str;	
	},
	generateDirAttr: function(str) {
		if (this.getTextDir() != "")
			return "dir = '" + this.getResolvedTextDir(str) + "'";
		return "";
	},
	removeUCC: function (str){
		str = str.split(this.LRE.charAt(0)).join("");
		str = str.split(this.RLE.charAt(0)).join("");
		str = str.split(this.RLM.charAt(0)).join("");
		str = str.split(this.LRM.charAt(0)).join("");
		str = str.split(this.PDF.charAt(0)).join("");
		str = str.split(this.LRO.charAt(0)).join("");
		str = str.split(this.RLO.charAt(0)).join("");
		
		return str;
	},
	addOverrideUCC: function (str, dir){
		return (dir=="ltr" ? this.LRO : this.RLO) + str + this.PDF;
	},
	addEmbeddingUCC: function (str){
		var dir = this.getResolvedTextDir(str);
		return this.addEmbeddingUCCwithDir(str, dir);
	},
	addEmbeddingUCCwithDir: function (str, dir){
		return (dir=="ltr" ? this.LRE : this.RLE) + this.removeUCC(str) + this.PDF;
	},
	_initializeBidiEngine: function (){
		dojo.require("concord.util.BidiEngine");
		this.bdEngine = new concord.util.BidiEngine();
	},
	/* checks codepoints of input string, returns true if at least on Bidi character is present */
	hasBidiChar: function(text){
		!this.bdEngine && this._initializeBidiEngine();

		return this.bdEngine.hasBidiChar(text);
	},
	isArabicLocale: function() {
		if (this._isArabicNumbers == null) {
			this.init();
		}
		return this._isArabicNumbers;
	},
	/* Converts from Arabic (Europeian) digits to Hindi (Arabic cultural specific digits) */
	HINDI_DELTA: 0x0660 - 0x30,
	convertHindiToArabic: function(str){
		if (!str) return str;
		var charCode, i = 0, ret = "";
		while (charCode = str.charCodeAt(i++)) {		
			if (charCode >= 0x0660 && charCode <= 0x0669) {
				charCode -= this.HINDI_DELTA;
			}
			ret += String.fromCharCode(charCode);
		}
		return ret;
	},
	convertArabicToHindi: function(str, forceLtrOrientation){
		if (!str) return str;

		if (str instanceof Array) {
			str = this.convertArabicToHindi(str.join());
			return str.split(',');
		}

		var charCode, i = 0, ret = forceLtrOrientation ? this.LRE : "";
		while (charCode = str.charCodeAt(i++)) {		
			if (charCode >= 0x30 && charCode <= 0x39) {
				charCode += this.HINDI_DELTA;
			}
			ret += String.fromCharCode(charCode);
		}
		return ret;
	},
	adjustArabicDate: function(date) {
		if (date.search(/\/\d{1,2}\/\d{4}/g) != -1) {
			date = date.replace(/(\d{1,2})(\/)(\d{1,2})(\/)(\d{4})/g, "$5$2$3$4$1");
		}
		return this.convertArabicToHindi(date);
	},
	formatDateTime: function(timestamp){
		if (this.isArabicLocale()) {
			timestamp = this.adjustArabicDate(timestamp);
		}
		if (this.calculateDirForContextual(timestamp) == "rtl") {
			timestamp = this.RLE + timestamp + this.PDF;
		}
		return timestamp;
	},
	/* transforms input string from Logical Ltr to Logical Rtl */
	doTransform: function(text){
		!this.bdEngine && this._initializeBidiEngine();
		return (text ? this.bdEngine.bidiTransform(text, this.FORMAT_L_LTR, this.FORMAT_L_RTL) : text);
	},
	/* returns logical-to-visual map based on input string using Bidi reordering algorthim */
	doBidiReorder: function(text, isRtl){ 
		!this.bdEngine && this._initializeBidiEngine();

		if(text)
			text = text + text.charAt(text.length - 1);
		else
			return {'logicalFromVisual': [0],'visualfromLogical': [0], 'visualCharWidths': [0],'levels': [0]};

		this.bdEngine.bidiTransform(text, isRtl ? this.FORMAT_L_RTL : this.FORMAT_L_LTR,'VLNNN');
		var visualCharWidths, sourceToTarget, targetToSource, len = this.bdEngine.levels.length;
		try {
			sourceToTarget = new Uint8Array(len);
			targetToSource = new Uint8Array(len);
			visualCharWidths = new Int16Array(len);
		} catch(err) {
			sourceToTarget = new Array(len);
			targetToSource = new Array(len);
			visualCharWidths = new Array(len);
		}
		for (var idx = 0; idx < len; idx++) {
			sourceToTarget[idx] = this.bdEngine.sourceToTarget[idx];
			targetToSource[idx] = this.bdEngine.targetToSource[idx];
		}
		return {'logicalFromVisual': sourceToTarget,'visualfromLogical': targetToSource,
			'visualCharWidths': visualCharWidths,'levels': this.bdEngine.levels};
	},
	/* checks whether input string contains Arabic characters */
	isArabicText: function(str){
		if(str.length > 1) {
			var i = 0, symbol;
			while(symbol = str.charAt(i++)) {		
				if(this._isArabicAlefbet(symbol) || this._isArabicDiacritics(symbol))
					return true;
			}
			return false;
		}
	},
	_isArabicAlefbet: function(c){
		for(var i = 0; i < this.ArabicAlefBetIntervalsBegine.length; i++){
			if(c >= this.ArabicAlefBetIntervalsBegine[i] && c <= this.ArabicAlefBetIntervalsEnd[i]){
				return true;
			}
		}
		return false;
	},
	_isArabicDiacritics: function(c){
		return	(c >= '\u064b' && c <= '\u0655') ? true : false;
	},
	ArabicAlefBetIntervalsBegine: ['\u0621', '\u0641'],
	ArabicAlefBetIntervalsEnd: ['\u063A', '\u064a']
});
(function(){
        BidiUtils = new concord.util.BidiUtils();   
})();