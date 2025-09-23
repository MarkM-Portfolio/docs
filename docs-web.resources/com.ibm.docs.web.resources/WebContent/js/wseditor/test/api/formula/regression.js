sample(null);

describe("No sample formula regression", function() {
	it.asyncly("vefifies defect 43332", function() {
		var s1 = helpers.nameOfCurrentSheet();
		var s2 = "Sheet43332";
		return actBy().step(function() {
			actions.focus('A1').editCell(1);
		}).step(function() {
			actions.insertSheet(s2);
		}).step(function(s) {
			s.reload(deferreds.doc, 2*1000);
		}).step({
			line: function() {
				actions.focus('A1').editCell('=' + s1 + '!A1');
			},
			wait: deferreds.loadDocument
		}).step(function(s) {
			expect.ui().cell('A1').value(1);
			s.step();
		}).end();
	});

	it.asyncly("verifies defect 43423", function() {
		return actBy().step(function() {
			actions.focus('E1').editCell('=G1')
			.focus('F1').editCell('=H1')
			.focus('G1').editCell("E1")
			.focus('H1').editCell('=INDIRECT(G1)');
		}).step(function() {
			actions.focus("G1").editCell('F1');
		}).step(function(s) {
			expect.ui().cell('E1').value('F1');
			s.step();
		}).end();
	});

	it.asyncly("verifies defect 43414", function() {
		return actBy().step(function() {
			actions.focus('B1').editCell(10)
			.focus('B3').editCell('=SUM(B1)')
			.focus('C1').editCell("=B1/B3");
		}).step(function() {
			actions.focus("A:A").deleteColumns()
			.focus("3:3").deleteRows();
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.model().valueCell(3, 1).value('=SUM(A1)');
			s.step();
		}).end();
	});

	it.asyncly("verifies defect 43325", function() {
		var sheet = "Sheet43325";
		return actBy().step(function() {
			actions.insertSheet(sheet);
		}).step(function() {
			actions.focus('D1').editCell(1).autofill('right', 2)
			.focus('D1:F1').autofill('down', 9)
			.focus('A1').editCell('D1')
			.focus('B1').editCell('E1')
			.focus('C1').editCell('F1')
			.focus('A1:C1').autofill('down', 9)

			.focus('J18').editCell('=INDIRECT(A1)')
			.autofill('down', 9)
			.focus('J18:J27').autofill('right', 2);
		}).step(function() {
			actions.focus('C:C').insertColumnsBefore();
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('J18').value(1)
			.cell('K19').value(3)
			.cell('K26').value(10)
			.cell('L23').value(8);
			s.step();
		}).end();
	});

	it.asyncly("verifies defect 45155 about `Frequency`", function() {
		var sheet = 'Sheet45155';
		return actBy()
		.step(function() {
			actions.insertSheet(sheet);
		})
		.step(function() {
			actions.focus('A1').editCell(1)
			.autofill('down', 9)
			.focus('B1').editCell(2)
			.focus('B2').editCell(5)
			.focus('B3').editCell(7)
			.focus('C1').editCell('=FREQUENCY(A1:A10, B1:B3)');
		})
		.step(function(s) {
			expect.ui().cell('C1').value(2);
			s.step();
		})
		.end();
	});

	it.asyncly('verifies defect 45164', function() {
		var sheet = 'Sheet45164';
		return actBy()
		.step(function() {
			actions.insertSheet(sheet);
		})
		.step(function() {
			actions.focus('A2').editCell('sdf')
			.focus('B1').editCell('=A1:A2 A2:A3<>{true}');
		})
		.step(function(s) {
			expect.ui().cell('B1').value('TRUE');
			s.step();
		})
		.end();
	});

	it.asyncly('verifies defect 43579', function() {
		var sheet = 'Sheet43579';
		return actBy().step(function() {
			actions.insertSheet(sheet);
		}).step(function() {
			actions.focus('A16').editCell('12')
			.focus('A16').autofill('down', 4)
			.focus('A1').editCell('=SUM(A18:(A16:A18,A17))');
		}).step(function() {
			actions.focus('18:18').insertRowsAbove();
		}).step(function() {
			actions.focus('A18').editCell(2333);
		}).step(function(s) {
			expect.ui().cell('A1').value(2372);
			s.step();
		}).end();
	});

	it.asyncly('verifies defect 43580', function() {
		var sheet = 'Sheet43580';
		return actBy().step(function() {
			actions.insertSheet(sheet);
		}).step(function() {
			actions.focus('A1').editCell('2')
			.autofill('down', 2)
			.focus('A1:A3').autofill('right', 2)
			.focus('E1').editCell('=SUM(A1:C3)');
		}).step(function() {
			actions.focus('B:C').insertColumnsBefore();
		}).step(function() {
			actions.undo();
		}).step(function() {
			actions.focus("2:3").deleteRows();
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('E1').value(36);
			s.step();
		}).end();
	});

	it.asyncly('verifies defect 43629', function() {
		var sheet = 'Sheet43629';
		return actBy().step(function() {
			actions.insertSheet(sheet);
		}).step(function() {
			actions.focus('A1').editCell('=C1')
			.focus('B1').editCell('=D1')
			.focus('C1').editCell('B1')
			.focus('D1').editCell('=INDIRECT(C1)');
		}).step(function() {
			actions.focus('A:A').deleteColumns();
		}).step(function() {
			expect.ui().cell('A1').value('B1');
			actions.undo();
		}).step(function() {
			actions.redo();
		}).step(function(s) {
			expect.ui().cell('A1').value('B1');
			s.step();
		}).end();
	});

	it.asyncly('verifies defect 43704', function() {
		var sheet2 = 'Sheet43704', sheet1;
		return actBy().step(function() {
			sheet1 = helpers.nameOfCurrentSheet();
			actions.focus("A1").editCell(1);
		}).step(function() {
			actions.insertSheet(sheet2);
		}).step(function() {
			actions.focus('Z1001').editCell('=' + sheet1 + '!A1')
			.focus('Z:Z').insertColumnsBefore()
			.focus('A1').editCell('=AA1001')
			.switchSheet(sheet1);
		}).step(function(s) {
			s.reload(deferreds.doc, 2*1000);
		}).step(function() {
			actions.focus('A:A').deleteColumns();
		}).step(function() {
			actions.switchSheet(sheet2);
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('A1').value(1);
			s.step();
		}).end();
	});

	it.asyncly('verifies defect 43732 about recovering name', function() {
		var s1 = 'Sheet43732';
		return actBy().step(function() {
			actions.insertSheet(s1);
		}).step(function(s) {
			// sheet name of pure numeric char should be quoted
			actions.insertName("t_43732", "'" + s1 + "'!a1:a3");
			s.step();
		}).step(function(s) {
			expect.model().hasName('t_43732', "'" + s1 + "'!a1:a3");
			s.reload(deferreds.doc, 2*1000);
		}).step(function() {
			actions.focus('a:a').deleteColumns();
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.model().hasName('t_43732', "'" + s1 + "'!A1:A3");
			s.step();
		}).end();
	});

	it.asyncly('verifies defect 43770', function() {
		var s1 = 'Sheet43770a';
		var s2 = 'Sheet43770b';			
		return actBy()
		.step(function() {
			actions.insertSheet(s2).insertSheet(s1);
		}).step(function() {
			actions.focus('A1').editCell(1)
			.focus('A2').editCell(2);
		}).step(function() {
			actions.switchSheet(s2);
		}).step(function(s) {
			actions.insertName('test', "'" + s2 + "'!A1");
			s.step();
		}).step(function(s) {
			actions.focus('A3').editCell('=SUM(test)');
		}).step(function(s) {
			s.reload(deferreds.doc, 2*1000);
		}).step({
			line: function(s) {
				actions.updateName('test', "'" + s1 + "'!A1:A2");
			},
			wait: deferreds.loadDocument
		}).step(function(s) {
			expect.ui().cell('A3').value(3);
			s.step();
		}).end();
	});

	it.asyncly("verifies defect 45311", function() {
		return actBy().step(function() {
			actions.insertName('name', helpers.nameOfCurrentSheet() + '!B1')
			.focus('A1').editCell('name')
			.focus('B1').editCell(2)
			.focus('A2').editCell('=INDIRECT(A1)');
		}).step(function(s) {
			expect.ui().cell('A2').value(2);
			s.step();
		}).end();
	});

	it.asyncly("verifies defect 45341", function() {
		var s1 = new Date().getTime();
		var s2 = new Date().getTime();
		return actBy().step(function() {
			actions.newSheet(s1);
		}).step(function() {
			actions.newSheet(s2);
		}).step(function() {
			actions.switchToSheet(s1);
		}).step(function() {
			actions.focus('a1').editCell('=' + s2 + '!a1')
			.focus('a2').editCell('=indirect(a1)');
		}).step(function() {
			actions.switchToSheet(s2);
		}).step(function() {
			actions.focus('a1').editCell(1);
		}).step(function() {
			actions.renameSheet(s2, 'kk')
			.switchToSheet(s1);
		}).step(function(s) {
			expect.ui().cell('a2').value("#REF!");
			s.step();
			//known issue: cannot undo
		});
	});

	it.asyncly('verifies defect 45346', function() {
		return actBy().step(function() {
			actions.insertSheet('Sheet45346');
		}).step(function() {
			actions.focus('a1:c5').mergeCell()
			.focus('d1:f4').mergeCell()
			.focus('g1:h4').mergeCell()
			.focus('a1').editCell('数据1')
			.focus('a2').editCell(1)
			.focus('a3').editCell(2)
			.focus('a4').editCell(3)
			.focus('d1').editCell('数据2')
			.focus('d2').editCell(4)
			.focus('d3').editCell(5)
			.focus('d4').editCell(6)
			.focus('g1').editCell('数据3')
			.focus('g2').editCell(7)
			.focus('g3').editCell(8)
			.focus('g4').editCell(9)
			.focus('a5').editCell('=HLOOKUP(G1,A1:H4,4)');
		}).step(function() {
			expect.ui().cell('a5').value(9);
			actions.focus('1:1').deleteRows();
		}).step(function() {
			expect.ui().cell('a4').value('#REF!');
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('a5').value(9);
			s.step();
		}).end();
	});
	
	it.asyncly('verifies defect 46113 about ISEVEN', function() {
		return actBy().step(function() {
			actions.insertSheet('Sheet46113');
		}).step(function() {
			actions.focus('A1').editCell('=ISEVEN(9)');
		}).step(function(s) {
			expect.ui().cell('A1').value('FALSE');
			s.step();
		}).end();
	});
	
	it.asyncly('verifies defect 46113 about INDEX', function() {
		return actBy().step(function() {
			actions.focus('A1').editCell('1')
				.focus('B1').editCell('2')
				.focus('A2').editCell('3')
				.focus('B2').editCell('4')
				.focus('A3').editCell('=index(A1:B2 A1:B2,1,1)');
		}).step(function(s) {
			expect.ui().cell('a3').value(1);
			s.step();
		}).end();
	});
	
	it.asyncly('verifies defect 46128 about STDEVP', function() {
		return actBy().step(function() {
			actions.focus('A1').editCell('=stdevp(1,2,3,4,5)');
		}).step(function(s) {
			expect.ui().cell('A1').value(1.414213562);
			s.step();
		}).end();
	});
});
