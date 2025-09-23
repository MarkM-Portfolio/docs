sample(null);

describe("Range Sort", function() {
	var sn = 'rangesort' + new Date().getTime();
	it.asyncly("A single column range", function() {
		return actBy()
		.step(function(){
			actions.insertSheet(sn);
		}).step(function(){
			actions.focus(sn + '!A1')
			.editCell('Column 1')
			.setFontEffect('bold')
			.setAlignment('middle')
			.setAlignment('center')
			.setRowHeight(50);
			actions.focus(sn + '!A2')
			.editCell(1)
			.autofill('down', 9);	
			actions.focus(sn + '!A1:A10').autofill('right', 4);
			//Cell Styles
			actions.focus(sn + '!A1:E1')
			.setBackgroundColor('#000000')
			.setFontColor('#FFFFFF');
			actions.focus(sn + '!A2:E2')
			.setBackgroundColor('#CCCCCC')
			.setBorderType(app.BORDERTYPE.OUTERBORDERS)
			.setBorderStyle(app.BORDERSTYLE.THINSOLID)
			.setBorderColor('#000000');
			actions.focus(sn + '!A2:E3').autofill('down', 8);
			actions.focus(sn + '!A2:E11')
			.setBorderType(app.BORDERTYPE.OUTERBORDERS)
			.setBorderStyle(app.BORDERSTYLE.THICKSOLID)
			.setBorderColor('#000000');						
		}).end();
	});

	it.asyncly("A1. Sort ascending without a column header", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!A1:A11').rangeSort(true, false, 0);
			expect.model().rowAtIndex(1).valueCellAtIndex(1).value(1);
			expect.model().rowAtIndex(11).valueCellAtIndex(1).value('Column 1');
		}).step(function(d){
			expect.ui()
			.rowAtIndex(9).cellAtIndex(1).backgroundColor('#cccccc').value(9)
			.rowAtIndex(10).cellAtIndex(1).backgroundColor('transparent').value(10)
			.rowAtIndex(11).cellAtIndex(1).backgroundColor('#000000').value('Column 1');
			d.step();
		}).end();
	});

	it.asyncly("A2. Sort dscending without a column header", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!B1:B11').rangeSort(false, false, 0);
			expect.model().rowAtIndex(1).valueCellAtIndex(2).value('Column 2');
			expect.model().rowAtIndex(11).valueCellAtIndex(2).value(2);
		}).step(function(d){
			expect.ui()
			.rowAtIndex(1)
			.cellAtIndex(1).backgroundColor('#cccccc').value(1)
			.cellAtIndex(2).backgroundColor('#000000').value('Column 2')
			.rowAtIndex(2).cellAtIndex(2).backgroundColor('transparent').value(11)
			.rowAtIndex(3).cellAtIndex(2).backgroundColor('#cccccc').value(10)
			.rowAtIndex(11)
			.cellAtIndex(1).backgroundColor('#000000').value('Column 1')
			.cellAtIndex(2).backgroundColor('#cccccc').value(2);
			d.step();
		}).end();
	});

	it.asyncly("A3. Sort ascending with a column header", function() {
		return	actBy()
		.step(function(d) {
			actions.focus(sn + '!B1:B11').rangeSort(false, false, 0);
			expect.model().rowAtIndex(1).valueCellAtIndex(3).value('Column 3');
			expect.model().rowAtIndex(11).valueCellAtIndex(3).value(12);
			//No UI change
			expect.ui()
			.rowAtIndex(1).cellAtIndex(3).backgroundColor('#000000').value('Column 3')
			.rowAtIndex(2).cellAtIndex(3).backgroundColor('#cccccc').value(3)
			.rowAtIndex(3).cellAtIndex(3).backgroundColor('transparent').value(4)
			.rowAtIndex(11).cellAtIndex(3).backgroundColor('transparent').value(12);
			d.step();
		}).end();
	});

	it.asyncly("A4. Sort dscending with a column header", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!D1:D11').rangeSort(false, true, 0);				
			expect.model().rowAtIndex(1).valueCellAtIndex(4).value('Column 4');
			expect.model().rowAtIndex(11).valueCellAtIndex(4).value(4);
		}).step(function(d){
			expect.ui()
			.rowAtIndex(1).cellAtIndex(4).backgroundColor('#000000').value('Column 4')
			.rowAtIndex(2).cellAtIndex(4).backgroundColor('transparent').value(13)
			.rowAtIndex(3).cellAtIndex(4).backgroundColor('#cccccc').value(12)
			.rowAtIndex(11).cellAtIndex(4).backgroundColor('#cccccc').value(4);
			d.step();
		}).end();
	});

	it.asyncly("A range contains multiple rows and columns", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!G3')
			.editCell('Column 6')	
			.autofill('right', 4);
		}).step(function() {
			actions.focus(sn + '!G4').editCell(5);
			actions.focus(sn + '!G5').editCell(-3.5);
			actions.focus(sn + '!G6').editCell('NA');
			actions.focus(sn + '!G7').editCell(3.5);		
			actions.focus(sn + '!H4').editCell('SWG');
			actions.focus(sn + '!H5').editCell('Docs');
			actions.focus(sn + '!H6').editCell('ICS');
			actions.focus(sn + '!H7').editCell('22');
			actions.focus(sn + '!G4:H7').autofill('down',10);
		}).step(function() {
			actions.focus(sn + '!I4')
			.editCell('=IF(ISTEXT(G4),0,G4+3)')
			.autofill('right',2);
			actions.focus(sn + '!I4:K4').autofill('down',13);
			actions.focus(sn + '!G3:K3')
			.setBackgroundColor('#0000ff')
			.setFontColor('#ffffff');
			actions.focus(sn + '!G4:K17')
			.setBorderType(app.BORDERTYPE.INNERBORDERS)
			.setBorderStyle(app.BORDERSTYLE.THINDASHED)
			.setBorderColor('#3071a9')
			.setFontSize(12)
			.setFontColor('#3071a9')
			.setFontName('Comic Sans MS');
		}).step(function() {
			actions.focus(sn + '!H1').setColumnWidth(200);
		}).end();
	});

	it.asyncly("B1. Sort aescending without a column header by index 0", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!G3:K17').rangeSort(true, false, 0);			
			expect.model().rowAtIndex(3).valueCellAtIndex(7).value(-3.5);
			expect.model().rowAtIndex(14).valueCellAtIndex(7).value('Column 6');
			expect.model().rowAtIndex(15).valueCellAtIndex(7).value('NA');
		}).step(function(d){
			expect.ui()
			.rowAtIndex(1).cellAtIndex(5).backgroundColor('#000000').value('Column 5') //out of the sorting range
			.rowAtIndex(3)
			.cellAtIndex(5).backgroundColor('transparent').value(6)
			.cellAtIndex(7).backgroundColor('transparent').value(-3.5).font('Comic Sans MS').color('#3071a9')
			.cellAtIndex(8).backgroundColor('transparent').value('Docs')
			.rowAtIndex(4).cellAtIndex(7).value(-2.5)
			.rowAtIndex(7).cellAtIndex(7).value(3.5)
			.rowAtIndex(14)
			.cellAtIndex(7).backgroundColor('#0000ff').value('Column 6').color('#ffffff')
			.cellAtIndex(8).backgroundColor('#0000ff').value('Column 7').color('#ffffff')
			.cellAtIndex(11).backgroundColor('#0000ff').value('Column 10').color('#ffffff')
			.rowAtIndex(15).cellAtIndex(7).backgroundColor('transparent').value('NA').color('#3071a9');
			d.step();
		}).end();
	});

	it.asyncly("B2. Sort descending without a column header by index 1", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!G3:K17').rangeSort(false, false, 1);			
			expect.model().rowAtIndex(3).valueCellAtIndex(8).value('SWG');
			expect.model().rowAtIndex(14).valueCellAtIndex(7).value('Column 6');
			expect.model().rowAtIndex(17).valueCellAtIndex(8).value(22);
		}).step(function(d){
			expect.ui()
			.rowAtIndex(3)
			.cellAtIndex(7).value(5)
			.cellAtIndex(8).value('SWG')
			.cellAtIndex(11).value(11)
			.rowAtIndex(4)
			.cellAtIndex(7).value(6)
			.cellAtIndex(8).value('SWG')
			.cellAtIndex(11).value(12)
			.rowAtIndex(7)
			.cellAtIndex(7).value('NA')
			.cellAtIndex(8).value('ICS')
			.cellAtIndex(11).value(3)
			.rowAtIndex(10)
			.cellAtIndex(7).value(-3.5)
			.cellAtIndex(8).value('Docs')
			.cellAtIndex(11).value(2.5)
			.rowAtIndex(14)
			.cellAtIndex(7).backgroundColor('#0000ff').value('Column 6').color('#ffffff')
			.cellAtIndex(8).backgroundColor('#0000ff').value('Column 7').color('#ffffff')
			.cellAtIndex(11).backgroundColor('#0000ff').value('Column 10').color('#ffffff')
			.rowAtIndex(15).cellAtIndex(8).value(24)
			.rowAtIndex(16).cellAtIndex(8).value(23)
			.rowAtIndex(17).cellAtIndex(8).value(22);
			d.step();
		}).end();
	});

	it.asyncly("B3. Sort aescending with a column header by index 1", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!G3:K17').rangeSort(true, true, 1);		
			expect.model().rowAtIndex(3)
			.valueCellAtIndex(8).value('SWG')
			.valueCellAtIndex(7).value(5);
			expect.model().rowAtIndex(4)
			.valueCellAtIndex(8).value(22)
			.valueCellAtIndex(7).value(3.5);
			expect.model().rowAtIndex(13)
			.valueCellAtIndex(8).value('ICS')
			.valueCellAtIndex(7).value('NA');
		}).step(function(d){
			expect.ui()
			.rowAtIndex(3)
			.cellAtIndex(7).value(5)
			.cellAtIndex(8).value('SWG')
			.cellAtIndex(11).value(11)
			.rowAtIndex(4)
			.cellAtIndex(7).value(3.5)
			.cellAtIndex(8).value(22)
			.cellAtIndex(11).value(9.5)
			.rowAtIndex(5)
			.cellAtIndex(7).value(4.5)
			.cellAtIndex(8).value(23)
			.cellAtIndex(11).value(10.5)
			.rowAtIndex(6)
			.cellAtIndex(7).value(5.5)
			.cellAtIndex(8).value(24)
			.cellAtIndex(11).value(11.5)
			.rowAtIndex(7)
			.cellAtIndex(7).backgroundColor('#0000ff').value('Column 6').color('#ffffff')
			.cellAtIndex(8).backgroundColor('#0000ff').value('Column 7').color('#ffffff')
			.cellAtIndex(11).backgroundColor('#0000ff').value('Column 10').color('#ffffff')
			.rowAtIndex(8)
			.cellAtIndex(7).value(-3.5)
			.cellAtIndex(8).value('Docs')
			.cellAtIndex(11).value(2.5);
			d.step();
		}).end();
	});

	it.asyncly("B4. Sort descending with a column header by index 2", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!G3:K17').rangeSort(false, true, 2);		
			expect.model().rowAtIndex(3)
			.valueCellAtIndex(8).value('SWG')
			.valueCellAtIndex(7).value(5);
			expect.model().rowAtIndex(4)
			.valueCellAtIndex(8).value('Column 7')
			.valueCellAtIndex(7).value('Column 6');
			expect.model().rowAtIndex(10)
			.valueCellAtIndex(8).value(22)
			.valueCellAtIndex(7).value(3.5);
		}).step(function(d){
			expect.ui()
			.rowAtIndex(3)
			.cellAtIndex(8).value('SWG')
			.cellAtIndex(9).value(8)
			.rowAtIndex(4)
			.cellAtIndex(8).backgroundColor('#0000ff').value('Column 7').color('#ffffff')
			.cellAtIndex(9).backgroundColor('#0000ff').value('Column 8').color('#ffffff')
			.rowAtIndex(5)
			.cellAtIndex(8).value('SWG')
			.cellAtIndex(9).value(11)
			.rowAtIndex(6)
			.cellAtIndex(8).value('SWG')
			.cellAtIndex(9).value(10)
			.rowAtIndex(7)
			.cellAtIndex(8).value('SWG')
			.cellAtIndex(9).value(9)
			.rowAtIndex(8)
			.cellAtIndex(8).value(24)
			.cellAtIndex(9).value(8.5);
			d.step();
		}).end();
	});	

	it.asyncly("A sheet with frozen panes & hidden rows", function() {
		return	actBy()
		.step(function() {
			actions.freezeRow(4);
			actions.focus(sn + '!A5:AZ10').hideRows();
		}).end();
	});	

	it.asyncly("C1. Sort aescending by a column ", function() {
		return	actBy()
		.step(function() {
			actions.focus(sn + '!A1:AZ10000').rangeSort(true, false, 2);
			expect.model()
			.rowAtIndex(4).isShown()
			.rowAtIndex(5).isHidden()
			.rowAtIndex(10).isHidden()
			.rowAtIndex(11).isShown()
			.freezeAt(4,0);
		}).step(function(d){
			expect.ui()
			.freezeAt(4,0)
			.rowAtIndex(1)
			.cellAtIndex(1).value(2)
			.cellAtIndex(2).value(11)
			.cellAtIndex(7).value('')
			.rowAtIndex(2)
			.cellAtIndex(1).value(3)
			.cellAtIndex(2).value(10)
			.cellAtIndex(7).value(5)
			.rowAtIndex(4)
			.cellAtIndex(1).value('Column 1')
			.cellAtIndex(2).value(2)
			.cellAtIndex(7).value(-0.5)
			.rowAtIndex(11)
			.cellAtIndex(1).backgroundColor('#cccccc').value(1)
			.cellAtIndex(2).backgroundColor('#000000').value('Column 2')
			.cellAtIndex(3).backgroundColor('#000000').value('Column 3')
			.cellAtIndex(7).backgroundColor('transparent').value('');
			d.step();
		}).step(function(){
			actions.focus(sn + '!A1:AZ10000').showRows();
			actions.scrollToRow(5);
		}).step(function(d){
			expect.ui()
			.rowAtIndex(4).cellAtIndex(2).backgroundColor('#cccccc').value(2)
			.rowAtIndex(5).cellAtIndex(2).backgroundColor('#cccccc').value(8)
			.rowAtIndex(6).cellAtIndex(2).backgroundColor('transparent').value(7)
			.rowAtIndex(7).cellAtIndex(2).backgroundColor('#cccccc').value(6)
			.rowAtIndex(11).cellAtIndex(2).backgroundColor('#000000').value('Column 2');
			d.step();
		}).end();
	});	
});
