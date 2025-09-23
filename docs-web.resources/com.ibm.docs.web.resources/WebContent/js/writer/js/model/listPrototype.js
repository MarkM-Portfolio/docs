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
define([], function() {

    var listPrototype = function() {};

    listPrototype.prototype = {
        getBaseType: function(type) {
            var base = this.N;
            if (type == "A")
                base = this.A;
            else if (type == "a")
                base = this.a;
            else if (type == 'I')
                base = this.I;
            else if (type == 'i')
                base = this.i;
            else if (type == '1' || type == 1)
                base = this.N;
            else if (type == '\u30A4\u30ED\u30CF' || type == '\uFF72\uFF9B\uFF8A')
                base = this.J1;
            else if (type == '\u30A2\u30A4\u30A6' || type == '\uFF71\uFF72\uFF73')
                base = this.J2;
            else if (type == "Hindi")
                base = this.Hindi;
            else if (type == "CNSCTCounting")
            	base = this.CNSCTCounting;
            else if (type == "CNSCCounting")
            	base = this.CNSCCounting;
             else if (type == "CNSL")
            	base = this.CNSL;
             else if (type == "CNHeavenStem")
             	base = this.CNHeavenStem;
             else if (type == "CNZodiac")
             	base = this.CNZodiac;
            
            return base;
        },
        A: {
            values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
                "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                "Y", "Z"
            ],
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
            getIndex: function(value) {
                value = String(value);
                var k = value.length;
                value = value[0];
                return this.valueMap[value] + 26 * (k - 1);
            },
            getNextValue: function(currentValue, offset) {
                var rets = [];
                var index = this.getIndex(currentValue);
                var k = Math.floor(index / 26);
                index = index % 26;
                var value = this.values[(index + offset) % 26];
                var kk = k + Math.floor((index + offset) / 26);
                var ret = value;
                for (var j = 0; j < kk; j++) {
                    ret = ret + value;
                }
                return ret;
            },
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },
        a: {
            values: ['a', "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
                "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x",
                "y", "z"
            ],
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
            getIndex: function(value) {
                value = String(value);
                var k = value.length;
                value = value[0];
                return this.valueMap[value] + 26 * (k - 1);
            },
            getNextValue: function(currentValue, offset) {
                var rets = [];
                var index = this.getIndex(currentValue);
                var k = Math.floor(index / 26);
                index = index % 26;
                var value = this.values[(index + offset) % 26];
                var kk = k + Math.floor((index + offset) / 26);
                var ret = value;
                for (var j = 0; j < kk; j++) {
                    ret = ret + value;
                }
                return ret;
            },
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },

        i: {
            values: ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
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
                'cxxviii'
            ],
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
            convertRom: function(num) {
                var thousand = Math.floor(num / 1000);
                num = num % 1000;
                var hunred = Math.floor(num / 100);
                num = num % 100;
                var decade = Math.floor(num / 10);
                num = num % 10;
                var ret = "";
                if (thousand > 0) {
                    for (var i = 0; i < thousand; i++) {
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
            convertFromRom: function(rom) {
                var r = 0;
                for (var c = 0; c < rom.length; c++) {
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
            getIndex: function(value) {
                return this.valuesMap[value];
            },
            getNextValue: function(currentValue, offset) {
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
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },
        J1: {

            values: ["\u30A4", "\u30ED", "\u30CF", "\u30CB", "\u30DB", "\u30D8", "\u30C8", "\u30C1", "\u30EA", "\u30CC", "\u30EB", "\u30F2", "\u30EF", "\u30AB", "\u30E8", "\u30BF", "\u30EC", "\u30BD", "\u30C4", "\u30CD", "\u30CA", "\u30E9", "\u30E0", "\u30A6", "\u30F0", "\u30CE", "\u30AA", "\u30AF", "\u30E4", "\u30DE", "\u30B1", "\u30D5", "\u30B3", "\u30A8", "\u30C6", "\u30A2", "\u30B5", "\u30AD", "\u30E6", "\u30E1", "\u30DF", "\u30B7", "\u30F1", "\u30D2", "\u30E2", "\u30BB", "\u30B9", "\u30F3"],
            valueMap: {
                "\u30A4": 0,
                "\u30ED": 1,
                "\u30CF": 2,
                "\u30CB": 3,
                "\u30DB": 4,
                "\u30D8": 5,
                "\u30C8": 6,
                "\u30C1": 7,
                "\u30EA": 8,
                "\u30CC": 9,
                "\u30EB": 10,
                "\u30F2": 11,
                "\u30EF": 12,
                "\u30AB": 13,
                "\u30E8": 14,
                "\u30BF": 15,
                "\u30EC": 16,
                "\u30BD": 17,
                "\u30C4": 18,
                "\u30CD": 19,
                "\u30CA": 20,
                "\u30E9": 21,
                "\u30E0": 22,
                "\u30A6": 23,
                "\u30F0": 24,
                "\u30CE": 25,
                "\u30AA": 26,
                "\u30AF": 27,
                "\u30E4": 28,
                "\u30DE": 29,
                "\u30B1": 30,
                "\u30D5": 31,
                "\u30B3": 32,
                "\u30A8": 33,
                "\u30C6": 34,
                "\u30A2": 35,
                "\u30B5": 36,
                "\u30AD": 37,
                "\u30E6": 38,
                "\u30E1": 39,
                "\u30DF": 40,
                "\u30B7": 41,
                "\u30F1": 42,
                "\u30D2": 43,
                "\u30E2": 44,
                "\u30BB": 45,
                "\u30B9": 46,
                "\u30F3": 47
            },
            getIndex: function(value) {
                value = String(value);
                return this.valueMap[value];
            },
            getNextValue: function(currentValue, offset) {
                var index = this.getIndex(currentValue);
                var nextIndex = (index + offset) % this.values.length;
                var ret = this.values[nextIndex];
                return ret;
            },
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },
        J2: {
            values: ["\u30A2", "\u30A4", "\u30A6", "\u30A8", "\u30AA", "\u30AB", "\u30AD", "\u30AF", "\u30B1", "\u30B3", "\u30B5", "\u30B7", "\u30B9", "\u30BB", "\u30BD", "\u30BF", "\u30C1", "\u30C4", "\u30C6", "\u30C8", "\u30CA", "\u30CB", "\u30CC", "\u30CD", "\u30CE", "\u30CF", "\u30D2", "\u30D5", "\u30D8", "\u30DB", "\u30DE", "\u30DF", "\u30E0", "\u30E1", "\u30E2", "\u30E4", "\u30E6", "\u30E8", "\u30E9", "\u30EA", "\u30EB", "\u30EC", "\u30ED", "\u30EF", "\u30F2", "\u30F3"],
            valueMap: {
                "\u30A2": 0,
                "\u30A4": 1,
                "\u30A6": 2,
                "\u30A8": 3,
                "\u30AA": 4,
                "\u30AB": 5,
                "\u30AD": 6,
                "\u30AF": 7,
                "\u30B1": 8,
                "\u30B3": 9,
                "\u30B5": 10,
                "\u30B7": 11,
                "\u30B9": 12,
                "\u30BB": 13,
                "\u30BD": 14,
                "\u30BF": 15,
                "\u30C1": 16,
                "\u30C4": 17,
                "\u30C6": 18,
                "\u30C8": 19,
                "\u30CA": 20,
                "\u30CB": 21,
                "\u30CC": 22,
                "\u30CD": 23,
                "\u30CE": 24,
                "\u30CF": 25,
                "\u30D2": 26,
                "\u30D5": 27,
                "\u30D8": 28,
                "\u30DB": 29,
                "\u30DE": 30,
                "\u30DF": 31,
                "\u30E0": 32,
                "\u30E1": 33,
                "\u30E2": 34,
                "\u30E4": 35,
                "\u30E6": 36,
                "\u30E8": 37,
                "\u30E9": 38,
                "\u30EA": 39,
                "\u30EB": 40,
                "\u30EC": 41,
                "\u30ED": 42,
                "\u30EF": 43,
                "\u30F2": 44,
                "\u30F3": 45
            },
            getIndex: function(value) {
                value = String(value);
                return this.valueMap[value];
            },
            getNextValue: function(currentValue, offset) {
                var index = this.getIndex(currentValue);
                var nextIndex = (index + offset) % this.values.length;
                var ret = this.values[nextIndex];
                return ret;
            },
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },
        I: {
            values: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
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
                'CXXVIII'
            ],
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
            convertRom: function(num) {
                var thousand = Math.floor(num / 1000);
                num = num % 1000;
                var hunred = Math.floor(num / 100);
                num = num % 100;
                var decade = Math.floor(num / 10);
                num = num % 10;
                var ret = "";
                if (thousand > 0) {
                    for (var i = 0; i < thousand; i++) {
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
            convertFromRom: function(rom) {
                var r = 0;
                for (var c = 0; c < rom.length; c++) {
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
            getIndex: function(value) {
                return this.valuesMap[value];
            },
            getNextValue: function(currentValue, offset) {
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
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },
        N: {
            getNextValue: function(currentValue, offset) {
                var ret = "";
                var val = parseInt(currentValue) + offset;
                ret += val;
                return ret;
            },
            getValue: function(index) {
                return index;
            }
        },
        Hindi: {
            getHindiValue: function(currentValue, offset) {
                var ret = currentValue + offset;
                return BidiUtils.convertArabicToHindi(ret + "");
            }
        },
        CNSCTCounting: {//一,..., 十,...,二十,...,一百,一百零一,...,一百一十,...
            values: ['\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u4e03', '\u516b', '\u4e5d', '\u5341',
                     '\u5341\u4e00', '\u5341\u4e8c', '\u5341\u4e09', '\u5341\u56db', '\u5341\u4e94', '\u5341\u516d', '\u5341\u4e03', '\u5341\u516b','\u5341\u4e5d', 
                     '\u4e8c\u5341', '\u4e8c\u5341\u4e00', '\u4e8c\u5341\u4e8c', '\u4e8c\u5341\u4e09', '\u4e8c\u5341\u56db', '\u4e8c\u5341\u4e94', '\u4e8c\u5341\u516d', '\u4e8c\u5341\u4e03', '\u4e8c\u5341\u516b', '\u4e8c\u5341\u4e5d',
                     '\u4e09\u5341'
                 ],
             valuesMap: {
             	'\u4e00' : 0,
             	'\u4e8c' : 1,
             	'\u4e09' : 2,
             	'\u56db' : 3,
             	'\u4e94' : 4, 
             	'\u516d' : 5, 
             	'\u4e03' : 6, 
             	'\u516b' : 7, 
             	'\u4e5d' : 8, 
             	'\u5341' : 9,
                '\u5341\u4e00' : 10,
                '\u5341\u4e8c' : 11,
                '\u5341\u4e09' : 12,
                '\u5341\u56db' : 13,
                '\u5341\u4e94' : 14,
                '\u5341\u516d' : 15,
                '\u5341\u4e03' : 16,
                '\u5341\u516b' : 17,
                '\u5341\u4e5d' : 18, 
                '\u4e8c\u5341' : 19,
                '\u4e8c\u5341\u4e00' : 20,
                '\u4e8c\u5341\u4e8c' : 21,
                '\u4e8c\u5341\u4e09' : 22,
                '\u4e8c\u5341\u56db' : 23,
                '\u4e8c\u5341\u4e94' : 24,
                '\u4e8c\u5341\u516d' : 25,
                '\u4e8c\u5341\u4e03' : 26,
                '\u4e8c\u5341\u516b' : 27,
                '\u4e8c\u5341\u4e5d' : 28,
                '\u4e09\u5341' : 29
             },
             singles: ['\u96f6','\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u4e03', '\u516b', '\u4e5d'],
             un: ['\u5341', '\u767e', '\u5343', '\u4e07'],
             convertCS: function(num) {
             	var ret = num;
             	if(ret >0 && ret <100000){
             		var s1 = (num + ""), s2 = s1.split(""), str = "";
             		var l = s2.length;
             		for(var i=0;i<s2.length;i++){
             			var n = s2[i];
             			str += this.singles[n];
             			if(l > 1)
             				str += this.un[l-2];
             			l--;
             		}
             		ret = str.replace(/\u96f6[\u5341\u767e\u5343\u4e07\u4ebf]*/g, "\u96f6").replace(/\u96f6+/g, "\u96f6").replace(/\u96f6$/, "");
             	}
                 return ret;
             },
             convertFromCS: function(CS) {
             	var ret = 0;
             	var s1 = CS && CS.match(/\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d][\u5341\u767e\u5343\u4e07\u4ebf]*/g);
             	if(s1 && s1.length>0){
                 	for(var i=0;i<s1.length;i++){
                 		var t = s1[i];
                 		var sn = t.substr(0,1);
                 		var n = this.singles.indexOf(sn);
                 		if(t.length > sn.length){
                 			var uIdx = this.un.indexOf(t.substr(1));
                     		if(uIdx < 0)
                     			break;
                     		uIdx++;
                     		for(var j=0;j<uIdx;j++){
                     			n = n * 10;
                     		}
                 		}
                 		ret += n;
                 	}
             	}
                 return ret;
             },
             getIndex: function(value) {
             	var idx = this.valuesMap[value];
                return (isNaN(parseInt(idx))?-1:idx);
             },
             getNextValue: function(currentValue, offset) {
                 var index = this.getIndex(currentValue);
                 var ret;
                 if (index == null || index < 0) {
                     index = this.convertFromCS(currentValue);
                     ret = this.convertCS(index + offset);
                 } else {
                     var idx = index + offset;
                     if (idx < this.values.length) {
                         ret = this.values[idx];
                     } else {
                         ret = this.convertCS(idx + 1);
                     }
                 }
                 return ret;
             },
             getValue: function(index) {
                 return this.getNextValue(this.values[0], index - 1);
             }
         },
         CNSL: {//,..., 拾,...,贰拾,...,壹佰,壹佰零壹,...,壹佰壹拾,...
             values: ['\u58f9', '\u8d30', '\u53c1', '\u8086', '\u4f0d', '\u9646', '\u67d2', '\u67d2', '\u7396', '\u58f9\u62fe',
                      '\u58f9\u62fe\u58f9', '\u58f9\u62fe\u8d30', '\u58f9\u62fe\u53c1', '\u58f9\u62fe\u8086', '\u58f9\u62fe\u4f0d', '\u58f9\u62fe\u9646', '\u58f9\u62fe\u67d2', '\u58f9\u62fe\u67d2','\u58f9\u62fe\u7396', 
                      '\u8d30\u62fe', '\u8d30\u62fe\u58f9', '\u8d30\u62fe\u8d30', '\u8d30\u62fe\u53c1', '\u8d30\u62fe\u8086', '\u8d30\u62fe\u4f0d', '\u8d30\u62fe\u9646', '\u8d30\u62fe\u67d2', '\u8d30\u62fe\u67d2', '\u8d30\u62fe\u7396',
                      '\u53c1\u62fe'
                  ],
              valuesMap: {
              	'\u58f9' : 0,
              	'\u8d30' : 1,
              	'\u53c1' : 2,
              	'\u8086' : 3,
              	'\u4f0d' : 4,
              	'\u9646' : 5, 
              	'\u67d2' : 6, 
              	'\u67d2' : 7, 
              	'\u7396' : 8, 
              	'\u58f9\u62fe' : 9,
                 '\u58f9\u62fe\u58f9' : 10,
                 '\u58f9\u62fe\u8d30' : 11,
                 '\u58f9\u62fe\u53c1' : 12,
                 '\u58f9\u62fe\u8086' : 13,
                 '\u58f9\u62fe\u4f0d' : 14,
                 '\u58f9\u62fe\u9646' : 15,
                 '\u58f9\u62fe\u67d2' : 16,
                 '\u58f9\u62fe\u67d2' : 17,
                 '\u58f9\u62fe\u7396' : 18, 
                 '\u8d30\u62fe' : 19,
                 '\u8d30\u62fe\u58f9' : 20,
                 '\u8d30\u62fe\u8d30' : 21,
                 '\u8d30\u62fe\u53c1' : 22,
                 '\u8d30\u62fe\u8086' : 23,
                 '\u8d30\u62fe\u4f0d' : 24,
                 '\u8d30\u62fe\u9646' : 25,
                 '\u8d30\u62fe\u67d2' : 26,
                 '\u8d30\u62fe\u67d2' : 27,
                 '\u8d30\u62fe\u7396' : 28,
                 '\u53c1\u62fe' : 29
              },
              singles: ['\u96f6','\u58f9', '\u8d30', '\u53c1', '\u8086', '\u4f0d', '\u9646', '\u67d2', '\u67d2', '\u7396'],
              un: ['\u62fe', '\u4f70', '\u4edf', '\u842c'],
              convertCS: function(num) {
              	var ret = num;
              	if(ret >0 && ret <100000){
              		var s1 = (num + ""), s2 = s1.split(""), str = "";
              		var l = s2.length;
              		for(var i=0;i<s2.length;i++){
              			var n = s2[i];
              			str += this.singles[n];
              			if(l > 1)
              				str += this.un[l-2];
              			l--;
              		}
              		str = str.replace(/\u96f6[\u62fe\u4f70\u4edf\u842c\u4ebf]*/g, "\u96f6").replace(/\u96f6+/g, "\u96f6");
              		ret = str.replace(/\u96f6$/, "").replace(/^\u62fe/, "\u58f9\u62fe");
              	}
                  return ret;
              },
              convertFromCS: function(CS) {
              	var ret = 0;
              	var s1 = CS && CS.match(/\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u67d2\u7396][\u62fe\u4f70\u4edf\u842c\u4ebf]*/g);
              	if(s1 && s1.length>0){
                  	for(var i=0;i<s1.length;i++){
                  		var t = s1[i];
                  		var sn = t.substr(0,1);
                  		var n = this.singles.indexOf(sn);
                  		if(t.length > sn.length){
                  			var uIdx = this.un.indexOf(t.substr(1));
                      		if(uIdx < 0)
                      			break;
                      		uIdx++;
                      		for(var j=0;j<uIdx;j++){
                      			n = n * 10;
                      		}
                  		}
                  		ret += n;
                  	}
              	}
                  return ret;
              },
              getIndex: function(value) {
              	var idx = this.valuesMap[value];
                 return (isNaN(parseInt(idx))?-1:idx);
              },
              getNextValue: function(currentValue, offset) {
                  var index = this.getIndex(currentValue);
                  var ret;
                  if (index == null || index < 0) {
                      index = this.convertFromCS(currentValue);
                      ret = this.convertCS(index + offset);
                  } else {
                      var idx = index + offset;
                      if (idx < this.values.length) {
                          ret = this.values[idx];
                      } else {
                          ret = this.convertCS(idx + 1);
                      }
                  }
                  return ret;
              },
              getValue: function(index) {
                  return this.getNextValue(this.values[0], index - 1);
              }
          },         
        CNSCCounting: {//一,..., 十,...,二十,二十一,...,一００,一０一,...,一一０,一一一,...
            values: ['\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u4e03', '\u516b', '\u4e5d', '\u5341',
                     '\u5341\u4e00', '\u5341\u4e8c', '\u5341\u4e09', '\u5341\u56db', '\u5341\u4e94', '\u5341\u516d', '\u5341\u4e03', '\u5341\u516b','\u5341\u4e5d', 
                     '\u4e8c\u5341', '\u4e8c\u5341\u4e00', '\u4e8c\u5341\u4e8c', '\u4e8c\u5341\u4e09', '\u4e8c\u5341\u56db', '\u4e8c\u5341\u4e94', '\u4e8c\u5341\u516d', '\u4e8c\u5341\u4e03', '\u4e8c\u5341\u516b', '\u4e8c\u5341\u4e5d',
                     '\u4e09\u5341'
            ],
            valuesMap: {
             	'\u4e00' : 0,
             	'\u4e8c' : 1,
             	'\u4e09' : 2,
             	'\u56db' : 3,
             	'\u4e94' : 4, 
             	'\u516d' : 5, 
             	'\u4e03' : 6, 
             	'\u516b' : 7, 
             	'\u4e5d' : 8, 
             	'\u5341' : 9,
                '\u5341\u4e00' : 10,
                '\u5341\u4e8c' : 11,
                '\u5341\u4e09' : 12,
                '\u5341\u56db' : 13,
                '\u5341\u4e94' : 14,
                '\u5341\u516d' : 15,
                '\u5341\u4e03' : 16,
                '\u5341\u516b' : 17,
                '\u5341\u4e5d' : 18, 
                '\u4e8c\u5341' : 19,
                '\u4e8c\u5341\u4e00' : 20,
                '\u4e8c\u5341\u4e8c' : 21,
                '\u4e8c\u5341\u4e09' : 22,
                '\u4e8c\u5341\u56db' : 23,
                '\u4e8c\u5341\u4e94' : 24,
                '\u4e8c\u5341\u516d' : 25,
                '\u4e8c\u5341\u4e03' : 26,
                '\u4e8c\u5341\u516b' : 27,
                '\u4e8c\u5341\u4e5d' : 28,
                '\u4e09\u5341' : 29
            },
            singles: ['\u25cb','\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u4e03', '\u516b', '\u4e5d'],
            un: ['\u5341'],
            convertCS: function(num) {
            	var ret = num;
            	if(ret >0 && ret <100000){
            		var s1 = (num + ""), s2 = s1.split(""), str = "";
            		for(var i=0;i<s2.length;i++){
            			var n = s2[i];
            			str += this.singles[n];
            			if(i == 0 && s2.length == 2){
            				str += this.un[0];
            				if(s2[1] == "0")
            					break;
            			}
            		}
            		ret = str;
            	}
                return ret;
            },
            convertFromCS: function(CS) {
            	var ret = 0;
            	if(CS){
            		CS = CS.replace(/\u5341$/, "\u25cb").replace(/\u5341/g, "\u25cb");
            		var s1 = CS.split("");
            		var l = s1.length;
                	for(var i=0;i<s1.length;i++){
                		var t = s1[i];
                		var n = this.singles.indexOf(t);
                   		for(var j=l;j<0;j--){
                    		n = n * 10;
                   		}
                   		l--;
                		ret += n;
                	}
            	}
                return ret;
            },
            getIndex: function(value) {
            	var idx = this.valuesMap[value];
                return (isNaN(parseInt(idx))?-1:idx);
            },
            getNextValue: function(currentValue, offset) {
                var index = this.getIndex(currentValue);
                var ret;
                if (index == null || index < 0) {
                    index = this.convertFromCS(currentValue);
                    ret = this.convertCS(index + offset);
                } else {
                    var idx = index + offset;
                    if (idx < this.values.length) {
                        ret = this.values[idx];
                    } else {
                        ret = this.convertCS(idx + 1);
                    }
                }
                return ret;
            },
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },
        CNHeavenStem : {//十天干：甲乙丙丁戊己庚辛王癸
            values: ['\u7532','\u4e59','\u4e19','\u4e01','\u620a','\u5df1','\u5e9a','\u8f9b','\u738b','\u7678'],
            valuesMap: {
             	'\u7532' : 0,
             	'\u4e59' : 1,
             	'\u4e19' : 2,
             	'\u4e01' : 3,
             	'\u620a' : 4, 
             	'\u5df1' : 5, 
             	'\u5e9a' : 6, 
             	'\u8f9b' : 7, 
             	'\u738b' : 8, 
             	'\u7678' : 9
            },
            getIndex: function(value) {
            	var idx = this.valuesMap[value];
                return (isNaN(parseInt(idx))?-1:idx);
            },
            getNextValue: function(currentValue, offset) {
                var index = this.getIndex(currentValue);
                var ret;
                if(index == null || index < 0){
                	ret = offset; 
                } else {
                    var idx = index + offset;
                    if (idx < this.values.length)
                        ret = this.values[idx];
                    else
                        ret = idx;
                }
                return ret;
            },
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        },
        CNZodiac : {//十二地支：子丑寅卯辰巳午未申酉戌亥
            values: ['\u5b50','\u4e11','\u5bc5','\u536f','\u8fb0','\u5df3','\u5348','\u672a',
                     '\u7533','\u9149','\u620c','\u4ea5'],
            valuesMap: {
             	'\u5b50' : 0,
             	'\u4e11' : 1,
             	'\u5bc5' : 2,
             	'\u536f' : 3,
             	'\u8fb0' : 4, 
             	'\u5df3' : 5, 
             	'\u5348' : 6, 
             	'\u672a' : 7, 
             	'\u7533' : 8, 
             	'\u9149' : 9,
             	'\u620c' : 10,
             	'\u4ea5' : 11
            },
            getIndex: function(value) {
            	var idx = this.valuesMap[value];
                return (isNaN(parseInt(idx))?-1:idx);
            },
            getNextValue: function(currentValue, offset) {
                var index = this.getIndex(currentValue);
                var ret;
                if(index == null || index < 0){
                	ret = offset; 
                } else {
                    var idx = index + offset;
                    if (idx < this.values.length)
                        ret = this.values[idx];
                    else
                        ret = idx;
                }
                return ret;
            },
            getValue: function(index) {
                return this.getNextValue(this.values[0], index - 1);
            }
        }        
    };

    return listPrototype;
});