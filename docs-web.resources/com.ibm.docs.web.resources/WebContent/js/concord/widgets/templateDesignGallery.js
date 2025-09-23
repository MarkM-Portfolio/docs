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
 * @templateDesignGallery CKEditor Plugin
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
dojo.provide("concord.widgets.templateDesignGallery");
dojo.require("concord.widgets.concordGallery");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","templateDesignGallery");

    dojo.declare("concord.widgets.templateDesignGallery", [concord.widgets.concordGallery], {
		
		constructor: function(opts) {
			this.mainDiv = (opts.mainDiv)? opts.mainDiv : null;
			//this.mainDiv = (opts.mainDiv)? opts.mainDiv.parentNode : null;
			this.onSelectCallback = (opts.onSelectCallback)? opts.onSelectCallback : null;
			this.clipPluginPath = (opts.clipPluginPath)? opts.clipPluginPath : null;
			this.userInfo = (opts.userInfo)? opts.userInfo : null;			
			this.CLIP_STRINGS = (opts.STRINGS)? opts.STRINGS : 	{'clipLabel': 'Clips',
																 'clipGalleryLabel' : 'Clip Gallery',
																 'show': 'Show',
																 'images': 'Image(s)',
																 'image' : 'Images',
																 'text': 'Text',
																 'picture' :'Pictures',
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
			this.onDblClick = (opts.onDblClick)? opts.onDblClick: null;
		},
		
		//galleryPath: 'http://'+window.location.host + window.contextPath + window.staticRootPath + '/js/concord/widgets/templateDesignGallery/',
		//galleryJSONPath: 'http://'+window.location.host + window.contextPath + window.staticRootPath + '/js/concord/widgets/templateDesignGallery/galleryTemplateDesignIndex.json',
		//galleryPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/templateDesignGallery/',
		//galleryJSONPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/templateDesignGallery/galleryTemplateDesignIndex.json',
		//#9611 - to work around changing static root path (build number) issue, we move templateDesignGallery out from under js/
		galleryPath: window.contextPath + '/presTemplateDesignGallery/',
		galleryJSONPath: window.contextPath +  '/presTemplateDesignGallery/galleryTemplateDesignIndex.json',
		tmpIframeTemplateDesign: null,
		
		init: function(){
			this.STRINGS = dojo.i18n.getLocalization("concord.widgets","templateDesignGallery");
			this.searchBoxTitle = this.STRINGS.filterTemplates;
			this.inherited(arguments);
		},

		//
		// Adding result section
		//
		addResultsSection: function(){
			this.inherited(arguments);
			this.updateDialogHeight();						
		},
		
		//
		//Updates height of dialog
		//
		updateDialogHeight: function(){
			var mainParentContainer = this.resultBoxDiv.parentNode.parentNode.parentNode.parentNode;
			var headerAndFooterHeight = 160;
			var height = mainParentContainer.offsetHeight;
			if ((height!=null) && (height>headerAndFooterHeight)){
				dojo.style(this.resultBoxDiv,{
					'height':(height-headerAndFooterHeight)+"px"
				});
			}
		},
		//updating the title to display to use localization string
		updateLayoutName:function(data){
			if(data!=null && data.title!=null){
				if(data.title.toLowerCase() =="business"){
					data.title = this.STRINGS.business;
				}else if(data.title.toLowerCase() =="lotus"){
					data.title = this.STRINGS.lotus;
				}else if(data.title.toLowerCase() =="transform"){
					data.title = this.STRINGS.transform;
				}else if(data.title.toLowerCase() =="blue waves"){
					data.title = this.STRINGS.blueWaves;
				}else if(data.title.toLowerCase() =="purple twist"){
					data.title = this.STRINGS.purpleTwist;
				}else if(data.title.toLowerCase() =="orange"){
					data.title = this.STRINGS.orange;
				}else if(data.title.toLowerCase() =="lantern"){
					data.title = this.STRINGS.lantern;
				}else if(data.title.toLowerCase() =="sandbeach"){
					data.title = this.STRINGS.sandbeach;
				}else if(data.title.toLowerCase() =="sunset"){
					data.title = this.STRINGS.sunset;
				}else if(data.title.toLowerCase() =="meadow"){
					data.title = this.STRINGS.meadow;
				}else if(data.title.toLowerCase() =="rooftop"){
					data.title = this.STRINGS.rooftop;
				}else if(data.title.toLowerCase() =="structure"){
					data.title = this.STRINGS.structure;
				}else if(data.title.toLowerCase() =="opera"){
					data.title = this.STRINGS.opera;
				}else if(data.title.toLowerCase() =="lilypad"){
					data.title = this.STRINGS.lilypad;
				}else if(data.title.toLowerCase() =="block"){
					data.title = this.STRINGS.block;
				}else if(data.title.toLowerCase() =="blue circles"){
					data.title = this.STRINGS.bluecircles;
				}else if(data.title.toLowerCase() =="delicate"){
					data.title = this.STRINGS.delicate;
				}else if(data.title.toLowerCase() =="diagonal"){
					data.title = this.STRINGS.diagonal;
				}else if(data.title.toLowerCase() =="green blocks"){
					data.title = this.STRINGS.greenblocks;
				}else if(data.title.toLowerCase() =="grid"){
					data.title = this.STRINGS.grid;
				}else if(data.title.toLowerCase() =="yellow dots"){
					data.title = this.STRINGS.yellowdots;
				}else if(data.title.toLowerCase() =="social business"){
					data.title = this.STRINGS.socialbusiness;
				}else if(data.title.toLowerCase() =="default"){
					data.title = this.STRINGS.defaultTemp;
				}
			}
			return data;
			
		},
		
		//
		// Displaying results in gallery
		//
		displayAllResults: function(data) {
		  var resultArray = (data.templates)? data.templates : [];
		  this.resetAllArrays();
		  
		  for (var i=0; i< resultArray.length; i++){
				var data = resultArray[i].template;	
				data = this.updateLayoutName(data);
				if (data.previewCssClass) {
					this.imageClipArray.push({'id':data.id,
						 'name':data.title,
						 'type':'image',		
						 'title':data.title,
						 'tags':'',		
						 'description':data.description,
						 'source':this.galleryPath+data.file, 
						 'date':'',									 
						 'previewCssClass':data.previewCssClass});					
				} else {
					this.imageClipArray.push({'id':data.id,
							 'name':data.title,
							 'type':'image',		
							 'title':data.title,
							 'tags':'',		
							 'description':data.description,
							 'source':this.galleryPath+data.file, 
							 'date':'',									 
							 'src':this.galleryPath+data.previewImg});	
				}
				//save the templateDesignGallery JSON into the scene variable
				//to be used when we want to remove older master style from masterHtml hidden div by slidesorter
				if(window.pe.scene.templateDesignGalleryIdArray!=null){
					window.pe.scene.templateDesignGalleryIdArray[data.id] = "1"; //assigned it to a dummy value, we are using associative array to do a quick search when we are trying to remove unused masterstyle
				}
			}	
			this.renderResults();
			this.updateTabIndexes();
		},
		
		//
		// Get templateDesign information
		//
		getTemplateDesignData: function(obj){
			/*
			
			  //Temp iframe to read data
			  var iframe = this.tmpIframeTemplateDesign;
			  if (!iframe){
				  iframe = this.tmpIframeTemplateDesign = document.createElement('iframe');			  	  
			  	  this.mainDiv.appendChild(iframe);
			  	  iframe.style.display ='none';			  	  
			  }
			  iframe.onload = dojo.hitch(this,this.iframeDataReady);
			  iframe.src = obj.source;
			  */
				
				var response, ioArgs;
		
				dojo.xhrGet({
					url: obj.source,
					handleAs: "json",
					handle: function(r, io) {response = r; ioArgs = io;},
					sync: true,
					noStatus: true
				});
				
				
				if (response){
					if (this.onSelectCallback) this.onSelectCallback(response);	
				}
		},
		
		//
		// This function gets called when the user selects a template on the ui
		//
		selectClip: function(itemDiv){
			this.deSelectAll();
			this.inherited(arguments);				
			var templateDesignData = this.getTemplateDesignData(itemDiv.resultItemObj);
			var parentDialog = this._getParentDialog();
			if ( parentDialog){
				try{
					itemDiv.focus();
					parentDialog.publishDialogInFocus();
				}catch(e){
					//do nothing
					console.log(e);
				}
			}
			else {
				itemDiv.focus();
		 		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs'}];
		 		concord.util.events.publish(concord.util.events.presentationFocus, eventData);
			}
		},
		
		//
		// Called when iframe is done loading
		//		
		iframeDataReady: function(){
			  //Temporarily set dojo doc			  
		  	  var tmpDoc = dojo.doc;
		  	  dojo.setContext(this.tmpIframeTemplateDesign.contentDocument.window, this.tmpIframeTemplateDesign.contentDocument);
		  	  var objectBoxArray = dojo.query(".draw_image");		  	  
		  	  //Restore dojo document.
		  	  dojo.setContext(window, window.document);
		  	  var resultArray = [];
		  	  for (var i=0; i< objectBoxArray.length; i++){
		  		 //var parentDiv = 
		  		 resultArray.push({
		  			 	'backgroundImage':dojo.attr(objectBoxArray[i],'xlink_href'),
		  			 	'top' :  objectBoxArray[i].parentNode.style.top,
			 			'left' : objectBoxArray[i].parentNode.style.left,
	 					'height' : objectBoxArray[i].parentNode.style.height,
	 					'width' : objectBoxArray[i].parentNode.style.width
		  		 });
		  	  }
		  	if (this.onSelectCallback) this.onSelectCallback(resultArray);		  	 
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
			resultSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.results+": 0 "+this.CLIP_STRINGS.hits));
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
	      
			dojo.style(filterSpan, {
				'display':'none'
			});		
					
			filterSectionDiv.appendChild(filterSpan);
			
				var showSpan = document.createElement("span");
				filterSpan.appendChild(showSpan);
				showSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.show+": "));
				

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
				imageSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.image));				
				
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
				textSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.picture));				
				
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
		//Can be overwritter by subclass
		itemClick: function(itemDiv){
			if (!itemDiv.isSelected){
				this.selectClip(itemDiv);
			}	
		},
		itemDblClick: function(itemDiv){
			if (this.onDblClick){
				this.onDblClick();
				if (!itemDiv.isSelected){
					this.selectClip(itemDiv);
				}					
			}
		}		
	});
