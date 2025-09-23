/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.sort.Sorter");
dojo.require("concord.i18n.Collation");

websheet.sort.Sorter = {	
	//sortCols:
	//Structure of sortArgs, {withHeader:, isAscend:, sortById:([]), 
	//comparators:([]class string), caseSensitive:(Not Support Now)}
	//Return a object {[old index],[new index]}
	//directlyReturnData: need the data instead of index, for view filter operation. 
	sort: function(sortCols, sortArgs, directlyReturnData) {
		this.withHeader = sortArgs.withHeader;
		this.headerLocked = this.withHeader && (sortCols.lockedRows && sortCols.lockedRows[0] === 0);
		if (directlyReturnData) {
			// filter sort
			return this._sortWithData(sortCols.sortRows[0], sortArgs.rules[0].isAscend);
		} else {
			// sort with the first rule
			var rules = sortArgs.rules;
			var rule = rules[0];
			var bAscend = rule.isAscend;
			var dataStore = sortCols.sortRows[rule.sortByIdx];
			var lockedRows = sortCols.lockedRows;
			var firstDataResult = this._sortWithData(dataStore, bAscend);
			// then sort by the following rules
			var sortDataResultChain = [firstDataResult];
			for (var index = 1, length = rules.length, previousDataResult = firstDataResult; index < length; index ++) {
				rule = rules[index];
				bAscend = rule.isAscend;
				var sortDataStore = sortCols.sortRows[rule.sortByIdx];
				var lockedDataStore = lockedRows[rule.sortByIdx];
				var thenSortByDataResult = this._thenSortWithData(previousDataResult, this._getSortDataStoreForAdditionalSort(sortDataStore, lockedDataStore), bAscend);
				sortDataResultChain.push(thenSortByDataResult);
				previousDataResult = thenSortByDataResult;
			}
			// combine the data result chain into one single result
			var rulesChainLength = sortDataResultChain.length;
			var finalDataResult = sortDataResultChain[rulesChainLength - 1], previous;
			for (var length = sortDataResultChain.length, index = length - 1; index > 0; index --) {
				finalDataResult = sortDataResultChain[index];
				previous = sortDataResultChain[index - 1];
				finalDataResult = this._mergeResultChain(previous, finalDataResult);
			}
			// convert mixed data result into index result;
			var sortIndexResult = this._generateSortIndexResult(finalDataResult);
			if (sortIndexResult) {
				var finalIndexResult = this._mergeLockedItemsWithSortIndexResult(sortIndexResult, sortCols.lockedRows[0]);
				return finalIndexResult;
			} else {
				// no change;
				return null;
			}
		}
	},
	
	/*SortData*/_getSortDataStoreForAdditionalSort: function (sortRows, lockedRows) {
		// summary:
		//		Combine two arrays into one
		if (lockedRows && lockedRows.length > 0) {
			for (var idx = 0, len = lockedRows.length, lockedIndex; idx < len; idx ++) {
				lockedIndex = lockedRows[idx];
				sortRows.splice(lockedIndex, 0, null);
			}
		}
		return sortRows;
	},
	
	/*MixedSortDataResult*/_mergeResultChain: function (first, then) {
		// summary:
		//		Merge the 'firstSortBy' result with the 'thenSortBy' result;
		//		Merge the result in 'then' into 'first' and then return 'first'.
		var 
			i = 0, 
			length = first.length,
			current_item, 
			previous_item,
			previous_index = 0, 
			count, 
			then_index = 0, 
			then_length = then.length;
		while (i < length) {
			current_item = first[i];
			if (previous_item && (current_item.data === previous_item.data || (current_item.err && previous_item.err)) && !previous_item.itemEdge) {
				// just continue iteration, try to find the first different item; 
			} else {
				if (previous_item) {
					// index confirmed, calculate the count (items need to be merged)
					count = i - previous_index;
					if (count > 1 && then_index + count <= then_length) {
						// merge 'then' to 'first'
						Array.prototype.splice.apply(first, [previous_index, count].concat(then.slice(then_index, then_index += count)));
					}
				}
				previous_item = current_item;
				previous_index = i;
			}
			i = i + 1;
		}
		if (current_item && previous_item && (current_item.data === previous_item.data || (current_item.err && previous_item.err)) && previous_index < length - 1) {
			// tail merge, out of iteration
			count = length - previous_index;
			if (then_index + count <= then_length) {
				Array.prototype.splice.apply(first, [previous_index, count].concat(then.slice(then_index, then_index += count)));
			}
		}
		return first;
	},
	
	/*SortDataResult*/_thenSortWithData: function (dataResult, nextdataStore, bAscend) {
		// summary:
		//		1. Gather data from the previous data result, find those items with same value (need to sort by another column for these items)
		//		2. Generate a new 'sort data store' with the indexes of the items gathered in step 1
		//		3. Sort with the data store generated in the step 2
		//		4. Repeat Step 1~3, and finally combine the data results in to one single array and then return.
		var 
			i = 0,
			length = dataResult.length,
			items = [],
			additionalDataResult = [],
			current,
			previous,
			offset = this.withHeader ? 1:0;
		while (i < length) {
			current = dataResult[i];
			if (previous && (current.data === previous.data || (current.err && previous.err)) && !previous.itemEdge) {
				items.push(nextdataStore[current.oldIndex + offset]);
			} else {
				if (items.length > 1) {
					var result = this._sortWithData(items, bAscend, true);
					result[result.length - 1].itemEdge = true;
					additionalDataResult = additionalDataResult.concat(result);
					items = [nextdataStore[current.oldIndex + offset]];
				} else if (items.length == 0) {
					items.push(nextdataStore[current.oldIndex + offset]);
				} else {
					items[0] = nextdataStore[current.oldIndex + offset];
				}
			}
			previous = current;
			i = i + 1;
		}
		if (items.length > 1) {
			var result = this._sortWithData(items, bAscend, true);
			result[result.length - 1].itemEdge = true;
			additionalDataResult = additionalDataResult.concat(result);
		}
		return additionalDataResult;
	},
	
	/*SortDataResult*/_sortWithData: function (/*Array*/data, /*boolean*/bAscend, /*boolean*/ignoreOffset) {
		// summary:
		//		Given the sort data, sort them with rule indicated with 'bAscend'
		//		sort data structure: {
		//			value : 'hello',
		//			index : 0
		//		}
		// data:
		//		Array of sort data with the same structure described above.
		// ignoreOffset:
		//		Additional sort in multi-col sort will construct a data store that does not contain 'header' element, 
		var sortRows = data;
		var sortResults = [];
		var sortResults = [];
		var offset = this.withHeader ? 1 : 0;
		
		//Number and string will be sorted separately.
		var stringItems = [];
		var numberItems = [];
		var nullItems = [];
		var errorItems = [];
		var boolItems = [];
		for (var i = ignoreOffset ? 0 : (this.withHeader && !this.headerLocked ? 1 : 0), srlength = sortRows.length; i < srlength; i++) {
		    var row = sortRows[i];
		    if (row) {
		    	var v = row.value;
		    	var item = {data: v, index: row.index};
		    	var vtype = typeof v;
		    	if (row.error) {
		    		errorItems.push(item); 
		    	} else if (v == null) {
		    		nullItems.push(row.index);
		    	} else if (vtype == "string") {
		    		stringItems.push(item);                    
		    	} else if (vtype == "boolean") {
		    		boolItems.push(item);
		    	} else if (vtype == "number") {
		    		numberItems.push(item);
		    	}
		    }
		}
		if (numberItems.length > 1) {
		    if(bAscend) {
		    	numberItems.sort(this._numberCompare);
		    } else {
		    	numberItems.sort(this._numberCompare_desc);
		    }
		}
		if (stringItems.length > 1) {
			stringItems = this._sortStringArray(stringItems,bAscend);
		}
		
		if (boolItems.length > 1) {
			if (bAscend) {
				boolItems.sort(function(v1,v2){return v1.data - v2.data;});
			} else {
				boolItems.sort(function(v1,v2){return v2.data - v1.data;});
			}
		}
		//String is always bigger than number
		if (bAscend) {
		    var n = 0, items = numberItems.length;
	        for (; n < items; n++) {
	        	var item = numberItems[n];
	        	sortResults.push({data: item.data, oldIndex: item.index - offset});
	        }
	        n = 0, items = stringItems.length;
	        for (; n < items; n++) {
	        	var item = stringItems[n];
                sortResults.push({data: item.data, oldIndex: item.index - offset});
            }
            n = 0, items = boolItems.length;
            for (; n < items; n++) {
            	var item = boolItems[n];
            	sortResults.push({data: item.data, oldIndex: item.index- offset});
            }
            n = 0, items = errorItems.length;
            for (; n < items; n++) {
                var item = errorItems[n];
                sortResults.push({data: item.data, oldIndex: item.index - offset, err: true});
            }
	    } else {
		    var n = 0, items = errorItems.length;
		    for (; n < items; n++) {
                var item = errorItems[n];
                sortResults.push({data: item.data, oldIndex: item.index - offset, err: true});
            }
		    n = 0, items = boolItems.length;
		    for (; n < items; n++) {
            	var item = boolItems[n];
            	sortResults.push({data: item.data, oldIndex: item.index - offset});
            }
		    n = 0, items = stringItems.length;
		    for (; n < items; n++) {
                var item = stringItems[n];
                sortResults.push({data: item.data, oldIndex: item.index - offset});
            }
		    n = 0, items = numberItems.length;
		    for (; n < items; n++) {
                var item = numberItems[n];
                sortResults.push({data: item.data, oldIndex: item.index - offset});
            }
		}
		//Empty value is always put at the end
		n = 0, items = nullItems.length;
		for (; n < items; n++) {
			sortResults.push({data: "", oldIndex: nullItems[n] - offset});
		}
		return sortResults;
	},
	
	/*SortIndexResult*/_generateSortIndexResult: function (sortDataResult) {
		// summary:
		//		Return an array of integers, we called sort index result here.
		//		The integers are the old index of the sort data.
		//		Extract the index result from the 'sort data result'.
		var sortIndexResults = [];
		if (this.withHeader) {
			sortIndexResults[0] = 0;
			for (var i = 0, length = sortDataResult.length; i < length; i++) {
				sortIndexResults[i+1] = sortDataResult[i].oldIndex + 1;
			}
		} else {
			for (i = 0, length = sortDataResult.length; i < length; i++) {
				sortIndexResults[i] = sortDataResult[i].oldIndex;
			}
		}
		
		var sortLength = sortIndexResults.length;
		var isSort = false;
		for (var i = 0; i < sortLength; i++) {
			if (i != sortIndexResults[i]) {
				isSort = true;
				break;
			}
		}
		if (!isSort) {
			return null;
		} else {
			return sortIndexResults;
		}
	},
	
	/*SortIndexResult*/_mergeLockedItemsWithSortIndexResult: function (sortIndexResult, lockedItems) {
		// summary:
		//		Locked (invisible) rows are not engaged in sort, merge the locked items back to sort index result array.
		//		This should be the final step, since the return value will be used to set range and send to other clients;
		var results = [];
		var lockedLength = lockedItems.length;
		var sortResultLength = sortIndexResult.length;
		var i = 0, j = 0, delta = 0, count = 0, delta = 0, locked = -1;
		do {
		    if (count < lockedLength) {
		        locked = lockedItems[count++]; //get the invisilbe row index
		    } else {
		        locked = -1;
		    }
            for (j=i; j < (locked - delta); j++) {
                results.push(sortIndexResult[j]);   //put the sorted row indexes which before invisible row
            }		
            	    
            if (locked >= 0) {
                results.push(locked);   //put the invisible row index
                i = locked - delta;
                delta++;
                if (this.headerLocked) {
                	sortIndexResult.splice(0, 1);
                }
            } else {
                results.push(sortIndexResult[i]);   //put the leave sorted rows
                i++;
            }    			    		       
		} while (i < sortResultLength);

		return results;	
	},
	
	_numberCompare: function(v1,v2)
	{
	    return v1.data - v2.data;
	},
	
	_numberCompare_desc: function(v1,v2)
    {
        return v2.data - v1.data;
    },
	
	_stringCompare: function(v1,v2)
	{
		var editor = websheet.model.ModelHelper.getEditor();
	    var lang = editor.scene.getLocale();	    
        if(lang.indexOf('de') >=0)
            return concord.i18n.Collation.compare_de(v1.data, v2.data);
        
        return v1.data.localeCompare(v2.data); 
           
	},
	
	_stringCompare_desc: function(v1,v2)
    {
		var editor = websheet.model.ModelHelper.getEditor();
        var lang = editor.scene.getLocale();        
        if(lang.indexOf('de') >=0)
            return concord.i18n.Collation.compare_de(v2.data, v1.data);
        
        return v2.data.localeCompare(v1.data);            
    },
	
	_serverCompare: function(stringItems,bAsc)
	{
	    var items = {};
	    for(var i=0;i<stringItems.length;i++)
	    {
	        items[i] = stringItems[i].data;
	    }
	    if(bAsc==null)
	        bAsc = true;
	    var editor = websheet.model.ModelHelper.getEditor();
        var sortData = {data : items,lang: editor.scene.getLocale(),bAscending: bAsc};
        var ret = [];
        var request = 
        {                   
            url: contextPath + "/api/sort",
            handleAs: "json",
            handle: function(r, io)
            { 
                if(r!=null && r.items.length>0)
                {
                    for(var i=0;i<r.items.length;i++)
                    {
                        var idx = parseInt(r.items[i]);
                        var item = stringItems[idx];
                        var node = dojo.mixin({},item);
                        ret.push(node);
                    }
                }
            },                      
            sync: true, 
            contentType: "text/plain",
            postData: dojo.toJson(sortData)
        };
        dojo.xhrPost(request);
        return ret;
	},
	
	_sortStringArray: function(stringItems,bAsc,useICU)
	{
        //Now all the string sort will be use ICU on server side
		var editor = websheet.model.ModelHelper.getEditor();
	    if(useICU!=false && !editor.scene.isHTMLViewMode())
            return this._serverCompare(stringItems,bAsc);
	    
	    if(bAsc)
	        stringItems.sort(this._stringCompare); 
	    else
	        stringItems.sort(this._stringCompare_desc);
        return stringItems;
	}
};