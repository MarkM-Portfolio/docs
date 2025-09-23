dojo.provide("websheet.view.ViewFilterHandler");

dojo.require("websheet.sort.Sorter");

dojo.declare('websheet.view.ViewFilterHandler', null, {

    _sheetId: null,
    _filterMenu:null,
    _menuIsLoaded: false,
    _filterColIndex: null,
    _filterData:null,
    _rangeRows:null,
    
    // TODO NLS?
    STR_OK_LABEL: 'OK',    
	STR_CANCEL_LABEL : 'Cancel',
	STR_EMPTY_STRING: '(Empty)',
    STR_SortDescending: 'Sort Descending',
    STR_SortAscending: 'Sort Ascending',
    STR_FILTER:'Filter:',
    STR_SELECT_ALL:'Select All',
    STR_DESELECT_ALL:'Clear',

	constructor: function(sheetId){
        this._sheetId = sheetId;
        this.base = pe.base;
        var content = dojo.byId("sheetContainer");//dojo.body();pane-st3
//        this._filterMenu = new websheet.widget.FilterContextMenu(this, content, 0);
        this._sorter = websheet.sort.Sorter;
		var sortArgs = {
				withHeader: false, 
				rules: [{
					isAscend: true, 
					sortByIndex: 0
				}]
		};
		this._sortData = {criterion: sortArgs};
		this._filterColIndex = g_filterColumnIndex;
		this._rangeRows = dojo.query("td.isFilterColumn", dojo.byId("grid-" + this._sheetId));
	},
	
	prepareContextMenu:function(){
		
		if(this._menuIsLoaded){ //has been load data, don't load again until data are changed.
			return;
		}
		this._filterData = this.prepareFilterKeywordList();
		var filterKeywords = this._filterData.keywords;
		var preFilteredItems = this.getFilteredRows();
		//fill the list to context ment
		
		this._fillContextMenu(filterKeywords, preFilteredItems);
		
	},
	
	_fillContextMenu:function(filterKeywords, preFilteredItems){
		this._menuIsLoaded = true;
		if(this._filterMenu){
			this._filterMenu.update(filterKeywords, preFilteredItems);
		}
	},
	
	apply:function(selection)
	{
		//construct the filter criteria according to user selection from context menu UI
		var filterKeywords = this._filterData.keywords;
		//prepared base value for filtering
		var selLen = filterKeywords.length;
		var filteredRowIndexes = [];
		for (var i=0; i<selLen; i++)
		{  
		    //in this case, the length of selection and keywords are same.
		    var index = selection[i];
		    var value = filterKeywords[i].value;
		      
		    if((index == undefined))
		    {
	            var rowids = filterKeywords[i].rowids;
	            if (rowids)
	            {
	                var len = rowids.length;
    	            for (var j=0; j<len; j++)
    	            {
    	                filteredRowIndexes.push(rowids[j]);
    	            }
	            }
		    }
		}

		filteredRowIndexes.sort(function(a,b){return a-b});
		var preFilteredItems = this.getFilteredRows();
		
		//filter row  		
        this.filterRows(filteredRowIndexes);   
	},
	
	/**
	 * Filter rows
	 * Sheetname:
	 * rowIndexArray:
	 * reserved: true: unfilter row, false or undefined: filter row
	 * rangeInfo: if has, calculate the rows from range
	 * rowModels: if has, use it directly.
	 */	
	filterRows: function(rowIndexArray){		
		
		var indexLen = rowIndexArray.length;
		var indexMap = {};
		for ( var i = 0; i < indexLen; i++) {
			var rowIndex = rowIndexArray[i];
			indexMap[rowIndex] = rowIndex;
		}
    	var sheetId = this._sheetId;
    	var filterRowsData = dojo.query("tr", dojo.byId("grid-" + sheetId));
    	if(!filterRowsData) return null;
		
		var rowLen = filterRowsData.length;
		for (var i=1; i< rowLen; i++){
			var row = filterRowsData[i];
			
			if(row != null)
			{
				if(indexMap[i+1] != null){
			    	dojo.addClass(row, "filtered");
			    }
				else{
				dojo.removeClass(row, "filtered");
				}
		   }
		}
	},

	cancel: function(){
//		   this._menuIsLoaded = false;  //load data again at next time when show menu. 
		},
		
	getSheetId: function() {
    	var sheetId = this._sheetId;
    	return sheetId;
    },
	
	getFilteredRows: function(){
	    var filteredRowIndexes=new Array();

		var rangeRows = this._rangeRows;
		if(!rangeRows) return null;
		
		var rowLen = rangeRows.length;
		for (var i=1; i< rowLen; i++){
		    if (rangeRows[i] && (rangeRows[i].parentNode.className == "filtered")){
		        filteredRowIndexes.push(i+1);
		    }
		}	   
       	return filteredRowIndexes;  	
    },
	
	prepareFilterKeywordList: function(){
		//sort the range data with pre-defined criterion.
		var sortResults = null;
		var sortData = this._sortData;
	    var sortCols = {};
		var filterData = {};
		var sortRows = this.getSortDataValue();
		sortCols.sortRows = sortRows;
		sortCols.lockedRows = [];
		if (sortRows == null || sortRows.length == 0)
		{
			sortResults = [];
		}
		else
		{
			sortResults = this._sorter.sort(sortCols, sortData.criterion, true);
		}
		sortData.sortresults = sortResults;
		var emptyRowids = [];
		var filterKeywords = [];
		var j=-1;
		var svMap = {}; // map with unique show value
		for (var i=0; i<sortResults.length; i++)
		{
			var value = sortResults[i].data;			
			var index = sortResults[i].oldIndex;
			var cell = sortRows[0][index-1]; //sortCell's index = sortResult's oldindex -1
			if(cell && cell.displayV != null){
				value = cell.displayV; //get the v with style
			}
			index = index  + 1;  //is id or index?? 0-based
			if (value === "")
			{
			    emptyRowids.push(index);
			}
			else
			{
			    var jj = svMap[value];
    			if(jj==null)
    			{
    			    svMap[value] = ++j;
    				filterKeywords[j] = {};
    				filterKeywords[j].rowids = [];
    				filterKeywords[j].value = value;
    				filterKeywords[j].rowids.push(index);
    			}
    			else
    			{
    			    filterKeywords[jj].rowids.push(index);    //put id into.
    			}
			} 		    		                  
		}
        
        if (sortRows[0])
        {
			for(var i=sortRows[0].length; i<this._filterRowsLength-1; i++)
			{
			    emptyRowids.push(i+1);
			}
        }
		
        j++;
		filterKeywords[j] = {};   //empty rows in last
		filterKeywords[j].rowids = emptyRowids;
		filterKeywords[j].value = "";		
		
		filterData.keywords = filterKeywords;
		return 	filterData;
	},
	
	getSortDataValue: function(){ 
		var sheetId = this._sheetId;
		var rangeRows = this._rangeRows;
		var length = rangeRows.length;
		this._filterRowsLength = length;
		var sortRows = [];
		if(!sortRows[0]) 
		    sortRows[0] = [];
		for (var i = 1; i < length; i++)
		{
			var fCell = rangeRows[i];
			var rawValue;
			if (fCell == null){
			    sortRows[0].push({value: null, index: i});
			    continue;
			}
			if(dojo.isIE){
				rawValue = fCell.innerText;
			}else{
				rawValue = fCell.textContent;
			}
			if(dojo.hasClass(fCell.parentNode,"hidden")){
				continue;
			}
		    if(websheet.Helper.isNumeric(rawValue)){
		    	rawValue = parseFloat(rawValue);
		    }
			var value = rawValue;
			if(typeof value == "string")
			{
			   if(value.length==0)
                   value = null;
			   else
			   {
			       value = this._trimSpace(value);
			   }
			}
			var v = dojo.attr(fCell, "v");
			if(v != null){
				if(websheet.Helper.isNumeric(v)){
			    	v = parseFloat(v);
			    }
				sortRows[0].push({value: v, index: i, displayV: value});
			}else{
				sortRows[0].push({value: value, index: i});	
			}
		}
		//}
		return sortRows;
	},
	
	_trimSpace: function(value)
	{
	    var ret = value;
	    if(value[0]===" " || value[value.length-1]===" ")
        {
            //Ignore all the spaces at the begin and the end of the string
	        ret = value.replace(this._trimSpaceReg,"");
            //"" will be treated as empty string
            if(ret.length==0)
                ret = null;
        }
	    return ret;
	},
	showContextMenu:function(pos){
		if(this._filterMenu){
			this._filterMenu.updatePosition(pos);
			this._filterMenu.show();
		}
	},
	
	hideContextMenu: function(){
		if(this._filterMenu){
			this._filterMenu.hide();
		}			
	}
 
	
});	
