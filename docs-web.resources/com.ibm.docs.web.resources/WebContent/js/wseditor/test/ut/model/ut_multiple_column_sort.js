dojo.provide("websheet.tests.ut.model.ut_multiple_column_sort");

describe("websheet.tests.ut.model.ut_multiple_column_sort", function()
{
	var sorter;
	beforeEach(function() {
		 sorter = websheet.sort.Sorter;
		 sorter._sortStringArray =  function(stringItems,bAsc,useICU) {
			 // no need to user server compare on this ut scenario, use local compare
			 if(bAsc)
				 stringItems.sort(this._stringCompare); 
			 else
				 stringItems.sort(this._stringCompare_desc);
			 return stringItems;
		 };
	});
	
	afterEach(function() {
	});
	/**
	 * sort: function(sortCols, sortArgs, directlyReturnData) {}
	 * */
	it("basic case, single column sort, sort numbers, check data result", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: 1}
			            ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}],
				withHeader: false
		};
		var dataResult = sorter.sort(data, args, true);
		expect(dataResult).toBeTruthy();
		expect(dataResult[0].data).toBe(1);
		expect(dataResult[1].data).toBe(2);
		expect(dataResult[2].data).toBe(3);
		expect(dataResult[0].oldIndex).toBe(2);
		expect(dataResult[1].oldIndex).toBe(1);
		expect(dataResult[2].oldIndex).toBe(0);
	});
	
	it("basic case, single column sort, sort numbers, check index result", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: 1}
			            ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}],
				withHeader: false
		};
		var dataResult = sorter.sort(data, args, true);
		expect(dataResult).toBeTruthy();
		var indexResult = sorter._generateSortIndexResult(dataResult);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(2);
		expect(indexResult[1]).toBe(1);
		expect(indexResult[2]).toBe(0);

	});
	
	it("basic case, single column sort, sort numbers, check with header flag", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: 1}
			            ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}],
				withHeader: true
		};
		var dataResult = sorter.sort(data, args, true);
		expect(dataResult).toBeTruthy();
		expect(dataResult[0].data).toBe(1);
		expect(dataResult[1].data).toBe(2);
		var indexResult = sorter._generateSortIndexResult(dataResult);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(0);
		expect(indexResult[1]).toBe(2);
		expect(indexResult[2]).toBe(1);

	});
	
	it("basic case, single column sort, sort numbers, descend", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 1},
			            {index: 1, value: 2},
			            {index: 2, value: 3}
			            ]]
		};
		var args = {
				rules: [{
					isAscend: false,
					sortByIdx: 0
				}],
				withHeader: true
		};
		var dataResult = sorter.sort(data, args, true);
		expect(dataResult).toBeTruthy();
		expect(dataResult[0].data).toBe(3);
		expect(dataResult[1].data).toBe(2);
		var indexResult = sorter._generateSortIndexResult(dataResult);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(0);
		expect(indexResult[1]).toBe(2);
		expect(indexResult[2]).toBe(1);

	});
	
	it("multiple column sort, two columns, number, with header flag false, ascend & ascend", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: 2}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 3}
			            ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: true,
					sortByIdx: 1
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(2);
		expect(indexResult[1]).toBe(1);
		expect(indexResult[2]).toBe(0);

	});
	
	it("multiple column sort, two columns, number, with header flag false, ascend & descend", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: 2}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 3}
			            ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 1
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(1);
		expect(indexResult[1]).toBe(2);
		expect(indexResult[2]).toBe(0);

	});
	
	it("multiple column sort, two columns, number, with header flag false, ascend & descend, with null items", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: null},
			            {index: 3, value: null},
			            {index: 4, value: 2}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 2},
			            {index: 3, value: 3},
			            {index: 4, value: 6}
			            ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 1
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(4);
		expect(indexResult[1]).toBe(1);
		expect(indexResult[2]).toBe(0);
		expect(indexResult[3]).toBe(3);
		expect(indexResult[4]).toBe(2);

	});
	
	it("multiple column sort, more columns, number, with header flag false, ascend & descend & ascend", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: null},
			            {index: 3, value: null},
			            {index: 4, value: null}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 2},
			            {index: 3, value: 3},
			            {index: 4, value: 3}
			            ],
			            [
			             {index: 0, value: 7},
			             {index: 1, value: 6},
			             {index: 2, value: 5},
			             {index: 3, value: 2},
			             {index: 4, value: 1},
			             ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 1
				}, {
					isAscend: true,
					sortByIdx: 2
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(1);
		expect(indexResult[1]).toBe(0);
		expect(indexResult[2]).toBe(4);
		expect(indexResult[3]).toBe(3);
		expect(indexResult[4]).toBe(2);
	});
	
	it("multiple column sort, two columns, number, with header flag false, ascend & descend, skip one column", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: null},
			            {index: 3, value: null},
			            {index: 4, value: null}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 2},
			            {index: 3, value: 3},
			            {index: 4, value: 3}
			            ],
			            [
			             {index: 0, value: 7},
			             {index: 1, value: 6},
			             {index: 2, value: 5},
			             {index: 3, value: 2},
			             {index: 4, value: 1},
			             ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 2
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(1);
		expect(indexResult[1]).toBe(0);
		expect(indexResult[2]).toBe(2);
		expect(indexResult[3]).toBe(3);
		expect(indexResult[4]).toBe(4);
	});
	
	it("multiple column sort, two columns, number, with header flag false, ascend & descend, completely null", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: null},
			            {index: 3, value: null},
			            {index: 4, value: null}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 2},
			            {index: 3, value: 3},
			            {index: 4, value: 3}
			            ],
			            [
			             {index: 0, value: null},
			             {index: 1, value: null},
			             {index: 2, value: null},
			             {index: 3, value: null},
			             {index: 4, value: null},
			             ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 2
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(1);
		expect(indexResult[1]).toBe(0);
		expect(indexResult[2]).toBe(2);
		expect(indexResult[3]).toBe(3);
		expect(indexResult[4]).toBe(4);
	});
	
	it("sigle column sort, sort with locked (hidden) rows", function() {
		var data = {
			lockedRows : [[1,3],[1,3],[1,3]],
			sortRows: [[
			            {index: 0, value: 3},
//			            {index: 1, value: 2},//hidden
			            {index: 2, value: 1},
//			            {index: 3, value: null},//hidden
			            {index: 4, value: 0}
			            ],
			           [
			            {index: 0, value: 5},
//			            {index: 1, value: 4},
			            {index: 2, value: 2},
//			            {index: 3, value: 3},
			            {index: 4, value: 3}
			            ],
			            [
			             {index: 0, value: null},
//			             {index: 1, value: null},
			             {index: 2, value: null},
//			             {index: 3, value: null},
			             {index: 4, value: null},
			             ]]
		};
		
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 2
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(4);
		expect(indexResult[1]).toBe(1);
		expect(indexResult[2]).toBe(2);
		expect(indexResult[3]).toBe(3);
		expect(indexResult[4]).toBe(0);
	});
	
	it("multiple column sort, sort with locked (hidden) rows", function() {
		var data = {
			lockedRows : [[1,3],[1,3],[1,3]],
			sortRows: [[
			            {index: 0, value: 3},
//			            {index: 1, value: 2},//hidden
			            {index: 2, value: 1},
//			            {index: 3, value: null},//hidden
			            {index: 4, value: 0},
			            {index: 5, value: 1},
			            {index: 6, value: 1}
			            ],
			           [
			            {index: 0, value: 5},
//			            {index: 1, value: 4},
			            {index: 2, value: 2},
//			            {index: 3, value: 3},
			            {index: 4, value: 3},
			            {index: 5, value: 5},
			            {index: 6, value: 7}
			            ],
			            [
			             {index: 0, value: null},
//			             {index: 1, value: null},
			             {index: 2, value: null},
//			             {index: 3, value: null},
			             {index: 4, value: 3},
			             {index: 5, value: 2},
				         {index: 6, value: 1}
			             ]]
		};
		
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 1
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(4);
		expect(indexResult[1]).toBe(1);//hidden
		expect(indexResult[2]).toBe(6);
		expect(indexResult[3]).toBe(3);//hidden
		expect(indexResult[4]).toBe(5);
		expect(indexResult[5]).toBe(2);
		expect(indexResult[6]).toBe(0);
	});
	
	it("multiple column sort, two columns, number, with header flag false, ascend & descend, multiple sort group in single column", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 1},
			            {index: 1, value: 1},
			            {index: 2, value: 1},
			            {index: 3, value: 2},
			            {index: 4, value: 2},
			            {index: 5, value: 2}
			            ],
			           [
			            {index: 0, value: 6},
			            {index: 1, value: 5},
			            {index: 2, value: 4},
			            {index: 3, value: 3},
			            {index: 4, value: 2},
			            {index: 5, value: 1}
			            ],
			            [
			             {index: 0, value: null},
			             {index: 1, value: null},
			             {index: 2, value: null},
			             {index: 3, value: null},
			             {index: 4, value: null},
			             {index: 5, value: null},
			             ]]
		};
		var args = {
				rules: [{
					isAscend: false,
					sortByIdx: 0
				}, {
					isAscend: true,
					sortByIdx: 1
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(5);
		expect(indexResult[1]).toBe(4);
		expect(indexResult[2]).toBe(3);
		expect(indexResult[3]).toBe(2);
		expect(indexResult[4]).toBe(1);
		expect(indexResult[5]).toBe(0);
	});
	
	it("Additional sort should not interupt previous sort result, data reslt should be locked between different value groups after each sort.", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 1},
			            {index: 1, value: 1},
			            {index: 2, value: 2},
			            {index: 3, value: 2},
			            {index: 4, value: 3}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 5},
			            {index: 3, value: 6},
			            {index: 4, value: 2}
			            ],
			            [
			             {index: 0, value: 1},
			             {index: 1, value: null},
			             {index: 2, value: 3},
			             {index: 3, value: null},
			             {index: 4, value: null},
			             ]]
		};
		var args = {
				rules: [{
					isAscend: true,
					sortByIdx: 0
				}, {
					isAscend: true,
					sortByIdx: 1
				}, {
					isAscend: false,
					sortByIdx: 2
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBeTruthy();
		expect(indexResult[0]).toBe(1);
		expect(indexResult[1]).toBe(0);
		expect(indexResult[2]).toBe(2);
		expect(indexResult[3]).toBe(3);
		expect(indexResult[4]).toBe(4);

	});
	
	it("sort test, no change", function() {
		var data = {
			lockedRows : [[]],
			sortRows: [[
			            {index: 0, value: 3},
			            {index: 1, value: 2},
			            {index: 2, value: null},
			            {index: 3, value: null},
			            {index: 4, value: null}
			            ],
			           [
			            {index: 0, value: 5},
			            {index: 1, value: 4},
			            {index: 2, value: 2},
			            {index: 3, value: 3},
			            {index: 4, value: 3}
			            ],
			            [
			             {index: 0, value: null},
			             {index: 1, value: null},
			             {index: 2, value: null},
			             {index: 3, value: null},
			             {index: 4, value: null},
			             ]]
		};
		var args = {
				rules: [{
					isAscend: false,
					sortByIdx: 0
				}, {
					isAscend: false,
					sortByIdx: 2
				}],
				withHeader: false
		};
		var indexResult = sorter.sort(data, args, false);
		expect(indexResult).toBe(null);

	});
});