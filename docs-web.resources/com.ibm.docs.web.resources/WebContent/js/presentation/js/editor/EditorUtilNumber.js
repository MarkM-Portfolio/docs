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

dojo.provide("pres.editor.EditorUtilNumber");

dojo.declare("pres.editor.EditorUtilNumber", null, {
	A: {
		values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
		valueMap: {
			"A": 0,
			"B": 1,
			"C": 2,
			"D": 3,
			"E": 4,
			"F": 5,
			"G": 6,
			"H": 7,
			"I": 8,
			"J": 9,
			"K": 10,
			"L": 11,
			"M": 12,
			"N": 13,
			"O": 14,
			"P": 15,
			"Q": 16,
			"R": 17,
			"S": 18,
			"T": 19,
			"U": 20,
			"V": 21,
			"W": 22,
			"X": 23,
			"Y": 24,
			"Z": 25
		},
		getIndex: function(value)
		{
			value = String(value);
			var k = value.length;
			value = value[0];
			return this.valueMap[value] + 26 * (k - 1);
		},
		// From 0
		getValue: function(index)
		{
			var k = Math.floor(index / 26);
			index = index % 26;
			var value = this.values[index % 26];
			var kk = k + Math.floor(index / 26);
			var ret = value;
			for ( var j = 0; j < kk; j++)
			{
				ret = ret + value;
			}
			return ret;
		},
		getNextValue: function(currentValue, offset)
		{
			var index = this.getIndex(currentValue);
			return this.getValue(index + offset);
		}
	},
	a: {
		values: ['a', "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
		valueMap: {
			"a": 0,
			"b": 1,
			"c": 2,
			"d": 3,
			"e": 4,
			"f": 5,
			"g": 6,
			"h": 7,
			"i": 8,
			"j": 9,
			"k": 10,
			"l": 11,
			"m": 12,
			"n": 13,
			"o": 14,
			"p": 15,
			"q": 16,
			"r": 17,
			"s": 18,
			"t": 19,
			"u": 20,
			"v": 21,
			"w": 22,
			"x": 23,
			"y": 24,
			"z": 25
		},
		getIndex: function(value)
		{
			value = String(value);
			var k = value.length;
			value = value[0];
			return this.valueMap[value] + 26 * (k - 1);
		},
		// From 0
		getValue: function(index)
		{
			var k = Math.floor(index / 26);
			index = index % 26;
			var value = this.values[index % 26];
			var kk = k + Math.floor(index / 26);
			var ret = value;
			for ( var j = 0; j < kk; j++)
			{
				ret = ret + value;
			}
			return ret;
		},
		getNextValue: function(currentValue, offset)
		{
			var index = this.getIndex(currentValue);
			return this.getValue(index + offset);
		}
	},
	I: {
		values: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI', 'XXXVII', 'XXXVIII', 'XXXIX', 'XL', 'XLI', 'XLII', 'XLIII', 'XLIV', 'XLV', 'XLVI', 'XLVII', 'XLVIII', 'XLIX', 'L', 'LI', 'LII', 'LIII', 'LIV', 'LV', 'LVI', 'LVII', 'LVIII', 'LIX', 'LX', 'LXI', 'LXII', 'LXIII', 'LXIV', 'LXV', 'LXVI', 'LXVII', 'LXVIII', 'LXIX', 'LXX', 'LXXI', 'LXXII', 'LXXIII', 'LXXIV', 'LXXV', 'LXXVI', 'LXXVII', 'LXXVIII', 'LXXIX', 'LXXX', 'LXXXI', 'LXXXII', 'LXXXIII', 'LXXXIV', 'LXXXV', 'LXXXVI', 'LXXXVII', 'LXXXVIII', 'LXXXIX', 'XC', 'XCI', 'XCII', 'XCIII', 'XCIV', 'XCV', 'XCVI', 'XCVII', 'XCVIII', 'XCIX', 'C', 'CI', 'CII', 'CIII', 'CIV', 'CV', 'CVI', 'CVII', 'CVIII', 'CIX', 'CX', 'CXI', 'CXII', 'CXIII', 'CXIV', 'CXV', 'CXVI', 'CXVII', 'CXVIII', 'CXIX', 'CXX', 'CXXI', 'CXXII', 'CXXIII', 'CXXIV', 'CXXV', 'CXXVI', 'CXXVII', 'CXXVIII'],
		valuesMap: {
			'I': 0,
			'II': 1,
			'III': 2,
			'IV': 3,
			'V': 4,
			'VI': 5,
			'VII': 6,
			'VIII': 7,
			'IX': 8,
			'X': 9,
			'XI': 10,
			'XII': 11,
			'XIII': 12,
			'XIV': 13,
			'XV': 14,
			'XVI': 15,
			'XVII': 16,
			'XVIII': 17,
			'XIX': 18,
			'XX': 19,
			'XXI': 20,
			'XXII': 21,
			'XXIII': 22,
			'XXIV': 23,
			'XXV': 24,
			'XXVI': 25,
			'XXVII': 26,
			'XXVIII': 27,
			'XXIX': 28,
			'XXX': 29,
			'XXXI': 30,
			'XXXII': 31,
			'XXXIII': 32,
			'XXXIV': 33,
			'XXXV': 34,
			'XXXVI': 35,
			'XXXVII': 36,
			'XXXVIII': 37,
			'XXXIX': 38,
			'XL': 39,
			'XLI': 40,
			'XLII': 41,
			'XLIII': 42,
			'XLIV': 43,
			'XLV': 44,
			'XLVI': 45,
			'XLVII': 46,
			'XLVIII': 47,
			'XLIX': 48,
			'L': 49,
			'LI': 50,
			'LII': 51,
			'LIII': 52,
			'LIV': 53,
			'LV': 54,
			'LVI': 55,
			'LVII': 56,
			'LVIII': 57,
			'LIX': 58,
			'LX': 59,
			'LXI': 60,
			'LXII': 61,
			'LXIII': 62,
			'LXIV': 63,
			'LXV': 64,
			'LXVI': 65,
			'LXVII': 66,
			'LXVIII': 67,
			'LXIX': 68,
			'LXX': 69,
			'LXXI': 70,
			'LXXII': 71,
			'LXXIII': 72,
			'LXXIV': 73,
			'LXXV': 74,
			'LXXVI': 75,
			'LXXVII': 76,
			'LXXVIII': 77,
			'LXXIX': 78,
			'LXXX': 79,
			'LXXXI': 80,
			'LXXXII': 81,
			'LXXXIII': 82,
			'LXXXIV': 83,
			'LXXXV': 84,
			'LXXXVI': 85,
			'LXXXVII': 86,
			'LXXXVIII': 87,
			'LXXXIX': 88,
			'XC': 89,
			'XCI': 90,
			'XCII': 91,
			'XCIII': 92,
			'XCIV': 93,
			'XCV': 94,
			'XCVI': 95,
			'XCVII': 96,
			'XCVIII': 97,
			'XCIX': 98,
			'C': 99,
			'CI': 100,
			'CII': 101,
			'CIII': 102,
			'CIV': 103,
			'CV': 104,
			'CVI': 105,
			'CVII': 106,
			'CVIII': 107,
			'CIX': 108,
			'CX': 109,
			'CXI': 110,
			'CXII': 111,
			'CXIII': 112,
			'CXIV': 113,
			'CXV': 114,
			'CXVI': 115,
			'CXVII': 116,
			'CXVIII': 117,
			'CXIX': 118,
			'CXX': 119,
			'CXXI': 120,
			'CXXII': 121,
			'CXXIII': 122,
			'CXXIV': 123,
			'CXXV': 124,
			'CXXVI': 125,
			'CXXVII': 126,
			'CXXVIII': 127
		},
		singles: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
		decades: ['X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
		hundreds: ['C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'],
		thousands: ['M'],
		convertRom: function(num)
		{
			var thousand = Math.floor(num / 1000);
			num = num % 1000;
			var hunred = Math.floor(num / 100);
			num = num % 100;
			var decade = Math.floor(num / 10);
			num = num % 10;
			var ret = "";
			if (thousand > 0)
			{
				for ( var i = 0; i < thousand; i++)
				{
					ret = ret + 'M';
				}
			}
			if (hunred > 0)
			{
				ret = ret + EditorUtil.hundreds[hunred - 1];
			}
			if (decade > 0)
			{
				ret = ret + EditorUtil.decades[decade - 1];
			}
			if (num > 0)
			{
				ret = ret + EditorUtil.singles[num - 1];
			}
			return ret;
		},
		convertFromRom: function(rom)
		{
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
						else if (next == 'm')
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
		getIndex: function(value)
		{
			return this.valuesMap[value];
		},
		// From 0
		getValue: function(index)
		{
			var ret;
			var idx = index;
			if (idx < this.values.length)
			{
				ret = this.values[idx];
			}
			else
			{
				ret = EditorUtil.convertRom(idx + 1);
			}
			return ret;
		},
		getNextValue: function(currentValue, offset)
		{
			var index = this.valuesMap[currentValue];
			if (index == null || index < 0 || index > 127)
			{
				index = EditorUtil.convertFromRom(currentValue);
			}
			return this.getValue(index + offset);
		}
	},
	i: {
		values: ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi', 'xxvii', 'xxviii', 'xxix', 'xxx', 'xxxi', 'xxxii', 'xxxiii', 'xxxiv', 'xxxv', 'xxxvi', 'xxxvii', 'xxxviii', 'xxxix', 'xl', 'xli', 'xlii', 'xliii', 'xliv', 'xlv', 'xlvi', 'xlvii', 'xlviii', 'xlix', 'l', 'li', 'lii', 'liii', 'liv', 'lv', 'lvi', 'lvii', 'lviii', 'lix', 'lx', 'lxi', 'lxii', 'lxiii', 'lxiv', 'lxv', 'lxvi', 'lxvii', 'lxviii', 'lxix', 'lxx', 'lxxi', 'lxxii', 'lxxiii', 'lxxiv', 'lxxv', 'lxxvi', 'lxxvii', 'lxxviii', 'lxxix', 'lxxx', 'lxxxi', 'lxxxii', 'lxxxiii', 'lxxxiv', 'lxxxv', 'lxxxvi', 'lxxxvii', 'lxxxviii', 'lxxxix', 'xc', 'xci', 'xcii', 'xciii', 'xciv', 'xcv', 'xcvi', 'xcvii', 'xcviii', 'xcix', 'c', 'ci', 'cii', 'ciii', 'civ', 'cv', 'cvi', 'cvii', 'cviii', 'cix', 'cx', 'cxi', 'cxii', 'cxiii', 'cxiv', 'cxv', 'cxvi', 'cxvii', 'cxviii', 'cxix', 'cxx', 'cxxi', 'cxxii', 'cxxiii', 'cxxiv', 'cxxv', 'cxxvi', 'cxxvii', 'cxxviii'],
		valuesMap: {
			'i': 0,
			'ii': 1,
			'iii': 2,
			'iv': 3,
			'v': 4,
			'vi': 5,
			'vii': 6,
			'viii': 7,
			'ix': 8,
			'x': 9,
			'xi': 10,
			'xii': 11,
			'xiii': 12,
			'xiv': 13,
			'xv': 14,
			'xvi': 15,
			'xvii': 16,
			'xviii': 17,
			'xix': 18,
			'xx': 19,
			'xxi': 20,
			'xxii': 21,
			'xxiii': 22,
			'xxiv': 23,
			'xxv': 24,
			'xxvi': 25,
			'xxvii': 26,
			'xxviii': 27,
			'xxix': 28,
			'xxx': 29,
			'xxxi': 30,
			'xxxii': 31,
			'xxxiii': 32,
			'xxxiv': 33,
			'xxxv': 34,
			'xxxvi': 35,
			'xxxvii': 36,
			'xxxviii': 37,
			'xxxix': 38,
			'xl': 39,
			'xli': 40,
			'xlii': 41,
			'xliii': 42,
			'xliv': 43,
			'xlv': 44,
			'xlvi': 45,
			'xlvii': 46,
			'xlviii': 47,
			'xlix': 48,
			'l': 49,
			'li': 50,
			'lii': 51,
			'liii': 52,
			'liv': 53,
			'lv': 54,
			'lvi': 55,
			'lvii': 56,
			'lviii': 57,
			'lix': 58,
			'lx': 59,
			'lxi': 60,
			'lxii': 61,
			'lxiii': 62,
			'lxiv': 63,
			'lxv': 64,
			'lxvi': 65,
			'lxvii': 66,
			'lxviii': 67,
			'lxix': 68,
			'lxx': 69,
			'lxxi': 70,
			'lxxii': 71,
			'lxxiii': 72,
			'lxxiv': 73,
			'lxxv': 74,
			'lxxvi': 75,
			'lxxvii': 76,
			'lxxviii': 77,
			'lxxix': 78,
			'lxxx': 79,
			'lxxxi': 80,
			'lxxxii': 81,
			'lxxxiii': 82,
			'lxxxiv': 83,
			'lxxxv': 84,
			'lxxxvi': 85,
			'lxxxvii': 86,
			'lxxxviii': 87,
			'lxxxix': 88,
			'xc': 89,
			'xci': 90,
			'xcii': 91,
			'xciii': 92,
			'xciv': 93,
			'xcv': 94,
			'xcvi': 95,
			'xcvii': 96,
			'xcviii': 97,
			'xcix': 98,
			'c': 99,
			'ci': 100,
			'cii': 101,
			'ciii': 102,
			'civ': 103,
			'cv': 104,
			'cvi': 105,
			'cvii': 106,
			'cviii': 107,
			'cix': 108,
			'cx': 109,
			'cxi': 110,
			'cxii': 111,
			'cxiii': 112,
			'cxiv': 113,
			'cxv': 114,
			'cxvi': 115,
			'cxvii': 116,
			'cxviii': 117,
			'cxix': 118,
			'cxx': 119,
			'cxxi': 120,
			'cxxii': 121,
			'cxxiii': 122,
			'cxxiv': 123,
			'cxxv': 124,
			'cxxvi': 125,
			'cxxvii': 126,
			'cxxviii': 127
		},
		singles: ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'],
		decades: ['x', 'xx', 'xxx', 'xl', 'l', 'lx', 'lxx', 'lxxx', 'xc'],
		hundreds: ['c', 'cc', 'ccc', 'cd', 'd', 'dc', 'dcc', 'dccc', 'cm'],
		thousands: ['m'],
		convertRom: function(num)
		{
			var thousand = Math.floor(num / 1000);
			num = num % 1000;
			var hunred = Math.floor(num / 100);
			num = num % 100;
			var decade = Math.floor(num / 10);
			num = num % 10;
			var ret = "";
			if (thousand > 0)
			{
				for ( var i = 0; i < thousand; i++)
				{
					ret = ret + 'm';
				}
			}
			if (hunred > 0)
			{
				ret = ret + EditorUtil.hundreds[hunred - 1];
			}
			if (decade > 0)
			{
				ret = ret + EditorUtil.decades[decade - 1];
			}
			if (num > 0)
			{
				ret = ret + EditorUtil.singles[num - 1];
			}
			return ret;
		},
		convertFromRom: function(rom)
		{
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
						else if (next == 'm')
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
		getIndex: function(value)
		{
			return this.valuesMap[value];
		},
		// From 0
		getValue: function(index)
		{
			var idx = index;
			if (idx < this.values.length)
			{
				return this.values[idx];
			}
			else
			{
				return EditorUtil.convertRom(idx + 1);
			}
		},
		getNextValue: function(currentValue, offset)
		{
			var index = this.valuesMap[currentValue];
			if (index == null || index < 0 || index > 127)
			{
				index = EditorUtil.convertFromRom(currentValue);
			}
			return this.getValue(index + offset);
		}
	},
	J1: {
		values: ["ã‚¤", "ãƒ­", "ãƒ�", "ãƒ‹", "ãƒ›", "ãƒ˜", "ãƒˆ", "ãƒ�", "ãƒª", "ãƒŒ", "ãƒ«", "ãƒ²", "ãƒ¯", "ã‚«", "ãƒ¨", "ã‚¿", "ãƒ¬", "ã‚½", "ãƒ„", "ãƒ�", "ãƒŠ", "ãƒ©", "ãƒ ", "ã‚¦", "ãƒ°", "ãƒŽ", "ã‚ª", "ã‚¯", "ãƒ¤", "ãƒž", "ã‚±", "ãƒ•", "ã‚³", "ã‚¨", "ãƒ†", "ã‚¢", "ã‚µ", "ã‚­", "ãƒ¦", "ãƒ¡", "ãƒŸ", "ã‚·", "ãƒ±", "ãƒ’", "ãƒ¢", "ã‚»", "ã‚¹", "ãƒ³"],
		valueMap: {
			"ã‚¤": 0,
			"ãƒ­": 1,
			"ãƒ�": 2,
			"ãƒ‹": 3,
			"ãƒ›": 4,
			"ãƒ˜": 5,
			"ãƒˆ": 6,
			"ãƒ�": 7,
			"ãƒª": 8,
			"ãƒŒ": 9,
			"ãƒ«": 10,
			"ãƒ²": 11,
			"ãƒ¯": 12,
			"ã‚«": 13,
			"ãƒ¨": 14,
			"ã‚¿": 15,
			"ãƒ¬": 16,
			"ã‚½": 17,
			"ãƒ„": 18,
			"ãƒ�": 19,
			"ãƒŠ": 20,
			"ãƒ©": 21,
			"ãƒ ": 22,
			"ã‚¦": 23,
			"ãƒ°": 24,
			"ãƒŽ": 25,
			"ã‚ª": 26,
			"ã‚¯": 27,
			"ãƒ¤": 28,
			"ãƒž": 29,
			"ã‚±": 30,
			"ãƒ•": 31,
			"ã‚³": 32,
			"ã‚¨": 33,
			"ãƒ†": 34,
			"ã‚¢": 35,
			"ã‚µ": 36,
			"ã‚­": 37,
			"ãƒ¦": 38,
			"ãƒ¡": 39,
			"ãƒŸ": 40,
			"ã‚·": 41,
			"ãƒ±": 42,
			"ãƒ’": 43,
			"ãƒ¢": 44,
			"ã‚»": 45,
			"ã‚¹": 46,
			"ãƒ³": 47
		},
		getIndex: function(value)
		{
			value = String(value);
			return this.valueMap[value];
		},
		// From 0
		getValue: function(index)
		{
			var nextIndex = index % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		},
		getNextValue: function(currentValue, offset)
		{
			var index = this.getIndex(currentValue);
			return this.getValue(index + offset);
		}
	},
	J2: {
		values: ["ã‚¢", "ã‚¤", "ã‚¦", "ã‚¨", "ã‚ª", "ã‚«", "ã‚­", "ã‚¯", "ã‚±", "ã‚³", "ã‚µ", "ã‚·", "ã‚¹", "ã‚»", "ã‚½", "ã‚¿", "ãƒ�", "ãƒ„", "ãƒ†", "ãƒˆ", "ãƒŠ", "ãƒ‹", "ãƒŒ", "ãƒ�", "ãƒŽ", "ãƒ�", "ãƒ’", "ãƒ•", "ãƒ˜", "ãƒ›", "ãƒž", "ãƒŸ", "ãƒ ", "ãƒ¡", "ãƒ¢", "ãƒ¤", "ãƒ¦", "ãƒ¨", "ãƒ©", "ãƒª", "ãƒ«", "ãƒ¬", "ãƒ­", "ãƒ¯", "ãƒ²", "ãƒ³"],
		valueMap: {
			"ã‚¢": 0,
			"ã‚¤": 1,
			"ã‚¦": 2,
			"ã‚¨": 3,
			"ã‚ª": 4,
			"ã‚«": 5,
			"ã‚­": 6,
			"ã‚¯": 7,
			"ã‚±": 8,
			"ã‚³": 9,
			"ã‚µ": 10,
			"ã‚·": 11,
			"ã‚¹": 12,
			"ã‚»": 13,
			"ã‚½": 14,
			"ã‚¿": 15,
			"ãƒ�": 16,
			"ãƒ„": 17,
			"ãƒ†": 18,
			"ãƒˆ": 19,
			"ãƒŠ": 20,
			"ãƒ‹": 21,
			"ãƒŒ": 22,
			"ãƒ�": 23,
			"ãƒŽ": 24,
			"ãƒ�": 25,
			"ãƒ’": 26,
			"ãƒ•": 27,
			"ãƒ˜": 28,
			"ãƒ›": 29,
			"ãƒž": 30,
			"ãƒŸ": 31,
			"ãƒ ": 32,
			"ãƒ¡": 33,
			"ãƒ¢": 34,
			"ãƒ¤": 35,
			"ãƒ¦": 36,
			"ãƒ¨": 37,
			"ãƒ©": 38,
			"ãƒª": 39,
			"ãƒ«": 40,
			"ãƒ¬": 41,
			"ãƒ­": 42,
			"ãƒ¯": 43,
			"ãƒ²": 44,
			"ãƒ³": 45
		},
		getIndex: function(value)
		{
			value = String(value);
			return this.valueMap[value];
		},
		// From 0
		getValue: function(index)
		{
			var nextIndex = index % this.values.length;
			var ret = this.values[nextIndex];
			return ret;
		},
		getNextValue: function(currentValue, offset)
		{
			var index = this.getIndex(currentValue);
			return this.getValue(index + offset);
		}
	},
	N: {
		// From 0
		getValue: function(index)
		{
			var ret = "";
			var val = index + 1;
			ret += val;
			return ret;
		},
		getNextValue: function(currentValue, offset)
		{
			var index = parseInt(currentValue);
			return this.getValue(index + offset);
		}
	},
	getBaseType: function(type)
	{
		var base = EditorUtil.N;
		if (type == "A")
		{
			base = EditorUtil.A;
		}
		else if (type == "a")
		{
			base = EditorUtil.a;
		}
		else if (type == 'I')
		{
			base = EditorUtil.I;
		}
		else if (type == 'i')
		{
			base = EditorUtil.i;
		}
		else if (type == '1' || type == 1)
		{
			base = EditorUtil.N;
		}
		else if (type == 'j1' || type == 'ã‚¤ãƒ­ãƒ�' || type == 'ï½²ï¾›ï¾Š')
		{
			base = EditorUtil.J1;
		}
		else if (type == 'j2' || type == 'ã‚¢ã‚¤ã‚¦' || type == 'ï½±ï½²ï½³')
		{
			base = EditorUtil.J2;
		}
		return base;
	},
	getValue: function(type, currentValueIndex)
	{
		var ret = "";
		var base = EditorUtil.getBaseType(type);
		if (currentValueIndex == 0)
		{
			ret = base.values ? base.values[0] : 1;
		}
		else
		{
			ret = base.getValue(currentValueIndex);
		}
		return ret;
	},
	getNextValue: function(type, currentValue, offset)
	{
		var ret = "";
		var base = EditorUtil.getBaseType(type);
		if (offset == 0)
		{
			ret = base.values ? base.values[0] : 1;
		}
		else
		{
			if (offset == null || offset == "" || offset == undefined)
			{
				offset = 1;
			}
			ret = base.getNextValue(currentValue, offset);
		}
		return ret;
	},

	convertToListBaseType: function(style)
	{
		var type = style;
		switch (style)
		{
			case "lst-ur":
				type = "I";
				break;
			case "lst-lr":
				type = "i";
				break;
			case "lst-uap":
			case "lst-ua":
				type = "A";
				break;
			case "lst-lap":
			case "lst-la":
				type = "a";
				break;
			case "lst-n":
			case "lst-n2":
			case "lst-np":
				type = "1";
				break;
			case "lst-j1":
				type = "ã‚¤ãƒ­ãƒ�";
				break;
			case "lst-j2":
				type = "ã‚¢ã‚¤ã‚¦";
				break;
		}
		;
		return type;
	},

	// return {numberType,listClass,startNumber,level}
	getNumberingKeyValue: function(curLine)
	{
		var numberType = EditorUtil.getAttribute(curLine, 'numberType');
		var liItem = EditorUtil.getLineItem(curLine);
		var lc = EditorUtil.getLineClass(liItem);
		// var listClass = lc?lc.listClass:null;
		var startNumber = parseInt(EditorUtil.getAttribute(liItem, 'startNumber'), 10);
		var level = parseInt(EditorUtil.getAttribute(liItem, 'level'), 10);

		return {
			numberType: numberType,
			listClassGroup: lc,
			startNumber: startNumber,
			level: level
		};
	},

	getMasterNumberingInfo: function(className)
	{
		function _implentment(cssName)
		{
			var classDiv = document.getElementById(cssName);
			if (!classDiv)
				return null;
			var startNumber = EditorUtil.getAttribute(classDiv, 'startnumber');
			var numberType = EditorUtil.getAttribute(classDiv, 'numbertype');
			if (startNumber && numberType)
			{
				return {
					numberType: numberType,
					startNumber: startNumber
				};
			}
			return null;
		}

		var re = _implentment(className);
		if (!re)
			re = _implentment(className + ":before");
		return re;
	},

	_isListClassEquals: function(lc_A, lc_B, bIgnorInlineClass)
	{
		function compareStr(a, b)
		{
			if (a < b)
				return 1;
			if (a > b)
				return -1;
			return 0; // a == b
		}

		function _sortListClass(lc)
		{
			for ( var p in lc)
			{
				if (lc[p])
				{
					lc[p].sort(compareStr);
				}
			}
		}

		_sortListClass(lc_A);
		_sortListClass(lc_B);

		if (!bIgnorInlineClass)
		{
			if (!(lc_A.inlineClass.toString() == lc_B.inlineClass.toString()))
				return false;
			if (!(lc_A.listMRClass.toString() == lc_B.listMRClass.toString()))
				return false;
		}

		// if there is inline list class, justify whether it's the same
		// if there is no inline list class, justify whether the master list style is the same
		var list_style_same = false;
		if (lc_A.listClass.toString().length > 0)
		{
			if (lc_B.listClass.toString().length > 0 && lc_A.listClass.toString() == lc_B.listClass.toString())
			{
				list_style_same = true;
			}
			else
			{
				list_style_same = false;
			}
		}
		else
		{
			if (lc_B.listClass.toString().length == 0 && lc_A.masterListClass.toString() == lc_B.masterListClass.toString())
			{
				list_style_same = true;
			}
			else
			{
				list_style_same = false;
			}
		}
		return list_style_same;
	},

	// Get next continue line, if not find, return null
	getNeighborNumberingContinueLine: function(curLine, bGetPreviousLine)
	{
		var numberInfo = EditorUtil.getNumberingKeyValue(curLine);
		// in some case, the bookmark node will be inserted into the line HTML structure
		var tmpLine = EditorUtil._getNeighborLine(curLine, bGetPreviousLine);
		while (tmpLine && (!EditorUtil.is(tmpLine, 'ol', 'ul', 'p')))
		{
			tmpLine = EditorUtil._getNeighborLine(curLine, bGetPreviousLine);
		}
		if (!tmpLine)
			return null;
		//
		for (; tmpLine; tmpLine = EditorUtil._getNeighborLine(tmpLine, bGetPreviousLine))
		{

			var tNumberInfo = EditorUtil.getNumberingKeyValue(tmpLine);
			if (numberInfo.level > tNumberInfo.level)
				break;// break condition [2] : a numbering line with higher level
			if (numberInfo.level < tNumberInfo.level)// ignore the level which bigger than current level
				continue;
			// For hidden list, we ignore it
			var tmpLineItem = EditorUtil.getLineItem(tmpLine);
			if (dojo.hasClass(tmpLineItem, "sys-list-hidden"))
				continue;
			if (!EditorUtil.is(tmpLine, 'ol'))// break condition [1] : same level but not numbering line
				break;

			if ((numberInfo.numberType == tNumberInfo.numberType) && (numberInfo.startNumber == tNumberInfo.startNumber) && (EditorUtil._isListClassEquals(numberInfo.listClassGroup, tNumberInfo.listClassGroup, true)))
			{
				return tmpLine;
			}
			else
				break;// break condition [3] : same level, but has different numbering

		}
		return null;
	},

	// return a group of line list, each list contain some line which should continue in numbering
	_getContinueListLines: function(rootNode)
	{
		var lines = [];
		var lineProcessed = [];
		var children = rootNode.childNodes;
		var lastLevel = null;
		for ( var i = 0, count = children.length; i < count; i++)
		{
			var curline = children[i];
			// If this line already be handled, continue
			if (lineProcessed[EditorUtil.getIndex(curline)])
				continue;
			// For hidden list, we ignore it
			var tmpLineItem = EditorUtil.getLineItem(curline);
			if(!tmpLineItem)
				continue;
			if (dojo.hasClass(tmpLineItem, "sys-list-hidden"))
				continue;
			if (EditorUtil.is(curline, 'ol'))
			{
				var continueLine = [];
				while (curline)
				{
					continueLine.push(curline);
					lineProcessed[EditorUtil.getIndex(curline)] = true;
					curline = EditorUtil.getNeighborNumberingContinueLine(curline);
				}

				lines.push(continueLine);
			}
			else if (EditorUtil.is(curline, 'ul', 'p'))
			{
				// do nothing
			}
			else
			{
				// debugger;
				// Must has illegal node in lines!
			}
		}
		return lines;
	},

	/*
	 * UpdateListValue for presentation list rootNode must be div/table, div is the parent of lines
	 */
	updateListValue: function(rootNode)
	{
		function _updateListValueForOneRoot(root, Nutil)
		{
			var lineLists = Nutil._getContinueListLines(root);
			var conLines = lineLists.pop();
			while (conLines)
			{
				if (conLines.length > 0)
				{
					var numberType = EditorUtil.getAttribute(conLines[0], 'numberType');
					var liItem = EditorUtil.getLineItem(conLines[0]);
					var startNumber = parseInt(EditorUtil.getAttribute(liItem, 'startNumber'), 10);
					for ( var i = 0; i < conLines.length; i++)
					{
						var v = Nutil.getValue(numberType, startNumber + i - 1);
						var li = EditorUtil.getLineItem(conLines[i]);
						if (dojo.hasClass(li, 'arabic')) {
							EditorUtil.setAttribute(li, 'values_arabic', BidiUtils.convertArabicToHindi(v + ""));
						} else {
							EditorUtil.removeAttribute(li, 'values_arabic');
						}
						EditorUtil.setAttribute(li, 'values', v);
					}
				}
				conLines = lineLists.pop();
			}
		}
		;

		if (!rootNode)
		{
			// Must have rootNode
			// debugger;
			return;
		}
		
		var olList = dojo.query('ol', rootNode);
		if(olList.length ==0)
			return;		
		
		if (EditorUtil.is(rootNode, 'div', 'td', 'th'))
			_updateListValueForOneRoot(rootNode, this);
		else if (EditorUtil.is(rootNode, 'table'))
		{
			var tdList = dojo.query('td,th', rootNode);
			for ( var i = 0; i < tdList.length; i++)
			{
				_updateListValueForOneRoot(tdList[i], this);
			}
		}
	}
});
