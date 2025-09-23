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

dojo.provide("concord.widgets.smartTable");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","smartTable");

dojo.declare("concord.widgets.smartTable", null, {
	
	
	smartTableIds: new Array(),
	smartTableData: new Array(),
	instanceVariableName: null,
	customizeSTDialog: null,
	
	// The variable name of the instance of this class needs to be stored because 
	// the row styler needs to call a row styling function that is part of this class.
	// The call is made from the exhibit so it needs a global variable name 
	constructor: function(variableName)
	{
		this.instanceVariableName = variableName;
	},
	
	closeDialog: function()
	{
		dijit.byId('showHideColTableDialog').hide();
	},

	// this row styler is called when a table is created as well as when the table is 
	// sorted. It adds the header row class name as well as the alternate row class names
	rowStyler: function(item, database, tr) 
	{
		
		if (tr.rowIndex == 1)
			tr.previousSibling.className = 'tableHeaderRow';
		
		if (tr.rowIndex % 2) 
			tr.className = 'alternateRow';
	},
	
	initFacetsForTables: function(id, currFacets, headerNames)
	{
		var colNames = new Array();
		
		for (var i = 0; i < headerNames.length; i++)
		{
			colNames[headerNames[i].name] = headerNames[i].label; 
		}
		
	   for (var i = 0; i < currFacets.length; i++)
	   {
	      var valType = window.database.getProperty(currFacets[i]).getValueType();
	      if (valType == "number" || valType.indexOf("currency") >= 0)
	      {
	      	 var min = window.database.getProperty(currFacets[i]).getRangeIndex().getMin();
	      	 var max = window.database.getProperty(currFacets[i]).getRangeIndex().getMax();
	      	 var interval = Math.round((max-min)/6);
	      	 var intervalStr = (interval + "");
	      	 var roundedInterval = (parseInt((intervalStr).charAt(0))+1) + "";
			  													      	 
	      	 for (var x=0; x< intervalStr.length - 1; x++)
	      		 roundedInterval = roundedInterval + "0";

	      	 roundedInterval = parseInt(roundedInterval);
		      	 
	         var facetNode = document.createElement("div");
	         facetNode.setAttribute("ex:role","facet");
	         facetNode.setAttribute("ex:collectionID",id + "Collection");
	         facetNode.setAttribute("ex:facetClass","NumericRange");
	         facetNode.setAttribute("ex:expression","." + currFacets[i]);
	         facetNode.setAttribute("ex:interval",roundedInterval);
	         facetNode.setAttribute("ex:facetLabel",colNames[currFacets[i]]);
	         facetNode.setAttribute("id",currFacets[i]+"Facet");
	         dojo.byId(id + "FacetsContainer").appendChild(facetNode);
	         window.exhibit.configureFromDOM(dojo.byId(currFacets[i]+"Facet"));
	      }
	      else
	      {
	         var facetNode = document.createElement("div");
	         facetNode.setAttribute("ex:role","facet");
	         facetNode.setAttribute("ex:collectionID",id + "Collection");
	         facetNode.setAttribute("ex:expression","." + currFacets[i]);
	         facetNode.setAttribute("ex:facetLabel",colNames[currFacets[i]]);
	         facetNode.setAttribute("id",currFacets[i]+"Facet");
	         dojo.byId(id + "FacetsContainer").appendChild(facetNode);     
	         window.exhibit.configureFromDOM(dojo.byId(currFacets[i]+"Facet"));
	      }
	   }
	},
	
	showColsFacets: function(tableTag, id, headerNames, currFacets)
	{
		// variables to keep track of what columns and facets the user wants to use
		var dataColsNames = "";
		//used to be blank but blank conflicted with  blank column names.
		//Adding a random string which will be probably never be used as a column name
		var dataColLabels = "sjfjklashfjkash387468346skjdhfksdfh3845375ksdhfkifh3846386";  
		var dataColFormats = "";
		var facetsToCreate = new Array();
		var facetsToRemove = new Array();
		var tableColProperties = this.smartTableData[id].data.properties;
	
		// for each column in the table check to see if it needs to be
		// shown or if a facet needs to be shown
		for (var i = 0; i < headerNames.length; i++)
		{
			
		   if (headerNames[i].name != 'uri')
		   {
		      var chkBoxID = headerNames[i].name + "CkBox";
		      var facetChkBoxID = headerNames[i].name + "FacetCkBox";
	
		      // generate a list of columns that need to be shown
		      if (dojo.byId(chkBoxID).checked)
		      {  
		         if (dataColsNames == "")
		            dataColsNames = "." + dojo.byId(chkBoxID).value;
		         else
		            dataColsNames += ", ." + dojo.byId(chkBoxID).value;
		            										         
		         if (dataColFormats == "")
	         	{
					   if (tableColProperties[headerNames[i].name].valueType)
					   	dataColFormats += tableColProperties[headerNames[i].name].valueType;
					   else
					   	dataColFormats += "list";
	         	}
		         else
	            {
					   if (tableColProperties[headerNames[i].name].valueType)
					   	dataColFormats += ", " + tableColProperties[headerNames[i].name].valueType;
					   else
					   	dataColFormats += ", " + "list";	         	
	            }												
		      }  
		
		      // generate a list of facets that need to be shown.
		      // if a facet was shown before and now needs to be
		      // removed add it to the list of facets to be removed.
		      if (dojo.byId(facetChkBoxID).checked)
		      {
		         var facetName = dojo.byId(facetChkBoxID).value;
		         var existingFacet = false;
		         for (var j = 0; j < currFacets.length; j++)
		         {
		            if (facetName == currFacets[j])
		            {
		               existingFacet = true;
		               break;
		            }
		         }
		         
		         if (!existingFacet)
		            facetsToCreate.push(dojo.byId(facetChkBoxID).value);
		      }
		      else
		      {
		         var facetName = dojo.byId(facetChkBoxID).value;
		         var existingFacet = false;
		
		         for (var j = 0; j < currFacets.length; j++)
		         {
		            if (facetName == currFacets[j])
		            {
		               existingFacet = true;
		               break;
		            }
		         }
		         
		         if (existingFacet)
		            facetsToRemove.push(dojo.byId(facetChkBoxID).value);
		         
		      }
		   }
		}		
		
		if(dataColsNames == "")
		{
			var errorDiv = document.getElementById('dlgErrorDiv');
			
			if(!errorDiv)
			{			
				var dlgTBody = document.getElementById('dialogTbody');
				var tableTag = dlgTBody.parentNode;
				
				errorDiv = document.createElement('div');
					errorDiv.innerHTML = dojo.i18n.getLocalization("concord.widgets","smartTable").displayPrompt; 
					errorDiv.style.fontSize = "12px";
					errorDiv.style.color = "#ff3300";
					errorDiv.id = "dlgErrorDiv";
				tableTag.parentNode.insertBefore(errorDiv, tableTag)
			}				
		}
		else
		{
		   var tempColNames = dataColsNames.split(',')
		   
			// regenerate exhibit code to reflect changes made
			// by the user.		
			Exhibit.UI.showBusyIndicator();
	
		   
		   for(var n=0; n<tempColNames.length; n++)
		   	tempColNames[n] = tempColNames[n].substring(tempColNames[n].indexOf('.')+1);
	
		   for (var x=0; x<tempColNames.length; x++)
		   {
				for (var y=0; y<headerNames.length; y++)
				{
					if (tempColNames[x] == headerNames[y].name)
					{			
						if (dataColLabels == "sjfjklashfjkash387468346skjdhfksdfh3845375ksdhfkifh3846386")
							dataColLabels = headerNames[y].label;
						else
							dataColLabels = dataColLabels + ", " + headerNames[y].label;
	
						break;
					}
				}
		   }
		   
		   if (dataColLabels == "sjfjklashfjkash387468346skjdhfksdfh3845375ksdhfkifh3846386")
		   	dataColLabels = "";
		   
		   tableTag.setAttribute("ex:columns", dataColsNames);
		   tableTag.setAttribute("ex:columnLabels", dataColLabels);
		   tableTag.setAttribute("ex:columnFormats", dataColFormats);
		  
		   // run exhibit to generate the table
		   window.exhibit.configureFromDOM(tableTag.parentNode);
		   
		   // based on the list of facets to be shown and removed
		   // generate appropriate exhibit code and then run exhibit
		   // on the facet dom to generate facets
		   for (var i = 0; i < facetsToRemove.length; i++)
		   {
		      window.exhibit.disposeComponent(facetsToRemove[i]);
		      var facetNode = dojo.byId(facetsToRemove[i]+"Facet");
		      facetNode.parentNode.removeChild(facetNode);
		      
		      var delIndex = -1;
		      
		      for (var j = 0; j < currFacets.length; j++)
		         if(currFacets[j] == facetsToRemove[i])
		            delIndex = j;
		      
		      if (delIndex > -1)
		         currFacets.splice(delIndex, 1);
		   }
		   
		   for (var i = 0; i < facetsToCreate.length; i++)
		   {
		      currFacets.push(facetsToCreate[i])
		   }
		
		   
		   for (var i = 0; i < currFacets.length; i++)
		   {
		      if(dojo.byId(currFacets[i]+"Facet"))
		      {
		         window.exhibit.disposeComponent(currFacets[i]);
		         var tempNode = dojo.byId(currFacets[i]+"Facet")
		         tempNode.parentNode.removeChild(tempNode);
		      }
		      
		      var valType = window.database.getProperty(currFacets[i]).getValueType();
		      if (valType == "number" || valType.indexOf("currency") >= 0)
		      {
		      	 var min = window.database.getProperty(currFacets[i]).getRangeIndex().getMin();
		      	 var max = window.database.getProperty(currFacets[i]).getRangeIndex().getMax();
		      	 var interval = Math.round((max-min)/6);
		      	 var intervalStr = (interval + "");
		      	 var roundedInterval = (parseInt((intervalStr).charAt(0))+1) + "";
				  													      	 
		      	 for (var x=0; x< intervalStr.length - 1; x++)
		      		 roundedInterval = roundedInterval + "0";
	
		      	 roundedInterval = parseInt(roundedInterval);
			      	 
		         var facetNode = document.createElement("div");
		         facetNode.setAttribute("ex:role","facet");
		         facetNode.setAttribute("ex:collectionID",id + "Collection");
		         facetNode.setAttribute("ex:facetClass","NumericRange");
		         facetNode.setAttribute("ex:expression","." + currFacets[i]);
		         facetNode.setAttribute("ex:interval",roundedInterval);
		         facetNode.setAttribute("ex:facetLabel",dojo.byId(currFacets[i] + "ColLabel").innerHTML);
		         facetNode.setAttribute("id",currFacets[i]+"Facet");
		         dojo.byId(id + "FacetsContainer").firstChild.appendChild(facetNode);//add to dialog together
		         window.exhibit.configureFromDOM(dojo.byId(currFacets[i]+"Facet"));
		      }
		      else
		      {
		         var facetNode = document.createElement("div");
		         facetNode.setAttribute("ex:role","facet");
		         facetNode.setAttribute("ex:collectionID",id + "Collection");
		         facetNode.setAttribute("ex:expression","." + currFacets[i]);
		         facetNode.setAttribute("ex:facetLabel",dojo.byId(currFacets[i] + "ColLabel").innerHTML);
		         facetNode.setAttribute("id",currFacets[i]+"Facet");
		         dojo.byId(id + "FacetsContainer").firstChild.appendChild(facetNode);//add to dialog together     
		         window.exhibit.configureFromDOM(dojo.byId(currFacets[i]+"Facet"));
		      }
		   }
		   
		   
		   Exhibit.UI.hideBusyIndicator();
		
		   dijit.byId('showHideColTableDialog').hide();
			if (window._currOnClkEvtListener_)
				dojo.disconnect(window._currOnClkEvtListener_);
		}
	},
	
	// function to disable dynamic table and restore the original table
	restoreTable: function(tableId)
	{
		// replace the dynamic table container with backed up smart table
		var dynamicTableDiv = dojo.byId(tableId + 'SmartTableContainer');
		dynamicTableDiv.parentNode.replaceChild(this.smartTableData[tableId].originalTblBackup,dynamicTableDiv);
		
		var smartTable = dojo.query('[smartTableId=\"'+ tableId + '\"]');
		
		// if table not found, return
		if (!smartTable || smartTable.length == 0)
			return;
		
		smartTable = smartTable[0];
		
		//remove facet list
		this.smartTableData[tableId].currFacets = new Array();
		
		// add icon to give user an option to switch to dynamic mode.
		var enableSTLink = document.createElement('a'); 
		enableSTLink.href = 'javascript:;';	
		enableSTLink.id = tableId + 'EnableST';
		enableSTLink.style.position = "relative";
		enableSTLink.style.left = "109%";
		dojo.connect(enableSTLink, 'onclick', dojo.hitch(this, 'showSmartTable', smartTable));
		
		var enableSTImg = document.createElement('img');
		enableSTImg.src = window.contextPath + window.staticRootPath + '/images/filter.gif';
		enableSTImg.border = '0';
		
		enableSTLink.appendChild(enableSTImg);
		smartTable.parentNode.insertBefore(enableSTLink,smartTable);
		
	},
	
	// function that converts a static SmartTable to a dynamic one
	showSmartTable: function(table)
	{
		var id = table.getAttribute('smartTableId');
		
		// Generate a list of default facets
		this.smartTableData[id].currFacets = this.genDefaultFacetList(this.smartTableData[id].headerNames);
		
		// generate exhibit code
		this.createHTMLContainer(table);
		
		// run exhibit
		var tableTag = dojo.byId(id + 'TableView');
		window.exhibit.configureFromDOM(tableTag.parentNode);
		
		var facetContainer = dojo.byId(id + 'FacetsContainer');
		window.exhibit.configureFromDOM(facetContainer);
		
		this.initFacetsForTables(id, this.smartTableData[id].currFacets, this.smartTableData[id].headerNames);
		
		// remove the filter icon
		var filterIcon = dojo.byId(id + 'EnableST');
		filterIcon.parentNode.removeChild(filterIcon);
		
	},
	
	// For a given table, this function will generate a list of table header column labels and
	// column names. The labels will be displayed in exhibit whereas the names are used for 
	// internal uniqueness purposes.
	genSmartTableHeaders: function(smartTable)
	{
		var headerRow = dojo.query('tr.tableHeaderRow', smartTable);
		
		if (!headerRow.length > 0)
			return null;

		var headerRowCells =  dojo.query('th', headerRow[0]);
		var headerNames = new Array();

		// for each column in the table get the label and generate column name
		for (var i=0; i<headerRowCells.length; i++)
		{
			var obj = new Object();
			var content = headerRowCells[i].innerText || headerRowCells[i].textContent;
			content = content.replace(/^(\s|&nbsp;)+|(\s|&nbsp;)+$/g,""); // left and right trim
			obj.label = content;

			// if content is empty give it a default name. The label will still be blank. 
			if (!content || content == '')
				content = 'stCol'; 

			// generating names for internal use by Exhibit. To make the names unique
			// in case there are two columns with the same name, we append random numbers
			// towards the end to ensure the names are unique. 

			content = content.replace(/\W|_/g,"")
			content = 'Col' + content + Math.floor(Math.random()*10000)
			obj.name = content;
			
			// if a column was marked as a facet in CKEditor, it will be used as a facet by default.
			obj.defaultFacet = false;
			
			if (dojo.hasClass(headerRowCells[i],'dataFacetCol'))
				obj.defaultFacet = true;
							
			headerNames.push(obj);
		}

		return headerNames;

	},
	
	genDefaultFacetList: function (headerNames)
	{
		var facets = new Array();
		
		for (var i=0; i < headerNames.length; i++)
		{
			if (headerNames[i].defaultFacet)
				facets.push(headerNames[i].name);
		}
		return facets;
	},
	
	// checks to see if the passed value is a numeric value using a regular expression
	isNumeric: function(columnVal)
	{
		var numberRegEx = /^[1-9][0-9]*(\.[0-9]*)?$/;
	
		//performing a trim
		columnVal = columnVal.replace(/^(\s|&nbsp;)+|(\s|&nbsp;)+$/g,"");
		
		if(columnVal.search(numberRegEx) < 0)
			return false;
		else
			return true;
				
	},
	
	// checks to see if the passed value is a numeric value using a regular expression
	isCurrency: function(columnVal)
	{
		var currencyRegEx = /^\$\s*(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?$/;;
		
		//performing a trim
		columnVal = columnVal.replace(/^(\s|&nbsp;)+|(\s|&nbsp;)+$/g,"");

		if(columnVal.search(currencyRegEx) < 0)
			return false;
		else
			return true;
				
	},
	
	// This function converts all the data from the HTML table to exhibit specific JSON
	// format. 
	genSmartTableDataJSON: function(smartTable, headerNames)
	{
		cssClass = smartTable.className;
		var id = smartTable.getAttribute('smartTableId');

		// get all data rows from the table
		var dataRows = dojo.query('tr:not(:first-child)',smartTable);
		
		// variable to store the JSON
		var data = {"items":[],"properties":{}};
		
		// array to keep track of what columns are numeric or currency.
		var isColNumeric = new Array();
		var isColCurrency = new Array();

		for (var x=0; x<headerNames.length; x++)
		{
			isColNumeric.push(true);
			isColCurrency.push(true);
		}
			
		// uses table data rows and creates Exhibit specific JSON. While adding data
		// it keeps track of which columns are numeric. By default all columns are strings
		for (var i=0; i<dataRows.length; i++)
		{
			var row = dataRows[i];
			var rowCells = dojo.query('td',row);

			var newDataItem = {"id": id + '_' +(i+1).toString(),"label":(i+1).toString(),"type":id};
			for (var j=0; j<rowCells.length; j++)
			{
				var content = rowCells[j].innerText || rowCells[j].textContent;
				
				if (!content)
					content = "";
				
				//performing a trim
				content = content.replace(/^(\s|&nbsp;)+|(\s|&nbsp;)+$/g,"");
				newDataItem[headerNames[j].name] = content;

				if(isColNumeric[j])
					if(!this.isNumeric(content)) 
						isColNumeric[j] = false;
				
				if(!isColNumeric[j] && isColCurrency[j])
					if(!this.isCurrency(content)) 
						isColCurrency[j] = false;
				
			}
			data.items.push(newDataItem);
		}

		// if any of the columns are numeric, a property needs to be set for exhibit so it can 
		// handle the column appropriately for sorting
		for (var y=0; y<headerNames.length; y++)
		{
			data.properties[headerNames[y].name] = new Object();
			if (isColNumeric[y])
			{
				data.properties[headerNames[y].name].valueType = "number";

				for (var i=0; i<data.items.length; i++)
				{
			   	// remove leading and trailing white space
					data.items[i][headerNames[y].name] = data.items[i][headerNames[y].name].replace(/^\s+|\s+$/g,'');
					data.items[i][headerNames[y].name] = parseFloat(data.items[i][headerNames[y].name]);
				}
			}
			else if (isColCurrency[y])
			{
				//data.properties[headerNames[y].name].valueType = "currency{symbol:'$';symbol-placement:first;decimal-digits:2}";
				data.properties[headerNames[y].name].valueType = "currency";
				for (var i=0; i<data.items.length; i++)
				{
					data.items[i][headerNames[y].name] = (data.items[i][headerNames[y].name]).replace(/\$/g,'');
					data.items[i][headerNames[y].name] = (data.items[i][headerNames[y].name]).replace(/,/g,'');
			   	// remove leading and trailing white space
					data.items[i][headerNames[y].name] = data.items[i][headerNames[y].name].replace(/^\s+|\s+$/g,'');
					data.items[i][headerNames[y].name] = parseFloat(data.items[i][headerNames[y].name]);
				}
			}
		}

		return data; 

	},
	
	getCurrFacets: function (smartTable)
	{
		var facets = new Array();		
		var headerRow = dojo.query('tr.tableHeaderRow', smartTable);
		
		if (!headerRow.length > 0)
			return null;

		var headerRowCells =  dojo.query('th', headerRow[0]);

		
	},
	
	// creates the exhibit database based on generated data
	createExhibitDB: function(data)
	{
		window.database = window.Exhibit.Database.create();
		window.database.loadData(data);
	},
	
	// This function generates the exhibit code based on the generated data. The exhibit code is HTML.
	// When exhibit runs, it looks for this HTML code and generates appropriate exhibit widgets based
	// on the information provided in this code.
	createHTMLContainer: function(smartTable)
	{
		
		var id = smartTable.getAttribute('smartTableId');
		var headerNames = this.smartTableData[id].headerNames;
		var currFacets = this.smartTableData[id].currFacets;
		var instanceVariableName = this.instanceVariableName;
		var tableColProperties = this.smartTableData[id].data.properties;
		var stObj = this;
		var dojoStr = dojo.i18n.getLocalization("concord.widgets","smartTable");
		
		var div = document.createElement('div');
			div.id = id + 'SmartTableContainer';
			
			// creating collections for different tables on the page. Each collection represents a table.
			var collectionDiv = document.createElement("div");
				collectionDiv.setAttribute("ex:role","exhibit-collection");
				collectionDiv.setAttribute("id",id + "Collection");
				collectionDiv.setAttribute("ex:itemTypes",id);
			div.appendChild(collectionDiv);	

			var table = document.createElement('table');
				table.style.width = "920px";
				table.border = 0;
				table.cellPadding = "0";
				table.cellSpacing = "0";
				
				var tbody = document.createElement('tbody');
								
					var tr = document.createElement('tr');
						tr.valign = "top";
						
						// the table cell that holds the dynamic table
						var td = document.createElement('td');
							td.setAttribute("ex:role","viewPanel");
							td.style.paddingRight = "20px";
							td.style.paddingLeft = "10px";
							td.style.paddingTop = "10px";
							td.style.verticalAlign = "top";
	
							// creating paramaters for the Exhibit TabularView
							var stDiv = document.createElement("div");
								stDiv.setAttribute("ex:role","view");
								stDiv.setAttribute("ex:viewClass","Tabular");
								stDiv.setAttribute("ex:collectionID",id + "Collection");
								stDiv.setAttribute("ex:showToolbox","false");
								stDiv.setAttribute("ex:sortColumn",0);
								stDiv.setAttribute("ex:showSummary","false");
								stDiv.setAttribute("ex:border","0");
								stDiv.setAttribute("ex:cellSpacing","10");
								stDiv.setAttribute("ex:cellPadding","0");
								stDiv.setAttribute("ex:rowStyler", this.instanceVariableName + ".rowStyler");
	
								// dynamically generating the Table Styler and adding it to a global variable.
								// This styler will be called when the table is generated and at each sort. 
								// We had to create this dynamic function because the styler needs to know what
								// css files to use for each table which are only available here. A generic styler
								// will not know what table is being generated and which css styles to use.
								var tblStylerFunction = "window['_' + id + 'TableStyler_'] = "; 
									tblStylerFunction += " function (table, database){";
									tblStylerFunction += "table.className = table.className + ' " + this.smartTableData[id].cssClass + "';";
									tblStylerFunction += "}";
	
								eval(tblStylerFunction);
								
								stDiv.setAttribute("ex:tableStyler", '_' + id + 'TableStyler_');
								
								stDiv.setAttribute("ex:sortAscending","true");
								stDiv.setAttribute("id",id + "TableView");
									
								var cols = "" , colLabels = "" , colTypes = "" ;
		
								for(var i=0; i < headerNames.length; i++)
								{
	
									if (cols =="")
									{
									   cols += "." + headerNames[i].name;
									   colLabels += headerNames[i].label;
									   
									   if (tableColProperties[headerNames[i].name].valueType)
									   	colTypes += tableColProperties[headerNames[i].name].valueType;
									   else
									   	colTypes += "list";
									}
									else
									{
									   cols += ", " + "." + headerNames[i].name;
									   colLabels += ", " + headerNames[i].label;
									   
									   if (tableColProperties[headerNames[i].name].valueType)
									   	colTypes += ", " + tableColProperties[headerNames[i].name].valueType;
									   else
									   	colTypes += ", " + "list";
									   
									}
								}
	
								stDiv.setAttribute("ex:columns",cols);
								stDiv.setAttribute("ex:columnLabels",colLabels);
								stDiv.setAttribute("ex:columnFormats",colTypes);
								stDiv.setAttribute("ex:formats","currency {symbol:'$';symbol-placement:first; decimal-digits :2}");
								
							td.appendChild(stDiv);
							
						tr.appendChild(td);
						
						// the table cell that holds the search and dynamic facets
						td = document.createElement('td');
							td.style.width = "170px";
							td.style.verticalAlign = "top";
							td.id = id + "FacetsContainer";
	
							// adding the title bar that will hold the title as well as the 
							// icons for user actions on the SmartTable
							var customizeDiv = document.createElement('div');
							customizeDiv.style.width = "100%";
							customizeDiv.style.backgroundColor = "#4283D1";
							customizeDiv.style.padding = "5px";
	
							var toolsTable = document.createElement('table');
								toolsTable.style.width = "100%";
								toolsTable.cellPadding = "0";
								toolsTable.cellSpacing = "0";
								
								var toolsTableTBody = document.createElement('tbody')
							
									var toolsTableRow = document.createElement('tr');									
										
										var toolsTitleTd = document.createElement('td');
											toolsTitleTd.style.width = "80%";
											toolsTitleTd.innerHTML = dojoStr.smartTableTools; //TODO: need to add string to table
											toolsTitleTd.style.color = "#ffffff";
											toolsTitleTd.style.fontSize = "14px";
											toolsTitleTd.style.fontWeight = "bold";
										toolsTableRow.appendChild(toolsTitleTd);
			
										var toolsImgTd = document.createElement('td');
											toolsImgTd.style.width = "20%";
											toolsImgTd.style.textAlign = "right";
											
											var restoreImg = document.createElement('img');
												restoreImg.src = window.contextPath + window.staticRootPath + "/images/restore.gif";
												restoreImg.style.paddingRight = "5px";
												restoreImg.onclick = function()
												{
													eval(instanceVariableName + '.restoreTable("' + id + '")');
												}
											toolsImgTd.appendChild(restoreImg);
		
											// code to launch the dialog to show/hide columns and facets
											var toolsImg = document.createElement('img');
												toolsImg.src = window.contextPath + window.staticRootPath + "/images/customize.gif";
												// onclick action dynamically creates the dialog based on the 
												// the table the user is focused on
												toolsImg.onclick = function()
												{
													//var dlgTBody = dojo.byId('dialogTbody');
													var errMsgDiv = document.getElementById('dlgErrorDiv');
													if(errMsgDiv)
														errMsgDiv.parentNode.removeChild(errMsgDiv);
														
													var dlgTBody = document.getElementById('dialogTbody');
													var dlgTBodyParentNode = dlgTBody.parentNode;
													var newDlgTBody = document.createElement('tbody');
													newDlgTBody.id = 'dialogTbody';
													dlgTBodyParentNode.replaceChild(newDlgTBody, dlgTBody);
													
													dlgTBody = newDlgTBody;
													
													var tableTag = document.getElementById(id + 'TableView');
													//eval("var tableTag = document.getElementById('" + id + "TableView');");
													var currShownCols = tableTag.getAttribute('ex:columns');
													currShownCols = currShownCols.split(',');
				
													for (var i =0; i < currShownCols.length; i++)
													{
													   currShownCols[i] = currShownCols[i].substring(currShownCols[i].indexOf('.')+1);
													}
				
													var currShownColsLabels = tableTag.getAttribute('ex:columnLabels');
													currShownColsLabels = currShownColsLabels.split(',');
				
													var tr = document.createElement("tr");
				   
														var th = document.createElement("th");
														   th.align = "left";
														   th.style.maxWidth = "125px";
														   th.style.fontWeight = "bold";
														   th.style.height ="25px";
														   th.innerHTML = dojoStr.column;
														tr.appendChild(th);            
				
														th = document.createElement("th");
														   th.align = "left";
														   th.style.maxWidth = "70px";
														   th.style.fontWeight = "bold";
														   th.innerHTML = dojoStr.show;
														tr.appendChild(th);                     
				
														
														th = document.createElement("th");
														   th.align = "left";
														   th.style.maxWidth = "50px";
														   th.style.fontWeight = "bold";
														   th.innerHTML = dojoStr.category;
														tr.appendChild(th);            
				
													dlgTBody.appendChild(tr);
				
				
													for (var i = 0; i < headerNames.length; i++)
													{
													   var isShown = false;
													   var facetExists = false;
													   var colLabel = null;
													   
													   for (var j = 0; j < currShownCols.length; j++)
													   {
													      if (headerNames[i].name == currShownCols[j])
													      {
													         isShown = true;
													         colLabel = dojo.trim(currShownColsLabels[j]);
													         break;
													      }
													   }
													   
													   if (!colLabel)
													      colLabel = headerNames[i].label;
													
													   
													   for (var j = 0; j < currFacets.length; j++)
													   {
													      if (headerNames[i].name == currFacets[j])
													      {
													         facetExists = true;
													         break;
													      }
													   }
													
													   tr = document.createElement("tr");
													   
													   if(i == 0)
													      tr.className = "lotusFirst";
													   
													      var td = document.createElement("td");
													         td.innerHTML = headerNames[i].label;
													         td.id = headerNames[i].name + 'ColLabel';
													         td.style.whiteSpace = 'nowrap';
													         td.style.paddingRight = '15px';
													         td.style.paddingTop = '4px';
													         td.style.paddingBottom = '4px';
													      tr.appendChild(td); 
				
													      td = document.createElement("td");
													         var input = document.createElement('input');            
													            input.type = "checkbox";
													            input.name = headerNames[i].name + "CkBox";
													            input.id = headerNames[i].name + "CkBox";
													            td.appendChild(input); //need to append it first or IE will not check the box
													            if (isShown)
													               input.checked = true;
													            input.value = headerNames[i].name;
													         
													      tr.appendChild(td);
													   
													      
													      									
													      td = document.createElement("td");
													         var input = document.createElement('input');            
													            input.type = "checkbox";
													            input.name = headerNames[i].name + "FacetCkBox";
													            input.id = headerNames[i].name + "FacetCkBox";
													            td.appendChild(input); //need to append it first or IE will not check the box
													            if (facetExists)
													               input.checked = true;
													            input.value = headerNames[i].name;
													      tr.appendChild(td);
													
													
												      dlgTBody.appendChild(tr);
													}
		
													// disconnect any prior events attached to the OK button
													if (window._currOnClkEvtListener_)
														dojo.disconnect(window._currOnClkEvtListener_);
		
													
													// action that is taken when the user clicks on the OK button on the dialog
													window._currOnClkEvtListener_ = dojo.connect(dojo.byId('OKNodeSaveBtn'), "onclick", dojo.hitch(stObj, 'showColsFacets', tableTag, id, headerNames, currFacets));   
														dijit.byId('showHideColTableDialog').show();
		
													
												};
											toolsImgTd.appendChild(toolsImg);
										toolsTableRow.appendChild(toolsImgTd);
									toolsTableTBody.appendChild(toolsTableRow);
								toolsTable.appendChild(toolsTableTBody)
							customizeDiv.appendChild(toolsTable);
								
								
						var smtDiv = document.createElement('div');
						smtDiv.className = "lotusDialogBorder lotusDialog";
						smtDiv.style.width = "100%";
						
						customizeDiv.style.background = "#222428";
						customizeDiv.style.width = "";
						
						smtDiv.appendChild(customizeDiv);
//						td.appendChild(customizeDiv);
							
						// add  code for search bar for each table
						var searchFacetDiv = document.createElement('div');
							searchFacetDiv.setAttribute("ex:role","facet");
							searchFacetDiv.setAttribute("ex:facetClass","TextSearch");
							searchFacetDiv.setAttribute("ex:facetLabel",dojoStr.search);
							searchFacetDiv.setAttribute("ex:collectionID",id + "Collection");
//						td.appendChild(searchFacetDiv);
						
						smtDiv.appendChild(searchFacetDiv);
							
							td.appendChild(smtDiv);
						tr.appendChild(td);
					tbody.appendChild(tr);
				table.appendChild(tbody);
			div.appendChild(table);

			
			// backup table so it can be restored if the user wants
			var originalTblBackup = smartTable.parentNode.replaceChild(div,smartTable);
			this.smartTableData[id].originalTblBackup = originalTblBackup;
			
			
	},

	
	// This function is called when the user clicks on the Filter icon above the 
	// SmartTable. When clicked, the following code will dynamically build all 
	// the data needed to run Exhibit. If this information has been built once,
	// it will get reused
	enableST: function(smartTableId)
	{
		var smartTable = dojo.query('[smartTableId=\"'+ smartTableId + '\"]');
		
		// if table not found, return
		if (!smartTable || smartTable.length == 0)
			return;
		
		smartTable = smartTable[0];
		
		this.smartTableData[smartTableId] = new Object();
		this.smartTableData[smartTableId].cssClass = smartTable.className;
		this.smartTableData[smartTableId].headerNames = this.genSmartTableHeaders(smartTable);
		this.smartTableData[smartTableId].data = this.genSmartTableDataJSON(smartTable, this.smartTableData[smartTableId].headerNames);
		this.smartTableData[smartTableId].currFacets = this.genDefaultFacetList(this.smartTableData[smartTableId].headerNames);
		//this.smartTableData[smartTableId].currFacets = new Array();
	},
	
	
	// when page loads, this function will assign id's to the tables and
	// generates Exhibit database and code to render the exhibit tables
	init: function()
	{
		var smartTables = dojo.query('table.smartTable');
		var dynamicSmartTablesIds = new Array();
		var combinedData = {"items":[],"properties":{}};
	
		for (var i=0; i<smartTables.length; i++)
		{
			// if the SmartTable is of the type without an header row, Exhibit will not work
			// so ignore SmartTables without header rows and with header columns.
			var headerRow = dojo.query('tr.tableHeaderRow', smartTables[i]);
			var headerCols = dojo.query('td.tableHeaderCol', smartTables[i]);
			var dataCells = dojo.query('td', smartTables[i]); // number of data cells
			
			if (headerRow.length > 0 && headerCols.length == 0 && dataCells.length > 0)
			{
			
				// assigning a temporary id to the SmartTable
				var tableId = 'lcst' + (i + 1);
				this.smartTableIds.push(tableId);
				smartTables[i].setAttribute('smartTableId',tableId);
				
				this.enableST(tableId);
				
				// Merge the generated data
				for (var x = 0; x < this.smartTableData[tableId].data.items.length; x++)
				{
					combinedData.items.push(this.smartTableData[tableId].data.items[x]);
				}
				
				for (var property in this.smartTableData[tableId].data.properties)
				{
					combinedData.properties[property] = this.smartTableData[tableId].data.properties[property];
				}
				window['_currOnClkEvtListener_'] = null;
				
				// backup the SmartTable
				this.createHTMLContainer(smartTables[i]);
				
				dynamicSmartTablesIds.push(tableId);
			}
		}
		
		// generate Exhibit database
		this.createExhibitDB(combinedData);
		
		// run Exhibit
		window.exhibit = window.Exhibit.create(); 
		window.exhibit.configureFromDOM();
				
		for (var i=0; i<dynamicSmartTablesIds.length; i++)
		{
			var tableId = dynamicSmartTablesIds[i];
			this.initFacetsForTables(tableId, this.smartTableData[tableId].currFacets, this.smartTableData[tableId].headerNames);
		}
	}
	
});

