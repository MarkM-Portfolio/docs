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

dojo.provide("concord.widgets.concordTemplateGalleryDialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.util.dialogs");
dojo.requireLocalization("concord.widgets","templateDesignGallery");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.widgets.concordTemplateGalleryDialog", [concord.widgets.concordDialog], {
	params: null,
	editor: null,
	cmdData: null,
	pluginPath: null,
	template_lock: null,
	selectedItem: null,
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	nls:null,
	searchStr:"",

constructor: function  (object, title, oklabel, visible, params, cmdData, path) {
	this.params = params;
	title += "#" + Math.random();
	this.editor = object;
	this.cmdData = cmdData;
	this.pluginPath = path;
	this.nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
	this.tnls = dojo.i18n.getLocalization('concord.widgets','toolbar');
	// For filter items
	this.connectArray = [];
	this.resultFilter = "";
	this.templateData = {};
	this.template_lock = false;
	cmdData = null;		// set null, otherwise dialog will create a form dialog.
	this.inherited( arguments );
},

show: function (){

	pe.lotusEditor.origRange = this.editor.getSelection().getRanges()[0];
	//release lock when it is shown
	this.template_lock=false;
	this.inherited( arguments );
},

setDialogID: function() {
	// Overridden
	this.dialogId="D_d_Template";
	return this.dialogId;
},
//overide
reset: function()
{
	this.searchStr = "";
	var searchBox =  dijit.byId('templatesSearchBox');
	if(searchBox)
		searchBox.setValue(this.nls.concordtemplates.dlgLabelDefaultSearchbarValue);
	if(this.templateData.templates){
		this.handleFilter("all|document",this.editor);
	}
},

createContent: function (contentDiv) {
	dojo.addClass( contentDiv, "lotusui30_layout ");
	var content = contentDiv;

	dojo.attr(contentDiv, "id", "concordTemplatesGallery");

	var templatesMainDiv = dojo.create("div", null, contentDiv);
	dojo.attr(templatesMainDiv, "id", "templatesDialogMainDiv");

	var templatesSearchDiv = dojo.create("div", null, templatesMainDiv);
	dojo.attr(templatesSearchDiv, "id", "templatesDialogSearchDiv");

	this.addSearchBar(templatesSearchDiv, this.editor);
	this.addSearchFilters(templatesMainDiv, this.editor);
	this.addResultsSection(templatesMainDiv);
	this.getTemplatesData(this.editor, this.cmdData);
},

calcWidth: function() {
	return "550px";//set dialog width as 400 pixels by default.
},

// create search box UI element and add it to the dialog
addSearchBar: function(searchDiv, editor)
{
	var searchBox = new dijit.form.TextBox(
			{
				'id': 'templatesSearchBox', 
				'trim':true,
				'maxLength':'100', 
				'value': this.nls.concordtemplates.dlgLabelDefaultSearchbarValue,
				'class':'concordTemplatesSearchBar',
				"onFocus":dojo.hitch(this,this.searchBarOnFocus,editor),
				'title': this.nls.concordtemplates.dlgLabelDefaultSearchbarValue
			},searchDiv);
	this.searchBox = searchBox;
	dojo.attr(this.searchBox.focusNode, "dir",BidiUtils.getTextDir());
        if (dojo.attr(this.searchBox.focusNode, "dir") == "contextual")
        	dojo.connect(this.searchBox.focusNode, 'onkeyup', dojo.hitch(this, function(){
        		this.searchBox.focusNode.dir = BidiUtils.calculateDirForContextual(this.searchBox.focusNode.value);
        }));	
	searchDiv.style.display ='none';
	document.body.appendChild(searchDiv);
	
	searchBox.startup();
	searchBox.domNode.setAttribute('role','search');
	searchBox.domNode.setAttribute('aria-label',this.nls.concordtemplates.dlgLabelDefaultSearchbarValue);

	// attach key events to the search box
	dojo.connect(searchBox.domNode,"onkeyup",null,dojo.hitch(this,this.getUserKeyStroke, editor));
	dojo.connect(searchBox.domNode,"onfocus",null,dojo.hitch(this,this.searchBarOnFocus, editor));		
	dojo.connect(searchBox.domNode,"onclick",null,dojo.hitch(this,this.searchBarOnFocus, editor));
	//dojo.connect(searchBox.domNode,"onblur",null,dojo.hitch(this,this.searchBarOnBlur, editor));	
	dojo.connect(searchBox,"_setBlurValue",null,dojo.hitch(this,this.searchBarOnBlur, editor));
},

