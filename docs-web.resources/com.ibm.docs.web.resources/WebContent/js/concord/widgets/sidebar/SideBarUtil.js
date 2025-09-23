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

dojo.provide("concord.widgets.sidebar.SideBarUtil");

/**
 * This detector is applied to listen to font changed event triggered by Browser.
 * Which is a custom event added to Browser.
 */ 
FontResizeDetector = function() { 
	var el  = null;
	var iIntervalDelay  = 500;
	var iInterval = null;
	var iCurrSize = -1;
	var iBase = -1;
	var aListeners = [];
	var createControlElement = function() {
		el = document.createElement('span');
		el.id='textResizeControl';
		el.innerHTML='&nbsp;';
		el.style.position="absolute";
		el.style.left="-9999px";
		var elC = document.getElementById(FontResizeDetector.TARGET_ELEMENT_ID);
		// insert before firstChild
		if (elC)
			elC.insertBefore(el,elC.firstChild);
		iBase = iCurrSize = FontResizeDetector.getSize();
	};

	function _stopDetector() {
		window.clearInterval(iInterval);
		iInterval=null;
	};

	function _startDetector() {
		if (!iInterval) {
			iInterval = window.setInterval('FontResizeDetector.detect()',iIntervalDelay);
		}
	};
    
	function _detect() {
		var iNewSize = FontResizeDetector.getSize();
        
		if(iNewSize!== iCurrSize) {
			for (var i=0;i < aListeners.length;i++) {
				aListnr = aListeners[i];
				var oArgs = {  iBase: iBase,iDelta:((iCurrSize!=-1) ? iNewSize - iCurrSize + 'px' : "0px"),iSize:iCurrSize = iNewSize};
				if (!aListnr.obj) {
					aListnr.fn('textSizeChanged',[oArgs]);
				}
				else  {
					aListnr.fn.apply(aListnr.obj,['textSizeChanged',[oArgs]]);
				}
			}
		}
		return iCurrSize;
	};
	var onAvailable = function() {
        
		if (!FontResizeDetector.onAvailableCount_i ) {
			FontResizeDetector.onAvailableCount_i =0;
		}

		if (document.getElementById(FontResizeDetector.TARGET_ELEMENT_ID)) {
			FontResizeDetector.init();
			if (FontResizeDetector.USER_INIT_FUNC){
				FontResizeDetector.USER_INIT_FUNC();
			}
			FontResizeDetector.onAvailableCount_i = null;
		}
		else {
			if (FontResizeDetector.onAvailableCount_i<600) {
				FontResizeDetector.onAvailableCount_i++;
				setTimeout(onAvailable,200)
			}
		}
	};
	setTimeout(onAvailable,500);
	return {
		/*
		* Initializes the detector
		* 
		* @param {String} sId The id of the element in which to create the control element
		*/
		init: function() {
		
			createControlElement();     
			_startDetector();
		},
		/**
		* Adds listeners to the ontextsizechange event. 
		* Returns the base font size
		* 
		*/
		addEventListener:function(fn,obj,bScope) {
			aListeners[aListeners.length] = {
				fn: fn,
				obj: obj
				}
			return iBase;
		},
		/**
		* performs the detection and fires textSizeChanged event
		* @return the current font size
		* @type {integer}
		*/
		detect:function() {
			return _detect();
		},
		/**
		* Returns the height of the control element
		* 
		* @return the current height of control element
		* @type {integer}
		*/
		getSize:function() {
			var iSize;
			return el.offsetHeight;                                
		},
		/**
		* Stops the detector
		*/
		stopDetector:function() {
			return _stopDetector();
		},
		/*
		* Starts the detector
		*/
		startDetector:function() {
			return _startDetector();
		}
	}
 }();

FontResizeDetector.TARGET_ELEMENT_ID = 'doc';
FontResizeDetector.USER_INIT_FUNC = null;

