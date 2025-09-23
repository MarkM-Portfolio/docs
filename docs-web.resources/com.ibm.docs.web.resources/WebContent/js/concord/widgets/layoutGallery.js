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
 * @layoutGallery CKEditor Plugin
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
dojo.provide("concord.widgets.layoutGallery");
dojo.require("concord.widgets.concordGallery");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","layoutGallery");

    dojo.declare("concord.widgets.layoutGallery", [concord.widgets.concordGallery], {
		
		constructor: function(opts) {

    		//load and display data for layout
			var galleryLayoutIndex = new concord.widgets.layoutGallery.galleryLayoutIndex();
			var data = new Object();
			data.templates = galleryLayoutIndex.templates;
			this.displayAllResults(data);			
    		
			this.mainDiv = (opts.mainDiv)? opts.mainDiv : null;
			this.galleryLayoutData = opts.galleryLayoutData;
			this.getMasterTemplateInfo = opts.getMasterTemplateInfo;
			this.onSelectCallback = (opts.onSelectCallback)? opts.onSelectCallback : null;
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
		
		//galleryPath: 'http://'+window.location.host + window.contextPath + window.staticRootPath + '/js/concord/widgets/layoutGallery/',
		//galleryJSONPath: 'http://'+window.location.host + window.contextPath + window.staticRootPath + '/js/concord/widgets/layoutGallery/galleryLayoutIndex.json',
		galleryPath:  window.contextPath  + window.staticRootPath + '/js/concord/widgets/layoutGallery/',
		galleryJSONPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/layoutGallery/galleryLayoutIndex.json',
		galleryLayoutData: null,
		tmpIframeLayout: null,
		
		init: function(){
			this.STRINGS = dojo.i18n.getLocalization("concord.widgets","layoutGallery");
			this.searchBoxTitle = this.STRINGS.filterSlideLayouts;
			this.inherited(arguments);
		},
		
		//
		// Adding result section
		//
		addResultsSection: function(){
			this.inherited(arguments);
			this.updateDialogHeight();						
		},
		
		getTemplatesData: function(){
			//data for layout dialog is now loaded in the init function 
		},
		
		//
		//Updates height of dialog
		//
		updateDialogHeight: function(){
			var mainParentContainer = this.resultBoxDiv.parentNode.parentNode.parentNode.parentNode;
			var headerAndFooterHeight = 110;
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
				if(data.title.substr(0,5) =="Blank"){
					data.title = this.STRINGS.blankSlide;
				}else if(data.title.substr(0,4) =="ALT0"){
					data.title = this.STRINGS.titleSlide;
				}else if(data.title.substr(0,5) =="ALT19"){
					data.title = this.STRINGS.titleOnly;
				}else if(data.title.substr(0,4) =="ALT1"){
					data.title = this.STRINGS.titleText;
				}else if(data.title.substr(0,5) =="ALT32"){
					data.title = this.STRINGS.centeredText;
				}else if(data.title.substr(0,4) =="ALT3"){
					data.title = this.STRINGS.title2TextBlocks;
				}else if(data.title.substr(0,4) =="ALT9"){
					data.title = this.STRINGS.titleClipartText;
				}else if(data.title.substr(0,4) =="ALT6"){
					data.title = this.STRINGS.titleTextClipart;
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
				if(!BidiUtils.isBidiOn() && data.description.indexOf("-RTL") != -1)
					continue;

				this.imageClipArray.push({'id':data.id,
							 'name':data.title,
							 'type':'image',		
							 'title':data.title,
 							 'role':'option',
							 'tags':'',		
							 'description':data.description,
							 'source':this.galleryPath+data.file, 
							 'date':'',									 
							 'previewCssClass':data.previewCssClass});							
			}	
			this.renderResults();
			this.updateTabIndexes();
		},
		
		//
		// This gets called when a gallery item is selected
		//
		selectClip: function(itemDiv){
			this.deSelectAll();
			this.inherited(arguments);				
			//var layoutData = this.getLayoutData(itemDiv.resultItemObj);
			//var objectBoxArray = dojo.query(".emptyCB_placeholder");
			  var layoutName = itemDiv.resultItemObj.id;
			  layoutName = layoutName.substr(0,layoutName.indexOf("_"));
			  var masterTemplateInfo = this.getMasterTemplateInfo();
//			  var masterPageName = (layoutName == "ALT0")? masterTemplateInfo.currMaster.masterPages[0].name : (layoutName == "ALT1")?  masterTemplateInfo.currMaster.masterPages[1].name :layoutName;
			  var isALT01 = layoutName == "ALT0" || layoutName == "ALT1" || layoutName == "ALT1-RTL";
			 
			  var isMasterDecentForALT01 = false;
			  //is master is good (master page title page and outline page has value and they are not the same, meaning: has decent master pages definition for alt0 and alt1 layout
			  if(layoutName=="ALT0" && masterTemplateInfo.currMaster!=null && masterTemplateInfo.currMaster.masterPages[0].name!=""){
				  var masterPage = dojo.byId(masterTemplateInfo.currMaster.masterPages[0].name);
				  //check if it has subtitle definition
				  if(masterPage!=null){
					  var subtitle =  dojo.query(".draw_frame[presentation_class='subtitle']",masterPage);
					  if (subtitle.length>0){
						  isMasterDecentForALT01 = true;
					  }
				  }
				  
			  }
			  else if((layoutName=="ALT1"||layoutName=="ALT1-RTL") && masterTemplateInfo.currMaster!=null && masterTemplateInfo.currMaster.masterPages[1].name!=""){
				  var masterPage = dojo.byId(masterTemplateInfo.currMaster.masterPages[1].name);
				  //check if it has outline definition			  
				  if(masterPage!=null){
					  var outline =  dojo.query(".draw_frame[presentation_class='outline']",masterPage);
					  if (outline.length==1){
						  isMasterDecentForALT01 = true;
					  }
				  } 
			 }
			
			  var masterPageName = (masterTemplateInfo.currMaster != undefined && isALT01 && isMasterDecentForALT01)? (layoutName == "ALT0")? masterTemplateInfo.currMaster.masterPages[0].name:masterTemplateInfo.currMaster.masterPages[1].name : layoutName;
			  var drawPage =null;
			  
			  drawPage = dojo.byId(masterPageName);
		  	  var resultArray = [];
	  		  var objectBoxArray = dojo.query('.draw_frame',drawPage);
		  	  for (var i=0; i< objectBoxArray.length; i++){
		  		 if((dojo.hasClass(objectBoxArray[i].parentNode, "style_master-page") ||dojo.hasClass(objectBoxArray[i].parentNode, "draw_page") )&& !dojo.hasClass(objectBoxArray[i], "backgroundImage")){
			  		 resultArray.push({
			  			 	'type':dojo.attr(objectBoxArray[i],'presentation_class'),
			  			 	'top' :  objectBoxArray[i].style.top,
				 			'left' : objectBoxArray[i].style.left,
		 					'height' : objectBoxArray[i].style.height,
		 					'width' : objectBoxArray[i].style.width,
		 					'layoutName':layoutName
			  		 });
		  		 }
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
			//if (!itemDiv.isSelected){  //10763, with this if check, if user undo a layout and keep dialog open and re-select the previous selected layout in the dialog, the layout won't change, need to get rid of the if check
				this.selectClip(itemDiv);
			//}	
		},
		itemKeypress: function(evt) {
			if (evt.keyCode == dojo.keys.ENTER) {
				this.selectClip(evt.target);
				dojo.stopEvent(evt);
			}
		},
		itemDblClick: function(itemDiv){
			if (this.onDblClick){
				//if (!itemDiv.isSelected){ //10763, with this if check, if user undo a layout and keep dialog open and re-select the previous selected layout in the dialog, the layout won't change, need to get rid of the if check
					this.selectClip(itemDiv);
				//}	
				this.onDblClick();
			}
		}
		
	});