// add template type filter UI elements to the dialog
addSearchFilters: function(mainDiv, editor)
{
	var filterSectionDiv = document.createElement("div");
	dojo.addClass(filterSectionDiv,"concordTemplatesDialogFilterSection");
	mainDiv.appendChild(filterSectionDiv);

	var resultSpan = document.createElement("div");
	resultSpan.id = "totalTemplatesShown";
	resultSpan.setAttribute('role', 'region');
	resultSpan.setAttribute('aria-live', 'assertive');
	resultSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelInitSearchResults));
	dojo.addClass(resultSpan,'concordTemplatesDialogResultCount');
	filterSectionDiv.appendChild(resultSpan);

	var filterSpan = document.createElement("div");
	dojo.addClass(filterSpan,'concordTemplatesDialogFilterSpan');


	var showSpan = document.createElement("div");
	showSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelShow));
	dojo.addClass(showSpan, 'concordTemplatesDialogFilterSepSpan');
	filterSpan.appendChild(showSpan);

	var allSpan = document.createElement('div');
	allSpan.id = 'concordTemplatesAllFilterSpan';
	allSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelAll));
	dojo.attr(allSpan, 'tabindex', '0');
	dijit.setWaiRole(allSpan,'link');
	filterSpan.appendChild(allSpan);

	var sepSpan = document.createElement("div");
	sepSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelSeperator));
	dojo.addClass(sepSpan, 'concordTemplatesDialogFilterSepSpan');
	filterSpan.appendChild(sepSpan);

	var docSpan = document.createElement("div");
	docSpan.id = 'concordTemplatesDocFilterSpan';
	docSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelDoc));
	dojo.addClass(docSpan,'concordTemplatesDialogFilterNotSelected');
	dojo.attr(docSpan, 'tabindex', '0');
	dijit.setWaiRole(docSpan,'link');	
	filterSpan.appendChild(docSpan);

	sepSpan = document.createElement("div");
	sepSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelSeperator));
	dojo.addClass(sepSpan, 'concordTemplatesDialogFilterSepSpan');
	filterSpan.appendChild(sepSpan);

//	var stSpan = document.createElement("div");
//	stSpan.id = 'concordTemplatesSTFilterSpan';
//	stSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelST));
//	dojo.addClass(stSpan,'concordTemplatesDialogFilterNotSelected');
//	filterSpan.appendChild(stSpan);

//	sepSpan = document.createElement("div");
//	sepSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelSeperator));
//	dojo.addClass(sepSpan, 'concordTemplatesDialogFilterSepSpan');
//	filterSpan.appendChild(sepSpan);

	var sectSpan = document.createElement("div");
	sectSpan.id = 'concordTemplatesSectionFilterSpan';
	sectSpan.appendChild(document.createTextNode(this.nls.concordtemplates.dlgLabelSections));
	dojo.addClass(sectSpan,'concordTemplatesDialogFilterNotSelected');
	dojo.attr(sectSpan, 'tabindex', '0');
	dijit.setWaiRole(sectSpan,'link'); 
	filterSpan.appendChild(sectSpan);
	filterSectionDiv.appendChild(filterSpan);

	this.resultFilter = 'all';

	// add onclick events
	dojo.connect(allSpan,'onclick',dojo.hitch(this,this.handleFilter,'all', editor));
	dojo.connect(docSpan,'onclick',dojo.hitch(this,this.handleFilter,'document', editor));		  			
	dojo.connect(sectSpan,'onclick',dojo.hitch(this,this.handleFilter,'section', editor));
	dojo.connect(allSpan,'onkeydown',this.onFilterKeyDown);
	dojo.connect(docSpan,'onkeydown',this.onFilterKeyDown);		
	dojo.connect(sectSpan,'onkeydown',this.onFilterKeyDown);
},

