/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("viewer.viewerPreload");

dojo.declare("viewer.viewerPreload", null, {
	staticPath: "",
	viewerApiUrl: "/viewer/api/version",
	viewerDiv: null,
	staticTimer: null,
	jsIndex: 0,
	cssIndex: 0,
	  jsFiles: ['/js/dojo/dojo.js',
	               '/js/viewer/viewer.js',
	               '/js/html/js/dojo/dojo.js',
	               '/js/html/js/concord/concord_text.js',
	               '/js/html/js/concord/concord_pres.js',
	               '/js/html/js/concord/concord_sheet_view.js',
	               '/js/pdfjs/pdf.js',
	               '/js/pdfjs/pdf.worker.js',
	               '/js/viewer/pdfJs/pdfJsViewer.js'],
	    cssFiles: ['/js/html/css/sheetview.css',
	                '/js/html/css/presview.css',
	                '/js/html/css/presview2.css',
	                '/js/html/styles/css/document/document_main.css',
	                '/js/html/js/writer/css/concord_document.css',
	                '/js/dijit/themes/oneui30/oneui30.css',
	                '/styles/css/base.css'],
    eventArray: [],
    bContinueLoad: true,
    timerInterval: 300,
    timerCount: 0,

	preload : function(delay) {
		window.setTimeout(dojo.hitch(this, this._doPreload), 1000 * delay);
	},

	_doPreload: function() {
		if( this._initStaticPath(this.viewerApiUrl)) {
			var viewerDiv = document.createElement("div");
			viewerDiv.id = "viewerPreloadDiv";
			viewerDiv.style.display = "none";
			document.body.appendChild(viewerDiv);
			this.viewerDiv = viewerDiv;
			this.staticTimer = window.setInterval(dojo.hitch(this, this._preloadStatics), this.timerInterval);
		}

	},
	_initStaticPath: function(versionUrl) {
		var resp, ioArgs;
		// "version.txt" is another option, but maybe cached
		dojo.xhrGet({
			url : versionUrl,
			handleAs : "json",
			preventCache : true,
			handle : function(r, io) {
				resp = r;
				ioArgs = io;
			},
			sync : true
		});

		if (resp instanceof Error) {
			return false;
		}
		if(versionUrl==this.viewerApiUrl)
			this.staticPath = resp.build_timestamp;

		return true;
	},

	_preloadStatics: function() {
		this.timerCount++;
		if( (this.timerInterval * this.timerCount) > (1000 * 60 * 4) ) {
			this._killTimer();
			return;
		}

		if(this.bContinueLoad) {
			if(this.jsFiles.length > this.jsIndex) {
				var aFile = this.jsFiles[this.jsIndex++];
				if(aFile)
					this.createPlaceHolder(aFile);
				else
					this.jsIndex++;
			}
			else if(this.cssFiles.length > this.cssIndex) {
				var aFile = this.cssFiles[this.cssIndex++];
				if(aFile)
					this.createPlaceHolder(aFile);
				else
					this.cssIndex++;
			}
			else if(this.staticTimer){
				this._killTimer();
			}
		}
		else {
			if(this.jsFiles.length <= this.jsIndex && this.cssFiles.length <= this.cssIndex && this.staticTimer) {
				this._killTimer();
			}
		}
	},

	_killTimer: function() {
		if(this.staticTimer) {
			clearInterval(this.staticTimer);
			this.staticTimer = null;
			window.setTimeout(dojo.hitch(this, this._clear), 1000*25);
		}
	},

	createPlaceHolder: function(url){
		var rUrl = "/viewer/static/" + this.staticPath + url;
		var o = null;
		if(dojo.isIE){
			//o = new Image();
			//o.src = rUrl;
			o = document.createElement('script');
	        o.src = rUrl;
	        o.type = "text/cache";
		} else {
			o = document.createElement('object');
	        o.data = rUrl;
	        o.width  = 0;
	        o.height = 0;
		}

		this.viewerDiv.appendChild(o);

		if(dojo.isIE) {
			this.eventArray.push(dojo.connect(o, "onreadystatechange", dojo.hitch(this, this._onObjStateChange, o)));
		}
		else {
			this.eventArray.push(dojo.connect(o, "onload", dojo.hitch(this, this._onObjLoad)));
		}

		this.bContinueLoad = false;
	},

	// non-IE object onload, to identify if the object loaded
	_onObjLoad: function() {
		this.bContinueLoad = true;
		//console.log((this.jsIndex + this.cssIndex) + " files was loaded on FF!!!!!");
	},

	// IE, object state change, to identify if the object loaded
	_onObjStateChange: function(o) {
		if( o.readyState == "complete" || o.readyState == "loaded" ) {
			this.bContinueLoad = true;
			//console.log((this.jsIndex + this.cssIndex) + " files was loaded on IE!!!!!");
		}
	},

	_clear: function() {
		if(this.eventArray) {
			for(var i; i<this.eventArray.length; i++) {
				dojo.disconnect(this.eventArray[i]);
			}
			this.eventArray = [];
			//console.log("cleared event array!!!");
		}
		if(this.viewerDiv && this.viewerDiv.parentNode) {
			this.viewerDiv.parentNode.removeChild(this.viewerDiv);
			//console.log("cleared preload div!!!");
		}
	}
});
