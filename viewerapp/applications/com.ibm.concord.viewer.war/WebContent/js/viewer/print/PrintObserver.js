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
dojo.provide("viewer.print.PrintObserver");
dojo.require("viewer.widgets.ProgressBar");

dojo.declare("viewer.print.PrintObserver", null, {
	pageNum: 0,
	loadedPageNum: 0,
	err: false,
	cancelled: false,
	waitingDlg: null,
	nls: null,
	// callback functions
	prepareFunc: null,
	succFunc: null,
	failFunc: null,
	cancelFunc: null,
	
	constructor: function(pageNum, prepareFunc, succFunc, failFunc, cancelFunc, nls){
		this.prepareFunc = prepareFunc;
		this.succFunc = succFunc;
		this.failFunc = failFunc;
		this.cancelFunc = cancelFunc;
		this.pageNum = pageNum;
		this.nls = nls;
	},
	
	start: function(){
		if (!this.waitingDlg){
			this.waitingDlg = new viewer.widgets.ProgressBar(null, this.nls.titlePrepare, null, false, 
							{message: this.nls.msgPrepare, 
							imageclass:"dlg_progress_processing",
							callback: dojo.hitch(this, function(object, bResponse){
								if (!bResponse){ // cancel
									this.cancelled = true;
									this.stop();
								}
							})});
		}
		this.waitingDlg.show();
		var duration = this.waitingDlg.dialog.duration + 200;
		if (this.prepareFunc)
			setTimeout(this.prepareFunc, duration);
	},
	
	onImageLoaded: function(img){
		if ((!this.err) && (!this.cancelled)){
			this.loadedPageNum++;
			console.log('PrintObserver: ' + dojo.attr(img, 'id') + ' loaded, total: ' + this.loadedPageNum);
		}
		img.onload = null;
		img.onerror = null;
		if (this.loadedPageNum == this.pageNum){
			this.stop();
		}
	},
	
	onImageLoadErr: function(img){
		img.onload = null;
		img.onerror = null;
		if ((!this.err) && (!this.cancelled)){
			this.err = true;
			console.log('PrintObserver: img load fail');
			this.stop();
		}
	},
	
	stop: function(){
		var duration = 0;
		if (this.waitingDlg){
			duration = this.waitingDlg.dialog.duration + 200;
			this.waitingDlg.hide();
			this.waitingDlg = null;
		}
		console.log('PrintObserver stop');
		setTimeout(dojo.hitch(this, function(){
			if (this.cancelled){
				if (this.cancelFunc)
					this.cancelFunc(this);
			}
			else if (!this.err){
				if (this.succFunc)
					this.succFunc(this);
			}
			else {
				if (this.failFunc)
					this.failFunc(this);
			}
		}), duration);
	}
});