loadConcordStyles: function(editor)
{
	try
	{
		//get contents for the template that was clicked
		var xhrArgs =
		{
				url: referrer.pluginPath + 'templates/styles.json',
				handleAs: 'json',
				load: function(data)
				{
			if(window.g_concordInDebugMode)
			{
				console.log('***********************');
				console.log('ConcordTemplates Plugin > Load styles data received');
				console.log('***********************');
			}

			CKEDITOR.concordTemplatesClassNames = data.concordStyles;
				},
				error: function(error) //TODO: Handle error
				{
					console.log('***********************');
					console.log('ConcordTemplates Plugin > Error returned while loading styles');
					console.log(error);
					console.log('***********************');
				}
		}

		if(window.g_concordInDebugMode)
		{
			console.log('***********************');
			console.log('ConcordTemplates Plugin > Sending request to load styles');
			console.log('***********************');
		}

		var xhrCall = dojo.xhrGet(xhrArgs);
	}
	catch(e) //TODO: Handle catch
	{
		if(window.g_concordInDebugMode)
		{
			console.log('***********************');
			console.log('ConcordTemplates Plugin > Error sending request to load styles');
			console.log(e);
			console.log('***********************');
		}
	}
},

// update the totals shown near the top right of the dialog based on the results
updateSearchResultsTotal: function(total, editor)
{
	dojo.byId('totalTemplatesShown').innerHTML = dojo.string.substitute(this.nls.concordtemplates.RESULTS_TOTAL_TEMPLATES,[total]);
},

// based on user keystroke perform filtering
getUserKeyStroke: function(editor, evt)
{
	// Tab key
	if( evt.keyCode == dojo.keys.TAB )
		return;
	var searchBox = dijit.byId('templatesSearchBox');
	var searchVal = searchBox.getValue();

	//if the user has typed in more than 2 characters, perform filtering
	//otherwise show all templates
	if(searchVal.length >= 2)
	{
		this.showFilteredResults(searchVal, editor);
	}
	else
	{
		this.displayAllResults(editor);
	}
},

// on focus on search box, if the search box has the default value, make it blank so the
// user can type 
searchBarOnFocus: function(editor)
{
	var searchBox = dijit.byId('templatesSearchBox');

	if (searchBox && searchBox.getValue() == this.nls.concordtemplates.dlgLabelDefaultSearchbarValue)
		searchBox.setValue("");
},

// on blur from search box, if the search box is blank show the default string
searchBarOnBlur: function(editor)
{
	var searchBox = dijit.byId('templatesSearchBox');
	var value = searchBox.getValue();

	if (!value || value.length == 0)
	{
		searchBox.setValue(this.nls.concordtemplates.dlgLabelDefaultSearchbarValue);
		this.searchStr = "";
	}
},

// on mouse over on template item, show border 
itemResultMouseOverAction: function(itemDiv)
{
	dojo.removeClass(itemDiv,'concordTemplatesDialogItem');		
	dojo.addClass(itemDiv,'concordTemplatesDialogItemSelected');		
},	

// on mouse out, remove border from the template item
itemResultMouseOutAction: function(itemDiv)
{
	dojo.removeClass(itemDiv,'concordTemplatesDialogItemSelected');		
	dojo.addClass(itemDiv,'concordTemplatesDialogItem');		
},	

displaySearchError: function(editor)
{
	dojo.byId('concordTemplatesDialogResults').innerHTML = this.nls.concordtemplates.dlgLabelDataError;
},	

onOkKeypress: function (editor, evt) {
	this.onKeyPress(evt);		
},

// when the template is clicked, insert contents of the template into the document at current cursor position
onTemplateClicked: function(clickedItem, editor)
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

onTemplateFocus: function( clickedItem, editor )
{
	this.selectItem(clickedItem);
},

