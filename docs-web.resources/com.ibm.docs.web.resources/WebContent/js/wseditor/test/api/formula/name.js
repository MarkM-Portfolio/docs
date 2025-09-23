sample();

var snRef = "references", snFormula = 'formulas',
nameRng = 'range',
nameRow = 'row',
nameCol = 'col';

describe("websheet.test.api.formula.calculation.namedrange", function() {
	// define snapshots
	var values_in_reference = function() {
		for (i=4; i<15; i++) {
			expect.ui()
			.rowAtIndex(i).cellAtIndex(3).value(i-20);
		}

		for (i=14; i<17; i++) {
			expect.ui()
			.rowAtIndex(i).cellAtIndex(2).value(i*2);
		}

		for (i=3; i<21; i++) {
			expect.ui()
			.rowAtIndex(i).cellAtIndex(5).value(i*5);
		}

		for (j=6; j<11; j++) {
			expect.ui()
			.rowAtIndex(15).cellAtIndex(j).value(j-5)
			.rowAtIndex(16).cellAtIndex(j).value((j-5)*7);
		}

		expect.ui()
		.rowAtIndex(1).cellAtIndex(8).value(599)
		.rowAtIndex(2).cellAtIndex(8).value(13)
		.rowAtIndex(3).cellAtIndex(8).value(599)
		.rowAtIndex(4).cellAtIndex(8).value(13)
		.rowAtIndex(5).cellAtIndex(8).value(17)
		.rowAtIndex(6).cellAtIndex(8).value(972)
		.rowAtIndex(1).cellAtIndex(9).value(4)
		.rowAtIndex(2).cellAtIndex(9).value(14)
		.rowAtIndex(3).cellAtIndex(9).value(1)
		.rowAtIndex(4).cellAtIndex(9).value(3)
		.rowAtIndex(5).cellAtIndex(9).value(1)
		.rowAtIndex(6).cellAtIndex(9).value(5)
		.rowAtIndex(1).cellAtIndex(10).value(11)
		.rowAtIndex(2).cellAtIndex(10).value(3)
		.rowAtIndex(3).cellAtIndex(10).value(1048576)
		.rowAtIndex(4).cellAtIndex(10).value(3)
		.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
		.rowAtIndex(6).cellAtIndex(10).value(1);
	};

	var	models_in_reference = function() {
		expect.model()
		.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~E:E!' + nameRow + '))')
		.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((14:16~' + nameCol + ')!C4:E14)')
		.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
		.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
		.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
		.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
		.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
		.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
		.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
		.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
		.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
		.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
		.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
		.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
		.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
		.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
		.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
		.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
	};

	var values_in_formula = function() {
		expect.ui()
		.rowAtIndex(1).cellAtIndex(8).value(599)
		.rowAtIndex(2).cellAtIndex(8).value(13)
		.rowAtIndex(3).cellAtIndex(8).value(599)
		.rowAtIndex(4).cellAtIndex(8).value(13)
		.rowAtIndex(5).cellAtIndex(8).value(17)
		.rowAtIndex(6).cellAtIndex(8).value(972)
		.rowAtIndex(1).cellAtIndex(9).value(4)
		.rowAtIndex(2).cellAtIndex(9).value(14)
		.rowAtIndex(3).cellAtIndex(9).value(1)
		.rowAtIndex(4).cellAtIndex(9).value(3)
		.rowAtIndex(5).cellAtIndex(9).value(1)
		.rowAtIndex(6).cellAtIndex(9).value(5)
		.rowAtIndex(1).cellAtIndex(10).value(11)
		.rowAtIndex(2).cellAtIndex(10).value(3)
		.rowAtIndex(3).cellAtIndex(10).value(1048576)
		.rowAtIndex(4).cellAtIndex(10).value(3)
		.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
		.rowAtIndex(6).cellAtIndex(10).value(1);
	};

	var models_in_formula = function() {
		expect.model()
		.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + snRef + '.E:E!' + nameRow + '))')
		.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((' + snRef + '.14:16~' + nameCol + ')!' + snRef + '.C4:E14)')
		.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
		.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
		.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
		.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
		.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
		.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
		.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
		.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
		.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
		.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
		.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
		.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
		.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
		.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
		.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
		.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
	};
	// end of snapshots definition

	// testcases
	it.asyncly("calculate correctly when generated", function() {
		console.log("calculate when formula is generated");

		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUE: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) { 
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUE: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when the reference change", function() {
		console.log("recalculate when the reference change");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
		})
		.step(function() {
			console.log("EDIT in " + helpers.nameOfCurrentSheet());
			actions.focus(snRef + '!E14')
			.editCell(-111);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(14).cellAtIndex(5).value(-111)
			.rowAtIndex(1).cellAtIndex(8).value(237)
			.rowAtIndex(2).cellAtIndex(8).value(13)
			.rowAtIndex(3).cellAtIndex(8).value(237)
			.rowAtIndex(4).cellAtIndex(8).value(13)
			.rowAtIndex(5).cellAtIndex(8).value(18)
			.rowAtIndex(6).cellAtIndex(8).value(610)
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(14)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(5)
			.rowAtIndex(1).cellAtIndex(10).value(11)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(237)
			.rowAtIndex(2).cellAtIndex(8).value(13)
			.rowAtIndex(3).cellAtIndex(8).value(237)
			.rowAtIndex(4).cellAtIndex(8).value(13)
			.rowAtIndex(5).cellAtIndex(8).value(18)
			.rowAtIndex(6).cellAtIndex(8).value(610)
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(14)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(5)
			.rowAtIndex(1).cellAtIndex(10).value(11)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid changing reference values", function() {
		console.log("recalculate after undid changing reference values");
		return actBy()
		.step(function() {
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when rows were inserted above reference", function() {
		console.log("recalculate when insert rows above reference");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
			console.log("EDIT in " + helpers.nameOfCurrentSheet());
		})
		.step(function() {
			actions.focus(snRef + '!A1')
			.insertRowsAbove();
		}).step(function(d) {
			console.log("CHECK MODELS: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(2).valueCellAtIndex(8).value('=SUM((' + nameRng + '~E:E!' + nameRow + '))')
			.rowAtIndex(3).valueCellAtIndex(8).value('=COUNTA((15:17~' + nameCol + ')!C5:E15)')
			.rowAtIndex(4).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(6).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(7).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(7).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(7).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			for (i=5; i<16; i++) {
				expect.ui()
				.rowAtIndex(i).cellAtIndex(3).value(i-21);
			}

			for (i=15; i<18; i++) {
				expect.ui()
				.rowAtIndex(i).cellAtIndex(2).value(i*2);
			}

			for (i=4; i<22; i++) {
				expect.ui()
				.rowAtIndex(i).cellAtIndex(5).value(i*5);
			}

			for (j=6; j<11; j++) {
				expect.ui()
				.rowAtIndex(16).cellAtIndex(j).value(j-5)
				.rowAtIndex(17).cellAtIndex(j).value((j-5)*7);
			}

			expect.ui()
			.rowAtIndex(2).cellAtIndex(8).value(669)
			.rowAtIndex(3).cellAtIndex(8).value(13)
			.rowAtIndex(4).cellAtIndex(8).value(669)
			.rowAtIndex(5).cellAtIndex(8).value(13)
			.rowAtIndex(6).cellAtIndex(8).value(16)
			.rowAtIndex(7).cellAtIndex(8).value(1048)
			.rowAtIndex(2).cellAtIndex(9).value(5)
			.rowAtIndex(3).cellAtIndex(9).value(15)
			.rowAtIndex(4).cellAtIndex(9).value(1)
			.rowAtIndex(5).cellAtIndex(9).value(3)
			.rowAtIndex(6).cellAtIndex(9).value(1)
			.rowAtIndex(7).cellAtIndex(9).value(5)
			.rowAtIndex(2).cellAtIndex(10).value(11)
			.rowAtIndex(3).cellAtIndex(10).value(3)
			.rowAtIndex(4).cellAtIndex(10).value(1048576)
			.rowAtIndex(5).cellAtIndex(10).value(3)
			.rowAtIndex(6).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(7).cellAtIndex(10).value(1);
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + snRef + '.E:E!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((' + snRef + '.15:17~' + nameCol + ')!' + snRef + '.C5:E15)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(669)
			.rowAtIndex(2).cellAtIndex(8).value(13)
			.rowAtIndex(3).cellAtIndex(8).value(669)
			.rowAtIndex(4).cellAtIndex(8).value(13)
			.rowAtIndex(5).cellAtIndex(8).value(16)
			.rowAtIndex(6).cellAtIndex(8).value(1048)
			.rowAtIndex(1).cellAtIndex(9).value(5)
			.rowAtIndex(2).cellAtIndex(9).value(15)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(5)
			.rowAtIndex(1).cellAtIndex(10).value(11)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting rows above reference", function() {
		console.log("recalculate after undid inserting rows above reference");
		return actBy()
		.step(function() {
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when rows with values were inserted in reference", function(){
		console.log("recalculate when rows with values were inserted in reference");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
		})
		.step(function() {
			console.log("EDIT in: " + helpers.nameOfCurrentSheet());
			actions.focus(snRef + '!A14')
			.insertRowsAbove()
			.focus(snRef + '!C14')
			.editCell(10)
			.focus(snRef + '!D14')
			.editCell(10)
			.focus(snRef + '!E14')
			.editCell(10);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~E:E!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((15:17~' + nameCol + ')!C4:E15)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(649)
			.rowAtIndex(2).cellAtIndex(8).value(14)
			.rowAtIndex(3).cellAtIndex(8).value(649)
			.rowAtIndex(4).cellAtIndex(8).value(14)
			.rowAtIndex(5).cellAtIndex(8).value(20)
			.rowAtIndex(6).cellAtIndex(8).value(1008)
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(15)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(5)
			.rowAtIndex(1).cellAtIndex(10).value(12)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + snRef + '.E:E!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((' + snRef + '.15:17~' + nameCol + ')!' + snRef + '.C4:E15)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(649)
			.rowAtIndex(2).cellAtIndex(8).value(14)
			.rowAtIndex(3).cellAtIndex(8).value(649)
			.rowAtIndex(4).cellAtIndex(8).value(14)
			.rowAtIndex(5).cellAtIndex(8).value(20)
			.rowAtIndex(6).cellAtIndex(8).value(1008)
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(15)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(5)
			.rowAtIndex(1).cellAtIndex(10).value(12)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting rows with data", function() {
		console.log("recalculate after undid inserting rows with data in the reference");
		return actBy()
		.step(function() { // undo inputing data
			actions.undo()
			.undo()
			.undo();
		}).step(function() { // undo inserting row
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when columns were inserted before reference", function() {
		console.log("recalculate when columns were inserted before reference");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
			console.log("EDIT in: " + helpers.nameOfCurrentSheet());
		})
		.step(function() {
			actions.focus(snRef + '!A1')
			.insertColumnsBefore();
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(9).value('=SUM((' + nameRng + '~F:F!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(9).value('=COUNTA((14:16~' + nameCol + ')!D4:F14)')
			.rowAtIndex(3).valueCellAtIndex(9).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(9).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(11).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(11).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(11).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(11).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(11).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(11).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			for (i=4; i<15; i++) {
				expect.ui()
				.rowAtIndex(i).cellAtIndex(4).value(i-20);
			}

			for (i=14; i<17; i++) {
				expect.ui()
				.rowAtIndex(i).cellAtIndex(3).value(i*3);
			}

			for (i=3; i<21; i++) {
				expect.ui()
				.rowAtIndex(i).cellAtIndex(6).value(i*5);
			}

			for (j=7; j<12; j++) {
				expect.ui()
				.rowAtIndex(15).cellAtIndex(j).value(j-6)
				.rowAtIndex(16).cellAtIndex(j).value((j-6)*7);
			}

			expect.ui()
			.rowAtIndex(1).cellAtIndex(9).value(599)
			.rowAtIndex(2).cellAtIndex(9).value(13)
			.rowAtIndex(3).cellAtIndex(9).value(599)
			.rowAtIndex(4).cellAtIndex(9).value(13)
			.rowAtIndex(5).cellAtIndex(9).value(17)
			.rowAtIndex(6).cellAtIndex(9).value(1017)
			.rowAtIndex(1).cellAtIndex(10).value(4)
			.rowAtIndex(2).cellAtIndex(10).value(14)
			.rowAtIndex(3).cellAtIndex(10).value(1)
			.rowAtIndex(4).cellAtIndex(10).value(4)
			.rowAtIndex(5).cellAtIndex(10).value(1)
			.rowAtIndex(6).cellAtIndex(10).value(6)
			.rowAtIndex(1).cellAtIndex(11).value(11)
			.rowAtIndex(2).cellAtIndex(11).value(3)
			.rowAtIndex(3).cellAtIndex(11).value(1048576)
			.rowAtIndex(4).cellAtIndex(11).value(3)
			.rowAtIndex(5).cellAtIndex(11).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(11).value(1);
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODELS: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + snRef + '.F:F!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((' + snRef + '.14:16~' + nameCol + ')!' + snRef + '.D4:F14)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(599)
			.rowAtIndex(2).cellAtIndex(8).value(13)
			.rowAtIndex(3).cellAtIndex(8).value(599)
			.rowAtIndex(4).cellAtIndex(8).value(13)
			.rowAtIndex(5).cellAtIndex(8).value(17)
			.rowAtIndex(6).cellAtIndex(8).value(1017)
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(14)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(4)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(6)
			.rowAtIndex(1).cellAtIndex(10).value(11)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting columns before reference", function() {
		console.log("recalculate after undid inserting columns before reference");
		return actBy()
		.step(function() { // undo inserting column
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when columns with values were inserted in reference", function() {
		console.log("recalculate when columns with values were inserted in reference");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
		})
		.step(function() {
			console.log("Eidt in " + helpers.nameOfCurrentSheet());
			actions.focus(snRef + '!E1')
			.insertColumnsBefore()
			.focus(snRef + '!E13')
			.editCell(33)
			.focus(snRef + '!E14')
			.editCell(99);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(9).value('=SUM((' + nameRng + '~F:F!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(9).value('=COUNTA((14:16~' + nameCol + ')!C4:F14)')
			.rowAtIndex(3).valueCellAtIndex(9).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(9).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(11).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(11).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(11).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(11).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(11).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(11).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(9).value(731)
			.rowAtIndex(2).cellAtIndex(9).value(14)
			.rowAtIndex(3).cellAtIndex(9).value(731)
			.rowAtIndex(4).cellAtIndex(9).value(14)
			.rowAtIndex(5).cellAtIndex(9).value(18)
			.rowAtIndex(6).cellAtIndex(9).value(1071)
			.rowAtIndex(1).cellAtIndex(10).value(4)
			.rowAtIndex(2).cellAtIndex(10).value(14)
			.rowAtIndex(3).cellAtIndex(10).value(1)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1)
			.rowAtIndex(6).cellAtIndex(10).value(6)
			.rowAtIndex(1).cellAtIndex(11).value(11)
			.rowAtIndex(2).cellAtIndex(11).value(3)
			.rowAtIndex(3).cellAtIndex(11).value(1048576)
			.rowAtIndex(4).cellAtIndex(11).value(4)
			.rowAtIndex(5).cellAtIndex(11).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(11).value(1);
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODELS: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + snRef + '.F:F!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((' + snRef + '.14:16~' + nameCol + ')!' + snRef + '.C4:F14)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(731)
			.rowAtIndex(2).cellAtIndex(8).value(14)
			.rowAtIndex(3).cellAtIndex(8).value(731)
			.rowAtIndex(4).cellAtIndex(8).value(14)
			.rowAtIndex(5).cellAtIndex(8).value(18)
			.rowAtIndex(6).cellAtIndex(8).value(1071)
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(14)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(6)
			.rowAtIndex(1).cellAtIndex(10).value(11)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(4)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting columns with data", function() {
		console.log("recalculate after undid inserting columns with data");
		return actBy()
		.step(function() { // undo inputing data
			actions.undo()
			.undo();
		}).step(function() { // undo inserting row
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d){
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate when rows in reference were deleted", function() {
		console.log("recalculate after undid deleting rows from reference");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
		}).step(function(){
			console.log("Eidt in " + helpers.nameOfCurrentSheet());
			actions.focus(snRef + '!A8:AZ15')
			.deleteRows();
		}).step(function(d) {
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~E:E!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((8:8~' + nameCol + ')!C4:E7)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(92)
			.rowAtIndex(2).cellAtIndex(8).value(4)
			.rowAtIndex(3).cellAtIndex(8).value(92)
			.rowAtIndex(4).cellAtIndex(8).value(4)
			.rowAtIndex(5).cellAtIndex(8).value(8)
			.rowAtIndex(6).cellAtIndex(8).value('#REF!')
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(8)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(5)
			.rowAtIndex(1).cellAtIndex(10).value(4)
			.rowAtIndex(2).cellAtIndex(10).value(1)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + snRef + '.E:E!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((' + snRef + '.8:8~' + nameCol + ')!' + snRef + '.C4:E7)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(92)
			.rowAtIndex(2).cellAtIndex(8).value(4)
			.rowAtIndex(3).cellAtIndex(8).value(92)
			.rowAtIndex(4).cellAtIndex(8).value(4)
			.rowAtIndex(5).cellAtIndex(8).value(8)
			.rowAtIndex(6).cellAtIndex(8).value('#REF!')
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(8)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(3)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(5)
			.rowAtIndex(1).cellAtIndex(10).value(4)
			.rowAtIndex(2).cellAtIndex(10).value(1)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(3)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate after undid deleting rows from reference", function() {
		console.log("recalculate after undid deleting rows from reference");
		return actBy()
		.step(function() { // undo deleting rows
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate when columns in reference were deleted", function() {
		console.log("adapt and recalculate when columns in reference were deleted");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
		}).step(function() {
			console.log("Edit in " + helpers.nameOfCurrentSheet());
			actions.focus(snRef + '!B1:D10000')
			.deleteColumns();
		}).step(function(d) {

			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(5).value('=SUM((' + nameRng + '~B:B!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(5).value('=COUNTA((14:16~' + nameCol + ')!B4:B14)')
			.rowAtIndex(3).valueCellAtIndex(5).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(5).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(5).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(5).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(6).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(6).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(6).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(6).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(6).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(6).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(7).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(7).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(7).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(7).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(7).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(7).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(5).value(720)
			.rowAtIndex(2).cellAtIndex(5).value(12)
			.rowAtIndex(3).cellAtIndex(5).value(720)
			.rowAtIndex(4).cellAtIndex(5).value(12)
			.rowAtIndex(5).cellAtIndex(5).value(6)
			.rowAtIndex(6).cellAtIndex(5).value(888)
			.rowAtIndex(1).cellAtIndex(6).value(4)
			.rowAtIndex(2).cellAtIndex(6).value(14)
			.rowAtIndex(3).cellAtIndex(6).value(1)
			.rowAtIndex(4).cellAtIndex(6).value(2)
			.rowAtIndex(5).cellAtIndex(6).value(1)
			.rowAtIndex(6).cellAtIndex(6).value(2)
			.rowAtIndex(1).cellAtIndex(7).value(11)
			.rowAtIndex(2).cellAtIndex(7).value(3)
			.rowAtIndex(3).cellAtIndex(7).value(1048576)
			.rowAtIndex(4).cellAtIndex(7).value(1)
			.rowAtIndex(5).cellAtIndex(7).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(7).value(1);
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + snRef + '.B:B!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((' + snRef + '.14:16~' + nameCol + ')!' + snRef + '.B4:B14)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value(720)
			.rowAtIndex(2).cellAtIndex(8).value(12)
			.rowAtIndex(3).cellAtIndex(8).value(720)
			.rowAtIndex(4).cellAtIndex(8).value(12)
			.rowAtIndex(5).cellAtIndex(8).value(6)
			.rowAtIndex(6).cellAtIndex(8).value(888)
			.rowAtIndex(1).cellAtIndex(9).value(4)
			.rowAtIndex(2).cellAtIndex(9).value(14)
			.rowAtIndex(3).cellAtIndex(9).value(1)
			.rowAtIndex(4).cellAtIndex(9).value(2)
			.rowAtIndex(5).cellAtIndex(9).value(1)
			.rowAtIndex(6).cellAtIndex(9).value(2)
			.rowAtIndex(1).cellAtIndex(10).value(11)
			.rowAtIndex(2).cellAtIndex(10).value(3)
			.rowAtIndex(3).cellAtIndex(10).value(1048576)
			.rowAtIndex(4).cellAtIndex(10).value(1)
			.rowAtIndex(5).cellAtIndex(10).value(1024) // it returns '16384' in MS Excel
			.rowAtIndex(6).cellAtIndex(10).value(1);
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate after undid deleting columns from reference", function() {
		console.log("recalculate after undid deleting columns from reference");
		return actBy()
		.step(function() { // undo deleting columns
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate when deleted referring sheet", function() {
		console.log("adapt and recalculate when deleted referring sheet");
		return actBy()
		.step(function() {
			actions.switchSheet(snRef);
		}).step(function(){
			actions.deleteSheet(snRef);
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			expect.model()
			.rowAtIndex(1).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + '#REF!.E:E!' + nameRow + '))')
			.rowAtIndex(2).valueCellAtIndex(8).value('=COUNTA((#REF!.14:16~' + nameCol + ')!' + '#REF!.C4:E14)')
			.rowAtIndex(3).valueCellAtIndex(8).value('=SUM((' + nameRng + '~' + nameRow + '!' + nameCol + '))')
			.rowAtIndex(4).valueCellAtIndex(8).value('=COUNTA((' + nameRow + '~' + nameCol + ')!' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(8).value('=COUNTIF(' + nameRng + ';\"<50\")')
			.rowAtIndex(6).valueCellAtIndex(8).value('=SUM(' + nameRng + '!' + nameCol + ';' + nameRow + ')')
			.rowAtIndex(1).valueCellAtIndex(9).value('=ROW(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(9).value('=ROW(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(9).value('=ROW(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(9).value('=COLUMN(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(9).value('=COLUMN(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(9).value('=COLUMN(' + nameCol + ')')
			.rowAtIndex(1).valueCellAtIndex(10).value('=ROWS(' + nameRng + ')')
			.rowAtIndex(2).valueCellAtIndex(10).value('=ROWS(' + nameRow + ')')
			.rowAtIndex(3).valueCellAtIndex(10).value('=ROWS(' + nameCol + ')')
			.rowAtIndex(4).valueCellAtIndex(10).value('=COLUMNS(' + nameRng + ')')
			.rowAtIndex(5).valueCellAtIndex(10).value('=COLUMNS(' + nameRow + ')')
			.rowAtIndex(6).valueCellAtIndex(10).value('=COLUMNS(' + nameCol + ')');
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			// all #REF! in sheet 'formula'
			for (j=9; j<11; j++) {
				for (i=1; i<7; i++) {
					expect.ui()
					.rowAtIndex(i).cellAtIndex(j).value('#REF!');
				}
			}
			expect.ui()
			.rowAtIndex(1).cellAtIndex(8).value('#REF!')
			.rowAtIndex(2).cellAtIndex(8).value('1')	// formula of COUNTA returns the number of references
			.rowAtIndex(3).cellAtIndex(8).value('#REF!')
			.rowAtIndex(4).cellAtIndex(8).value('1')
			.rowAtIndex(5).cellAtIndex(8).value('#REF!')
			.rowAtIndex(6).cellAtIndex(8).value('#REF!');
			d.step();
		}).end();
	});

	it.asyncly("being restored after undid deleting referring sheet", function() {
		console.log("being restored after undid deleting referring sheet");
		return actBy()
		.step(function() { // undo deleting sheet
			actions.undo();
		}).step(function() {
			actions.switchSheet(snRef);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_reference();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_reference();
			d.step();
		}).step(function() {
			actions.switchSheet(snFormula);
		}).step(function(d) {
			console.log("CHECK MODEL: " + helpers.nameOfCurrentSheet());
			models_in_formula();
			d.step();
		}).step(function(d) {
			console.log("CHECK VALUES: " + helpers.nameOfCurrentSheet());
			values_in_formula();
			d.step();
		}).end();
	});

});

// This function prepares testing data for testcases.
// It will be performed before all testcases,
// and it will be performed only once.
beforeAll(function(){
	console.log("preparing testing data...");
	return actBy()
	.step({
		line: function(s) {
			deferreds.fallback(s, deferreds.doc, 2*1000);
		},
		wait: deferreds.doc
	})
	.step(function() {
		actions.insertSheet(snRef);
		actions.insertSheet(snFormula);
	}).step(function() {
		actions.switchSheet(snRef);
	}).step(function() {
		console.log("EDIT: " + helpers.nameOfCurrentSheet());

		actions
		.focus(snRef + '!B14') // '=COLUMN()*ROW()' into B14:B16
		.editCell('=COLUMN()*ROW()').autofill('down', 2)
		.focus(snRef + '!C4') // -16~-6 into C4:C14
		.editCell(-16).autofill('down', 10)
		.focus(snRef + '!E3') // '=ROW()*5' into E3:E20
		.editCell('=ROW()*5').autofill('down', 17)
		.focus(snRef + '!F15') // 1~6 into F15:K15
		.editCell(1)
		.focus(snRef + '!F16') // '=F15*7' and the like into F16:K16
		.editCell('=F15*7')
		.focus(snRef + '!F15:F16').autofill('right', 5);
	}).step(function(d) {
		// define names
		actions.insertName(nameRng, snRef + '!C4:E14')
		.insertName(nameRow, snRef + '!14:16')
		.insertName(nameCol, snRef + '!E:E');
		d.step();
	}).step(function() {
		// formulas with in-sheet reference
		actions
		.focus(snRef + '!H1').editCell('=SUM((' + nameRng + ',E:E    ' + nameRow + '))') // '=SUM((range,E:E    row))'
		.focus(snRef + '!H2').editCell('=COUNTA((14:16,' + nameCol + ') C4:E14)') // '=COUNTA((14:16, column) C4:E14)'
		.focus(snRef + '!H3').editCell('=SUM((' + nameRng + ',' + nameRow + ' ' + nameCol + '))') // '=SUM((range, row column))'
		.focus(snRef + '!H4').editCell('=COUNTA((' + nameRow + ', ' + nameCol + ') ' + nameRng + ')') // '=COUNTA((row, column) range)'
		.focus(snRef + '!H5').editCell('=COUNTIF(' + nameRng + ', \"<50\")') // '=COUNTIF(range, "<50")'
		.focus(snRef + '!H6').editCell('=SUM(' + nameRng + ' ' + nameCol + ', ' + nameRow + ')') // '=SUM(range column, row)'
		.focus(snRef + '!I1').editCell('=ROW(' + nameRng + ')') // '=ROW(range)'
		.focus(snRef + '!I2').editCell('=ROW(' + nameRow + ')') // '=ROW(row)'
		.focus(snRef + '!I3').editCell('=ROW(' + nameCol + ')') // '=ROW(column)'
		.focus(snRef + '!I4').editCell('=COLUMN(' + nameRng + ')') // '=COLUMN(range)'
		.focus(snRef + '!I5').editCell('=COLUMN(' + nameRow + ')') // '=COLUMN(row)'
		.focus(snRef + '!I6').editCell('=COLUMN(' + nameCol + ')') // '=COLUMN(column)'
		.focus(snRef + '!J1').editCell('=ROWS(' + nameRng + ')') // '=ROWS(range)'
		.focus(snRef + '!J2').editCell('=ROWS(' + nameRow + ')') // '=ROWS(row)'
		.focus(snRef + '!J3').editCell('=ROWS(' + nameCol + ')') // '=ROWS(column)'
		.focus(snRef + '!J4').editCell('=COLUMNS(' + nameRng + ')') // '=COLUMNS(range)'
		.focus(snRef + '!J5').editCell('=COLUMNS(' + nameRow + ')') // '=COLUMNS(row)'
		.focus(snRef + '!J6').editCell('=COLUMNS(' + nameCol + ')'); // '=COLUMNS(column)'
	}).step(function() {
		actions.switchSheet(snFormula);
	}).step(function(){
		console.log("EDIT: " + helpers.nameOfCurrentSheet());
		// formulas with cross-sheet reference
		actions
		.focus(snFormula + '!H1')
		.editCell('=SUM((' + nameRng + ',' + snRef + '!E:E    ' + nameRow + '))') // '=SUM((range,reference!E:E    row))'
		.focus(snFormula + '!H2')
		.editCell('=COUNTA((' + snRef + '!14:16,' + nameCol + ') ' + snRef + '!C4:E14)') // '=COUNTA((reference!14:16, column) reference!C4:E14)'
		.focus(snFormula + '!H3')
		.editCell('=SUM((' + nameRng + ',' + nameRow + ' ' + nameCol + '))') // '=SUM((range, row column))'
		.focus(snFormula + '!H4')
		.editCell('=COUNTA((' + nameRow + ', ' + nameCol + ') ' + nameRng + ')') // '=COUNTA((row, column) range)'
		.focus(snFormula + '!H5')
		.editCell('=COUNTIF(' + nameRng + ', \"<50\")') // '=COUNTIF(range, "<50")'
		.focus(snFormula + '!H6')
		.editCell('=SUM(' + nameRng + ' ' + nameCol + ', ' + nameRow + ')') // '=SUM(range column, row)'
		.focus(snFormula + '!I1')
		.editCell('=ROW(' + nameRng + ')') // '=ROW(range)'
		.focus(snFormula + '!I2')
		.editCell('=ROW(' + nameRow + ')') // '=ROW(row)'
		.focus(snFormula + '!I3')
		.editCell('=ROW(' + nameCol + ')') // '=ROW(column)'
		.focus(snFormula + '!I4')
		.editCell('=COLUMN(' + nameRng + ')') // '=COLUMN(range)'
		.focus(snFormula + '!I5')
		.editCell('=COLUMN(' + nameRow + ')') // '=COLUMN(row)'
		.focus(snFormula + '!I6')
		.editCell('=COLUMN(' + nameCol + ')') // '=COLUMN(column)'
		.focus(snFormula + '!J1')
		.editCell('=ROWS(' + nameRng + ')') // '=ROWS(range)'
		.focus(snFormula + '!J2')
		.editCell('=ROWS(' + nameRow + ')') // '=ROWS(row)'
		.focus(snFormula + '!J3')
		.editCell('=ROWS(' + nameCol + ')') // '=ROWS(column)'
		.focus(snFormula + '!J4')
		.editCell('=COLUMNS(' + nameRng + ')') // '=COLUMNS(range)'
		.focus(snFormula + '!J5')
		.editCell('=COLUMNS(' + nameRow + ')') // '=COLUMNS(row)'
		.focus(snFormula + '!J6')
		.editCell('=COLUMNS(' + nameCol + ')'); // '=COLUMNS(column)'
	}).end();
});
