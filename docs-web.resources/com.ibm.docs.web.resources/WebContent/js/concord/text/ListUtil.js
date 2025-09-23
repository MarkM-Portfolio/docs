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

dojo.provide("concord.text.ListUtil");
dojo.declare("concord.text.ListUtil", null, {
	A :{ 
		values:[ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",	"O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z" ],
		valueMap:{"A":0, "B":1, "C":2, "D":3, "E":4, "F":5, "G":6, "H":7, "I":8, "J":9, "K":10, "L":11, "M":12, "N":13,	"O":14, "P":15, "Q":16, "R":17, "S":18, "T":19, "U":20, "V":21, "W":22, "X":23, "Y":24, "Z":25 },
		getIndex:function(value){
			value =String(value);
			var k = value.length;
			value= value[0];
			return this.valueMap[value]+26*(k-1);
		},
		getNextValue:function(currentValue,offset){
			var rets=[];
			var index = this.getIndex(currentValue);
			var k = Math.floor(index / 26);
			index = index%26;
			var value = this.values[(index+offset)%26];
			var kk = k+Math.floor((index+offset) / 26);
			var ret=value;
			for(var j=0;j<kk;j++){
				ret= ret+value;
			}
			return ret;
		}
	},
	a :{ 
		values:[ 'a', "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",	"o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ],
		valueMap:{"a":0, "b":1, "c":2, "d":3, "e":4, "f":5, "g":6, "h":7, "i":8, "j":9, "k":10, "l":11, "m":12, "n":13,	"o":14, "p":15, "q":16, "r":17, "s":18, "t":19, "u":20, "v":21, "w":22, "x":23, "y":24, "z":25 },
		getIndex:function(value){
			value =String(value);
			var k = value.length;
			value= value[0];
			return this.valueMap[value]+26*(k-1);
		},
		getNextValue:function(currentValue,offset){
			var rets=[];
			var index = this.getIndex(currentValue);
			var k = Math.floor(index / 26);
			index = index%26;			
			var value = this.values[(index+offset)%26];
			var kk = k+Math.floor((index+offset) / 26);
			var ret=value;
			for(var j=0;j<kk;j++){
				ret= ret+value;
			}
			return ret;
		}
	},
	I : {
		values:[ 'I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII','XXXIX','XL','XLI','XLII','XLIII','XLIV','XLV','XLVI','XLVII','XLVIII','XLIX','L','LI','LII','LIII','LIV','LV','LVI','LVII','LVIII','LIX','LX','LXI','LXII','LXIII','LXIV','LXV','LXVI','LXVII','LXVIII','LXIX','LXX','LXXI','LXXII','LXXIII','LXXIV','LXXV','LXXVI','LXXVII','LXXVIII','LXXIX','LXXX','LXXXI','LXXXII','LXXXIII','LXXXIV','LXXXV','LXXXVI','LXXXVII','LXXXVIII','LXXXIX','XC','XCI','XCII','XCIII','XCIV','XCV','XCVI','XCVII','XCVIII','XCIX','C','CI','CII','CIII','CIV','CV','CVI','CVII','CVIII','CIX','CX','CXI','CXII','CXIII','CXIV','CXV','CXVI','CXVII','CXVIII','CXIX','CXX','CXXI','CXXII','CXXIII','CXXIV','CXXV','CXXVI','CXXVII','CXXVIII' ],
		valuesMap:{'I':0,'II':1,'III':2,'IV':3,'V':4,'VI':5,'VII':6,'VIII':7,'IX':8,'X':9,'XI':10,'XII':11,'XIII':12,'XIV':13,'XV':14,'XVI':15,'XVII':16,'XVIII':17,'XIX':18,'XX':19,'XXI':20,'XXII':21,'XXIII':22,'XXIV':23,'XXV':24,'XXVI':25,'XXVII':26,'XXVIII':27,'XXIX':28,'XXX':29,'XXXI':30,'XXXII':31,'XXXIII':32,'XXXIV':33,'XXXV':34,'XXXVI':35,'XXXVII':36,'XXXVIII':37,'XXXIX':38,'XL':39,'XLI':40,'XLII':41,'XLIII':42,'XLIV':43,'XLV':44,'XLVI':45,'XLVII':46,'XLVIII':47,'XLIX':48,'L':49,'LI':50,'LII':51,'LIII':52,'LIV':53,'LV':54,'LVI':55,'LVII':56,'LVIII':57,'LIX':58,'LX':59,'LXI':60,'LXII':61,'LXIII':62,'LXIV':63,'LXV':64,'LXVI':65,'LXVII':66,'LXVIII':67,'LXIX':68,'LXX':69,'LXXI':70,'LXXII':71,'LXXIII':72,'LXXIV':73,'LXXV':74,'LXXVI':75,'LXXVII':76,'LXXVIII':77,'LXXIX':78,'LXXX':79,'LXXXI':80,'LXXXII':81,'LXXXIII':82,'LXXXIV':83,'LXXXV':84,'LXXXVI':85,'LXXXVII':86,'LXXXVIII':87,'LXXXIX':88,'XC':89,'XCI':90,'XCII':91,'XCIII':92,'XCIV':93,'XCV':94,'XCVI':95,'XCVII':96,'XCVIII':97,'XCIX':98,'C':99,'CI':100,'CII':101,'CIII':102,'CIV':103,'CV':104,'CVI':105,'CVII':106,'CVIII':107,'CIX':108,'CX':109,'CXI':110,'CXII':111,'CXIII':112,'CXIV':113,'CXV':114,'CXVI':115,'CXVII':116,'CXVIII':117,'CXIX':118,'CXX':119,'CXXI':120,'CXXII':121,'CXXIII':122,'CXXIV':123,'CXXV':124,'CXXVI':125,'CXXVII':126,'CXXVIII':127},
		singles : [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX' ],
		decades : [ 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC' ],
		hundreds : [ 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM' ],
		thousands : [ 'M' ],
		convertRom : function(num) {
			var thousand = Math.floor(num / 1000);
			num = num % 1000;
			var hunred = Math.floor(num / 100);
			num = num % 100;
			var decade = Math.floor(num / 10);
			num = num % 10;
			var ret = "";
			if (thousand > 0) {
				for ( var i = 0; i < thousand; i++) {
					ret = ret + 'M';
				}
			}
			if (hunred > 0) {
				ret = ret + this.hundreds[hunred-1];
			}
			if (decade > 0) {
				ret = ret + this.decades[decade-1];
			}
			if (num > 0) {
				ret = ret + this.singles[num-1];
			}
			return ret;
		},
		convertFromRom : function(rom) {
			var r = 0;
			for ( var c = 0; c < rom.length; c++)
			{
				var chr = rom.charAt(c).toLowerCase();
				if (c < rom.length - 1)
					var next = rom.charAt(c + 1).toLowerCase();
				else
					var next = '';
				if (c > 0)
					var prev = rom.charAt(c - 1).toLowerCase();
				else
					var prev = '';
				if (chr == 'i')
				{
					if (next == 'v')
						r += 4;
					else if (next == 'x')
						r += 9;
					else
						r += 1;
					continue;
				}
				if (chr == 'v')
				{
					if (prev != 'i')
						r += 5;
					continue;
				}
				if (chr == 'x')
				{
					if (prev != 'i')
						if (next == 'l')
							r += 40;
						else if (next == 'c')
							r += 90;
						else
							r += 10;
					continue;
				}
				if (chr == 'l')
				{
					if (prev != 'x')
						r += 50;
					continue;
				}
				if (chr == 'c')
				{
					if (prev != 'x')
						if (next == 'd')
							r += 400;
						else
						if (next == 'm')
							r += 900;
						else
							r += 100;
					continue;
				}
				if (chr == 'd')
				{
					if (prev != 'c')
						r += 500;
					continue;
				}
				if (chr == 'm')
				{
					if (prev != 'c')
						r += 1000;
					continue;
				}
			}
			return r;
		},
		getIndex:function(value){
			return this.valuesMap[value];
		},
		getNextValue:function(currentValue,offset){
			var index = this.valuesMap[currentValue];
			var ret ;
			if(index ==null || index<0 ||index> 127){
				index = this.convertFromRom(currentValue);
				ret = this.convertRom(index+offset);
			}else{
				var idx =index+offset;
				if(idx < this.values.length){
					ret = this.values[idx];
				}else{
					ret = this.convertRom(idx+1);
				}
			}
			return ret;	
		}
	},
	i : {
		values:[ 'i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx','xxi','xxii','xxiii','xxiv','xxv','xxvi','xxvii','xxviii','xxix','xxx','xxxi','xxxii','xxxiii','xxxiv','xxxv','xxxvi','xxxvii','xxxviii','xxxix','xl','xli','xlii','xliii','xliv','xlv','xlvi','xlvii','xlviii','xlix','l','li','lii','liii','liv','lv','lvi','lvii','lviii','lix','lx','lxi','lxii','lxiii','lxiv','lxv','lxvi','lxvii','lxviii','lxix','lxx','lxxi','lxxii','lxxiii','lxxiv','lxxv','lxxvi','lxxvii','lxxviii','lxxix','lxxx','lxxxi','lxxxii','lxxxiii','lxxxiv','lxxxv','lxxxvi','lxxxvii','lxxxviii','lxxxix','xc','xci','xcii','xciii','xciv','xcv','xcvi','xcvii','xcviii','xcix','c','ci','cii','ciii','civ','cv','cvi','cvii','cviii','cix','cx','cxi','cxii','cxiii','cxiv','cxv','cxvi','cxvii','cxviii','cxix','cxx','cxxi','cxxii','cxxiii','cxxiv','cxxv','cxxvi','cxxvii','cxxviii' ],
		valuesMap:{'i':0,'ii':1,'iii':2,'iv':3,'v':4,'vi':5,'vii':6,'viii':7,'ix':8,'x':9,'xi':10,'xii':11,'xiii':12,'xiv':13,'xv':14,'xvi':15,'xvii':16,'xviii':17,'xix':18,'xx':19,'xxi':20,'xxii':21,'xxiii':22,'xxiv':23,'xxv':24,'xxvi':25,'xxvii':26,'xxviii':27,'xxix':28,'xxx':29,'xxxi':30,'xxxii':31,'xxxiii':32,'xxxiv':33,'xxxv':34,'xxxvi':35,'xxxvii':36,'xxxviii':37,'xxxix':38,'xl':39,'xli':40,'xlii':41,'xliii':42,'xliv':43,'xlv':44,'xlvi':45,'xlvii':46,'xlviii':47,'xlix':48,'l':49,'li':50,'lii':51,'liii':52,'liv':53,'lv':54,'lvi':55,'lvii':56,'lviii':57,'lix':58,'lx':59,'lxi':60,'lxii':61,'lxiii':62,'lxiv':63,'lxv':64,'lxvi':65,'lxvii':66,'lxviii':67,'lxix':68,'lxx':69,'lxxi':70,'lxxii':71,'lxxiii':72,'lxxiv':73,'lxxv':74,'lxxvi':75,'lxxvii':76,'lxxviii':77,'lxxix':78,'lxxx':79,'lxxxi':80,'lxxxii':81,'lxxxiii':82,'lxxxiv':83,'lxxxv':84,'lxxxvi':85,'lxxxvii':86,'lxxxviii':87,'lxxxix':88,'xc':89,'xci':90,'xcii':91,'xciii':92,'xciv':93,'xcv':94,'xcvi':95,'xcvii':96,'xcviii':97,'xcix':98,'c':99,'ci':100,'cii':101,'ciii':102,'civ':103,'cv':104,'cvi':105,'cvii':106,'cviii':107,'cix':108,'cx':109,'cxi':110,'cxii':111,'cxiii':112,'cxiv':113,'cxv':114,'cxvi':115,'cxvii':116,'cxviii':117,'cxix':118,'cxx':119,'cxxi':120,'cxxii':121,'cxxiii':122,'cxxiv':123,'cxxv':124,'cxxvi':125,'cxxvii':126,'cxxviii':127},
		singles : [ 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix' ],
		decades : [ 'x', 'xx', 'xxx', 'xl', 'l', 'lx', 'lxx', 'lxxx', 'xc' ],
		hundreds : [ 'c', 'cc', 'ccc', 'cd', 'd', 'dc', 'dcc', 'dccc', 'cm' ],
		thousands : [ 'm' ],
		convertRom : function(num) {
			var thousand = Math.floor(num / 1000);
			num = num % 1000;
			var hunred = Math.floor(num / 100);
			num = num % 100;
			var decade = Math.floor(num / 10);
			num = num % 10;
			var ret = "";
			if (thousand > 0) {
				for ( var i = 0; i < thousand; i++) {
					ret = ret + 'm';
				}
			}
			if (hunred > 0) {
				ret = ret + this.hundreds[hunred-1];
			}
			if (decade > 0) {
				ret = ret + this.decades[decade-1];
			}
			if (num > 0) {
				ret = ret + this.singles[num-1];
			}
			return ret;
		},
		convertFromRom : function(rom) {
			var r = 0;
			for ( var c = 0; c < rom.length; c++)
			{
				var chr = rom.charAt(c).toLowerCase();
				if (c < rom.length - 1)
					var next = rom.charAt(c + 1).toLowerCase();
				else
					var next = '';
				if (c > 0)
					var prev = rom.charAt(c - 1).toLowerCase();
				else
					var prev = '';
				if (chr == 'i')
				{
					if (next == 'v')
						r += 4;
					else if (next == 'x')
						r += 9;
					else
						r += 1;
					continue;
				}
				if (chr == 'v')
				{
					if (prev != 'i')
						r += 5;
					continue;
				}
				if (chr == 'x')
				{
					if (prev != 'i')
						if (next == 'l')
							r += 40;
						else if (next == 'c')
							r += 90;
						else
							r += 10;
					continue;
				}
				if (chr == 'l')
				{
					if (prev != 'x')
						r += 50;
					continue;
				}
				if (chr == 'c')
				{
					if (prev != 'x')
						if (next == 'd')
							r += 400;
						else
						if (next == 'm')
							r += 900;
						else
							r += 100;
					continue;
				}
				if (chr == 'd')
				{
					if (prev != 'c')
						r += 500;
					continue;
				}
				if (chr == 'm')
				{
					if (prev != 'c')
						r += 1000;
					continue;
				}
			}
			return r;
		},
		getIndex:function(value){
			return this.valuesMap[value];
		},
		getNextValue:function(currentValue,offset){
			var index = this.valuesMap[currentValue];
			if(index ==null || index<0 ||index> 127){
				index = this.convertFromRom(currentValue);
				return this.convertRom(index+offset);
			}else{
				var idx =index+offset;
				if(idx < this.values.length){
					return this.values[idx];
				}else{
					return this.convertRom(idx+1);
				}
			}
		}
	},
	J1 :{		
		values:[ "イ", "ロ", "ハ", "ニ", "ホ", "ヘ", "ト", "チ", "リ", "ヌ", "ル", "ヲ", "ワ", "カ", "ヨ", "タ", "レ", "ソ", "ツ", "ネ", "ナ", "ラ", "ム", "ウ", "ヰ", "ノ", "オ", "ク", "ヤ", "マ", "ケ", "フ", "コ", "エ", "テ", "ア", "サ", "キ", "ユ", "メ", "ミ", "シ", "ヱ", "ヒ", "モ", "セ", "ス", "ン" ],
		valueMap:{"イ":0, "ロ":1, "ハ":2, "ニ":3, "ホ":4, "ヘ":5, "ト":6, "チ":7, "リ":8, "ヌ":9, "ル":10, "ヲ":11, "ワ":12, "カ":13, "ヨ":14, "タ":15, "レ":16, "ソ":17, "ツ":18, "ネ":19, "ナ":20, "ラ":21, "ム":22, "ウ":23, "ヰ":24, "ノ":25, "オ":26, "ク":27, "ヤ":28, "マ":29, "ケ":30, "フ":31, "コ":32, "エ":33, "テ":34, "ア":35, "サ":36, "キ":37, "ユ":38, "メ":39, "ミ":40, "シ":41, "ヱ":42, "ヒ":43, "モ":44, "セ":45, "ス":46, "ン":47 },
		getIndex:function(value){
			value =String(value);
			return this.valueMap[value];
		},
		getNextValue:function(currentValue,offset){
			var index = this.getIndex(currentValue);
			var nextIndex = (index+offset) % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		}
	},
	J2 :{ 
		values:[ "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン" ],
		valueMap:{"ア":0,"イ":1,"ウ":2,"エ":3,"オ":4,"カ":5,"キ":6,"ク":7,"ケ":8,"コ":9,"サ":10,"シ":11,"ス":12,"セ":13,"ソ":14,"タ":15,"チ":16,"ツ":17,"テ":18,"ト":19,"ナ":20,"ニ":21,"ヌ":22,"ネ":23,"ノ":24,"ハ":25,"ヒ":26,"フ":27,"ヘ":28,"ホ":29,"マ":30,"ミ":31,"ム":32,"メ":33,"モ":34,"ヤ":35,"ユ":36,"ヨ":37,"ラ":38,"リ":39,"ル":40,"レ":41,"ロ":42,"ワ":43,"ヲ":44,"ン":45 },
		getIndex:function(value){
			value =String(value);
			return this.valueMap[value];
		},
		getNextValue:function(currentValue,offset){
			var index = this.getIndex(currentValue);
			var nextIndex = (index+offset) % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		}
	},
	N:{
		getNextValue:function(currentValue,offset){
			var ret = "";
			var val = parseInt(currentValue)+offset;
			ret += val;
			return ret;	
		}
	},
	getBaseType : function (type)
	{
		var base=this.N;
		if( type =="A"){
			base = this.A;
		} else if(type=="a"){
			base= this.a;
		} else if( type=='I'){
			base = this.I;
		} else if (type == 'i') {
			base = this.i;
		} else if (type == '1' || type == 1) {
			base = this.N;
		} else if (type == 'イロハ' || type == 'ｲﾛﾊ') {
			base = this.J1;
		} else if (type == 'アイウ' || type == 'ｱｲｳ'){
			base = this.J2;
		}
		return base;
	},
	getNextValue : function(type, currentValue, offset) {
		var ret = "";
		var base = this.getBaseType(type);
		if (offset == 0)
		{
			ret = base.values ? base.values[0] : 1 ;
		} else {
			if(offset == null || offset == ""|| offset == undefined){
				offset = 1;
			}
			ret = base.getNextValue(currentValue,offset);
		}
		return ret;
	},
	convertToListType : function ( style)
	{
		var type = style;
		switch (style) {
		case "lst-ur" : 
			type = "I";
			break;
		case "lst-lr" : 
			type="i";
			break;
		case "lst-uap" : 
		case "lst-ua" : 
			type = "A";
			break;
		case "lst-lap":
		case "lst-la" : 
			type = "a";
			break;
		case "lst-n":
		case "lst-n2":
		case "lst-np":
			type = "1";
			break;
		case "lst-j1":
			type = "イロハ";
			break;
		case "lst-j2":
			type = "アイウ";
			break;
		};
		return type;		
	},
	getListType : function ( node, header)
	{
		var type = null;
		if (MSGUTIL.isListItem(node))
		{
			var css = this.getListClass(node);
			if (css && css.match(/lst.*/g))
			{
				type = this.convertToListType(css);
			} else {
				node = node.getParent();
			}
		}
		if (MSGUTIL.isList(node))
		{
			var top = this.getTopList(node);
			if (top.list != null)
			{
				header = header || this.getHeaderList(top.list);
				var outline = this.getOutlineInfo(header);
				var indent = top.indent;
				if (indent >= outline.length)
					indent = outline.length-1;
				type = outline[indent][0];
			}
		}
		if (type == null)
			type = "1";
		return type;
	},
	getMarginClassFromNode :function( node )
	{
	//get the margin class from bullet's classes 
	// or get margin class from li's _list attribute
		if( MSGUTIL.isList(node))
		{
			var regx = /[A-Za-z0-9_]+(_[1-9])+(\s|$)/g;
			var cls, match, i ;
			if( node.hasAttribute('class'))
			{
				var clslist = node.getAttribute('class').split(' ');
				for( i =0; i< clslist.length && !match ; i++ )
				{
					cls = dojo.trim(clslist[i]);
					if( cls.indexOf('lst-')!=0 )
					{
						match = cls.match(regx);
					}
				}
			}
			
			if ( match &&  match.length )
				return CKEDITOR.tools.trim(match[0]);
		}
		else if ( MSGUTIL.isListItem(node))
		{
			return  node.getAttribute('_list');
		}
	},
	
	/**
	 * Imported outline should add class for each level bullet.
	 * This function will return the class prefix
	 * @param {String} bulletClass The document's outline bullet class, defined in body's 'bulletclass' attribute 
	 * @returns {String} The bullet class prefix
	 * 
	 * @example
	 * var prefix = LISTUTIL.getClassPrefixFromOutline("lst-WW8Num20");
	 * assert(prefix == "WW8Num20_"); // reutrn true
	 */
	getClassPrefixFromOutline : function(bulletClass)
	{
		if(!bulletClass || bulletClass == '')
			return null;
		
		// IBM Docs internal defined outline class pattern: lst-outline-xxx, sample lst-outline-upper
		var regInternalPattern = /lst\-outline[a-zA-Z0-9_\-]+/g;
		// Imported outline class pattern: lst-xxxx, sample lst-WW8Num20
		var regImportedPattern = /lst\-[a-zA-Z0-9_\-]+/g;
		
		var prefix = null;
		if(bulletClass.match(regInternalPattern))
			prefix = bulletClass.substr(12) + '_';  // Remove character "lst-outline-" then add "_"
		else if(bulletClass.match(regImportedPattern))
			prefix = bulletClass.substr(4) + '_';  // Remove character "lst-" then add "_"

		return prefix;
	},
	
	isOutlineBulletClass : function(bulletClass, listClass)
	{
		if(!listClass || !bulletClass)
			return false;
		
		if(bulletClass == listClass)
			return true;
		
		var prefix = this.getClassPrefixFromOutline(bulletClass);
		if(listClass.indexOf(prefix, 0) == 0)
			return true;
		
		return false;
	},
	
	/**
	 * Get the bullet's class match outline pattern
	 * @param node
	 * @param editor
	 * @returns matched outline class
	 * 
	 * @samples
	 * The body has oultine bullet class "lst-outline-multi"
	 * The node has class "cssHeading multi_1"
	 *  var oClass = getOutlineBulletClass(node);
	 *  The oClass equals "multi_1"
	 */
	getOutlineBulletClass : function(node, outlineClass)
	{
		var classStr = node.getAttribute('class') || '';
		var bulletClasses = classStr.split(' ');
		for(var i = 0; i < bulletClasses.length; i++)
		{
			var bulletClass = bulletClasses[i];
			if(this.isOutlineBulletClass(outlineClass, bulletClass))
				return bulletClass;
		}
		
		return null;
	},
	
	// the node is CKEDITOR.dom.node
	getNextListItemValue : function (node, type)
	{
		var val = null;
		if ( MSGUTIL.isListItem(node))
		{
			if (type == null)
				type = this.getListType(node);
			var curVal = this.getListItemValue(node);
			if (curVal == null || curVal == "")
				curVal = type;
			val = this.getNextValue(type, curVal );
		}
		return val;
	},
	isRestartList : function (node)
	{
		var result = false;
		if (MSGUTIL.isList(node))
		{
			var start = node.getAttribute('start');
			if (start && start != "")
			{
				result = true;
			}
		}
	},
	getSiblingList : function( node, rtl, css, doc)
	{
		var sibling = null;
		if (MSGUTIL.isList(node))
		{
			var document = node.getDocument();
			var selector = null;
			if (css != null && css.length > 0)
			{
				selector = node.getName() + '.'+css;
				siblings = document.$.querySelectorAll(selector);
			} else {
				var outline = document.getBody().getAttribute('bulletclass');
				selector = node.getName() + '[class]';
				siblings = [];
				if (!doc)
					doc = document;
				var rawLists = doc.$.querySelectorAll(selector);
				for (var i = 0; i < rawLists.length; i++)
				{
					if (rawLists[i].parentNode.nodeName.toLowerCase() != "li")
					{
						var list = new CKEDITOR.dom.element(rawLists[i]);
						var anchor = concord.text.tools.getAnchorParent(list);
						if (anchor && !anchor.equals(doc) )
						{
							
						} else if ( outline != LISTUTIL.getListClass(list))
							siblings.push(rawLists[i]);
					}					
				}
			}

			for (var i = 0; i < siblings.length; i++)
			{
				if (siblings[i] == node.$ )
				{
					if ( rtl && i > 0)
						sibling = new CKEDITOR.dom.element(siblings[i-1]);
					else if ( !rtl && i < siblings.length -1)
						sibling = new CKEDITOR.dom.element(siblings[i+1]);
					break;
				}
			}
		}
		return sibling;
		
	},
	getFollowableList : function(node, type)
	{
		var follow = null;
		if ( node != null)
		{
			var sibling = node.getPrevious();
			while (sibling)
			{
				if (TASK && TASK.tools.node.isTaskContainer(sibling))
				{
					var task = sibling;
					sibling = TASK.tools.task.getTaskContentContainer(task).getLast();
					if (sibling == null)
						sibling = task.getPrevious();
				}
				if (MSGUTIL.isList(sibling) && sibling.is(type) && (!this.isOutlineBullet(sibling)))
				{
					follow = sibling;	
				}
				if (follow == null && sibling &&  MSGUTIL.getPureText(sibling).length == 0)
				{
					node = sibling;
					sibling = node.getPrevious();
				} else {
					break;
				}
			}
			if (sibling == null)
			{
				if (TASK && TASK.tools.node.isInTask(node))
				{
					follow = this.getFollowableList(TASK.tools.node.getTaskContainer(node), type);
				}
			}
		}
		return follow;
	},
	
	/* This function is designed only for updateListValue, you should not invoke it directly.
	 * if you think you have strong reason to do this, please contact zhouzlin@cn.ibm.com
	 */
	getFollowedList : function (node, info, rtl)
	{
		var follow = null;
		if (MSGUTIL.isList(node))
		{
			var parent = node.getParent();
			// the list's parent isn't <li>, so it's the first level list
			if (!MSGUTIL.isListItem(parent) )
			{
				// if we want to find previous followed list, then this list should have class 'continue'
				if ((rtl && node.hasClass('continue')) || !rtl)
				{
					// the first level list must have list class, or else it's a bug
					var lists = info.lists;
					for (var i = 0; i < lists.length; i++)
					{
						if (lists[i].$ == node.$)
						{
							if ( rtl && i > 0)
								follow = lists[i-1];
							else if ( !rtl && i < lists.length -1)
								follow = lists[i+1];
							break;
						}
					}
				}	
			} else { // ok, this is a multiple level list. 
				
				
				/* try to find in same li first, like this:
				 
				<ol>
					<li>
						<ol><li></li></ol>
						<p> </p>
						<ol><li></li></ol>
					</li>
				</ol>
				*/
				var sibling = rtl ? node.getPrevious() : node.getNext();
				while (sibling && !MSGUTIL.isList(sibling))
				{
					sibling = rtl ? sibling.getPrevious() : sibling.getNext();
				}
				if (sibling)
				{
					follow = sibling;
				} else {
					if (!rtl || !LISTUTIL.getListClass(parent))
					{
						sibling = rtl ? parent.getPrevious(MSGUTIL.isListItem) : parent.getNext(MSGUTIL.isListItem);
						if (sibling)
						{
							var last = sibling.getLast();
							if (MSGUTIL.isList(last) && ( rtl || !LISTUTIL.getListClass(sibling)))
							{
								follow = last;
							}
						} else { // there is no sibling list item, so try to find parent's followed list
							var list = parent.getParent();
							var followParent = this.getFollowedList(list, info, rtl);
							if (followParent)
							{
								var item = rtl ? followParent.getLast() : followParent.getFirst();
								if (rtl || !LISTUTIL.getListClass(item))
								{
									var last = item.getLast();
									if (MSGUTIL.isList(last))
										follow = last;
								}
							}
						}
					}
				}
			}
		}
		return follow;
	},
	getWholeListInfo : function (node)
	{
		var info = {};
		if (MSGUTIL.isListItem(node))
			node = node.getParent();
		if (MSGUTIL.isList(node))
		{
			var top = this.getTopList(node);
			var doc = top.list.getDocument();
			var isPrivateDocument = MSGUTIL.isPrivateDocument(doc);
			var end = false;
			var lists = doc.$.querySelectorAll(top.list.getName() + "."+ this.getListClass(top.list));
			for (var i = 0; i < lists.length; i++)
			{
				var list = new CKEDITOR.dom.element(lists[i]);
				if (!list.hasClass('continue'))
				{
					if (!end)
					{
						info.header = list;
						info.lists = [list];
					} else {
						break;
					}
				} else {
					if ( !info.header )
					{
						// the first ol in private document may have continue class
						info.header = list;
						info.lists = [list];
					} else {
						if (info.lists != null)
							info.lists.push(list);
					}
				}
				if (list.$ == top.list.$)
				{
					if (info.lists != null)
					{
						info.currentIndex = info.lists.length -1;
						end = true;
					} else {
						break;
					}
				}
			}
			if (info.header)
			{
				info.outline = info.header.getAttribute('types');
				if (info.header.hasClass('continue'))
					info.continues = true;
			}
		}
		return info;
	},
	
	
	/* This function is designed only for updateListValue, you should not invoke it directly.
	 * if you think you have strong reason to do this, please contact zhouzlin@cn.ibm.com
	 */
	getFollowedListItem : function (node, info, rtl)
	{
		var listItem = null;
		//if (MSGUTIL.isListItem(node))
		{
			listItem = rtl ? node.getPrevious(MSGUTIL.isListItem) : node.getNext(MSGUTIL.isListItem);
			if (listItem == null )
			{
				var list = this.getFollowedList(node.getParent(), info,  rtl);
				if (list != null)
				{
					listItem = rtl ? list.getLast() : list.getFirst();
				}			
			}
			if (listItem && this.getListClass(listItem) == null)
			{
				
				var temp =  this.getFollowedListItem(listItem, info,  rtl);
				if (temp != null)
					listItem = temp;
			}
		}
		return listItem;
	},
	getHeaderList : function (node)
	{
		var info = this.getWholeListInfo(node);
		return info.header;
	},
	getTopList : function ( node)
	{
		var topList = null;
		var indentLevel = 0;
		if(MSGUTIL.isListItem(node))
			node = node.getParent();
		
		if (MSGUTIL.isList(node))
		{
			topList = node;
			var parent = topList.getParent();
			while (MSGUTIL.isListItem(parent))
			{
				indentLevel++;
				topList = parent.getParent();
				parent = topList.getParent();
			}
		}
		return {list:topList, indent:indentLevel};
	},
	getIndentLevel : function (node)
	{
		var indentLevel = 0;
		if (node)
		{
			var list = node.$;
			if (list.nodeName.toLowerCase() == "li")
				list = list.parentNode;
			if (list)
			{
				var parent = list.parentNode;
				while (parent && parent.nodeName.toLowerCase() == "li")
				{
					parent = parent.parentNode;
					indentLevel++;
					parent = parent.parentNode;
				}
			}
		}
		return indentLevel;
	},
	getListItemValue : function (node)
	{
		var value = null;
		var heading = this.getHeadingInListItem(node);
		if (heading)
		{
			value = heading.getAttribute('values');
		} else {
			value = node.getAttribute('values');
		}
		if (value)
			value = value.split(".").pop();
		else {
			//debugger;
		}
		return value;
	},
	setListItemValue : function (node, value, showLevel)
	{
		if (value != "")
		{
			if (showLevel == null) showLevel = 1; else showLevel = parseInt(showLevel);
			var list = node.$.parentNode;
			if (list != null) // sometimes we will set the listitem's value before it is appended to dom tree, like in "createList", so its parent is null
			{
				var parentItem = list.parentNode;
				for (var i = 1; i < showLevel; i++)
				{
					if (parentItem == null)
						break;
					var prefix = "";
					list = parentItem.parentNode;
					if(list.nodeName.toLowerCase() == 'ol')
					{
						var ckParent = new CKEDITOR.dom.element(parentItem);
						prefix = this.getListItemValue(ckParent);
					}
					value = prefix + "." + value;
					parentItem = list.parentNode;
				}
			}
		}
		var heading = this.getHeadingInListItem(node) || node;
		heading.setAttribute('values', value);

	},
	isEmptyListItem : function (node)
	{
		var result = false;
		if (MSGUTIL.isListItem(node))
		{
			var len = 0;
			var first = node.getFirst();
			while (first)
			{
				if (MSGUTIL.isParagraph(first) || MSGUTIL.isList(first))
				{
					break;
				} else {
					len += MSGUTIL.getPureText(first).length;
					if (len > 0) break;
					first = first.getNext();
				}
			}
			result = (len == 0);
		}
		return result;
	},
	
	/* The core function of list in concord, you must be very careful to modify this function.
	 * please contact zhouzin@cn.ibm.com if you think it's necessary to modify it
	 */
	updateListValue : function (node, info, forceFromHeader)
	{
		if (MSGUTIL.isList(node))
		{
			var database = {};
			if (info == null)
				info = this.getWholeListInfo(node);
			var header = info.header;
			var lists = info.lists;
			var doc = header.getDocument();
			var curIndex = info.currentIndex;
			var outline = this.getOutlineInfo(header);
			var startValues = this.getStartValues(header);
			var listClass = this.getListClass(header);
			//var tabstops = this.getFirstStop(header);
			var listValues = [null, null, null, null, null, null, null,null, null, null];
			var startIndex = curIndex;
			if (forceFromHeader) startIndex = 0;
			if (CKEDITOR.env.webkit)
			{
				//Defect 5792, try to let Safari re-render this list
				var ranges = doc.getSelection().getRanges();
				var bm = ranges[0].createBookmark(true);
			}
			for (var i = startIndex; i < lists.length; i++)
			{
				var list = lists[i];
				if (!list.equals(header))
					list.removeAttribute('types');
				
				
				var items = list.$.querySelectorAll('li');
				for (var j = 0; j < items.length; j++)
				{
					var item = new CKEDITOR.dom.element(items[j]);
					var itemClass = this.getListClass(item);
					
					{
						var parent = item.getParent();
						var indentLevel = parent.getCustomData( 'indentLevel' );
						if (indentLevel == null)
						{
							indentLevel = this.getIndentLevel(parent);
							
							CKEDITOR.dom.element.setMarker( database, parent, 'indentLevel', indentLevel );
							
						}
						if (indentLevel >= outline.length)
						{
							indentLevel = outline.length-1;
						}
						if (parent.getName() != outline[indentLevel][2])
						{
							parent.renameNode(outline[indentLevel][2]);
							if(parent.getId() == node.getId())
							{ //change $
								node.$ = parent.$;
								node.getName = parent.getName;
							}
							if(parent.getId() == list.getId())  list = parent;
						}
						var marginClass = this.getMarginClassFromOutline(outline, listClass, indentLevel);
						if (marginClass)
						{
							this.setMarginClass(parent, marginClass);
							if (!parent.hasClass('concordList') && marginClass.match(/[A-Z]{4}_[0-9]+/g))
								parent.addClass('concordList');
						}
						
						var newItemClass = this.getListItemClassFromOutline(outline, listClass, indentLevel);
						var showLevel = outline[indentLevel][1];
						var type = this.convertToListType(outline[indentLevel][0]);
						var value = "";
						if (outline[indentLevel][0] != "")
						{
							if (startValues == null || indentLevel >= startValues.length || startValues[indentLevel] == "" || startValues[indentLevel] == "1")
							{
								value = this.getNextValue(type, null, 0);
							} else {
								value = this.getNextValue(type, type, startValues[indentLevel]-1);
							}
							if (parent.is('ol'))
							{
								var hasPrevious = false;
								if (listValues[indentLevel])
								{
									if (listValues[indentLevel] != 0)
										value = listValues[indentLevel];
									hasPrevious = true;
								} else {
									var previous = this.getFollowedListItem(item, info, true);
									if ( previous != null)
									{
										value = this.getListItemValue(previous);
										hasPrevious = true;
									}
								}
								if (hasPrevious && itemClass && itemClass!= "" && itemClass != "lst-header")
								{
									value = this.getNextValue(type, value);
								}
							}
						}
						this.setListItemValue(item, value, showLevel);
						listValues[indentLevel] = value;
						if (itemClass && itemClass != "lst-header")
						{
							if (newItemClass != itemClass)
								this.setListClass(item, newItemClass);
							var k = ++indentLevel;
							for (; k < listValues.length; k++)
							{
								if (!listValues[k] || listValues[k] != 0 )
									listValues[k] = 0;
								else
									break;
							}
						}
						if (marginClass) item.setAttribute('_list', marginClass);
//						if (itemClass)
//						{
//							if (tabstops && indentLevel < tabstops.length)
//							{
//								item.setAttribute('_firststop',  tabstops[indentLevel]);
//							} else {
//								item.removeAttribute('_firststop');
//							}
//							this.setListSpacer(item);
//						}
					}
				}
				if (CKEDITOR.env.webkit)
				{
					//Defect 5792, try to let Safari re-render this list
					var dummyitem = doc.createElement('p');
					dummyitem.insertBefore(list);
					list.insertBefore(dummyitem);
					dummyitem.remove();
				}
				
			}
			if (CKEDITOR.env.webkit)
			{
				//Defect 5792, try to let Safari re-render this list
				ranges[0].moveToBookmark(bm);
				ranges[0].select();
			}
			CKEDITOR.dom.element.clearAllMarkers( database );
			//LISTUTIL.updateListShow(info);
			//setTimeout(function () {LISTUTIL.updateListShow(info);}, 0);
		}

		return node;
	},
	// caller should make sure the node is <li>
	getHeadingInListItem : function (node)
	{
		var heading = null;
		var first = node.getFirst();
		while (concord.text.tools.isAnchor(first))
				first = first.getNext();
		if (MSGUTIL.isHeading(first))
			heading = first;
		return heading;
	},
	getListClass2: function(cls)
	{
		var regxAtt = [];
		regxAtt[0] = /lst-[a-zA-Z0-9_\-]+/g;
		regxAtt[1] = /[A-Za-z0-9_]+(_[0-9]+)+(\s|$)|lst-[a-zA-Z0-9_\-]+/g;
		for(var i = 0; i < regxAtt.length; i++)
		{	
			var regx = regxAtt[i];
			var match = cls && cls.match(regx);
			if ( match )
			{
				for ( var j = 0; j < match.length; j++ )
				{	
					return CKEDITOR.tools.trim(match[j]);
				}
			}
		}
	},
	
	getListClass : function ( node )
	{
		var regx;
		var target = node;
		if (MSGUTIL.isList(node))
		{
			regx = /lst-[a-zA-Z0-9_\-]+/g;
		} else {
			if (MSGUTIL.isListItem(node))
			{
				var heading = this.getHeadingInListItem(node);
				if (heading != null)
					target = heading;
			}
			regx = /[A-Za-z0-9_]+(_[0-9]+)+(\s|$)|lst-[a-zA-Z0-9_\-]+/g;
		}
		var listClass = null;
		var cls = target.getAttribute('class');
		var match = cls && cls.match(regx);
		if ( match )
		{
			for ( var j = 0; j < match.length; j++ )
			{	
				listClass =  CKEDITOR.tools.trim(match[j]);
				break;
			}
		}
		return listClass;
	},
	removeListClass : function ( node )
	{
		var listClass = this.getListClass(node);
		var acts = [];
		if (listClass != null && listClass != "")
		{
			var heading = null;
			if (MSGUTIL.isListItem(node))
			{
				heading = this.getHeadingInListItem(node);
			}
			if (heading != null)
			{
				var oldCSS = heading.getAttribute("class");
				heading.removeClass(listClass);
				var newCSS = heading.getAttribute("class");
				acts.push (SYNCMSG.createAttributeAct( heading.getId(), {"class":newCSS}, {} + ';',{"class":oldCSS},{}));
			} else {
				var oldCSS = node.getAttribute("class");
				node.removeClass(listClass);
				var newCSS = node.getAttribute("class");
				acts.push(SYNCMSG.createAttributeAct( node.getId(), {"class":newCSS}, {} + ';',{"class":oldCSS},{}));
			}
		}
		return acts;
	},
	removeAllListClass : function(node)
	{
		var acts = [];
		var listClass = this.getListClass(node);
		while(listClass != null && listClass != "")
		{
			acts = acts.concat(this.removeListClass(node));
			listClass = this.getListClass(node);
		}
		
		return acts;
	},
	getFirstStop : function ( node )
	{
		
		if (MSGUTIL.isList(node) && node.hasAttribute('_firststop'))
		{
			return node.getAttribute('_firststop').split(',');
		} else if (MSGUTIL.isListItem(node))
		{
			var item = null;
			var heading = this.getHeadingInListItem(node);
			if (heading)
			{
				item = heading;
			} else {
				item = node;
			}
			if (item.hasAttribute('_firststop'))
				return item.getAttribute('_firststop');
		}
		return null;
	},
	setListSpacer : function ( node )
	{
		var item = null;
		var heading = this.getHeadingInListItem(node);
		if (heading)
		{
			item = heading;
		} else {
			item = node;
		}
		var first = item.getFirst();
		while (MSGUTIL.isBookMark(first))
			first = first.getNext();
		if (!MSGUTIL.isListSpacer(first))
		{
			first = this.createListSpacer(node.getDocument());
			first.appendTo(item, true);
		}
		return first;
	},
	setListClass : function (node, css)
	{
		var acts = []; 
		if (MSGUTIL.isListItem(node))
		{
			acts = acts.concat(this.removeListClass(node));
			var heading = this.getHeadingInListItem(node);
			if (heading)
			{
				var oldCSS = heading.getAttribute("class");
				heading.addClass(css);
				var newCSS = heading.getAttribute("class");
				acts.push(SYNCMSG.createAttributeAct( heading.getId(), {"class":newCSS}, {} + ';',{"class":oldCSS},{}));
			} else {
				var oldCSS = node.getAttribute("class");
				node.addClass(css);
				var newCSS = node.getAttribute("class");
				acts.push(SYNCMSG.createAttributeAct( node.getId(), {"class":newCSS}, {} + ';',{"class":oldCSS},{}));
			}
		} else if (MSGUTIL.isList(node))
		{
			acts = acts.concat(this.removeListClass(node));
			var oldCSS = node.getAttribute("class");
			node.addClass(css);
			var newCSS = node.getAttribute("class");
			acts.push(SYNCMSG.createAttributeAct( node.getId(), {"class":newCSS}, {} + ';',{"class":oldCSS},{}));
		}
		return acts;
	},
	setMarginClass : function (node, css)
	{
		if (MSGUTIL.isList(node))
		{
			if (!node.hasClass(css))
			{
				var regx = /[A-Za-z0-9_]+(_[0-9]+)+(\s|$)/g;
				var cls = node.getAttribute('class');
				var match = cls && cls.match(regx);
				if ( match )
				{
					for ( var j = 0; j < match.length; j++ )
					{	
						node.removeClass(CKEDITOR.tools.trim(match[j]));
					}
				}
				node.addClass(css);
			}
		}
	},
	getStartValues : function (node)
	{
		var values = null;
		if (MSGUTIL.isList(node))
		{
			var start = node.getAttribute('starts');
			if (start && start != "")
				values = start.split(',');
		}
		return values;
	},
	getOutlineInfo : function (node)
	{
		var infos = null;
		var str = null;
		var isHeadingOutline = false;
		if(typeof node == 'string')
		{
			str = node;
			isHeadingOutline = true;
		}
		else if(typeof node == 'object')
		{
			if (!MSGUTIL.isList(node))
				return null;
			str = node.getAttribute('types');
		}
		
		if (str == null || str == "")
		{
			return this.getDefaultOutline(isHeadingOutline || node.is('ol'));
		} else {
			infos = str.split(':');
			for (var i = 0; i < infos.length; i++)
			{
				infos[i] = infos[i].split(',');
				if (infos[i][0] == "")
				{
					infos[i][2] = "ol";
				} else {
					if (infos[i][0][0] == "\\")
					{
						infos[i][0] = this.unicode2char(infos[i][0]);
						infos[i][2] = "ul";
					} else {
						if (infos[i][0].match(/^url.*/g))
						{
							infos[i][2] = "ul";
						} else {
							switch (infos[i][0]) {
							case "lst-c":
							case "lst-a":
							case "lst-d":
							case "lst-da":
							case "lst-ta":
							case "lst-ra":
							case "lst-ps":
							case "lst-cs":
							case "lst-cm":
								infos[i][2] = "ul";
								break;
							default:
								infos[i][2] = "ol";
								break;
							}
						}
					}
				}
				if (infos[i][1] == "")
				{
					infos[i][1] = 1;
				} else {
					infos[i][1] = parseInt(infos[i][1]);
				}
			}
		}
		return infos;
	},
	getDefaultOutline : function (ol)
	{
		if (ol)
			return [["lst-n", "1", "ol"],["lst-la", "1", "ol"],["lst-lr", "1", "ol"],["lst-n", "1", "ol"],["lst-la", "1", "ol"],["lst-lr", "1", "ol"],["lst-n", "1", "ol"],["lst-la", "1", "ol"],["lst-lr", "1", "ol"],["lst-n", "1", "ol"]];
		else 
			return [["lst-c", "1", "ul"],["lst-d", "1", "ul"],["lst-cs", "1", "ul"],["lst-c", "1", "ul"],["lst-d", "1", "ul"],["lst-cs", "1", "ul"],["lst-c", "1", "ul"],["lst-d", "1", "ul"],["lst-cs", "1", "ul"],["lst-c", "1", "ul"]];
	},
	writeOutlineInfo : function (node, outline)
	{
		var str = "";
		if (outline)
		{
			str = (outline[0][2] == "ol" ? outline[0][0] : this.char2unicode(outline[0][0])) + "," + outline[0][1];
			for (var i = 1; i < outline.length; i++)
			{
				str = str + ":" + (outline[i][2] == "ol" ? outline[i][0] : this.char2unicode(outline[i][0])) + "," + outline[i][1];
			}
		}
		if (node) node.setAttribute('types', str);
		return str;
	},
	
	
	/** Get the bullet class array from node's bullet outline type
	 * @name LISTUTIL.getBulletClassesFromOutlineType
	 * @function
	 * @param {CKEDITOR.dom.node|String} node The bullet node(li) or type 
	 * @param {Number}level The bullet level, start from 0
	 * @example 
	 *  var type = 'lst-n,1:lst-c,2:lst-n,3:lst-n,4:lst-n,5:lst-n,6:lst-n,7:lst-n,8:lst-n,9:,';
	 *  var bulletClasses = LISTUTIL.getBulletClassesFromOutlineType(type);
	 *  Return result bulletClasses = [lst-n, lst-c, lst-n, lst-n,lst-n, lst-n, lst-n, lst-n, lst-n];
	 *  
	 *  var bulletClasses = LISTUTIL.getBulletClassesFromOutlineType(type, null, 1);
	 *  Return result bulletClasses = [lst-c];
	 */
	getBulletClassesFromOutlineType : function (node, listClass, level)
	{
		var bulletClasses = [];
		var outlineInfo = this.getOutlineInfo(node);
		
		if(level && level >= 0)
			bulletClasses.push( this.getListItemClassFromOutline(outlineInfo, listClass, level) );
		else
		{
			for(var i = 0; i < outlineInfo.length; i++)
				bulletClasses.push( this.getListItemClassFromOutline(outlineInfo, listClass, i) );
		}	
		
		return bulletClasses;
	},
	
	getBulletTagByClass : function(listClass)
	{
		var tag = "ol";
		switch (listClass) {
		case "lst-c":
		case "lst-a":
		case "lst-d":
		case "lst-da":
		case "lst-ta":
		case "lst-ra":
		case "lst-ps":
		case "lst-cs":
		case "lst-cm":
			tag = "ul";
			break;
		default:
			tag = "ol";
			break;
		}
		return tag;
	},
	getListItemClassFromOutline : function (outline, listClass, indent)
	{
		if (indent >= outline.length)
			indent = outline.length-1;
		var css = outline[indent][0];
		if (!css.match(/^lst-[a-z].*/g)) // it's a converted list
		{
			css = listClass.split('-').pop() + '_' + (indent+1);
		}
		return css;
	},
	getMarginClassFromOutline : function (outline, listClass, indent)
	{
		var css = null;
		if (indent >= outline.length)
			indent = outline.length-1;
		var str = listClass.split('-').pop();
		//if (!str.match(/[A-Z]{4}/g))
		{
			css = str + '_' + (indent+1);
		}
		return css;
	},
	unicode2char : function (str)
	{
		var result = str;
		if (str[0] == '\\')
		{
			var t = '%u' + str.slice(1);
			result = unescape(t);
		}
		return result;
	},
	char2unicode : function (str)
	{
		var result = str;
		if (str.length == 1)
		{
			var code = str.charCodeAt(0);
			//if (code > 127)
			{
				result = code.toString(16);
				while (result.length < 4)
					result = "0" + result;
				result = "\\" + result;
			}
		}
		return result;
	},
	
	/**
	 * @param {Boolean} bUpdateOutline If change document's outline information
	 * When the user has no selection. the bUpdateOutline was true 
	 */ 
	changeListStyle : function (node, style, outlineInfo, bUpdateOutline)
	{
		if (MSGUTIL.isListItem(node))
				node = node.getParent();
		var info = this.getWholeListInfo(node);
		var lists = info.lists;
		var header = info.header;
		
		var msgs=[];
		var outlinestr;
		var tmp_attributes = {}; 
	 	var tmp_oldatts = {};
		if(outlineInfo && outlineInfo != "")
		{
			outlinestr = outlineInfo;
			var oldType =header.getAttribute('types') || "" ;
			// Same bullet type
			if(outlinestr == oldType)
				return msgs;
			tmp_oldatts.types=oldType;
		 	header.setAttribute('types', outlinestr);
		 	
		 	if(bUpdateOutline)
		 	{
		 		var body = node.getDocument().getBody();
		 		var oldAtts = {'types' : body.getAttribute('types')};
				var newAtts = {'types' : outlinestr};
				var act = SYNCMSG.createAttributeAct(body.getId(), newAtts, null, oldAtts, null);
				msgs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]));
				// Update body type
				body.setAttribute('types', outlinestr);
		 	}	
		}
		else
		{	
			var outline = this.getOutlineInfo(header);
			var indent = this.getIndentLevel(node);
			var type = this.convertToListType(style);
			outline[indent] = [style, "1"];
			switch (style) {
			case "lst-c":
			case "lst-a":
			case "lst-d":
			case "lst-da":
			case "lst-ta":
			case "lst-ra":
			case "lst-ps":
			case "lst-cs":
			case "lst-cm":
				outline[indent][2] = "ul";
				break;
			default:
				outline[indent][2] = "ol";
				break;
			}
		 	
		 	var oldType = header.getAttribute('types') || "";
		 	tmp_oldatts.types = oldType;
			outlinestr=this.writeOutlineInfo(header, outline);
			
			if(bUpdateOutline)
		 	{
				var body = node.getDocument().getBody();
				var oldBodyType = body.getAttribute('types');
				var bulletClass = body.getAttribute('bulletclass');
				if(outlinestr != oldBodyType && header.hasClass(bulletClass))
				{	
			 		var oldAtts = {'types' : oldBodyType};
					var newAtts = {'types' : outlinestr};
					var act = SYNCMSG.createAttributeAct(body.getId(), newAtts, null, oldAtts, null);
					msgs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]));
					// Update body type
					body.setAttribute('types', outlinestr);
				}
		 	}
		}
		tmp_attributes.types= outlinestr;
		
		var act =SYNCMSG.createAttributeAct( header.getId(),tmp_attributes,null,tmp_oldatts, null );
		var msg=SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]);
		msgs.push(msg);
		info.currentIndex = 0;
		this.updateListValue(header, info);
		act= SYNCMSG.createUpdateListValueAct(header,info);
		msg = SYNCMSG.createMessage(MSGUTIL.msgType.List, [act]); 
		msgs.push(msg);
		return msgs;
	},
	breakParent : function (parent, from, to)
	{
		var doc =  parent.getDocument();
		var range = new CKEDITOR.dom.range(doc);
		var newElements = {};
		var start = from, 
			end = to;
		//var start = doc.createElement('span');
		//start.insertBefore(parent);
		var listItemParent = start.getParent().getParent();
		while ( MSGUTIL.isListItem(listItemParent) && LISTUTIL.getListClass(listItemParent) == null && start.equals(start.getParent().getFirst()) )
		{
			start = listItemParent;
			listItemParent = start.getParent().getParent();
		}
		// We'll be extracting part of this element, so let's use our
		// range to get the correct piece.
		var items = parent.$.querySelectorAll('li');
		if (items[0] == start.$)
			start = null;
		
		if (to != null )
		{
			for (var i = 0; i< items.length; i++)
			{
				if (items[i] == to.$)
				{
					if (i == items.length-1)
					{
						end = null;
					} else {
						end = new CKEDITOR.dom.element(items[i+1]);
					}
					break;
				}
			}
		}
		
		if (start != null)
		{
			range.setStartBefore(parent);
			var startParent = start.getParent();
			while (start.equals(startParent.getFirst()))
			{
				start = startParent;
				startParent = start.getParent();
			}
			range.setEndBefore(start);
			var docFrag1 = range.extractContents(true);
			
			var item = from.getAscendant('li');
			while (MSGUTIL.isListItem(item))
			{
				LISTUTIL.removeListClass(item);
				item = item.getParent().getParent();
			}
			
			docFrag1.insertBefore( parent );
			newElements.start = parent.getPrevious();
		}
		if (end != null)
		{
			end.addClass("breakParentEndTag");
			range.setStartBefore(end);
			range.setEndAfter( parent );
			// Extract it.
			var docFrag2 = range.extractContents(true);
			
			end = new CKEDITOR.dom.element(docFrag2.$.querySelector('li.breakParentEndTag'));
			end.removeClass('breakParentEndTag');
			item = end.getAscendant('li');
			while (MSGUTIL.isListItem(item))
			{
				LISTUTIL.removeListClass(item);
				item = item.getParent().getParent();
			}	
			docFrag2.insertAfterNode( parent );
			newElements.end  =  parent.getNext();
		}
		return newElements;
	},
	updateBrokenList : function (info, createdListHeader, listclass)
	{
		var updateList = null;
		var msgPairs = [];
		var lists = info.lists;
		for (var i = 0; i < info.currentIndex; i++)
		{
			var list = lists[i];
			if (list.getParent() && (!listclass || LISTUTIL.getListClass(list) == listclass))
			{
				updateList = list;
				break;
			}
		}
		if (updateList == null)
		{
			if (createdListHeader)
				updateList = createdListHeader;
		}

		if (updateList == null)
		{
			for (var i = info.currentIndex; i < info.lists.length; i++)
			{
				var list = lists[i];
				if (MSGUTIL.isBlockInDomTree(list) && (!listclass || LISTUTIL.getListClass(list) == listclass))
				{
					updateList = list;
					break;
				}
			}
		}
		if (updateList) 
		{
			var oldClassValue= updateList.getAttribute("class")||"";
			var oldTypeValue = updateList.getAttribute("types")||"";
			if (!info.header.continues) // if the header has continue class, then we don't remove it; support private document.
				updateList.removeClass('continue');
			if (info.outline && info.outline != "")
			{
				updateList.setAttribute('types', info.outline);
			}
			var newClassValue = updateList.getAttribute("class")||"";
			var newTypeValue = updateList.getAttribute("types")||"";
			var acts = [];
			acts.push(SYNCMSG.createAttributeAct( updateList.getId(),{"class":newClassValue, "types":newTypeValue},{},{"class":oldClassValue, "types":oldTypeValue}, {} ));
			msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, acts));
			LISTUTIL.updateListValue(updateList);
			var act = SYNCMSG.createUpdateListValueAct(updateList, null, true);
			msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.List, [act]));
		}
		return msgPairs;
	},
	// After invoke breakParent function, 
	// always need send message to update newElements.start and newElements.end bullet
	updateBreakElements : function(newElements, list)
	{
		if (!newElements)
			return [];
		
		var act, acts = [];
		
		var fixIndex = handleSelectAllForFF(list);
		var parentNode = list.getParent();
		var updateList;
		if (newElements.start)
		{
			updateList = newElements.start;
			act = SYNCMSG.createInsertElementAct(newElements.start.getIndex()-fixIndex, parentNode, newElements.start);
			acts.push(act);
		}
		list.removeClass('continue');

		// TODO it's a callback
		// sometimes is delete it or change to other element.
		act = SYNCMSG.createInsertElementAct(list.getIndex()-fixIndex, parentNode, list);
		acts.push(act);
		////
		
		if (newElements.end)
		{
			if (newElements.start == null)
				updateList = newElements.end;
			else {
				newElements.end.addClass('continue');
			}
			act = SYNCMSG.createInsertElementAct(newElements.end.getIndex()-fixIndex, parentNode, newElements.end);
			acts.push(act);
		}
		if (updateList)
		{
			this.updateListValue(updateList);
			//TODO: need to send coedit message here 
			act= SYNCMSG.createUpdateListValueAct(updateList);
			//msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.List, [act]));
			acts.push(act);
		}
		
		return acts;
	},
	
	// When the rtl is true, the mergeBlockParent will be removed from DOM
	mergeListSibling : function(mergeBlockParent,rtl)
	{
		var acts = [];
		if(!mergeBlockParent || mergeBlockParent.type != CKEDITOR.NODE_ELEMENT)
			return acts;
		
		var curBlock = rtl ? mergeBlockParent.getPrevious() : mergeBlockParent;
		var nextSibling = rtl ? mergeBlockParent : mergeBlockParent.getNext();
		
		// Have no valid sibling
		if(rtl && (!curBlock || curBlock.type != CKEDITOR.NODE_ELEMENT))
			return acts;
		else if(!rtl && (!nextSibling || nextSibling.type != CKEDITOR.NODE_ELEMENT))
			return acts;
		
		var cls = this.getListClass(curBlock) || '';
		var sibCls = this.getListClass(nextSibling) || '';
		if ( cls == sibCls && curBlock.getName() == nextSibling.getName() )
		{
			acts.push(SYNCMSG.createDeleteBlockElementAct(nextSibling) );
			nextSibling.remove();
			var child;
			while( child = nextSibling.getFirst())
			{
				curBlock.append(child);
				acts.push( SYNCMSG.createInsertBlockElementAct(child) );
			}
		}	
		return acts;
	},
	getListClassId : function (css)
	{
		var suffix = "";
		if ( css )
		{
			var temp = css.split('-').pop();
			if (!temp.match(/[A-Z]{4}/g))
			{
				suffix = "-" + temp;
			}
		}
		var s=[];
		var k = 4;
		for (var i=0; i<k; i++)
		{
			s[i] = String.fromCharCode(parseInt(Math.random()*25) + 65);
		}
		return "lst-" + s.join("") + suffix;
		
	},
	hasOutLine:function()
	{
		return  CKEDITOR.instances.editor1.document.getBody().getAttribute('bulletClass')!=null;
	},
	isOutlineBullet : function(node)
	{
//		var body = node.getDocument().getBody();
		// In copy paste case, the node wasn't in DOM tree
		var body = pe.lotusEditor.document.getBody();
//		var nodeType = node.getAttribute('types');
		var bodyType = body.getAttribute('types');
		var bulletClass = body.getAttribute('bulletclass') || '';
		
		if(node.hasClass(bulletClass) || node.hasAttribute('bulletclass'))
			return true;
		
		return false;
	},
	isNativeBulletClass: function( cls )
	{
		switch( cls )
		{
			case "lst-c":
			case "lst-a":
			case "lst-d":
			case "lst-da":
			case "lst-ta":
			case "lst-ra":
			case "lst-ps":
			case "lst-cs":
			case "lst-cm":
			case "lst-ur" : 
			case "lst-lr" : 
			case "lst-uap" : 
			case "lst-ua" : 
			case "lst-lap":
			case "lst-la" :
			case "lst-n":
			case "lst-n2":
			case "lst-np":
			case "lst-j1":
			case "lst-j2":
				return true;
			default:
				return false;
		}
	},

	updateListClassMap: function( doc , add )
	{
		if( !this.listClassTypeMap || add)
		{
			if(!this.listClassTypeMap)
				this.listClassTypeMap = {};
			
			 var lists = dojo.query( 'ol[types],ul[types]', doc.$ );
			 var list, li, cls;
		     for(var i=0; i <lists.length; i++)
		     {
		     	list = new CKEDITOR.dom.element(lists[i]);
		        cls = this.getListClass(list);
		         if( !this.listClassTypeMap[cls] )
		         	this.listClassTypeMap[cls] = this.getOutlineInfo(list);
		     }
		}
	},
	getOutlineFromMap : function ( cls )
	{
		return this.listClassTypeMap && this.listClassTypeMap[cls];
	},
	// because user may choose to work privately in task, so we need set outline to ul in task
	fixListInTask : function (task)
	{
		var acts = [];
		if (task && task.$)
		{
			var processed =  {};
			var selector = 'ol[class],ul[class]';
			var siblings = [];
			var headingOutline = task.getDocument().getBody().getAttribute('bulletclass');
			var rawLists = task.$.querySelectorAll(selector);
			for (var i = 0; i < rawLists.length; i++)
			{
				if (rawLists[i].parentNode.nodeName.toLowerCase() != "li")
				{
					var list = new CKEDITOR.dom.element(rawLists[i]);
					var listclass = this.getListClass(list);
					if (listclass == headingOutline)
					{
						list.setAttribute('bulletclass', "true");
						acts.push(SYNCMSG.createAttributeAct( list.getId(),{"bulletclass":"true"},{},{"bulletclass":""}, {} ));
					}
					if (!processed[listclass] && list.hasClass('continue'))
					{
						var info = this.getWholeListInfo(list);
						processed[listclass] = info;
						var oldTypeValue = list.getAttribute("types")||"";
						if (info.outline && info.outline != "")
						{
							list.setAttribute('types', info.outline);
						} else {
							this.writeOutlineInfo(list, this.getDefaultOutline(list));
						}
						var newTypeValue = list.getAttribute("types")||"";
						acts.push(SYNCMSG.createAttributeAct( list.getId(),{"types":newTypeValue},{},{"types":oldTypeValue}, {} ));
					}
				
				}					
			}
		}
		return acts;
	},
	updateListId:function(node){
		var isSpan = function(node){
			if(node.is && node.is("span")){
				return true;
			}
			return false;
		};
		var html = node.getHtml();	
		node.setAttribute("id",MSGUTIL.getUUID());
		
		//id_4ac7139b7a7388a
		var ids1 = html.match(/id_\w{8}-[\w]{5}/g)||[];
		var ids2 = html.match(/id_\w{13,}/g)||[];
		var ids = ids1.concat(ids2);	
		if(ids==null || ids.length==0){
			return;
		}
		for(var i =0; i< ids.length;i++){
			var id = ids[i];
			var tmpnode = node.$.querySelector("#"+id);
			if(tmpnode==null){
//				console.info("error");
				continue;
			}
			tmpnode = new  CKEDITOR.dom.element(tmpnode);
			if(isSpan(tmpnode)){
				continue;
			}
			tmpnode.setAttribute("id",MSGUTIL.getUUID());
		}
//		console.info("update node id");
	},
	updateListShow : function(info) {
		if (info && info.header)
		{
			var maxCount = 500;
			if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
				maxCount = 10;
			var lists = info.lists;
			var updateListItem = function(lists, listsIndex, items, itemsIndex) {
				var count = 0;
				for (var i = listsIndex; i < lists.length; i++)
				{
					var list = lists[i];
					if (!items)
					{
						items = list.$.querySelectorAll('li');
						itemsIndex = 0;
					}
					for (var j = itemsIndex; j < items.length; j++)
					{
						if (count > maxCount)
						{
							setTimeout(function () {updateListItem(lists, i, items, j);}, 500);
						} else {
							var item = new CKEDITOR.dom.element(items[j]);
							var itemClass = LISTUTIL.getListClass(item);
							if (itemClass)
							{
								LISTUTIL.updateListItemShow(item);
							}
							count++;
						}
					}
				}
			};
			updateListItem(lists, info.currentIndex);
		}
	},
	/* caculate the list spacer's width, the caller must make sure the node is a <li> item and this item has 
	 * invalid list class.
	 */
	updateListItemShow: function(node) {
		{
			
			var marginleft = 0;
			var textindent = 0;
			var parent = node;
			var firststop = null;
			var tabstop = Math.round(CKEDITOR.tools.CmToPx(1.27));
			var listSpacer = this.setListSpacer(node);
			while (parent && MSGUTIL.isListItem(parent))
			{
				marginleft += parseFloat(parent.getComputedStyle('margin-left'));
				if (textindent == 0)
					textindent = parseFloat(parent.getComputedStyle('text-indent'));
				parent = parent.getParent(); // for ol / ul
				marginleft += parseFloat(parent.getComputedStyle('margin-left'));
				if (textindent == 0)
					textindent = parseFloat(parent.getComputedStyle('text-indent'));
				parent = parent.getParent();
			}
			if (CKEDITOR.env.ie)
			{
				textindent = CKEDITOR.tools.CmToPx(textindent);
				marginleft = CKEDITOR.tools.CmToPx(marginleft);
			}
			textindent = Math.round(textindent);
			marginleft = Math.round(marginleft);
			var bulletlength = listSpacer.$.offsetLeft - textindent - node.$.offsetLeft;
			firststop = this.getFirstStop(node);
			if (firststop)
			{
				firststop = parseFloat(firststop);
				firststop = Math.round(CKEDITOR.tools.CmToPx(firststop));
			} else {
				var indent = this.getIndentLevel(node);
				firststop = Math.round(CKEDITOR.tools.CmToPx(0.635)) + tabstop*indent;
			}
			var position = marginleft + textindent + bulletlength;
			if (position <= firststop )
			{
				size = firststop - position;
			} else {
				size = tabstop - position % tabstop;
			}
			var offset = CKEDITOR.tools.PxToCm( size + bulletlength ) + 'cm';
			listSpacer.setStyle('width', CKEDITOR.tools.PxToCm(size)+'cm');
			node.setAttribute('offset', offset);
			//notify tab plugin to update tabs in li
			setTimeout(function(){
				var dummymsg = {};
				dummymsg.as = [];
				dummymsg.as.push({tid: node.getId()});
				pe.lotusEditor.fire("arrangeTab", dummymsg);
			},0);
			return;
		}
	},
	createListSpacer : function(document) {
		
		return document.createElement('img', { 'attributes': { 'class' : 'listSpacer noSrcAttr', 'unselectable' : 'on'}});
		
	},

	getOriginBulletOfRestarted : function (node)
	{
		if (MSGUTIL.isList(node))
		{
			var lstClass = this.getListClass(node);
			if(lstClass && lstClass.length > 6 && (lstClass.indexOf("-",5))!=-1)
			{
				var oLstClass = 'lst' + lstClass.substring(lstClass.indexOf("-",5));
				var oLsts = pe.lotusEditor.document.$.querySelectorAll('ol.'+oLstClass +',ul.'+oLstClass);
				for(var i=0;i<oLsts.length;i++)
				{
					if(oLsts[i].getAttribute("types")) return new CKEDITOR.dom.element(oLsts[i]);
				}
			}
		}
		return;
	},

	getConcordListType : function(standardType)
	{
		if(!standardType) return;
		var type;
		switch (standardType) {
		case "upper-roman" :
			type = ["lst-ur","1","ol"];
			break;
		case "lower-roman" : 
			type = ["lst-lr","1","ol"];
			break;
		case "upper-alpha" :
		case "upper-latin" :
			type = ["lst-ua","1","ol"];
			break;
		case "lower-alpha":
		case "lower-latin" :			
			type = ["lst-la","1","ol"];
			break;
		case "decimal":
		case "cjk-ideographic":
		case "armenian":
		case "decimal-leading-zero":
			type = ["lst-n","1","ol"];
			break;
		case "disc" :
			type = ["lst-c","1","ul"];
			break;	
		case "square" :
			type = ["lst-da","1","ul"];
			break;
		case "katakana-iroha":
		case "hiragana-iroha":
			type = ["lst-j1","1","ul"];
			break;
		case "katakana":
		case "hiragana":
			type = ["lst-j2","1","ul"];
			break;
		};
		
		return type;
	},

	getStandardListType : function (type,node)
	{
		type = escape(type);
		var standardType;
		switch (type) {
		case "lst-ur" :
		case "I":		
			standardType = "upper-roman";
			break;
		case "i":			
		case "lst-lr" : 
			standardType="lower-roman";
			break;
		case "lst-ua" :
		case "lst-uap" :
		case "A":			
			standardType = "upper-alpha";
			break;
		case "a":			
		case "lst-la" :
		case "lst-lap":
			standardType="lower-alpha";
			break;
		case "1":
		case "lst-n":
		case "lst-n2":			
		case "lst-np":	
			standardType = "decimal";
			break;
		case "lst-c" : 
			standardType = "disc";
			break;	
		case "lst-da" :
			standardType = "square";
			break;
		case "イロハ":
		case "ｲﾛﾊ":
		case "lst-j1":
			standardType = "katakana-iroha";
			break;
		case "アイウ":
		case "ｱｲｳ":
		case "lst-j2":
			standardType = "katakana";
			break;
		};

		if(!standardType && node)
			standardType = (node.is('ol'))?"decimal":"disc";

		return standardType;
	}
});
(function() {
	if (typeof LISTUTIL == "undefined")
		LISTUTIL = new concord.text.ListUtil();
})();
