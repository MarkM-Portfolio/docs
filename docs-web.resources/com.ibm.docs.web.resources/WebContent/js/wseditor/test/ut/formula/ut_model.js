dojo.provide("websheet.tests.ut.formula.ut_model");
/**
 * UT suite, function for areaManager to store,remove area, every event notification
 */

describe("websheet.test.ut.formula.ut_model", function() {
	it("array splice", function(){
		//compat
		var array = [];
		for(var i = 0; i < 10000; i++){
			var a1 = [];
			array.push(a1);
			for(var j = 0; j < 52; j++){
				a1.push(j);
			}
		}
		var start = new Date();
		for(var i = 0; i < 10000; i++){
			var a1 = array[i];
			a1.splice(3, 4);//delete 4 element from 3
		}
		var end = new Date();
		console.log("last " + (end - start) + "ms");
	});
});