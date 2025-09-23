sample("filter_enable.xlsx");

test(function() {
	var _checkFilteredRows = function(stateObj){
		/*stateObj
		 * {
		 *   s:    // 1-based number, index of start row
		 *   e:    // number 
		 *   v:    // boolean
		 *   c:    // row index array, contra
		 * }
		 */
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
	
	var commonVP = function(){
		expect.model().filterAt('A1:U17');
		expect.ui().filter().toBeOfCount(21).toBeAt(1, 1, 21);
	};
	
	describe('Keyword filter', function() {
		it.asyncly('should update the status of a filter button', function() {			
			var vp0 = function () {
				commonVP();
				expect.ui().filter().toBeEnabled([1]);
				_checkFilteredRows({s: 1, e: 1});
				_checkFilteredRows({s: 2, e: 10, v: false});
				_checkFilteredRows({s: 11, e: 17});
			};
			
			var vp1 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([0, 1]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 13, 15, 17]});
			};
			
			var vp2 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([0]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 13, 15, 17]});
			};
			
			var vp3 = function(){
				expect.model().filterAt();
				expect.ui().filter().toBeOfCount(0);
				_checkFilteredRows({s: 1, e: 17});
			};			
			
			return actBy()
			.step(function(){
				actions.switchSheet('Sheet1');
			}).step(function(){
				vp0();
				actions.keywordFilter(1, 'set', ['12', '9', '6']); //enable
			}).step(function(){
				vp1();
				actions.undo();
			}).step(function(){
				vp0();
				actions.redo();
			}).step(function(){
				vp1();
				actions.clearFilter(2);
			}).step(function(){
				vp2();
				actions.removeFilter();	
			}).step(function(){
				vp3();
				actions.undo();	
			}).step(function(){
				vp2();  //defect 45856
				actions.redo();
			}).end();
		});		
		
		it.asyncly('should filter items by showValue', function() {
			var vp0 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled();
				_checkFilteredRows({s: 1, e: 17});	
			};
			
			var vp1 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([15]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 2, 13]});	
			};
			
			var vp2 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([15]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 2, 7, 13, 17]});	
				
			};
			return actBy()
			.step(function(){
				actions.focus('Sheet1!A1:U17').createFilter();				
			}).step(function(){
				vp0();
				//apply to column P
				actions.keywordFilter(16, 'set', ['9']);
		    }).step(function(){
		    	vp1();
				actions.undo();
		    }).step(function(){
		    	vp0();
		    	actions.redo();
		    }).step(function(){
		    	vp1();
				//update
				actions.keywordFilter(16, 'update', null, ['900%', '$9.00']);
		    }).step(function(){
		    	vp2();		
				actions.undo();
		    }).step(function(){
		    	vp1();
		    	actions.redo();
		    }).step(function(){
				vp2();
				//clear
				actions.clearFilter(16);
		    }).end();
		});
		
		it.asyncly('can be applied to multiple columns', function() {
			var vp0 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled();
				_checkFilteredRows({s: 1, e: 17});	
			};
			
			var vp1 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([3]);
				_checkFilteredRows({s: 1, e: 17, c: [2, 7, 8, 14]});
			};
			
			var vp2 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([3, 5]);
				_checkFilteredRows({s: 1, e: 17, v:false, c: [1, 6, 9, 11, 15]});
			};
			
			var vp3 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([3, 5, 20]);
				_checkFilteredRows({s: 1, e: 17, v:false, c: [1, 9, 15]});
			};
			
			var vp4 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([3, 5, 20]);
				_checkFilteredRows({s: 1, e: 17, v:false, c: [1, 11, 15]});
			};
			
			var vp5 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([5, 20]);
				_checkFilteredRows({s: 1, e: 17, v:false, c: [1, 11, 15]});
			};
			
			var vp6 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([5]);
				_checkFilteredRows({s: 1, e: 17, v:false, c: [1, 6, 7, 9, 11, 15]});
			};			
			
			return actBy()
			.step(function(){
				actions.switchSheet('Sheet1');
				vp0();
				actions.keywordFilter(4, 'set', ['OEA', 'ROWCA', 'ROAP', 'ROLAC', 'ROSA']); 
		    }).step(function(){
		    	vp1();
				actions.keywordFilter(6, 'set',  ['NA', '#N/A', '']);
		    }).step(function(){
		    	vp2();
		    	actions.undo();
		    }).step(function(){
		    	vp1();
				actions.redo();
		    }).step(function(){
		    	vp2();
		    	actions.keywordFilter(21, 'set',  ['4', '7']);
		    }).step(function(){
		    	vp3();
		    	actions.keywordFilter(21, 'update', null, ['57'], ['4']);
		    }).step(function(){
		    	vp4();
		    	actions.clearFilter(4);
		    }).step(function(){
		    	vp5();
		    	actions.clearFilter(21);
		    }).step(function(){
		    	vp6();
		    	actions.undo();
		    }).step(function(){
		    	vp5();
		    	actions.redo();
		    }).step(function(){
		    	vp6();
		    	actions.clearFilter(6);
		    }).end();
		});	
		
	});
	
	describe('Custom filter', function() {
		//Defect 45952
		it.asyncly('"Equals/Does not equal" should filter items by showValue', function() {
			var vp0 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled();
				_checkFilteredRows({s: 1, e: 17});	
			};
				
			var vp1 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([15]);
				_checkFilteredRows({s: 1, e: 17, v: false, c:[1, 2, 13]});	
			};

			var vp2 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([11]);
				_checkFilteredRows({s: 1, e: 17, v: false, c:[1]});	
			};
				
			var vp3 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([11]);
				_checkFilteredRows({s: 1, e: 17, v: false, c:[1, 9]});	
			};
				
			var vp4 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([5]);
				_checkFilteredRows({s: 1, e: 17, c:[7, 15]});	
			};
				
			var vp5 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([4, 5]);
				_checkFilteredRows({s: 1, e: 17, v:false, c:[1, 2, 9]});	
			};
				
			var vp6 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([4, 5]);
				_checkFilteredRows({s: 1, e: 17, c:[2,  7 , 9 , 15]});	
			};
				
			var vp7 = function(){
				expect.model().filterAt('A1:P17');
				expect.ui().filter().toBeOfCount(16).toBeAt(1, 1, 16).toBeEnabled([0]);
				_checkFilteredRows({s: 1, e: 17, c:[7, 15]});	
			};
				
			return actBy()
			.step(function(){
				actions.switchSheet('Sheet1');
				vp0();
				// use showValue of keywords
				actions.customFilter(16, null, '9');  
			}).step(function(){
				vp1();
				// use showValue of condition
				actions.clearFilter(16).customFilter(12, null, '3005'); 
			}).step(function(){
				vp2();
				actions.customFilter(12, null, '$3,005.00'); 
			}).step(function(){
				vp3();
				actions.clearFilter(12).customFilter(6, "!=", "#N/A");
			}).step(function(){
				vp4();
				actions.customFilter(5, null, 'Yemen'); 
			}).step(function(){
				vp5();
				actions.customFilter(5, '!=', 'Yemen'); 
			}).step(function(){
				vp6();
				actions.clearFilter(5); 
			}).step(function(){
				vp4();
				actions.undo().focus('A:E').deleteColumns(); 
			}).step(function(){
				vp7();
				actions.undo();
			}).step(function(){
				vp6();
				actions.clearFilter(5).clearFilter(6);
			}).end();
		});	
	
		it.asyncly('">, <, >=, <=" should filter items by rawValue', function() {
			var vp0 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled();
				_checkFilteredRows({s: 1, e: 17});	
			};
			
			var vp1 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([0]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 6, 9, 10, 13, 14, 16]});	
			};
			
			var vp2 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([0]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 2, 6, 9, 10, 13, 14, 16]});	
			};
			
			var vp1 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([0]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 6, 9, 10, 13, 14, 16]});	
			};
			
			var vp3 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([0]);
				_checkFilteredRows({s: 1, e: 17, c: [2, 6, 9, 10, 13, 14, 16]});	
			};
			
			var vp4 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([0]);
				_checkFilteredRows({s: 1, e: 17, c: [ 6, 9, 10, 13, 14, 16]});		
			};
			
			var vp5 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([15]);
				_checkFilteredRows({s: 1, e: 17, c: [2, 3, 4, 6, 9, 11, 14, 15]});	
			};
			
			var vp6 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([13, 15]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 8, 13, 17]});	
			};
			
			var vp7 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([15, 17]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 5, 7, 10, 12, 16]});	
			};
			
			var vp8 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([11, 15, 17]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 7, 10]});	
			};	
			
			var vp9 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([4]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 5, 6, 10, 12, 15, 16, 17]});	
			};	
			
			var vp10 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([4, 7]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 6, 12]});	
			};	
			
			return actBy()
			.step(function(){
				vp0();
				actions.customFilter(1, '>', '10');
			}).step(function(){
				vp1();
				actions.customFilter(1, '>=', '10');
			}).step(function(){
			    vp2();
			    actions.customFilter(1, '<', '10');
			}).step(function(){
				vp3();
				actions.customFilter(1, '<=', '10');
			}).step(function(){
				vp4();
				actions.clearFilter(1);
			}).step(function(){
				vp0();
				actions.customFilter(16, '>', '8');
			}).step(function(){
				vp5();
				actions.customFilter(14, '<', '0.05'); 
			}).step(function(){
				vp6();
				actions.undo();
			}).step(function(){
				vp5();
				actions.customFilter(18, '>=', '5%'); 
			}).step(function(){
				vp7();
				actions.customFilter(12, '<=', '*'); 
			}).step(function(){
				vp8();
				actions.undo().undo().undo();
			}).step(function(){
				vp0();
				actions.customFilter(5, '<', 'd', '>', 'b', 'and'); 
			}).step(function(){
				vp9();
				actions.customFilter(8, '>', '0', '>', 'VV', 'or'); 
			}).step(function(){
				vp10();
				actions.removeFilter();
			}).end();
		});

		it.asyncly('can apply two criteria to one column', function() {
			var vp0 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled();
				_checkFilteredRows({s: 1, e: 17});	
			};
			
			var vp1 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([11]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 5, 6, 9, 12, 13, 16]});	
			};
			
			var vp2 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([11]);
				_checkFilteredRows({s: 1, e: 17, v: true, c: [2, 4, 7, 8, 10, 14, 15]});	
			};
			
			var vp3 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([5, 11]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 5, 6, 9, 12, 13]});	
			};
			
			var vp4 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled([3, 5, 11]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 5, 9, 12]});	
			};
			
			var vp5 = function(){
				expect.model().filterAt('A1:T17');
				expect.ui().filter().toBeOfCount(20).toBeAt(1, 1, 20).toBeEnabled([4, 10]);
				_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 5, 6, 9, 12, 13]});	
			};
			
			var vp6 = function(){
				expect.model().filterAt();
				expect.ui().filter().toBeOfCount(0);
				_checkFilteredRows({s: 1, e: 17});		
			};
			
			return actBy()
			 .step(function(){
				actions.switchSheet('Sheet1').focus('A:U').createFilter();
			 }).step(function(){
				vp0();
				actions.customFilter(12, '>', '0', '<', '30000', 'and');
			 }).step(function(){
				vp1();
				actions.customFilter(12, '>', '0', '<', '30000', 'or'); //number
			 }).step(function(){
				vp2();
				actions.undo();
			 }).step(function(){
				vp1();
				actions.customFilter(6, '=', 'KEYSTONE', null, '*NA*', 'or');
			 }).step(function(){
				vp3();
				actions.customFilter(4, null, 'r*', null, '*a', 'and');
			 }).step(function(){
				vp4();
				actions.focus('D:D').deleteColumns();
			 }).step(function(){
				vp5();
				actions.undo();
			 }).step(function(){
				vp4();
				actions.removeFilter();
			 }).step(function(){
				vp6();
				actions.undo();
			 }).step(function(){
				vp4();
				actions.redo();
			 }).end();
		});	
		
		describe('Text', function() {
			var vp0 = function(){
				commonVP();
				expect.ui().filter().toBeEnabled();
				_checkFilteredRows({s: 1, e: 17});	
			};
			
			it.asyncly('should ignore numbers', function() {
			
				var vp1 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 10, 11, 14]});	
				};
				
				var vp2 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 2, 11, 12]});	
				};
				
				var vp3 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 11, 17]});	
				};
				
				var vp4 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([7]);
					_checkFilteredRows({s: 1, e: 17, c: [10, 11, 14]});	
				};
				
				var vp5 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([7]);
					_checkFilteredRows({s: 1, e: 17, c: [2, 11, 12]});	
				};
				
				var vp6 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([7]);
					_checkFilteredRows({s: 1, e: 17, c: [11, 17]});
				};
				
				return actBy()
				.step(function(){
					actions.focus('A:U').createFilter();
				}).step(function(){
					vp0();
					actions.customFilter(8, null, '*8'); 
				}).step(function(){
					vp1();
					actions.customFilter(8, null, '*9*'); 
				}).step(function(){
					vp2();
					actions.customFilter(8, null, '$*'); 
				}).step(function(){
					vp3();
					actions.customFilter(8, '!=', '*8'); 
				}).step(function(){
					vp4();
					actions.customFilter(8, '!=', '*9*'); 
				}).step(function(){
					vp5();
					actions.customFilter(8, '!=', '$*'); 
				}).step(function(){
					vp6();
					actions.clearFilter(8);
				}).end();
			});
			
			it.asyncly('should be case insensitive', function() {						
				var vp1 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([2]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 4, 10, 14, 16]});	
				};
				
				var vp2 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([2]);
					_checkFilteredRows({s: 1, e: 17, c: [ 4, 10, 14, 16]});	
				};
				
				var vp3 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([2]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 4, 8 , 10, 14, 16]});	
				};
				
				var vp4 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([2]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 8]});	
				};				
				
				return actBy()
				.step(function(){
					vp0();
					actions.keywordFilter(3, 'set', ['battambang']); 
				}).step(function(){
					vp1();
					actions.customFilter(3, '!=', 'BattamBang');
				}).step(function(){
					vp2();
					actions.customFilter(3, null, 'BATTAMBANG'); 
				}).step(function(){
					vp1();
					actions.customFilter(3, null, 'Battam*'); 
				}).step(function(){
					vp3();
					actions.customFilter(3, null, '*Bang'); 
				}).step(function(){
					vp3();
					actions.customFilter(3, null, '*BATTAMBANG*'); 
				}).step(function(){
					vp1();
					actions.customFilter(3, null, '*battam bang*'); 
				}).step(function(){
					vp4();
					actions.clearFilter(3); 
				}).end();
			});
			
			
			it.asyncly('should accept wildcards', function() {
				var vp1 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 2, 9, 10, 13]});	
				};
				
				var vp2 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 9, 10, 13]});	
				};
				
				var vp3 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 10, 13]});	
				};
				
				var vp4 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1]});	
				};	
				
				var vp5 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6]);
					_checkFilteredRows({s: 1, e: 17, c: [6, 13]});	
				};	
				
				var vp6 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6, 7]);
					_checkFilteredRows({s: 1, e: 17, c: [4, 6, 8, 13]});	
				};	
				
				var vp7 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6, 7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 15, 16]});	
				};	
				
				var vp8 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6, 7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 3, 5, 10]});	
				};	
				
				var vp9 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6, 7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 3, 10]});	
				};
				
				var vp10 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6, 7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 3, 5]});	
				};
				
				var vp11 = function(){
					commonVP();
					expect.ui().filter().toBeEnabled([6, 7]);
					_checkFilteredRows({s: 1, e: 17, v: false, c: [1, 15, 16]});	
				};
				
				return actBy()
				.step(function(){
					vp0();
					actions.customFilter(7, null, '*CO*'); 
				}).step(function(){
					vp1();
					actions.customFilter(7, null, '*CO*D*');
				}).step(function(){
					vp2();
					actions.customFilter(7, null, '*CO?D*'); 
				}).step(function(){
					vp3();
					actions.customFilter(7, null, '*CO??D*'); 
				}).step(function(){
					vp4();
					actions.customFilter(7, null, '*CO???*'); 
				}).step(function(){
					vp1();
					actions.customFilter(7, '!=', 'B???? ?*');
				}).step(function(){
					vp5();
					actions.customFilter(8, null, '*?*');
				}).step(function(){
					vp6();
					actions.customFilter(8, null, '*~?*');
				}).step(function(){
					vp7();
					actions.customFilter(8, null, '*~**');
				}).step(function(){
					vp8();
					actions.customFilter(8, null, '*~*~**');
				}).step(function(){
					vp9();
					actions.customFilter(8, null, '*~*');
				}).step(function(){
					vp10();
					actions.customFilter(8, null, '~?*', null, '*~?', 'or');
				}).step(function(){
					vp11();
					actions.clearFilter(7).clearFilter(8);
				}).end();
			});				
		});		
		
	});	
});
