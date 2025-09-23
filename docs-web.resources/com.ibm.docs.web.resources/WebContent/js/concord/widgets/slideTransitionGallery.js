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
 * @slideTransitionGallery CKEditor Plugin
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
dojo.provide("concord.widgets.slideTransitionGallery");
dojo.require("concord.widgets.concordGallery");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","slideTransitionGallery");

    dojo.declare("concord.widgets.slideTransitionGallery", [concord.widgets.concordGallery], {
		
		constructor: function(opts) {
    		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slideTransitionGallery");
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
		
		//galleryPath: 'http://'+window.location.host + window.contextPath+'/js/concord/widgets/slideTransitionGallery/',
		//galleryJSONPath: 'http://'+window.location.host + window.contextPath+'/js/concord/widgets/slideTransitionGallery/gallerySlideTransitionIndex.json',
		galleryPath:  window.contextPath + window.staticRootPath + '/styles/css/presentation2/images/slidetrans/gallery/',
		galleryJSONPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/slideTransitionGallery/gallerySlideTransitionIndex.json',
		galleryLayoutData: null,
		tmpIframeLayout: null,
		
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
			dojo.style(this.resultBoxDiv,{
				'height': "145px"
			});			
			dojo.style(this.resultBoxDiv,{
				'border': "0px"
			});
			dojo.style(this.resultBoxDiv,{
				'margin': "0px"
			});
			dojo.style(this.resultBoxDiv,{
				'padding': "0px"
			});
//			dojo.style(mainParentContainer,{
//				'height': "330px"
//			});
		},
		
		
		//updating the title to display to use localization string
		updateLayoutName:function(data){
			if(data!=null && data.title!=null){
				if(data.title =="None"){
					data.title = this.STRINGS.none;
				}else if(data.title =="Fade Smoothly"){
					data.title = this.STRINGS.fadeSmoothly;
				}else if(data.title =="Wipe Down"){
					data.title = this.STRINGS.wipeDown;
				}else if(data.title =="Wipe Right"){
					data.title = this.STRINGS.wipeRight;
				}else if(data.title =="Wipe Up"){
					data.title = this.STRINGS.wipeUp;
				}else if(data.title =="Wipe Left"){
					data.title = this.STRINGS.wipeLeft;
				}else if(data.title =="Cover Down"){
					data.title = this.STRINGS.coverDown;
				}else if(data.title =="Cover Right"){
					data.title = this.STRINGS.coverRight;
				}else if(data.title =="Cover Up"){
					data.title = this.STRINGS.coverUp;
				}else if(data.title =="Cover Left"){
					data.title = this.STRINGS.coverLeft;
				}else if(data.title =="Push Down"){
					data.title = this.STRINGS.pushDown;
				}else if(data.title =="Push Right"){
					data.title = this.STRINGS.pushRight;
				}else if(data.title =="Push Up"){
					data.title = this.STRINGS.pushUp;
				}else if(data.title =="Push Left"){
					data.title = this.STRINGS.pushLeft;
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
		  
			this.renderResults();
	
			dojo.query(".clipPickerDialogResultCount", 'P_d_SlideTranstions').forEach(function(node, index, arr){
			    dojo.style(node, "display", "none");  
			});
			
			dojo.query(".dijitTextBox", 'P_d_SlideTranstions').forEach(function(node, index, arr){
				dojo.style(node, "display", "none");  
			});
			
			dojo.query(".clipPickerDialogItem", 'P_d_SlideTranstions').forEach(function(node, index, arr){
				dojo.removeClass(node, "clipPickerDialogItem");
			    dojo.addClass(node, "clipPickerTransitionDialogItem"); 
			    node.setAttribute("role", "option");
			    if (node.id == "none") {
			    	dojo.addClass(node, "clipPickerDialogItemSelected"); 
			    }
				dojo.style(node, {
					'width':'75px'
				});	
			});	
			
			dojo.query(".clipPickerDialogItemPreviewBox", 'P_d_SlideTranstions').forEach(function(node, index, arr){
			      dojo.removeClass(node, "clipPickerDialogItemPreviewBox");
			      dojo.addClass(node, "clipPickerTransitionDialogItemPreviewBox");
			});
			
			dojo.query(".clipPickerDialogImagePreview", 'P_d_SlideTranstions').forEach(function(node, index, arr){
			      dojo.removeClass(node, "clipPickerDialogImagePreview");
			      dojo.addClass(node, "clipPickerTransitionDialogImagePreview");
			});
			
			dojo.query(".clipPickerDialogResultBox", 'P_d_SlideTranstions').forEach(function(node, index, arr){
			    dojo.create("div", {id: "allOrSelected"}, node, "after");
			});
			
			dojo.query("#allOrSelected", 'P_d_SlideTranstions').forEach(function(node, index, arr){
				dojo.style("allOrSelected", "textAlign", BidiUtils.isGuiRtl() ? "left" : "right");
				dojo.style("allOrSelected", "fontWeight", "bold");
				
				var mystrings = dojo.i18n.getLocalization("concord.widgets","slideTransitionGallery");
				dojo.attr("allOrSelected", "aria-label", mystrings.applyToSlidesVoice);
				dojo.attr("allOrSelected", "role", "group");
				var floatValue = BidiUtils.isGuiRtl() ? "right" : "left";
				node.innerHTML = "<fieldset><legend style='width: auto; float: " + floatValue + ";'>"+mystrings.applyToSlides+"&nbsp;&nbsp;"+"</legend>"+"<input type='radio' dojoType='dijit.form.RadioButton' name='selectedSlide' id='radioOne' value='selected' checked='true' tabindex=24 />&nbsp;<label for='radioOne'>"+mystrings.selectedSlides+"</label> <input type='radio' dojoType='dijit.form.RadioButton' name='selectedSlide' id='radioTwo' value='all' tabindex=25 />&nbsp;<label for='radioTwo'>"+mystrings.allSlides+"</label></fieldset>"; 	
			});
			this.updateTabIndexes();
		},
		
		updateTabIndexes: function(){
			var firstIndexNumber = 10;			
	        var resultItemsArray = dojo.query('.clipPickerTransitionDialogItem',this.mainDiv);
			for (var i=0; i<resultItemsArray.length;i++){
				dojo.attr( resultItemsArray[i], 'tabindex', i + firstIndexNumber);
			}
			
			var numberOfRadioButtonTabIndexes = 2;
			var parentDialog = this._getParentDialog();			
			if ( parentDialog ){
				var buttonItemsArray = dojo.query('.dijitButtonContents', parentDialog.domNode);
				for (var j=0; j<buttonItemsArray.length; j++){
					dojo.attr( buttonItemsArray[j], 'tabindex', resultItemsArray.length + j + firstIndexNumber + numberOfRadioButtonTabIndexes);
				}
				parentDialog._getFocusItems(parentDialog.domNode);
			}
		},		
		
		//
		// This gets called when a gallery item is selected
		//
		selectClip: function(itemDiv){
			this.deSelectAll();
			dojo.removeClass(itemDiv,'clipPickerDialogItemHovered');		
			dojo.addClass(itemDiv,'clipPickerDialogItemSelected');
			this.inherited(arguments);		
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
				if (!itemDiv.isSelected){
					this.selectClip(itemDiv);
				}	
				this.onDblClick();
				if (this.onSelectCallback) this.onSelectCallback();
			}
		}
		
	});
