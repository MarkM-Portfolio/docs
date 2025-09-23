sample("filter_create.xlsx");

describe('Creating a filter', function() {
	it.asyncly('should show a filter button in the 1st row of the selection when selecting a cell/column(s)/range', function() {
		return actBy()
		.step(function(){
			actions.switchSheet('Sheet1');
			expect.model().filterAt();
			expect.ui().filter().toBeOfCount(0);
		}).step(function(){
			//select a single cell
			actions.focus('F3').createFilter();
			expect.model().filterAt('F3:F7');
		}).step(function(){
			expect.ui().filter().toBeOfCount(1).toBeAt(3, 6, 6).toBeEnabled();
			actions.removeFilter();
			///a column
			actions.focus('L:L').createFilter();
			expect.model().filterAt('L:L');		    	
		}).step(function(){
			expect.ui().filter().toBeOfCount(1).toBeAt(1, 12, 12);
			actions.removeFilter();
			//columns
			actions.focus('A:E').createFilter();
			expect.model().filterAt('A:E');	 	
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(1, 1, 5).toBeEnabled();
			actions.removeFilter();
			//a range
			actions.focus('G5:J15').createFilter();
			expect.model().filterAt('G5:J15');
		}).step(function(){
			expect.ui().filter().toBeOfCount(4).toBeAt(5, 7, 10); //Column U 
			actions.removeFilter();		    	
		}).end();
	});

	it.asyncly('should show a filter button in used cells when selecting a row(s)/sheet', function() {
		return actBy()
		.step(function(){
			//select a row;
			actions.focus('A6:AZ6').createFilter();
			expect.model().filterAt('A6:U6');
		}).step(function(){
			expect.ui().filter().toBeOfCount(21).toBeAt(6, 1, 21).toBeEnabled(); //Column U 
			actions.removeFilter();	
			//rows
			actions.focus('A3:AZ10').createFilter();
			expect.model().filterAt('A3:U10');
		}).step(function(){
			expect.ui().filter().toBeOfCount(21).toBeAt(3, 1, 21);
			actions.removeFilter();	
			//entire sheet
			actions.focus('A:AZ').createFilter();
			expect.model().filterAt('A:U');
		}).step(function(){
			expect.ui().filter().toBeOfCount(21).toBeAt(1, 1, 21).toBeEnabled(); 
			actions.removeFilter();			    	
		}).end();
	});

	it.asyncly('should show a filter button when selecting a merging cell', function() {
		return actBy()
		.step(function(){
			actions.switchSheet('Sheet2');
		}).step(function(){
			//a merging cell
			actions.focus('C1').createFilter();
			expect.model().filterAt('C1');
		}).step(function(){
			expect.ui().filter().toBeOfCount(1).toBeAt(1, 3, 3).toBeEnabled(); 
			actions.removeFilter();	
		}).end();
	});

	it.asyncly('should show a filter button in each columns when selecting a range with merged cells', function() {
		return actBy()
		.step(function(){
			//a range with merged cells
			actions.focus('C1:E5').createFilter();
			expect.model().filterAt('C1:E5');
		}).step(function(){
			expect.ui().filter().toBeOfCount(3).toBeAt(1, 3, 5).toBeEnabled(); 
			actions.removeFilter();	
		}).end();
	});

	it.asyncly('should create a filter button but hide it when the column is hidden', function() {
		return actBy()
		.step(function(){
			//select a range with hidden columns
			actions.focus('F5:K10').createFilter();
			expect.model().filterAt('F5:K10');		
		}).step(function(){
			expect.ui().filter().toBeOfCount(6).toBeAt(5, 6, 11).toBeEnabled(); 
			actions.removeFilter();	
		}).end();
	});			
});

describe('A filter button', function() {
	it.asyncly('should be hidden when the row/column is hidden', function() {
		return actBy()
		.step(function(){
			actions.switchSheet('Sheet2').focus('L11:P15').createFilter();
			expect.model().filterAt('L11:P15');	
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			//row
			actions.focus('A11:AZ11').hideRows();
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			actions.focus('10:12').showRows();
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			//columns
			actions.focus('L:P').hideColumns();
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			actions.undo();
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			actions.removeFilter();
		}).end();
	});

	it.asyncly('should be hidden when the row/column is covered by freeze panes', function() {
		return actBy()
		.step(function(){
			actions.focus('L11:P15').createFilter();
			expect.model().filterAt('L11:P15');	
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			//scroll down
			actions.scrollToRow(30);
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			actions.scrollToRow(1);
		}).step(function(d){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			//scroll right
			actions.scrollToColumn('Z');
			d.step();
		}).step(function(d){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			actions.scrollToColumn('K');
			d.step();
		}).step(function(){
			expect.ui().filter().toBeOfCount(5).toBeAt(11, 12, 16);
			actions.removeFilter();	
		}).end();
	});

	it.asyncly('should be deleted when the row/column is deleted', function() {
		return actBy()
		.step(function(){
			expect.model().filterAt();
			expect.ui().filter().toBeOfCount(0);
			actions.focus('F5:K10').createFilter();
			expect.model().filterAt('F5:K10');	
		}).step(function(){
			expect.ui().filter().toBeOfCount(6).toBeAt(5, 6, 11);
			actions.focus('1:5').deleteRows();
		}).step(function(){
			expect.ui().filter().toBeOfCount(0);
			actions.undo();
		}).step(function(){
			expect.ui().filter().toBeOfCount(6).toBeAt(5, 6, 11);
			actions.focus('F:J').deleteColumns();
		}).step(function(){
			expect.ui().filter().toBeOfCount(1).toBeAt(5, 6, 6);
			actions.undo();
		}).step(function(){
			expect.ui().filter().toBeOfCount(6).toBeAt(5, 6, 11); 
			actions.removeFilter();	
		}).end();
	});
});		
