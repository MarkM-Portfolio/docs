sample("filter_sort.xlsx");

test(function() {
	var _checkCellValues = function (colName, values, rows){
		if (rows) {
			for (var i = 0; i < rows.length; i++){
				expect.ui().cell(colName + rows[i]).value(values[i]);
			}
		} else {
			for (var i = 1; i < values.length + 1; i++){					
				expect.ui().cell(colName + i).value(values[i - 1]);
			}
		}			
	};
	
	describe('Range filter sorting', function() {	
		it.asyncly('can a range ascending/descending by one column', function() {		
			var _checkUnsortedValues = function (){
			  //defect 46477
			  return;
			  _checkCellValues('V', [1, 2, 3, 4, 5, 6, 7, 8 , 9, 10,
			                           11, 12, 13, 14, 15, 16, 17, '', 19]); 
			};	
						
			var vp1 = function () {
				_checkCellValues('A', ['OrigSort', 5, 2, 16, 6, 1, 12, 11, 4, 10, 14, 13, 8, 15, 9, 3, 7, '', 19]);
				_checkCellValues('F', ['BRAND','3M', 'APR', 'BTR', 'FINDER', 'KEYSTONE', 'KEYSTONE',
				                         'KEYSTONE', 'KEYSTONE',   'MOLEX', 'NA', 'NA', 'PIHER',
				                         'WEIDMULLER', '#N/A', '#N/A', '', '', 19]);
				_checkUnsortedValues();
			};
			
			var vp2 = function () {
				_checkCellValues('A', ['OrigSort', 9, 3, 15, 8, 14, 13, 10, 1, 12, 11, 4, 6, 16, 2, 5, 7, '', 19]);
				_checkCellValues('F', ['BRAND', '#N/A','#N/A', 'WEIDMULLER', 'PIHER', 'NA', 'NA', 'MOLEX',  'KEYSTONE',
				                         'KEYSTONE', 'KEYSTONE', 'KEYSTONE', 'FINDER', 'BTR', 'APR', '3M', '', '', 19]);
				_checkUnsortedValues();
			};
			
			return actBy()
			.step(function(){
				actions.switchSheet('Sheet1');
				_checkCellValues('A', ['OrigSort', 10, 5, 2, 1, 13, 3, 8, 
				                         14, 11, 7, 4, 12, 16, 9, 15, 6, '', 19]);
				_checkCellValues('U', ['HealthCentAff', 6, 13, 21, 46, 25, 54,
				                         16, 4, 61, 57, 19, 14, 12, 7, 14, 4, '', 19]); 
				_checkUnsortedValues();
				actions.filterSort(1, true); 
			}).step(function(d){						
				_checkCellValues('A', ['OrigSort', 1, 2, 3, 4, 5, 6, 7, 8, 9, 
				                         10, 11, 12, 13, 14, 15, 16, '', 19]); 
				_checkCellValues('U', ['HealthCentAff', 46, 21, 54, 19, 13, 4, 57, 16,
				                         7, 6, 61, 14, 25, 4, 14, 12, '', 19]); 
				_checkUnsortedValues();
				actions.filterSort(1, false); 
			}).step(function(){				
				_checkCellValues('A', ['OrigSort', 16, 15, 14, 13, 12, 11, 10, 9, 8,
				                         7, 6, 5, 4, 3, 2, 1, '', 19]); 
				_checkCellValues('F', ['BRAND','BTR', 'WEIDMULLER', 'NA', 'NA', 'KEYSTONE',
				                         'KEYSTONE', 'MOLEX', '#N/A', 'PIHER', '', 'FINDER', '3M',
				                         'KEYSTONE', '#N/A', 'APR', 'KEYSTONE', '', 19]); 
				_checkCellValues('U', ['HealthCentAff', 12, 14, 4, 25, 14, 61, 6,
				                         7, 16, 57, 4, 13, 19, 54, 21, 46, '', 19]); 
				_checkUnsortedValues();
				actions.filterSort(6, true);  //defect 46460 
			}).step(function(){
				vp1();
				actions.filterSort(6, false); 
			}).step(function(){
				vp2();
				actions.undo();
			}).step(function(){	
				vp1();	
				actions.redo();	
			}).step(function(){	
				vp2();
				actions.filterSort(2, true); 
			}).end();
		});		
	
		it.asyncly('should ignore hidden rows', function() {
			var visibleRows = [1, 2, 4, 9, 10, 13, 15];

			var _checkFilterStatus = function (enabledArr){
				enabledArr = enabledArr ? enabledArr : [0, 3, 12];
				expect.model().filterAt('A1:U17');
				expect.ui().filter().toBeOfCount(21).toBeAt(1, 1, 21).toBeEnabled(enabledArr);
			};
			
			var _checkRowStatus = function (stateObj) {
				stateObj = stateObj ? stateObj : {s: 1, e: 17, v: false, c: visibleRows};
				var map = {};
				var visible;
				stateObj.v = stateObj.v === undefined ? true : stateObj.v;
				for (var i in stateObj.c) map[stateObj.c[i]] = true;
				for (var j = stateObj.s; j <= stateObj.e; j++){
					visible = map[j] ? !stateObj.v : stateObj.v;			
					if (!visible){
						expect.model().rowAtIndex(j).isFiltered();
						expect.ui().hiddenAtIndex(j);
					} else {
						expect.model().rowAtIndex(j).isShown();
						expect.ui().rowAtIndex(j);
					}
				}		
			};
			
			var vp0 = function () {
				_checkFilterStatus();
				_checkRowStatus();
				_checkCellValues('A', ['OrigSort', 14, 8, 9, 1, 3, 4], visibleRows);
				_checkCellValues('B', ['OrigNumbering', 9, 8, 15, 4, 7, 12], visibleRows);
			};			
			
			var vp1 = function () {
				_checkFilterStatus();
				_checkRowStatus();
				_checkCellValues('A', ['OrigSort', 1, 3, 8, 14, 4, 9], visibleRows);
				_checkCellValues('B', ['OrigNumbering', 4, 7, 8, 9, 12, 15], visibleRows);
				_checkCellValues('F', ['BRAND', 'KEYSTONE', '#N/A', 'PIHER', 'NA', 'KEYSTONE', '#N/A'], visibleRows);
			};
			
			var vp2 = function () {
				_checkFilterStatus();
				_checkRowStatus();
				_checkCellValues('A', ['OrigSort', 3, 9, 8, 14, 1, 4], visibleRows);
			    _checkCellValues('F', ['BRAND', '#N/A', '#N/A', 'PIHER', 'NA', 'KEYSTONE', 'KEYSTONE'], visibleRows);
			    _checkCellValues('M', ['NCDM_displ', 6085, 3017, 1403, 225, 5372, 11534], visibleRows);
				
			};
			
			var vp3 = function () {
				_checkFilterStatus();
				_checkRowStatus();
				_checkCellValues('A', ['OrigSort', 14, 8, 9, 1, 3, 4], visibleRows);
			    _checkCellValues('M', ['NCDM_displ', 225, 1403, 3017, 5372, 6085, 11534], visibleRows);
			};
			
			var vp4 = function () {
				_checkFilterStatus([0, 3]);
				_checkRowStatus({s: 1, e: 17, c:[5, 6, 8, 11, 16]});
				var rs = [1, 2, 3, 4, 7, 9, 10, 12, 13, 14, 15, 17];
				_checkCellValues('A', ['OrigSort', 14, 2, 8, 6, 9, 1, 11, 3, 13, 4, 16], rs);
			    _checkCellValues('M', ['NCDM_displ', 225, -1194, 1403, -767, 3017, 5372,
			                           -10227, 6085, '', 11534, -726], rs);
			};
			
			return actBy()
			.step(function(){
				actions.switchSheet('Sheet2');
			}).step(function(){
				vp0();
				actions.filterSort(2, true);				
			}).step(function(){
				vp1();		
				actions.filterSort(6, false); 				
			}).step(function(){
				vp2();
				actions.undo();
			}).step(function(){
				vp1();
				actions.redo();
			}).step(function(){
				vp2();
				actions.filterSort(13, true); 
			}).step(function(){
				vp3();
				actions.clearFilter(13);	
			}).step(function(){
				vp4();
				actions.undo();	
			}).step(function(d){
				vp3();
				d.step();
			}).end();
		});
	});
});
