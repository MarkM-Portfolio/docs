sample();
var references='references', formulas='formulas';

describe("websheet.test.api.formula.calculation.general", function() {
	// define snapshots
	var check_ui_in_references = function() {
		var valueInColB = 0,
		valueInColC = 1,
		valueInColD = 1;

		for (i=4; i<14; i++) {// range [B4:C15]
			valueInColB += 1;
			valueInColC = Math.pow(2, i-4);

			expect.ui()
			.rowAtIndex(i).cellAtIndex(2).value(valueInColB)
			.rowAtIndex(i).cellAtIndex(3).value(valueInColC)
			.rowAtIndex(i).cellAtIndex(4).value(valueInColD);

			valueInColD = valueInColC;
		}

		// range [H21:H25]
		expect.ui()
		.rowAtIndex(21).cellAtIndex(8).value(1590)
		.rowAtIndex(22).cellAtIndex(8).value(1023)
		.rowAtIndex(23).cellAtIndex(8).value(812)
		.rowAtIndex(24).cellAtIndex(8).value(23)
		.rowAtIndex(25).cellAtIndex(8).value(50);
	};

	var check_model_in_references = function() {
		var colB = 1,
		colC = '=2^(ROW()-4)',
		cellD4 = 1,
		prefix = '=SUM($D$4:D',
		colD;

		expect.model()
		.rowAtIndex(4).valueCellAtIndex(2).value(colB)
		.rowAtIndex(4).valueCellAtIndex(3).value(colC)
		.rowAtIndex(4).valueCellAtIndex(4).value(cellD4);

		for (i=5; i<14; i++) { // range [B4:C15]
			colB += 1;
			colD = prefix + (i-1) + ')';
			expect.model()
			.rowAtIndex(i).valueCellAtIndex(2).value(colB)
			.rowAtIndex(i).valueCellAtIndex(3).value(colC)
			.rowAtIndex(i).valueCellAtIndex(4).value(colD);
		}
		// range [H21:H25]
		expect.model()
		.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(B4:D15)')
		.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(C:C)')
		.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(3:12)')
		.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF(B:D!1:15;\"<50\")')
		.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(B:B;(C:D~C4:D20))');

	};

	var check_ui_in_formulas = function() {
		// range [A1:C15]
		for (i=1; i<4; i++) {// rows 1~3
			expect.ui()
			.rowAtIndex(i).cellAtIndex(1).value(0)
			.rowAtIndex(i).cellAtIndex(2).value(0)
			.rowAtIndex(i).cellAtIndex(3).value(0)
			.rowAtIndex(i).cellAtIndex(4).value('TRUE');
		}
		for (i=4; i<14; i++) {// rows 4~13
			expect.ui()
			.rowAtIndex(i).cellAtIndex(1).value(i-3)
			.rowAtIndex(i).cellAtIndex(2).value(i-3)
			.rowAtIndex(i).cellAtIndex(3).value(i-3)
			.rowAtIndex(i).cellAtIndex(4).value('FALSE');
		} 
		for (i=14; i<16; i++) { // rows 14~15
			expect.ui()
			.rowAtIndex(i).cellAtIndex(1).value(0)
			.rowAtIndex(i).cellAtIndex(2).value(0)
			.rowAtIndex(i).cellAtIndex(3).value(0)
			.rowAtIndex(i).cellAtIndex(4).value('TRUE');
		}

		// range [H21:H25]
		expect.ui()
		.rowAtIndex(21).cellAtIndex(8).value(1590)
		.rowAtIndex(22).cellAtIndex(8).value(1023)
		.rowAtIndex(23).cellAtIndex(8).value(812)
		.rowAtIndex(24).cellAtIndex(8).value(23)
		.rowAtIndex(25).cellAtIndex(8).value(50);
	};

	var check_model_in_formulas = function() {
		var colA = '=' + references + '.B:B',
		colBPre = '=' + references + '.B',
		colCPre = '=' + references + '.B:B!' + references + '.',
		colDPre = '=' + formulas + '.C',
		colB, colC, colD;

		for (i=1; i<16; i++) {
			colB = colBPre + i;
			colC = colCPre + i + ':' + i;
			colD = colDPre + i + '=0';

			expect.model()
			.rowAtIndex(i).valueCellAtIndex(1).value(colA)
			.rowAtIndex(i).valueCellAtIndex(2).value(colB)
			.rowAtIndex(i).valueCellAtIndex(3).value(colC)
			.rowAtIndex(i).valueCellAtIndex(4).value(colD);
		}

		expect.model()
		.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(' + references + '.B4:D15)')
		.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(' + references + '.C:C)')
		.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(' + references + '.3:12)')
		.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF(' + references + '.B:D!' + references + '.1:15;\"<50\")')
		.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(' + references + '.B:B;(' 
				+ references + '.C:D~' + references + '.C4:D20))');
	};
	// end of snapshots definition

	it.asyncly("calculate when formula is generated and then reload", function() {
		return actBy()
		.step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			actions.scrollToRow(4);
			check_model_in_references();
			check_ui_in_references();

			actions.switchSheet(formulas);
		}).step(function(s) { 
			check_model_in_formulas();
			check_ui_in_formulas();

			s.step();
		}).end();
	},20*1000);

	it.asyncly("recalculate when the reference change", function() {
		var B3 = -333,
		B14 = 123;

		return actBy().step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			actions.focus(references + '!B3').editCell(B3)
			.focus(references + '!B14').editCell(B14);
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(21).cellAtIndex(8).value(1713)
			.rowAtIndex(22).cellAtIndex(8).value(1023)
			.rowAtIndex(23).cellAtIndex(8).value(479)
			.rowAtIndex(24).cellAtIndex(8).value(24)
			.rowAtIndex(25).cellAtIndex(8).value(52);
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(3).cellAtIndex(1).value(B3)
			.rowAtIndex(3).cellAtIndex(2).value(B3)
			.rowAtIndex(3).cellAtIndex(3).value(B3)
			.rowAtIndex(3).cellAtIndex(4).value('FALSE')
			.rowAtIndex(14).cellAtIndex(1).value(B14)
			.rowAtIndex(14).cellAtIndex(2).value(B14)
			.rowAtIndex(14).cellAtIndex(3).value(B14)
			.rowAtIndex(14).cellAtIndex(4).value('FALSE')
			.rowAtIndex(21).cellAtIndex(8).value(1713)
			.rowAtIndex(22).cellAtIndex(8).value(1023)
			.rowAtIndex(23).cellAtIndex(8).value(479)
			.rowAtIndex(24).cellAtIndex(8).value(24)
			.rowAtIndex(25).cellAtIndex(8).value(52);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid changing reference values", function() {
		return actBy().step(function() {
			actions.undo().undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_ui_in_references();
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when rows were inserted above reference", function() {
		return actBy().step(function() {
			actions.switchSheet(references);
			actions.focus('1:1').insertRowsAbove();
		})
		.step(function(d) {
			expect.model()
			.rowAtIndex(14).valueCellAtIndex(2).value(10)
			.rowAtIndex(14).valueCellAtIndex(3).value('=2^(ROW()-4)')
			.rowAtIndex(14).valueCellAtIndex(4).value('=SUM($D$5:D13)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(B5:D16)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(C:C)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=SUM(4:13)')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTIF(B:D!2:16;\"<50\")')
			.rowAtIndex(26).valueCellAtIndex(8).value('=COUNTA(B:B;(C:D~C5:D21))');
			d.step();
		}).step(function(d) {
			var valueInColB = 0,
			valueInColC = 1,
			valueInColD = 1;

			for (i=5; i<15; i++) {
				valueInColB += 1;
				valueInColC = Math.pow(2, i-4);

				expect.ui()
				.rowAtIndex(i).cellAtIndex(2).value(valueInColB)
				.rowAtIndex(i).cellAtIndex(3).value(valueInColC)
				.rowAtIndex(i).cellAtIndex(4).value(valueInColD);

				valueInColD = valueInColC / 2;
			}
			expect.ui()
			.rowAtIndex(22).cellAtIndex(8).value(2613)
			.rowAtIndex(23).cellAtIndex(8).value(2046)
			.rowAtIndex(24).cellAtIndex(8).value(1323)
			.rowAtIndex(25).cellAtIndex(8).value(22)
			.rowAtIndex(26).cellAtIndex(8).value(50);
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(4).valueCellAtIndex(1).value('=' + references + '.B:B')
			.rowAtIndex(4).valueCellAtIndex(2).value('=' + references + '.B5')
			.rowAtIndex(4).valueCellAtIndex(3).value('=' + references + '.B:B!' + references + '.5:5')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(' + references + '.B5:D16)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(' + references + '.C:C)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(' + references + '.4:13)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF(' + references + '.B:D!' + references + '.2:16;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(' + references + '.B:B;(' 
					+ references + '.C:D~' + references + '.C5:D21))');
			d.step();
		}).step(function(d) {
			for (i=4; i<14; i++) {
				expect.ui()
				.rowAtIndex(i).cellAtIndex(1).value(i-4)
				.rowAtIndex(i).cellAtIndex(2).value(i-3)
				.rowAtIndex(i).cellAtIndex(3).value(i-3)
				.rowAtIndex(i).cellAtIndex(4).value('FALSE');
			}

			expect.ui()
			.rowAtIndex(14).cellAtIndex(1).value(10)
			.rowAtIndex(14).cellAtIndex(2).value(0)
			.rowAtIndex(14).cellAtIndex(3).value(0)
			.rowAtIndex(14).cellAtIndex(4).value('TRUE')
			.rowAtIndex(21).cellAtIndex(8).value(2613)
			.rowAtIndex(22).cellAtIndex(8).value(2046)
			.rowAtIndex(23).cellAtIndex(8).value(1323)
			.rowAtIndex(24).cellAtIndex(8).value(22)
			.rowAtIndex(25).cellAtIndex(8).value(50);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting rows above reference", function() {
		return actBy()
		.step(function() {
			actions.undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_model_in_references();
			d.step();
		}).step(function(d) {
			check_ui_in_references();
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_model_in_formulas();
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when rows with values were inserted in reference", function(){
		return actBy()
		.step(function() {
			actions.switchSheet(references);
		}).step(function() {
			actions.focus(references + '!A12:AZ12')
			.insertRowsAbove();
			actions.focus(references + '!B12')
			.editCell(111)
			.focus(references +'!C12')
			.editCell(-222)
			.focus(references + '!D12')
			.editCell(-333);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(14).valueCellAtIndex(2).value(10)
			.rowAtIndex(14).valueCellAtIndex(3).value('=2^(ROW()-4)')
			.rowAtIndex(14).valueCellAtIndex(4).value('=SUM($D$4:D13)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(B4:D16)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(C:C)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=SUM(3:13)')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTIF(B:D!1:16;\"<50\")')
			.rowAtIndex(26).valueCellAtIndex(8).value('=COUNTA(B:B;(C:D~C4:D21))');
			d.step();
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(12).cellAtIndex(2).value(111)	// range [B12:D14]
			.rowAtIndex(12).cellAtIndex(3).value(-222)
			.rowAtIndex(12).cellAtIndex(4).value(-333)
			.rowAtIndex(13).cellAtIndex(2).value(9)
			.rowAtIndex(13).cellAtIndex(3).value(512)
			.rowAtIndex(13).cellAtIndex(4).value(128)
			.rowAtIndex(14).cellAtIndex(2).value(10)
			.rowAtIndex(14).cellAtIndex(3).value(1024)
			.rowAtIndex(14).cellAtIndex(4).value(-77)
			.rowAtIndex(22).cellAtIndex(8).value(1581)	// range [H22:H26]
			.rowAtIndex(23).cellAtIndex(8).value(1569)
			.rowAtIndex(24).cellAtIndex(8).value(624)
			.rowAtIndex(25).cellAtIndex(8).value(26)
			.rowAtIndex(26).cellAtIndex(8).value(55);

			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(14).valueCellAtIndex(1).value('=' + references + '.B:B')
			.rowAtIndex(14).valueCellAtIndex(2).value('=' + references + '.B15')
			.rowAtIndex(14).valueCellAtIndex(3).value('=' + references + '.B:B!' + references + '.15:15')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(' + references + '.B4:D16)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(' + references + '.C:C)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(' + references + '.3:13)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF(' + references + '.B:D!' + references + '.1:16;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(' + references + '.B:B;(' 
					+ references + '.C:D~' + references + '.C4:D21))');
			d.step();
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(12).cellAtIndex(1).value(111)	// range [A12:D15]
			.rowAtIndex(12).cellAtIndex(2).value(9)
			.rowAtIndex(12).cellAtIndex(3).value(9)
			.rowAtIndex(12).cellAtIndex(4).value('FALSE')
			.rowAtIndex(13).cellAtIndex(1).value(9)
			.rowAtIndex(13).cellAtIndex(2).value(10)
			.rowAtIndex(13).cellAtIndex(3).value(10)
			.rowAtIndex(13).cellAtIndex(4).value('FALSE')
			.rowAtIndex(14).cellAtIndex(1).value(10)
			.rowAtIndex(14).cellAtIndex(2).value(0)
			.rowAtIndex(14).cellAtIndex(3).value(0)
			.rowAtIndex(14).cellAtIndex(4).value('TRUE')
			.rowAtIndex(15).cellAtIndex(1).value(0)
			.rowAtIndex(15).cellAtIndex(2).value(0)
			.rowAtIndex(15).cellAtIndex(3).value(0)
			.rowAtIndex(15).cellAtIndex(4).value('TRUE')
			.rowAtIndex(21).cellAtIndex(8).value(1581)	// range [H21:H25]
			.rowAtIndex(22).cellAtIndex(8).value(1569)
			.rowAtIndex(23).cellAtIndex(8).value(624)
			.rowAtIndex(24).cellAtIndex(8).value(26)
			.rowAtIndex(25).cellAtIndex(8).value(55);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting rows with data", function() {
		return actBy()
		.step(function() { // undo inputing data
			actions.undo()
			.undo()
			.undo();
		}).step(function() { // undo inserting row
			actions.undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_model_in_references();
			d.step();
		}).step(function(d) {
			check_ui_in_references();
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_model_in_formulas();
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});

	it.asyncly("recalculate when columns were inserted before reference", function() {
		return actBy()
		.step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			actions.focus(references + '!B1:B10000')
			.insertColumnsBefore();
			expect.model()
			.rowAtIndex(10).valueCellAtIndex(3).value(7)
			.rowAtIndex(10).valueCellAtIndex(4).value('=2^(ROW()-4)')
			.rowAtIndex(10).valueCellAtIndex(5).value('=SUM($E$4:E9)')
			.rowAtIndex(21).valueCellAtIndex(9).value('=SUM(C4:E15)')
			.rowAtIndex(22).valueCellAtIndex(9).value('=SUM(D:D)')
			.rowAtIndex(23).valueCellAtIndex(9).value('=SUM(3:12)')
			.rowAtIndex(24).valueCellAtIndex(9).value('=COUNTIF(C:E!1:15;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(9).value('=COUNTA(C:C;(D:E~D4:E20))');
			d.step();
		}).step(function(d) {
			// range [C4:E13]
			var valueInColC = 0,
			valueInColD = 1,
			valueInColE = 1;

			for (i=4; i<14; i++) {
				valueInColC += 1;
				valueInColD = Math.pow(2, i-4);

				expect.ui()
				.rowAtIndex(i).cellAtIndex(3).value(valueInColC)
				.rowAtIndex(i).cellAtIndex(4).value(valueInColD)
				.rowAtIndex(i).cellAtIndex(5).value(valueInColE);

				valueInColE = valueInColD;
			}

			// range [I21:I25]
			expect.ui()
			.rowAtIndex(21).cellAtIndex(9).value(1590)
			.rowAtIndex(22).cellAtIndex(9).value(1023)
			.rowAtIndex(23).cellAtIndex(9).value(812)
			.rowAtIndex(24).cellAtIndex(9).value(23)
			.rowAtIndex(25).cellAtIndex(9).value(50);
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(8).valueCellAtIndex(1).value('=' + references + '.C:C')
			.rowAtIndex(8).valueCellAtIndex(2).value('=' + references + '.C8')
			.rowAtIndex(8).valueCellAtIndex(3).value('=' + references + '.C:C!' + references + '.8:8')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(' + references + '.C4:E15)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(' + references + '.D:D)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(' + references + '.3:12)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF('+ references + '.C:E!' + references + '.1:15;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(' + references + '.C:C;(' 
					+ references + '.D:E~' + references + '.D4:E20))');
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting columns before reference", function() {
		return actBy()
		.step(function() { // undo inserting column
			actions.undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_model_in_references();
			d.step();
		}).step(function(d) {
			check_ui_in_references();
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_model_in_formulas();
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});


	it.asyncly("recalculate when columns with values were inserted in reference", function() {
		return actBy()
		.step(function() {
			actions.switchSheet(references);
		}).step(function() {
			actions.focus(references + '!D1:D10000')
			.insertColumnsBefore();
			actions.focus(references + '!D7')
			.editCell(10)
			.focus(references + '!D8')
			.editCell(100);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(8).valueCellAtIndex(2).value(5)
			.rowAtIndex(8).valueCellAtIndex(3).value('=2^(ROW()-4)')
			.rowAtIndex(8).valueCellAtIndex(4).value(100)
			.rowAtIndex(8).valueCellAtIndex(5).value('=SUM($E$4:E7)')
			.rowAtIndex(21).valueCellAtIndex(9).value('=SUM(B4:E15)')
			.rowAtIndex(22).valueCellAtIndex(9).value('=SUM(C:C)')
			.rowAtIndex(23).valueCellAtIndex(9).value('=SUM(3:12)')
			.rowAtIndex(24).valueCellAtIndex(9).value('=COUNTIF(B:E!1:15;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(9).value('=COUNTA(B:B;(C:E~C4:E20))');
			d.step();
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(21).cellAtIndex(9).value(1700)
			.rowAtIndex(22).cellAtIndex(9).value(1023)
			.rowAtIndex(23).cellAtIndex(9).value(922)
			.rowAtIndex(24).cellAtIndex(9).value(24)
			.rowAtIndex(25).cellAtIndex(9).value(54);
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(8).valueCellAtIndex(1).value('=' + references + '.B:B')
			.rowAtIndex(8).valueCellAtIndex(2).value('=' + references + '.B8')
			.rowAtIndex(8).valueCellAtIndex(3).value('=' + references + '.B:B!' + references + '.8:8')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(' + references + '.B4:E15)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(' + references + '.C:C)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(' + references + '.3:12)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF('+ references + '.B:E!' + references + '.1:15;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(' + references + '.B:B;(' 
					+ references + '.C:E~' + references + '.C4:E20))');
			d.step();
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(21).cellAtIndex(8).value(1700)
			.rowAtIndex(22).cellAtIndex(8).value(1023)
			.rowAtIndex(23).cellAtIndex(8).value(922)
			.rowAtIndex(24).cellAtIndex(8).value(24)
			.rowAtIndex(25).cellAtIndex(8).value(54);
			d.step();
		}).end();
	});

	it.asyncly("recalculate after undid inserting columns with data", function() {
		return actBy()
		.step(function() { // undo inputing data
			actions.undo()
			.undo();
		}).step(function() { // undo inserting column
			actions.undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_model_in_references();
			d.step();
		}).step(function(d) {
			check_ui_in_references();
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_model_in_formulas();
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});


	it.asyncly("adapt and recalculate when rows in reference were deleted", function() {
		return actBy()
		.step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			actions.focus(references + '!A12:AZ12')
			.deleteRows();
			expect.model()
			.rowAtIndex(20).valueCellAtIndex(8).value('=SUM(B4:D14)')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(C:C)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(3:11)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=COUNTIF(B:D!1:14;\"<50\")')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTA(B:B;(C:D~C4:D19))');
			d.step();
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(12).cellAtIndex(2).value(10)
			.rowAtIndex(12).cellAtIndex(3).value(256)
			.rowAtIndex(12).cellAtIndex(4).value(128)
			.rowAtIndex(20).cellAtIndex(8).value(813)
			.rowAtIndex(21).cellAtIndex(8).value(511)
			.rowAtIndex(22).cellAtIndex(8).value(419)
			.rowAtIndex(23).cellAtIndex(8).value(22)
			.rowAtIndex(24).cellAtIndex(8).value(45);
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(12).valueCellAtIndex(1).value('=' + references + '.B:B')
			.rowAtIndex(12).valueCellAtIndex(2).value('=' + references + '.#REF!')
			.rowAtIndex(12).valueCellAtIndex(3).value('=' + references + '.B:B!' + references + '.#REF!')
			.rowAtIndex(12).valueCellAtIndex(4).value('=' + formulas + '.C12=0')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(' + references + '.B4:D14)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(' + references + '.C:C)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(' + references + '.3:11)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF('+ references + '.B:D!' + references + '.1:14;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(' + references + '.B:B;(' 
					+ references + '.C:D~' + references + '.C4:D19))');
			d.step();
		}).step(function(d) {
			expect.ui()
			.rowAtIndex(12).cellAtIndex(1).value(10)
			.rowAtIndex(12).cellAtIndex(2).value('#REF!')
			.rowAtIndex(12).cellAtIndex(3).value('#REF!')
			.rowAtIndex(12).cellAtIndex(4).value('#REF!')
			.rowAtIndex(21).cellAtIndex(8).value(813)
			.rowAtIndex(22).cellAtIndex(8).value(511)
			.rowAtIndex(23).cellAtIndex(8).value(419)
			.rowAtIndex(24).cellAtIndex(8).value(22)
			.rowAtIndex(25).cellAtIndex(8).value(45);
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate after undid deleting rows from reference", function() {
		return actBy()
		.step(function() { // undo deleting rows
			actions.undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_model_in_references();
			d.step();
		}).step(function(d) {
			check_ui_in_references();
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_model_in_formulas();
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate when columns in reference were deleted", function() {
		return actBy()
		.step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			actions.focus(references + '!C1:C10000').deleteColumns();
		}).step(function(d) {
			expect.model()
			.rowAtIndex(8).valueCellAtIndex(2).value(5)
			.rowAtIndex(8).valueCellAtIndex(3).value('=SUM($C$4:C7)')
			.rowAtIndex(21).valueCellAtIndex(7).value('=SUM(B4:C15)')
			.rowAtIndex(22).valueCellAtIndex(7).value('=SUM(#REF!)')
			.rowAtIndex(23).valueCellAtIndex(7).value('=SUM(3:12)')
			.rowAtIndex(24).valueCellAtIndex(7).value('=COUNTIF(B:C!1:15;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(7).value('=COUNTA(B:B;(C:C~C4:C20))');
			d.step();
		}).step(function(d) {
			// range [B4:D13]
			var valueInColB = 0,
			valueTmp = 1,
			valueInColC = 1;

			for (i=4; i<14; i++) {
				valueInColB += 1;
				valueTmp = Math.pow(2, i-4);

				expect.ui()
				.rowAtIndex(i).cellAtIndex(2).value(valueInColB)
				.rowAtIndex(i).cellAtIndex(3).value(valueInColC)
				.rowAtIndex(i).cellAtIndex(4).value('');

				valueInColC = valueTmp;
			}

			expect.ui()
			.rowAtIndex(21).cellAtIndex(7).value(567)	// range [G21:G25]
			.rowAtIndex(22).cellAtIndex(7).value('#REF!')
			.rowAtIndex(23).cellAtIndex(7).value(301)
			.rowAtIndex(24).cellAtIndex(7).value(17)
			.rowAtIndex(25).cellAtIndex(7).value(30)
			.rowAtIndex(21).cellAtIndex(8).value('')	// range [H21:H25]
			.rowAtIndex(22).cellAtIndex(8).value('')
			.rowAtIndex(23).cellAtIndex(8).value('')
			.rowAtIndex(24).cellAtIndex(8).value('')
			.rowAtIndex(25).cellAtIndex(8).value('');
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(12).valueCellAtIndex(1).value('=' + references + '.B:B')
			.rowAtIndex(12).valueCellAtIndex(2).value('=' + references + '.B12')
			.rowAtIndex(12).valueCellAtIndex(3).value('=' + references + '.B:B!' + references + '.12:12')
			.rowAtIndex(12).valueCellAtIndex(4).value('=' + formulas + '.C12=0')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(' + references + '.B4:C15)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(' + references + '.#REF!)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(' + references + '.3:12)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF('+ references + '.B:C!' + references + '.1:15;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(' + references + '.B:B;(' 
					+ references + '.C:C~' + references + '.C4:C20))');
			d.step();
		}).step(function(d) {
			// no change in range [A1:D15]
			for (i=1; i<4; i++) {// rows 1~3
				expect.ui()
				.rowAtIndex(i).cellAtIndex(1).value(0)
				.rowAtIndex(i).cellAtIndex(2).value(0)
				.rowAtIndex(i).cellAtIndex(3).value(0)
				.rowAtIndex(i).cellAtIndex(4).value('TRUE');
			}
			for (i=4; i<14; i++) {// rows 4~13
				expect.ui()
				.rowAtIndex(i).cellAtIndex(1).value(i-3)
				.rowAtIndex(i).cellAtIndex(2).value(i-3)
				.rowAtIndex(i).cellAtIndex(3).value(i-3)
				.rowAtIndex(i).cellAtIndex(4).value('FALSE');
			} 
			for (i=14; i<16; i++) { // rows 14~15
				expect.ui()
				.rowAtIndex(i).cellAtIndex(1).value(0)
				.rowAtIndex(i).cellAtIndex(2).value(0)
				.rowAtIndex(i).cellAtIndex(3).value(0)
				.rowAtIndex(i).cellAtIndex(4).value('TRUE');
			}

			// range [H21:H25]
			expect.ui()
			.rowAtIndex(21).cellAtIndex(8).value(567)
			.rowAtIndex(22).cellAtIndex(8).value('#REF!')
			.rowAtIndex(23).cellAtIndex(8).value(301)
			.rowAtIndex(24).cellAtIndex(8).value(17)
			.rowAtIndex(25).cellAtIndex(8).value(30);
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate after undid deleting columns from reference", function() {
		return actBy()
		.step(function() { // undo deleting columns
			actions.undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_model_in_references();
			d.step();
		}).step(function(d) {
			check_ui_in_references();
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_model_in_formulas();
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});

	it.asyncly("adapt and recalculate when deleted referring sheet", function() {
		return actBy()
		.step(function() {
			actions.switchSheet(references);
		})
		.step(function() {
			actions.deleteSheet(references);
		})
		.step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			expect.model()
			.rowAtIndex(12).valueCellAtIndex(1).value('=#REF!.B:B')
			.rowAtIndex(12).valueCellAtIndex(2).value('=#REF!.B12')
			.rowAtIndex(12).valueCellAtIndex(3).value('=#REF!.B:B!#REF!.12:12')
			.rowAtIndex(12).valueCellAtIndex(4).value('=' + formulas + '.C12=0')
			.rowAtIndex(21).valueCellAtIndex(8).value('=SUM(#REF!.B4:D15)')
			.rowAtIndex(22).valueCellAtIndex(8).value('=SUM(#REF!.C:C)')
			.rowAtIndex(23).valueCellAtIndex(8).value('=SUM(#REF!.3:12)')
			.rowAtIndex(24).valueCellAtIndex(8).value('=COUNTIF(#REF!.B:D!#REF!.1:15;\"<50\")')
			.rowAtIndex(25).valueCellAtIndex(8).value('=COUNTA(#REF!.B:B;(' 
					+ '#REF!.C:D~#REF!.C4:D20))');
			d.step();
		}).step(function(d) {
			// all #REF! in sheet 'formula'
			for (i=1; i<5; i++) {
				for (j=1; j<16; j++) {
					expect.ui().rowAtIndex(j).cellAtIndex(i).value('#REF!');
				}
			}
			for (i=21; i<25; i++) {
				expect.ui().rowAtIndex(i).cellAtIndex(8).value('#REF!');
			}
			// formula of COUNTA returns the number of references
			expect.ui().rowAtIndex(25).cellAtIndex(8).value(2);
			d.step();
		}).end();
	});

	it.asyncly("being restored after undid deleting referring sheet", function() {
		return actBy()
		.step(function() { // undo deleting sheet
			actions.undo();
		}).step(function() {
			actions.switchSheet(references);
		}).step(function(d) {
			check_model_in_references();
			d.step();
		}).step(function(d) {
			check_ui_in_references();
			d.step();
		}).step(function() {
			actions.switchSheet(formulas);
		}).step(function(d) {
			check_model_in_formulas();
			d.step();
		}).step(function(d) {
			check_ui_in_formulas();
			d.step();
		}).end();
	});

});

afterAll(function() {
	actions.deleteSheet(references);
	actions.deleteSheet(formulas);
	window.app.close();
});

// This function prepares testing data for testcases.
// It will be performed before all testcases,
// and it will be performed only once.
beforeAll(function(){
	return actBy()
	.step({
		line: function(s) {
			deferreds.fallback(s, deferreds.doc, 2*1000);
		},
		wait: deferreds.doc
	})
	.step(function() {
		actions.insertSheet(references);
		actions.insertSheet(formulas);
	}).step(function() {
		actions.switchSheet(references);
		actions.focus('B4').editCell(1).autofill('down', 9) // input numbers 1~10 into B4:B13
		.focus('C4').editCell('=2^(ROW()-4)').autofill('down', 9) // input formulas "=2^(ROW()-4)" into C4:C13
		.focus('D4').editCell(1) // input a sequence into D4:D13
		.focus('D5').editCell('=SUM($D$4:D4)').autofill('down', 8)

		.focus('H21').editCell('=SUM(B4:D15)')
		.focus('H22').editCell('=SUM(C:C)')
		.focus('H23').editCell('=SUM(3:12)')
		.focus('H24').editCell('=COUNTIF(B:D 1:15, \"<50\")')
		.focus('H25').editCell('=COUNTA(B:B, (C:D, C4:D20))');
	})
	.step(function() {
		actions.switchSheet(formulas);
	})
	.step(function() {
		// directly reference
		actions.focus('A1').editCell('=' + references + '!B:B').autofill('down', 14)
		.focus('B1').editCell('=' + references + '!B1').autofill('down', 14)
		.focus('C1').editCell('=' + references + '!B:B ' + references + '!1:1')
		.autofill('down', 14)
		.focus('D1').editCell('=' + formulas + '!C1=0').autofill('down', 14);
		// referred in formulas
		actions.focus('H21').editCell('=SUM(' + references + '!B4:D15)')
		.focus('H22').editCell('=SUM(' + references + '!C:C)')
		.focus('H23').editCell('=SUM(' + references + '!3:12)')
		.focus('H24').editCell('=COUNTIF(' + references + '!B:D ' + references + '!1:15, \"<50\")')
		.focus('H25').editCell('=COUNTA(' + references + '!B:B, (' 
				+ references + '!C:D, ' + references + '!C4:D20))');
	}).end();
});