onTemplateKeyUp: function( clickedItem, evt )
{
	evt = new CKEDITOR.dom.event( evt );
	var keystroke = evt.getKeystroke();
	var toSelectItem = null;
	switch ( keystroke )
	{
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

onShow: function(editor)
{
	this.deselectItem(this.selectedItem);
},


fetchContent: function(editor, lang, index, isFromError)
{
	try
	{
		var template = this.templateData.templates[index].template;
		var referrer= this;
		//get contents for the template that was clicked
		var xhrArgs =
		{
				url: this.pluginPath + 'templates/' + lang + template.file,
				handleAs: 'text',
				load: function(data)
				{
					var dirPath =  this.pluginPath + 'templates/';
					data = data.replace(/PATH_TO_PLUGIN_TEMPLATES/g,dirPath).replace(/<(!--)|(-->)/g,"");
					if(template.type == 'document')
					{
						editor.setData(data);
						pe.scene.headerfooter.remove(true);
						
						editor.on("contentDom", function(ev)
								{										
									ev.removeListener();									
									// clear UNDO
									editor.fire("resetUndo");
									var body = editor.document.getBody();
									editor.addIdToElement(body);
									var msg = SYNCMSG.createContentResetMsg();
									SYNCMSG.sendResetContentMsg([msg]);
								}
						);
					}
					else if (template.type == 'section')
					{
						// Not allow insert section into table
						var anc= editor.origRange.getCommonAncestor();
						if( anc.getAscendant('table',true))
						{
							var warningMessage = referrer.nls.concordtemplates.dlgInsertSectionError;
							pe.scene.showWarningMessage(warningMessage,2000);
							referrer.hide();
							return;
						}
						
						var hasTemplateClass = false;
						var docBody =  editor.document.getBody();
		
						for (var x=0; x < CKEDITOR.concordTemplatesClassNames.length; x++)
							if (docBody.hasClass(CKEDITOR.concordTemplatesClassNames[i]))
								hasTemplateClass = true;
		
						if (!hasTemplateClass)
							docBody.addClass(CKEDITOR.concordTemplatesClassNames[0]);
		
						editor.insertHtml(data);
						editor.fire('saveSnapshot');
					}
					else 
					{
						// if the template dialog was launched from the Add SmartTable dialog,
						// add the table name from the Add SmartTable dialog to the template table
		
						
						if (template.type == 'smartTable'){
						//ignore smart table in table
		
							if (editor.origRange && editor.origRange.startContainer ){
								var container = editor.origRange.startContainer.getAscendant('table',true);
								if (container){
									//a warning meesage should be shown here
									pe.scene.showErrorMessage(referrer.nls.clipboard.pasteTableToTableError,30000);
									referrer.hide();
									return;
								}
							}
							
		
						}
						if(referrer.cmdData && referrer.cmdData.filterType == 'smartTable')
						{
							var passedSTName = referrer.cmdData.stName;
							var tempNode = new CKEDITOR.dom.element( 'div', editor.document);
							tempNode.setHtml(data);
		
							for (var j=0; j<tempNode.getChildCount(); j++)
							{
								var node = tempNode.getChild(j);
								if (node.getName() == 'table')
								{
									node.setAttribute('title',passedSTName);
									data = tempNode.getHtml();
									break;
								}
							}
						}
		
						editor.insertHtml(data);
						editor.fire('saveSnapshot');
					}
		
					referrer.hide();
				},
				error: function(error)
				{
					if(isFromError)
						return;
					
					referrer.fetchContent(editor, "", index, true);
				}
		};

		
		// Not new document from Template
		if(!editor.createFromTemplate && template.type == 'document')
		{
			// confirm box.
			var nls = dojo.i18n.getLocalization("concord.widgets", "templateDesignGallery");
			var callback = function(editor, confirmed)
			{
				if(confirmed)
					dojo.xhrGet(xhrArgs);
				//else
				//	tempGallery.hide();
			};
			
			concord.util.dialogs.confirm(nls.confirmMsg, callback);
		}
		else{
		
			//lock this operation
			this.template_lock=true;
			dojo.xhrGet(xhrArgs);
		}
		editor.createFromTemplate = false;
	}
	catch(e)
	{
		if(window.g_concordInDebugMode)
		{
			console.log('***********************');
			console.log('ConcordTemplates Plugin > Error sending request to load user selected template');
			console.log(e);
			console.log('***********************');
		}
	}
},

onOk: function(editor)
{	
	//this.okImpl(editor);
	var origRange = editor.origRange;
	if(MSGUTIL.isSelectedRangeNotAvailable(origRange,true))
	{
		var warningMessage = this.tnls.targetRemovedWhenDialogOpen;
		pe.scene.showWarningMessage(warningMessage,2000);
		return false;
	}
	
	if (this.template_lock)
	{
		//don't generate a template more than one times when double-clicking, for defect 36915
		return false;
	}
	
	if(!this.selectedItem)
		return false;
	
	var id = this.selectedItem;
	id = id.substr(id.indexOf('_') + 1);

	for (var i=0; i<this.templateData.templates.length; i++)
	{
	
		if(this.templateData.templates[i].template.id == id)
		{
			var langCodeForTemplate = !editor.langCode || editor.langCode == 'en' || editor.langCode.indexOf('en-') == 0 ? '' : editor.langCode + '/';
			this.fetchContent(editor, langCodeForTemplate, i);
			break;
		}
	}
	return false;
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

// perform a text search on the title and description of each template based on what
// the user typed and show filtered results
showFilteredResults: function(filterTerm, editor)
{
	this.deselectItem(this.selectedItem);
	var resultsDiv = dojo.byId('concordTemplatesDialogResults');
	dojo.empty(resultsDiv);
	for(var n = 0; n < this.connectArray.length; n++)
	{
		dojo.disconnect(this.connectArray[n]);
	}
	this.connectArray = [];
	
	var ctr = 0;
	var resource;
	var previewImgPath = this.pluginPath + 'templates/' + this.templateData.thumbnailsImgName;
	var previewWidth = this.templateData.previewWidth;
	var previewHeight = this.templateData.previewHeight;
	var isFirst = true;
	
	for (var i=0; i<this.templateData.templates.length; i++)
	{
		resource = this.nls.concordtemplates[this.templateData.templates[i].template.lang];
		// perform template type filtering
		if (this.resultFilter == 'all' || this.resultFilter.indexOf(this.templateData.templates[i].template.type) >= 0 )
		{
			// perform case insensitive text search
			var regExp = null;
			if(filterTerm)
				regExp = new RegExp(filterTerm, 'i');
			
			if(!regExp || regExp.test(resource.title) || regExp.test(resource.description))
			{
				var resultsItemFrame = document.createElement('div');
				resultsItemFrame.className = 'concordTemplatesDialogItem';
				resultsItemFrame.id = "template_" + this.templateData.templates[i].template.id;
				resultsItemFrame.setAttribute('style','height: ' + (CKEDITOR.tools.toCmValue(previewHeight)+1.5) + 'cm;');
				resultsItemFrame.setAttribute('role', 'option');
				isFirst && !(isFirst = false) && resultsItemFrame.setAttribute('tabindex','0');
				
				var resultsItem = document.createElement('div');
				resultsItem.setAttribute('style','margin: 0 auto;background-color:#ffffff;border:2px solid #CCCCCC;padding:0px;'
										+ 'height: ' + previewHeight + ';'
										+ 'width: ' + previewWidth + ';');
				resultsItemFrame.appendChild(resultsItem);

				// add mouse actions to the result item
				//dojo.connect(resultsItem,'onmouseover',dojo.hitch(this,itemResultMouseOverAction,resultsItem));
				//dojo.connect(resultsItem,'onmouseout',dojo.hitch(this,itemResultMouseOutAction,resultsItem));
				var handler = dojo.connect(resultsItemFrame,'onclick',dojo.hitch(this,this.onTemplateClicked,resultsItemFrame, editor));
				this.connectArray.push(handler);
				handler = dojo.connect(resultsItemFrame,'onfocus',dojo.hitch(this,this.onTemplateFocus,resultsItemFrame, editor));
				this.connectArray.push(handler);
				handler = dojo.connect(resultsItemFrame,'onkeydown',dojo.hitch(this,this.onTemplateKeyUp,resultsItemFrame));
				this.connectArray.push(handler);
				handler = dojo.connect(resultsItemFrame,'onkeypress',dojo.hitch(this,this.onOkKeypress,resultsItemFrame));
				this.connectArray.push(handler);
				
				// creating item preview
				var resultsItemPreview = document.createElement('div');
				if (this.templateData.templates[i].template.type == 'smartTable')
					resultsItemPreview.className = 'concordTemplatesDialogItemPreviewSmartTable';
				else
					resultsItemPreview.className = 'concordTemplatesDialogItemPreviewDoc';
				/*
							var previewImgHTML = "<div class='concordTemplatesDialogPreviewTitle'>" + this.templateData.templates[i].template.title + "</div>";
							previewImgHTML = previewImgHTML + "<div class='concordTemplatesDialogPreviewDesc'>" + this.templateData.templates[i].template.description + "</div>";
							previewImgHTML = previewImgHTML + "<div class='concordTemplatesDialogItemPreviewImg'><img src='" + previewImgPath + "'></div>";
							new dijit.Tooltip({label:previewImgHTML, connectId:resultsItemPreview});				
				 */
				resultsItemPreview.setAttribute('style', 'border-style: none;background-image:url('+ previewImgPath +');'
							+ 'background-position: ' + this.templateData.templates[i].template.imgOffsetX + ' '
							+ this.templateData.templates[i].template.imgOffsetY + ';'
							+ 'height: ' + this.templateData.templates[i].template.imgHeight + ';'
							+ 'width: ' + this.templateData.templates[i].template.imgWidth + ';');
				resultsItem.appendChild(resultsItemPreview);

				var resultsItemTitle = document.createElement('div');
				resultsItemTitle.id = this.dialogId +this.templateData.templates[i].template.id;
				resultsItemTitle.className = 'concordTemplatesDialogItemTitle';
				resultsItemTitle.innerHTML = resource.title;
				resultsItemTitle.setAttribute('style','width: ' + previewWidth + ';');
				resultsItemFrame.appendChild(resultsItemTitle);

				var resultsItemDesc = document.createElement('div');
				resultsItemDesc.className = 'concordTemplatesDialogItemDescription';
				resultsItemDesc.setAttribute('style','width: ' + previewWidth + ';');
				
				resultsItemDesc.title=resource.description;
				var max_desc=40;
				if (resource.description.length>max_desc){
					resultsItemDesc.innerHTML = resource.description.substr(0, max_desc-3)+'...';
				}else{
					resultsItemDesc.innerHTML = resource.description;
				}
				
				resultsItemFrame.appendChild(resultsItemDesc);

				resultsDiv.appendChild(resultsItemFrame);
				ctr++;
			}
		}
	}
	this.updateSearchResultsTotal(ctr, editor);
},

// display all templates based on the template type selected
displayAllResults: function(editor)
{
	this.showFilteredResults(null, editor);
},

// get template data from the template repository
getTemplatesData: function(editor, cmdData)
{
	var referrer= this;
	try
	{
		var xhrArgs =
		{

				url: referrer.pluginPath + 'templates/templateIndex.json',
				handleAs: 'json',
				load: function(data)
				{
			if(window.g_concordInDebugMode)
			{
				console.log('***********************');
				console.log('ConcordTemplates Plugin > List of templates data received');
				console.log('***********************');
			}

			referrer.templateData = data;
			// once the templates are fetched, show the results
			referrer.displayAllResults(editor);

			if(cmdData && cmdData.filterType )
			{
				referrer.handleFilter(cmdData.filterType, editor);
			}

				},
				error: function(error)
				{
					if(window.g_concordInDebugMode)
					{
						console.log('***********************');
						console.log('ConcordTemplates Plugin > Error received while loading list of templates');
						console.log(error);
						console.log('***********************');
					}
					referrer.displaySearchError(editor);
				}
		}

		if(window.g_concordInDebugMode)
		{
			console.log('***********************');
			console.log('ConcordTemplates Plugin > Sending request to load list of templates');
			console.log('***********************');
		}

		var xhrCall = dojo.xhrGet(xhrArgs);
	}
	catch(e)
	{
		if(window.g_concordInDebugMode)
		{
			console.log('***********************');
			console.log('ConcordTemplates Plugin > Error while loading list of templates');
			console.log(e);
			console.log('***********************');
		}
		this.displaySearchError(editor);
	}
},

// based on user clicks on template type filters, change the class name of class name
// to show appropriate look
selectFilter: function(node)
{
	dojo.removeClass(node,'concordTemplatesDialogFilterNotSelected');
	dojo.addClass(node,'concordTemplatesDialogFilterSelected');		
},

deselectFilter: function(node)
{
	dojo.removeClass(node,'concordTemplatesDialogFilterSelected');
	dojo.addClass(node,'concordTemplatesDialogFilterNotSelected');				
},

selectItem: function(node)
{
	this.deselectItem(this.selectedItem);
	this.selectedItem = node.id;
	dojo.removeClass(node,'concordTemplatesDialogItem');
	dojo.addClass(node,'concordTemplatesDialogItemSelected');
	this.enableOkBtn(true);
},

deselectItem: function(selectedItem)
{
	if(selectedItem)
	{
		var node = dojo.byId(selectedItem);
		if(node)
		{
			this.selectedItem = null;
			dojo.removeClass(node,'concordTemplatesDialogItemSelected');
			dojo.addClass(node,'concordTemplatesDialogItem');
			this.enableOkBtn(false);
		}
	}
},

enableOkBtn: function(enable)
{
	var okBtn = dijit.byId(this.dialogId+'OKButton');
	if(okBtn)
	{
		okBtn._setDisabledAttr(!enable);
	}
},

// handle clicks on template type filters to change the UI elements and
// also perform filter on results
handleFilter: function(filterClicked, editor)
{
	var filterIds = [];
	filterIds["all"] = "concordTemplatesAllFilterSpan";
	filterIds["document"] = "concordTemplatesDocFilterSpan";
//	filterIds["smartTable"] = "concordTemplatesSTFilterSpan";
	filterIds["section"] = "concordTemplatesSectionFilterSpan";

	//clear all filters
	for( var i in filterIds )
	{
		this.deselectFilter( dojo.byId(filterIds[i]) );
	}

	//apply filters specified by the user
	var filters = filterClicked.split('|');
	for( var i in filters )
	{
		var node = dojo.byId(filterIds[filters[i]]);
		if( node )this.selectFilter( node );
	}
	
	if( this.resultFilter == filterClicked )
		return;

	this.resultFilter = filterClicked;
	this.deselectItem(this.selectedItem);

	// perform filtering based on template type and the string typed in the search box 
	if (this.searchStr.length <= 2)
		this.displayAllResults(editor);
	else
		this.showFilteredResults(this.searchStr, editor);
},



// add template results UI element
addResultsSection: function(mainDiv)
{
	var resultBoxDiv = document.createElement("div");
	dojo.addClass(resultBoxDiv,'concordTemplatesDialogResultBox');
	resultBoxDiv.id = "concordTemplatesDialogResults";
	resultBoxDiv.setAttribute('tabindex','-1');
	resultBoxDiv.setAttribute('role','listbox');
	resultBoxDiv.setAttribute('title', this.nls.concordtemplates.dlgLabelDefaultSearchbarValue + this.nls.concordtemplates.dlgLabelTemplates);
	resultBoxDiv.setAttribute('aria-label', this.nls.concordtemplates.dlgLabelDefaultSearchbarValue + this.nls.concordtemplates.dlgLabelTemplates);
	mainDiv.appendChild(resultBoxDiv);
}

});