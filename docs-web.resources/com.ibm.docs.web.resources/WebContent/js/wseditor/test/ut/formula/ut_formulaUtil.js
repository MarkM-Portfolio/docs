dojo.provide("websheet.tests.ut.formula.ut_formulaUtil");

/**
 * UT suite, function for parsedRef and other utilities
 */

describe("websheet.test.ut.formula.ut_formulaUtil", function() {
	websheet.Constant.init();
	
	it("parseRef Sheet1!A1:B2", function(){
		var parsedRef = websheet.Helper.parseRef("Sheet1!A1:B2");
		
		expect(parsedRef.startRow).toBe(1);
		expect(parsedRef.endRow).toBe(2);
		expect(parsedRef.startCol).toBe(1);
		expect(parsedRef.endCol).toBe(2);
		expect(parsedRef.refMask).toBe(websheet.Constant.RANGE_MASK);
		var address = parsedRef.toString();
		expect(address).toBe("Sheet1!A1:B2");
	});
	//TODO: MS address "Sheet1!A1:Sheet1!B2", "Sheet1!A#REF!" are invalid
	it("parseRef invalid address", function() {
		var addresses = ["Sheet1!A1:Sheet2.B2", "Sheet1", "ZAEF1", "A1048888", "$A", "$1", "AD:ZZZ", "0:4"];
		for (var i = 0; i < addresses.length; i++){
			var parsedRef = websheet.Helper.parseRef(addresses[i]);
			expect(parsedRef).toBe(null);
		}

	});
	
	it("parseRef serveral addresses", function(){
		var addresses = ["Sheet0!a1", "'Sheet 1'!$A2:B$1", "'1A'!c:$B", "$1:$2", "_A!#REF!", "#REF!A1:$B$2", "#REF!#REF!", "'A''`1'!AMJ10000"];
	    var sheets = ["Sheet0", "Sheet 1", "1A", undefined, "_A", "#REF!", "#REF!", "A'`1"];
	    var startRows = [1, 1, 1, 1, -1, 1, -1, 10000];
	    var startCols = [1, 1, 2,1,-1, 1, -1, 1024];
	    var endRows = [1, 2, 1048576, 2, -1, 2, -1, 10000];
	    var endCols = [1, 2, 3, 1024, -1, 2, -1, 1024];
	    var RefAddressType = websheet.Constant.RefAddressType;
	    var RangeType = websheet.Constant.RangeType;
	    var refMasks = [(websheet.Constant.CELL_MASK),
	                    (websheet.Constant.RANGE_MASK | RefAddressType.ABS_COLUMN | RefAddressType.ABS_ROW),
	                    (websheet.Constant.COLS_MASK | RefAddressType.ABS_COLUMN ),
	                    (RefAddressType.ROW | RefAddressType.END_ROW | RefAddressType.ABS_ROW | RefAddressType.ABS_END_ROW),
	                    (RefAddressType.SHEET | RefAddressType.COLUMN),
	                    (websheet.Constant.RANGE_MASK | RefAddressType.INVALID_SHEET | RefAddressType.ABS_END_COLUMN | RefAddressType.ABS_END_ROW),
	                    (RefAddressType.SHEET | RefAddressType.INVALID_SHEET | RefAddressType.COLUMN),
	                    websheet.Constant.CELL_MASK];
	    var updateAddresses = ["Sheet0!A1", "'Sheet 1'!$A$1:B2", "'1A'!$B:C", "$1:$2", "_A!#REF!", "#REF!A1:$B$2", "#REF!#REF!", "'A''`1'!AMJ10000"];
	    var updateodsAddresses = ["Sheet0.A1", "'Sheet 1'.$A$1:B2", "'1A'.$B:C", "$1:$2", "_A.#REF!", "#REF!.A1:$B$2", "#REF!.#REF!", "'A''`1'.AMJ10000"];
	    var valids = [true, true, true, true, false, false, false, true];
	    var types = [RangeType.CELL, RangeType.RANGE, RangeType.COLUMN,RangeType.ROW, RangeType.INVALID, RangeType.RANGE, RangeType.INVALID, RangeType.CELL];
	    //ods to ms
	    for (var i = 0; i < addresses.length; i++) {
	    	var address = addresses[i];
	    	var parsedRef = websheet.Helper.parseRef(address);
	    	expect(parsedRef.sheetName).toBe(sheets[i]);
	    	expect(parsedRef.startRow).toBe(startRows[i]);
	    	expect(parsedRef.endRow).toBe(endRows[i]);
	    	expect(parsedRef.startCol).toBe(startCols[i]);
	    	expect(parsedRef.endCol).toBe(endCols[i]);
	    	expect(parsedRef.refMask).toBe(refMasks[i]);
	    	var updateAddress = parsedRef.getAddress();
	    	expect(updateAddress).toBe(updateAddresses[i]);
	    	expect(parsedRef.isValid()).toBe(valids[i]);
	    	expect(parsedRef.getType()).toBe(types[i]);
	    }
	    //ms to ods
	    for (var i = 0; i < updateAddresses.length; i++) {
	    	var address = updateAddresses[i];
	    	var parsedRef = websheet.Helper.parseRef(address);
	    	expect(parsedRef.sheetName).toBe(sheets[i]);
	    	expect(parsedRef.startRow).toBe(startRows[i]);
	    	expect(parsedRef.endRow).toBe(endRows[i]);
	    	expect(parsedRef.startCol).toBe(startCols[i]);
	    	expect(parsedRef.endCol).toBe(endCols[i]);
	    	expect(parsedRef.refMask).toBe(refMasks[i]);
	    	var updateAddress = parsedRef.getAddress();
	    	expect(updateAddress).toBe(updateAddresses[i]);
	    	expect(parsedRef.isValid()).toBe(valids[i]);
	    	expect(parsedRef.getType()).toBe(types[i]);
	    }
	});
	
	it("parseRef #REF!A1:B2", function(){
		var parsedRef = websheet.Helper.parseRef("#REF!A1:B2");
		
		expect(parsedRef.isValid()).toBe(false);
		var address = parsedRef.toString();
		expect(address).toBe("#REF!A1:B2");
		
		parsedRef.setSheetName("a 1");
		address = parsedRef.getAddress();
		expect(address).toBe("'a 1'!A1:B2");
	});
	//TODO: format/parse sheet name
});