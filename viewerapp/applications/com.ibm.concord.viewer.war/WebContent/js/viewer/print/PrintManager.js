/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.print.PrintManager");
dojo.require("viewer.print.PrintObserver");
dojo.require("viewer.widgets.ConfirmBox");
dojo.require("viewer.widgets.PrintSettingDialog");
dojo.require("dojo.number");
dojo.requireLocalization("viewer.print", "PrintManager");

dojo.declare("viewer.print.PrintManager", null, {
	paperSize: 'A4',
	direction: 'P', // P: Portrait, L:Landscape
	pagesInfo: null,
	baseUri: null,
	errNode: null,
	imgContainer: null,
	observer: null,
	nls: null,
	
	constructor: function(pagesInfo, baseUri, printNode, errNode){
		this.nls = dojo.i18n.getLocalization("viewer.print", "PrintManager");
		this.baseUri = baseUri;
		this.imgContainer = dojo.byId(printNode);
		this.errNode = dojo.byId(errNode);
		this.pagesInfo = pagesInfo;
		this._initSettings();
	},
	
	// determin the printing settings
	_initSettings: function(){
		console.log('PrintManager: initSettings');
		var currentLocale = dojo.locale || g_locale;
		var country = currentLocale.split('-')[1];
		// determine the paper size per locale 
		this.paperSize = viewer.print.PrintManager.config.defaultSize;
		if (country){
			country = country.toUpperCase();
			papers = viewer.print.PrintManager.config.papers;
			for (var size in papers){
				var supportedCountries = papers[size].countries;
				if (supportedCountries){
					if (dojo.indexOf(supportedCountries,country)!=-1){
						this.paperSize = size;
						break;
					}
				}
			}
		}
		// determine the direction per the size of the first image
		if(this.pagesInfo.length>0)
		{
			var imageSize = this.pagesInfo[0].getFullImageInfo();  
			
			if (imageSize.getPageWidth() >= imageSize.getPageHeight()){
				this.direction = 'L';
			}else{
				this.direction = 'P';
			}
		}
	
		console.log('PrintManager init complete: paper: ' + this.paperSize + ', direction: ' + this.direction);
	},
	
	print: function(bRetry){
		if (this.observer) // one print has started
			return;
		if (!bRetry){
			var msg1 = this.nls.labelPrintConfig;
			var configs = [];
			configs[0] = (this.paperSize=='A4') ? dojo.string.substitute(this.nls.labelConfigPageSize, [this.nls.labelPageA4]):
												dojo.string.substitute(this.nls.labelConfigPageSize, [this.nls.labelLetter]);
			configs[1] = (this.direction == 'L') ? dojo.string.substitute(this.nls.labelConfigOrientation, [this.nls.labelLandscape]):
												dojo.string.substitute(this.nls.labelConfigOrientation, [this.nls.labelPortrait]);
			configs[2] = this.nls.labelConfigHeader;
			configs[3] = this.nls.labelConfigFooter;
			configs[4] = this.nls.labelConfigMargins;
			var unit = viewer.print.PrintManager.config.papers[this.paperSize].unit == 'in' ? this.nls.labelInch : this.nls.labelMm;
			var margin = viewer.print.PrintManager.config.papers[this.paperSize].margin;
			configs[5] = [];
			configs[5][0] = dojo.string.substitute(this.nls.labelConfigMarginTop, [dojo.number.format(margin.top, {type: "decimal"}), unit]);
			configs[5][1] = dojo.string.substitute(this.nls.labelConfigMarginBottom, [dojo.number.format(margin.bottom, {type: "decimal"}), unit]);
			configs[5][2] = dojo.string.substitute(this.nls.labelConfigMarginLeft, [dojo.number.format(margin.left, {type: "decimal"}), unit]);
			configs[5][3] = dojo.string.substitute(this.nls.labelConfigMarginRight, [dojo.number.format(margin.right, {type: "decimal"}), unit]);
			var msg2 = this.nls.labelPrintContinue;
			var settingDlg = new viewer.widgets.PrintSettingDialog(null, 
					this.nls.titlePrintConfig, null, false, 
					{	message: {msg1: msg1, configs: configs, msg2: msg2},
						callback:dojo.hitch(this, function(){
							this._print(bRetry);
						})
					});
			
			settingDlg.show();
		}else{
			this._print(bRetry);
		}

	},
	
	_print: function(bRetry){
		this._beforePrint();
		this.observer = new viewer.print.PrintObserver(this.pagesInfo.length, 
				dojo.hitch(this, this._prepareData, bRetry),
				dojo.hitch(this, this.onDataLoadSucc), 
				dojo.hitch(this, this.onDataLoadFail),
				dojo.hitch(this, this.onDataLoadCancelled),
				this.nls);
		this.observer.start();				 		
	},
	
	_beforePrint: function(){
		console.log('_beforePrint');
		// hide the err node
		dojo.style(this.errNode, 'display', 'none');
	},
	
	_prepareData: function(bRetry){
		// open waiting message
		console.log('preparing data...');
		var img = null;
		var paperSize = viewer.print.PrintManager.config.papers[this.paperSize];
		var margin = paperSize.margin;
		var unit = paperSize.unit;
		var paperWidth = (this.direction == 'P')?
				(paperSize.width - margin.top - margin.bottom) :
				(paperSize.height - margin.top - margin.bottom);
		var paperHeight = (this.direction == 'P')?
				(paperSize.height - margin.left - margin.right) :
				(paperSize.width - margin.left - margin.right);
		var ratio = paperWidth/paperHeight;
		
		if (this.imgContainer.children.length == 0){
			for (var i = 0; i<this.pagesInfo.length; i++){
				var pageInfo = this.pagesInfo[i];
				var pageWidth = pageInfo.getFullImageInfo().getPageWidth();
				var pageHeight = pageInfo.getFullImageInfo().getPageHeight();
				var imgWidth = paperWidth;
				var imgHeight = paperHeight;
//				if (pageWidth/pageHeight > ratio){
//					imgHeight = pageInfo.getFullImageInfo().getScaledHeight(imgWidth);
//				}
//				else{
//					imgWidth = pageInfo.getFullImageInfo().getScaledWidth(imgHeight);
//				}
					
				// to make sure onload and onerror event can be fired,
				// src attribute must be set after error handler is set.
				img = new Image();
				var url = this.baseUri + '/' + pageInfo.getFullImageInfo().getFilepath();
				dojo.addClass(img, 'printImg');
				dojo.attr(img, 'id', 'printImg_' + (i + 1));
				dojo.attr(img, 'alt', 'Image' + (i + 1));
				img.onload = dojo.hitch(this, this.notifyImageLoad, img);
				img.onerror = dojo.hitch(this, this.notifyImageLoadErr, img);
				img.src = url;
				if (bRetry)
					img.src = url + '?preventCache='+ new Date().valueOf();
				dojo.style(img, 'width', imgWidth + unit);
				dojo.style(img, 'height', imgHeight + unit);
				dojo.place(img, this.imgContainer, 'last');
			}
		}					
	},
	
	_afterPrint: function(){
		// destroy the images after print
		console.log('_afterPrint');
		dojo.empty(this.imgContainer);
//		delete this.observer;
		this.observer = null;
		dojo.style(this.errNode, 'display', '');
	},
	
	// notify observer	
	notifyImageLoad: function(img){
		if (this.observer){
			this.observer.onImageLoaded(img);
		}
	},
	
	notifyImageLoadErr: function(img){
		if (this.observer){
			this.observer.onImageLoadErr(img);
		}
	},
	
	// callback to listen in load event
	onDataLoadFail: function(observer){
		if (observer == this.observer){
			// hide waiting message
			console.log('error got to prepare data');
			this._afterPrint();
			// open warning dialog
			var dlg = new viewer.widgets.ConfirmBox(this, this.nls.titleErr, this.nls.btnRetry, true, 
						{message:this.nls.errPrepare, 
					 	 callback:function(obj, bRetry){
							 if (bRetry){
								 setTimeout(dojo.hitch(obj, obj.print, bRetry), 500);
							 }
						 return true;
					 	}, 
					 imageclass:"viewerSprite viewerSprite-msgError48"});
			dlg.show();

		}else{
			console.log('one error return by another observer');
		}
	},
	
	onDataLoadSucc: function(observer){
		if (observer == this.observer){
			// hide waiting message
			console.log('data prepare complete');
			window.print();
			this._afterPrint();
		}
	},
	
	onDataLoadCancelled: function(observer){
		if (observer == this.observer){
			console.log('data prepare cancelled');
			this._afterPrint();
		}
	}
	
});

viewer.print.PrintManager.config = {
		defaultSize: 'A4',
		papers:{
			A4:{
				width: 210,
				height: 297,
				margin: {
					top: 12,
					bottom: 12,
					left: 12,
					right: 12
				},
				unit: 'mm'
			},
			Letter:{
				width: 8.5,
				height: 11,
				margin: {
					top: 0.5,
					bottom: 0.5,
					left: 0.5,
					right: 0.5
				},
				unit: 'in',
				countries: ['US', 'CA']
			}
		}
};
