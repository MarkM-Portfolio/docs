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

/*
 * @concordGallery CKEditor Plugin
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
dojo.provide("concord.widgets.concordGallery");
dojo.require("dojo.string");
dojo.require("concord.util.BidiUtils");
    dojo.declare("concord.widgets.concordGallery", null, {
		
		constructor: function(opts) {
    		this.opts=opts;    		
			this.mainDiv = (opts.mainDiv)? opts.mainDiv : null;
			//this.mainDiv = (opts.mainDiv)? opts.mainDiv.parentNode : null;
			this.onSelectCallback = (opts.onSelectCallback)? opts.onSelectCallback : null;
			this.clipPluginPath = (opts.clipPluginPath)? opts.clipPluginPath : null;
			this.userInfo = (opts.userInfo)? opts.userInfo : null;		
			this.handleClose = (opts.handleClose) ? opts.handleClose : null;
			this.CLIP_STRINGS = (opts.STRINGS)? opts.STRINGS : 	{'clipLabel': 'Clips',
																 'clipGalleryLabel' : 'Clip Gallery',
																 'show': 'Show',
																 'images': 'Image(s)',
																 'image' : 'Images',
																 'text': 'Text',
																 'pictures' :'Pictures',
																 'table':'Table',
																 'results':'Results',
																 'clip':'clip',
																 'title':'Title',
																 'description':'Description',
																 'clipDate':'Clip Date',
																 'source':'Source',
																 'owner':'Owner',
																 'all':'All',
																 'hits':'',
																 'refreshResults': 'Refresh Results',
																 'searchClips':'Search'};
			this.showErrorMessage = (opts.showErrorMessage)? opts.showErrorMessage : this.showErrorMessage;
			this.toolTipObjs =[];
			this.connects = [];
			this.init();
		},
		
		mainDiv: null,
		searchBoxObj:null,
		searchBoxTitle:" ",
		filterSectionDiv: null,
		lastSoftSelectedDiv: null,
		docsSearchResultsArray: [],
		arrowClipArray: [],
		bulletClipArray: [],
		computerClipArray: [],
		diagramClipArray: [],
		educationClipArray: [],
		environmentClipArray: [],
		financeClipArray: [],
		peopleClipArray: [],
		shapeClipArray: [],
		symbolClipArray: [],
		transportationClipArray: [],
		imageClipArray:[],
		pictureClipArray: [],
		textClipArray:[],
		quoteClipArray:[],
		tableClipArray:[],
		resultBoxDiv:null,
		clipPluginPath:null,
		SHOW_TEXT: true,
		SHOW_ARROW: true,
		SHOW_BULLET: true,
		SHOW_COMPUTER: true,
		SHOW_DIAGRAM: true,
		SHOW_EDUCATION: true,
		SHOW_ENVIRONMENT: true,
		SHOW_FINANCE: true,
		SHOW_PEOPLE: true,
		SHOW_SHAPE: true,
		SHOW_SYMBOL: true,
		SHOW_TRANSPORTATION: true,
		SHOW_IMAGE: true,
		SHOW_PICTURE: true,
		SHOW_TABLE: true,
		SHOW_QUOTE: true,
		SHOW_ALL: true,
		toolTipObjs: [],
		connects: [],
		galleryPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/concordGallery/',
		galleryJSONPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/concordGallery/galleryItemIndex.json',
		
		selectedItemsArray : [],
		clipPosition: {'top':0,'left':0},
		
		init: function(){
			this.addSearchBar();
			this.addSearchFilters();
			this.addResultsSection();
			//this.populateImageClipArray();
			//this.populateTextClipArray();

			//this.addDialogButtons();
			this.processFilterOnRefresh();
			concord.util.events.subscribe(concord.util.events.keypressHandlerEvents, null, dojo.hitch(this,this.handleKeySubscriptionEvents));
			
			if (this.mainDiv) {
				dojo.connect(this.mainDiv, "onkeypress", this, "handleKeyPress");
			}

			this.loadFreshGallery();
		},
		
		showDialog: function() {
			this.lastSoftSelectedDiv = null;
		},
		
		loadFreshGallery: function(){
			this.resetAllArrays();
			this.getTemplatesData();
			//this.getPluginClips();
			//this.getClipsFromConcord();			
		},

		refreshGallery: function(){
			if (dijit.byId('ckEditorClipGallery')!=null){
				this.loadFreshGallery();
				this.processFilterOnRefresh();							
			}
	        this.updateTabIndexes();
		},
		
		handleKeySubscriptionEvents: function( data){
			if (pe.scene.getFocusComponent() == 'dialogs'){
				if ( data.eventAction == concord.util.events.keypressHandlerEvents_eventAction_ENTER){
					var selectedItems = dojo.query(".clipPickerDialogItemHovered",this.resultBoxDiv);
					for ( var i = 0; i < selectedItems.length ; i++){				
						this.itemClick(selectedItems[i]);
					}
				} 
			}
		},
		
		// Right now arrow keys are blocked in the keypressHandler when the dialog is in focus. For now
		// the standard onkeypress event is being detected but this can be changed if necessary so that
		// we unblock the arrow keys in keypressHandler and fix the listeners (slide sorter) that is 
		// picking up the key strokes.
		handleKeyPress: function(event){

			if(event.keyCode==dojo.keys.RIGHT_ARROW) {
				var node = (typeof( window.event ) != "undefined" ) ? event.srcElement : event.target;
				var parentNode = node.parentNode.parentNode.parentNode;
				if(parentNode != null && parentNode.id == 'P_d_MasterStyles_ContentDiv')
				{
					dojo.stopEvent(event);
					return;
				}
				if((node && node.parentNode && dojo.hasClass(node.parentNode,'clipPickerDialogResultBox')) || (node && node.parentNode && node.parentNode.parentNode && dojo.hasClass(node.parentNode.parentNode,'clipPickerDialogResultBox'))){
				var selectedItems = [ this.lastSoftSelectedDiv ];
				if (this.lastSoftSelectedDiv == null) {
					selectedItems = dojo.query(".clipPickerDialogItemHovered",this.resultBoxDiv);
				}
				if (selectedItems.length > 0) {
					var itemDiv = selectedItems[selectedItems.length - 1];
					
					var candidateIndex = itemDiv.docsSearchIndex + 1;
					var candidate = null;
					
					while (candidateIndex != itemDiv.docsSearchIndex) {
						
						if (candidateIndex >= this.docsSearchResultsArray.length) {
							candidateIndex = 0;
						}
						
						candidate = this.docsSearchResultsArray[candidateIndex];

						var style = dojo.attr(candidate,"style");
						
						if (style) {
							if (style.toLowerCase().indexOf("display: none") >= 0) {
								candidateIndex += 1;
								candidate = null;
								continue;
							}
						}
						
						break;
					}
					
					if (candidate) {
						this.deSoftSelectItem(itemDiv);
						this.softSelectItem(candidate);
						candidate.focus();
					}				
				}
			}
				
			} else if(event.keyCode==dojo.keys.LEFT_ARROW) {
				var node = (typeof( window.event ) != "undefined" ) ? event.srcElement : event.target;
				var parentNode = node.parentNode.parentNode.parentNode;
				if(parentNode != null && parentNode.id == 'P_d_MasterStyles_ContentDiv')
				{
					dojo.stopEvent(event);
					return;
				}
				if((node && node.parentNode && dojo.hasClass(node.parentNode,'clipPickerDialogResultBox')) || (node && node.parentNode && node.parentNode.parentNode && dojo.hasClass(node.parentNode.parentNode,'clipPickerDialogResultBox'))){
				var selectedItems = [ this.lastSoftSelectedDiv ];
				if (this.lastSoftSelectedDiv == null) {
					selectedItems = dojo.query(".clipPickerDialogItemHovered",this.resultBoxDiv);
				}
				if (selectedItems.length > 0) {
					var itemDiv = selectedItems[0];
					
					var candidateIndex = itemDiv.docsSearchIndex - 1;
					var candidate = null;
					
					while (candidateIndex != itemDiv.docsSearchIndex) {
						
						if (candidateIndex < 0) {
							candidateIndex = this.docsSearchResultsArray.length - 1;
						}
						
						candidate = this.docsSearchResultsArray[candidateIndex];

						var style = dojo.attr(candidate,"style");
						
						if (style) {
							if (style.toLowerCase().indexOf("display: none") >= 0) {
								candidateIndex -= 1;
								candidate = null;
								continue;
							}
						}
						
						break;
					}
					
					if (candidate) {
						this.deSoftSelectItem(itemDiv);
						this.softSelectItem(candidate);
						candidate.focus();
					}				
				}
			}
			}
		},
		
		findDisplayIndex: function(arr){
			if (arr == null)
				return -1;
			for(var i = 0; i < arr.length; i++) {
				candidate = arr[i];
				var style = dojo.attr(candidate,"style");
				if (style) {
					if (style.toLowerCase().indexOf("display: none") >= 0) {
						continue;
					}
				}
				return i;
			}
			return -1;
		},
		
		updateTabIndexes: function(){
			// defect 9695 dojo compares the tab indexes as strings instead of numbers making 10 < 9
			
			// We don't want to tab through these images, instead we'll use arrow keys. However the first
			// item is a tab destination.
			var firstIndexNumber = 30;			
	        //var resultItemsArray = dojo.query('.clipPickerDialogItem, .clipPickerDialogItemHovered, .clipPickerDialogItemSelected',this.mainDiv);
			var resultItemsArray = dojo.query('>[id]',this.resultBoxDiv);
	        this.docsSearchResultsArray = resultItemsArray;
	        
	        toIndex = this.findDisplayIndex(resultItemsArray);
	        if (toIndex >= 0) {
	        	dojo.attr( resultItemsArray[toIndex], 'tabindex', firstIndexNumber);
	        	this.lastSoftSelectedDiv = resultItemsArray[toIndex];
	        }
			for (var i=0; i<resultItemsArray.length;i++){
				resultItemsArray[i].docsSearchIndex = i;
				if (i != toIndex) {
		        	dojo.attr( resultItemsArray[i], 'tabindex', -1);
				}
			}
			var parentDialog = this._getParentDialog();
			if ( parentDialog ){
				var buttonItemsArray = dojo.query('.dijitButtonContents', parentDialog.domNode);
//				for (var j=0; j<buttonItemsArray.length; j++){
//					dojo.attr( buttonItemsArray[j], 'tabindex', resultItemsArray.length + j + firstIndexNumber);
//				}
				parentDialog._getFocusItems(parentDialog.domNode);
			}
		},
		
		_getParentDialog: function(){
			var node = this.mainDiv;
			while ( node && node.nodeName.toLowerCase() != 'body' && node.nodeName.toLowerCase() != 'iframe'){
				node = node.parentNode;
				if ( node && dojo.hasClass( node, 'dijitDialog')){
					return dijit.byId(node.id);				
				}
			}
			return;
		},
		
		resetAllArrays: function(){
			this.arrowClipArray=[];
			this.bulletClipArray=[];
			this.computerClipArray=[];
			this.diagramClipArray=[];
			this.educationClipArray=[];
			this.environmentClipArray=[];
			this.financeClipArray=[];
			this.peopleClipArray=[];
			this.shapeClipArray=[];
			this.symbolClipArray=[];
			this.transportationClipArray=[];
			this.imageClipArray=[];
			this.pictureClipArray=[];
			this.textClipArray=[];
			this.quoteClipArray=[];
			this.tableClipArray=[];
		},


		getClipsFromConcord: function(){
			//Get Text clips first
			var paramFilter ={'createdBy':this.userInfo.getId()};
			var txtclips = concord.beans.ObjectService.getRootObjects("txtclip",paramFilter);

			for (var i=0; i< txtclips.length; i++){
				var data = txtclips[i].getData();
				if (data.clip_uuid !=null) {
					this.textClipArray.push({'id':data.clip_uuid,
								 'name':data.clip_name,
								 'type':'text',		
								 'title':'Text '+i,
								 'tags':'',		
								 'description':data.clip_description,
								 'content':decodeURIComponent(data.clip_html),
								 'date':data.clip_date,									 
								 'source':data.clip_source});			
				}
			}
			
			//Get Image clips second
			var imgclips = concord.beans.ObjectService.getRootObjects("imgclip",paramFilter);

			for (var i=0; i< imgclips.length; i++){
				var data = imgclips[i].getData();
				if (data.clip_uuid !=null) {
					var tmpDiv = document.createElement('div');
					tmpDiv.innerHTML = decodeURIComponent(data.clip_html);
				
					this.imageClipArray.push({'id':data.clip_uuid,
								 'name':data.clip_name,
								 'type':'image',		
								 'title':'Image '+i,
								 'tags':'',		
								 'description':data.clip_description,
								 'source':data.clip_source,
								 'date':data.clip_date,									 
								 'src':dojo.attr(tmpDiv.firstChild,'src')});			
				}
			}			

			//Get Table clips second
			var tblclips = concord.beans.ObjectService.getRootObjects("tblclip",paramFilter);

			for (var i=0; i< tblclips.length; i++){
				var data = tblclips[i].getData();
				if (data.clip_uuid !=null) {			
					this.tableClipArray.push({'id':data.clip_uuid,
								 'name':data.clip_name,
								 'type':'table',		
								 'title':'Table '+i,
								 'tags':'',		
								 'description':data.clip_description,
								 'source':data.clip_source,
								 'date':data.clip_date,									 
								 'content':decodeURIComponent(data.clip_html)});			
				}
			}					
		},

		
		//
		// Displaying results in gallery
		//
		displayAllResults: function(data) {
		  var resultArray = (data.templates)? data.templates : [];
		  this.resetAllArrays();
			for (var i=0; i< resultArray.length; i++){
				var data = resultArray[i].template;
				if (data.type=="arrow"){					
					this.arrowClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'arrow',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="bullet"){					
					this.bulletClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'bullet',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});	
				} else if (data.type=="computer"){					
					this.computerClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'computer',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="diagram"){					
					this.diagramClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'diagram',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="education"){					
					this.educationClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'education',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="environment"){					
					this.environmentClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'environment',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="finance"){					
					this.financeClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'finance',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="people"){					
					this.peopleClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'people',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="shape"){					
					this.shapeClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'shape',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="symbol"){					
					this.symbolClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'symbol',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="transportation"){					
					this.transportationClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'transportation',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});
				} else if (data.type=="image"){
					this.imageClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'image',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});	
				} else if (data.type=="picture"){					
					this.pictureClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'picture',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'src':this.galleryPath+data.previewImg});	
				}
			}	
			this.renderResults();
		},
		
		
		
		//
		// Get images for image gallery
		//
		getTemplatesData: function(){
			var referrer= this;
			try
			{
				var xhrArgs =
					{
						
						url: this.galleryJSONPath,
						handleAs: 'json',
						load: dojo.hitch(this, function(data) {
							if(window.g_concordInDebugMode)
							{
								console.log('***********************');
								console.log('ConcordImageGallery Plugin > List of templates data received');
								console.log('***********************');
							}
							// once the templates are fetched, show the results
							this.displayAllResults(data);							
						}),
						error: function(error)
						{
							if(window.g_concordInDebugMode)
							{
								console.log('***********************');
								console.log('ConcordImageGallery Plugin > Error received while loading list of templates');
								console.log(error);
								console.log('***********************');
							}
							displaySearchError(editor);
						}
					}
				
				if(window.g_concordInDebugMode)
				{
					console.log('***********************');
					console.log('ConcordImageGallery Plugin > Sending request to load list of templates');
					console.log('***********************');
				}
					
				var xhrCall = dojo.xhrGet(xhrArgs);
			}
			catch(e)
			{
				if(window.g_concordInDebugMode)
				{
					console.log('***********************');
					console.log('ConcordImageGallery Plugin > Error while loading list of templates');
					console.log(e);
					console.log('***********************');
				}
				displaySearchError(editor);
			}
		},

		//Go fetch data from plugin		
		getPluginClips: function(){
			var pluginClipsArray =[];
			if ((document.body.santoriniPluginOpts) &&(document.body.santoriniPluginOpts.getClipsFromDB)){
				pluginClipsArray = document.body.santoriniPluginOpts.getClipsFromDB();
		
				//(clip_name, clip_type, clip_html, clip_description, clip_source, clip_date, clip_uuid, clip_owner)
				
				for (var i=0; i < pluginClipsArray.length; i++){
					if (pluginClipsArray[i].clip_type =="image"){
						var tmpDiv = document.createElement('div');
						tmpDiv.innerHTML = decodeURIComponent(pluginClipsArray[i].clip_html);
						this.imageClipArray.push({'id':pluginClipsArray[i].clip_id,
									 'name':pluginClipsArray[i].clip_name,
									 'type':'image',
									 'title':'Image '+i,
									 'tags':'',		
									 'description':pluginClipsArray[i].clip_description,
									 'source':pluginClipsArray[i].clip_source,
									 'date':pluginClipsArray[i].clip_date,
									 'src':dojo.attr(tmpDiv.firstChild,'src')});			
					} else 	if (pluginClipsArray[i].clip_type =="text"){
						var tmpDiv = document.createElement('div');
						tmpDiv.innerHTML = pluginClipsArray[i].clip_source;
					
						this.textClipArray.push({'id':pluginClipsArray[i].clip_id,
									 'name':pluginClipsArray[i].clip_name,
									 'type':'text',		
									 'title':'Text '+i,
									 'tags':'',		
									 'description':pluginClipsArray[i].clip_description,
									 'content':decodeURIComponent(pluginClipsArray[i].clip_html),
									 'date':pluginClipsArray[i].clip_date,									 
									 'source':pluginClipsArray[i].clip_source});			
					} else 	if (pluginClipsArray[i].clip_type =="table"){
						var tmpDiv = document.createElement('div');
						tmpDiv.innerHTML = pluginClipsArray[i].clip_html;
						this.tableClipArray.push({'id':pluginClipsArray[i].clip_id,
									 'name':pluginClipsArray[i].clip_name,
									 'type':'table',		
									 'title':'Table '+i,
									 'tags':'',		
									 'description':pluginClipsArray[i].clip_description,
									 'source':pluginClipsArray[i].clip_source,
									 'date':pluginClipsArray[i].clip_date,
									 'content':pluginClipsArray[i].clip_html});									
					}
					
				}
				
		  } 
		
		},
		
		
		addResultsSection: function(){
			var resultBoxDiv = this.resultBoxDiv = document.createElement("div");
			dojo.addClass(resultBoxDiv,'clipPickerDialogResultBox');
			dijit.setWaiRole(resultBoxDiv, 'listbox');
			dijit.setWaiState(resultBoxDiv, 'label', 'clip picker dialog result box');
			this.mainDiv.appendChild(resultBoxDiv);
			resultBoxDiv.appendChild(document.createTextNode(this.CLIP_STRINGS.loading));
			
			if (dojo.isIE){
				dojo.style(resultBoxDiv, {
					'top':'0px',
					'height':'183px'
				});			
			}
//			dojo.style(this.resultBoxDiv,{
//				'height':(this.opts.height - 162) +"px"
//			});			
		},
		
		addDialogButtons : function(){
	
			var buttonsForDialogDiv = document.createElement("div");
			dojo.addClass(buttonsForDialogDiv,'clipPickerDialogButtonsSection');
			this.mainDiv.appendChild(buttonsForDialogDiv);
			/*
		
			dojo.style(buttonsForDialogDiv, {
				'position':'relative',
				'top':'-10px',
				'color':'blue',
				'background':'transparent',
				'border':'0px solid #C6D2DA',				
				'height':'25px',
				'margin':'10px',
				'width':'200px',
				'color':'#000000',
				'fontFamily':'arial'
				
			});				
			*/
			var okSpan = document.createElement('div');
			buttonsForDialogDiv.appendChild(okSpan);
			
			
			var okBtn = document.createElement('div');			
			dojo.addClass(okBtn,'clipPickerDialogButton');
			okSpan.appendChild(okBtn);
			okBtn.appendChild(document.createTextNode('Done'));
			
			dojo.connect(okBtn,'onmouseover',dojo.hitch(this,this.btnMouseOver,okBtn));
			dojo.connect(okBtn,'onmouseout',dojo.hitch(this,this.btnMouseOut,okBtn));
			
			dojo.connect(okBtn,'onclick',dojo.hitch(this,this.hideGallery));
			
			/*
			var cancelSpan = document.createElement('div');
			buttonsForDialogDiv.appendChild(cancelSpan);
			dojo.style(cancelSpan, {
				'position':'relative',
				'top':'-29px',
				'left':'59px'
			});
			
			var cancelBtn = document.createElement('div');			
			dojo.addClass(cancelBtn,'clipPickerDialogButton');

			cancelSpan.appendChild(cancelBtn);
			cancelBtn.appendChild(document.createTextNode('Cancel'));
			
			dojo.connect(okBtn,'onmouseover',dojo.hitch(this,this.btnMouseOver,okBtn));
			dojo.connect(okBtn,'onmouseout',dojo.hitch(this,this.btnMouseOut,okBtn));
			dojo.connect(cancelBtn,'onmouseover',dojo.hitch(this,this.btnMouseOver,cancelBtn));
			dojo.connect(cancelBtn,'onmouseout',dojo.hitch(this,this.btnMouseOut,cancelBtn));
			
			dojo.connect(okBtn,'onclick',dojo.hitch(this,this.hideGallery));
			dojo.connect(cancelBtn,'onclick',dojo.hitch(this,this.hideGallery));
			*/
		},
		
		btnMouseOver: function(btn){
			dojo.style( btn, {
				'background':'#C6D2DA url(../images/buttonEnabled.png) repeat-x scroll left bottom'				
			});		
		},
		
		btnMouseOut: function(btn){
			dojo.style( btn, {
				'background':''				
			});		
		},		
		
		hideGallery: function(){
			dijit.byId('ckEditorClipGallery').hide();
		
		},
		
		selectFilter: function(node){
			try{
				dojo.removeClass(node,'clipPickerDialogFilterNotSelected');
				dojo.addClass(node,'clipPickerDialogFilterSelected');		
			}catch(e){}
		},
		
		deSelectFilter: function(node){
			try{
				dojo.removeClass(node,'clipPickerDialogFilterSelected');
				dojo.addClass(node,'clipPickerDialogFilterNotSelected');				
			}catch(e){}	
		},
		
		addSearchFilters: function(){
	
			var filterSectionDiv = this.filterSectionDiv = document.createElement("div");
			this.mainDiv.appendChild(filterSectionDiv);
			dojo.addClass(filterSectionDiv,"clipPickerDialogFilterSection");
			/*
			dojo.style(filterSectionDiv, {
				'position':'relative',
				'top':'0px',
				'background':'transparent',
				'border':'0px solid #C6D2DA',
				'color':'black',
				'fontSize':'11px',
				'margin':'4px',
				'padding':'4px 4px 4px 4px',
				//'width':'100%',
				'height':'10px'
			});		
			*/		
			
			var resultSpan = this.resultTitle = document.createElement("span");
			this.updateResultTitle('0');
			filterSectionDiv.appendChild(resultSpan);
			dojo.addClass(resultSpan,'clipPickerDialogResultCount');
			/*
			dojo.style(resultSpan, {
				'position':'absolute',
				'top':'0px',				
				'left':'8px',
				'color':'black',
				'border':'0px solid #C6D2DA',				
				'background':'transparent'
			});				
		  */
		  
		 /* No need to add refresh button here */
//		  var refreshResultSpan = document.createElement('span');
//		  dojo.addClass(refreshResultSpan,'clipPickerRefreshResultSpan');
//		  refreshResultSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.refreshResults));
//		  filterSectionDiv.appendChild(refreshResultSpan);
//		  dojo.connect(refreshResultSpan,'onclick',dojo.hitch(this,this.refreshGallery));

		  
		  
		  var filterSpan = document.createElement("span");
	      dojo.addClass(filterSpan,'clipPickerDialogFilterSpan');
	      /*
			dojo.style(filterSpan, {
				'position':'absolute',
				'top':'0px',
				'right':'0px',
				'color':'black',
				'border':'0px solid #C6D2DA',				
				'background':'transparent',
				'width':'158px'
			});		
			*/		
			filterSectionDiv.appendChild(filterSpan);
			
				var showSpan = document.createElement("span");
				filterSpan.appendChild(showSpan);
				showSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.show));
				

				var allSpan = this.allSpan = document.createElement('span');
				filterSpan.appendChild(allSpan);
				allSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.all));
				
				this.selectFilter(allSpan);
				/*
				dojo.style(allSpan, {
					'cursor':'pointer',
					'color':'black'
				});		
				*/
				var sepSpan = document.createElement("span");
				filterSpan.appendChild(sepSpan);
				sepSpan.appendChild(document.createTextNode(" | "));
				
				var imageSpan = this.imageSpan = document.createElement('span');
				filterSpan.appendChild(imageSpan);
				imageSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.images));				
				
				this.deSelectFilter(imageSpan);
				
				/*
				dojo.style(imageSpan, {
					'cursor':'pointer',
					'color':'#008abf'
				});	
				*/	
				
				var sepSpan = document.createElement("span");
				filterSpan.appendChild(sepSpan);
				sepSpan.appendChild(document.createTextNode(" | "));
						

				var textSpan = this.textSpan = document.createElement('span');
				filterSpan.appendChild(textSpan);
				textSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.pictures));				
				
				this.deSelectFilter(textSpan);
				
				/*
				dojo.style(textSpan, {
					'cursor':'pointer',
					'color':'#008abf'
				});		
				*/
				
								
				var sepSpan = document.createElement("span");
				filterSpan.appendChild(sepSpan);
				sepSpan.appendChild(document.createTextNode(" | "));
						
				dojo.style(sepSpan, {
					'display':'none'
				});		

				var tableSpan = this.tableSpan = document.createElement('span');
				filterSpan.appendChild(tableSpan);
				tableSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.table));					

				this.deSelectFilter(tableSpan);

				
				dojo.style(tableSpan, {
					'display':'none'
				});		
				
		  		dojo.connect(allSpan,'onclick',dojo.hitch(this,this.handleFilter,'all',allSpan));
		  		dojo.connect(imageSpan,'onclick',dojo.hitch(this,this.handleFilter,'image',imageSpan));
		  		dojo.connect(textSpan,'onclick',dojo.hitch(this,this.handleFilter,'text',textSpan));
		  		dojo.connect(tableSpan,'onclick',dojo.hitch(this,this.handleFilter,'table',tableSpan));		  				  		
		
		},
		
		handleFilter: function(id,node){
			this.deSelectAll(); 
			if (id=='arrow'){
					this.SHOW_ARROW=true;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='bullet'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=true;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='computer'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=true;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='diagram'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=true;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='education'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=true;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='environment'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=true;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='finance'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=true;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='people'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=true;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='shape'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=true;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='symbol'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=true;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 }else if (id=='transportation'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=true;
			 		this.SHOW_ALL=false;
			 }else if (id=='image'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 		this.SHOW_IMAGE=true;  this.selectFilter(this.imageSpan);
			 		this.SHOW_TEXT=false;  this.deSelectFilter(this.textSpan);
			 		this.SHOW_TABLE=false; this.deSelectFilter(this.tableSpan);
			 		this.SHOW_ALL=false;   this.deSelectFilter(this.allSpan);
			 		this.SHOW_PICTURE=false;this.deSelectFilter(this.picSpan);
			 }else if (id=='picture'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
				 	this.SHOW_PICTURE=true;this.selectFilter(this.picSpan);
			 		this.SHOW_IMAGE=false; this.deSelectFilter(this.imageSpan);
			 		this.SHOW_TEXT=false;  this.deSelectFilter(this.textSpan);
			 		this.SHOW_TABLE=false; this.deSelectFilter(this.tableSpan);
			 		this.SHOW_ALL=false;   this.deSelectFilter(this.allSpan);		
			 }else if (id=='text'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 		this.SHOW_IMAGE=false; this.deSelectFilter(this.imageSpan);
			 		this.SHOW_TEXT=true;   this.selectFilter(this.textSpan);
			 		this.SHOW_TABLE=false; this.deSelectFilter(this.tableSpan);
			 		this.SHOW_ALL=false;   this.deSelectFilter(this.allSpan);
			 		this.SHOW_PICTURE=false;this.deSelectFilter(this.picSpan);			 		
			 }else if (id=='table'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 		this.SHOW_IMAGE=false; this.deSelectFilter(this.imageSpan);
			 		this.SHOW_TEXT=false;  this.deSelectFilter(this.textSpan);
			 		this.SHOW_TABLE=true;  this.selectFilter(this.tableSpan);
			 		this.SHOW_ALL=false;   this.deSelectFilter(this.allSpan);
			 		this.SHOW_PICTURE=false;this.deSelectFilter(this.picSpan);			 		
			 }else if (id=='quote'){
					this.SHOW_ARROW=false;
					this.SHOW_BULLET=false;
					this.SHOW_COMPUTER=false;
					this.SHOW_DIAGRAM=false;
					this.SHOW_EDUCATION=false;
					this.SHOW_ENVIRONMENT=false;
					this.SHOW_FINANCE=false;
					this.SHOW_PEOPLE=false;
					this.SHOW_SHAPE=false;
					this.SHOW_SYMBOL=false;
					this.SHOW_TRANSPORTATION=false;
			 		this.SHOW_ALL=false;
			 		this.SHOW_IMAGE=false; this.selectFilter(this.imageSpan);
			 		this.SHOW_TEXT=false;  this.deSelectFilter(this.textSpan);
			 		this.SHOW_TABLE=false; this.deSelectFilter(this.tableSpan);
			 		this.SHOW_ALL=true;    this.deSelectFilter(this.allSpan);
			 		this.SHOW_PICTURE=false;this.deSelectFilter(this.picSpan);			 		
		 	 } else {
					this.SHOW_ARROW=true;
					this.SHOW_BULLET=true;
					this.SHOW_COMPUTER=true;
					this.SHOW_DIAGRAM=true;
					this.SHOW_EDUCATION=true;
					this.SHOW_ENVIRONMENT=true;
					this.SHOW_FINANCE=true;
					this.SHOW_PEOPLE=true;
					this.SHOW_SHAPE=true;
					this.SHOW_SYMBOL=true;
					this.SHOW_TRANSPORTATION=true;
			 		this.SHOW_IMAGE=true; this.deSelectFilter(this.imageSpan);
			 		this.SHOW_TEXT=true;  this.deSelectFilter(this.textSpan);
			 		this.SHOW_TABLE=true; this.deSelectFilter(this.tableSpan);
			 		this.SHOW_ALL=true;
			 		this.SHOW_PICTURE=true;this.deSelectFilter(this.picSpan);			 		
		 	 }
			
			this.getUserKeyStroke(null);
		},		
		
		
		getUserKeyStroke: function(event){
	       var text = this.searchBoxObj.getValue();
	       //debugger;
	       /*
	       if (event.keyCode==dojo.keys.ENTER){
	            var text = this.searchBoxObj.getValue();
	            if ( text.length !== 0 ){
	                console.log("concordGallery :: getUserKeyStroke : ENTER key pressed!"); 
	                //this.searchBoxObj.setValue("");
	            }//else ignore since text is empty
	       } else 
	       */
	       if ((event) && (event.keyCode==dojo.keys.ESCAPE)){
	    	  if(this.handleClose)
	    		  this.handleClose();
	       }
	       var numResult =0;
	       if ((text.length >= 1) && (text!=this.CLIP_STRINGS.searchClips)){
	       		this.deSelectAll();
	       		numResult = this.filterNow(text.toLowerCase());
	       		this.updateTabIndexes();
	       
	       } else {
	       		numResult = this.showAllResults();
	       		this.updateTabIndexes();
	       }	
		   this.updateResultTitle(numResult);	
		   if (this instanceof concord.widgets.imageGallery) {
			   this.handleSelection();
		   }		   
		},
		
	
		showAllResults: function(){
			var ctr = 0;
			var resultItemsArray = dojo.query(".clipPickerDialogItem,.clipPickerDialogItemSelected,.clipPickerDialogItemHovered",this.resultBoxDiv);
			for (var i=0; i<resultItemsArray.length;i++){
				var obj = resultItemsArray[i].resultItemObj;
				if (obj.type=="text"){
					if (this.SHOW_TEXT){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="arrow"){
					if (this.SHOW_ARROW){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="bullet"){
					if (this.SHOW_BULLET){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="computer"){
					if (this.SHOW_COMPUTER){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="diagram"){
					if (this.SHOW_DIAGRAM){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="education"){
					if (this.SHOW_EDUCATION){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="environment"){
					if (this.SHOW_ENVIRONMENT){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="finance"){
					if (this.SHOW_FINANCE){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="people"){
					if (this.SHOW_PEOPLE){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="shape"){
					if (this.SHOW_SHAPE){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="symbol"){
					if (this.SHOW_SYMBOL){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="transportation"){
					if (this.SHOW_TRANSPORTATION){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				} else if (obj.type=="image"){
					if (this.SHOW_IMAGE){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				}else if (obj.type=="table"){
					if (this.SHOW_TABLE){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				}else if (obj.type=="quote"){
					if (this.SHOW_ALL){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				}else if (obj.type=="picture"){
					if (this.SHOW_PICTURE){
						dojo.style(resultItemsArray[i],{
										'display':''
						});	
						ctr++;
					} else{
						dojo.style(resultItemsArray[i],{
										'display':'none'
						});					
					}
				}		
			}
		
			return ctr;
		},
	
		filterNow: function(userInput){
			// get all child nodes of result box nodes that 
			var ctr = 0;
			var resultItemsArray = dojo.query(".clipPickerDialogItem",this.resultBoxDiv);
			
			for (var i=0; i<resultItemsArray.length;i++){	
	//			if (resultItemsArray[i].style.display!='none'){
					var obj = resultItemsArray[i].resultItemObj;
					//debugger;
					
					if (obj.type=="text"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.description.toLowerCase().indexOf(userInput) >=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||
							 ((obj.content) && (obj.content.toLowerCase().indexOf(userInput)>=0))) && (this.SHOW_TEXT)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {		 
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} if (obj.type=="quote"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.description.toLowerCase().indexOf(userInput) >=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||							 
							 ((obj.content) && (obj.content.toLowerCase().indexOf(userInput)>=0))) && (this.SHOW_QUOTE)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="arrow"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_ARROW)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="bullet"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_BULLET)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="computer"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_COMPUTER)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="diagram"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_DIAGRAM)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="education"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_EDUCATION)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="environment"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_ENVIRONMENT)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="finance"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_FINANCE)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="people"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_PEOPLE)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="shape"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_SHAPE)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="symbol"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_SYMBOL)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="transportation"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_TRANSPORTATION)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="image"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_IMAGE)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					} else if (obj.type=="picture"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
								 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
								 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_PICTURE)){
									dojo.style(resultItemsArray[i],{
										'display':''
									});		
									ctr++;				 					 
							} else {
								dojo.style(resultItemsArray[i],{
									'display':'none'
								});
							}
					 } else if (obj.type=="table"){
						if (((obj.name.toLowerCase().indexOf(userInput)>=0) ||
							 (obj.date.toLowerCase().indexOf(userInput) >=0) ||						
							((obj.content) && (obj.content.toLowerCase().indexOf(userInput)>=0)) ||
							 (obj.description.toLowerCase().indexOf(userInput) >=0)) && (this.SHOW_TABLE)){
								dojo.style(resultItemsArray[i],{
									'display':''
								});		
								ctr++;				 					 
						} else {
							dojo.style(resultItemsArray[i],{
								'display':'none'
							});
						}
					}
		//		}
			}	
			return ctr;		
		},
		
		
		searchBarOnFocus: function(){
		    var text = this.searchBoxObj.getValue();//get the value in the search bar
			if (text==this.CLIP_STRINGS.searchClips){
				this.searchBoxObj.setValue("");	
				dojo.style(this.searchBoxObj.domNode, {
					'color':'#585858'
				});				
					
			}
		},
	
		searchBarOnBlur: function(){
		    var text = this.searchBoxObj.getValue();//get the value in the search bar
			if (text.length==0){
				this.searchBoxObj.setValue(this.CLIP_STRINGS.searchClips);
				dojo.style(this.searchBoxObj.domNode, {
					'color':'#ACACAC'
				});				
						
			}
		
		},
			
		addSearchBar: function(){
			//Add search bar
			var id = 'clipper_SearchBoxID_'+ new Date().getTime();
			//The searchbox id must be unique or multiple dialogs cannot be opened.
			
			if (this instanceof concord.widgets.imageGallery) {
				id = 'clipper_SearchBoxID_addImageDlg';
			}
			
			var searchDivSection = this.searchDivSection = document.createElement("div");
			searchDivSection.id = 'searchDivSection_'+ new Date().getTime();
			this.mainDiv.appendChild(searchDivSection);
			if (dijit.byId(id) ==null){
				this.searchBoxObj = new dijit.form.TextBox({'id': 'searchBox_'+id, 'trim':true, 'maxLength':'100', 'value':this.CLIP_STRINGS.searchClips},this.searchDivSection); 
				this.searchBoxObj.startup();
				if (BidiUtils.isBidiOn()){
					dojo.attr(this.searchBoxObj.focusNode, "dir",BidiUtils.getTextDir());
					if (dojo.attr(this.searchBoxObj.focusNode, "dir") == "contextual") {
						dojo.connect(this.searchBoxObj.focusNode, 'onkeyup', dojo.hitch(this, function(){
							dojo.attr(this.searchBoxObj.focusNode, "dir", BidiUtils.calculateDirForContextual(this.searchBoxObj.focusNode.value));
						}));
					}
				}
				dojo.attr( this.searchBoxObj.focusNode, 'tabindex', 10);
				dojo.attr( this.searchBoxObj.focusNode, 'title', this.searchBoxTitle);
				dojo.connect(this.searchBoxObj.domNode,"onkeyup",this,this.getUserKeyStroke);
				dojo.connect(this.searchBoxObj.domNode,"onfocus",this,this.searchBarOnFocus);			

				/* This event handler is not working - comment out as part of 14600. May fix
				 * at some point in the future. All it does is set the text color to grey on IE.
				 *
    			 * dojo.connect(this.searchBoxObj.domNode,"onblur",this,this.searchBarOnBlur);
				*/
				
				dojo.connect(this.searchBoxObj.domNode,"onclick",null,function(){this.focus();});
				// WAI-ARIA role for searchbox set to role="search"
				if (this.searchBoxObj && this.searchBoxObj.domNode && this.searchBoxObj.domNode.children && this.searchBoxObj.domNode.children.length > 0) {
					dijit.setWaiRole(this.searchBoxObj.domNode.children[0],'search');
					dijit.setWaiState(this.searchBoxObj.domNode.children[0],'label',this.searchBoxTitle);
				}
			}
			else {
				this.searchBoxObj = dijit.byId(id);
				this.searchBoxObj.setValue(this.CLIP_STRINGS.searchClips);
			}
			
			//dojo.addClass(this.searchBoxObj.domNode,'clipperSearchBar');
			dojo.style(this.searchBoxObj.domNode,'width','100%');
		
		},
		
		_createChkBoxWrapper: function(id, filterSectionDiv){
			var chkBoxWrapper = document.createElement("div");
			filterSectionDiv.appendChild(chkBoxWrapper);
			var chkBox = document.createElement('input');
			dojo.attr(chkBox,'name',id);
			chkBoxWrapper.appendChild(chkBox);
			var chkBoxLabel = document.createElement('label');
			dojo.attr(chkBoxLabel,'for',id);
			 
			var clipItem="";
			var leftPos ="0px";
			var topPos = "-5px";
			
			 if (id=='clipper_ChkBox_PictureClip'){
			 	clipItem="Images";
			 	leftPos = "0px";
			 	topPos="-5px";	  
			 } else if (id=='clipper_ChkBox_TextClip'){
			 	clipItem="Text";
			 	leftPos = "70px";
			 	topPos="-24px";	  	  		  
			 }else if (id=='clipper_ChkBox_QuoteClip'){
			 	clipItem="Quote";
			 	leftPos = "140px";
			 	topPos="-43px";	  	  		  
			 }else if (id=='clipper_ChkBox_TableClip'){
			 	clipItem="Table";
			 	leftPos = "210px";
			 	topPos="-62px";	  	  		  
			 }
			 chkBoxLabel.appendChild(document.createTextNode(clipItem));
			 chkBoxWrapper.appendChild(chkBoxLabel);
			
			dojo.style(chkBoxLabel, {
				'position':'relative',
				'top':'-5px',
				'color':'#585858',
				'background':'#FFFFFF'
			});				
			 
			
			 var checkBoxObj = new dijit.form.CheckBox({
			 		id:id,
			          name:  id,
			          value: "checkbox",
			          checked: true,
			          onChange: dojo.hitch(this,this.handleCheckBox,id)
			      },    chkBox);
			
			
			
			dojo.style(chkBoxWrapper, {
				'position':'relative',
				'top':topPos,
				'left':leftPos,
				'color':'#ACACAC',
				'width':'100px',
				'background':'#FFFFFF'
			});				
		
		},
		
		
		handleCheckBox: function(id){
			var checkBoxObj = dijit.byId(id);
			 if (id=='clipper_ChkBox_PictureClip'){
			 	if (checkBoxObj.checked)
			 		this.SHOW_IMAGE=true;
			 	else
			 		this.SHOW_IMAGE=false;		 		
			 } else if (id=='clipper_ChkBox_TextClip'){
			 	if (checkBoxObj.checked)
			 		this.SHOW_TEXT=true;
			 	else
			 		this.SHOW_TEXT=false;		 		
			 }else if (id=='clipper_ChkBox_QuoteClip'){
			 	if (checkBoxObj.checked)
			 		this.SHOW_QUOTE=true;
			 	else
			 		this.SHOW_QUOTE=false;		 		
			 }else if (id=='clipper_ChkBox_TableClip'){
			 	if (checkBoxObj.checked)
			 		this.SHOW_TABLE=true;
			 	else
			 		this.SHOW_TABLE=false;		 		
			 }
			
			this.getUserKeyStroke(null);
		},
		
		populateImageClipArray: function(){
			this.imageClipArray.push({'id':"image_"+new Date().getTime(),
								 'name':'GoogleLogo',
								 'type':'image',
								 'description':'This is the google logo',
								 'source':'http://www.google.com',
								 'src':'http://www.google.com/intl/en_ALL/images/logo.gif'});
			this.imageClipArray.push({'id':"image_"+new Date().getTime(),
								 'name':'JuliaCorker',
								 'type':'image',		
								 'description':'Senator Daughter carjacked.  Sen. Bob Corker says his daughter is fine but "really sore" after being pulled from her car and thrown to the ground in a carjacking in the nations capital.Sen. Bob Corker says his daughter is fine but "really sore" after being pulled from her car and thrown to the ground in a carjacking in the nations capital.',
								 'source':'http://www.cnn.com',
								 'src':'http://i2.cdn.turner.com/cnn/2009/POLITICS/12/04/senator.carjacking/t1main.julia.corker.2.gi.jpg'});
			this.imageClipArray.push({'id':"image_"+new Date().getTime(),
								 'name':'IBMNewsPic',
								 'type':'image',		
								 'description':'Latest on IBM intranet website.',
								 'source':'http://w3.ibm.com',
								 'src':'http://w3.ibm.com/articles/news/images/2009/12/green_156x156.jpg'});
		
		},
	
		populateTextClipArray: function(){
			this.textClipArray.push({'id':"text_"+new Date().getTime(),
								 'name':'MSNBCHeadline',		
								 'type':'text',				
								 'description':'This was taken from MSNBC Headline News',
								 'source':'http://www.msnbc.com',
								 'content':'Governor is irate over new findings that some officials notified own kin first of the shootings'});
			this.textClipArray.push({'id':"text_"+new Date().getTime(),
								 'name':'CNNHeadline',		
								 'type':'text',				
								 'description':'Latest on CNN.',
								 'source':'http://www.cnn.com',
								 'content':'Sen. Bob Corker says his daughter is fine but "really sore" after being pulled from her car and thrown to the ground in a carjacking in the nations capital.'});	
		},
		
		
		renderResults : function(){
			var ctr = this.textClipArray.length + this.arrowClipArray.length + this.bulletClipArray.length + this.computerClipArray.length + this.diagramClipArray.length + this.educationClipArray.length + this.environmentClipArray.length + this.financeClipArray.length + this.peopleClipArray.length + this.shapeClipArray.length + this.symbolClipArray.length + this.transportationClipArray.length + this.imageClipArray.length+ this.pictureClipArray.length +this.tableClipArray.length;
			this.clipPosition.top=this.clipPosition.left =0;
			this.resultBoxDiv.innerHTML ='';
			
			//Add text 
			for (var i=0; i< this.textClipArray.length; i++){
				this.buildResultItemShortView(this.textClipArray[i]);	
			}

			//Add arrow 
			for (var i=0; i< this.arrowClipArray.length; i++){
				this.buildResultItemShortView(this.arrowClipArray[i]);					
			}

			//Add bullet 
			for (var i=0; i< this.bulletClipArray.length; i++){
				this.buildResultItemShortView(this.bulletClipArray[i]);					
			}
			
			//Add computer
			for (var i=0; i< this.computerClipArray.length; i++){
				this.buildResultItemShortView(this.computerClipArray[i]);					
			}
			
			//Add diagram 
			for (var i=0; i< this.diagramClipArray.length; i++){
				this.buildResultItemShortView(this.diagramClipArray[i]);					
			}
			
			//Add education
			for (var i=0; i< this.educationClipArray.length; i++){
				this.buildResultItemShortView(this.educationClipArray[i]);					
			}
			
			//Add environment
			for (var i=0; i< this.environmentClipArray.length; i++){
				this.buildResultItemShortView(this.environmentClipArray[i]);					
			}
			
			//Add finance
			for (var i=0; i< this.financeClipArray.length; i++){
				this.buildResultItemShortView(this.financeClipArray[i]);					
			}
			
			//Add people
			for (var i=0; i< this.peopleClipArray.length; i++){
				this.buildResultItemShortView(this.peopleClipArray[i]);					
			}
			
			//Add shape
			for (var i=0; i< this.shapeClipArray.length; i++){
				this.buildResultItemShortView(this.shapeClipArray[i]);					
			}
			
			//Add symbol
			for (var i=0; i< this.symbolClipArray.length; i++){
				this.buildResultItemShortView(this.symbolClipArray[i]);					
			}
			
			//Add transportation
			for (var i=0; i< this.transportationClipArray.length; i++){
				this.buildResultItemShortView(this.transportationClipArray[i]);					
			}
			
			//Add image 
			for (var i=0; i< this.imageClipArray.length; i++){
				this.buildResultItemShortView(this.imageClipArray[i]);					
			}
			
			//Add Picture 
			for (var i=0; i< this.pictureClipArray.length; i++){
				this.buildResultItemShortView(this.pictureClipArray[i]);					
			}			
			
			//Add table
			for (var i=0; i< this.tableClipArray.length; i++){
				this.buildResultItemShortView(this.tableClipArray[i]);					
			}				
			
			this.updateResultTitle(ctr);
		},
		
		
		itemResultMouseOverAction: function(itemDiv){
			if (!itemDiv.isSelected){
				dojo.removeClass(itemDiv,'clipPickerDialogItem');		
				dojo.addClass(itemDiv,'clipPickerDialogItemHovered');
				//D14829 There were issues in safari using .focus() so 
				//commenting out for all browsers for consistent behavior
				//itemDiv.focus();
			}
		},
		
		itemResultMouseOutAction: function(itemDiv){
			if (!itemDiv.isSelected){
				dojo.removeClass(itemDiv,'clipPickerDialogItemHovered');		
				dojo.addClass(itemDiv,'clipPickerDialogItem');
			}
					   /*
			dojo.style(itemDiv, {
				'background':'#FFFFFF',
				'border':'0px solid #C6D2DA',
				'color':'#ACACAC',
				'font-size':'1.2em',
				'margin':'10px',
				'padding':'4px',
				'width':'130px',
				'height':'133px',
				'cursor':'pointer',
				'overflow':'hidden'		
			});		*/	
		},
		
		itemResultOnFocusAction: function(itemDiv){
			this.itemResultMouseOverAction(itemDiv);
		},
		
		itemResultOnBlurAction: function(itemDiv){
			this.itemResultMouseOutAction(itemDiv);
		},
		
		selectClipToggle: function(itemDiv){
			if (itemDiv.isSelected){
				this.deSelectClip(itemDiv);
			} else{
				this.selectClip(itemDiv);
			}			
		},
		
		selectClip: function(itemDiv){
			dojo.removeClass(itemDiv,'clipPickerDialogItem');
			dojo.removeClass(itemDiv,'clipPickerDialogItemHovered');
			dojo.addClass(itemDiv,'clipPickerDialogItemSelected');
			//kbn - this was causing itemHover to be added when not wanted
			//itemDiv.focus();
			itemDiv.isSelected=true;
		},		

		deSelectClip: function(itemDiv) {
			dojo.removeClass(itemDiv,'clipPickerDialogItemSelected');		
			dojo.addClass(itemDiv,'clipPickerDialogItem');
			itemDiv.isSelected=false;
		},
		
		softSelectItem: function(itemDiv) {
			if (!itemDiv.isSelected) {
				dojo.removeClass(itemDiv,'clipPickerDialogItem');		
				dojo.addClass(itemDiv,'clipPickerDialogItemHovered');
			}
			this.lastSoftSelectedDiv = itemDiv;
		},
		
		deSoftSelectItem: function(itemDiv) {
			dojo.removeClass(itemDiv,'clipPickerDialogItemHovered');		
			dojo.addClass(itemDiv,'clipPickerDialogItem');
		},
		
		deSelectAll: function(itemDiv){
			var resultItemsArray = dojo.query('.clipPickerDialogItemSelected',this.resultBoxDiv);			
			for (var i=0; i<resultItemsArray.length;i++){				
				this.deSelectClip(resultItemsArray[i]);
			}
			var softItems = dojo.query(".clipPickerDialogItemHovered",this.resultBoxDiv);
			if (softItems) {
				for( var j = 0; j < softItems.length; j++ ) {
					this.deSoftSelectItem(softItems[j]);
				}
			}
		},
		
		getAllSelected: function(){
			var resultItemsArray = dojo.query(".clipPickerDialogItemSelected",this.resultBoxDiv);
			this.selectedItemsArray = [];
			for (var i=0; i<resultItemsArray.length;i++){
				var itemDiv = resultItemsArray[i];
				if (itemDiv.isSelected){
					this.selectedItemsArray.push(itemDiv.resultItemObj);
				}
			}
			
			return this.selectedItemsArray;
		},
		
		buildResultItemShortView: function(obj){
			var itemDiv = document.createElement("div");
			itemDiv.id = obj.id;
			itemDiv.resultItemObj = obj;
			dojo.addClass(itemDiv,'clipPickerDialogItem');
			if (obj.type!="arrow" && obj.type!="bullet" && obj.type!="computer" && obj.type!="diagram" && obj.type!="education" && obj.type!="environment" && obj.type!="finance" && obj.type!="people" && obj.type!="shape" && obj.type!="symbol" && obj.type!="transportation") {
				itemDiv.oncontextmenu = function(){
					return false;
				};
			} 
			
			if (obj.role && obj.role != "undefined") {
				itemDiv.setAttribute('role',obj.role);
			}
			itemDiv.setAttribute('aria-label',obj.name);
			itemDiv.setAttribute('tabindex',25);
			
			this.resultBoxDiv.appendChild(itemDiv);
			var itemNumber = this.resultBoxDiv.childNodes.length;

			if (dojo.isIE){
				dojo.style(itemDiv, {
					'width':'115px'
				});						
			}
			
			//var pos = this.getNextClipPosition(itemNumber);
			
			/*
			dojo.style(itemDiv, {
				'background':'#FFFFFF',
				'border':'0px solid #C6D2DA',
				'color':'#ACACAC',
				//'fontSize':'1.2em',
				'margin':'10px',
				'padding':'4px',
				'width':'130px',
				'height':'133px',
				'cursor':'pointer',
				'overflow':'hidden',
				'float':'left'
			//	'position':'relative',
			//	'top':pos.top,
			//	'left':pos.left			
			});		
			*/			
			
			var previewBox = document.createElement("div");
			dojo.addClass(previewBox,'clipPickerDialogItemPreviewBox');	
			
			// Add object name as text for image, shown only in high contrast mode
			// (skip this for slide transition, those images work in high contrast mode)
			if (this.mainDiv.id != "P_d_SlideTranstions_ContentDiv") {
				var hcText = document.createElement("span");
				dojo.addClass(hcText,'clipPickerDialogItemText');
				hcText.appendChild(document.createTextNode(obj.name));
				previewBox.appendChild(hcText);
			}
			
			itemDiv.appendChild(previewBox);
			
			/*
			dojo.style(previewBox, {
				'background':'#FFFFFF',
				'border':'2px solid #DCDCDC',
				
				'fontSize':'0.9em',
				'margin':'2px',
				'padding':'0px 0px 0px 0px',
				'width':'120px',
				'height':'95px',
				'whiteSpace':'normal',
				'color' :'#585858',
				'cursor':'pointer'			
			});		
			*/
			
			
			
			if (obj.type =="text"){
				var displayTxt = (obj.content.length < 100) ? (obj.content): obj.content.substring(0,100)+"...";
				previewBox.appendChild(document.createTextNode(displayTxt));

				var tmpDiv = document.createElement('div');

				var tmpStr  = "<table><tbody>";
					tmpStr += "	<tr>";
					tmpStr += "		<td> <b>Name:</b></td>";
					tmpStr += "		<td>"+obj.name+"</td>";
					tmpStr += "	</tr>";
					tmpStr += "	<tr>";
					tmpStr += "		<td> <b>Clip date:</b></td>";
					tmpStr += "		<td>"+obj.date+"</td>";
					tmpStr += "	</tr>";
					tmpStr += "	<tr>";
					tmpStr += "		<td> <b>Description:</b></td>";
					tmpStr += "		<td>"+obj.description+"</td>";
					tmpStr += "	</tr>";
					tmpStr += "</tbody></table><br>";
					
					tmpStr +="<hr>";
					tmpStr +="<p>"+obj.content+"</p>";

			 	tmpDiv.innerHTML = tmpStr;
			 			
				var tmpDivParent = document.createElement('div');
				tmpDivParent.appendChild(tmpDiv);
				
				if (dojo.isIE){
					var tt = new dijit.Tooltip({label:"<div style='height:auto; font-size:0.95em; width:450px; overflow: hidden;'>"+tmpDivParent.innerHTML+"</div>", connectId:previewBox});					
				} else{
					var tt = new dijit.Tooltip({label:"<div style='max-height:300px; max-width:450px; overflow: hidden;'>"+tmpDivParent.innerHTML+"</div>", connectId:previewBox});	
				}
			
			} else if (obj.type =="quote"){
				var displayTxt = (obj.content.length < 100) ? (obj.content): obj.content.substring(0,100)+"...";
				previewBox.appendChild(document.createTextNode(displayTxt));
						
			}else if (obj.type=="arrow" || obj.type=="bullet" || obj.type=="computer" || obj.type=="diagram" || obj.type=="education" || obj.type=="environment" || obj.type=="finance" || obj.type=="people" || obj.type=="shape" || obj.type=="symbol" || obj.type=="transportation" || obj.type=="image" || obj.type=="picture"){				
				if (obj.previewCssClass != undefined) {
					dojo.addClass(previewBox,obj.previewCssClass);
					//#14325 - side effect of 9611, we can't point to the presTemplateDesignGallery with relative url anymore,
					//since with some deployments there is build number in between and some deployment there is not.
					//e.g. "/docs/presTemplateDesignGallery/Masterstyles-thumbsprite-IBM.png" and sometimes "/docs/static/<buildnumber>/presTemplateDesignGallery/Masterstyles-thumbsprite-IBM.png"
					//using relative path to go to the "/docs" is becoming dynamic, can't be stored in css
					//so we need to inject the backgroundImage url as a style, not relying on the css.
					if(obj.previewCssClass.indexOf("templateDesign_default")>=0){
						dojo.style(previewBox, "backgroundImage","none");
					}
					else if(obj.previewCssClass.indexOf("templateDesignGallery")>=0){
						dojo.style(previewBox, "backgroundImage", 'url("'+window.contextPath + '/presTemplateDesignGallery/Masterstyles-thumbsprite-IBM.png")');
					}
				} else {
					var previewImage = dojo.create("img", {className: "clipPickerDialogImagePreview", alt: obj.title, src : obj.src}, previewBox);
				}
				//TOOLTIP
				var tmpDivParent = document.createElement('div');				
				var tmpDiv = document.createElement('div');
				tmpDivParent.appendChild(tmpDiv);	
				var tmpStr  = "<span>"+obj.name+"</span>";
			 	tmpDiv.innerHTML = tmpStr;		
				var direction = (BidiUtils.isGuiRtl() && obj.type == "image") ? "rtl" : "";
				this.toolTipObjs.push(new dijit.Tooltip({label:tmpDivParent.innerHTML, connectId:previewBox, dir: direction}));
				
				//Destroy the temporary divs used to create the tooltips
				dojo.destroy(tmpDiv);
				dojo.destroy(tmpDivParent);
				
			}else if (obj.type=="table"){
				var previewImage = document.createElement('img');
				previewBox.appendChild(previewImage);
				dojo.attr(previewImage,'src',this.clipPluginPath+"images/tableGallery.gif");
				dojo.addClass(previewImage,"clipPickerDialogTablePreview");
				var tmpDiv = document.createElement('div');
			 	tmpDiv.innerHTML =	obj.content;		
				var tmpDivParent = document.createElement('div');
				tmpDivParent.appendChild(tmpDiv);
				var id = new Date().getTime();
				if (dojo.isIE){
					this.toolTipObjs.push(new dijit.Tooltip({id:id, label:"<div style='height:auto; font-size:0.95em; width:450px; overflow: hidden;'>"+tmpDivParent.innerHTML+"</div>", connectId:previewImage}));					
				} else{
					this.toolTipObjs.push(new dijit.Tooltip({id: id, label:"<div style='max-height:300px; max-width:450px; overflow: hidden;'>"+tmpDivParent.innerHTML+"</div>", connectId:previewImage}));					
				}
				
					/*
						    tt.open = dojo.hitch(tt,  function(target){
					 			// summary: display the tooltip; usually not called directly.
								target = target || this._connectNodes[0];
								if(!target){ return; }
					
								if(this._showTimer){
									clearTimeout(this._showTimer);
									delete this._showTimer;
								}
								dijit.showTooltip(this.label || this.domNode.innerHTML, target);
								
								this._connectNode = target;
								//debugger;
							});
							
							tt.close = dojo.hitch(tt,function(){
									//debugger;
									//alert("custom close");
									// summary: hide the tooltip; usually not called directly.
									dijit.hideTooltip(this._connectNode);
									delete this._connectNode;
									if(this._showTimer){
										clearTimeout(this._showTimer);
										delete this._showTimer;
									}
									
							});
				*/
			}
			
			/*		
			var descriptionBox = document.createElement("div");
			dojo.addClass(descriptionBox,'clipPickerDialogDescriptionBox');
			itemDiv.appendChild(descriptionBox);
			var boxWidth = itemDiv.offsetWidth - previewBox.offsetWidth-40;
			var topPos = previewBox.offsetHeight;
			var leftPos = previewBox.offsetWidth;
	
		
			var clipNameDiv = document.createElement('div');
			dojo.addClass(clipNameDiv,'clipPickerDialogItemName');
			descriptionBox.appendChild(clipNameDiv);
			clipNameDiv.appendChild(document.createTextNode(obj.date));
		
			var clipDescriptionDiv = document.createElement('div');
			dojo.addClass(clipDescriptionDiv,'clipPickerDialogItemDescription');
			descriptionBox.appendChild(clipDescriptionDiv);
			clipDescriptionDiv.appendChild(document.createTextNode((obj.description.length < 122) ? (obj.description): obj.description.substring(0,122)+"..."));
			
			*/
		
			//Options	
			/*
			 * NO EDIT OR DELETE OPTIONS
			 */
			/*
			var optionsDiv = document.createElement("div");
			dojo.addClass(optionsDiv,'clipPickerDialogItemOptions');
			itemDiv.appendChild(optionsDiv);
				var img = document.createElement("img");
				img.src=this.clipPluginPath+"images/editClip.gif";
				optionsDiv.appendChild(img);

			dojo.connect(img,"onclick",dojo.hitch(this,this.handleClipEdit,obj,previewBox,titleBox));
			var tt = new dijit.Tooltip({label:this.CLIP_STRINGS.editClip, connectId:img});


				var img = document.createElement("img");
				img.src=this.clipPluginPath+"images/delete.gif";
				optionsDiv.appendChild(img);

			dojo.connect(img,"onclick",dojo.hitch(this,this.handleClipDelete,previewBox,obj));
			var tt = new dijit.Tooltip({label:this.CLIP_STRINGS.deleteClip, connectId:img});
			

			if (dojo.isIE){
				dojo.style(optionsDiv, {
					'position':'relative',
					'top':'-113px',
					'opacity':'0',
					'width':'33px',
					'left':'93px'
					});				
			} else{
				dojo.style(optionsDiv, {
					'position':'relative',
					'top':'-118px',
					'opacity':'0',
					'width':'33px',
					'left':'95px'
					});				
			}	
			
			*/
				
			itemDiv.isSelected=false;
			
			this.connects.push(dojo.connect(itemDiv,'onfocus',dojo.hitch(this,this.itemResultMouseOverAction,itemDiv)));
			this.connects.push(dojo.connect(itemDiv,'onblur',dojo.hitch(this,this.itemResultMouseOutAction,itemDiv)));
			this.connects.push(dojo.connect(itemDiv,'onmouseover',dojo.hitch(this,this.itemResultMouseOverAction,itemDiv)));
			this.connects.push(dojo.connect(itemDiv,'ondblclick',dojo.hitch(this,this.itemDblClick,itemDiv)));
			this.connects.push(dojo.connect(itemDiv,'onmouseout',dojo.hitch(this,this.itemResultMouseOutAction,itemDiv)));
			this.connects.push(dojo.connect(itemDiv,'onclick',dojo.hitch(this,this.itemClick,itemDiv)));
			this.connects.push(dojo.connect(itemDiv,'onkeypress',dojo.hitch(this,this.itemKeypress)));

			//dojo.connect(optionsDiv,"onmouseover",dojo.hitch(this,function(optionsDiv){dojo.style(optionsDiv,{"opacity":"1"});},optionsDiv));
			//dojo.connect(optionsDiv,"onmouseout",dojo.hitch(this,function(optionsDiv){dojo.style(optionsDiv,{"opacity":"0"});},optionsDiv));	
		},
		
		updateResultTitle: function(num){
			   if (BidiUtils.isArabicLocale())
			   	num = BidiUtils.convertArabicToHindi(num + "");
										
			   this.resultTitle.innerHTML=dojo.string.substitute(this.CLIP_STRINGS.results,[num]); //JMT - D35190 D36977
		},
		
		processFilterOnRefresh: function(){
			if (this.allSpan.className.indexOf('clipPickerDialogFilterSelected')>=0){
				this.handleFilter('all',this.allSpan);	
			} else if(this.arrowSpan.className.indexOf('clipPickerDialogFilterSelected')>=0){
				this.handleFilter('arrow',this.arrowSpan);
			} else if(this.bulletSpan.className.indexOf('clipPickerDialogFilterSelected')>=0){
				this.handleFilter('bullet',this.bulletSpan);
			} else if(this.imageSpan.className.indexOf('clipPickerDialogFilterSelected')>=0){
				this.handleFilter('image',this.imageSpan);									
			} else if (this.textSpan.className.indexOf('clipPickerDialogFilterSelected')>=0){
				this.handleFilter('text',this.textSpan);
			} else if  (this.tableSpan.className.indexOf('clipPickerDialogFilterSelected')>=0){
				this.handleFilter('table',this.tableSpan);
			} 	
		},
		
		handleClipEdit: function(clipObj,previewBox,titleBox,event){
			event.stopPropagation();

            var tmp ="<table>";            
                tmp+="<tr>";
                	tmp+="<td><label for='title'>Name: </label></td>";
                	tmp+="<td><input dojoType='dijit.form.TextBox'  id ='editClipItemTitleTextBox' name='title' value='"+clipObj.name+"'></td>";
                tmp+="</tr>";
                tmp+="<tr>";
                        tmp+="<td><label for='desc'>Description </label></td>";
                        tmp+="<td><input dojoType='dijit.form.TextBox'  id ='editClipItemDescriptionTextBox'value='"+clipObj.description+"' name='desc'></td>";
                tmp+="</tr>";
                tmp+="<tr>";
                        tmp+="<td colspan='1' align='center'>";
                                tmp+="<button dojoType=dijit.form.Button id ='editClipItemOKButton' >OK</button>";        
                                tmp+="<button dojoType=dijit.form.Button id ='editClipItemCancelButton' >Cancel</button></td>";
                tmp+="</tr>";
	            tmp+="</table>";


		/*
			<div dojoType="dijit.form.DropDownButton">
			        <span>Change Password</span>
			        <div dojoType="dijit.TooltipDialog" id="dialog1" title="First Dialog" execute="checkPw(arguments[0]);">
			        </div>
			</div> 

*/
			
			var divWrapper = document.createElement("div");
				divWrapper.innerHTML=tmp;				
			
			
			
			var toolTipDialog=null;
			if (dijit.byId("editToolTip")){
				dijit.popup.close(dijit.byId("editToolTip"));
				dijit.byId("editToolTip").domNode.innerHTML="";
				dijit.byId("editToolTip").destroyRecursive();				
			}	
	
	 	 	toolTipDialog = new dijit.TooltipDialog({content:divWrapper.innerHTML, id:'editToolTip'});
	 	 	/*
	 	 	toolTipDialog._onKey = dojo.hitch(toolTipDialog,  function(evt){
				// summary:
				//		Handler for keyboard events
				// description:
				//		Keep keyboard focus in dialog; close dialog on escape key
				// tags:
				//		private
				
				var node = evt.target;
				var dk = dojo.keys;
				if(evt.charOrCode === dk.TAB){
					this._getFocusItems(this.containerNode);
				}
				var singleFocusItem = (this._firstFocusItem == this._lastFocusItem);
				if(evt.charOrCode == dk.ESCAPE){
					// Use setTimeout to avoid crash on IE, see #10396.
					setTimeout(dojo.hitch(this, "onCancel"), 0);
					dojo.stopEvent(evt);
				}else if(node == this._firstFocusItem && evt.shiftKey && evt.charOrCode === dk.TAB){
					if(!singleFocusItem){
						dijit.focus(this._lastFocusItem); // send focus to last item in dialog
					}
					dojo.stopEvent(evt);
				}else if(node == this._lastFocusItem && evt.charOrCode === dk.TAB && !evt.shiftKey){
					if(!singleFocusItem){
						dijit.focus(this._firstFocusItem); // send focus to first item in dialog
					}
					dojo.stopEvent(evt);
				}else if(evt.charOrCode === dk.TAB){
					// we want the browser's default tab handling to move focus
					// but we don't want the tab to propagate upwards
					evt.stopPropagation();
				} else {
					 	node.value +=evt.charOrCode;				
				}	 	 		
	 	 	});
				*/		
			toolTipDialog.startup();	
			
			dijit.popup.open({popup:toolTipDialog, around:previewBox});	
			
			dojo.connect(dijit.byId("editClipItemCancelButton").domNode,"onclick",dojo.hitch(this,this.closeClipEditDeleteDialogTT));
			dojo.connect(dijit.byId("editClipItemOKButton").domNode,"onclick",dojo.hitch(this,this.handleClipEditDialogOK,clipObj,previewBox,titleBox));			
		},
		
		
		handleClipDelete: function(previewBox,obj,event){
				event.stopPropagation();
				var deleteClipDialog="<div>";
				deleteClipDialog+="<label class='editClipTitleLabel'>Are you sure you want to delete this clip?</label><br/>";
				deleteClipDialog+="<button dojoType=dijit.form.Button id ='deleteClipItemOKButton' >"+this.CLIP_STRINGS.OK+"</button>";        
                deleteClipDialog+="<button dojoType=dijit.form.Button id ='deleteClipItemCancelButton' >"+this.CLIP_STRINGS.cancel+"</button><br/>";
				deleteClipDialog+="</div>";
				var toolTipDialog=null;
				if (dijit.byId("deleteClipDialog")){
					dijit.popup.close(dijit.byId("deleteClipDialog"));
					dijit.byId("deleteClipDialog").domNode.innerHTML="";
					dijit.byId("deleteClipDialog").destroyRecursive();				
				}	
		
		 	 	toolTipDialog = new dijit.TooltipDialog({content:deleteClipDialog, id:'deleteClipDialog'});
				toolTipDialog.startup();	
				
				dijit.popup.open({popup:toolTipDialog, around:previewBox});
						
				dojo.connect(dijit.byId("deleteClipItemCancelButton").domNode,"onclick",dojo.hitch(this,this.closeClipEditDeleteDialogTT));
				dojo.connect(dijit.byId("deleteClipItemOKButton").domNode,"onclick",dojo.hitch(this,this.handleClipDeleteDialogOK,previewBox,obj));			
		},
		
		
		// This function will handle closing both the edit and the delete clip tt dialog 
		closeClipEditDeleteDialogTT: function(){			
			if (dijit.byId("deleteClipDialog"))	dijit.popup.close(dijit.byId("deleteClipDialog"));
			if (dijit.byId("editToolTip"))	dijit.popup.close(dijit.byId("editToolTip"));					
		},
		handleClipEditDialogOK: function(clip,previewBox,titleBox){			
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipEditDialogOK entry. Editing clip id "+ clip.id);}catch(e){}			
			var name = dijit.byId("editClipItemTitleTextBox").attr("value");
			var desc  = dijit.byId("editClipItemDescriptionTextBox").attr("value");
			
			var entry ={};
			entry.id = clip.id;
			entry.typeId = (clip.type=='text')?'txtclip': (clip.type=='image')? 'imgclip':'tblclip';
			
			var bean = new concord.beans.Resource(entry);
			
			var postData = {
					"clip_description": desc,
					"clip_name":name
				}			
			var handleClipEditDialogOKCallback = dojo.hitch(this,this.handleClipEditDialogOKCallback);
			concord.beans.ObjectService.updateObject(bean,postData,handleClipEditDialogOKCallback);
			this.closeClipEditDeleteDialogTT();
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipEditDialogOK exit.");}catch(e){}												
		},

		handleClipEditDialogOKCallback: function(response,ioArgs){
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipEditDialogOKCallback entry.");}catch(e){}
			if (((response) &&(response instanceof Error)) || (ioArgs.xhr.status!=200)){
				this.showErrorMessage('Error editing clip from clip gallery');
			} 
			this.refreshGallery();					
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipEditDialogOKCallback exit.");}catch(e){}
		},
		
		
		handleClipDeleteDialogOK: function(previewBox,clip){
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipDeleteDialogOK entry. Deleting clip id "+ clip.id);}catch(e){}
			//dojo.style(previewBox.parentNode,{"display":"none"});
			var entry ={};
			entry.id = clip.id;
			entry.typeId = (clip.type=='text')?'txtclip': (clip.type=='image')? 'imgclip':'tblclip';
			
			var bean = new concord.beans.Resource(entry);
			
			var handleClipDeleteDialogOKCallback = dojo.hitch(this,this.handleClipDeleteDialogOKCallback);
			concord.beans.ObjectService.deleteObject(bean,handleClipDeleteDialogOKCallback);
			this.closeClipEditDeleteDialogTT();
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipDeleteDialogOK exit.");}catch(e){}			
		},

		handleClipDeleteDialogOKCallback: function(response,ioArgs){
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipDeleteDialogOKCallback entry.");}catch(e){}
			if (((response) &&(response instanceof Error)) || (ioArgs.xhr.status!=200)){
				this.showErrorMessage('Error deleting clip from clip gallery');
			} 
			this.refreshGallery();					
			if (g_concordInDebugMode) try{console.log("concordGallery: handleClipDeleteDialogOKCallback exit.");}catch(e){}
		},
		
		showErrorMessage : function(msg){
			if (g_concordInDebugMode) try{console.log("concordGallery: showErrorMessage "+msg);}catch(e){}				
		},
		
		//Can be overwritter by subclass
		itemDblClick: function(item){
			
		},
		//Can be overwritter by subclass
		itemClick: function(itemDiv){
			this.selectClipToggle(itemDiv);
		},
		
		handleEnterGalleryObj: function(itemDiv) {
		},
		
		itemKeypress: function(evt) {
			if (evt.keyCode == dojo.keys.ENTER) {
				this.handleEnterGalleryObj(evt.target);
				dojo.stopEvent(evt);
			}
		}
		
	});
