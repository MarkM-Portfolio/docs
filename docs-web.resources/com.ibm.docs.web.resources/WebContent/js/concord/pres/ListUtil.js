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

dojo.provide("concord.pres.ListUtil");
dojo.declare("concord.pres.ListUtil", null, {
	NOT_HANDLED : 0,
	HANDLED_CONTENT_CHANGED : 1,
	HANDLED_CONTENT_NO_CHANGE : 2,
	m_hyperlinkRemoveFlags:[],
	m_hyperlinkStoreMap:[],
	A :{ 
		values:[ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",	"O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z" ],
		valueMap:{"A":0, "B":1, "C":2, "D":3, "E":4, "F":5, "G":6, "H":7, "I":8, "J":9, "K":10, "L":11, "M":12, "N":13,	"O":14, "P":15, "Q":16, "R":17, "S":18, "T":19, "U":20, "V":21, "W":22, "X":23, "Y":24, "Z":25 },
		getIndex:function(value){
			value =String(value);
			var k = value.length;
			value= value[0];
			return this.valueMap[value]+26*(k-1);
		},
		//From 0
		getValue:function(index){
			var k = Math.floor(index / 26);
			index = index%26;
			var value = this.values[index%26];
			var kk = k+Math.floor(index / 26);
			var ret=value;
			for(var j=0;j<kk;j++){
				ret= ret+value;
			}
			return ret;
		},
		getNextValue:function(currentValue,offset){
			var index = this.getIndex(currentValue);
			return this.getValue(index+offset);
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
		//From 0
		getValue:function(index){
			var k = Math.floor(index / 26);
			index = index%26;			
			var value = this.values[index%26];
			var kk = k+Math.floor(index / 26);
			var ret=value;
			for(var j=0;j<kk;j++){
				ret= ret+value;
			}
			return ret;
		},
		getNextValue:function(currentValue,offset){
			var index = this.getIndex(currentValue);
			return this.getValue(index+offset);
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
		//From 0
		getValue:function(index){
			var ret ;
				var idx =index;
				if(idx < this.values.length){
					ret = this.values[idx];
				}else{
					ret = this.convertRom(idx+1);
				}
			return ret;	
		},
		getNextValue:function(currentValue,offset){
			var index = this.valuesMap[currentValue];
			if(index ==null || index<0 ||index> 127){
				index = this.convertFromRom(currentValue);
			}
			return this.getValue(index+offset);
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
		//From 0
		getValue:function(index){
			var idx =index;
			if(idx < this.values.length){
					return this.values[idx];
			}else{
				return this.convertRom(idx+1);
			}			
		},
		getNextValue:function(currentValue,offset){
			var index = this.valuesMap[currentValue];
			if(index ==null || index<0 ||index> 127){
				index = this.convertFromRom(currentValue);
			}
			return this.getValue(index+offset);
		}
	},
	J1 :{		
		values:[ "イ", "ロ", "ハ", "ニ", "ホ", "ヘ", "ト", "チ", "リ", "ヌ", "ル", "ヲ", "ワ", "カ", "ヨ", "タ", "レ", "ソ", "ツ", "ネ", "ナ", "ラ", "ム", "ウ", "ヰ", "ノ", "オ", "ク", "ヤ", "マ", "ケ", "フ", "コ", "エ", "テ", "ア", "サ", "キ", "ユ", "メ", "ミ", "シ", "ヱ", "ヒ", "モ", "セ", "ス", "ン" ],
		valueMap:{"イ":0, "ロ":1, "ハ":2, "ニ":3, "ホ":4, "ヘ":5, "ト":6, "チ":7, "リ":8, "ヌ":9, "ル":10, "ヲ":11, "ワ":12, "カ":13, "ヨ":14, "タ":15, "レ":16, "ソ":17, "ツ":18, "ネ":19, "ナ":20, "ラ":21, "ム":22, "ウ":23, "ヰ":24, "ノ":25, "オ":26, "ク":27, "ヤ":28, "マ":29, "ケ":30, "フ":31, "コ":32, "エ":33, "テ":34, "ア":35, "サ":36, "キ":37, "ユ":38, "メ":39, "ミ":40, "シ":41, "ヱ":42, "ヒ":43, "モ":44, "セ":45, "ス":46, "ン":47 },
		getIndex:function(value){
			value =String(value);
			return this.valueMap[value];
		},
		//From 0
		getValue:function(index){
			var nextIndex = index % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		},
		getNextValue:function(currentValue,offset){
			var index = this.getIndex(currentValue);
			return this.getValue(index+offset);
		}
	},
	J2 :{ 
		values:[ "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン" ],
		valueMap:{"ア":0,"イ":1,"ウ":2,"エ":3,"オ":4,"カ":5,"キ":6,"ク":7,"ケ":8,"コ":9,"サ":10,"シ":11,"ス":12,"セ":13,"ソ":14,"タ":15,"チ":16,"ツ":17,"テ":18,"ト":19,"ナ":20,"ニ":21,"ヌ":22,"ネ":23,"ノ":24,"ハ":25,"ヒ":26,"フ":27,"ヘ":28,"ホ":29,"マ":30,"ミ":31,"ム":32,"メ":33,"モ":34,"ヤ":35,"ユ":36,"ヨ":37,"ラ":38,"リ":39,"ル":40,"レ":41,"ロ":42,"ワ":43,"ヲ":44,"ン":45 },
		getIndex:function(value){
			value =String(value);
			return this.valueMap[value];
		},
		//From 0
		getValue:function(index){
			var nextIndex = index % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		},
		getNextValue:function(currentValue,offset){
			var index = this.getIndex(currentValue);
			return this.getValue(index+offset);
		}
	},
	N:{
		//From 0
		getValue:function(index){
			var ret = "";
			var val = index+1;
			ret += val;
			return ret;	
		},
		getNextValue:function(currentValue,offset){
			var index = parseInt(currentValue);
			return this.getValue(index+offset);
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
		} else if (type == 'j1' || type == 'イロハ' || type == 'ｲﾛﾊ') {
			base = this.J1;
		} else if (type == 'j2' || type == 'アイウ' || type == 'ｱｲｳ'){
			base = this.J2;
		}
		return base;
	},
	getValue : function(type, currentValueIndex) {
		var ret = "";
		var base = this.getBaseType(type);
		if (currentValueIndex == 0)
		{
			ret = base.values ? base.values[0] : 1 ;
		} else {
			ret = base.getValue(currentValueIndex);
		}
		return ret;
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
	
	convertToListBaseType : function ( style)
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
	
	//in some case, the bookmark node will be inserted into the line HTML structure
	//return <li><p> or null, input <ol><ul><p>
	getLineItem:function(_line)
	{
		var line = PresCKUtil.ChangeToCKNode(_line);
		if((!line) || (!line.is) || (!line.is('ol','ul','p','li')))
			return null;
		
		if(line.is('p','li'))
			return line;
		
		//in some case, the bookmark node will be inserted into the line HTML structure
		var tliItem = dojo.query('li',line.$);
		tliItem = tliItem[0];
		tliItem = PresCKUtil.ChangeToCKNode(tliItem);
		if((!tliItem) || (!tliItem.is) || (!tliItem.is('li')))
			return null;
		
		return tliItem;
	},
	
	//Get the previous of next line
	//in case of any node which be inserted between to lines
	//such as <textnode> or <bookmark>
	//input <ol><ul><p>,output <ol><ul><p>
	_getNeighborLine:function(_CKLine,bPrevious)
	{
		var lineIndex = _CKLine.getIndex();
		var parentNode = _CKLine.getParent();
		if(!parentNode || !parentNode.is)
			return null;
		for(var i = lineIndex+(bPrevious?-1:1);
		(bPrevious?i>=0:i<parentNode.getChildCount());
		(bPrevious?i--:i++))
		{
			var node = parentNode.getChild(i);
			if(node.is && node.is('ol','ul','p'))
			{
				return node;
			}
		}

		return null;
	},
	
	//return {numberType,listClass,startNumber,level}
	getNumberingKeyValue : function(curLine)
	{
		var numberType = curLine.getAttribute( 'numberType' );
		var liItem = PresListUtil.getLineItem(curLine);
		var lc = PresListUtil.getListClass(liItem);
		//var listClass = lc?lc.listClass:null;
		var startNumber = parseInt(liItem.getAttribute('startNumber'),10);
		var level = parseInt(liItem.getAttribute('level'),10);
		
		return {numberType:numberType,
			listClassGroup:lc,
			startNumber:startNumber,
			level:level
		};
	},
	
	_isListClassEquals : function(lc_A,lc_B,bIgnorInlineClass)
	{
		 function compareStr(a,b){
			 if ( a < b )
			 return 1;
			 if ( a > b )
			 return -1;
			 return 0; // a == b
		}
		
		function _sortListClass(lc)
		{
			for(var p in lc)
			{
				if(lc[p])
				{
					lc[p].sort(compareStr);
				}
			}
		}
		
		_sortListClass(lc_A);
		_sortListClass(lc_B);
		
		if(!bIgnorInlineClass)
		{
			if(!(lc_A.inlineClass.toString() == lc_B.inlineClass.toString()))
				return false;
			if(!(lc_A.listMRClass.toString() == lc_B.listMRClass.toString()))
				return false;
		}
		
		// if there is inline list class, justify whether it's the same
		// if there is no inline list class, justify whether the master list style is the same
		var list_style_same = false;
		if (lc_A.listClass.toString().length >0) {
			if (lc_B.listClass.toString().length >0 &&
					lc_A.listClass.toString() == lc_B.listClass.toString()) {
				list_style_same = true;
			} else {
				list_style_same = false;
			}
		} else {
			if (lc_B.listClass.toString().length == 0 &&
					lc_A.masterListClass.toString() == lc_B.masterListClass.toString()) {
				list_style_same = true;
			} else {
				list_style_same = false;
			}
		}
		return list_style_same;

	},
	
	
	//Get next continue line, if not find, return null
	getNeighborNumberingContinueLine : function(curLine,bGetPreviousLine)
	{
		var numberInfo = PresListUtil.getNumberingKeyValue(curLine);
		//in some case, the bookmark node will be inserted into the line HTML structure
		var tmpLine = PresListUtil._getNeighborLine(curLine, bGetPreviousLine);
		while(tmpLine && (!tmpLine.is('ol','ul','p')))
		{
			tmpLine = PresListUtil._getNeighborLine(curLine, bGetPreviousLine);
		}
		if(!tmpLine)
			return null;
		//
		for(;tmpLine;
		tmpLine = PresListUtil._getNeighborLine(tmpLine, bGetPreviousLine))
		{			
		
			var tNumberInfo = PresListUtil.getNumberingKeyValue(tmpLine);
			if(numberInfo.level>tNumberInfo.level)
				break;//break condition [2] : a numbering line with higher level
			if(numberInfo.level<tNumberInfo.level)//ignore the level which bigger than current level 
				continue;
			//For hidden list, we ignore it
			var tmpLineItem = PresListUtil.getLineItem(tmpLine);		
			if(tmpLineItem.hasClass("sys-list-hidden"))
				continue;
			if(!tmpLine.is('ol'))//break condition [1] : same level but not numbering line
				break;
			
			if((numberInfo.numberType==tNumberInfo.numberType)
					&&(numberInfo.startNumber==tNumberInfo.startNumber)
					&&(PresListUtil._isListClassEquals(numberInfo.listClassGroup,tNumberInfo.listClassGroup,true))
							)
			{
				return tmpLine;
			}
			else 
				break;//break condition [3] : same level, but has different numbering
			
		}
		return null;
	},
	
	//return a group of line list, each list contain some line which should continue in numbering 
	_getContinueListLines : function(rootNode)
	{
		var lines = [];
		var lineProcessed = [];
		var children = rootNode.getChildren();
		var lastLevel = null;
		for ( var i = 0, count = children.count(); i < count; i++ )	
		{
			var curline = children.getItem( i );
			//If this line already be handled, continue
			if(lineProcessed[curline.getIndex()])
				continue;
			//For hidden list, we ignore it
			var tmpLineItem = PresListUtil.getLineItem(curline);
			if(tmpLineItem.hasClass("sys-list-hidden"))
				continue;
			if(curline.is('ol'))
			{	
				var continueLine = [];
				while(curline)
				{
					continueLine.push(curline);
					lineProcessed[curline.getIndex()] = true;
					curline = PresListUtil.getNeighborNumberingContinueLine(curline);
				}

				lines.push(continueLine);
			}
			else if(curline.is('ul','p'))
			{
				//do nothing
			}
			else
			{
				//debugger;
				//Must has illegal node in lines!
			}
		}
		return lines;
	},
	
	updateMasterStyles : function(rootNode)
	{
		if (!rootNode || rootNode == null)
			return;
		
		var ckNode = PresCKUtil.ChangeToCKNode(rootNode);
		dojo.query('li,p',rootNode.$).forEach(function(_node){
			// update master
			var ckLineItem = PresCKUtil.ChangeToCKNode(_node);
			
			var parentNode = ckLineItem.getParent();
			parentNode = PresCKUtil.ChangeToCKNode(parentNode);
			PresListUtil.removeListClass(ckLineItem,true,true,true,false);
			if(parentNode.is('ol'))
			{
				parentNode.setAttribute('numberType','1');
				ckLineItem.addClass('lst-n');
			}
			else if(parentNode.is('ul'))
			{
				ckLineItem.addClass('lst-c');
			}		
			PresListUtil._removeDefaultFlagForODF(ckLineItem, true, true);
			PresCKUtil.updateRelativeValue(ckLineItem);
			PresListUtil.prepareStylesforILBefore(ckLineItem);
		});
		
		dojo.query('div.draw_frame_classes',rootNode.$).forEach(function(_node){
			var ckDiv = PresCKUtil.ChangeToCKNode(_node);
			PresListUtil.updateListValue(ckDiv);
		});
	},
	

	
	/* UpdateListValue for presentation list
	 * rootNode must be div/table, div is the parent of lines
	 * */
	updateListValue : function(rootNode)
	{
		function _updateListValueForOneRoot(root)
		{
			var lineLists = PresListUtil._getContinueListLines(root);
			var conLines = lineLists.pop();
			while(conLines)
			{	
				if( conLines.length > 0 )
				{
					var numberType = conLines[0].getAttribute( 'numberType' );
					var liItem = PresListUtil.getLineItem(conLines[0]);
					var startNumber = parseInt(liItem.getAttribute('startNumber'),10);
					for(var i=0;i<conLines.length;i++)
					{
						var v = PresListUtil.getValue(numberType,startNumber+i-1);
						var li = PresListUtil.getLineItem(conLines[i]);
						li.setAttribute('values', v);
					}
				}			
				conLines = lineLists.pop();
			}
		};
		
		if(!rootNode)
		{
			//Must have rootNode
			//debugger;
			return;
		}
		if(rootNode.is('div','td','th'))				
			_updateListValueForOneRoot(rootNode);
		else if(rootNode.is('table'))
		{
			var tdList = dojo.query('td,th',rootNode.$);
			for(var i=0;i<tdList.length;i++)
			{
				var node = PresCKUtil.ChangeToCKNode(tdList[i]);
				_updateListValueForOneRoot(node);
			}
		}
		
	},

	//Stop using editor.getSelectedTableCells( editor);
	//This function could get select cells without change any structrure
	//
	getSelectedTableCells : function(selection)
	{
		function _getCurrCell(currElement)
		{
			if (currElement.type == CKEDITOR.NODE_TEXT){
				currElement = currElement.getParent();
			}
			while(!currElement.is('td', 'th', 'caption'))
			{
				currElement = currElement.getParent();
				if(!currElement)
					return null;
			}
			var currCell = null;
			if(currElement.is('td','th','caption'))
				currCell = currElement.getAscendant(currElement.getName(),true);
			return currCell;
		}
		   if (selection.getSelection){
			   selection = selection.getSelection();
		   }
	   	
	   		// Walker will try to split text nodes, which will make the current selection
			// invalid. So save bookmarks before doing anything.
		   // Since the cell is block element, let walk only go through block elements, not the text nodes.
		   var database = {};
		   var selectedCells = [];
		   var commonAncestor = null;
	   	
		   var ranges = selection.getRanges();
		   for (var i=0; i<ranges.length; i++)
		   {
		   		var range = ranges[ i ].clone();
		 	   
			   // For IE. if it is the first selected cell, find the ascendant cell
			   if(range.collapsed)
			   {
				   //fix for 34785, range-->ranges[i]
				   var selNode;
				   if (range.startContainer.type == CKEDITOR.NODE_TEXT 
						   || range.startContainer.getChildCount() ==0 ){
					   selNode = range.startContainer;
				   }else if (range.startOffset < range.startContainer.getChildCount()){
					   selNode =  range.startContainer.getChild(range.startOffset);
				   }else{
					   selNode =  range.startContainer.getChild(range.startContainer.getChildCount()-1);
				   }
				   if (selNode){
					   selNode = _getCurrCell(selNode);
				   }
				   if (selNode != null)
					   selectedCells.push(selNode);
			   }
			   // for all following selected cells
			   else
			   {
		   		
			   		var endElement = range.endContainer;
			   		if (endElement.getChild && range.endOffset>0){
			   			endElement = endElement.getChild(range.endOffset-1);
			   		}
			   		
			   		if (!endElement.contains){
			   			//endElement is a text
			   			endElement = endElement.getParent();
			   		}
				   		

					var tdevaluator = function(node) {
						if (node.is && node.is('tr', 'table', 'tbody')) {
							if (node.contains(endElement)
									|| node.equals(endElement)
									|| endElement.contains(node)) {
								return true;
							}

							var tds = node.$.querySelectorAll('td , th , caption');
							for ( var i = 0; i < tds.length; i++) {
								selectedCells.push(new CKEDITOR.dom.node(tds[i]));
							}

							// query td directly
							return CKEDITOR.dom.walker.IGNORE_CHILDREN;
						}
						else if( MSGUTIL.isBlock(node) )	// Only check block element
						{
							if(node.is('p', 'ol', 'ul', 'li') || MSGUTIL.isHeading(node) )
								return CKEDITOR.dom.walker.IGNORE_CHILDREN;
							else
								return true;
						}
						else
							return CKEDITOR.dom.walker.IGNORE_CHILDREN;
					};
						
					// Change the range startContainer and endContainer to block element.
					var start = range.startContainer;
					if( !MSGUTIL.isBlock(start) )
					{
						// Select the startContainer's block element's last child.
						var pBlock = MSGUTIL.getBlock(start);
						range.startContainer = pBlock;					
						range.startOffset = pBlock.getLast() ? pBlock.getChildCount() - 1 : 0;
					}
					var end = range.endContainer;
					if( !MSGUTIL.isBlock(end) )
					{
						// Select the endContainer's block element's last child.
						var pBlock = MSGUTIL.getBlock(end);
						range.endContainer = pBlock;					
						range.endOffset = pBlock.getLast() ? pBlock.getChildCount() - 1 : 0;
						
						if(range.startContainer.equals(range.endContainer))
						{   
							var curSelNode = _getCurrCell(range.startContainer);
						   if (curSelNode != null)
							   selectedCells.push(curSelNode);
						   continue;
						}
					}
					var endParents = range.endContainer.getParents();
					var moveOutOfCellGuard = function( node, moveOut )
					   {
							if(moveOut && MSGUTIL.containsElement2(endParents, node))
							{
								return false; // stop guard
							}
							
							// Apply to the first cell only.
							if ( selectedCells.length > 0 )
							{
								return;
							}
		
							// If we are exiting from the first </td>, then the td should definitely be
							// included.
							if ( node.type == CKEDITOR.NODE_ELEMENT && node.is('td','th','caption') 
									&& !node.getCustomData( 'selected_cell' ))
							{
								CKEDITOR.dom.element.setMarker( database, node, 'selected_cell', true );
								selectedCells.push( node );
								commonAncestor = commonAncestor || node;
							}
						};
					
			   		var walker = new CKEDITOR.dom.walker( range );
					var node;
					walker.guard = moveOutOfCellGuard;
					walker.evaluator = tdevaluator;

					var oldVal = CKEDITOR.IGNORE_SHAPE;
					CKEDITOR.IGNORE_SHAPE = false;
					try{
					while ( ( node = walker.next() ) )
					{
						// If may be possible for us to have a range like this:
						// <td>^1</td><td>^2</td>
						// The 2nd td shouldn't be included.
						//
						// So we have to take care to include a td we've entered only when we've
						// walked into its children.

						// Reduce the get ascendant times.
						var ascendant = node.getAscendant('table') && (node.getAscendant('td') || node.getAscendant('th') ||node.getAscendant('caption')) ;
						if ( ascendant &&  !ascendant.getCustomData( 'selected_cell' ) )
						{
							CKEDITOR.dom.element.setMarker( database, ascendant, 'selected_cell', true );
							
							if( !commonAncestor )
							{
								commonAncestor = ascendant;
								selectedCells.push( ascendant );
							}
							else
							{	
								// The ascendant was the common ancestor, it should be an outer cell. Just ignore it.
								commonAncestor = ascendant.getCommonAncestor(commonAncestor);
								if( !ascendant.equals(commonAncestor) )
									selectedCells.push( ascendant );
							}
						}
					}
					}catch(e){}
					CKEDITOR.IGNORE_SHAPE = oldVal;
			   }
		   }
		   
		   	CKEDITOR.dom.element.clearAllMarkers( database );

		   return selectedCells;
	},
	
	//Ugly code, requested by ODF convertion
	//to remove default line style tag for odf file
	_removeDefaultFlagForODF:function(_liNode, removeoldStyleName, removeoldlevel)
	{
		if(!_liNode.is('li','ol','ul','p'))
		{
			return;
		}
		var liNode =_liNode.is('ol','ul')?_liNode.getFirst():_liNode;
		if (removeoldStyleName != false)
			liNode.removeAttribute('_oldstylename');
		if (removeoldlevel != false)
			liNode.removeAttribute('_oldlevel');
	},

	
	getListBeforeClass: function ( _liNode,keepClass)
	{
		_liNode = PresCKUtil.ChangeToCKNode(_liNode);
		if(!_liNode.is('li','ol','ul'))
		{
			//debugger;
			return "";
		}
		var liNode =_liNode.is('ol','ul')?PresListUtil.getLineItem(_liNode):_liNode;
		
		var listClassesString = dojo.attr( liNode.$, 'class');
		if (listClassesString == undefined || listClassesString == null){
			listClassesString = " ";
		}
		var listClasses = listClassesString.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
			if ( listClasses[j].match(/^IL_CS_/)){
				!keepClass && dojo.removeClass( liNode.$, listClasses[j]);
				return listClasses[j];
			}
		return "";
	},

	removeListBeforeClass: function ( _liNode)
	{
		_liNode = PresCKUtil.ChangeToCKNode(_liNode);
		if(!_liNode.is('li','ol','ul'))
		{
			//debugger;
			return "";
		}
		var liNode =_liNode.is('ol','ul')?PresListUtil.getLineItem(_liNode):_liNode;
		
		var listClassesString = dojo.attr( liNode.$, 'class');
		if (listClassesString == undefined || listClassesString == null){
			listClassesString = " ";
		}
		var listClasses = listClassesString.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
			if ( listClasses[j].match(/^IL_CS_/)){
				PresCKUtil.removeFromListBeforeStyleSheet(listClasses[j]);
				dojo.removeClass( liNode.$, listClasses[j]);
			}
	},
	
	removeListClass: function ( _liNode,bRemoveList, bRemoveInline, bRmoveMaster, bRemoveHidden)
	{
		if(!_liNode.is('li','ol','ul','p'))
		{
			//debugger;
			return;
		}
		if(!(bRemoveList||bRemoveInline||bRmoveMaster||bRemoveHidden))
			return;
		
		var liNode =_liNode.is('ol','ul')?PresListUtil.getLineItem(_liNode):_liNode;
		
		var listClassesString = dojo.attr( liNode.$, 'class');
		if (listClassesString == undefined || listClassesString == null){
			listClassesString = " ";
		}
		var listClasses = listClassesString.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
			if ((bRemoveList&&listClasses[j].match(/^lst-/)) 
				||(bRmoveMaster&&(listClasses[j].match(/^ML_/)))
				||(bRmoveMaster&&(listClasses[j].match(/^MP_/)))
				||(bRmoveMaster&&(listClasses[j].match(/^MT_/)))
				||(bRemoveInline&&(listClasses[j].match(/^IL_/)))
				||(bRemoveHidden&&(listClasses[j].match(/^sys-list-hidden/)))) {
					dojo.removeClass( liNode.$, listClasses[j]);
			}
	},
	
	//Check whether the line has "lst-" class
	isCustomedLine : function (_line)
	{
		var regx = /^lst-/g;
		var regxLst_MR = /^lst-MR-/g;
		var lineItem = PresListUtil.getLineItem(_line);
		if(!lineItem)
			return null;
		var cls = lineItem.getAttribute('class');
		if (cls == undefined || cls == null){
			cls = " ";
		}
		var listClasses = cls.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
		{
			if ( listClasses[j].match(regx) 
					&& !(listClasses[j].match(regxLst_MR)))
			{
				return true;
			}
		}
		return false;
	},
	
	//Presentation use get list class
	//return is object,contain list class inline class and masgter class
	//node is li,ou,ol,p
	getListClass : function ( liNode )
	{
		var regx = [/^IL_/g,/^lst-/g,/^MP_/g,/^ML_/g,/^MT_/g];
		var regxLst_MR = /^lst-MR-/g;
		var listClass = [];
		var listMRClass = [];
		for(var r=0 ; r<regx.length; r++)
		{
			var tl = [];
			listClass[r]=tl;
		}
		
		if(!liNode || !liNode.is)
			return "";
		
		if(!liNode.is('li','ol','ul','p'))
		{
			//debugger;
			return "";
		}
		var target = liNode.is('li','p')?liNode:liNode.getFirst();
		
		var cls = target.getAttribute('class');
		
		if (cls == undefined || cls == null){
			cls = " ";
		}
		var listClasses = cls.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
		{
			if ( listClasses[j].match(regxLst_MR) )
			{
				listMRClass.push(listClasses[j]);
			}
			else
			{
				for(var r=0 ; r<regx.length; r++)
					if ( listClasses[j].match(regx[r]) 
							&& !(listClasses[j].match(regxLst_MR)))
					{
						listClass[r].push(listClasses[j]);
					}
			}
		}

		return {
			inlineClass:listClass[0],///^IL_/g,
			listClass:listClass[1],///^lst-/g,
			listMRClass:listMRClass,///^lst-MR/g
			masterParagraphClass:listClass[2],///^MP_/g,
			masterListClass:listClass[3],//^ML_/g,
			masterTextClass:listClass[4]//^MT_/g
			
		};
	},
	//This function will clone <sampleLine> list struture
	//and change the <line> as the same strcture
	//but it will kept IL style
	changeListByCloneListStyle:function(sampleLine, line)
	{
		//for a paragraph currently we only change to default ol/ul node
		if(line.is('p'))
			line = PresListUtil.createList(line,null,'ul');
		
		var lc = PresListUtil.getListClass(line);
		var cloneNewLine = sampleLine.clone();//clone OL,UL
		
		var neighborliNode =PresListUtil.getLineItem(sampleLine);
		var cloneLi  = neighborliNode.clone();//Clone LI
		cloneNewLine.append(cloneLi);
		
		var liNode =PresListUtil.getLineItem(line);
		//move Child under li
		liNode.moveChildren( cloneLi );
		
		//recover inline class
		PresListUtil.removeListClass(cloneLi,false,true,false,true);
		for(var i=0;i<lc.inlineClass.length;i++)
			cloneLi.addClass(lc.inlineClass[i]);
		
		if(line.getParent())
			cloneNewLine.insertBefore(line);
		dojo.destroy(line.$);
		line = cloneNewLine;
		return cloneNewLine;
	},
	
	IndentOutdentLines:function (lineList,isIndent,editor)
	{
		for(var i=0;i<lineList.length;i++)
		{
			 //This is a flag, try to mark which line is moved or not
			var line = PresCKUtil.ChangeToCKNode(lineList[i]);
			line.setAttribute("new_action_line",true);
		}
		pe.scene.slideSorter.newlistBeforeStyleStack = {};
		var needUpdate = false;
		for(var i=0;i<lineList.length;i++)
		{
			needUpdate = true;
			PresListUtil._indentOutdentOneLine(lineList[i],isIndent,editor);
		}
		
		if(needUpdate){
			PresCKUtil.doUpdateListStyleSheet();
		}

		var dfc = PresCKUtil.ChangeToCKNode(PresCKUtil.getDFCNode());
		if(dfc)
		{
			dojo.query('[new_action_line=true]',dfc.$).forEach(function(_node){
				var line = PresCKUtil.ChangeToCKNode(_node);
				line.removeAttribute("new_action_line");
			});
		}
	},		

	//return the neighbor line of same level
	//Note : bCrossLevel could allow the search cross the level boundary
	//such as 
	/*
	*       <a>
	*    <b>
	*       <C>
	*   if bCrossLevel is true, while search for <a> it could get <C>, otherwise it get nothing
	*/
	getNeighborListLine : function(line, bPrevious,bCrossLevel)
	{
		var neighborLine  = PresListUtil._getNeighborLine(line,bPrevious);
		while(neighborLine)
		{//in case of multi line selection
			if(neighborLine.hasAttribute('new_action_line'))
					neighborLine  = PresListUtil._getNeighborLine(neighborLine,bPrevious);
			else
			{
				var numberInfo = PresListUtil.getNumberingKeyValue(line);
				var neighborInfo = null;
				if(neighborLine && neighborLine.is('ol','ul'))
				{
					neighborInfo = PresListUtil.getNumberingKeyValue(neighborLine);
					if(numberInfo.level == neighborInfo.level)
					{
						return neighborLine;
					}
					else if(numberInfo.level < neighborInfo.level || bCrossLevel)
						neighborLine  = PresListUtil._getNeighborLine(neighborLine,bPrevious);
					else 
						return null;
				}
				else
					return null;
			}
		}
		
		return null;
	},
	
	_indentOutdentOneLine:function (listNode,isIndent,editor)
	{
		// Returns the CSS property to be used for identing a given element.
		function getIndentCssProperty( element, dir )
		{
			return ( dir || element.getComputedStyle( 'direction' ) ) == 'ltr' ? 'margin-left' : 'margin-right';
		}
		
		function _getComputedMargin(listElement,textboxAbsWidth,level)
		{
			var marginString = (listElement.getStyle('direction') === 'rtl') ? PresConstants.STYLES.MARGINRIGHT : PresConstants.STYLES.MARGINLEFT;
			var marginSpace = dojo.getComputedStyle(listElement.$)[marginString];//return is px or %
			if(marginSpace.indexOf('px')>0)
			{
				marginSpace = CKEDITOR.tools.toCmValue(marginSpace)*1000.0;
			}
			else if(marginSpace.indexOf('%')>0)
			{
				marginSpace = PresCKUtil._percentToFloat(marginSpace);
				marginSpace = textboxAbsWidth * marginSpace;
			}
			else // could not get right value, we need use default value, 
			{
				marginSpace = CKEDITOR.config.indentOffset*(level-1);
			}
			return marginSpace;
		}
		
		if(!listNode.is)
			return;
		if(!listNode.is('ol','ul','p'))
			return;
		if(!editor)
			editor = PresCKUtil.getCurrentEditModeEditor();
		//We want to get <li> or <p>
		var listElement = listNode.is('ol','ul')?listNode.getFirst():listNode;

		var level = parseInt(listElement.getAttribute('level'),10);
		var newLevel=level+(isIndent?1:-1);
		if(newLevel<=0)
			newLevel = 1;
		if(newLevel>=9)
			newLevel = 9;
		if(newLevel == level)
			return;
		level = newLevel;
		listElement.setAttribute('level',level);
		if(listElement.is('li')){
			dijit.setWaiState(listElement,'level', level);
		}
		
		var textboxInfo = PresCKUtil.getCurrentTextboxInfo(listElement);
	
		//Change Class if it in placeholder
		var masterClass = PresCKUtil.getMasterClass(listElement,level);
		var newlistElement = PresCKUtil.setMasterClass(listElement,masterClass);
		if(newlistElement)
		{
			listElement = newlistElement;
			listNode = listElement.is('p')?listElement:listElement.getParent();
		}
			
		//========================================
		//Calculate the indent space
		var customIndentSpace = null;
		customIndentSpace = PresCKUtil.getCustomStyle(listElement,PresConstants.ABS_STYLES.MARGINLEFT);
		customIndentSpace = parseInt(customIndentSpace);
		if(isNaN(customIndentSpace))
		{
			customIndentSpace = null;
			PresCKUtil.removeCustomStyle(listElement,PresConstants.ABS_STYLES.MARGINLEFT);			
		}
		
		//Fix custome indent==================================
		if(customIndentSpace == null)
		{
			var bNeedFix = false;
			
			if(textboxInfo.isPlaceholder&&(!masterClass)//[Critical error 1] it is placeholder, but not find master class, and no custom style
				|| PresListUtil.isCustomedLine(listElement)//[Critical error 2] it is customed list, but not find  custom style
				|| (!textboxInfo.isPlaceholder) && listElement.is('p')//[Critical error 3] it is paragraph not in placeholder, but not find  custom style
				//D37647 [Critical error 4] it is placeholder, and find master class, but not find  ABS_STYLES.MARGINLEFT from master
				|| (textboxInfo.isPlaceholder && masterClass 
						&& !PresCKUtil.getAbsModuleValue(masterClass.paragraphClass,PresConstants.ABS_STYLES.MARGINLEFT))
				)
				bNeedFix = true;
			
			if(bNeedFix)
			{
				customIndentSpace = _getComputedMargin(listElement,textboxInfo.absWidth,level);		
				PresCKUtil.setCustomStyle(listElement,PresConstants.ABS_STYLES.MARGINLEFT,customIndentSpace);				
			}
		}
		
		if(customIndentSpace!=null)
		{
			//Get current indent offset
			customIndentSpace = parseInt(customIndentSpace);
			if(!customIndentSpace || isNaN(customIndentSpace))
				customIndentSpace = _getComputedMargin(listElement,textboxInfo.absWidth,level);
			var newIndentOffset = CKEDITOR.config.indentOffset*(isIndent?1:-1)+customIndentSpace;
			PresCKUtil.setCustomStyle(listElement,PresConstants.ABS_STYLES.MARGINLEFT,newIndentOffset);
		}
		
		//=================================================
		//Change list style or numbering attribute
		//Our rule here is that, 
		//if we indent/outdent one numbering line,it will has the same list properties as its neighbor list
		//should check whether the target level previous OR next line also has list, 
		//if has, it should follow the target list
		if( listNode.is('ol','ul'))
		{
			//First get the previous line
			var neighborLine = PresListUtil.getNeighborListLine(listNode,true);
			//if not exist or not same list tye
			//then get the next line
			if(!neighborLine || (neighborLine.getName()!=listNode.getName()))
				neighborLine  = PresListUtil.getNeighborListLine(listNode,false);
			
			//If we not find, we try use the cross level search, since we want get a right intent for this list
			var bOnlyForIndentSearch = false;
			//For D42013 stop using cross level search that will make the indent seems clear
//			if(!neighborLine)
//			{
//				//First get the previous line
//				neighborLine = PresListUtil.getNeighborListLine(listNode,true,true);
//				//if not exist or not same list tye
//				//then get the next line
//				if(!neighborLine || (neighborLine.getName()!=listNode.getName()))
//					neighborLine  = PresListUtil.getNeighborListLine(listNode,false,true);
//				if(neighborLine)
//					bOnlyForIndentSearch = true;
//			}
				
			if(neighborLine)
			{

				var neighborNumberInfo = PresListUtil.getNumberingKeyValue(neighborLine);
				if((!bOnlyForIndentSearch)&&neighborLine.is('ol') && listNode.is('ol'))
				{					
					listNode.setAttribute( 'numberType', neighborNumberInfo.numberType);
					PresListUtil.removeListClass(listElement,true,false,!textboxInfo.isPlaceholder);
					//lst-class
					for(var i=0;i<neighborNumberInfo.listClassGroup.listClass.length;i++)
						listElement.addClass(neighborNumberInfo.listClassGroup.listClass[i]);
					if(!textboxInfo.isPlaceholder)
					{
						for(var i=0;i<neighborNumberInfo.listClassGroup.masterParagraphClass.length;i++)
							listElement.addClass(neighborNumberInfo.listClassGroup.masterParagraphClass[i]);
						for(var i=0;i<neighborNumberInfo.listClassGroup.masterListClass.length;i++)
							listElement.addClass(neighborNumberInfo.listClassGroup.masterListClass[i]);
						for(var i=0;i<neighborNumberInfo.listClassGroup.masterTextClass.length;i++)
							listElement.addClass(neighborNumberInfo.listClassGroup.masterTextClass[i]);
					}
					listElement.setAttribute( 'startNumber', neighborNumberInfo.startNumber);
				}
				
				//we should has the same margin/indent as neighbor line
				//Marging-right class
				var cls = listElement.getAttribute('class');
				if (cls == undefined || cls == null){
					cls = " ";
				}
				var listClasses = cls.split(' ');
				for ( var j = 0 ; j < listClasses.length; j++)
				{
					if ( listClasses[j].match(/^lst-MR-/g))
						dojo.removeClass( listElement.$, listClasses[j]);
				}
				
				for(var i=0;i<neighborNumberInfo.listClassGroup.listMRClass.length;i++)
					listElement.addClass(neighborNumberInfo.listClassGroup.listMRClass[i]);
				
				var nbLi = PresListUtil.getLineItem(neighborLine);
				var nb_absMargin = PresCKUtil.getAbsoluteValue(nbLi,PresConstants.ABS_STYLES.MARGINLEFT);
				var cur_absMargin = PresCKUtil.getAbsoluteValue(listElement,PresConstants.ABS_STYLES.MARGINLEFT);
				if(nb_absMargin!=cur_absMargin)
					PresCKUtil.setCustomStyle(listElement,PresConstants.ABS_STYLES.MARGINLEFT,nb_absMargin);
				
				var nb_absIndent = PresCKUtil.getAbsoluteValue(nbLi,PresConstants.ABS_STYLES.TEXTINDENT);
				var cur_absIndent = PresCKUtil.getAbsoluteValue(listElement,PresConstants.ABS_STYLES.TEXTINDENT);
				if(nb_absIndent!=cur_absIndent)
					PresCKUtil.setCustomStyle(listElement,PresConstants.ABS_STYLES.TEXTINDENT,nb_absIndent);
				
			}
		}

		PresCKUtil.updateRelativeValue(listElement);
		//D33183: [Regression]List symbol color changed after indent/copy paste to other position
		PresListUtil.prepareStylesforILBefore(listElement);
	},
	
	modifyListStyleOrType : function(editor, lineList, targetListClass,type )
	{		
		for(var i=0;i<lineList.length;i++)
		{
			 //This is a flag, try to mark which line is moved or not
			var line = PresCKUtil.ChangeToCKNode(lineList[i]);
			line.setAttribute("new_action_line",true);
		}
		///////////////////////////////////////
		var firstLine = lineList[0];
		var actionType = "";
		if ( targetListClass)
		{
	    	if ( firstLine.is('ol','ul') )
	    		actionType = 'changeStyle';
	    	else 
	    		actionType = 'enableList';
	    }
		else
	    {
	    	//enable/disable
	    	//Disable numbering/bullet
	    	if ( firstLine.is('ol','ul') )
	    	{
	    		var curType = firstLine.$.nodeName.toLowerCase();
	    		
	    		if(type == curType)
	    			actionType = 'disableList';
	    		else 
	    			actionType = 'changeStyle';
	    	}
	    	else
	    		actionType = 'enableList';
	    }
		
		//We handle lines one by one
		for(var i=0;i<lineList.length;i++)
		{
			var curLine = lineList[i];
			switch(actionType)
			{
				case 'changeStyle' : 
				case 'enableList' : 
					if(curLine.is('p')){
						curLine = PresListUtil.createList(curLine, targetListClass,type );
						var tmpline = PresListUtil.getLineItem(curLine);
						tmpline.setAttribute("createList",true);
					}
					curLine = PresListUtil.changeListStyleAndType( curLine, targetListClass,type );
					break;
				case 'disableList' : 
					curLine = PresListUtil.disableList( curLine );
					break;
				default:break;
			}
			lineList[i] = curLine;
		}

  		pe.scene.slideSorter.newlistBeforeStyleStack = {};

		///////////////////////////////////////
		var dfc = PresCKUtil.ChangeToCKNode(PresCKUtil.getDFCNode());
		if(dfc)
		{
			dojo.query('[new_action_line=true]',dfc.$).forEach(function(_node){
				var line = PresCKUtil.ChangeToCKNode(_node);
				line.removeAttribute("new_action_line");
			});
		}
		
		for(var i=0;i<lineList.length;i++)
		{
			var line = PresCKUtil.ChangeToCKNode(lineList[i]);
			PresCKUtil.updateRelativeValue(line);
			line = PresListUtil.getLineItem(line);
			if(line.hasAttribute('createList')){
				line.removeAttribute('createList');
				PresListUtil.prepareStylesforILBefore(line,true);
			}else
				PresListUtil.prepareStylesforILBefore(line);
		}
		
		if(lineList.length){
			PresCKUtil.doUpdateListStyleSheet();
		}
	},
	
	//Change the list style of current line
	//input 'ol','ul'
	//return 'ol','ul'
	changeListStyleAndType:function(curLine, targetListClass,type,startNumber,numberType )
	{
		if(!curLine || !curLine.is 
				|| !curLine.is('ol','ul') 
				|| !curLine.getParent() 
				|| !curLine.getFirst())
		{
			//debugger;
			return curLine;
		}
        // if no style, then use default (based on list type)
		targetListClass = !targetListClass && CKEDITOR.plugins.liststyles.defaultListStyles ?
        CKEDITOR.plugins.liststyles.defaultListStyles[ type ] : targetListClass;
		var oldType = curLine.getName();
		if ( oldType != type ) {
            var newLine = new CKEDITOR.dom.element( type, curLine.getDocument() );
            MSGUTIL.generateID( newLine );
            concord.util.HtmlContent.injectRdomIdsForElement(newLine);
            dijit.setWaiRole(newLine, 'list');
            curLine.moveChildren( newLine, true );
            newLine.replace( curLine );
            curLine = newLine;
		}
		//
		var liNode = dojo.query('li',curLine.$);
		liNode = liNode[0];
		liNode = PresCKUtil.ChangeToCKNode(liNode);
		if((!liNode) || (!liNode.is) || (!liNode.is('li')))
			return curLine;
		liNode.removeClass('sys-list-hidden');
		liNode.removeClass('IL_Default_Hidden_4P');
		if((type == 'ol')&&(oldType == 'ul'))
		{
			//bullet change to numbering 
			//Add numbering attribute for nodes
			liNode.setAttribute('startNumber',startNumber?startNumber:'1');
		}
		else if((type == 'ul')&&(oldType == 'ol'))
		{
			//numbering change to bullet
			//remove numbering attribute for nodes
			curLine.removeAttribute('numberType');
			liNode.removeAttribute('values');
			liNode.removeAttribute('startNumber');
		}
		if(type == 'ol')
		{
			var tNT = numberType?numberType:PresListUtil.convertToListBaseType(targetListClass);
			var v = PresListUtil.getNextValue(tNT,1,0);
			curLine.setAttribute('numberType',tNT);
			liNode.setAttribute('values',v);
		}
		//also need remove text-indent
		liNode.removeStyle('text-indent');		
		if(!targetListClass.match(/^ML_/))
		{
			//remove old list class
			PresListUtil.removeListClass(liNode,true);
	        //add new list class
	        liNode.addClass(targetListClass);
		}
        
        PresListUtil._removeDefaultFlagForODF(liNode);
        concord.util.HtmlContent.injectRdomIdsForElement(liNode);
        return liNode.getParent();
	},
	
	//curline must be <p>
	createList:function(curLine, targetListClass,type,bNotUpdateMasterClass)
	{
		if(!curLine.is('p') 
				|| !curLine.getFirst() )
		{//curline must be <p>
			//debugger;
			return curLine;
		}
		
		//Create <ol/ul> node
		var newListLine = new CKEDITOR.dom.element(type);
		//Add class for <ol/ul>
		newListLine.addClass('concordList_Preserve');
        // if no style, then use default (based on list type)
		targetListClass = !targetListClass && CKEDITOR.plugins.liststyles.defaultListStyles ?
        CKEDITOR.plugins.liststyles.defaultListStyles[ type ] : targetListClass;
		if(type == 'ol')
		{
			var newBaseType = PresListUtil.convertToListBaseType(targetListClass);
			if(!newBaseType || newBaseType!=targetListClass)
				newListLine.setAttribute('numberType',newBaseType);
			else
			{
				//debugger;
				//This should not happen
				//If in this case, means "targetListClass" is not handled in PresListUtil.convertToListType
			}
		}
		//Create <li> node
		var listItem = new CKEDITOR.dom.element('li');
		concord.util.HtmlContent.injectRdomIdsForElement(listItem);
		newListLine.append( listItem );
		//level,style
		curLine.copyAttributes( listItem );
		//Remove old class, add current class
 		//The following code is set for real support master page
		PresListUtil.removeListClass(listItem,true,false);		
		PresListUtil._removeDefaultFlagForODF(listItem);
		listItem.addClass(targetListClass);
		var level = parseInt(listItem.getAttribute('level'),10);
		if(!level || isNaN(level))
			level = 1;
		dijit.setWaiRole(newListLine, 'list');
		dijit.setWaiRole(listItem, 'listitem');
		dijit.setWaiState(listItem,'level', level);
		
		if(!bNotUpdateMasterClass)
		{
			//Change Class if it in placeholder
			var masterClass = PresCKUtil.getMasterClass(listItem,level);
			if(masterClass)
			{
				var newlistItem = PresCKUtil.setMasterClass(listItem,masterClass);
				if(newlistItem)
				{
					listItem = newlistItem;
					newListLine = listItem.is('p')?listItem:listItem.getParent();
				}				
			}
		}


		if(type == 'ol')
		{
			//values
			listItem.setAttribute('values','1');
			//startNumber
			listItem.setAttribute('startNumber','1');
		}
		//move Child
		curLine.moveChildren( listItem );
		//insert before old line
		if(curLine.getParent())
			newListLine.insertBefore( curLine );
		//remove old line
		dojo.destroy(curLine.$);
		curLine = newListLine;
		concord.util.HtmlContent.injectRdomIdsForElement(listItem);
		concord.util.HtmlContent.injectRdomIdsForElement(curLine);
		return curLine;
	},
 	//
 	// Prepare the Syles list which will copy to LI Before Css class from frist visible span.
	// then call PresCKUtil.copyFirstSpanStyleToILBefore() do the really update.
	//	List character style contain font color, font size, font name, bold, italic
	//	List character style font size,bold, italic, will always follow first text character style after list character
	//	List character style color and font name only will be change when user set color or font name to it's follow text. 
	//  Change slide/table style which lead font color, font name change will  also apply to list character.
	//	Change list type, list style will not change, but fontName will be update for bullet
 	//
	prepareStylesforILBefore : function (listItem,withColor)
	{
		listItem = PresCKUtil.ChangeToCKNode(listItem);
		var node = PresCKUtil.getFirstVisibleSpanFromLine(listItem);
		if(node){
			node = PresCKUtil.ChangeToCKNode(node);
		 	var fontWeight = node.$.style.fontWeight;
			var fontStyle = node.$.style.fontStyle;
			var fontFamily = node.$.style.fontFamily;
			var color = node.$.style.color;
			var fontSize = node.$.style.fontSize;
			var computedStyle = dojo.getComputedStyle(node.$);
			var styles = [];
			
			if(fontSize && fontSize.length > 0){
				styles['font-size']= PresFontUtil.convertFontsizeToPT(fontSize);;
			} else {
				styles['font-size']= PresFontUtil.convertFontsizeToPT(computedStyle.fontSize);
			}
			
			if(fontWeight && fontWeight.length > 0){
				styles['font-weight']= fontWeight;
			} else {
				styles['font-weight']= '';
			}
			
			if(fontStyle && fontStyle.length > 0){
				styles['font-style']= fontStyle;
			} else {
				styles['font-style']= '';
			}
			
			if(fontFamily && fontFamily.length > 0){
				styles['font-family']= fontFamily;
			} else {
				styles['font-family']= '';
			}
			
			if(withColor){
				if(color && color.length > 0){
					styles['color']= color;
				} else {
					styles['color']= '';
				}
			}
			PresCKUtil.copyFirstSpanStyleToILBefore(listItem,styles,true);
		}
	},
	//Return the new line node
	disableList : function (LineNode)
	{
		if(!LineNode.is('ol','ul') || !LineNode.getFirst() ||!LineNode.getParent())
		{
			//curline must be <ol> or <ul>
			//debugger;
			return LineNode;
		}
		//create new <p>
		var listItem = PresListUtil.getLineItem(LineNode);
		listItem.removeClass('sys-list-hidden');
		listItem.removeClass('IL_Default_Hidden_4P');
		PresCKUtil.deleteILBeforeStyle(listItem);
		var newParaLine = new CKEDITOR.dom.element('p');
		//remove list class
		//need remove "lst-" & "IL_"
		var listClassesString = dojo.attr( listItem.$, 'class');
		if (listClassesString == undefined || listClassesString == null){
			listClassesString = " ";
		}
		var listClasses = listClassesString.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
			if (listClasses[j].match(/^lst-/)
				||listClasses[j].match(/^ML_/)
				) {
					dojo.removeClass( listItem.$, listClasses[j]);
			}
		
		var level = parseInt(listItem.getAttribute('level'),10);
		PresListUtil._removeDefaultFlagForODF(listItem);
		//move Child
		listItem.moveChildren( newParaLine );
		//Copy style
		listItem.copyAttributes( newParaLine );
		newParaLine.removeAttribute( 'values' );
		newParaLine.removeAttribute( 'startNumber' );
		dijit.removeWaiRole(newParaLine.$);
		dijit.removeWaiState(newParaLine.$, 'level');	
		//insert before old line
		newParaLine.insertBefore( LineNode );
		//remove old line
		dojo.destroy(LineNode.$);
		var masterClass = PresCKUtil.getMasterClass(newParaLine,level);
		if(masterClass)
		{
			var line = PresCKUtil.setMasterClass(newParaLine,masterClass);
			if(line)
			{
				newParaLine = line;
			}
		}
		concord.util.HtmlContent.injectRdomIdsForElement(newParaLine);
		return newParaLine;
	},

	//liNode is <p/ol/ul/li>
	_getLineInfo : function (liNode)
	{
		if(!liNode || !liNode.is('ol','ul','p','li'))
		{
			//Error!
			//debugger;
			return null;
		}
		var aline = liNode;
		var alineItem = null;
		var aIndex = -1;
		if(liNode.is('li'))
		{
			alineItem = liNode;
			aline = liNode.getParent();
			if(!aline.is('ol','ul'))
			{
				//Error!
				//debugger;
				return null;
			}
			aIndex = aline.getIndex();
		}
		else if(liNode.is('p'))
		{
			aline = liNode;
			alineItem = liNode;
			aIndex = liNode.getIndex();
		}
		else if(liNode.is('ol','ul'))
		{
			aline = liNode;
			alineItem = liNode.getFirst();
			if(!alineItem.is('li'))
			{
				//Error!
				//debugger;
				return null;
			}
			aIndex = liNode.getIndex();
		}
			
		return 	 {
			line : aline, //<P><ol><ul>
			lineItem : alineItem, //<P><li>
			index : aIndex
		};
	},
	
	//return the cursor position infomation in a line
	//cursorInfo.atLineStart = true, means cursor at the beginning of line
	//cursorIndo.atLineEnd = ture, means cursor at the end of line
	//If there are both true, means cursor at an empty line
	getCursorPosInfo : function (range)
	{
		if(!range.collapsed)
		{
			//debugger;
			return null;
		}
		var lineblock = MSGUTIL.getBlock(range.startContainer);
		
		var beLineStart = false;
		var beLineEnd = false;
		
		//In case it has some invisible <span> or <br>
		if(PresCKUtil.isNodeTextEmpty(lineblock))
		{
			beLineStart = true;
			beLineEnd = true;
		}
		else
		{
			beLineStart = range.checkStartOfBlock(true);
			beLineEnd = range.checkEndOfBlock(true);
		}
		if(!beLineStart && range.startOffset == 1 ){
			var selectInfo = PresListUtil.getListSelectionRangeInfo(range);
			if(selectInfo){
				var sel = selectInfo.startSelection;
				var	curNode = sel.focusSpan;
				if(sel.lineTextOffset == 1 && curNode.getText().charCodeAt(0) == 8203)
					beLineStart = true;
			}
		}
		return{
			atLineStart : beLineStart,
			atLineEnd : beLineEnd
		};
	},
	
	moveCursorToLine: function (range,bToStart)
	{
		if(!range.collapsed)
		{
			//debugger;
			return null;
		}
		var lineblock = MSGUTIL.getBlock(range.startContainer);
		if(bToStart)
			range.moveToElementEditStart(lineblock);
		else
			range.moveToElementEditEnd(lineblock);
		range.select();
	},
	
	//if return true the key event won't handle by browser
	onSystemKeyDown: function (keyCode,keyStroke)
	{
		function _CursorMove()
		{
			if(keyStroke in navigationKeyCodes)
			{
				var range = (ranges && ranges.length> 0)? ranges[0] : null;
				if (range!=null)
				{
					var cursorInfo = PresListUtil.getCursorPosInfo(range);
					if(cursorInfo && cursorInfo.atLineStart&& (keyStroke==37 || keyStroke==36))//arrow left, or home key
					{
						PresListUtil.moveCursorToLine(range,true);//Start
						return true;
					}
					if(cursorInfo && cursorInfo.atLineEnd&&(keyStroke==39 || keyStroke==35))//arrow right, or END key
					{
						PresListUtil.moveCursorToLine(range,false);//end
						return true;
					}
				}
			}
			return false;
		};
		
		
		var navigationKeyCodes = { 
				33:1,//Page up
				34:1, //Page down 34
				35:1, //End
				36:1, //home
				37:1, //left
				38:1, //up
				39:1, //right
				40:1 //down
				};
		var actionKeyCodes = { 
				/*Backspace*/ 8:1, /*ENTER*/ 13:1, /*Delete*/ 46:1, /*IME*/ 229:1
				};
		
		var editor = PresCKUtil.getCurrentEditModeEditor();
//		if(keyStroke==(CKEDITOR.CTRL + 65))//CTRL+A
//		{
//			if(!editor.isTable)
//			{
//				this.selectAll();
//				return true;
//			}
//		}
		
		if(editor)
		{
			var selection = editor.getSelection();
			var ranges = selection.getRanges();
			var range = (ranges && ranges.length> 0)? ranges[0] : null;
			if(keyStroke==(CKEDITOR.CTRL + 90))//CTRL+Z
			{
				PresCKUtil.runPending();
				editor.execCommand( "undo" );
				return true;
			}
			if(keyStroke==(CKEDITOR.CTRL + 89))//CTRL+Y
			{
				PresCKUtil.runPending();
				editor.execCommand( "redo" );
				return true;
			}
			if((keyStroke==(CKEDITOR.CTRL + 8))||(keyStroke==(CKEDITOR.CTRL + 46)))//CTRL+Backspace, CTRL+Delete
			{
				CKEDITOR.plugins.deletekey.deletekey(editor, null,null,(keyStroke==(CKEDITOR.CTRL + 8)));	
				return true;
			}
			
			if(!editor.isTable)
			{
				if(keyStroke==9)//Tab
				{
					if (range!=null)
					{
						var listSelInfo = PresListUtil._getRangeListSelection(range);
						if(listSelInfo)
						{
							if(listSelInfo.lineCount>1 || !range.collapsed) //Select multiple lines
							{
								editor.execCommand( "indent" );
							}
							else if(range.collapsed )
							{
								var cursorInfo = PresListUtil.getCursorPosInfo(range);
								if(cursorInfo.atLineStart)
								{
									editor.execCommand( "indent" );
								}
								else
								{
									var tabTools = editor.config.enableTabKeyTools !== false,
									tabSpaces = editor.config.tabSpaces || 4,
									tabText = '';

									while ( tabSpaces-- )
										tabText += '&nbsp;';
									var span = new CKEDITOR.dom.element('span');
									span.setHtml(tabText);
									var node = new CKEDITOR.dom.element('div') ;
									node.append(span);
									PresCKUtil.beginUndo(editor);
									PresListUtil._insertTextNode(node,range,true,false);
									dojo.destroy(node.$);
									PresCKUtil.endUndo();
									editor.contentBox.synchAllData(PresCKUtil.getDFCNode());
								}
							}
						}
						return true;
					}					
				}
				
				if(keyStroke==(CKEDITOR.SHIFT + 9))//shift + Tab
				{
					editor.execCommand( "outdent" );
					return true;
				}
			}

//			if(_CursorMove())//move cursor
//				return true;
		}
			
		return false;
	},

	
	_RemoveListSymbol: function (lineNode,range,editor)
	{
		var newLine = PresListUtil.disableList( lineNode );
		var Span = PresCKUtil.getFirstVisibleSpanFromLine(newLine);
		range.moveToElementEditStart(Span);
		range.select();
		range = PresCKUtil.removeInvalidSpanForLine(newLine.getParent(),true);
		return {result:true,range:range};
	},
	
	_NextLineUp: function (lineInfo,range,editor)
	{
		//move all children of next line into this line
		var nextLine = lineInfo.line.getNext();
		var curLine = lineInfo.line;
		if(nextLine)
		{
			if(PresCKUtil.isNodeTextEmpty(curLine) && curLine.is('p'))
			{//Current line is empty paragraph
				dojo.destroy(curLine.$);
				//we should directly destroy this line
				var cursorNode = PresCKUtil.getFirstVisibleSpanFromLine(nextLine,false);
				range.moveToPosition( cursorNode, CKEDITOR.POSITION_AFTER_START );
			}
			else if(PresCKUtil.isNodeTextEmpty(nextLine))
			{
				PresCKUtil.deleteILBeforeStyle(nextLine);
				//next line is empty, so we directly delete it, and move cursor is enough
				dojo.destroy(nextLine.$);
				// Get last span in prev line
				var lastSpan = PresCKUtil.getFirstVisibleSpanFromLine(lineInfo.line, true);
				range.moveToElementEditEnd(lastSpan);
			}
			else
			{
				//Stop using bookmark, since it has something not right, it will add space into span
				//var bookmark = range.createBookmark();
				//remove the <br> node which as the end of this line
				var brNode = lineInfo.lineItem.getLast();
				if(brNode.is('br'))
					dojo.destroy(brNode.$);
				var nextLineInfo = PresListUtil._getLineInfo(nextLine);
				var cursorNode = PresCKUtil.getFirstVisibleSpanFromLine(nextLine,false);
				var cursorNodeUpline = PresCKUtil.getFirstVisibleSpanFromLine(curLine,true);
				var childNode = nextLineInfo.lineItem.getFirst();

				while(childNode)
				{
					lineInfo.lineItem.append(childNode);
					childNode = nextLineInfo.lineItem.getFirst();
				}
				
				PresCKUtil.deleteILBeforeStyle(nextLine.$);
				dojo.destroy(nextLine.$);
				PresCKUtil.removeInvalidSpanForLine(lineInfo.line.getParent());
				//range.moveToBookmark( bookmark );
				if(!cursorNode || !cursorNode.$)
				{
					//debugger;
				}
				if(!cursorNode.getParent()){
					range.moveToPosition( cursorNodeUpline, CKEDITOR.POSITION_BEFORE_END );
				} else
					range.moveToPosition( cursorNode, CKEDITOR.POSITION_AFTER_START );
			}
			range.select();
			return {result:true,range:range};
		}
		return {result:false,range:range};
	},
	
	_GotoPreviousLine : function (lineInfo,range,editor)
	{
		var previousLine = lineInfo.line.getPrevious();
		if(previousLine)
		{
			var preLineInfo = PresListUtil._getLineInfo(previousLine);
			return PresListUtil._NextLineUp(preLineInfo,range,editor);
		}
		return {result:false,range:range};
	},
	
	//Delete text in oneline
	//return 	true/range 	: handled
	//			false/range	: not-handled
	//			null	: has issue
	//Parameter : 
	//	lineNode : current line <ol>/<ul>/<li>/<p>
	//	range : current select range
	//	bBackSpace : backspace or delete key
	//	bLetBrowserDelVisibleCharacter : [NOTE:]this parameter only work when range is collapsed
	//										since any range-selection will be handle by ourself
	//					if true, means let browser to delete the visible charater (not include <br>, we handle delete <br>)
	//										
	_DeleteTextInOneLine : function (lineNode, range, bBackSpace, bLetBrowserDelVisibleCharacter)
	{
		//remove invaild node and if encout <br> and remove it
		//return null :  has error
		//return true :  success removed <br>
		//return curNode :  not handled, we get a vaild node
		function _TrimInvalidNode(curNode,previousTextOffset)
		{
			var bNodeChanged = false;
			var nodesTobeDelete = [];
			while(curNode && PresCKUtil.isNodeTextEmpty(curNode))
			{
				if(curNode.is('br'))
					break;
				nodesTobeDelete.push(curNode);
				curNode = bBackSpace?curNode.getPrevious():curNode.getNext();
				bNodeChanged = true;
			}
			if(!curNode)
			{
				//no valid node
				//that's unnormal
				console.log("_DeleteTextInOneLine has error : no valid node be found.");
				console.trace();
				return null;
			}
			
			//delete the invaild node
			for(var i=0;i<nodesTobeDelete.length;i++)
				dojo.destroy(nodesTobeDelete[i].$);


			if(curNode.is('br'))
			{
				var tNode = bBackSpace?curNode.getPrevious():curNode.getNext();
				if(!tNode)
				{
					//the <br> is the last/first node, and we also want to delete
					//in this case, it should be handled in line-delete action
					//not be handle in this case
					console.log("_DeleteTextInOneLine has error : here should delete line but not delete text");
					console.trace();
					return null;
				}
				dojo.destroy(curNode.$);
				//move cursor to tNode
				range.moveToPosition( tNode, bBackSpace?CKEDITOR.POSITION_BEFORE_END:CKEDITOR.POSITION_AFTER_START );
				range.select();
				
				return true;
			}
			var textOffset = previousTextOffset;
			var textContent = PresListUtil._getTextContent(curNode);
			//Okay, here we get a span with text			
			//we need to control the delete now
			//we should get the text offset
			//here we need to check whether the node is changed
			if(bNodeChanged)
				textOffset = bBackSpace?textContent.length:0;
			
			if((bBackSpace && (textOffset==0)) || (!bBackSpace && (textOffset==textContent.length)))//cursor at the span start, and we want to backspace
			{
				curNode = bBackSpace?curNode.getPrevious():curNode.getNext();
				textContent = PresListUtil._getTextContent(curNode);
				textOffset = bBackSpace?textContent.length:0;
				
				var ret = _TrimInvalidNode(curNode,textOffset);
				if(ret == null || ret == true)
					return ret;
				curNode = ret.node;
				textOffset = ret.textOffset;
			}
			
			return {
				node : curNode,
				textOffset : textOffset
			};
		}
		
		function _implentment()
		{
			var selectInfo = PresListUtil.getListSelectionRangeInfo(range);
			//that's a cursor
			if(range.collapsed)
			{
				var sel = selectInfo.startSelection;
				var	curNode = sel.focusSpan;
				var ret = _TrimInvalidNode(curNode,sel.textOffset);
				if(ret == null)return ret;
				if(ret == true)	return {result:true,range:range};
				curNode = ret.node;
				//here we need to handle real delete visible character
				//but if we indent to leave it to browser
				//then set the range right, and return
				if(bLetBrowserDelVisibleCharacter)
				{
					curNode.$.normalize();
					range.setStart(curNode.getChild(0),ret.textOffset);
					range.setEnd(curNode.getChild(0),ret.textOffset);
					range.select();
					return {result:false,range:range};
				}
				//Otherwise we handle the delete ourself
				//for the span node, the html is its text, 
				// for a node <span>&nbsp;M</spam>
				//In IE TEXTMSG.getTextContent will return " M", it change the $nbsp to " ", that will cause problem
				var textContent = PresListUtil._getTextContent(curNode);
				var offset = ret.textOffset;
				if(bBackSpace)
				{
					var str = textContent.substring(0,offset-1) + textContent.substring(offset,textContent.length);
					if(str=="")
						curNode.setHtml('&#8203;');
					else
						curNode.setText(str);
					offset--;
				}
				else
				{
					var str = textContent.substring(0,offset) + textContent.substring(offset+1,textContent.length);
					if(str=="")
						curNode.setHtml('&#8203;');
					else
						curNode.setText(str);
				}
				curNode.$.normalize();
				range.setStart(curNode.getChild(0),offset);
				range.setEnd(curNode.getChild(0),offset);
				range.select();
				return {result:true,range:range};
			}
			else	//that's a range
			{
				var selStart = selectInfo.startSelection;
				var selEnd = selectInfo.endSelection;
				if(selStart.focusSpan.equals(selEnd.focusSpan))//Same word delete
				{	
					var	curNode = selStart.focusSpan;
					if(curNode.is('br'))
					{
						//delete this <br>
						//move cursor to its previous node
						var preNode = curNode.getPrevious();
						if(!preNode)
						{
							//the <br> is the first node, and we also want to delete
							console.log("_DeleteTextInOneLine has error : <br> is the first node in the line");
							console.trace();
							return null;
						}
						dojo.destroy(curNode.$);
						range.moveToPosition( preNode, CKEDITOR.POSITION_BEFORE_END);
						range.select();
						return {result:true,range:range};
					}
					var textContent = PresListUtil._getTextContent(curNode);
					var str = textContent.substring(0,selStart.textOffset) + textContent.substring(selEnd.textOffset,textContent.length);
					if(str=="")
						curNode.setHtml('&#8203;');
					else
						curNode.setText(str);
					curNode.$.normalize();
					range.setStart(curNode.getChild(0),selStart.textOffset);
					range.setEnd(curNode.getChild(0),selStart.textOffset);
					range.select();
					return {result:true,range:range};
				}
				else // not same word
				{
					var	nodeStart = selStart.focusSpan;
					var	nodeEnd = selEnd.focusSpan;
					
					//destroy middle node
					var curNode = nodeStart.getNext();
					while(!curNode.equals(nodeEnd))
					{
						var delNode = curNode;
						curNode = curNode.getNext();
						dojo.destroy(delNode.$);
					}
					
					if(nodeStart.is('br') && nodeEnd.is('br'))
					{
						//delete this <br>
						//move cursor to its previous node
						var preNode = nodeStart.getPrevious();
						if(!preNode)
						{
							//the <br> is the first node, and we also want to delete
							console.log("_DeleteTextInOneLine has error : <br> is the first node in the line");
							console.trace();
							return null;
						}
						dojo.destroy(nodeStart.$);
						dojo.destroy(nodeEnd.$);
						range.moveToPosition( preNode, CKEDITOR.POSITION_BEFORE_END);
						range.select();
						return {result:true,range:range};
					}
								
					var txtStart = PresListUtil._getTextContent(nodeStart);
					var txtEnd = PresListUtil._getTextContent(nodeEnd);
					
					txtStart = (txtStart?txtStart.substring(0,selStart.textOffset):"");
					if(!nodeStart.is('br'))
					{
						if(txtStart=="")
							nodeStart.setHtml('&#8203;');
						else
							nodeStart.setText(txtStart);
						nodeStart.$.normalize();
					}
					txtEnd = (txtEnd?txtEnd.substring(selEnd.textOffset,txtEnd.length):"");
					if(!nodeEnd.is('br'))
					{
						if(txtEnd=="")
							nodeEnd.setHtml('&#8203;');
						else
							nodeEnd.setText(txtEnd);
						nodeEnd.$.normalize();
					}
					
					var offset = nodeStart.is('br')?0:selStart.textOffset;
					curNode = nodeStart.is('br')?nodeEnd:nodeStart;
					if(nodeStart.is('br') || nodeEnd.is('br'))
					{
						var delNode = nodeStart.is('br')? nodeStart.$ : nodeEnd.$;
						if(nodeStart.is('br'))
							nodeStart = null;
						else if(nodeEnd.is('br'))
							nodeEnd = null;
						//destroy <br> node
						dojo.destroy(delNode);
					}					

					range.setStart(curNode.getChild(0),offset);
					range.setEnd(curNode.getChild(0),offset);
					range.select();
					return {result:true,range:range};
				}
			}
			return null;
		}
		
		var lineItem = PresListUtil.getLineItem(lineNode);
		range = PresListUtil._flatternHyperlinkForLine(lineItem,range);
		var ret = _implentment();
		if(ret!=null)
		{
			ret.range = PresCKUtil.removeInvalidSpanForLine(lineItem,true,ret.range);
			ret.range = PresListUtil._restoreHyperlinkForLine(lineItem,ret.range);
		}

		return ret;
	},
	
	//Check and get list selection, if not select list, return null
	_getRangeListSelection: function(range)
	{
		//here we should check whether range selected is all list
		//Get the information about range selection
		// Then start and end must be same empty list
		var startblock = MSGUTIL.getBlock(range.startContainer);
		var endblock = MSGUTIL.getBlock(range.endContainer);
		if(!startblock || !startblock.is || !endblock || !endblock.is)
			return null;
		
		var editor = PresCKUtil.getCurrentEditModeEditor();
		if(editor.isTable)
		{
			if(!startblock.is('p','li','ol','ul')
					|| !endblock.is('p','li','ol','ul'))
			{
				range.shrink(CKEDITOR.SHRINK_ELEMENT);
				range.select();
				startblock = MSGUTIL.getBlock(range.startContainer);
				endblock = MSGUTIL.getBlock(range.endContainer);
			}
			
			// skip colgroup
			if (PresCKUtil.checkNodeName(startblock,'col') ||
					PresCKUtil.checkNodeName(startblock,'colgroup') ) {
				var tableNode = startblock.getAscendant('table');
				var tbody = tableNode.$.childNodes[1];
				if (tbody && PresCKUtil.checkNodeName(tbody,'tbody')) {
					var firstTr = tbody.firstChild;
					if (firstTr && PresCKUtil.checkNodeName(firstTr,'tr')){
						var firstTd = firstTr.firstChild;
						if (firstTd && (
								PresCKUtil.checkNodeName(firstTd,'td') ||
								PresCKUtil.checkNodeName(firstTd,'th')) &&
								firstTd.firstChild){
							range.startContainer = PresCKUtil.ChangeToCKNode(firstTd.firstChild);
							startblock = MSGUTIL.getBlock(range.startContainer);
						}
					}
				}
			}
		}
		
		var startlineInfo = PresListUtil._getLineInfo(startblock);
		var endlineInfo = PresListUtil._getLineInfo(endblock);
		if(!startlineInfo || !endlineInfo)
			return null;
		var rootTXTNode = startlineInfo.line.getParent();
		if(!rootTXTNode)
			return null;
		if(!rootTXTNode.is('div', 'td', 'th'))
			return null;
		//Should under same parent
		var endRoot = endlineInfo.line.getParent();
		if(!(rootTXTNode.equals(endRoot)))
			return null;
		
		var lineCount = endlineInfo.line.getIndex() - startlineInfo.line.getIndex()+1;
		
		return {
			startblock : startblock,
			startlineInfo : startlineInfo,
			endblock : endblock,
			endlineInfo : endlineInfo,
			lineCount : lineCount,
			rootTXTNode : rootTXTNode
		};
	},
	
	//Note : this function could not work for table yet
	selectAll: function (editor,event)
	{	
		if(!editor)
			editor = PresCKUtil.getCurrentEditModeEditor();
		
		var selection = editor.getSelection();
		if(!selection)
			return;
		var range = selection && selection.getRanges()[0];

		if(editor.isTable)
		{
			var tableNode = range.startContainer.getAscendant('table', true);
			// justify whether it's 1x1 table
			var singleCellTable = PresTableUtil.isSingleCellTable(tableNode);
			if (singleCellTable) {
				var singleCell = tableNode.$.rows[0].cells[0];
				if (!singleCell) return;
				var ckFirstCell = PresCKUtil.ChangeToCKNode(singleCell);
				var firstParagraph = ckFirstCell.getFirst()?ckFirstCell.getFirst():null;
				if (firstParagraph)
					range.setStart(firstParagraph,0);
				var lastPara = ckFirstCell.getLast()?ckFirstCell.getLast():null;
				if (lastPara)
					range.setEnd(lastPara, lastPara.getChildCount());
				range.shrink(CKEDITOR.SHRINK_TEXT, true);
				range.select();
				PresCKUtil.stopEvent(event);
				console.info("for 1x1 table, we have shrink the range to select the paragraphs");
			}
			return;
		}
		var rootNode = MSGUTIL.getBlock(range.startContainer);
		rootNode = rootNode.getAscendant('div',true);
		
		//we should reset select range, make like a range select
		var statNode = PresCKUtil.getFirstVisibleSpanFromLine(rootNode.getFirst(),false);
		if(rootNode.getChildCount()==1 && PresCKUtil.isNodeTextEmpty(rootNode.getFirst()))
		{
			range.moveToElementEditStart(statNode);
			range.select();
			return;
		}
		
		editor.ctrlA = true;
	
		var endNode = PresCKUtil.getFirstVisibleSpanFromLine(rootNode.getLast(),true);
		range.setStartBefore(statNode);
		range.setEndAfter(endNode);		
		range.select();
	},

	
	/**
	 * Return [0]:the delete action is not handled in this function
	 * [1]:the delete action is handled in this function, and content has changed, need undo
	 * [2]:the delete action is handled in this function, but content is unchanged, do not need undo
	 * Ctrl-X is treat as delete
	 * 
	 * Params:
	 * kept: true means keeping an empty list after deleting below three 'A' lines
	 *         false means not keeping and cursor will go to next line
	 * >AAAAAAA
	 * >AAAAAAA
	 * >AAAAAAA
	 * >BBBBBBB 
	 */
	HandleDelete: function (range,isBackspace,editor,isKeepLIBeforeCss)
	{

		// using splitElement to split one line
		// and automatically fix elements which missing in new line
		// return the new line
		// lineToSplit must be CKNode of <p>/<ol>/<ul>,otherwise do nothing and return null
		function _splitLine ( lineToSplit,range )
		{
			function _isLineHealth(line)
		  	{
				if(!line.is('p','ol','ul'))
				{
					//debugger;
					return false;
				}
				var lineItem = line.is('p')?line:line.getFirst();
				if(!lineItem)
				{
					return false;
				}
				else if(!lineItem.is('p','li'))
				{
					//debugger;
					return false;
				}
				var span = line.getFirst();
				var br = line.getLast();
				if(!span || !span.is('span') 
						|| !br || !br.is('br'))
				{
					return false;
				}
		  		
				return true;
		  	};

			
			function _fixLineItem(lineItem)
			{
				var _newLi = newLi.clone();
				var _newSpan = newSpan.clone();
				var _br = br.clone();
				if(!lineItem.is('li','p'))
				{
					//debugger;
					return null;
				}
				var span = lineItem.getFirst();
				if(!span)
				{
					lineItem.append(_newSpan);
					lineItem.append(_br);
				}else if(span.$.nodeType ==3 )//textnode
				{
					_newSpan.insertBefore(span);
					_newSpan.append(span);
				}
				else if(span.is('br'))
				{
					_newSpan.insertBefore(span);
				}
				else if(!span.is('span'))
				{
						//debugger;
						return null;
				}
				
				var tbr = lineItem.getLast();
				if(!PresCKUtil.checkNodeName(tbr, 'br'))
				{
					lineItem.append(_br);
				}		
			};
			
			function _fixLineStrcuture(line)
		  	{
				//check whether the new line has the right structure
				if(line.is('ol','ul'))
				{
					var firstLine = line.getFirst();
					if(!firstLine)
					{//no <li>
						//we should add <li> and <span>/<br> for it
						var _newLi = newLi.clone();
						var _newSpan = newSpan.clone();
						var _br = br.clone();
						_newLi.append(_newSpan);
						_newLi.append(_br);
						line.append(_newLi);
					}
					else 
					{	
						_fixLineItem(firstLine);
					}
				}
				else if(line.is('p'))
					{
						_fixLineItem(line);
					}
				else
					{
					//debugger;
					return null;
					}
		  	}
			
			if(!lineToSplit.is('p','ol','ul'))
				return null;		
			
			//Prepare the element for fixing
			var newLi = lineToSplit.getFirst().clone();
			var newSpan = PresCKUtil.getFirstVisibleSpanFromLine(lineToSplit, false).clone();
			var br = new CKEDITOR.dom.element('br') ;
			br.setAttribute( "class", "hideInIE" );
			
			var newLine = range.splitElement(lineToSplit);
			_fixLineStrcuture(newLine);
			_fixLineStrcuture(lineToSplit);

			return newLine;
		}
	
		if(!editor)
			editor = PresCKUtil.getCurrentEditModeEditor();
		var bNeedUpdateRelativeValue = true;
		var result = PresListUtil.NOT_HANDLED;
		//Delete content while select cells
		if(editor.isTable)
		{
			var selectedCells = PresListUtil.getSelectedTableCells(  editor.getSelection());
			if((selectedCells.length == 1) 
					&& PresTableUtil.isSelectionEqualToTD(editor))
			{
				//select one cell
				//in this case, we should shrink the range to select all lines
				var rootNode = selectedCells[0];
				
				//we should reset select range, make like a range select
				var statNode = PresCKUtil.getFirstVisibleSpanFromLine(rootNode.getFirst(),false);
				if(rootNode.getChildCount()==1 && PresCKUtil.isNodeTextEmpty(rootNode.getFirst()))
				{
					range.moveToElementEditStart(statNode);
					range.select();
				}
				else
				{
					var endNode = PresCKUtil.getFirstVisibleSpanFromLine(rootNode.getLast(),true);
					if (statNode)
						range.setStartBefore(statNode);
					if (endNode)
						range.setEndAfter(endNode);		
					range.select();
				}
			}
			else if ((selectedCells.length > 1) 
					|| PresTableUtil.isSelectionEqualToTD(editor)
					||(PresCKUtil.checkNodeName(range.startContainer,"tr","table") 
							&& (Math.abs(range.endOffset - range.startOffset) === 1))){
							
				for (var i=0, len = selectedCells.length; i < len; i++){
					if(!isKeepLIBeforeCss)
						PresCKUtil.deleteILBeforeStyles( selectedCells[i].$);
					PresCKUtil.recreateDefaultCell( selectedCells[i].$, true);
				}
				editor.contentBox.moveCursorPositionToLastNodeOfTableCell(selectedCells[0].$, editor.getSelection());
				result = PresListUtil.HANDLED_CONTENT_CHANGED;
				var sel = editor.getSelection();
				range = sel.getRanges()[0];
				return{
					result : result,
					range : range
				};
			} else {
				//D28277 sometimes browser will set table as the startContainer of range, we just need to set it to the selected cell
				if(PresCKUtil.checkNodeName(range.startContainer,'table')){
					range.setStartAt(selectedCells[0],CKEDITOR.POSITION_AFTER_START);
					range.select();
				}
				
			} 
		}
		//Four different delete action 
		//[1]Cross line delete
		//[2]Delete whole lines with bullets be selected
		//[3]Delete whole line without bullets
		//[4]Delete empty list line/ Delete list symbol only
		//Get the information about range selection
		var selInfo = PresListUtil._getRangeListSelection(range);
		if(!selInfo)
		{
			//we should do nothing
			result = PresListUtil.HANDLED_CONTENT_NO_CHANGE;
			return{
				result : result,
				range : range
			};
		}
		
		// Then start and end must be same empty list
		var startblock = selInfo.startblock;
		var startlineInfo = selInfo.startlineInfo;
		var endblock = selInfo.endblock;
		var endlineInfo = selInfo.endlineInfo;
		var rootTXTNode = selInfo.rootTXTNode;
		//[Cursor delete]++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		//If range is a cursor ,here only one case : [4]Delete empty list line/ Delete list symbol only
		//There are different cases & actions
		//<1>  >|AABBB , delete the list symbol (with backspace)
		//<2>  >|
		//<3>  >AABBB| , delete the line wrap, next line move up (with delete)
		//<4>   AABBB|
		//<5>  >|
		//<6>  |
		//<7>  |AABBB  , delete the line wrap, move to previous line (with backspace)
		//<8>  |
		if(range.collapsed)
		{
			var bList = startlineInfo.lineItem.is('li');
			//get cursor position info
			var cursorInfo = PresListUtil.getCursorPosInfo(range);
			var action = null;
			
			if(bList)//case <1><2><3><5>
			{
				//Empty list
				if(cursorInfo.atLineStart && cursorInfo.atLineEnd)
				{//case<2><5>
					if(isBackspace)//case<2>
						action = 'RemoveListSymbol';
					else //case<5>
						action = 'NextLineUp';
				}
				else if(cursorInfo.atLineStart)
				{//case<1>
					if(isBackspace)
						action = 'RemoveListSymbol';
					else
						action = 'DeleteText';
				}
				else if(cursorInfo.atLineEnd)
				{//case<3>
					if(isBackspace)
						action = 'BackspaceText';
					else
						action = 'NextLineUp';
				} else {
					if (isBackspace)
						action = 'BackspaceText';
					else
						action = 'DeleteText';
				}
			}
			else //case <4><6><7><8>
			{
				//Empty list
				if(cursorInfo.atLineStart && cursorInfo.atLineEnd)
				{//case<6><8>
					if(isBackspace)//case<8>
						action = 'GotoPreviousLine';
					else //case<6>
						action = 'NextLineUp';
				}
				else if(cursorInfo.atLineStart)
				{//case<7>
					if(isBackspace)
						action = 'GotoPreviousLine';
					else 
						action = 'DeleteText';
				}
				else if(cursorInfo.atLineEnd)
				{//case<4>
					if(isBackspace)
						action = 'BackspaceText';
					else
						action = 'NextLineUp';
				} else {
					if (isBackspace)
						action = 'BackspaceText';
					else
						action = 'DeleteText';
				}
			}
			
			var actionResult = null;
			switch(action)
			{
				case 'RemoveListSymbol':
					actionResult = PresListUtil._RemoveListSymbol(startlineInfo.line,range,editor);//removeList_Pres,move cursor
					bNeedUpdateRelativeValue = false;
					break;
				case 'NextLineUp':
					actionResult = PresListUtil._NextLineUp(startlineInfo,range,editor);
					break;
				case 'GotoPreviousLine':
					actionResult = PresListUtil._GotoPreviousLine(startlineInfo,range,editor);
					break;
				case 'BackspaceText':
					actionResult = PresListUtil._DeleteTextInOneLine(startlineInfo.line, range, true);
					bNeedUpdateRelativeValue = false;
					break;
				case 'DeleteText':
					actionResult = PresListUtil._DeleteTextInOneLine(startlineInfo.line, range, false);
					bNeedUpdateRelativeValue = false;
					break;
				default :
					//debugger;
					//cursorInfo = getCursorPosInfo(range);//Recheck what happend
					//it should delete visible content in the line
					break;
			}
			if(!actionResult)
			{
				result = PresListUtil.NOT_HANDLED;
				//range = actionResult.range;
			}
			else if(actionResult.result == true)
			{
				result = PresListUtil.HANDLED_CONTENT_CHANGED;
				range = actionResult.range;
			}
			else 	if(actionResult.result == false)//taked, but need do anything
			{
				result = PresListUtil.HANDLED_CONTENT_NO_CHANGE;
				range = actionResult.range;
			}	
		}
		//[Range selection delete]++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		else //
		{
			//[1]Cross line delete
			//[2]Delete whole lines with bullets be selected
			//[3]Delete whole line without bullets
			//force start range be a start collapsed cursor
			var startCursor = range.clone();
			startCursor.endContainer = range.startContainer;
			startCursor.endOffset = range.startOffset;
			startCursor.collapsed = true;
			var endCursor = range.clone();
			endCursor.startContainer = range.endContainer;
			endCursor.startOffset = range.endOffset;
			endCursor.collapsed = true;
			
			//Startline and end line are same line
			if(startlineInfo.index == endlineInfo.index)
			{
				var line = rootTXTNode.getChild(startlineInfo.index);

				var ret = PresListUtil._DeleteTextInOneLine(line, range, true, true);
				range = ret.range;

				bNeedUpdateRelativeValue = false;
			}
			else //not the same line
			{
				var toBeDelList = [];
				//remove the lines between start & end line in range 
				for(var i=startlineInfo.index+1;i<endlineInfo.index;i++)
				{
					toBeDelList.push(rootTXTNode.getChild(i));
				}
				for(var i in toBeDelList){
					if(!isKeepLIBeforeCss)
						PresCKUtil.deleteILBeforeStyle(toBeDelList[i]);					
					dojo.destroy(toBeDelList[i].$);
				}
				
				//split part line, and delete the selection part
				var startLineBackPart = _splitLine(startlineInfo.line,startCursor);
				dojo.destroy(startLineBackPart.$);
				startlineInfo = PresListUtil._getLineInfo(startlineInfo.line);//update start line info
				var temp = _splitLine(endlineInfo.line,endCursor);
				var endLineBeforePart = endlineInfo.line;
				endlineInfo = PresListUtil._getLineInfo(temp);//update end line info
				dojo.destroy(endLineBeforePart.$);
				
				var bStartLineEmpty = PresCKUtil.isNodeTextEmpty(startlineInfo.line);
				var bEndLineEmpty = PresCKUtil.isNodeTextEmpty(endlineInfo.line);

					var cursorNode = null;
					if(bStartLineEmpty && bEndLineEmpty)
					{
						cursorNode = PresCKUtil.getFirstVisibleSpanFromLine(startlineInfo.line,false);
					}
					else
					{
						cursorNode = bStartLineEmpty?
							PresCKUtil.getFirstVisibleSpanFromLine(endlineInfo.line,false)
								:PresCKUtil.getFirstVisibleSpanFromLine(startlineInfo.line,true);
						//Remove the br
						var brNode = startlineInfo.lineItem.getLast();
						if(brNode.is('br'))
							dojo.destroy(brNode.$);
						//move the end part to start part as one line
						//we only need move <span>
						var childNode = endlineInfo.lineItem.getFirst();
						while(childNode)
						{
							startlineInfo.lineItem.append(childNode);
							childNode = endlineInfo.lineItem.getFirst();
						}
					}

					//after move, we delete the end line
					if(!isKeepLIBeforeCss)
						PresCKUtil.deleteILBeforeStyle(endlineInfo.line);
					dojo.destroy(endlineInfo.line.$);
					PresCKUtil.removeInvalidSpanForLine(rootTXTNode);
					
					if (!cursorNode || !cursorNode.getParent()) {
						cursorNode = PresCKUtil.getFirstVisibleSpanFromLine(startlineInfo.line, false);
					}
					
					//for the cursor span,8203 could make sure the cursor in it
					if(PresCKUtil.isNodeTextEmpty(cursorNode))
						cursorNode.setHtml('&#8203;');
					range.moveToPosition( cursorNode, bStartLineEmpty?CKEDITOR.POSITION_AFTER_START:CKEDITOR.POSITION_BEFORE_END );
					range.select();			
			}

			result = PresListUtil.HANDLED_CONTENT_CHANGED;
		}
		
		if(result == PresListUtil.HANDLED_CONTENT_CHANGED)
		{
			PresListUtil.updateListValue(rootTXTNode);
			var seletInfo = PresListUtil.getListSelectionRangeInfo(range);
			if(seletInfo){
				var line = seletInfo.root.getChild(seletInfo.startSelection.lineIndex);
				if(line)
					var lineItem = PresListUtil.getLineItem(line);
			} else {
				console.error("Cursor maybe is error at here, move cursor to last edit element");
				//TODO fixDom structure maybe is needed at here
				editor.contentBox.handleCursorOnEdit();	
			}
			
			if(lineItem && bNeedUpdateRelativeValue)
			{
				PresCKUtil.updateRelativeValue(lineItem);
			}
			else if(!lineItem)
			{
				console.error("After delete no line is found");
			}
			//Cursor at the first word
			if(lineItem && (seletInfo.startSelection.focusSpan.getIndex() == 0 
					|| seletInfo.startSelection.textOffset == 0)
					&& lineItem.is('li'))
			{
				PresCKUtil.copyAllFirstSpanStyleToILBefore(lineItem);
			}
		}
		
		
		//we successfully handle the ctrl+a, so we should release the flag
		if(editor.ctrlA && (result!=PresListUtil.NOT_HANDLED))
		{
			editor.ctrlA = false;
		}
				
		return {
			result : result,
			range : range
		};
	},
	
	HandleEnter: function (range, editor, mode)
	{
		_fixLastBr = function(line)
		{
			var lastNode = line.getLast();
			while(lastNode)
			{
				if(PresCKUtil.checkNodeName(lastNode,'br') 
					|| (PresCKUtil.checkNodeName(lastNode,'span')
					|| (PresCKUtil.checkNodeName(lastNode,'a')))
				)
					break;
				var invalidTextNode = null;
				if(PresCKUtil.checkNodeName(lastNode,'#text'))
				{
					var text = lastNode.getText();
					if(text.length>0)
					{
						var span = new CKEDITOR.dom.element('span');
						span.setText(text);
						span.insertBefore(lastNode);
						dojo.destroy(lastNode.$);
						lastNode = span;
						break;
					}										
					invalidTextNode = lastNode;
				}
				lastNode = lastNode.getPrevious();
				dojo.destroy(invalidTextNode.$);
			}
			
			if(!PresCKUtil.checkNodeName(lastNode,'br'))
			{
				var br = new CKEDITOR.dom.element('br');
				br.addClass('hideInIE');
				line.append(br);
			}

			
			dojo.query("span",line.$).forEach(function(_node){				
				var span = PresCKUtil.ChangeToCKNode(_node);
				concord.util.HtmlContent.injectRdomIdsForElement(span);
			});
		};
		
		_fixEmptySpan = function(span)
		{
			var content = PresListUtil._getTextContent(span);
			if(content.length == 0) {
				span.setHtml("&#8203;");
			}
		};
		if ( !range )
		{
			//debugger;
			return null;
		}
		var deleteResult = null;
		if(!editor)
			editor = PresCKUtil.getCurrentEditModeEditor();
		
		editor.enterPending = true;
		if ( !range.collapsed )
		{
			//delete range selection first,and update range
			var re = PresListUtil.HandleDelete(range,false,editor);
			if(!re)
				return null;
			range = re.range;
			if ( !range.collapsed )
			{
				//debugger;//
				//Must collapsed!
				return null;
			}
			deleteResult = re.result;
		}
		
		var tempLI = MSGUTIL.getBlock(range.startContainer);
		var lineRoot = editor.isTable?
				(tempLI.getAscendant('td',true) || tempLI.getAscendant('th',true)):
					tempLI.getAscendant('div',true);
		if(deleteResult)
		{
			//After we delete, we should check whether there is only one empty line
			//If so, we do nothing, just return
			if(lineRoot.getChildCount()==1)
			{
				if(PresCKUtil.isNodeTextEmpty(lineRoot.getFirst()))
				{
					 result = (deleteResult != PresListUtil.HANDLED_CONTENT_CHANGED)?
							 PresListUtil.HANDLED_CONTENT_NO_CHANGE:PresListUtil.HANDLED_CONTENT_CHANGED;
					 return {
					 result : result,
					 range : range
					 };
				}
			}
		}
		
		var lineItem = tempLI.getAscendant('p',true) || tempLI.getAscendant('li',true);
		if(lineItem)
		{
			range = PresListUtil._flatternHyperlinkForLine(lineItem,range);
		}
		
		
		/////////////////////////////////
		//So here, let's break the line
		//First, find the cursor node
		var ret = PresListUtil._splitNode(range);
		if(ret == false)
			return null;
		_fixEmptySpan(ret.preSpanNode);
		_fixEmptySpan(ret.postSpanNode);
		
		// Handle shift enter
		if(mode == CKEDITOR.ENTER_BR)
		{
			var br = new CKEDITOR.dom.element('br');
			br.addClass('text_line-break');
			
			var preCs = ret.preSpanNode.getAttribute('customstyle');
			var preStyle = ret.preSpanNode.getAttribute('style');
			var preStyleTemplate = ret.preSpanNode.getAttribute('styletemplate');
			preCs && br.setAttribute('customstyle',preCs);
			preStyle && br.setAttribute('style',preStyle);
			preStyleTemplate && br.setAttribute('styletemplate',preStyleTemplate);

			br.insertAfter(ret.preSpanNode);
			if(ret.preSpanNode.hasAttribute('_alink'))
			{
				var linkID = ret.preSpanNode.getAttribute('_alink');
				br.setAttribute('_alink',linkID);
			}
			_fixLastBr(ret.preSpanNode.getParent());
			PresListUtil._restoreHyperlinkForLine(ret.preSpanNode.getParent());
			var focusSpan = br.getNext() || ret.postSpanNode;
			range.moveToPosition( focusSpan, CKEDITOR.POSITION_AFTER_START);
			range.select();
			return {
				result : PresListUtil.HANDLED_CONTENT_CHANGED,
				range : range
			};
		}
		//New a line
		var preLineItem = ret.preSpanNode.getParent();
		var preLine = preLineItem;
		var newLine = null;
		var newLineItem = null;
		if(preLine.is('li'))
		{
			newLineItem = preLineItem.clone();
			preLine = preLine.getParent();
			newLine = preLine.clone();
			newLine.append(newLineItem);
		}
		else //is <p>
		{
			newLine = preLine.clone();
			newLineItem = newLine;
		}
		
		newLine.insertAfter(preLine);
	
		var postPart = ret.postSpanNode;
		while(postPart)
		{
			var next = postPart.getNext();
			newLineItem.append(postPart);
			postPart = next;
		}
		_fixLastBr(preLineItem);
		_fixLastBr(newLineItem);
		
		// CK3621 - Properly handle text user indicators in single edit mode
		var inSingleEdit = window.pe.scene.session.isSingleMode();
		if (inSingleEdit) {
			var children = (newLine.is('p'))?newLine.getChildren():newLine.getFirst().getChildren();
			var size = children.count();
			var elementToRemove = null;
        	for (var i = 0; i < size; i++) {
        		if (PresCKUtil.checkNodeName(children.getItem(i), 'span') &&
        			children.getItem(i).hasClass("indicatortag")) {
            		elementToRemove = children.getItem(i);
						break;
            	}
        	}
        	if (elementToRemove) {
        		elementToRemove.removeClass("indicatortag");
        		var bAlone = (elementToRemove.getNext()||elementToRemove.getPrevious())?false:true;
        		if(PresCKUtil.isNodeTextEmpty(elementToRemove) && bAlone)
        			elementToRemove.remove();
        	}
		}
		if(!newLine.is('p'))
		{
			var oldlistBeforeCss = PresListUtil.getListBeforeClass(newLine);
			if(oldlistBeforeCss && oldlistBeforeCss.length > 0)
				PresCKUtil.duplicateListBeforeStyle(oldlistBeforeCss,newLineItem);
			else 
				PresCKUtil.copyAllFirstSpanStyleToILBefore(newLineItem);
			PresListUtil.updateListValue(newLine.getParent());
		}
		
		if(newLine && concord.util.browser.isMobile())
			concord.util.mobileUtil.autoCorrect.newBlockId = newLine.getId();
		PresListUtil._restoreHyperlinkForLine(preLineItem,null,true);
		PresListUtil._restoreHyperlinkForLine(newLineItem);
		var cursorSpan = PresCKUtil.getFirstVisibleSpanFromLine(newLineItem);
		range.moveToPosition( cursorSpan, CKEDITOR.POSITION_AFTER_START);
		range.select();
		return {
			result : PresListUtil.HANDLED_CONTENT_CHANGED,
			range : range
		};
		////////////////////////////
	},
	
	_GetSpanNodeFromParagraph : function(node){
		var ckNode = PresCKUtil.ChangeToCKNode(node);
		var spanNode = null;
		if (ckNode.is && ckNode.is('ol','ul')){
			var liNode = ckNode.getChild(0);
			var ckLiNode = PresCKUtil.ChangeToCKNode(liNode);
			if (ckLiNode.is && ckLiNode.is('li')){
				spanNode = ckLiNode.getChild(0);
			}
		} else if (ckNode.is && ckNode.is('li','p')){
			spanNode = ckNode.getChild(0);
		} else{
			spanNode = ckNode.getAscendant('span', true);
		}
		return spanNode;
	},
	
	_IsValidSpanLevelNode : function(node) {
		var ckNode = PresCKUtil.ChangeToCKNode(node);
		if (PresCKUtil.checkNodeName(ckNode, 'span')) {
			// not a nested span
			var innerSpans = dojo.query('span', ckNode.$);
			if (innerSpans.length > 0)
				return false;
			else
				return true;
		} else if (PresCKUtil.checkNodeName(ckNode, 'br')) {
			var next = ckNode.getNext();
			if (ckNode.hasClass('text_line-break') &&
				PresCKUtil.checkNodeName(next, 'span'))
				return true;
			else
				return false;
		} else if (PresCKUtil.checkNodeName(ckNode, 'a')) {
			// TODO(lijiany): add conditions for hyper link node
			return true;
		}
		return false;
	},
	
	updateVisibleStringForCloneNode:function(sourceNode, clonedNode)
	{
		var string = PresListUtil._getVisibleStyleStringForSpan(sourceNode);
		if(string)
		{
			if(PresCKUtil.checkNodeName(clonedNode, '#text'))
			{
				clonedNode.setCustomData('visible_style',string);
			}
			else
				dojo.attr(clonedNode,'_visibleStyle',string);
		}

		var childSource = sourceNode.getFirst?sourceNode.getFirst():null;
		var childClone = clonedNode.getFirst?clonedNode.getFirst():null;
		while(childSource && childClone)
		{
			PresListUtil.updateVisibleStringForCloneNode(childSource, childClone);
			childClone = childClone.getNext();
			childSource = childSource.getNext();
		}
	},
	
	_getVisibleStyleStringForLineItem:function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if (!PresCKUtil.checkNodeName(node, 'li','p'))
			return null;
		var computedStyle = dojo.getComputedStyle(node.$);
		
		var splitor = '@';
		var visibleStyle = "sys_vs"+splitor;
		
		// style properties
		var styleAttr = dojo.attr(node.$, 'style');
		visibleStyle += styleAttr;visibleStyle +=splitor;
		
		var align = computedStyle.textAlign;
		visibleStyle += align;visibleStyle +=splitor;
		
		var editor = window.pe.scene.slideEditor;
		// margin-top
		var marginTop = editor.PxToPercent(parseFloat(computedStyle.marginTop),'height');
		visibleStyle += marginTop;visibleStyle +='%';visibleStyle +=splitor;
		// margin-bottom
		var marginBottom = editor.PxToPercent(parseFloat(computedStyle.marginBottom),'height');
		visibleStyle += marginBottom;visibleStyle +='%';visibleStyle +=splitor;
		
		var drawFrameWidth = parseFloat(computedStyle.width);
		
		// margin-left
		var marginLeft = node.getStyle('margin-left');
		if(marginLeft == null)
		{
			marginLeft = (drawFrameWidth && drawFrameWidth !=null && drawFrameWidth != '0') ?
					((parseFloat(computedStyle.marginLeft) * 100) / drawFrameWidth) : 0;	
		}else
		{
			marginLeft = PresCKUtil._percentToFloat(marginLeft)*100;
		}
		var absML = parseFloat(dojo.attr(editor.mainNode,'pageWidth'))*marginLeft*10.0;//cmm
		
		//text-indent
		var textIndent = node.getStyle('text-indent');
		if(textIndent == null)
		{
			textIndent = (drawFrameWidth && drawFrameWidth !=null && drawFrameWidth != '0') ?
					((parseFloat(computedStyle.textIndent) * 100) / drawFrameWidth) : 0;	
		}else
		{
			textIndent = PresCKUtil._percentToFloat(textIndent)*100;
		}
		var absTI = parseFloat(dojo.attr(editor.mainNode,'pageWidth'))*textIndent*10.0;//cmm
			
		visibleStyle += marginLeft;visibleStyle +='%';visibleStyle +=splitor;
		// margin-right
		var marginRight = (drawFrameWidth && drawFrameWidth !=null && drawFrameWidth != '0') ?
				((parseFloat(computedStyle.marginRight) * 100) / drawFrameWidth) : 0;	
		visibleStyle += marginRight;visibleStyle +='%';visibleStyle +=splitor;
		
		return {visibleStr:visibleStyle,
			absMarginLeft:absML,
			absTextIndent:absTI
			};
	},
	
	_getVisibleStyleStringForImage:function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if (!PresCKUtil.checkNodeName(node, 'img'))
			return null;
		
		var splitor = '@';
		var visibleStyle = "sys_vs"+splitor;
		
		var styleStr = dojo.attr(node.$,'style');
		visibleStyle += styleStr;visibleStyle +=splitor;
		
		return visibleStyle;
	},
	
	_getVisibleStyleStringForTable:function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if (!PresCKUtil.checkNodeName(node, 'table'))
			return null;
		
		var splitor = '@';
		var visibleStyle = "sys_vs"+splitor;
		
		var tbdc = dojo.attr(node.$,'table_border_color');
		visibleStyle += tbdc;visibleStyle +=splitor;
		
		var tbgc = dojo.attr(node.$,'table_background_color');
		visibleStyle += tbgc;visibleStyle +=splitor;
		
		var tac = dojo.attr(node.$,'table_alt_color');
		visibleStyle += tac;visibleStyle +=splitor;
		
		var tsc = dojo.attr(node.$,'table_summary_color');
		visibleStyle += tsc;visibleStyle +=splitor;
		
		var thc = dojo.attr(node.$,'table_header_color');
		visibleStyle += thc;visibleStyle +=splitor;
		
		var tubs = dojo.attr(node.$,'table_use-border-styles');
		visibleStyle += tubs;visibleStyle +=splitor;
		
		var tubcs = dojo.attr(node.$,'table_use-banding-columns-styles');
		visibleStyle += tubcs;visibleStyle +=splitor;
		
		var tulcs = dojo.attr(node.$,'table_use-last-column-styles');
		visibleStyle += tulcs;visibleStyle +=splitor;
		
		var tufcs = dojo.attr(node.$,'table_use-first-column-styles');
		visibleStyle += tufcs;visibleStyle +=splitor;

		var tulrs = dojo.attr(node.$,'table_use-last-row-styles');
		visibleStyle += tulrs;visibleStyle +=splitor;
		
		var tufrs = dojo.attr(node.$,'table_use-first-row-styles');
		visibleStyle += tufrs;visibleStyle +=splitor;
		
		var tubrs = dojo.attr(node.$,'table_use-banding-rows-styles');
		visibleStyle += tubrs;visibleStyle +=splitor;
		
		var turs = dojo.attr(node.$,'table_use-rows-styles');
		visibleStyle += turs;visibleStyle +=splitor;
		
		return visibleStyle;
	},
	
	_getVisibleStyleStringForTr:function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if (!PresCKUtil.checkNodeName(node, 'tr'))
			return null;
		
		var splitor = '@';
		var visibleStyle = "sys_vs"+splitor;
		
		var styleStr = dojo.attr(node.$,'style');
		visibleStyle += styleStr;visibleStyle +=splitor;
		
		var preRowHeight = dojo.attr(node.$,'presrowheight');
		visibleStyle += preRowHeight;visibleStyle +=splitor;
		
		return visibleStyle;
	},
	
	_getVisibleStyleStringForTd: function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if (!PresCKUtil.checkNodeName(node, 'td','th'))
			return null;
		var computedStyle = dojo.getComputedStyle(node.$);
		
		var splitor = '@';
		var visibleStyle = "sys_vs"+splitor;
		
		var bgColor = computedStyle.backgroundColor;
		visibleStyle += bgColor;visibleStyle +=splitor;
		
		var editor = window.pe.scene.slideEditor;
		var paddingLeft = editor.PxToPercent(parseFloat(computedStyle.paddingLeft),'width');
		visibleStyle += paddingLeft;visibleStyle +='%';visibleStyle +=splitor;
		
		var paddingRight = editor.PxToPercent(parseFloat(computedStyle.paddingRight),'width');
		visibleStyle += paddingRight;visibleStyle +='%';visibleStyle +=splitor;
		
		var paddingTop = editor.PxToPercent(parseFloat(computedStyle.paddingTop),'height');
		visibleStyle += paddingTop;visibleStyle +='%';visibleStyle +=splitor;
		
		var paddingBottom = editor.PxToPercent(parseFloat(computedStyle.paddingBottom),'height');
		visibleStyle += paddingRight;visibleStyle +='%';visibleStyle +=splitor;
		
		var vertAlign = computedStyle.verticalAlign;
		visibleStyle += vertAlign;visibleStyle +=splitor; 
		
		return visibleStyle;
	},
	
	_getVisibleStyleStringForDrawFrameClasses:function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if (!PresCKUtil.checkNodeName(node, 'div'))
			return null;
		
		var computedStyle = dojo.getComputedStyle(node.$);
		
		var splitor = '@';
		var visibleStyle = "sys_vs"+splitor;
		// background properties
		
		var bgColor = computedStyle.backgroundColor;
		visibleStyle += bgColor;visibleStyle +=splitor;
		
		var bgPosition = computedStyle.backgroundPosition;
		visibleStyle += bgPosition;visibleStyle +=splitor;
		
		var bgRepeated = computedStyle.backgroundRepeat;
		visibleStyle += bgRepeated;visibleStyle +=splitor;
		
		var bgSize = computedStyle.backgroundSize;
		visibleStyle += bgSize;visibleStyle +=splitor;
		
		var wordWrap = computedStyle.wordWrap;
		visibleStyle += wordWrap;visibleStyle +=splitor;
		
		var vertAlign = computedStyle.verticalAlign;
		visibleStyle += vertAlign;visibleStyle +=splitor;
		
		return visibleStyle;
	},
	
	_getVisibleStyleStringForDrawFrame:function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if (!PresCKUtil.checkNodeName(node, 'div'))
			return null;
		var computedStyle = dojo.getComputedStyle(node.$);
		
		var splitor = '@';
		var visibleStyle = "sys_vs"+splitor;
		
		var positionValue = node.getStyle('position');
		visibleStyle += positionValue;visibleStyle +=splitor;
		
		var topValue = node.getStyle('top');
		visibleStyle += topValue;visibleStyle +=splitor;
		
		
		var leftValue = node.getStyle('left');
		visibleStyle += leftValue;visibleStyle +=splitor;
		
		var widthValue = node.getStyle('width');
		visibleStyle += widthValue;visibleStyle +=splitor;
		
		var heightValue = node.getStyle('height');
		visibleStyle += heightValue;visibleStyle +=splitor;
		
		var zIndex = node.getStyle('zIndex');
		visibleStyle += zIndex;visibleStyle +=splitor;
		
		var bgObjectes = dojo.attr(node.$,'draw_layer');
		visibleStyle += bgObjectes;visibleStyle +=splitor;
		
		var emptyPlaceholder = PresCKUtil.checkEmptyPlaceholder(node)? 'emptyPlaceholder':'';
		visibleStyle += emptyPlaceholder;visibleStyle +=splitor;
		
		var presClass = dojo.attr(node.$,'presentation_class');
		visibleStyle += presClass;visibleStyle +=splitor;

		return visibleStyle;
	},

	
	_getVisibleStyleStringForSpan:function(_node){
		var node = PresCKUtil.ChangeToCKNode(_node);
		if(PresCKUtil.checkNodeName(node, '#text'))
			node = node.getParent();
		if(!PresCKUtil.checkNodeName(node, 'span'))
			return null;
		var computedStyle = dojo.getComputedStyle(node.$);
		
		// get font size
		// we need to get font size through the get absValue,
		//since it may have acurrency issue if we use computed style
		var fontSize = PresCKUtil.getAbsoluteValue(node,PresConstants.ABS_STYLES.FONTSIZE);
		if (!fontSize || fontSize.length==0) {
			// if could not get abs value, it means the html structure wrong, leave the font size blank
			console.info("Failed to get the abs-font-size, so use the computed font size instead");
			fontSize= PresFontUtil.convertFontsizeToPT(computedStyle.fontSize);
		}
		fontSize = parseInt(fontSize*100);
		
		// get other font sytle, include: font weight, font style, font family
		var splitor = '@';
		var visibleString = "sys_vs"+splitor;
		visibleString+=fontSize;visibleString+=splitor;
		var fontWeight = parseInt(computedStyle.fontWeight);
		if(fontWeight == 400)
			fontWeight = 'normal';
		else if(fontWeight == 700)
			fontWeight = 'bold';
		else
			fontWeight = computedStyle.fontWeight;
		visibleString+=fontWeight;visibleString+=splitor;
		visibleString+=computedStyle.fontStyle;visibleString+=splitor;
		visibleString+=computedStyle.fontFamily;visibleString+=splitor;
		visibleString+=PresCKUtil.normalizeColorValue( computedStyle.color );visibleString+=splitor;
		visibleString+=computedStyle.textDecoration;
		return visibleString;
	},
	
	_DecodeVisibleStyleForTable:function(tlNode, bOnlyRemove)
	{
		tlNode = tlNode.$ || tlNode;
		if (!PresCKUtil.checkNodeName(tlNode,'table'))
			return;
		
		var visibleStyles = dojo.attr( tlNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		
		var styles = ['sys_vs','table_border_color','table_background_color','table_alt_color','table_summary_color',
		              'table_header_color','table_use-border-styles','table_use-banding-columns-styles','table_use-last-column-styles',
		              'table_use-first-column-styles','table_use-last-row-styles','table_use-first-row-styles',
		              'table_use-banding-rows-styles','table_use-rows-styles'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t>0 && t<=13 )
					{	
						if (!inlineStyles[t].match(/null/))
							dojo.attr(tlNode,styles[t],inlineStyles[t]);
					}
				}
			}
		}
		tlNode.removeAttribute('_visibleStyle');
	},
	
	_DecodeVisibleStyleForTr:function(trNode, bOnlyRemove)
	{
		trNode = trNode.$ || trNode;
		if (!PresCKUtil.checkNodeName(trNode,'tr'))
			return;
		
		var visibleStyles = dojo.attr( trNode, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		var styles = ['sys_vs','style','presrowheight'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t>0 && t<=2 )//row height
					{	
						dojo.attr(trNode,styles[t],inlineStyles[t]);
					}
				}
			}
		}
		trNode.removeAttribute('_visibleStyle');
	},
	
	_DecodeVisibleStyleForImage:function(imgNode, bOnlyRemove)
	{
		if (!PresCKUtil.checkNodeName(imgNode,'img'))
			return;
		
		var visibleStyles = dojo.attr( imgNode.$, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		var styles = ['sys_vs','style'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t==1 )//row height
					{	
						dojo.attr(imgNode.$,styles[t],inlineStyles[t]);
					}							
				}
			}
		}
		imgNode.removeAttribute('_visibleStyle');
	},
	
	_DecodeVisibleStyleForTd:function(tdNode, bOnlyRemove)
	{
		if (!PresCKUtil.checkNodeName(tdNode,'td','th'))
			return;
		
		var visibleStyles = dojo.attr( tdNode.$, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		var styles = ['sys_vs','background-color','padding-left',
		              'padding-right','padding-top','padding-bottom','vertical-align'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				tdNode.setStyle('background-image','none');
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t==1 )
					{	
						if (inlineStyles[t].match(/transparent/))
							tdNode.setStyle(styles[t],'');
						else
							tdNode.setStyle(styles[t],inlineStyles[t]);
					} else if ( t > 1 && t < 7) {
						tdNode.setStyle(styles[t],inlineStyles[t]);	
					} else {
						// TODO for other properties
					}
				}
			}
		}
		tdNode.removeAttribute('_visibleStyle');
	},
	
	_DecodeVisibleStyleForLineItem:function(lineItem, bOnlyRemove)
	{
		if (!PresCKUtil.checkNodeName(lineItem,'li','p'))
			return;
		
		var visibleStyles = dojo.attr( lineItem.$, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		var styles = ['sys_vs','style','text-align','margin-top',
		              'margin-bottom','margin-left','margin-right'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t>1 && t<7 )
					{
						var styleAttr = dojo.attr(lineItem.$,'style');
						if ((styleAttr && !styleAttr.match(styles[t])) 
								|| styleAttr == '' || styleAttr == null)
							lineItem.setStyle(styles[t],inlineStyles[t]);	
					}
					else if (t == 1){
						// for style, restore it first
						if (!inlineStyles[t].match(/null/))
							dojo.attr(lineItem.$,'style',inlineStyles[t]);
					}							
				}
			}
		}
		lineItem.removeAttribute('_visibleStyle');
	},
	
	_DecodeVisibleStyleForDrawFrameClass:function(divNode, bOnlyRemove)
	{
		if (!PresCKUtil.checkNodeName(divNode,'div') ||
				!dojo.hasClass(divNode.$,'draw_frame_classes'))
			return;
		
		var visibleStyles = dojo.attr( divNode.$, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		
		var styles = ['sys_vs','background-color','background-position','background-repeated',
		              'background-size','word-wrap','vertical-align'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				divNode.setStyle('background','');
				divNode.setStyle('background-image','none');
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t>0 && t<7 )
					{
						divNode.setStyle(styles[t],inlineStyles[t]);	
					} else {
						// TODO for other properties
					}					
				}
			}
		}
		divNode.removeAttribute('_visibleStyle');
	},
	
	_DecodeVisibleStyleForDrawFrame:function(divNode, bOnlyRemove)
	{
		if (!PresCKUtil.checkNodeName(divNode,'div') ||
				!dojo.hasClass(divNode.$,'draw_frame'))
			return;
		
		var visibleStyles = dojo.attr( divNode.$, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		var styles = ['sys_vs','position','top','left','width','height','zIndex','draw_layer'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t>0 && t<=6 )
					{
						divNode.setStyle(styles[t],inlineStyles[t]);	
					}
					else if (t==7){
						dojo.attr(divNode,styles[t],inlineStyles[t]);
					}							
				}
			}
		}
		divNode.removeAttribute('_visibleStyle');
	},

	
	_DecodingVisibleStyle:function(spanNode,bOnlyRemove)
	{
		var visibleStyles = dojo.attr( spanNode.$, '_visibleStyle');
		if (visibleStyles == undefined || visibleStyles == null){
			return;
		}
		var styles = ['sys_vs','font-size','font-weight','font-style','font-family','color','text-decoration'];
		if ( visibleStyles.match(/^sys_vs@/)){
			if(!bOnlyRemove)
			{
				var inlineStyles = visibleStyles.split('@');
				for ( var t = 1 ; t < inlineStyles.length; t++)
				{
					if(t==1)//Fontsize
					{
						var absFontSize = parseInt(inlineStyles[t]);
						absFontSize = absFontSize/100;
						PresCKUtil.setCustomStyle(spanNode,PresConstants.ABS_STYLES.FONTSIZE,absFontSize);
					}
					else
						spanNode.setStyle(styles[t],inlineStyles[t]);								
				}
			}
		}
		spanNode.setStyle('background-image','');
		spanNode.removeAttribute('_visibleStyle');
	},
	
	_CopySingleParagraph : function(range, lc) {
		var originalRange = range.clone();
		// Directly use range clone contents
		// which only contains selected content
		var frag = range.cloneContents(true);
		range = originalRange;
		range.select();

		var targetLine = lc;
		
		//check whether we selected whole line
		var startblock = MSGUTIL.getBlock(range.startContainer);
		if(startblock && startblock.is && startblock.is('ol','ul','li','p'))
		{
			var pureTextLine = PresListUtil._getTextContent(startblock);
			var pureTextLineSelected  = PresListUtil._getTextContent(frag);
			if(pureTextLine == pureTextLineSelected)
			{
				var line = startblock;
				if(startblock.is('li'))
					line = line.getParent();
				var cloneLine = line.clone(true);
				var cloneLineItem = PresListUtil.getLineItem(cloneLine);
				var child = cloneLineItem.getFirst();
				while(child) {
					var node = child;
					child = child.getNext();
					dojo.destroy(node.$);
				}
				lc.append(cloneLine);
				targetLine = cloneLineItem;
			}
		}
		

		
		var spanElement = null;
		var tempArray = [];
		var child = frag.getFirst();
		while(child) {
			// for a single line, children[i] can be
			// (span, br, a, #text, li)
			// li and #text should be set a parent
			// append and remove api will remove previous child
			// so when handling next child, its previous context
			// will be null
			if (PresCKUtil.checkNodeName(child, 'li')) {
				var liChild = child.getFirst();
				while(liChild) {
					if(PresListUtil._IsValidSpanLevelNode(liChild))
						targetLine.append(liChild);
					else
						dojo.destroy(liChild.$);
					liChild = child.getFirst();
				}
				dojo.destroy(child.$);
			} else if (PresCKUtil.checkNodeName(child, '#text')) {
				if (!spanElement) {
					spanElement = 
						range.startContainer.getAscendant('span', true);
					if (spanElement)
						spanElement = spanElement.clone();
					else
						spanElement = range.document.createElement('span');
					targetLine.append(spanElement);
				}
				var styleString = child.getCustomData('visible_style');
				if(styleString)
					dojo.attr(spanElement,'_visibleStyle',styleString);
				spanElement.append(child);
			} else {  // should be span level node(span, br, a)
				if(PresListUtil._IsValidSpanLevelNode(child))
					targetLine.append(child);
				else
					dojo.destroy(child.$);
			}
			child = frag.getFirst();
		}
		
		return true;
	},
	
	_CopyMultipleParagraph : function(range, lc) {
		var originalRange = range.clone();
		var frag = range.cloneContents(true);
		range = originalRange;
		range.select();	
				
		var lineList=[];
		var children = frag.getChildren();
		for(var i=0;i<children.count();i++)
		{
			var child = children.getItem( i );
			if(!child.is('ul','ol','p'))
				return false;
			lineList.push(child);
		}
		
		for(var i in lineList)
		{
			lc.append(lineList[i]);
		}
		return true;
	},
	
	_EnCodingDataForBrowser : function(clipBoardData, srcData)
	{
		clipBoardData = PresCKUtil.ChangeToCKNode(clipBoardData);
		// encode position and size
		if (dojo.hasClass(clipBoardData.$, 'draw_frame')){
			var nodeId = dojo.attr(clipBoardData.$,'id');
			var srcDiv = dojo.byId(nodeId);
			if (!srcDiv){
				srcDiv = dojo.byId(nodeId,window.pe.scene.slideSorter.getSorterDocument());
			}
			if (srcDiv){
				var visibleStyle =
					this._getVisibleStyleStringForDrawFrame(srcDiv);
				if (visibleStyle)
					clipBoardData.setAttribute('_visibleStyle', visibleStyle);
			}
		}else{
			dojo.query('div.draw_frame',clipBoardData.$).forEach(function(_node){
				var divNode = PresCKUtil.ChangeToCKNode(_node);
				var nodeId = dojo.attr(divNode.$,'id');
				var srcDiv = dojo.byId(nodeId);
				var adjustBorder = false;
				if (!srcDiv){
					srcDiv = dojo.byId(nodeId,window.pe.scene.slideSorter.getSorterDocument());
					
					if(dojo.query('img', srcDiv).length > 0){
						var adjustValue = -8;
						var oldTop = srcDiv.style.top;
						var oldLeft = srcDiv.style.left;
						var curPositionTopPx = parseFloat(srcDiv.style.top || 0) * srcDiv.parentNode.offsetHeight /100;
						var curPositionLeftPx = parseFloat(srcDiv.style.top || 0) * srcDiv.parentNode.offsetWidth /100;
						var curPositionTopPct = window.pe.scene.slideEditor.PxToPercent(curPositionTopPx+adjustValue, 'height');
						var curPositionLeftPct = window.pe.scene.slideEditor.PxToPercent(curPositionLeftPx+adjustValue, 'width');
						if ((curPositionTopPct != Infinity) && (curPositionTopPct != -Infinity)  && (curPositionLeftPct != Infinity) && (curPositionLeftPct != -Infinity)) {
							dojo.style(srcDiv,{
								'top':curPositionTopPct+"%",
								'left':curPositionLeftPct+"%"
							});
						}
						adjustBorder = true;
					}
				}
				if (srcDiv && srcDiv != null){
					var visibleStr = PresListUtil._getVisibleStyleStringForDrawFrame(srcDiv);
					if (visibleStr)
						divNode.setAttribute('_visibleStyle', visibleStr);
					if(adjustBorder){
						dojo.style(srcDiv,{
							'top':oldTop,
							'left':oldLeft
						});
					}
				}
			});
		}
		
		dojo.query('div.draw_frame_classes',clipBoardData.$).forEach(function(_node){
			var divNode = PresCKUtil.ChangeToCKNode(_node);
			var divId = dojo.attr(divNode.$,'id');
			var srcDiv = dojo.byId(divId);
			if (!srcDiv){
				srcDiv = dojo.byId(divId,window.pe.scene.slideSorter.getSorterDocument());
			}
			if (srcDiv && srcDiv != null){
				var visibleStr = PresListUtil._getVisibleStyleStringForDrawFrameClasses(srcDiv);
				if (visibleStr && visibleStr != null)
					divNode.setAttribute('_visibleStyle', visibleStr);
			}
		});
		
		dojo.query('table',clipBoardData.$).forEach(function(_node){
			var ckTable = PresCKUtil.ChangeToCKNode(_node);
			var visibleStyle =
				PresListUtil._getVisibleStyleStringForTable(ckTable);
			if (visibleStyle && visibleStyle !=null)
				ckTable.setAttribute('_visibleStyle', visibleStyle);
		});
		
		dojo.query('tr',clipBoardData.$).forEach(function(_node){
			var ckTr = PresCKUtil.ChangeToCKNode(_node);
			var visibleStyle =
				PresListUtil._getVisibleStyleStringForTr(ckTr);
			if (visibleStyle && visibleStyle !=null)
				ckTr.setAttribute('_visibleStyle', visibleStyle);
		});
		
		//handle colgroup when copy
		dojo.query('colgroup',clipBoardData.$).forEach(function(colgroup){
			for(var i = 0, len = colgroup.childNodes.length; i < len; i++){
				var col = colgroup.childNodes[i];
				var _width = PresTableUtil.getWidthInPercentFromStyle(col.style.cssText);
		 		dojo.attr(col, "_width", _width);
			}
		});
		
		dojo.query('td,th',clipBoardData.$).forEach(function(_node){
			var ckTd = PresCKUtil.ChangeToCKNode(_node);
			var TdId = dojo.attr(ckTd.$,'id');
			var srcTd = dojo.byId(TdId);
			if (!srcTd){
				srcTd = dojo.byId(TdId,window.pe.scene.slideSorter.getSorterDocument());
			}
			if (srcTd && srcTd != null){
				var visibleStr = PresListUtil._getVisibleStyleStringForTd(srcTd);
				if (visibleStr && visibleStr != null)
					ckTd.setAttribute('_visibleStyle', visibleStr);
			}
		});
		
		dojo.query('img', clipBoardData.$).forEach(function(_node){
			var ckImg = PresCKUtil.ChangeToCKNode(_node);
			var visibleStyle =
				PresListUtil._getVisibleStyleStringForImage(ckImg);
			if (visibleStyle && visibleStyle !=null)
				ckImg.setAttribute('_visibleStyle', visibleStyle);
		});

		//custome style
			//abs-margin-left
			//abs-font-size
		//level,startnumber,numbertype,values
		//<ol>,numbertype
		dojo.query('ol',clipBoardData.$).forEach(function(_node){				
			var olNode = PresCKUtil.ChangeToCKNode(_node);
			var numberType = olNode.getAttribute('numbertype');
			if(numberType && numberType!='')
				olNode.addClass('nt#'+numberType);//such as nt#1,nt#A
		});
		
		//<li,p>level,startnumber,values,abs-margin-left,abs-font-size
		dojo.query('li,p',clipBoardData.$).forEach(function(_node){				
			var line = PresCKUtil.ChangeToCKNode(_node);
			var lineId = dojo.attr(line.$,'id');
			var srcLine = dojo.byId(lineId);
			if (!srcLine){
				srcLine = dojo.byId(lineId,window.pe.scene.slideSorter.getSorterDocument());
			}
			var absVisibleML = null;
			var absVisibleTI = null;
			if (srcLine && srcLine != null){
				var visibleStyle = PresListUtil._getVisibleStyleStringForLineItem(srcLine);
				if(visibleStyle)
				{
					var visibleStr = visibleStyle.visibleStr;
					if (visibleStr && visibleStr != null)
						line.setAttribute('_visibleStyle', visibleStr);
					absVisibleML = visibleStyle.absMarginLeft;
					absVisibleTI = visibleStyle.absTextIndent;
				}
			}
			var level = line.getAttribute('level');
			if(level && level!='')
				line.addClass('l#'+level);//such as l#1,l#5
			
			var startnumber = line.getAttribute('startnumber');
			if(startnumber && startnumber!='')
				line.addClass('s#'+startnumber);//such as s#1,s#5
			
			var values = line.getAttribute('values');
			if(values && values!='')
				line.addClass('v#'+values);//such as v#1,v#5
			
			var abs_margin_left = PresCKUtil.getCustomStyle(line,PresConstants.ABS_STYLES.MARGINLEFT);
			if(abs_margin_left == "null")
				abs_margin_left = 0;
			abs_margin_left = parseFloat(abs_margin_left);
			if(abs_margin_left!=null && !isNaN(abs_margin_left))
			{
				abs_margin_left*=100;
				line.addClass('al#'+abs_margin_left);//such as al#100,al#500
			}
			else if(absVisibleML!=null)
			{
				abs_margin_left = absVisibleML;
				abs_margin_left*=100;
				line.addClass('avl#'+abs_margin_left);//such as al#100,al#500
			}
			
			var abs_text_indent = PresCKUtil.getCustomStyle(line,PresConstants.ABS_STYLES.TEXTINDENT);
			abs_text_indent = parseFloat(abs_text_indent);
			if(abs_text_indent!=null && !isNaN(abs_text_indent))
			{
				abs_text_indent*=100;
				line.addClass('at#'+abs_text_indent);//such as at#100,at#500
			}
			else if(absVisibleTI!=null)
			{
				abs_text_indent = absVisibleTI;
				abs_text_indent*=100;
				line.addClass('avt#'+abs_text_indent);//such as at#100,at#500
			}
			
			var abs_font_size = PresCKUtil.getCustomStyle(line,PresConstants.ABS_STYLES.FONTSIZE);
			abs_font_size = parseFloat(abs_font_size);
			if(abs_font_size!=null && !isNaN(abs_font_size))
			{
				abs_font_size*=100;
				line.addClass('af#'+abs_font_size);//such as af#100,af#500
			}
			
			// encode 'margin' for chrome in styles
			var vMargin = ['margin-right','margin-top','margin-bottom'];
			var vEnMarginName = ['mr','mt','mb'];
			for(var i=0;i<vMargin.length;i++)
			{
				var v = line.getStyle(vMargin[i]);
				if(v && v!='')
					line.addClass(vEnMarginName[i]+'#'+v);
				else
					//For D35168, in case browser add error data into line style
					line.addClass(vEnMarginName[i]+'#'+'null');
					
			}
			//For D41692, in case browser add color into line style
			var vColor = line.getStyle('color');
			if(vColor && vColor!='')
				line.addClass('clr'+'#'+vColor);
			else
				line.addClass('clr'+'#'+'null');
			
			
		});
		
		//<span>abs-font-size,color
		dojo.query('span',clipBoardData.$).forEach(function(_node){		
			var span = PresCKUtil.ChangeToCKNode(_node);
			var spanId = dojo.attr(span.$,'id');
			var srcSpan = dojo.byId(spanId);
			if (srcSpan == null)
				srcSpan = dojo.byId(spanId,window.pe.scene.slideSorter.getSorterDocument());
			if (srcSpan && srcSpan != null){
				var visibleStr = PresListUtil._getVisibleStyleStringForSpan(srcSpan);
				if (visibleStr && visibleStr != null)
					span.setAttribute('_visibleStyle', visibleStr);
			}
			
			var abs_font_size = PresCKUtil.getCustomStyle(span,PresConstants.ABS_STYLES.FONTSIZE);
			abs_font_size = parseFloat(abs_font_size);
			if(abs_font_size!=null && !isNaN(abs_font_size))
			{
				abs_font_size*=100;
				span.addClass('af#'+abs_font_size);//such as af#100,af#500
			}
			
			var color = span.getStyle('color');
			if(color && color!='')
			{
				color = PresCKUtil.normalizeColorValue( color );
				span.addClass('c#'+color);//such as c##ff00aa
			}
			
			var html = span.getHtml();
			//D33788 [Regression][B2B][Safari]Empty space is lost after copy&paste
			//TODO, workaround to fix this defect, needs more investigation
			if(dojo.isSafari){
				html = span.getText();
				var ret = [];
				for(var i = 0, len = html.length; i < len; i++){
					var eachCh = html.charAt(i);
					var charCode = eachCh.charCodeAt(0);
					if(charCode == 32 || charCode == 160){
						//32: nbsp; 160:blank space
						ret.push("&#8203;&nbsp;&#8203;");
					}else{
						ret.push(eachCh);
					}
				}
				html = ret.join("");
			}else{
				var childNode = span.getFirst();
				if (childNode && PresCKUtil.checkNodeName(childNode,'#text'))
					html = html.replace(/\ /g,"&nbsp;");
			}
			span.setHtml(html);
		});		
	},

	_DeCodingDataForBrowser : function(clipBoardData, isFromExtPres)
	{
		
		function _getClassArray(node)
		{
	 		//The following code is set for real support master page
			var clsString = dojo.attr( node.$, 'class');
			if (clsString == undefined || clsString == null){
				clsString = " ";
			}
			var clses = clsString.split(' ');
			return clses;
		};
		
		//return is string
		function _getData(str)
		{
  	        var ndx = str.indexOf( '#' );
  	        if (ndx >= 0)
  	        {
  	        	var ts = str.substring(ndx+1, str.length);
  	        	return ts;
  	        }
  	        return null;
		}
		
		// justify whether it's copied from another presentation file
		function _fromDifferentFile(node) {
			var node_uri = node.getAttribute('_docUUID');
			if (node_uri && node_uri != window.pe.scene.session.uri) {
				return true;
			}
			return false;
		}
		
		//custome style
			//abs-margin-left
			//abs-font-size
		//level,startnumber,numbertype,values
		//<ol>,numbertype
		var domClipBoardData = clipBoardData.$ ? clipBoardData.$ : clipBoardData;
		// In IE9, a <font> will be added as parent or child of a span
		// When content is extracted from clipboard by browser.
		// Here remove it
		// 
		var newHtml = concord.util.presCopyPasteUtil.transformFontNodes(domClipBoardData.innerHTML);
		if (newHtml && newHtml.length > 0 && (domClipBoardData.innerHTML !== newHtml)) {
			var div = new CKEDITOR.dom.element("div");
			if(newHtml.toLowerCase().indexOf("<tbody") == 0 && CKEDITOR.env.ie && concord.util.browser.getIEVersion() <= 9) {
				div.$.innerHTML="<table>"+newHtml+"</table>";
				domClipBoardData.innerHTML = '';
				domClipBoardData.appendChild(div.getFirst().getFirst().$);
				dojo.destroy(div.$);
			}else 
				domClipBoardData.innerHTML = newHtml;
			// IE9 table.innerHTML is read only.
			// Excepe for supported table nodes(tr, td..), other related table nodes
			// innerHTML is also read only. Cannot count them
			// So here just constraint ie 9 or smaller
		}
		
		if(dojo.isWebKit)
		{
			dojo.query('ol,ul',domClipBoardData).forEach(function(_node){				
				_node.removeAttribute('style');
			});
		}	
		
		if (dojo.hasClass(domClipBoardData,'draw_frame')) {
			var divNode = PresCKUtil.ChangeToCKNode(domClipBoardData);
			if (isFromExtPres){
				PresListUtil._DecodeVisibleStyleForDrawFrame(divNode);
			}
			divNode.removeAttribute('_visibleStyle');
		} else {
			// decode visible style for draw frame
			dojo.query('div.draw_frame',domClipBoardData).forEach(function(_node){	
				var divNode = PresCKUtil.ChangeToCKNode(_node);
				if (isFromExtPres){
					PresListUtil._DecodeVisibleStyleForDrawFrame(divNode);
				}
				divNode.removeAttribute('_visibleStyle');
			});
		}
		
		dojo.query('div.draw_frame_classes',domClipBoardData).forEach(function(_node){
			var divNode = PresCKUtil.ChangeToCKNode(_node);
			if (isFromExtPres){
				PresListUtil._DecodeVisibleStyleForDrawFrameClass(divNode);
			}
			divNode.removeAttribute('_visibleStyle');
		});
		
		//D40051: [FF]Table  export from IBM docs, has background when open in Symphony or AOO 
		dojo.query('table',domClipBoardData).forEach(function(_node){
			var tableNode = PresCKUtil.ChangeToCKNode(_node);
			var tableTemplateName = tableNode.getAttribute('_table_template-name');
			tableTemplateName && tableNode.setAttribute('table_template-name',tableTemplateName);
			tableNode.removeAttribute('_table_template-name');
			PresListUtil._DecodeVisibleStyleForTable(tableNode);
		});
		
		dojo.query('tr',domClipBoardData).forEach(function(_node){
			PresListUtil._DecodeVisibleStyleForTr(_node);
		});
		
		//handle colgroup when paste
		dojo.query('colgroup',domClipBoardData).forEach(function(colgroup){
     		var subGrp = colgroup.childNodes,
     			total = 0;
     		for(var i = 0, len = subGrp.length; i < len; i++){
     			var subNode = subGrp[i];
     			//D41838, copy from excel, colgroup contains a text node.
     			if(!PresCKUtil.checkNodeName(subNode, "col"))
     				continue;
     			var _width = parseFloat(dojo.attr( subNode,'_width'));
     			total += _width;
     		}
     		var total1 = 0;
     		for(var i = 0, len = subGrp.length - 1; i < len; i++){
     			var subNode = subGrp[i];
     			//D41838, copy from excel, colgroup contains a text node.
     			if(!PresCKUtil.checkNodeName(subNode, "col"))
     				continue;
     			var _width = parseFloat(dojo.attr( subNode,'_width'));
     			_width = parseFloat(_width / total * 100).toFixed(2);
     			total1 += parseFloat(_width);
     			dojo.style(subNode, "width", _width + "%");
     			dojo.removeAttr(subNode, "_width");
     		}
     		if(PresCKUtil.checkNodeName(subGrp[i], "col")){
     			var _width = parseFloat(dojo.attr( subGrp[i],'_width'));
     			dojo.style(subGrp[i], "width", (100 - total1) + "%");
     			dojo.removeAttr(subGrp[i], "_width");
     		}
		});
		
		dojo.query('td,th',domClipBoardData).forEach(function(_node){
			var tdNode = PresCKUtil.ChangeToCKNode(_node);
			if (isFromExtPres){
				PresListUtil._DecodeVisibleStyleForTd(tdNode);
			}
			tdNode.removeAttribute('_visibleStyle');
		});
		
		dojo.query('img',domClipBoardData).forEach(function(_node){
			var imgNode = PresCKUtil.ChangeToCKNode(_node);
			if (isFromExtPres){
				PresListUtil._DecodeVisibleStyleForImage(imgNode);
			}
			imgNode.removeAttribute('_visibleStyle');
		});
		
		dojo.query('ol',domClipBoardData).forEach(function(_node){				
			var olNode = PresCKUtil.ChangeToCKNode(_node);
//			var numberType = olNode.getAttribute('numbertype');
//			if(numberType && numberType!='')
//				olNode.addClass('nt#'+numberType);//such as nt#1,nt#A
			var clses = _getClassArray(olNode);
			for ( var j = 0 ; j < clses.length; j++)
			{
				if ( clses[j].match(/^nt#/))
				{
					var numberType = _getData(clses[j]);
					dojo.removeClass( olNode.$, clses[j]);
					olNode.setAttribute('numbertype',numberType);
				}
			}
		});
		
		var from_different_file = _fromDifferentFile(clipBoardData);
		//<li,p>level,startnumber,values,abs-margin-left,abs-font-size
		dojo.query('li,p',domClipBoardData).forEach(function(_node){				
			var line = PresCKUtil.ChangeToCKNode(_node);
			if (from_different_file) {
				PresListUtil.removeListClass(line, true, true, true, true);
			}
			if (isFromExtPres) {
				PresListUtil._DecodeVisibleStyleForLineItem(line,false);
			}
			line.removeAttribute('_visibleStyle');
			var clses = _getClassArray(line);
			for ( var j = 0 ; j < clses.length; j++)
			{
				if ( clses[j].match(/^l#/))
				{
					var level = _getData(clses[j]);
					dojo.removeClass( line.$, clses[j]);
					line.setAttribute('level',level);
					if(line.is('li')){
						dijit.setWaiRole(line.getParent(), 'list');
						dijit.setWaiRole(line, 'listitem');
						dijit.setWaiState(line,'level', level);
					}
				}
				else if ( clses[j].match(/^s#/))
				{
					var startnumber = _getData(clses[j]);
					dojo.removeClass( line.$, clses[j]);
					line.setAttribute('startnumber',startnumber);
				}
				else if ( clses[j].match(/^v#/))
				{
					var values = _getData(clses[j]);
					dojo.removeClass( line.$, clses[j]);
					line.setAttribute('values',values);
				}
				else if ( clses[j].match(/^al#/))
				{
					dojo.removeClass( line.$, clses[j]);
					var abs_margin_left = _getData(clses[j]);
					abs_margin_left = parseFloat(abs_margin_left);
					abs_margin_left/=100.0;
					PresCKUtil.setCustomStyle(line,PresConstants.ABS_STYLES.MARGINLEFT,abs_margin_left);
				}
				else if ( clses[j].match(/^avl#/) )//visible to abs
				{
					dojo.removeClass( line.$, clses[j]);
					var abs_margin_left = PresCKUtil.getCustomStyle(line,PresConstants.ABS_STYLES.MARGINLEFT);
					if((abs_margin_left == null) && isFromExtPres )
					{
						abs_margin_left = _getData(clses[j]);
						abs_margin_left = parseFloat(abs_margin_left);
						abs_margin_left/=100.0;
						PresCKUtil.setCustomStyle(line,PresConstants.ABS_STYLES.MARGINLEFT,abs_margin_left);
					}
				}
				else if ( clses[j].match(/^at#/))
				{
					dojo.removeClass( line.$, clses[j]);
					var abs_text_indent = _getData(clses[j]);
					abs_text_indent = parseFloat(abs_text_indent);
					abs_text_indent/=100.0;
					PresCKUtil.setCustomStyle(line,PresConstants.ABS_STYLES.TEXTINDENT,abs_text_indent);
				}
				else if ( clses[j].match(/^avt#/))
				{
					dojo.removeClass( line.$, clses[j]);
					var abs_text_indent = PresCKUtil.getCustomStyle(line,PresConstants.ABS_STYLES.TEXTINDENT);
					if((abs_text_indent == null) && isFromExtPres )
					{
						abs_text_indent = _getData(clses[j]);
						abs_text_indent = parseFloat(abs_text_indent);
						abs_text_indent/=100.0;
						PresCKUtil.setCustomStyle(line,PresConstants.ABS_STYLES.TEXTINDENT,abs_text_indent);
					}
				}
				
				else if ( clses[j].match(/^af#/))
				{
					dojo.removeClass( line.$, clses[j]);
					var abs_font_size = _getData(clses[j]);
					abs_font_size = parseFloat(abs_font_size);
					abs_font_size/=100.0;
					PresCKUtil.setCustomStyle(line,PresConstants.ABS_STYLES.FONTSIZE,abs_font_size);
				}
				else if (clses[j].match(/^mr#/)
						||clses[j].match(/^mt#/)
						||clses[j].match(/^mb#/))
				{
					dojo.removeClass( line.$, clses[j]);
					var margin = _getData(clses[j]);
					// encode 'margin' for chrome in styles
					var vMargin = ['margin-right','margin-top','margin-bottom'];
					var vEnMarginName = [/^mr#/,/^mt#/,/^mb#/];
					for(var i=0;i<vEnMarginName.length;i++)
					{
						if(clses[j].match(vEnMarginName[i]))
						{
							if(margin == 'null')
								line.removeStyle(vMargin[i]);
							else
								line.setStyle(vMargin[i], margin);
							break;
						}
					}
				}
				else if ( clses[j].match(/^clr#/))
				{
					dojo.removeClass( line.$, clses[j]);
					var color = _getData(clses[j]);
					if(color == 'null')
						line.removeStyle('color');
					else
						line.setStyle('color', color);
				}
			}
		});
		
		//<span>abs-font-size
		dojo.query('span',domClipBoardData).forEach(function(_node){		
			var span = PresCKUtil.ChangeToCKNode(_node);
			// justify whether it's from table, if yes, decode span style here
			// in the further, we need to open the condition and move all the
			// decoding logic here, not in each paste process
			var tbodyNode = span.getAscendant('tbody');
			if (isFromExtPres || tbodyNode) {
				PresListUtil._DecodingVisibleStyle(span,false);
			}
			var clses = _getClassArray(span);
			for ( var j = 0 ; j < clses.length; j++)
			{
				if ( clses[j].match(/^af#/))
				{
					dojo.removeClass( span.$, clses[j]);
					var abs_font_size = _getData(clses[j]);
					abs_font_size = parseFloat(abs_font_size);
					abs_font_size/=100.0;
					PresCKUtil.setCustomStyle(span,PresConstants.ABS_STYLES.FONTSIZE,abs_font_size);
				}
				else if ( clses[j].match(/^c#/))
				{
					dojo.removeClass( span.$, clses[j]);
					var color = _getData(clses[j]);
					span.setStyle('color',color);
				}
			}
			
			var html = span.getHtml();
			//D33788 [Regression][B2B][Safari]Empty space is lost after copy&paste
			//TODO, workaround to fix this defect, needs more investigation
			if(dojo.isSafari){
				//prevent the span without text but with child in case there is child for copy data
//				In safari 5.1.7, (span, div). don't match the if condition, so this scenario could go right. paste table data as a whole object 
//				scenario: copy cells from a table, paste them in view mode. issue: paste result is text other than table.
				if(_node.childElementCount>0)
					return;
				html = span.getText();
				var ret = [];
				for(var i = 0, len = html.length; i < len; i++){
					var eachCh = html.charAt(i);
					var charCode = eachCh.charCodeAt(0);
					if(charCode == 8203 || charCode == 65279){
						i++;
						var nextCH = html.charAt(i);
						var next = nextCH.charCodeAt(0);
						if(next == 32 || next == 160)
							ret.push("&nbsp;");
						else{
							if((next != 8203) && (next !=65279)){
								ret.push(nextCH);
							}
						}
					}else{
						ret.push(eachCh);
					}
				}
				html = ret.join("");
			}				
			html = html.replace( /&nbsp;/g, ' ' );
			html = html.replace( /  /g, ' &nbsp;' );
			
			if(html.length == 1 && (html.charCodeAt(0)== 32 || (html.charCodeAt(0)== 160)) )
				span.setHtml(" ");
			else 
				span.setHtml(html);
		});
	},
	
	_copySelectedCells : function(selectedCells, lc) {
		if (!selectedCells || selectedCells.length == 0)
			return false;
		
		// Get cells common ancestor table and tbody
		var tableNode = concord.util.presCopyPasteUtil.buildNewTableWithSelectedCells(selectedCells);
		if(tableNode){
			lc.append(tableNode);
			return true;
		}
		
		return false;
	},
	
	prepareListClipboardCopyData : function(range)
	{
		//we should destry pre clipborad data
		CKEDITOR.plugins.clipboard = null;
		if ( range.collapsed )
		{
			return null;
		}
		
		var lc = new CKEDITOR.dom.element('div') ;
		lc.addClass('list_clipboard_copydata');		//Startline and end line are same line
		lc.setAttribute('_docUUID',window.pe.scene.session.uri); //for copy&paste between different presentation file
		
		var isCellSelected = false;
		var editor = PresCKUtil.getCurrentEditModeEditor();
		var selectedCells = PresListUtil.getSelectedTableCells( editor.getSelection());
		if (selectedCells.length == 1) {
			 //selection is tr node
			if(PresCKUtil.checkNodeName(range.startContainer,"tr","table") 
					&& (Math.abs(range.endOffset - range.startOffset) === 1))
				isCellSelected = true;
			//selection is td node
			if(range.collapsed && PresCKUtil.checkNodeName(range.startContainer,"td") 
					&& (Math.abs(range.endOffset - range.startOffset) === 1))
				isCellSelected = true;
				
		} else if(selectedCells.length > 1) {
			isCellSelected = true;
		}

		if(isCellSelected) {
			if (!PresListUtil._copySelectedCells(selectedCells, lc)) {
				return null;
			}
		} else {
			//here we should check whether range selected is all list
			//Get the information about range selection
			var selInfo = PresListUtil._getRangeListSelection(range);
			if(!selInfo)
			{
				return null;
			}
			
			if(selInfo.startlineInfo.index == selInfo.endlineInfo.index)
			{
				if (!PresListUtil._CopySingleParagraph(range, lc))
					return null;
			} else {
				if (!PresListUtil._CopyMultipleParagraph(range, lc))
					return null;
			}
		}
		
		//En-code lc for browser copy & paste
		PresListUtil._EnCodingDataForBrowser(lc);
		lc = concord.util.presCopyPasteUtil.removeIndicatorForCopy(lc.$);
	    return lc;
	},
	
	_getPastePosLine : function (range) {
		var insertPosline = null;
		//Get the information about range selection
		selInfo = PresListUtil._getRangeListSelection(range);
		if(!selInfo)
		{
			return null;
		}
		var insertPosline = null;//this line after insert will be removed
		//if cursor stay on empty line, insert copy line since this
		if(PresCKUtil.isNodeTextEmpty(selInfo.startlineInfo.line)) {
			var previousLine = selInfo.startlineInfo.line.getPrevious();
			if(previousLine && PresCKUtil.isNodeTextEmpty(previousLine)){
				//destroy the new created line
				dojo.destroy(selInfo.startlineInfo.line.$);
				insertPosline = previousLine;
			} else {
				insertPosline = selInfo.startlineInfo.line;
			}
		} else {
			//if cursor stay on non-empty line,find the line before the cursor line
			//otherwise we need insert before current line
			var preline = selInfo.startlineInfo.line.getPrevious();
			if(preline)
			{
				//	if previous line is empty, this the empty line we need
				//otherwise we need insert before current line
				if(PresCKUtil.isNodeTextEmpty(preline))
					insertPosline = preline;
			}
		}
		
		if(!insertPosline)
		{
			//we could not find an empty line after enter,
			// and then we will generate an empty line insert before current line
			insertPosline = selInfo.startlineInfo.line.clone();
			insertPosline.insertBefore(selInfo.startlineInfo.line);
		}
		return insertPosline;
	},
	
	//split nodea according current range selection
	//if range selection, delete first
	//return {preSpanNode,postSpanNode} <preSpanNode>|<postSpanNode>
	//[Note],this is tool function, after split, it won't reset range, 
	//so you must handle range continuely
	_splitNode: function(range)
	{
		var originalRange = range.clone();
		if (!range.collapsed){
			var re = PresListUtil.HandleDelete(range);
			if(re != null && re.result == PresListUtil.NOT_HANDLED){
				//Not handle right, restore range, and return
				range = originalRange;
				range.select();
				return false;
			}
			range = re.range;
		}
		
		if(!range.collapsed){
			return false;
		}
		
		//get the span we current cursor in
		var selection = PresListUtil.getListSelectionRangeInfo(range);
		var line = selection.root.getChild(selection.startSelection.lineIndex);
		var lineItem = PresListUtil.getLineItem(line);
		var curSpan = selection.startSelection.focusSpan;
		
		var txtOffset = selection.startSelection.textOffset;
		
		curSpan.$.normalize();
		//According to textOffset we split current span
		var pureText = PresListUtil._getTextContent(curSpan);
		
		var spanPrePart = curSpan.clone();
		var newText = pureText.substring(0,txtOffset);
		spanPrePart.setText(newText);
		spanPrePart.insertBefore(curSpan);
		
		var spanPostPart = curSpan.clone();
		newText = pureText.substring(txtOffset,pureText.length);
		spanPostPart.setText(newText);
		spanPostPart.insertAfter(curSpan);
		dojo.destroy(curSpan.$);
		return {
			preSpanNode : spanPrePart,
			postSpanNode : spanPostPart
		};
	},
	
	_getTextContent : function(node)
	{
		var retString = TEXTMSG.getTextContent(node.$);
		if(node.type == CKEDITOR.NODE_ELEMENT)
		{
			//NOTE:current string wil change all '&nbsp;' to ' '
			//so we need correct them both for display and word break
			var strTwoWhiteSpace = ' ' + String.fromCharCode(160); 
			// You should not use ' &nbsp;', since '&nbsp;' will be handle as string with length 6!
			retString = retString.replace( /  /g, strTwoWhiteSpace );
					
			//For the frist node, the first character should not be ' ', it must be '&nbsp;'
			//32 is ' ',160 is '&nbsp;'
			if((node.getIndex() == 0)&&(retString.charCodeAt(0) == 32))
			{
				retString = String.fromCharCode(160) + retString.substring(1, retString.length);
			}
		}
		//remove 8203 & 65279
		retString = retString.replace(/uFEFF/g,'');//65279
		retString = retString.replace(/u200B/g,'');//8203
		return retString;
	},
	
	//if bInsertPureText = true means we will keep the previous cursor style such as color,bold...
	_insertTextNode : function(textSrcNodeRoot, range, bInsertPureText, bForceToInlineStyle){
		var ret = PresListUtil._splitNode(range);
		if(ret == false)
			return false;
		var spanPrePart = ret.preSpanNode;
		var lineItem = spanPrePart.getParent();
		var needUpdateListStyle = false;
		var lastVisbiblePasteSpan = null; 
		for(var i=textSrcNodeRoot.getChildCount()-1;i>=0;i--)
		{
			var clipboardSpan = textSrcNodeRoot.getChild(i);
			// 34058: [Regression][B2B][FF] Copy a word end with an empty space
			// <br> is added unexpectedly for pasted word
			if (dojo.isFF && PresCKUtil.checkNodeName(clipboardSpan, 'span'))
				dojo.query('br', clipboardSpan.$).forEach(dojo.destroy);
			var pasteSpan = null;
			if(bInsertPureText)
			{
				pasteSpan =  spanPrePart.clone();
				var txt = PresListUtil._getTextContent(clipboardSpan);
				pasteSpan.setText(txt);
			}
			else
				pasteSpan = clipboardSpan.clone(true);
			
			PresListUtil._DecodingVisibleStyle(pasteSpan,!bForceToInlineStyle);

			if(!lastVisbiblePasteSpan && !PresCKUtil.isNodeTextEmpty(pasteSpan))
				lastVisbiblePasteSpan = pasteSpan;
			pasteSpan.insertAfter(spanPrePart);
			
			var vfirstSpan = PresCKUtil.getFirstVisibleSpanFromLine(lineItem);
			if(vfirstSpan.equals(pasteSpan)){
				needUpdateListStyle =true;
			}
		}
		
		if(!lastVisbiblePasteSpan)//we paste nothing, but empty span
		{
			//insert a white space as paste content
			lastVisbiblePasteSpan = new CKEDITOR.dom.element('span');
			lastVisbiblePasteSpan.setHtml(' ');
			lastVisbiblePasteSpan.insertAfter(spanPrePart);
		}
		PresCKUtil.removeInvalidSpanForLine(lineItem);
		PresCKUtil.updateRelativeValue(lineItem);
		if(lineItem.is('li'))
		{
			if(lineItem.hasClass('sys-list-hidden'))
				lineItem.removeClass('sys-list-hidden');
			if(needUpdateListStyle){
				var oldlistBeforeCss = PresListUtil.getListBeforeClass(lineItem);
				if(oldlistBeforeCss && oldlistBeforeCss.length >0)
					PresCKUtil.duplicateListBeforeStyle(oldlistBeforeCss,lineItem);
				else
					PresCKUtil.copyAllFirstSpanStyleToILBefore(lineItem);
				delete needUpdateListStyle;
			}
		}
		range.moveToElementEditEnd( lastVisbiblePasteSpan );
		range.select();
		return true;
	},
	
	_PasteElementToRange : function(pasteElement,range)
	{
		function _ConvertPToOLUL(normPara, listPara)
		{
			// when we copy a normal paragraph to a list paragraph
			var newListPara = normPara;
			if (normPara && normPara.is('p') 
					&& listPara && listPara.is('ol','ul') ) {
				//duplicate the list paragraph message
				var oulNode = listPara.clone();
				var listItem = PresListUtil.getLineItem(listPara);
				var liNode = listItem ? listItem.clone() :
					CKEDITOR.document.createElement('li');;
				oulNode.append(liNode);
				//move Child under liNode
				normPara.moveChildren( liNode );
				liNode.setAttribute('level',normPara.getAttribute('level'));
				dojo.destroy(normPara.$);
				newListPara = oulNode;	
			}
			return newListPara;
		}
		
		var originalRange = range.clone();
		var bFromExternalFile = false;
		var node_uri = pasteElement.getAttribute('_docUUID');
		if (node_uri && node_uri != window.pe.scene.session.uri) {
			bFromExternalFile = true;
		}
		
		// get wether paste single line
		// if yes, no need to handle enter
		var pasteSingleLine = PresCKUtil.checkNodeName(pasteElement.getChild(0),'span','a');
		if (pasteSingleLine){
			var startblock = MSGUTIL.getBlock(range.startContainer);
			var textBoxInfo = PresCKUtil.getCurrentTextboxInfo(startblock,true);
			var bPlaceHolder = false;
			if(textBoxInfo)
				bPlaceHolder = textBoxInfo.isPlaceholder;
			var result = PresListUtil._insertTextNode(pasteElement, range,false,!bPlaceHolder);
			
						
			return result;
		}

		var re = PresListUtil.HandleEnter(range,null,null);
		if(!re || (re != null && re.result == PresListUtil.NOT_HANDLED)){
			//Not handle right, restore range, and return
			range = originalRange;
			range.select();
			return false;
		}
		range = re.range;
		if(!range.collapsed){
			return false;
		}
		
		//After entet we only could has two result:
		//case 1:>|, cursor stop at the empty line
		//		[Pre-enter] : >XX|
		//					  >XX[BB]
		//case 2:>|AA, curs stop at the beginning of non-emptyline
		//		[Pre-enter] : 	>|AA
		//						>XX|AA
		//						>XX[BB]AA
		var insertPosLine = PresListUtil._getPastePosLine(range);
		if(!insertPosLine)
			return false;
		var insertTextboxInfo = PresCKUtil.getCurrentTextboxInfo(insertPosLine,true);
		var needDoListStyleUpdate = false;
		//The line to store cursor position
		var cursorLine = null;
		for(var i=pasteElement.getChildCount()-1;i>=0;i--)
		{
			var clipboardLine = pasteElement.getChild(i);
			var pasteLine = clipboardLine.clone(true);
			var lineItem = PresListUtil.getLineItem(pasteLine);
			if(!lineItem)
				continue;
			if (pasteLine.is('ol','ul','p')){
				var sourceLine = PresListUtil.getLineItem(clipboardLine);
				//delete all except child
				var tempNode = clipboardLine.clone();
				pasteLine.moveChildren( tempNode );
				dojo.destroy(tempNode.$);
				
				// generate the structure of "<ol/ul><li></li><olul>" or "<p></p>"
				if (pasteLine.is('ol','ul'))
				{
					//restore child			
					lineItem = sourceLine.clone();
					pasteLine.append(lineItem);
				}
				else //p
				{
					lineItem = pasteLine;
				}
				
				// append the <span> and <br>
				dojo.query('span,br',sourceLine.$).forEach(function(_node){
					var node = PresCKUtil.ChangeToCKNode(_node);
					if(node.is('span'))
					{
						var cloneNode = node.clone();
						var pureText = PresListUtil._getTextContent(node);
						cloneNode.setText(pureText);
						lineItem.append(cloneNode);
					}
					else
					{
						lineItem.append(node.clone());
					}
					
				});
				
				PresListUtil._fixLineStructure(lineItem);
				
				//For D41617, remove the following code >>>>>>>>>>>>>>>>
//				//paste normal paragraph to placeholder, and target line is numbering/bullet
//				if(insertTextboxInfo 
//				&& insertTextboxInfo.isPlaceholder)
//				{
//					//we should change the paste line to numbering/bullet too
//					pasteLine = _ConvertPToOLUL(pasteLine, insertPosLine);		
//				}
				//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
				
				// insert the paste line to the specific position
				pasteLine.insertAfter(insertPosLine);
				
				lineItem = PresListUtil.getLineItem(pasteLine);
				// these 2 falg for ODF is just for ODF export,
				// need to consider whether need to keep them during copy&paste for ODF preserve
				// only keep _oldStyleName used for export preserve here
				if(bFromExternalFile)
					PresListUtil._removeDefaultFlagForODF(lineItem, false, true);
				
				// decoding the visible styles to inline style on <span>
				dojo.query('span',lineItem.$).forEach(function(_node){
					var node = PresCKUtil.ChangeToCKNode(_node);
					PresListUtil._DecodingVisibleStyle(node,insertTextboxInfo.isPlaceholder);
				});
				
				if(!cursorLine)
					cursorLine = pasteLine;
				var lineItem = PresListUtil.getLineItem(pasteLine);
				if(insertTextboxInfo.isPlaceholder)
				{
					//update the level for the paste line
					var level = 1;
					if(insertTextboxInfo.placeholderType=='title')
					{
						level = 1;
					}
					else
					{
						level = parseInt(lineItem.getAttribute('level'),10);
					}
					
					if(!level || isNaN(level))
						level = 1;
					lineItem.setAttribute('level',level);
					var masterClass = PresCKUtil.getMasterClass(pasteLine,level);
					var tLine = PresCKUtil.setMasterClass(pasteLine,masterClass);
					if(tLine)
					{
						pasteLine = tLine;
						if(!cursorLine)
							cursorLine = pasteLine;
					}
				}
				else //not paste to placeholder
				{				
					//remove master list class, and set to default lst
					//get margin-left and text-indent abs value
					var absMargin = PresCKUtil.getAbsoluteValue(lineItem,PresConstants.ABS_STYLES.MARGINLEFT);
					var absIndent = PresCKUtil.getAbsoluteValue(lineItem,PresConstants.ABS_STYLES.TEXTINDENT);
					var lc = PresListUtil.getListClass(lineItem);
					PresListUtil.removeListClass(lineItem,false,false,true,false);
					if(!lc.listClass.length)//no lst exist
					{
						if(pasteLine.is('ol'))
						{
							pasteLine.setAttribute('numberType','1');
							lineItem.addClass('lst-n');
						}
						else if(pasteLine.is('ul'))
						{
							lineItem.addClass('lst-c');
						}
						//else is <p>
					}						
					
					PresCKUtil.setCustomStyle(lineItem,PresConstants.ABS_STYLES.MARGINLEFT,absMargin);
					PresCKUtil.setCustomStyle(lineItem,PresConstants.ABS_STYLES.TEXTINDENT,absIndent);
				}

				PresCKUtil.updateRelativeValue(pasteLine);
				var li = lineItem.getAscendant({'li':1}, true);
				if(li){
					needDoListStyleUpdate = true;
					var oldlistBeforeCss = PresListUtil.getListBeforeClass(li);
					var theoldtext = pe.scene.slideSorter.listBeforeStyleStack[oldlistBeforeCss];
					if(theoldtext && oldlistBeforeCss && oldlistBeforeCss.length > 0)
						PresCKUtil.duplicateListBeforeStyle(oldlistBeforeCss,li,true);
					else
						PresListUtil.prepareStylesforILBefore(li,true);
				}
			}
		}
		dojo.destroy(insertPosLine.$);
		if(needDoListStyleUpdate){
  			PresCKUtil.doUpdateListStyleSheet();
  		}
		var lastSpan = PresCKUtil.getFirstVisibleSpanFromLine(cursorLine, true);
		if (lastSpan) {
			range.moveToElementEditEnd( lastSpan );
			range.select();
		}

		PresListUtil.updateListValue(selInfo.rootTXTNode);
		return true;
	},
	
	_pasteInExTableToCell : function(_pasteElement) {
		if(!_pasteElement) return false;

		var pasteElement = null;
		var result = {};
		
		var pastedata = dojo.query(".list_clipboard_copydata", _pasteElement.$);
		if (pastedata && (pastedata.length == 1)) {
			// editor mode internal copied table cells. Only one table node
			var tableNodes = dojo.query("table", _pasteElement.$);
			if (tableNodes.length > 0) {
				pasteElement = PresCKUtil.ChangeToCKNode(tableNodes[0]);
				PresListUtil._DeCodingDataForBrowser(pasteElement);
				result['success'] = PresListUtil._pasteTableToCell(pasteElement);
			}
		} else {
			// Get the internal copied table object
			// To copy to system clipboard, chrome will add a redundant node
			// to outer wrapper which is after object node
			// And _clipboard_id will be written to it
			// For other browsers, _clipboard_id will be written into object div
			// And only one object node in outer wrapper
			var clipBoardIdNode = _pasteElement.getLast();
			if (clipBoardIdNode && clipBoardIdNode.nodeType != CKEDITOR.NODE_TEXT) {
				var id = dojo.attr(clipBoardIdNode.$, '_clipboard_id');
				if(id && id.indexOf('docs_pres_object') >= 0) {
					//remove chrome non data node
					if(clipBoardIdNode.hasAttribute('_copy_nondata'))
						dojo.destroy(clipBoardIdNode.$);
					// Internal copied objects
					var tableNodes = dojo.query("table", _pasteElement.$);
					if (tableNodes.length == 1 && _pasteElement.getChildCount() == 1) {
						// Paste into edit mode as selected cells
						pasteElement = PresCKUtil.ChangeToCKNode(tableNodes[0]);
						PresListUtil._DeCodingDataForBrowser(pasteElement);
						result['success'] = PresListUtil._pasteTableToCell(pasteElement);
					}  // Multiple objects should be pasted as objects in outer following objects
				} else {
					// external copied things
					PresListUtil._DeCodingDataForBrowser(_pasteElement);
					var data = concord.util.presCopyPasteUtil.processClipboardData(
						_pasteElement.$.innerHTML, true, _pasteElement);
					var tableNodes = dojo.query("table", _pasteElement.$);
					if (tableNodes.length == 1 && data.tables && !data.images && !data.text) {
						// paste table oject
						var editor = PresCKUtil.getCurrentEditModeEditor();
						var div = editor.document.createElement('div');
						div.$.innerHTML = data.tables;
						result['success'] = PresListUtil._pasteTableToCell(div.getFirst());
						result['procExData'] = data;
					}  // Multiple objects should be pasted as objects in outer following objects
				}
			}
		}

		return result;
		
	},
	
	fetchInternalCopyData:function(_pasteElement)
	{
		var pastedata = dojo.query(".list_clipboard_copydata",_pasteElement.$);
		var pasteElement = null;
		
		if(pastedata && (pastedata.length==1))
		{
			pasteElement = PresCKUtil.ChangeToCKNode(pastedata[0]);
		}
		
		if(!pasteElement)
		{
			//could not find , might _pasteElement it self is what we want
			if(_pasteElement.hasClass && _pasteElement.hasClass("list_clipboard_copydata"))
			{
				pasteElement = _pasteElement;
			}
		}
		//En-code lc for browser copy & paste
		if(pasteElement) {
			pasteElement = concord.util.presCopyPasteUtil.addIndicatorForPaste(pasteElement.$);
			PresListUtil._DeCodingDataForBrowser(pasteElement);
		}

		return pasteElement;
	},
	
	_filterFontsizeStyle: function(node)
	{
		function _getEMFontSize(node)
		{
			var fontSize = node.getStyle('font-size');
			if( fontSize && fontSize.length >0 )
			{
				if(fontSize.indexOf('px')>0
				 ||fontSize.indexOf('pt')>0)
				{
					fontSize = CKEDITOR.tools.toPtValue(fontSize)/18.0;
					return fontSize;
				}
				else if(fontSize.indexOf('%')>0)
				{
					fontSize = PresCKUtil._percentToFloat(fontSize);
					return fontSize;
				}					
			}
			return null;
		}
		//reformat the fontsize
		//only allow font size at span
		dojo.query('span',node.$).forEach(function(_node){
			var span = PresCKUtil.ChangeToCKNode(_node);
			var customFsize = PresCKUtil.getCustomStyle(span,PresConstants.ABS_STYLES.FONTSIZE);
			if(!customFsize)
			{
				var parent = span.getParent();
				if(parent)
				{
					var selfFSize = _getEMFontSize(span);
					if(!selfFSize)
						selfFSize = 1.0;
					var parentFSize = 1.0;
					if(parent.is('li'))//<ol/ul><li><span>
					{
						var liFsize = _getEMFontSize(parent);
						if(!liFsize)
							liFsize = 1.0;
						var oulNode = parent.getParent();
						var oulFsize = 1.0;
						if(oulNode)
						{
							oulFsize = _getEMFontSize(oulNode);
							if(!oulFsize)
								oulFsize = 1.0;
						}
						parentFSize = liFsize*oulFsize;
					}
					else if(parent.is('p'))//<p><span>
					{
						var parentFSize = _getEMFontSize(parent);
						if(!parentFSize)
							parentFSize = 1.0;
					}
					selfFSize = selfFSize*parentFSize;
					if(selfFSize!=1.0)
					{
						span.setStyle('font-size',selfFSize+'em');
						PresCKUtil.setCustomStyle(span,PresConstants.ABS_STYLES.FONTSIZE,selfFSize*18.0);
					}
				}
				else
				{
					var emFSize = _getEMFontSize(span);
					if(emFSize && emFSize!=1.0)
					{
						span.setStyle('font-size',emFSize+'em');
						PresCKUtil.setCustomStyle(span,PresConstants.ABS_STYLES.FONTSIZE,emFSize*18.0);
					}
				}
			}
		});
		dojo.query('li,p,ol,ul,div',node.$).forEach(function(_node){	
			var tNode = PresCKUtil.ChangeToCKNode(_node);
			tNode.removeStyle('font-size');
		});
	},
	
	_fixLineStructure:function(line)
	{
		var child = line.getFirst();
		if(!child)
		{
			//do not have any child, rebuild the span and br
			var span = new CKEDITOR.dom.element('span');
			span.setHtml('&#8203;');
			var br = new CKEDITOR.dom.element('br');
			br.addClass('hideInIE');
			line.append(span);
			line.append(br);
			return;
		}
		//The rule for a line is it must has <span> at beginning, and <br> at last node
		// and no continue <br> is allowed
		//not allow other node exist
		//TODO PS: temporary allow <a> as legal child
		while(child)
		{
			if(PresCKUtil.checkNodeName(child,'br'))
			{
				var preNode = child.getPrevious();
				if(!preNode || !PresCKUtil.checkNodeName(preNode,'span'))
				{
					var span = new CKEDITOR.dom.element('span');
					span.setHtml('&#8203;');
					span.insertBefore(child);
				}
			}
			else if(!PresCKUtil.checkNodeName(child,'span','a'))
			{//try to change this node to span
				var txt = PresListUtil._getTextContent(child);
				var span = new CKEDITOR.dom.element('span');
				span.setText(txt);
				span.insertBefore(child);
				dojo.destory(child.$);
				child = span;
			}
			child = child.getNext();
		}

		var lastNode = line.getLast();
		if(!lastNode.is('br'))
		{			
			var br = new CKEDITOR.dom.element('br');
			br.addClass('hideInIE');
			line.append(br);
		}
	},
	
	_fetchCommonCopyData:function(_pasteElement, procExData)
	{
		function _mergeStyleAttribute(sourceNode, destNode)
		{
				var attributes = sourceNode.$.attributes;
				for ( var n = 0 ; n < attributes.length ; n++ )
				{
					var attribute = attributes[n];
					// Lowercase attribute name hard rule is broken for
					// some attribute on IE, e.g. CHECKED.
					var attrName = attribute.nodeName.toLowerCase(),
						attrValue;

					if ( attrName == 'checked' && ( attrValue = PresListUtil.getAttribute( attrName ) ) )
						destNode.setAttribute( attrName, attrValue );
					// IE BUG: value attribute is never specified even if it exists.
					else if ( attribute.specified ||
					  ( CKEDITOR.env.ie && attribute.nodeValue && attrName == 'value' ) )
					{
						attrValue = sourceNode.getAttribute( attrName );
						if ( attrValue === null )
							attrValue = attribute.nodeValue;

						destNode.setAttribute( attrName, attrValue );
					}
				}

				// The style:
				if ( sourceNode.$.style.cssText !== '' )
				{
					var styleArray = PresCKUtil.turnStyleStringToArray(sourceNode.$.style.cssText);
					if(styleArray)
					{
						for(var name in styleArray)
							destNode.setStyle(name,styleArray[name]);
					}
				}
		}
		
		function _getPureText(node)
		{
			var textContent = PresListUtil._getTextContent(node);
			return textContent;
		}
		
		
		function _parseTextNode(node)
		{
			var span = new CKEDITOR.dom.element('span');
			span.append(node);
			return span;
		}
		function _parseSpanNode(node)
		{
			//first clone the span,to keep its style
			var cloneSpan = node.clone();
			//then extract all text from span.
			var textContent = _getPureText(node);
			cloneSpan.setText(textContent);
			return cloneSpan;
		}
		function _parseBrNode(node)
		{
			var br = new CKEDITOR.dom.element('br');
			br.addClass('hideInIE');
			return br;
		}
		
		//the ou/ol node only has one child(ol/ul/li)
		function _parseSingledOULNode(node)
		{
			//Firstly, we should elimate the level
			//the line might has such structure
			/*
			 * <ol>
			 * 		<li>
			 * 			<ol>
			 * 				<li>
			 * 					<ol>
			 * 						<li>
			 * 							<span> ...
			 * 
			 * we should change it to 
			 * <P>
			 *      <span>
			 * */
			
			var paraNode = new CKEDITOR.dom.element('p');
			paraNode.setAttribute("level",1);
			
			var leafSpan = dojo.query('span',node.$);
			if(!leafSpan || !leafSpan[0])
				return null;
			leafSpan = PresCKUtil.ChangeToCKNode(leafSpan[0]);
			var line = leafSpan.getParent();
			//move Child under paraNode
			line.moveChildren( paraNode );
			
			while(line)
			{
				//merge all attribute together
				_mergeStyleAttribute(line, paraNode );
				line = line.getParent();
			}				
			
//			var br = new CKEDITOR.dom.element('br');
//			br.addClass('hideInIE');
//			paraNode.append(br);
			
			var defaultType = node.getName().toLowerCase();
			//currently we only change to default ol/ul node
			paraNode = PresListUtil.createList(paraNode,null,defaultType);
			return paraNode;
		}
		
		//the ou/ol node might has multi level
		function _parseEmbedOULNode(node)
		{
			var divRoot = new CKEDITOR.dom.element('div');
			divRoot.append(node);
			//for then embed node
			divRoot = PresCKUtil.GenerateIndependentParagraphs(divRoot);
			var children = divRoot.getChildren();
			var oulList = [];
			for(var i=0;i<children.count();i++)
			{
				var oulNode = _parseSingledOULNode(children.getItem(i));
				if(oulNode)
					oulList.push(oulNode);
			}
			return oulList;
		}
		
		function _parseEmbedLiNode(node)
		{
			var defUl = new CKEDITOR.dom.element('ul');
			defUl.append(node);
			return _parseEmbedOULNode(defUl);
		}
		
		function _parsePNode(node)
		{
			var paraNode = node.clone();
			paraNode.setAttribute("level",1);
			var children = node.getChildren();
			for(var i=0;i<children.count();i++)
			{
				var child = children.getItem(i).clone(true);//Use clone node, won't impact clipboard node
				if(PresCKUtil.checkNodeName(child,'#text'))
				{
					var node = _parseTextNode(child);
					paraNode.append(node);
				}
				else if(PresCKUtil.checkNodeName(child,'span'))
				{
					var node = _parseSpanNode(child);
					paraNode.append(node);
				}
				else if(PresCKUtil.checkNodeName(child,'br'))
				{
					var node = _parseBrNode(child);
					paraNode.append(node);
				}
				else//other node, treat like pure text
				{
					var span = new CKEDITOR.dom.element('span');
					var textContent = _getPureText(node);
					span.setText(textContent);
					paraNode.append(span);
				}
			}
			PresListUtil._fixLineStructure(paraNode);
			return paraNode;
		}
		
		//Generate standard nodes, these nodes, could be directly input paste area
		function _generateFormatNodes(_node)
		{
			var children = _node.getChildren();
			for(var i=0;i<children.count();i++)
			{
				var node  = null;
				var child = children.getItem(i).clone(true);//Use clone node, won't impact clipboard node
				if(PresCKUtil.checkNodeName(child,'#text'))
				{
					node = _parseTextNode(child);
				}
				else if(PresCKUtil.checkNodeName(child,'span'))
				{
					node = _parseSpanNode(child);
				}
				else if(PresCKUtil.checkNodeName(child,'br'))
				{
					node = _parseBrNode(child);
					fakeLine = null;//break the fake line
				}
				else if(PresCKUtil.checkNodeName(child,'ol')
						||PresCKUtil.checkNodeName(child,'ul'))
				{
					var lines = _parseEmbedOULNode(child);
					for(var j=0;j<lines.length;j++)
						lc.append(lines[j]);
					fakeLine = null;//break the fake line
				}
				else if(PresCKUtil.checkNodeName(child,'li'))
				{
					var lines = _parseEmbedLiNode(child);
					for(var j=0;j<lines.length;j++)
						lc.append(lines[j]);
					fakeLine = null;//break the fake line
				}
				else if(PresCKUtil.checkNodeName(child,'p'))
				{
					var line = _parsePNode(child);
					lc.append(line);
					fakeLine = null;//break the fake line
				}
				else if(PresCKUtil.checkNodeName(child,'table'))
				{
					dojo.query('th,td',child.$).forEach(function(node){	
						var cell =  PresCKUtil.ChangeToCKNode(node);
						_generateFormatNodes(cell);
					});

//					var line = _parsePNode(child);
//					lc.append(line);
					fakeLine = null;//break the fake line
				}
				else if(PresCKUtil.checkNodeName(child,'div'))
				{
					_generateFormatNodes(child);
					fakeLine = null;//break the fake line
				}
				else//other node, treat like pure text
				{
					node = new CKEDITOR.dom.element('span');
					var textContent = _getPureText(child);
					node.setText(textContent);

				}
				if(node && (!node.is('br')) && PresCKUtil.isNodeTextEmpty(node))
					node = null;
				if(node)
				{
					if(!fakeLine)
					{
						fakeLine = new CKEDITOR.dom.element('p');
						fakeLine.addClass("_fake_line_");
						fakeLine.setAttribute('level',1);
						lc.append(fakeLine);
					}
					if (!node.is('br'))
						fakeLine.append(node);
				}
			}
		}
		
		
		var pasteElement = PresCKUtil.ChangeToCKNode(_pasteElement);
		if(!pasteElement 
				|| !pasteElement.is 
				|| !pasteElement.getAttribute
				|| !(pasteElement.getAttribute('id')=='cke_pastebin'))
			return null;
		
		var data = procExData ? procExData :
			concord.util.presCopyPasteUtil.processClipboardData(pasteElement.getHtml(),null,null,true);
		if (data.html == "" && !data.tables 
				&& !data.images && !data.text)
			return null;
		pasteElement.setHtml(data.html);
		if(data.tables && data.tables !==true)
			pasteElement.appendHtml(data.tables);
		if(data.images)
			pasteElement.appendHtml(data.images);
		if(data.text)
			pasteElement.appendHtml(data.text);
		
		var lc = new CKEDITOR.dom.element('div') ;
		lc.addClass('list_clipboard_copydata');		//Startline and end line are same line
		
		var fakeLine = null;
		//Get all child node from pastebin
		_generateFormatNodes(pasteElement);		
		
		//Process the fake line in lc
		var firstChild = lc.getFirst();
		if(lc.getChildCount()==1 && firstChild.hasClass('_fake_line_'))
		{
			//move Child under lc
			firstChild.moveChildren( lc );
			dojo.destroy(firstChild.$);
		}
		else //remove the fake_line flag, let be real line
		{
			dojo.query('._fake_line_',lc.$).forEach(function(node){	
				var line = PresCKUtil.ChangeToCKNode(node);
				line.removeClass('_fake_line_');
				PresListUtil._fixLineStructure(line);
			});
		}
		
		//Process style for paste element
		//The work should be done in "concord.util.presCopyPasteUtil.processClipboardData"
		PresListUtil._filterFontsizeStyle(lc);
				
		return lc;
	},
	
	_isPastedToCell : function(range){
		if (!range) return false;
		var table = range.startContainer.getAscendant('table',true);
		if (table)
			return true;
		return false;
	},
	
	_pasteTableToCell : function(internalTableNode) {
		if (internalTableNode) {
			if(PresTableUtil.isMergeCell(internalTableNode.$)){
         		return true;
         	}
			var editor = PresCKUtil.getCurrentEditModeEditor();
			if(PresTableUtil.isMergeCell(editor.document.$.getElementsByTagName('table')[0])){
         		return true;
         	}
			editor.contentBox.setNodeId(internalTableNode.$);
			var dataTransfer = {};
			dataTransfer['html'] = internalTableNode.$.outerHTML;
			editor.fire( 'pasteTableToCell', dataTransfer );
			PresTableUtil.resetCKBodyHeight(editor.contentBox);
			return true;
		}
		return false;
	},
	
	pasteListFromClipboard : function(_pasteElement,range,editor)
	{
		var ret = {
				result: false,  // final result
				tableToCellRslt: false  // paste table to cell result
			};
		do{
			if(!_pasteElement)
				break;

			// paste table to cell
			var result = null;
			var tableNodes = dojo.query("table", _pasteElement.$);
			if (tableNodes.length > 0 && (PresListUtil._isPastedToCell(range)||(editor && editor.isTable))) {
				var result = PresListUtil._pasteInExTableToCell(_pasteElement);
				if (result.success)
				{
					ret.result = true;
					ret.tableToCellRslt = true;
					break;
				}
			}

			var pasteElement = PresListUtil.fetchInternalCopyData(_pasteElement);
			if(pasteElement) {
				// When paste table into text box
				// _fetchInternalCopyData will return a table node
				// But _PasteElementToRange cannot handle it
				// Here just make it to use orig logic to paste table as text
				// by calling _fetchCommonCopyData
				var tableNodes = dojo.query("table", pasteElement.$);
				if (tableNodes.length == 0)
				{
					ret.result = PresListUtil._PasteElementToRange(pasteElement,range);
					break;
				}
			}
			// Maybe result will contain processed external data
			// Here pass the processed data in
			pasteElement = PresListUtil._fetchCommonCopyData(_pasteElement,
				result ? result.procExData : null);
			if(pasteElement)
			{
				pasteElement = concord.util.presCopyPasteUtil.addIndicatorForPaste(pasteElement.$);
				ret.result = PresListUtil._PasteElementToRange(pasteElement,range);
				break;
			}
		}while(false);

		PresListUtil.updateCss(range);

		if(!ret.result)
		{
			console.error('[Fatal Error], we missing the paste case, and will cause paste error!!!!');
		}
		return ret;
	},

	updateCss: function(range) {
		// replace old style node with new one by loadcss again
		var contentbox = pe.scene.getContentBoxCurrentlyInEditMode();
		var domDoc = range.document.$;
		if (contentbox && domDoc) {
			var styleNode = null;
			var styleNodeArr = domDoc.getElementsByTagName("style");
			for (var i = 0, len = styleNodeArr.length; i < len; ++i) {
				styleNode = styleNodeArr[i];
				if (styleNode.id === '' && !dojo.attr(styleNode, 'data-cke-temp')) {
					break;
				}
			}

			var totalClassStr = PresCKUtil.getAllClassesStr(domDoc.body);
			var resultCssStr = contentbox.getCssStrFromClass(totalClassStr);
			if (styleNode) {
				if (styleNode.styleSheet) {
					styleNode.styleSheet.cssText = resultCssStr;
				} else {
					styleNode.textContent = resultCssStr;
				}
			} else { // todo: sth may be wrong
				concord.util.uri.prependStyleNode(null, resultCssStr, domDoc);
			}
		}
	},
	//we do not support such structure
	//<p/li>
	//  <span>
	//    <a>
	//		<span>
	getListSelectionRangeInfo: function(range)
	{
		var sel = PresListUtil._getRangeListSelection(range);
		if(!sel)
			return null;
		
		function _getTextCountBefore(targerNode,parentNode,totalCount)
		{
		
			function _impletment(tNode)
			{
				var localCount = 0;
				if(tNode.equals(targerNode))
					return {
					found : true,
					count : localCount
					};
				if(PresCKUtil.checkNodeName(tNode,'#text'))
				{
					var textContent = PresListUtil._getTextContent(tNode);
 					// ignore 8203 length
 					//if (!(textContent.length == 1 && textContent.charCodeAt(0) == 8203))
					localCount += textContent.length;
				}
				//<br class="text_line-break"> as one character, and take one length
				else if(PresCKUtil.checkNodeName(tNode,'br') &&  tNode.hasClass('text_line-break'))
				{
					localCount ++;
				}
				else if(tNode.getFirst())
				{
					var child = tNode.getFirst();
					while(child)
					{
						var tmp = _impletment(child);
						localCount+=tmp.count;
						if(tmp.found)
						{
							return tmp;
						}
						child = child.getNext();
					}
				}
				
				return {
					found : false,
					count : localCount
				};
			}
			var bFind = false;
			var child = parentNode.getFirst();
			while(child)
			{
				if(child.equals(targerNode))
				{
					bFind = true;
					break;
				};
				var tmp = _impletment(child);
				totalCount+=tmp.count;
				if(tmp.found)
				{
					bFind = true;
					break;
				}
					
				child = child.getNext();
			}
			console.log("totalCount="+totalCount);
			return {
				found : bFind,
				count : totalCount
			};
		}
		
		//make the select in span
		function _TrimSelectionNode(selNode, offset, bStart)
		{
			var lineIndex = bStart?sel.startlineInfo.index:sel.endlineInfo.index;
			var lineTextOffset = 0;//the offset in line, treat one line a whole string, no span
			var focusSpan = null;
			var spanTextOffset = 0;//the offset in focusSpan
			if(PresCKUtil.checkNodeName(selNode,'span'))
			{
				focusSpan = selNode;
				if(offset>0)
				{
					for(i=0;i<offset;i++)
					{
						var textNode = selNode.getChild(i);
						var textContent = PresListUtil._getTextContent(textNode);
						spanTextOffset += textContent.length;
					}
				}
			}
			else if (PresCKUtil.checkNodeName(selNode,'p','li','ul','ol'))
			{
				if(bStart && (offset == 0))
				{
					focusSpan = PresCKUtil.getFirstVisibleSpanFromLine(selNode);
					lineTextOffset = 0;
					spanTextOffset = 0;
				}
				else
				{
					var bLineChanged = false;
					if(!bStart && (offset == 0))
					{
						lineIndex = lineIndex -1;
						bLineChanged = true;
					}
					var line = sel.rootTXTNode.getChild(lineIndex);
					var lineItem = PresListUtil.getLineItem(line);
					if(bLineChanged)
					{
						focusSpan = lineItem.getLast();
						offset = focusSpan.getIndex();
					}
					else
						focusSpan = lineItem.getChild((offset>=lineItem.getChildCount())?lineItem.getChildCount()-1:offset);
					
					
					var cursorAtSpanStart = false;
					if(PresCKUtil.checkNodeName(focusSpan,'br'))
					{
						if(offset==0)
							focusSpan = focusSpan.getPrevious();
						else
						{
							if(focusSpan.getNext())
							{
								focusSpan = focusSpan.getNext();
								cursorAtSpanStart = true;
							}
							else if(focusSpan.getPrevious())
							{
								focusSpan = focusSpan.getPrevious();
							}
						}
					}
					
					if(!PresCKUtil.checkNodeName(focusSpan,'span'))
					{
						if(PresCKUtil.checkNodeName(focusSpan,'#text')){
							focusSpan = focusSpan.getParent();
						}
						cursorAtSpanStart = false;
						//find last span node
						var spanList = dojo.query('span',focusSpan.$);
						if(spanList.length)
							focusSpan = PresCKUtil.ChangeToCKNode(spanList[spanList.length - 1]);
						else 
							focusSpan = null;
					}
					var textContent = PresListUtil._getTextContent(focusSpan);
					spanTextOffset = cursorAtSpanStart?0:textContent.length;
				}

			}
			else if (PresCKUtil.checkNodeName(selNode,'br'))
			{
				if(offset==0)
					focusSpan = selNode.getPrevious();
				else
					focusSpan = selNode.getNext() || selNode.getPrevious();
				
				if(!PresCKUtil.checkNodeName(focusSpan,'span'))
				{
					focusSpan = null;
					//find last span node
					var spanList = dojo.query('span',focusSpan.$);
					if(spanList.length)
					{
						var index = spanList.length - 1;
						while(index>=0)
						{
							var span = PresCKUtil.ChangeToCKNode(spanList[index]);
							if(!PresCKUtil.isNodeTextEmpty(span))
							{
								focusSpan = span;
								break;
							}
							index--;
						}
					}
				}
				var textContent = PresListUtil._getTextContent(focusSpan);
				spanTextOffset = textContent.length;
			}
			else if (PresCKUtil.checkNodeName(selNode,'#text'))
			{
				var focusSpan = selNode.getParent();
				var preTextNode = selNode.getPrevious();
				spanTextOffset = offset;
				while(preTextNode)
				{
					var textContent = PresListUtil._getTextContent(preTextNode);
					spanTextOffset += textContent.length;
					preTextNode = preTextNode.getPrevious();
				}
			}
			else //selection must be high level node
			{
				var ancestor = range.getCommonAncestor(true, true);
				//find last span node
				var spanList = dojo.query('span',ancestor.$);
				if(spanList.length)
				{
					var bFindFristSpan = false;
					if( bStart && (offset==0))
						bFindFristSpan = true;
					var index = bFindFristSpan?0:spanList.length - 1;
					while(bFindFristSpan?index<spanList.length:index>=0)
					{
						var span = PresCKUtil.ChangeToCKNode(spanList[index]);
						if(!PresCKUtil.isNodeTextEmpty(span))
						{
							focusSpan = span;
							break;
						}
						index+= bFindFristSpan?1:(-1);
					}
				}
				var textContent = PresListUtil._getTextContent(focusSpan);
				spanTextOffset = textContent.length;
			}
						
			var parentLine = focusSpan.getAscendant('p') ||  focusSpan.getAscendant('li');
			var re = _getTextCountBefore(focusSpan,parentLine,0);
			if(!re.found)
				console.log("Not find!");
			lineTextOffset = re.count + spanTextOffset;

			return {
				lineIndex : lineIndex,//which line
				textOffset : spanTextOffset,
				lineTextOffset : lineTextOffset,//which position in character in line
				focusSpan : focusSpan//This focus span just use for this "get" action, should not use for restore according it
			};
		}

		var bCollapsed = range.collapsed;
		try{
			var startNode = PresCKUtil.ChangeToCKNode(range.startContainer);
			var startSelection = _TrimSelectionNode(startNode,range.startOffset,true);
			var endSelection = null;
			if(!bCollapsed)
			{
				var endNode = PresCKUtil.ChangeToCKNode(range.endContainer);
				endSelection = _TrimSelectionNode(endNode,range.endOffset,false);
			}
		}catch(e) {
		    console.warn("error in getListSelectionRangeInfo :"+e);
			return null;	
		}
		return {
			bCollapsed : bCollapsed,
			startSelection:startSelection,
			endSelection:endSelection,
			root : sel.rootTXTNode
		};

	},
	
	restoreListSelection: function(range,rangeSelection)
	{

		function _findSpanNode(sel,root)
		{
			if(!sel)
				return null;
			var line = root.getChild(sel.lineIndex);
			var lineItem = PresListUtil.getLineItem(line);
			var focusSpan = null;
			
			if(!lineItem)
				return null;

			var curTotalCount = 0;
			var targetCount = sel.lineTextOffset;
	
			var nodeList = dojo.query('span,br.text_line-break',lineItem.$);
			if(nodeList.length)
			{
				var index = 0;
				while(index<nodeList.length)
				{
					var node = PresCKUtil.ChangeToCKNode(nodeList[index]);
					var selfLength = 0;
					if(node.is('br'))
					{
						selfLength = 1;
					}
					else //span node
					{
						var textContent = PresListUtil._getTextContent(node);
						selfLength = textContent.length;
					}

					if((targetCount>=curTotalCount) 
							&& (targetCount<=(curTotalCount + selfLength))
						)
						{	//we find the node
							focusSpan = node;
							break;
						}
						curTotalCount+=selfLength;
						
					index++;
				}
			}

			return node;
		}
		
		if(!rangeSelection)
			return;
		
		function minValue(a,b)
		{
			return (a>b)?b:a;
		}
		
		var startSpan = _findSpanNode(rangeSelection.startSelection,rangeSelection.root);
		var endSpan = _findSpanNode(rangeSelection.endSelection,rangeSelection.root);
		var startOffset = 0;
		var endOffset = 0;
		if(startSpan && startSpan.$)
		{
			if(startSpan.is('br'))
			{
				var node = startSpan.getNext();
				if(node)
				{
					startSpan = node;
					rangeSelection.startSelection.textOffset = 0;
				}					
				else
				{
					startSpan = startSpan.getPrevious();
					rangeSelection.startSelection.textOffset = PresListUtil._getTextContent(startSpan).length;
				}
			}
			startSpan.$.normalize();
			var textNode = startSpan.getChild(0);
			if(!textNode)
				startSpan.setHtml('&#8203;');
			startOffset = minValue(PresListUtil._getTextContent(startSpan).length,rangeSelection.startSelection.textOffset);

		}
		
		if(endSpan && endSpan.$)
		{
			if(endSpan.is('br'))
			{
				var node = endSpan.getNext();
				if(node)
				{
					endSpan = node;
					rangeSelection.startSelection.textOffset = 0;
				}					
				else
				{
					endSpan = endSpan.getPrevious();
					rangeSelection.startSelection.textOffset = PresListUtil._getTextContent(endSpan).length;
				}
			}
			endSpan.$.normalize();
			var textNode = endSpan.getChild(0);
			if(!textNode)
				endSpan.setHtml('&#8203;');
			endOffset = minValue(PresListUtil._getTextContent(endSpan).length,rangeSelection.endSelection.textOffset);
		}
		
		
		if(rangeSelection.bCollapsed && startSpan && startSpan.getChild)
		{
			range.setStart(startSpan.getChild(0),startOffset);
			range.setEnd(startSpan.getChild(0),startOffset);
			range.select();
		}
		else if(startSpan && endSpan && startSpan.getChild && endSpan.getChild)
		{
			range.setStart(startSpan.getChild(0),startOffset);
			range.setEnd(endSpan.getChild(0),endOffset);
			range.select();
		}
		return range;
	},

	//Flatten the hyperlink in one line :
	//<a>
	//	<span>
	//</a>
	// ===> <span _alink="XXX">
	//mark the cursor span, and then restore our range
	_flatternHyperlinkForLine : function(lineNode,range)
	{
		//change all the text node under <a> to span
		function _EncapsulsteLinkTextNode(aLink)
		{
			var childNode = aLink.getFirst();
			while(childNode)
			{
				//text node
				if(childNode.type != CKEDITOR.NODE_ELEMENT)
				{
					var span = new CKEDITOR.dom.element('span');
					span.insertBefore(childNode);
					span.append(childNode);
					childNode = span;
				}
				childNode = childNode.getNext();
			}
		}
		function _relocateCursorNode(cursorNode, offset, bStart)
		{
			var textOffset = offset;
			var cursorSpan = cursorNode;
			if(PresCKUtil.checkNodeName(cursorNode,'a'))
			{
				var bLastOffsetOfLink = (offset>=cursorNode.getChildCount());
				cursorSpan = cursorNode.getChild( bLastOffsetOfLink ?(cursorNode.getChildCount()-1):offset );
				if(PresCKUtil.checkNodeName(cursorSpan,'#text'))
				{
					var span = new CKEDITOR.dom.element('span');
					span.insertBefore(cursorSpan);
					span.append(cursorSpan);
					cursorSpan = span;
				}

				var textContent = PresListUtil._getTextContent(cursorSpan);
				textOffset = (bStart && !(bLastOffsetOfLink))?0:textContent.length;
			}
			else if(PresCKUtil.checkNodeName(cursorNode,'#text'))
			{
				cursorSpan = cursorNode.getParent();
				if(!cursorSpan.is('span'))
				{
					cursorSpan = new CKEDITOR.dom.element('span');
					cursorSpan.insertBefore(cursorNode);
					cursorSpan.append(cursorNode);
				}
			}
			else if(PresCKUtil.checkNodeName(cursorNode,'span'))
			{
				//Complex case
				// <span>
				//   <a>
				//    <span>
				if(PresCKUtil.checkNodeName(cursorNode.getFirst(),'a'))
				{
					var aLink = cursorNode.getFirst();
					_EncapsulsteLinkTextNode(aLink);
					cursorSpan = (offset>0)?aLink.getLast():aLink.getFrist();
					var textContent = PresListUtil._getTextContent(cursorSpan);
					textOffset = (offset==0)?0:textContent.length;
				}
				else
				{
					if(offset>0)
					{
						textOffset = 0;
						for(i=0;i<offset;i++)
						{
							var textNode = cursorNode.getChild(i);
							var textContent = PresListUtil._getTextContent(textNode);
							textOffset += textContent.length;
						}
					}
				}
			}
			return {
				container : cursorSpan,
				offset : textOffset
			};
		}
		
		var bCollapsed = range.collapsed;
		if(!(PresListUtil.m_hyperlinkRemoveFlags[lineNode] == null))
		{
			console.log('_flatternHyperlinkForLine forbidden be used twice continuely, should use _restoreHyperlinkForLine first');
			PresListUtil.m_hyperlinkRemoveFlags = [];
			PresListUtil.m_hyperlinkStoreMap = [];
		}
		var linkNodes = dojo.query('a',lineNode.$);
		if(!linkNodes.length)//No hyperlink, do nothing
			return range;
		//first of all we should get the cursor node of range, and mark it
		var startContainer = range.startContainer;
		var endContainer = range.endContainer;
		var startOffset = range.startOffset;
		var endOffset = range.endOffset;
		
		var ret = _relocateCursorNode(startContainer,startOffset,true);
		startContainer = ret.container;
		startOffset = ret.offset;
		
		//startContainer.setAttribute('_select_start','true');
		if(!bCollapsed)
		{
			var ret = _relocateCursorNode(endContainer,endOffset,false);
			endContainer = ret.container;
			endOffset = ret.offset;
		}
		///////////////////////////////////////////////////////////////////////////////
		//Flatten hyperlink
		var length = linkNodes.length;
		for(var i=0;i<length;i++)
		{
			var aLink = PresCKUtil.ChangeToCKNode(linkNodes[i]);
			_EncapsulsteLinkTextNode(aLink);
			var impLinkNode = aLink;
			if(aLink.getParent().is('span'))
			{
				impLinkNode = aLink.getParent();
			}
			
			var uniqueID = MSGUTIL.getUUID();
			var childSpan = aLink.getFirst();
			while(childSpan)
			{
				childSpan.setAttribute('_alink',uniqueID);
				childSpan.insertBefore(impLinkNode);
				childSpan = aLink.getFirst();
			}
			PresListUtil.m_hyperlinkStoreMap[uniqueID] = impLinkNode.clone(true);
			dojo.destroy(aLink.$);
		}
		//////////////////////////////////////////////////////////
		//Recover cursor range
		if(startContainer.is('span'))
		{
			startContainer.$.normalize();
			range.setStart(startContainer.getChild(0),startOffset);
		}
		else
		{
			range.startContainer = startContainer;
			range.startOffset = startOffset;
		}

		if(bCollapsed)
		{
			if(startContainer.is('span'))
			{
				range.setEnd(startContainer.getChild(0),startOffset);
			}
			else
			{
				range.endContainer = startContainer;
				range.endOffset = startOffset;
			}
		}
		else
		{
			if(endContainer.is('span'))
			{
				endContainer.$.normalize();
				range.setEnd(endContainer.getChild(0),endOffset);
			}
			else
			{
				range.setEndContainer(endContainer);
				range.setEndOffset(endOffset);
			}
		}
		//range.updateCollapsed();
		range.select();

		PresListUtil.m_hyperlinkRemoveFlags[lineNode] = true;
		return range;
	},
	
	//Restore hyperlink node
	//<span _alink="XXX">
	// ===>
	//<a>
	//	<span>
	//</a>
	// if range == null, that's a force mode
	//According to mark span, and then restore our range
	_restoreHyperlinkForLine : function(lineNode,range,bKeepLink)
	{
		if(PresListUtil.m_hyperlinkRemoveFlags[lineNode] == null)
			return range;
		if(range)
		{
			var bCollapsed = range.collapsed;
			//first of all we should get the cursor node of range, and mark it
			var startContainer = range.startContainer;
			var endContainer = range.endContainer;
			var startOffset = range.startOffset;
			var endOffset = range.endOffset;
			if(PresCKUtil.checkNodeName(startContainer,'#text'))
			{
				startContainer = startContainer.getParent();
			}
			else if(PresCKUtil.checkNodeName(startContainer,'span'))
			{
				var textOffset = 0;
				if(startOffset>0)
				{
					for(i=0;i<startOffset;i++)
					{
						var textNode = startContainer.getChild(i);
						var textContent = PresListUtil._getTextContent(textNode);
						textOffset += textContent.length;
					}
				}
				startOffset = textOffset;
			}
			startContainer.setAttribute('_select_start',startOffset);
			if(!bCollapsed)
			{
				if(PresCKUtil.checkNodeName(endContainer,'a'))
				{
					endContainer = endContainer.getChild(endOffset);
					var textContent = PresListUtil._getTextContent(endContainer);
					endOffset = textContent.length;
				}
				else if(PresCKUtil.checkNodeName(endContainer,'#text'))
				{
					endContainer = endContainer.getParent();
				}
				endContainer.setAttribute('_select_end',endOffset);
			}
		}		
		//////////////////////////////////////////////
		//restore the hyperlink
		var child = lineNode.getFirst();
		var curLink = null;
		var tLocalHyperlinkStoreMap = [];
		while(child)
		{
			if(child.hasAttribute('_alink'))
			{
				var linkID = child.getAttribute('_alink');
				child.removeAttribute('_alink');
				if(!PresCKUtil.isNodeTextEmpty(child))
				{
					var aLink = tLocalHyperlinkStoreMap[linkID] || PresListUtil.m_hyperlinkStoreMap[linkID];
					if(!curLink || !curLink.equals(aLink))
					{
						curLink = aLink.clone(true);
						curLink.insertBefore(child);
						//Start new link
						tLocalHyperlinkStoreMap[linkID] = curLink;
						var impLink = curLink;
						if(curLink.is('span'))
							impLink = curLink.getFirst();
						impLink.append(child.clone(true));
						child.setAttribute('_toBDestroy',true);
					}
					else if(curLink.equals(aLink))
					{
						var impLink = curLink;
						if(curLink.is('span'))
							impLink = curLink.getFirst();
						impLink.append(child.clone(true));
						child.setAttribute('_toBDestroy',true);
					}
				}

			}
			child = child.getNext();
		}
		dojo.query('[_toBDestroy]',lineNode.$).forEach(function(_node){
			dojo.destroy(_node);
		});
		
		
		if(!bKeepLink)
			PresListUtil.m_hyperlinkStoreMap = [];
		////////////////////////////////
		if(range)
		{
			PresListUtil.m_hyperlinkRemoveFlags[lineNode] = null;
			startContainer = dojo.query('[_select_start]',lineNode.$)[0];
			startContainer = PresCKUtil.ChangeToCKNode(startContainer);
			startOffset = parseInt(startContainer.getAttribute('_select_start'));
			startContainer.removeAttribute('_select_start');
			if(startContainer.is('span'))
			{
				startContainer.$.normalize();
				range.setStart(startContainer.getChild(0),startOffset);
			}
			else
			{
				range.startContainer = startContainer;
				range.startOffset = startOffset;
			}
	
			if(bCollapsed)
			{
				if(startContainer.is('span'))
				{
					range.setEnd(startContainer.getChild(0),startOffset);
				}
				else
				{
					range.endContainer = startContainer;
					range.endOffset = startOffset;
				}
			}
			else
			{
				endContainer = dojo.query('[_select_end]',lineNode.$)[0];
				endContainer = PresCKUtil.ChangeToCKNode(endContainer)
				endOffset = parseInt(endContainer.getAttribute('_select_end'));
				endContainer.removeAttribute('_select_end');
				if(endContainer.is('span'))
				{
					endContainer.$.normalize();
					range.setEnd(endContainer.getChild(0),endOffset);
				}
				else
				{
					range.endContainer = endContainer;
					range.endOffset = endOffset;
				}
			}
			range.select();
			return range;
		}
	}
});
(function() {
	if (typeof PresListUtil == "undefined")
		PresListUtil = new concord.pres.ListUtil();
})();
