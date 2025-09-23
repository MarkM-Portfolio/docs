dojo.provide("writer.model.listPrototype");

writer.model.listPrototype = function(){};

writer.model.listPrototype.prototype = {	
	getBaseType : function(type) {
		var base = this.N;
		if (type == "A") {
			base = this.A;
		} else if (type == "a") {
			base = this.a;
		} else if (type == 'I') {
			base = this.I;
		} else if (type == 'i') {
			base = this.i;
		} else if (type == '1' || type == 1) {
			base = this.N;
		} else if (type == 'イロツ1?7') {
			base = this.J1;
		} else if (type == 'アイや1?7') {
			base = this.J2;
		}
		return base;
	},
	A : {
		values : [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
				"M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
				"Y", "Z" ],
		valueMap : {
			"A" : 0,
			"B" : 1,
			"C" : 2,
			"D" : 3,
			"E" : 4,
			"F" : 5,
			"G" : 6,
			"H" : 7,
			"I" : 8,
			"J" : 9,
			"K" : 10,
			"L" : 11,
			"M" : 12,
			"N" : 13,
			"O" : 14,
			"P" : 15,
			"Q" : 16,
			"R" : 17,
			"S" : 18,
			"T" : 19,
			"U" : 20,
			"V" : 21,
			"W" : 22,
			"X" : 23,
			"Y" : 24,
			"Z" : 25
		},
		getIndex : function(value) {
			value = String(value);
			var k = value.length;
			value = value[0];
			return this.valueMap[value] + 26 * (k - 1);
		},
		getNextValue : function(currentValue, offset) {
			var rets = [];
			var index = this.getIndex(currentValue);
			var k = Math.floor(index / 26);
			index = index % 26;
			var value = this.values[(index + offset) % 26];
			var kk = k + Math.floor((index + offset) / 26);
			var ret = value;
			for ( var j = 0; j < kk; j++) {
				ret = ret + value;
			}
			return ret;
		},
		getValue:function(index){
			return this.getNextValue(this.values[0],index-1);
		}
	},
	a : {
		values : [ 'a', "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
				"m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x",
				"y", "z" ],
		valueMap : {
			"a" : 0,
			"b" : 1,
			"c" : 2,
			"d" : 3,
			"e" : 4,
			"f" : 5,
			"g" : 6,
			"h" : 7,
			"i" : 8,
			"j" : 9,
			"k" : 10,
			"l" : 11,
			"m" : 12,
			"n" : 13,
			"o" : 14,
			"p" : 15,
			"q" : 16,
			"r" : 17,
			"s" : 18,
			"t" : 19,
			"u" : 20,
			"v" : 21,
			"w" : 22,
			"x" : 23,
			"y" : 24,
			"z" : 25
		},
		getIndex : function(value) {
			value = String(value);
			var k = value.length;
			value = value[0];
			return this.valueMap[value] + 26 * (k - 1);
		},
		getNextValue : function(currentValue, offset) {
			var rets = [];
			var index = this.getIndex(currentValue);
			var k = Math.floor(index / 26);
			index = index % 26;
			var value = this.values[(index + offset) % 26];
			var kk = k + Math.floor((index + offset) / 26);
			var ret = value;
			for ( var j = 0; j < kk; j++) {
				ret = ret + value;
			}
			return ret;
		},
		getValue:function(index){
			return this.getNextValue(this.values[0],index-1);
		}
	},

	i : {
		values : [ 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
				'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii',
				'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi',
				'xxvii', 'xxviii', 'xxix', 'xxx', 'xxxi', 'xxxii', 'xxxiii',
				'xxxiv', 'xxxv', 'xxxvi', 'xxxvii', 'xxxviii', 'xxxix', 'xl',
				'xli', 'xlii', 'xliii', 'xliv', 'xlv', 'xlvi', 'xlvii',
				'xlviii', 'xlix', 'l', 'li', 'lii', 'liii', 'liv', 'lv', 'lvi',
				'lvii', 'lviii', 'lix', 'lx', 'lxi', 'lxii', 'lxiii', 'lxiv',
				'lxv', 'lxvi', 'lxvii', 'lxviii', 'lxix', 'lxx', 'lxxi',
				'lxxii', 'lxxiii', 'lxxiv', 'lxxv', 'lxxvi', 'lxxvii',
				'lxxviii', 'lxxix', 'lxxx', 'lxxxi', 'lxxxii', 'lxxxiii',
				'lxxxiv', 'lxxxv', 'lxxxvi', 'lxxxvii', 'lxxxviii', 'lxxxix',
				'xc', 'xci', 'xcii', 'xciii', 'xciv', 'xcv', 'xcvi', 'xcvii',
				'xcviii', 'xcix', 'c', 'ci', 'cii', 'ciii', 'civ', 'cv', 'cvi',
				'cvii', 'cviii', 'cix', 'cx', 'cxi', 'cxii', 'cxiii', 'cxiv',
				'cxv', 'cxvi', 'cxvii', 'cxviii', 'cxix', 'cxx', 'cxxi',
				'cxxii', 'cxxiii', 'cxxiv', 'cxxv', 'cxxvi', 'cxxvii',
				'cxxviii' ],
		valuesMap : {
			'i' : 0,
			'ii' : 1,
			'iii' : 2,
			'iv' : 3,
			'v' : 4,
			'vi' : 5,
			'vii' : 6,
			'viii' : 7,
			'ix' : 8,
			'x' : 9,
			'xi' : 10,
			'xii' : 11,
			'xiii' : 12,
			'xiv' : 13,
			'xv' : 14,
			'xvi' : 15,
			'xvii' : 16,
			'xviii' : 17,
			'xix' : 18,
			'xx' : 19,
			'xxi' : 20,
			'xxii' : 21,
			'xxiii' : 22,
			'xxiv' : 23,
			'xxv' : 24,
			'xxvi' : 25,
			'xxvii' : 26,
			'xxviii' : 27,
			'xxix' : 28,
			'xxx' : 29,
			'xxxi' : 30,
			'xxxii' : 31,
			'xxxiii' : 32,
			'xxxiv' : 33,
			'xxxv' : 34,
			'xxxvi' : 35,
			'xxxvii' : 36,
			'xxxviii' : 37,
			'xxxix' : 38,
			'xl' : 39,
			'xli' : 40,
			'xlii' : 41,
			'xliii' : 42,
			'xliv' : 43,
			'xlv' : 44,
			'xlvi' : 45,
			'xlvii' : 46,
			'xlviii' : 47,
			'xlix' : 48,
			'l' : 49,
			'li' : 50,
			'lii' : 51,
			'liii' : 52,
			'liv' : 53,
			'lv' : 54,
			'lvi' : 55,
			'lvii' : 56,
			'lviii' : 57,
			'lix' : 58,
			'lx' : 59,
			'lxi' : 60,
			'lxii' : 61,
			'lxiii' : 62,
			'lxiv' : 63,
			'lxv' : 64,
			'lxvi' : 65,
			'lxvii' : 66,
			'lxviii' : 67,
			'lxix' : 68,
			'lxx' : 69,
			'lxxi' : 70,
			'lxxii' : 71,
			'lxxiii' : 72,
			'lxxiv' : 73,
			'lxxv' : 74,
			'lxxvi' : 75,
			'lxxvii' : 76,
			'lxxviii' : 77,
			'lxxix' : 78,
			'lxxx' : 79,
			'lxxxi' : 80,
			'lxxxii' : 81,
			'lxxxiii' : 82,
			'lxxxiv' : 83,
			'lxxxv' : 84,
			'lxxxvi' : 85,
			'lxxxvii' : 86,
			'lxxxviii' : 87,
			'lxxxix' : 88,
			'xc' : 89,
			'xci' : 90,
			'xcii' : 91,
			'xciii' : 92,
			'xciv' : 93,
			'xcv' : 94,
			'xcvi' : 95,
			'xcvii' : 96,
			'xcviii' : 97,
			'xcix' : 98,
			'c' : 99,
			'ci' : 100,
			'cii' : 101,
			'ciii' : 102,
			'civ' : 103,
			'cv' : 104,
			'cvi' : 105,
			'cvii' : 106,
			'cviii' : 107,
			'cix' : 108,
			'cx' : 109,
			'cxi' : 110,
			'cxii' : 111,
			'cxiii' : 112,
			'cxiv' : 113,
			'cxv' : 114,
			'cxvi' : 115,
			'cxvii' : 116,
			'cxviii' : 117,
			'cxix' : 118,
			'cxx' : 119,
			'cxxi' : 120,
			'cxxii' : 121,
			'cxxiii' : 122,
			'cxxiv' : 123,
			'cxxv' : 124,
			'cxxvi' : 125,
			'cxxvii' : 126,
			'cxxviii' : 127
		},
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
				ret = ret + this.hundreds[hunred - 1];
			}
			if (decade > 0) {
				ret = ret + this.decades[decade - 1];
			}
			if (num > 0) {
				ret = ret + this.singles[num - 1];
			}
			return ret;
		},
		convertFromRom : function(rom) {
			var r = 0;
			for ( var c = 0; c < rom.length; c++) {
				var chr = rom.charAt(c).toLowerCase();
				if (c < rom.length - 1)
					var next = rom.charAt(c + 1).toLowerCase();
				else
					var next = '';
				if (c > 0)
					var prev = rom.charAt(c - 1).toLowerCase();
				else
					var prev = '';
				if (chr == 'i') {
					if (next == 'v')
						r += 4;
					else if (next == 'x')
						r += 9;
					else
						r += 1;
					continue;
				}
				if (chr == 'v') {
					if (prev != 'i')
						r += 5;
					continue;
				}
				if (chr == 'x') {
					if (prev != 'i')
						if (next == 'l')
							r += 40;
						else if (next == 'c')
							r += 90;
						else
							r += 10;
					continue;
				}
				if (chr == 'l') {
					if (prev != 'x')
						r += 50;
					continue;
				}
				if (chr == 'c') {
					if (prev != 'x')
						if (next == 'd')
							r += 400;
						else if (next == 'm')
							r += 900;
						else
							r += 100;
					continue;
				}
				if (chr == 'd') {
					if (prev != 'c')
						r += 500;
					continue;
				}
				if (chr == 'm') {
					if (prev != 'c')
						r += 1000;
					continue;
				}
			}
			return r;
		},
		getIndex : function(value) {
			return this.valuesMap[value];
		},
		getNextValue : function(currentValue, offset) {
			var index = this.valuesMap[currentValue];
			if (index == null || index < 0 || index > 127) {
				index = this.convertFromRom(currentValue);
				return this.convertRom(index + offset);
			} else {
				var idx = index + offset;
				if (idx < this.values.length) {
					return this.values[idx];
				} else {
					return this.convertRom(idx + 1);
				}
			}
		},
		getValue:function(index){
			return this.getNextValue(this.values[0],index-1);
		}
	},
	J1 : {
		values : [ "や1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7",
				"ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7",
				"や1?7", "ツ1?7", "や1?7", "ツ1?7", "や1?7", "ツ1?7", "ツ1?7",
				"ツ1?7", "ツ1?7", "ツ1?7", "や1?7", "ツ1?7", "ツ1?7", "や1?7",
				"や1?7", "ツ1?7", "ツ1?7", "や1?7", "ツ1?7", "や1?7", "や1?7",
				"ツ1?7", "や1?7", "や1?7", "や1?7", "ツ1?7", "ツ1?7", "ツ1?7",
				"や1?7", "ツ1?7", "ツ1?7", "ツ1?7", "や1?7", "や1?7", "ツ1?7" ],
		valueMap : {
			"や1?7" : 0,
			"ツ1?7" : 1,
			"ツ1?7" : 2,
			"ツ1?7" : 3,
			"ツ1?7" : 4,
			"ツ1?7" : 5,
			"ツ1?7" : 6,
			"ツ1?7" : 7,
			"ツ1?7" : 8,
			"ツ1?7" : 9,
			"ツ1?7" : 10,
			"ツ1?7" : 11,
			"ツ1?7" : 12,
			"や1?7" : 13,
			"ツ1?7" : 14,
			"や1?7" : 15,
			"ツ1?7" : 16,
			"や1?7" : 17,
			"ツ1?7" : 18,
			"ツ1?7" : 19,
			"ツ1?7" : 20,
			"ツ1?7" : 21,
			"ツ1?7" : 22,
			"や1?7" : 23,
			"ツ1?7" : 24,
			"ツ1?7" : 25,
			"や1?7" : 26,
			"や1?7" : 27,
			"ツ1?7" : 28,
			"ツ1?7" : 29,
			"や1?7" : 30,
			"ツ1?7" : 31,
			"や1?7" : 32,
			"や1?7" : 33,
			"ツ1?7" : 34,
			"や1?7" : 35,
			"や1?7" : 36,
			"や1?7" : 37,
			"ツ1?7" : 38,
			"ツ1?7" : 39,
			"ツ1?7" : 40,
			"や1?7" : 41,
			"ツ1?7" : 42,
			"ツ1?7" : 43,
			"ツ1?7" : 44,
			"や1?7" : 45,
			"や1?7" : 46,
			"ツ1?7" : 47
		},
		getIndex : function(value) {
			value = String(value);
			return this.valueMap[value];
		},
		getNextValue : function(currentValue, offset) {
			var index = this.getIndex(currentValue);
			var nextIndex = (index + offset) % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		},
		getValue:function(index){
			return this.getNextValue(this.values[0],index-1);
		}
	},
	J2 : {
		values : [ "や1?7", "や1?7", "や1?7", "や1?7", "や1?7", "や1?7",
				"や1?7", "や1?7", "や1?7", "や1?7", "や1?7", "や1?7", "や1?7",
				"や1?7", "や1?7", "や1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7",
				"ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7",
				"ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7",
				"ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7",
				"ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7", "ツ1?7" ],
		valueMap : {
			"や1?7" : 0,
			"や1?7" : 1,
			"や1?7" : 2,
			"や1?7" : 3,
			"や1?7" : 4,
			"や1?7" : 5,
			"や1?7" : 6,
			"や1?7" : 7,
			"や1?7" : 8,
			"や1?7" : 9,
			"や1?7" : 10,
			"や1?7" : 11,
			"や1?7" : 12,
			"や1?7" : 13,
			"や1?7" : 14,
			"や1?7" : 15,
			"ツ1?7" : 16,
			"ツ1?7" : 17,
			"ツ1?7" : 18,
			"ツ1?7" : 19,
			"ツ1?7" : 20,
			"ツ1?7" : 21,
			"ツ1?7" : 22,
			"ツ1?7" : 23,
			"ツ1?7" : 24,
			"ツ1?7" : 25,
			"ツ1?7" : 26,
			"ツ1?7" : 27,
			"ツ1?7" : 28,
			"ツ1?7" : 29,
			"ツ1?7" : 30,
			"ツ1?7" : 31,
			"ツ1?7" : 32,
			"ツ1?7" : 33,
			"ツ1?7" : 34,
			"ツ1?7" : 35,
			"ツ1?7" : 36,
			"ツ1?7" : 37,
			"ツ1?7" : 38,
			"ツ1?7" : 39,
			"ツ1?7" : 40,
			"ツ1?7" : 41,
			"ツ1?7" : 42,
			"ツ1?7" : 43,
			"ツ1?7" : 44,
			"ツ1?7" : 45
		},
		getIndex : function(value) {
			value = String(value);
			return this.valueMap[value];
		},
		getNextValue : function(currentValue, offset) {
			var index = this.getIndex(currentValue);
			var nextIndex = (index + offset) % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		},
		getValue:function(index){
			return this.getNextValue(this.values[0],index-1);
		}
	},
	I : {
		values : [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
				'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII',
				'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI',
				'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII',
				'XXXIV', 'XXXV', 'XXXVI', 'XXXVII', 'XXXVIII', 'XXXIX', 'XL',
				'XLI', 'XLII', 'XLIII', 'XLIV', 'XLV', 'XLVI', 'XLVII',
				'XLVIII', 'XLIX', 'L', 'LI', 'LII', 'LIII', 'LIV', 'LV', 'LVI',
				'LVII', 'LVIII', 'LIX', 'LX', 'LXI', 'LXII', 'LXIII', 'LXIV',
				'LXV', 'LXVI', 'LXVII', 'LXVIII', 'LXIX', 'LXX', 'LXXI',
				'LXXII', 'LXXIII', 'LXXIV', 'LXXV', 'LXXVI', 'LXXVII',
				'LXXVIII', 'LXXIX', 'LXXX', 'LXXXI', 'LXXXII', 'LXXXIII',
				'LXXXIV', 'LXXXV', 'LXXXVI', 'LXXXVII', 'LXXXVIII', 'LXXXIX',
				'XC', 'XCI', 'XCII', 'XCIII', 'XCIV', 'XCV', 'XCVI', 'XCVII',
				'XCVIII', 'XCIX', 'C', 'CI', 'CII', 'CIII', 'CIV', 'CV', 'CVI',
				'CVII', 'CVIII', 'CIX', 'CX', 'CXI', 'CXII', 'CXIII', 'CXIV',
				'CXV', 'CXVI', 'CXVII', 'CXVIII', 'CXIX', 'CXX', 'CXXI',
				'CXXII', 'CXXIII', 'CXXIV', 'CXXV', 'CXXVI', 'CXXVII',
				'CXXVIII' ],
		valuesMap : {
			'I' : 0,
			'II' : 1,
			'III' : 2,
			'IV' : 3,
			'V' : 4,
			'VI' : 5,
			'VII' : 6,
			'VIII' : 7,
			'IX' : 8,
			'X' : 9,
			'XI' : 10,
			'XII' : 11,
			'XIII' : 12,
			'XIV' : 13,
			'XV' : 14,
			'XVI' : 15,
			'XVII' : 16,
			'XVIII' : 17,
			'XIX' : 18,
			'XX' : 19,
			'XXI' : 20,
			'XXII' : 21,
			'XXIII' : 22,
			'XXIV' : 23,
			'XXV' : 24,
			'XXVI' : 25,
			'XXVII' : 26,
			'XXVIII' : 27,
			'XXIX' : 28,
			'XXX' : 29,
			'XXXI' : 30,
			'XXXII' : 31,
			'XXXIII' : 32,
			'XXXIV' : 33,
			'XXXV' : 34,
			'XXXVI' : 35,
			'XXXVII' : 36,
			'XXXVIII' : 37,
			'XXXIX' : 38,
			'XL' : 39,
			'XLI' : 40,
			'XLII' : 41,
			'XLIII' : 42,
			'XLIV' : 43,
			'XLV' : 44,
			'XLVI' : 45,
			'XLVII' : 46,
			'XLVIII' : 47,
			'XLIX' : 48,
			'L' : 49,
			'LI' : 50,
			'LII' : 51,
			'LIII' : 52,
			'LIV' : 53,
			'LV' : 54,
			'LVI' : 55,
			'LVII' : 56,
			'LVIII' : 57,
			'LIX' : 58,
			'LX' : 59,
			'LXI' : 60,
			'LXII' : 61,
			'LXIII' : 62,
			'LXIV' : 63,
			'LXV' : 64,
			'LXVI' : 65,
			'LXVII' : 66,
			'LXVIII' : 67,
			'LXIX' : 68,
			'LXX' : 69,
			'LXXI' : 70,
			'LXXII' : 71,
			'LXXIII' : 72,
			'LXXIV' : 73,
			'LXXV' : 74,
			'LXXVI' : 75,
			'LXXVII' : 76,
			'LXXVIII' : 77,
			'LXXIX' : 78,
			'LXXX' : 79,
			'LXXXI' : 80,
			'LXXXII' : 81,
			'LXXXIII' : 82,
			'LXXXIV' : 83,
			'LXXXV' : 84,
			'LXXXVI' : 85,
			'LXXXVII' : 86,
			'LXXXVIII' : 87,
			'LXXXIX' : 88,
			'XC' : 89,
			'XCI' : 90,
			'XCII' : 91,
			'XCIII' : 92,
			'XCIV' : 93,
			'XCV' : 94,
			'XCVI' : 95,
			'XCVII' : 96,
			'XCVIII' : 97,
			'XCIX' : 98,
			'C' : 99,
			'CI' : 100,
			'CII' : 101,
			'CIII' : 102,
			'CIV' : 103,
			'CV' : 104,
			'CVI' : 105,
			'CVII' : 106,
			'CVIII' : 107,
			'CIX' : 108,
			'CX' : 109,
			'CXI' : 110,
			'CXII' : 111,
			'CXIII' : 112,
			'CXIV' : 113,
			'CXV' : 114,
			'CXVI' : 115,
			'CXVII' : 116,
			'CXVIII' : 117,
			'CXIX' : 118,
			'CXX' : 119,
			'CXXI' : 120,
			'CXXII' : 121,
			'CXXIII' : 122,
			'CXXIV' : 123,
			'CXXV' : 124,
			'CXXVI' : 125,
			'CXXVII' : 126,
			'CXXVIII' : 127
		},
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
				ret = ret + this.hundreds[hunred - 1];
			}
			if (decade > 0) {
				ret = ret + this.decades[decade - 1];
			}
			if (num > 0) {
				ret = ret + this.singles[num - 1];
			}
			return ret;
		},
		convertFromRom : function(rom) {
			var r = 0;
			for ( var c = 0; c < rom.length; c++) {
				var chr = rom.charAt(c).toLowerCase();
				if (c < rom.length - 1)
					var next = rom.charAt(c + 1).toLowerCase();
				else
					var next = '';
				if (c > 0)
					var prev = rom.charAt(c - 1).toLowerCase();
				else
					var prev = '';
				if (chr == 'i') {
					if (next == 'v')
						r += 4;
					else if (next == 'x')
						r += 9;
					else
						r += 1;
					continue;
				}
				if (chr == 'v') {
					if (prev != 'i')
						r += 5;
					continue;
				}
				if (chr == 'x') {
					if (prev != 'i')
						if (next == 'l')
							r += 40;
						else if (next == 'c')
							r += 90;
						else
							r += 10;
					continue;
				}
				if (chr == 'l') {
					if (prev != 'x')
						r += 50;
					continue;
				}
				if (chr == 'c') {
					if (prev != 'x')
						if (next == 'd')
							r += 400;
						else if (next == 'm')
							r += 900;
						else
							r += 100;
					continue;
				}
				if (chr == 'd') {
					if (prev != 'c')
						r += 500;
					continue;
				}
				if (chr == 'm') {
					if (prev != 'c')
						r += 1000;
					continue;
				}
			}
			return r;
		},
		getIndex : function(value) {
			return this.valuesMap[value];
		},
		getNextValue : function(currentValue, offset) {
			var index = this.valuesMap[currentValue];
			var ret;
			if (index == null || index < 0 || index > 127) {
				index = this.convertFromRom(currentValue);
				ret = this.convertRom(index + offset);
			} else {
				var idx = index + offset;
				if (idx < this.values.length) {
					ret = this.values[idx];
				} else {
					ret = this.convertRom(idx + 1);
				}
			}
			return ret;
		},
		getValue:function(index){
			return this.getNextValue(this.values[0],index-1);
		}
	},
	N : {
		getNextValue : function(currentValue, offset) {
			var ret = "";
			var val = parseInt(currentValue) + offset;
			ret += val;
			return ret;
		},
		getValue:function(index){
			return index;
		}
	}
}