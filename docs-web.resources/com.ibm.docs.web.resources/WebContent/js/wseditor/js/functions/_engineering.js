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

dojo.provide("websheet.functions._engineering");

dojo.declare("websheet.functions._engineering", websheet.functions.FormulaBase, {
	// changeable
	fromEnc: null,
	toEnc: null,
	bSigned: false,
	MAX_NUMBER: 0, // The most significant bit of number is the sign bit

	MAX_PLACES: 10,
	BIN: 2,
	OCT: 8,
	DEC: 10,
	HEX: 16,
	MAX_BIN_NUMBER: 512, // 1 << 9; // 1000000000 (bin)
	MAX_OCT_NUMBER: 536870912, // 1 << 29; // 4000000000 (oct)
	MAX_HEX_NUMBER: 549755813888, // 1 << 39; // 8000000000 (hex)
	HEXMAP: {"A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15},
	HEXARRAY: ["A", "B", "C", "D", "E", "F"],
	
	constructor: function() {
		this.maxNumOfArgs = 2;
	},
	
	/*int*/calc: function() {
		this.bSigned = false; // reset it

		var value = this.args[0];
		var type = value.getType();
		var value = this.fetchScalaResult(value);
		if (this.isDecimalNum()) {
			value = this.getValue(value, type, this.LOCALE_NUM);
			// invalid it is scientific expression like "1e30"
			if (websheet.Helper.isSciNum(value))
				throw websheet.Constant.ERRORCODE["504"];
			
			value = parseInt(value);
		}
		
		var places = this.args[1];
		if (places && places.getType() == this.tokenType.NONE_TOKEN)
			places = undefined;
		// no places argument for XXX2DEC formulas
		if (this.toEnc !== this.DEC && places !== undefined) {
			type = places.getType();
			places = this.fetchScalaResult(places);
			places = parseInt(this.getValue(places, type, this.LOCALE_NUM));
			// invalid places argument
			if (places < 1 || places > this.MAX_PLACES)
				throw websheet.Constant.ERRORCODE["504"];
		}
		
		/* check validity of the given value */
		if (!this.isValidValue(value))
			throw websheet.Constant.ERRORCODE["504"];
		
		return this.encode(value, places);
	},
	
	// check whether the from encoding is decimal
	/*boolean*/isDecimalNum: function() {
		return this.fromEnc == this.DEC;
	},
	
	// given the from encoding, check whether 'value' is one valid number in 'fromEnc'
	/*boolean*/isValidValue: function(value) {
		value = value + "";
		var length = value.length;
		for (var i = 0; i <= length - 1; ++i) {
			var ch = value[i];
			if (!this.isValid(ch))
				return false;
		}
		
		return true;
	},
	
	/*
	 * If the from encoding isn't decimal, convert to one decimal number first, then convert from the decimal number to
	 * the target encoding.
	 */
	/*number or string*/encode: function(value, places) {
		if (this.isDecimalNum()) {
			if (value < 0) 
				this.bSigned = true;
		} else
			value = this.encodeToDEC(value); // convert to decimal encoding first

		// if it is one negative decimal number, add it by max number according to 'toEnc',
		// so its most significant bit can be correctly set when convert from decimal number to the target encoding
		if (this.bSigned) {
			value += this.MAX_NUMBER;
			// if target coding isn't decimal and the value is one negative number, impossible to encode it with target encoding, so it is invalid number
			if (this.MAX_NUMBER != 0 && value < 0)
				throw websheet.Constant.ERRORCODE["504"];
		}
		
		// convert the decimal number to the target encoding
		if (this.toEnc != this.DEC)
			value = this.encodeFromDec(value, places);
		
		return value;
	},
	
	// convert the value in 'fromEnc' to the decimal number. if its most significant bit is set, it is one negative number.
	// set this.bSigned as true, ignore it when convert, finally subtract it by the maximum number according to the 'fromEnc' encoding.
	/*number*/encodeToDEC: function(value) {
		var count = 0;
		
		value = value + "";
		var length = value.length;
		// invalid argument if the number has more than 10 characters
		if (length > this.MAX_PLACES)
			throw websheet.Constant.ERRORCODE["504"];
		
		for (var i = 0; i <= length - 1; ++i) {
			var ch = value[i];
			
			if (this.fromEnc == this.HEX) {
				// translate the ASCII to one number
				ch = ch.toUpperCase();
				var hexCH = this.HEXMAP[ch];
				if (hexCH) ch = hexCH;
			}
			
			var item = parseInt(ch);
			// check whether it is the most significant bit for one number that has 10 characters, 
			// if yes, it is one negative number, subtract the most significant bit
			if (i == 0 && length == this.MAX_PLACES) {
				var ret = this.hasMSB(item);
				if (ret.bSigned) {
					this.bSigned = true;
					// the most significant bit is subtracted
					item = ret.item;
				}
			}
			
			if (item != 0) {
				for (var j = 0; j < length - 1 - i;  ++j)
					item *= this.fromEnc;
			}
			
			count += item;
		}
		
		if (this.bSigned) 
			count = this.subByMAXNUM(count);
		
		return count;
	},
	
	// convert from one decimal number to the target encoding, and return one string
	/*string*/encodeFromDec: function(/*decimal number*/value, places) {
		if (value >= this.MAX_NUMBER)
			throw websheet.Constant.ERRORCODE["504"];
		
		var total = [];
		var n = 1;
		// ignore places if the given value is one negative number
		var m = this.bSigned ? this.MAX_PLACES : (places == null ? this.MAX_PLACES : places);
		var lastNum = 0;
		
		// if the value is zero, output one string with one zero at least
		if (value == 0) {
			total.push("0");
			n++;
		}
		
		while (n <= m && value > 0) {
			var num = value % this.toEnc;
			lastNum = num;
			if (this.toEnc == this.HEX) {
				// translate this number to one ASCII character
				if (num >= 10)
					num = this.HEXARRAY[num - 10];
			}
			total.push(num + "");
			value = parseInt(websheet.Math.div(value, this.toEnc));
			n++;
		}

		// exceed the given places, it is one invalid number 
		if (n > m && value > 0)
			throw websheet.Constant.ERRORCODE["504"];
		
		if (!this.bSigned) {
			if (places != null && n <= places) {
				// padding with zeros for positive number
				while (n <= places) {
					total.push("0");
					n++;
				}
			}
		} else {
			// has most significant bit
			var k = n;
			while (k < this.MAX_PLACES) {
				// padding with zeros if any till the 10th character
				total.push("0");
				k++;
			}
			
			if (n > this.MAX_PLACES)
				total.pop();
			else
				lastNum = 0;
				
			lastNum = this.addMSB(lastNum);
			if (this.toEnc == this.HEX) {
				// translate this number to one ASCII character 
				if (lastNum >= 10) 
					lastNum = this.HEXARRAY[lastNum - 10];
			}
			
			total.push(lastNum + "");
		}
		
		var ret = "";
 		for (var i = total.length - 1; i >= 0; --i)
 			ret += total[i];
 		
		return ret;
	}
});
dojo.declare("websheet.functions._hex", null, {
	constructor: function() {
		this.toEnc = this.HEX;
		this.MAX_NUMBER = this.MAX_HEX_NUMBER; 
	},
	
	// add most significant bit
	/*int*/addMSB: function(c) {
		return c + 8; // 1 << 3;
	}
});

dojo.declare("websheet.functions._oct", null, {
	constructor: function() {
		this.toEnc = this.OCT;
		this.MAX_NUMBER = this.MAX_OCT_NUMBER; 
	},
	
	// add most significant bit
	/*int*/addMSB: function(c) {
		return c + 4; // 1 << 2;
	}
});

dojo.declare("websheet.functions._bin", null, {
	constructor: function() {
		this.toEnc = this.BIN;
		this.MAX_NUMBER = this.MAX_BIN_NUMBER;
	},
	
	// add most significant bit
	// c should be always zero here
	/*int*/addMSB: function(c) {
		return c + 1;
	}
});

dojo.declare("websheet.functions._dec", null, {
	constructor: function() {
		this.toEnc = this.DEC;
		this.maxNumOfArgs = 1;
	},
	
	// add most significant bit
	/*int*/addMSB: function(c) {
		return c;
	}
});

dojo.declare("websheet.functions.hex_", null, {
	constructor: function() {
		this.fromEnc = this.HEX;
	},
	
	/*boolean*/isValid: function(/*character*/ch) {		
		return (ch >= "0" && ch <= "9" || ch >= "A" && ch <= "F" || ch >= "a" && ch <= "f");
	},
	
	/*obj*/hasMSB: function(c) {
		return {bSigned: c >> 3, item: c - 8};
	},
	
	/*int*/subByMAXNUM: function(value) {
		return value - this.MAX_HEX_NUMBER;
	}
});

dojo.declare("websheet.functions.oct_", null, {
	constructor: function() {
		this.fromEnc = this.OCT;
	},
	
	/*boolean*/isValid: function(/*character*/ch) {		
		return (ch >= "0" && ch <= "7");
	},
	
	/*obj*/hasMSB: function(c) {
		return {bSigned: c >> 2, item: c - 4};
	},
	
	/*int*/subByMAXNUM: function(value) {
		return value - this.MAX_OCT_NUMBER;
	}
});

dojo.declare("websheet.functions.bin_", null, {
	constructor: function() {
		this.fromEnc = this.BIN;
	},
	
	/*boolean*/isValid: function(/*character*/ch) {		
		return (ch >= "0" && ch <= "1");
	},
	
	/*obj*/hasMSB: function(c) {
		return {bSigned: c, item: c - 1};
	},
	
	/*int*/subByMAXNUM: function(value) {
		return value - this.MAX_BIN_NUMBER;
	}
});

dojo.declare("websheet.functions.dec_", null, {
	constructor: function() {
		this.fromEnc = this.DEC;
	},

	/*boolean*/isValid: function(/*character*/ch) {
		return ((ch >= "0" && ch <= "9") || ch == "-");
	},
	
	/*obj*/hasMSB: function(c) {
		return {bSigned: false, item: c};
	},
	
	/*int*/subByMAXNUM: function(value) {
		return value;
	}
});

dojo.declare("websheet.functions.bin2dec", [websheet.functions._engineering, websheet.functions.bin_, websheet.functions._dec], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.bin2hex", [websheet.functions._engineering, websheet.functions.bin_, websheet.functions._hex], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.bin2oct", [websheet.functions._engineering, websheet.functions.bin_, websheet.functions._oct], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.dec2bin", [websheet.functions._engineering, websheet.functions.dec_, websheet.functions._bin], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.dec2hex", [websheet.functions._engineering, websheet.functions.dec_, websheet.functions._hex], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.dec2oct", [websheet.functions._engineering, websheet.functions.dec_, websheet.functions._oct], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.hex2bin", [websheet.functions._engineering, websheet.functions.hex_, websheet.functions._bin], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.hex2dec", [websheet.functions._engineering, websheet.functions.hex_, websheet.functions._dec], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.hex2oct", [websheet.functions._engineering, websheet.functions.hex_, websheet.functions._oct], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.oct2bin", [websheet.functions._engineering, websheet.functions.oct_, websheet.functions._bin], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.oct2dec", [websheet.functions._engineering, websheet.functions.oct_, websheet.functions._dec], {
	constructor: function() {
	}
});

dojo.declare("websheet.functions.oct2hex", [websheet.functions._engineering, websheet.functions.oct_, websheet.functions._hex], {
	constructor: function() {
	}
});
