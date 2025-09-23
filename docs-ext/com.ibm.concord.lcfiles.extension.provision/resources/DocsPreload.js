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

dojo.provide("concord.DocsPreload");

dojo.declare("concord.DocsPreload", null, {
	staticPath: "",
	docsDiv: null,
	staticTimer: null,
	jsIndex: 0,
	cssIndex: 0,
	jsFiles: ['/js/dojo/dojo.js',
               '/js/concord/concord_text.js',
               '/js/concord/concord_sheet.js',
               '/js/concord/concord_pres.js'],
    cssFiles: ['/styles/css/document/document_main.css',
                '/js/writer/css/concord_document.css',
                '/styles/css/websheet/sheet_main.css',
                '/js/wseditor/css/concord_sheet.css',
                '/js/dijit/themes/oneui30/oneui30.css',
                '/styles/css/presentation2/all.css',
                '/styles/css/base.css'],
    eventArray: [],
    bContinueLoad: true,
    timerInterval: 300,
    timerCount: 0,

	preload : function(delay) {
		if(concord.global.isNeedDocsSAML() && !concord.global.haveDocsLTPA()){
			concord.global.doDocsSSO();
			window.setTimeout(dojo.hitch(this, this.preload, delay), 1000);
		} else {
			window.setTimeout(dojo.hitch(this, this._doPreload), 1000 * delay);
		}
	},

	_doPreload: function() {
		if( this._initStaticPath() ) {
			var docsDiv = document.createElement("div");
			docsDiv.id = "DocsPreloadDiv";
			docsDiv.style.display = "none";
			document.body.appendChild(docsDiv);
			this.docsDiv = docsDiv;
			this.staticTimer = window.setInterval(dojo.hitch(this, this._preloadStatics), this.timerInterval);
		}

	},

	_initStaticPath: function() {
		var resp, ioArgs;
		// "version.txt" is another option, but maybe cached
		dojo.xhrGet({
			url : "/docs/api/version",
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
		var rUrl = "/docs/static/" + this.staticPath + url;
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

		this.docsDiv.appendChild(o);

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
		if(this.docsDiv && this.docsDiv.parentNode) {
			this.docsDiv.parentNode.removeChild(this.docsDiv);
			//console.log("cleared preload div!!!");
		}
	}
});
