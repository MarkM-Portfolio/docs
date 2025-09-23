/**
 * Licensed Materials - Property of IBM.
 * @imageGallery CKEditor Plugin
 * Copyright IBM Corporation 2010. All Rights Reserved.
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
dojo.provide("concord.widgets.imageGallery");
dojo.require("concord.widgets.concordGallery");
dojo.requireLocalization("concord.widgets","imageGallery");


    dojo.declare("concord.widgets.imageGallery", [concord.widgets.concordGallery], {
		
		constructor: function(opts) {
			this.mainDiv = (opts.mainDiv)? opts.mainDiv : null;
			//this.mainDiv = (opts.mainDiv)? opts.mainDiv.parentNode : null;
			this.onSelectCallback = (opts.onSelectCallback)? opts.onSelectCallback : null;
			this.clipPluginPath = (opts.clipPluginPath)? opts.clipPluginPath : null;
			this.userInfo = (opts.userInfo)? opts.userInfo : null;			
			this.showErrorMessage = (opts.showErrorMessage)? opts.showErrorMessage : this.showErrorMessage;	
			this.onDblClick = (opts.onDblClick)? opts.onDblClick: null;

		},
		
//		galleryPath: 'http://'+window.location.host + window.contextPath + window.staticRootPath + '/js/concord/widgets/imageGallery/',
//		galleryJSONPath: 'http://'+window.location.host + window.contextPath + window.staticRootPath + '/js/concord/widgets/imageGallery/galleryImagesIndex.json',
		galleryPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/imageGallery/',
		galleryJSONPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/imageGallery/galleryImagesIndex.json',

	    FILE_TAB_ID : "P_d_ClipArt_ContentDiv_tablist_P_d_ClipArt_uploadTab",

	    init: function(){
	    	this.STRINGS = dojo.i18n.getLocalization("concord.widgets","imageGallery");
	    	this.searchBoxTitle = this.STRINGS.filterImageGallery;
	    	this.inherited(arguments);
	    },

	    
		addSearchFilters: function(){
			
			var filterSectionDiv = this.filterSectionDiv = document.createElement("div");
			this.mainDiv.appendChild(filterSectionDiv);
			dojo.addClass(filterSectionDiv,"clipPickerDialogFilterSection");

			var resultSpan = this.resultTitle = document.createElement("span");
			resultSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.results+": 0 "+this.CLIP_STRINGS.hits));
			filterSectionDiv.appendChild(resultSpan);
			dojo.addClass(resultSpan,'clipPickerDialogResultCount');

			var filterSpan = document.createElement("span");
			dojo.addClass(filterSpan,'clipPickerDialogFilterSpan');
	     
			filterSectionDiv.appendChild(filterSpan);
			var imageSpan = this.imageSpan = document.createElement('span');
			filterSpan.appendChild(imageSpan);
			imageSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.images));				
			
			this.deSelectFilter(imageSpan);
			
			dojo.style(imageSpan, {
				'display':'none'
			});	

			var textSpan = this.textSpan = document.createElement('span');
			filterSpan.appendChild(textSpan);
			textSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.pictures));				
			
			this.deSelectFilter(textSpan);
							
			dojo.style(textSpan, {
				'display':'none'
			});	
			
			var picSpan = this.picSpan = document.createElement('span');
			filterSpan.appendChild(picSpan);
			picSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.pictures));				
			
			this.deSelectFilter(picSpan);
			
			dojo.style(picSpan, {
				'display':'none'
			});	
							
			var tableSpan = this.tableSpan = document.createElement('span');
			filterSpan.appendChild(tableSpan);
			tableSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.table));					

			this.deSelectFilter(tableSpan);

			dojo.style(tableSpan, {
				'display':'none'
			});		
											
			var showSpan = document.createElement("span");
			filterSpan.appendChild(showSpan);
			showSpan.appendChild(document.createTextNode(this.CLIP_STRINGS.show+" "));	
			
			var ariaStrings = dojo.i18n.getLocalization("concord.widgets","imageGallery");
//	        var label1 = document.createElement("label");
//	        dojo.attr(label1,"for","categorySelector");
//	        label1.innerHTML = ariaStrings.aria_category_selector;
//			filterSpan.appendChild(label1);

			var categorySelector = document.createElement("Select");
			categorySelector.id = "categorySelector";
			categorySelector.setAttribute("tabindex","20");
			dojo.attr(categorySelector, 'title', ariaStrings.aria_category_selector);
			if(dojo.isIE < 9) {
				dojo.style(categorySelector, {
					'height':'17px'
				});	
			}
			
			if (dojo.isWebKit) {
				categorySelector.onmousedown = dojo.hitch(this,function(){document.onmousedown = null; this.setDefaultMouseDown;});	
			}
			
			var allSpan = this.allSpan = document.createElement('Option');
			allSpan.innerHTML = this.CLIP_STRINGS.all;
			allSpan.value = 'all';	
			//categorySelector.appendChild(allSpan);
			
			var arrowSpan = this.arrowSpan = document.createElement('Option');
			arrowSpan.innerHTML = this.CLIP_STRINGS.arrows;
			arrowSpan.value = 'arrow';
			categorySelector.appendChild(arrowSpan);
				
			var bulletSpan = this.bulletSpan = document.createElement('Option');
			bulletSpan.innerHTML = this.CLIP_STRINGS.bullets;
			bulletSpan.value = 'bullet';
			categorySelector.appendChild(bulletSpan);

			var computerSpan = this.computerSpan = document.createElement('Option');
			computerSpan.innerHTML = this.CLIP_STRINGS.computer;
			computerSpan.value = 'computer';
			categorySelector.appendChild(computerSpan);
			
			var diagramSpan = this.diagramSpan = document.createElement('Option');
			diagramSpan.innerHTML = this.CLIP_STRINGS.diagram;
			diagramSpan.value = 'diagram';
			categorySelector.appendChild(diagramSpan);
			
			var educationSpan = this.educationSpan = document.createElement('Option');
			educationSpan.innerHTML = this.CLIP_STRINGS.education;
			educationSpan.value = 'education';
			categorySelector.appendChild(educationSpan);
			
			var environmentSpan = this.environmentSpan = document.createElement('Option');
			environmentSpan.innerHTML = this.CLIP_STRINGS.environment;
			environmentSpan.value = 'environment';
			categorySelector.appendChild(environmentSpan);
			
			var financeSpan = this.financeSpan = document.createElement('Option');
			financeSpan.innerHTML = this.CLIP_STRINGS.finance;
			financeSpan.value = 'finance';
			categorySelector.appendChild(financeSpan);
			
			var peopleSpan = this.peopleSpan = document.createElement('Option');
			peopleSpan.innerHTML = this.CLIP_STRINGS.people;
			peopleSpan.value = 'people';
			categorySelector.appendChild(peopleSpan);
			
			var shapeSpan = this.shapeSpan = document.createElement('Option');
			shapeSpan.innerHTML = this.CLIP_STRINGS.shape;
			shapeSpan.value = 'shape';
			categorySelector.appendChild(shapeSpan);
			
			var symbolSpan = this.symbolSpan = document.createElement('Option');
			symbolSpan.innerHTML = this.CLIP_STRINGS.symbol;
			symbolSpan.value = 'symbol';
			categorySelector.appendChild(symbolSpan);
			
			var transportationSpan = this.transportationSpan = document.createElement('Option');
			transportationSpan.innerHTML = this.CLIP_STRINGS.transportation;
			transportationSpan.value = 'transportation';
			categorySelector.appendChild(transportationSpan);
			
			filterSpan.appendChild(categorySelector);
			
			//sort the options by the displayed text
			var tmpAry = new Array();
            for (var i=0;i<categorySelector.options.length;i++) {
                    tmpAry[i] = new Array();
                    tmpAry[i][0] = categorySelector.options[i].text;
                    tmpAry[i][1] = categorySelector.options[i].value;
            }
            tmpAry.sort();
            while (categorySelector.options.length > 0) {
            	categorySelector.options[0] = null;
            }
            for (var i=0;i<tmpAry.length;i++) {
                    var op = new Option(tmpAry[i][0], tmpAry[i][1]);
                    if (tmpAry[i][1] == "arrow") {
                    	op.selected = true;
                    }
                    categorySelector.options[i] = op;
            }
            
            tmpAry = null;

            dojo.connect(categorySelector, 'onkeydown', this, "HandleSelectKeyDown");
            dojo.connect(categorySelector, 'onchange', dojo.hitch(this,function(){this.filterResults(dojo.byId('categorySelector').options[dojo.byId('categorySelector').selectedIndex].value,dojo.byId('categorySelector'))}));	
		},

		HandleSelectKeyDown: function(event){
			var node = (typeof( window.event ) != "undefined" ) ? event.srcElement : event.target;
			if(node && node.id == 'categorySelector'){
				var selector = dojo.query("#categorySelector", this.mainDiv);
				selector = selector[0];
				var imageIndex = selector.selectedIndex;
				var imageType = null;
				if(event.keyCode==dojo.keys.RIGHT_ARROW  || event.keyCode==dojo.keys.DOWN_ARROW){
					if(imageIndex < selector.length - 1){
						imageIndex = imageIndex + 1;
						if(event.keyCode==dojo.keys.RIGHT_ARROW && (CKEDITOR.env.ie || (CKEDITOR.env.mac && CKEDITOR.env.webkit)) ){
							selector.selectedIndex = imageIndex;
						}
						imageType = this.getImageType(imageIndex);	
						this.filterResults(imageType);
						event.cancel();
					}
				}else if(event.keyCode==dojo.keys.LEFT_ARROW || event.keyCode==dojo.keys.UP_ARROW){
					if(imageIndex > 0){
						imageIndex = imageIndex - 1;
						if(event.keyCode==dojo.keys.LEFT_ARROW && (CKEDITOR.env.ie || (CKEDITOR.env.mac && CKEDITOR.env.webkit)) ){
							selector.selectedIndex = imageIndex;
						}
						imageType = this.getImageType(imageIndex);				
						this.filterResults(imageType);
						event.cancel();
					}
				}
			}			
		},
		
		getImageType: function(imageIndex){
			var imageType = null;
			switch(imageIndex){
				case 0: imageType = 'arrow'; break;
				case 1: imageType = 'bullet'; break;
				case 2: imageType = 'computer'; break;
				case 3: imageType = 'diagram'; break;
				case 4: imageType = 'education'; break;
				case 5: imageType = 'environment'; break;
				case 6: imageType = 'finance'; break;
				case 7: imageType = 'people'; break;
				case 8: imageType = 'shape'; break;
				case 9: imageType = 'symbol'; break;
				case 10: imageType = 'transportation'; break;
				default: break;
			}
			return imageType;
		},
		
		//used to filter the results based on the imageType
		filterResults: function(imageType) {
			//remove tooltips
			dojo.forEach(this.toolTipObjs, function(w) {
    			w.destroyRecursive(true);	
			});
			this.toolTipObjs = [];
			
			//remove dojo.connects
			dojo.forEach(this.connects, dojo.disconnect);
			this.connects = [];
			
			var myBaseNode = dojo.query("#P_d_ClipArt", dojo.body());
			
			myBaseNode = myBaseNode[0];
			
			//destroy clipPickerDialogImagePreview nodes
			dojo.query(".clipPickerDialogImagePreview", myBaseNode).forEach(function(node, index, arr){
                dojo.destroy(node);
            });
            
			//destroy clipPickerDialogItems nodes
			dojo.query(".clipPickerDialogItem", myBaseNode).forEach(function(node, index, arr){
                dojo.destroy(node);
            });
			
			this.resultBoxDiv.innerHTML ='';
			
			if (imageType == "arrow") {
				//Add arrow 
				for (var i=0; i< this.arrowClipArray.length; i++){
					this.buildResultItemShortView(this.arrowClipArray[i]);					
				}
			} else if (imageType == "bullet") {
				for (var i=0; i< this.bulletClipArray.length; i++){
					this.buildResultItemShortView(this.bulletClipArray[i]);					
				}			
			} else if (imageType == "computer") {
				for (var i=0; i< this.computerClipArray.length; i++){
					this.buildResultItemShortView(this.computerClipArray[i]);					
				}		
			} else if (imageType == "diagram") {
				for (var i=0; i< this.diagramClipArray.length; i++){
					this.buildResultItemShortView(this.diagramClipArray[i]);					
				}
			} else if (imageType == "education") {
				for (var i=0; i< this.educationClipArray.length; i++){
					this.buildResultItemShortView(this.educationClipArray[i]);					
				}
			} else if (imageType == "environment") {
				for (var i=0; i< this.environmentClipArray.length; i++){
					this.buildResultItemShortView(this.environmentClipArray[i]);					
				}
			} else if (imageType == "finance") {
				for (var i=0; i< this.financeClipArray.length; i++){
					this.buildResultItemShortView(this.financeClipArray[i]);					
				}
			} else if (imageType == "people") {
				for (var i=0; i< this.peopleClipArray.length; i++){
					this.buildResultItemShortView(this.peopleClipArray[i]);					
				}
			} else if (imageType == "shape") {
				for (var i=0; i< this.shapeClipArray.length; i++){
					this.buildResultItemShortView(this.shapeClipArray[i]);					
				}
			} else if (imageType == "symbol") {
				for (var i=0; i< this.symbolClipArray.length; i++){
					this.buildResultItemShortView(this.symbolClipArray[i]);					
				}
			} else if (imageType == "transportation") {
				for (var i=0; i< this.transportationClipArray.length; i++){
					this.buildResultItemShortView(this.transportationClipArray[i]);					
				}
			}
			this.updateTabIndexes();
			this.getUserKeyStroke(null);
//			this.handleSelection();
		},
		
		//
		// Displaying results in gallery
		//
		displayAllResults: function(data) {
		  var resultArray = (data.templates)? data.templates : [];
		  this.resetAllArrays();
			for (var i=0; i< resultArray.length; i++){
				var data = resultArray[i].template;
				data = this.updateImageName(data);
				if (data.type=="arrow"){
					this.arrowClipArray.push({'id':data.id,
						'name':data.title,
						'type':'arrow',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});	
				} else if (data.type=="bullet"){					
					this.bulletClipArray.push({'id':data.id,
						'name':data.title,
						'type':'bullet',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="computer"){					
					this.computerClipArray.push({'id':data.id,
						'name':data.title,
						'type':'computer',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="diagram"){					
					this.diagramClipArray.push({'id':data.id,
						'name':data.title,
						'type':'diagram',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="education"){					
					this.educationClipArray.push({'id':data.id,
						'name':data.title,
						'type':'education',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="environment"){					
					this.environmentClipArray.push({'id':data.id,
						'name':data.title,
						'type':'environment',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="finance"){					
					this.financeClipArray.push({'id':data.id,
						'name':data.title,
						'type':'finance',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="people"){					
					this.peopleClipArray.push({'id':data.id,
						'name':data.title,
						'type':'people',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="shape"){					
					this.shapeClipArray.push({'id':data.id,
						'name':data.title,
						'type':'shape',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="symbol"){					
					this.symbolClipArray.push({'id':data.id,
						'name':data.title,
						'type':'symbol',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="transportation"){					
					this.transportationClipArray.push({'id':data.id,
						'name':data.title,
						'type':'transportation',		
						'title':data.title,
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'previewCssClass':data.previewCssClass});
				} else if (data.type=="image"){					
					this.imageClipArray.push({'id':data.id,
						'name':data.title,
						'type':'image',		
						'title':data.title,
						'role':'option',
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
						'role':'option',
						'tags':'',		
						'description':data.description,
						'source':this.galleryPath+data.file, 
						'date':'',									 
						'src':this.galleryPath+data.previewImg});						
				}
			}	
			this.filterResults('arrow');
			this.updateTabIndexes();
			//this.handleFilter('arrow',this.arrowSpan);
		},
		
		//updating the title to display to use localization string
		updateImageName:function(data){
			if(data!=null && data.title!=null){		
				data.title = eval("this.STRINGS."+data.title+"");
				return data;
			}
		},
		
		handleSelection: function() {
			if (this.onSelectCallback) {
				var selectedArray = this.getAllSelected();
				this.onSelectCallback(selectedArray);
				selectedArray = null;
			}
		},
		
		itemDblClick: function(item){
			if (this.onDblClick){
				this.selectClip(item);
				this.onDblClick();
			}
		},
		
		itemClick: function(item){
			this.selectClipToggle(item);
			this.handleSelection();
		},
		
		handleEnterGalleryObj: function(itemDiv) {
			this.selectClipToggle(itemDiv);
			this.handleSelection();
		},

		
		handleKeySubscriptionEvents: function( data){
			if (pe.scene.getFocusComponent() == 'dialogs'){
				//if ( data.eventAction == concord.util.events.keypressHandlerEvents_eventAction_ENTER){
				//	var selectedItems = dojo.query(".clipPickerDialogItemHovered",this.resultBoxDiv);
				//	for ( var i = 0; i < selectedItems.length ; i++){				
				//		this.selectClipToggle(selectedItems[i]);
				//	}
				//} 
				//this.handleSelection();
				
				//if (data.eventAction == concord.util.events.keypressHandlerEvents_eventAction_TAB) {
				//	if (data.e.target) {
				//		var node = data.e.target.ownerDocument.activeElement;
				//		if (node.id == this.FILE_TAB_ID) {
				//			dojo.byId('uploadInputFile').focus();
				//			dojo.stopEvent(data.e);
				//		}
				//	}
				//}
			}
		}
	});
