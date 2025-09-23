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

dojo.provide("concord.widgets.spreadsheetTemplates.Dialog");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("concord.widgets.concordDialog");

dojo.requireLocalization("concord.widgets.spreadsheetTemplates","Dialog");

dojo.declare("concord.widgets.spreadsheetTemplates.Dialog", [concord.widgets.concordDialog],{
	
	resultFilter: null,
	searchString: "",
	cCountToSearch: 2, // when user input characters >= 2, begin search
	resouce : null,
	FILTER_SEPERATOR: " | ",
	FILTER_ALL: "all",

	templatesArray :null,
	filtersArray: null,
	filtersIdMap: null,
	previewImgPath: null,
	selectedItem: null,
	
	createContent: function (contentDiv) 
	{
		this._init();
		
		dojo.addClass( contentDiv, "lotusui30_layout ");
		
		var mianDiv = dojo.create("div",{id:"spreadsheetTemplatesMainDiv"},contentDiv);
		this.createSearchBar(mianDiv);
		
		var filtersDiv = dojo.create("div",{id:"spreadsheetTemplatesDlgFilters"},mianDiv);
		dojo.addClass(filtersDiv,"concordTemplatesDialogFilterSection");
		this.createResultsNumDiv(filtersDiv);
		this.createMainFilters(filtersDiv);
		
		this.createResultsSection(mianDiv);
		this.loadTemplates();
	},
	setDialogID: function() {
		// Overridden
		this.dialogId="S_d_Template";
		this.searchBoxID="S_d_TemplateSearchTxt";
		return;
	},
	//overide
	reset: function()
	{
		this.resultFilter = this.FILTER_ALL;
		this.searchString = "";
		var searchBox = dijit.byId(this.searchBoxID);
		if(searchBox)
			searchBox.setValue(this.resouce.SEARCH_FOR_TEMPLATES);
		this.handleFilter(this.FILTER_ALL);
	},
	
	loadTemplates: function()
	{
		try{
			var dlg = this;
			var xhrCall =dojo.xhrGet(
			{
				url: window.contextPath+ window.staticRootPath + "/js/concord/widgets/spreadsheetTemplates/templatesResource.json",
				handleAs: "json",
				load: function(data)
				{
					dlg.filtersArray = data.filters;
					dlg.templatesArray = data.templates;
					dlg.initFiltersIdMap(data.filters);
					dlg.createCustomiseFilters();
					dlg.handleFilter(dlg.FILTER_ALL);
				},
				error: function(error) 
				{
					console.log('***********************');
					console.log('ConcordTemplates Error returned while loading resource :' + error);
					console.log('***********************');
				}
			});
		}catch(e)
		{
			console.log("load templates error :" + e);
		}

	},
	_init: function(contentDiv)
	{
		this.resouce = dojo.i18n.getLocalization("concord.widgets.spreadsheetTemplates","Dialog");
		this.resultFilter = this.FILTER_ALL;
		this.previewImgPath = window.contextPath+ window.staticRootPath + "/js/concord/widgets/spreadsheetTemplates/img/";
	},
	
	initFiltersIdMap: function(filtersArray)
	{
		if(!this.filtersIdMap)
		{
			this.filtersIdMap = {};
			this.filtersIdMap[this.FILTER_ALL] = "spreadsheetTemplatesAllFilter";
			for(var i = 0; i < filtersArray.length; i++)
			{
				var id = filtersArray[i].id;
				var widgetId = filtersArray[i].widgetId;
				this.filtersIdMap[id] = widgetId;
			}
		}
		return this.filtersIdMap;
	},
	
	calcWidth: function()
	{
		return "550px";//set dialog width as 400 pixels by default.
	},
	
	templateClicked: function(clickedItem)
	{
		this.deselectItem(this.selectedItem);
		var templateId = clickedItem.id;
		this.selectedItem = templateId;
		this.selectItem(clickedItem);
		this.okBtn.attr("disabled", false);	
	},
	
	onOk: function (editor) {
		// Overridden
		pe.spreadsheetTemplateId = this.selectedItem.substring( this.dialogId.length);
		this.hide();
		pe.scene.createSheetDoc(this.editor,true,true);
		return true;
	},
	//overide the super method, do nothing	
	returnFocus: function()
	{

	},	
	
	_onCancel: function()
	{
		this.inherited(arguments);
	},
	
	onOkKeyDown: function (editor, evt) {
		if (evt.altKey || evt.ctrlKey || evt.metaKey) return;
		if(evt.keyCode == dojo.keys.ENTER || evt.keyCode == dojo.keys.SPACE)
		{
			this.onOk(editor);
		}		
	},
	
	onShow:function(editor){
		this.deselectItem(this.selectedItem);
		this.selectedItem = null;
		this.okBtn.attr("disabled", true);
	},
	
	selectItem: function(node)
	{
		this.deselectItem(this.selectedItem);
		this.selectedItem = node.id;
		dojo.removeClass(node,'concordTemplatesDialogItem');
		dojo.addClass(node,'concordTemplatesDialogItemSelected');
		this.okBtn.attr("disabled", false);
	},

	deselectItem: function(selectedItem)
	{
		if(selectedItem)
		{
			node = dojo.byId(selectedItem);
			if(node)
			{
				dojo.removeClass(node,'concordTemplatesDialogItemSelected');
				dojo.addClass(node,'concordTemplatesDialogItem');
			}
		}
	},
	createSearchBar: function(mainDiv)
	{
		var searchBarDiv = dojo.create("div",{id:"spreadsheetTemplatesDlgSearchBarDiv"},mainDiv);
		var searchBox = new dijit.form.TextBox(
		{
			"id": this.searchBoxID, 
			"trim":true, 
			"maxLength":"100", 
			"value": this.resouce.SEARCH_FOR_TEMPLATES,
			"title": this.resouce.SEARCH_FOR_TEMPLATES,
			"onFocus":dojo.hitch(this,this.searchBarOnFocus),
			"class":"concordTemplatesSearchBar"
		},searchBarDiv);
		dojo.style(searchBox.domNode,{color:"#ACACAC",width:"300px"});
		dijit.setWaiRole(searchBox.domNode,'search');
		dijit.setWaiState(searchBox.domNode,'label',this.resouce.SEARCH_FOR_TEMPLATES);
		searchBox.startup();
		dojo.connect(searchBox.domNode,"onkeyup",dojo.hitch(this,this.getUserSearchResults));
		dojo.connect(searchBox.domNode,"onclick",dojo.hitch(this,this.searchBarOnFocus));
		//run textbox._setBlurValue and then do the special action for blur
		dojo.connect(searchBox,"_setBlurValue",dojo.hitch(this,this.searchBarOnBlur));
	},
		
	getUserSearchResults: function()
	{
		var searchBox = dijit.byId(this.searchBoxID);
		var searchValue = "";
		if(searchBox)
			searchValue = searchBox.getValue();
		if(searchValue.length >= this.cCountToSearch)
			this.searchString = searchValue;
		else
			this.searchString = "";
		this.handleFilter(this.resultFilter);
	},
	
	// on focus on search box, if the search box has the default value, make it blank so the
	// user can type 
	searchBarOnFocus: function()
	{
		var searchBox = dijit.byId(this.searchBoxID);
	
		if (searchBox.getValue() && searchBox.getValue() == this.resouce.SEARCH_FOR_TEMPLATES)
			searchBox.setValue("");
	},

	// on blur from search box, if the search box is blank show the default string
	searchBarOnBlur: function()
	{
		var searchBox = dijit.byId(this.searchBoxID);
	
		if (!searchBox.getValue() || searchBox.getValue().length == 0)
			searchBox.setValue(this.resouce.SEARCH_FOR_TEMPLATES);
	},
	// add template results UI element
	createResultsSection: function(mainDiv)
	{
		var resultBoxDiv = dojo.create("ul",null,mainDiv);
		resultBoxDiv.id = "spreadsheetTemplatesDlgResults";
		dojo.addClass(resultBoxDiv,"concordTemplatesDialogResultBox");
	},
	
	createResultsNumDiv: function(filtersDiv)
	{
		var resultSpan = dojo.create("span",{id:"totalSpreadsheetTemplatesShown"},filtersDiv);
		dojo.addClass(resultSpan,"concordTemplatesDialogResultCount");
		resultSpan.innerHTML = this.resouce.RESULTS_TOTAL_TEMPLATES;
		dijit.setWaiRole(resultSpan,'region');
		dijit.setWaiState(resultSpan,'live', 'assertive');	
	},
	
	createMainFilters: function(filtersDiv)
	{
		var filtersSpan = dojo.create("span",{id:"spreadsheetTemplatesFiltersSpan"},filtersDiv);
		dojo.addClass(filtersSpan,"concordTemplatesDialogFilterSpan");
		
		var showSpan = dojo.create("span",null,filtersSpan);
		showSpan.appendChild(document.createTextNode(this.resouce.SHOW));
		
		var allSpan = dojo.create( "span",
								   {innerHTML:this.resouce.ALL,id:"spreadsheetTemplatesAllFilter"},
								   filtersSpan);
		dojo.attr(allSpan,'tabindex',0);
		dijit.setWaiRole(allSpan,'button');
		dojo.connect(allSpan,'onclick',dojo.hitch(this,this.handleFilter,this.FILTER_ALL));
		dojo.connect(allSpan,'onkeydown',this.onFilterKeyDown);
	},
	
	createCustomiseFilters: function()
	{
		if(!this.filtersArray) return;
		var filtersSpan = dojo.byId("spreadsheetTemplatesFiltersSpan");
		for(var i = 0 ; i < this.filtersArray.length; i++)
		{
			var sepSpan = dojo.create("span",{innerHTML: this.FILTER_SEPERATOR},filtersSpan);
			var id = this.filtersArray[i].id;
			var widgetId = this.filtersArray[i].widgetId;
			var filter =  dojo.create("span",
									  {innerHTML:this.resouce[id.toUpperCase()],id:widgetId},
									  filtersSpan);
			dojo.attr(filter,'tabindex',0);
			dijit.setWaiRole(filter,'button');
			dojo.connect(filter,'onclick',dojo.hitch(this,this.handleFilter,id));
			dojo.connect(filter,'onkeydown',this.onFilterKeyDown);
		}
	},
	
	onFilterKeyDown: function( evt )
	{
		if (evt.altKey || evt.ctrlKey || evt.metaKey) return;
		if( evt.keyCode == dojo.keys.ENTER || evt.keyCode == dojo.keys.SPACE )
		{
			//enter or space key
			if( this.click )
				this.click();
			else
			{
				// Safari do not have click function
				var e = document.createEvent('MouseEvent');
				e.initEvent('click', false, false);
				this.dispatchEvent(e);
			}
		}
	},
	
	handleFilter: function(selectedFilter)
	{
		var filterIdsMap = this.filtersIdMap;
		if(!filterIdsMap) return;
	
		//deselect all the filters
		for(var id in filterIdsMap)
		{
			this.selectFilter(dojo.byId(filterIdsMap[id]),false);
		}
		if(selectedFilter)
		{
			var selectedNode = dojo.byId(filterIdsMap[selectedFilter]);
			this.selectFilter(selectedNode,true);
			this.resultFilter = selectedFilter;
		}
		this.showFilterResults();
	},
	
	selectFilter: function(node,isSelected)
	{
		if(!node) return;
		//disable ok button when click on filter selector
		this.okBtn.attr("disabled", true);	
		if(isSelected)
		{
			dojo.removeClass(node,'concordTemplatesDialogFilterNotSelected');
			dojo.addClass(node,'concordTemplatesDialogFilterSelected');	
		}else
		{
			dojo.removeClass(node,'concordTemplatesDialogFilterSelected');
			dojo.addClass(node,'concordTemplatesDialogFilterNotSelected');	
		}
	},
	
	showFilterResults: function()
	{
		var resultsBoxDiv = dojo.byId("spreadsheetTemplatesDlgResults");
		resultsBoxDiv.innerHTML = "";
		var resultCnt = 0;
		//isFirst to validate whether the filtered is the first template item.
		var isFirst = true;
		
		for(var i = 0; i < this.templatesArray.length ; i++)
		{
			var id = this.templatesArray[i].id;
			templateId = id.toUpperCase();
			if(this.resultFilter == this.FILTER_ALL || this.templatesArray[i].type == this.resultFilter )
			{
				var regExp = new RegExp(this.searchString,"i");
				if(!this.searchString || regExp.test(this.resouce.templates[templateId].title) || regExp.test(this.resouce.templates[templateId].disp))
				{
					resultCnt++;
					var item = dojo.create("li",null,resultsBoxDiv);
					item.id =  this.dialogId + id;
					dojo.addClass(item,"concordTemplatesDialogItem");
					isFirst && !(isFirst = false) && item.setAttribute('tabindex','0');
					dijit.setWaiRole(item, "button");
					dijit.setWaiState(item, 'label',this.resouce.templates[templateId].title +
							", " + this.resouce.templates[templateId].disp); 
//					if(item.focus && resultCnt!=0){
//						this.okBtn.attr("disabled", false);
//					}
					
					dojo.connect(item,'onclick',dojo.hitch(this,this.templateClicked,item));
					dojo.connect(item,'onfocus',dojo.hitch(this,this.onTemplateFocus,item));
					dojo.connect(item,'onkeyup',dojo.hitch(this,this.onTemplateKeyUp,item));
					dojo.connect(item,'onkeydown',dojo.hitch(this,this.onOkKeyDown,item));
					
					var divImgPreview = dojo.create("div",null,item);
					dojo.addClass(divImgPreview,"concordTemplatesDialogItemPreviewDoc");
					var imgPath =  this.previewImgPath + this.templatesArray[i].previewImg;//window.contextPath+ "/js/concord/widgets/spreadsheetTemplates/img/" + id.toLowerCase() + ".png";
					var end = this.templatesArray[i].previewImg.lastIndexOf(".");
					var imgName = this.templatesArray[i].previewImg.substring(0, end);
					divImgPreview.innerHTML = "<img class='concordTemplatesDialogItemPreviewImg' src='" + imgPath + "' alt='" + imgName + "'>" ;
												
					var divTitle = dojo.create("div",null,item);
					divTitle.innerHTML = this.resouce.templates[templateId].title;
					dojo.addClass(divTitle,"concordTemplatesDialogItemTitle");
					
					var divDisp = dojo.create("div",null,item);
					divDisp.innerHTML = this.resouce.templates[templateId].disp;
					divDisp.id = templateId;
					dojo.addClass(divDisp,"concordTemplatesDialogItemDescription");
				}
			}
		}
		this.updateSearchResultsTotal(resultCnt);
		//disable ok button if no result match current filter
		if(resultCnt == 0){
			this.okBtn.attr("disabled", true);
		}
	},
	
	onTemplateFocus: function( clickedItem )
	{
		this.selectItem(clickedItem);	
	},
	
	onTemplateClicked: function(clickedItem)
	{
		var node = null;
		if(this.selectedItem)
		{
			var node = dojo.byId(this.selectedItem);
		}
		else
		{
			var resultsDiv = dojo.byId('concordTemplatesDialogResults');
			resultsDiv && (node = resultsDiv.firstChild);
		}
		node && dojo.removeAttr(node, 'tabindex');
		clickedItem && dojo.attr(clickedItem, {'tabindex':'0'});
		clickedItem.focus();
	},
	
	onTemplateKeyUp: function( clickedItem, evt ){
		var keystroke = evt.keyCode;
		var toSelectItem = null;
		switch ( keystroke ){
			// RIGHT-ARROW
		    case dojo.keys.RIGHT_ARROW :
			    // toSelectItem is template item
			    toSelectItem = clickedItem.nextSibling;
			    if ( toSelectItem )
			    {
			    	this.onTemplateClicked(toSelectItem);
			    }
			    evt.preventDefault();
			    break;
			// LEFT-ARROW
			case dojo.keys.LEFT_ARROW :
				// toSelectItem is template item
				toSelectItem = clickedItem.previousSibling;
				if ( toSelectItem )
				{
					this.onTemplateClicked(toSelectItem);
				}
				evt.preventDefault();
				break;
			// UP-ARROW
			case dojo.keys.UP_ARROW :
				// toSelectItem is template item
				toSelectItem = clickedItem.previousSibling;
				if ( toSelectItem )
				{
					this.onTemplateClicked(toSelectItem);
				}
				evt.preventDefault();
				break;
			// DOWN-ARROW
			case dojo.keys.DOWN_ARROW :
				// toSelectItem is template item
				toSelectItem = clickedItem.nextSibling;
				if ( toSelectItem )
				{
					this.onTemplateClicked(toSelectItem);
				}
				evt.preventDefault();
				break;
			default :
				// Do not stop not handled events.
				return;
		}
	},
	
	// update the totals shown near the top right of the dialog based on the results
	updateSearchResultsTotal: function(total)
	{
		// if the total is zero, show default string, otherwise show the real total
		var resultsTotal = dojo.byId("totalSpreadsheetTemplatesShown");
		resultsTotal.innerHTML = dojo.string.substitute(this.resouce.RESULTS_TOTAL_TEMPLATES,[total]);
	}
});