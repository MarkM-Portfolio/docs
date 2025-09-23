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

dojo.provide("viewer.pdfJs.pdfJsViewer");
dojo.declare("viewer.pdfJs.pdfJsViewer",null,{
	PDFView: null,
	viewManager: null,
	style:"",
	constructor: function(viewManager, style){
		this.viewManager = viewManager;
		this.style = style;
		dojo.subscribe(viewer.util.Events.PAGE_SELECTED, this, this._onPageSelected);
		dojo.subscribe(viewer.util.Events.SCALE_CHANGED, this, this._onRescaled);
		dojo.subscribe(viewer.util.Events.STYLE_CHANGED, this, this._onStyleChanged);
	},
	
	openFile: function(callback){
		this.PDFView = PDFViewerApplication;
		var container = document.getElementById('contentPane');
		PDFViewerApplication.initialize(this, container);
		var file = viewer.util.uri.getDocPageRoot() + '/content.pdf';
	  	PDFViewerApplication.open(file, callback);
	},
	
	showFile: function(cb){
		this.PDFView.show(cb);
	},
	
	error: function(exception){
		if(exception instanceof PDFJS.PasswordException)
			viewer.scenes.ErrorScene.renderError(1100);  //AccessException.EC_DOCUMENT_ENCRYPT
		else
			viewer.scenes.ErrorScene.renderError(3333);  //pdf error
	},
	
   _onPageSelected: function(i){
   		this.PDFView.page = i;
   },
   
   _onRescaled: function(newScale){
   		if (this.PDFView.currentScale != newScale){
			if (this.style != ''){
				this.style = '';
				this.notifyStyleChanged('');
			}
			this.PDFView.setScale(newScale, false);
		}
	},
	
	 _onStyleChanged: function(newStyle){
	 	if (this.style != newStyle){
			this.style = newStyle;
			this.PDFView.setScale(DEFAULT_SCALE, true);
		}
	},
	
	// notify page selected
	notifyPageSelected: function(i){
		if (this.viewManager && this.viewManager.setCurrentPage)
			this.viewManager.setCurrentPage(i);
	},
	
	notifyStyleChanged: function(newStyle){
		if (this.viewManager && this.viewManager.setCurrentStyle)
			this.viewManager.setCurrentStyle(newStyle);
	},
	
	notifyScaleChanged: function(newScale){
		if (this.viewManager && this.viewManager.setCurrentScale)
			this.viewManager.setCurrentScale(newScale);
	}
});

var PDFViewerApplication = {
  initialized: false,
  pdfDocument: null,
//  sidebarOpen: false,
//  printing: false,
  /** @type {PDFViewer} */
  pdfViewer: null,
  /** @type {PDFThumbnailViewer} */
//  pdfThumbnailViewer: null,
  /** @type {PDFRenderingQueue} */
  pdfRenderingQueue: null,
//  pageRotation: 0,
  updateScaleControls: true,
  isInitialViewSet: false,
//  mouseScrollTimeStamp: 0,
//  mouseScrollDelta: 0,
//  preferenceSidebarViewOnLoad: 0,
//  preferencePdfBugEnabled: false,
  isViewerEmbedded: (window.parent !== window),
//  url: '',
  viewManager: null,//pdfJsViewer

  initialize: function (viewManager, container, thumbnailContainer) {
  	this.viewManager = viewManager;
    var pdfRenderingQueue = new PDFRenderingQueue();
    pdfRenderingQueue.onIdle = this.cleanup.bind(this);
    this.pdfRenderingQueue = pdfRenderingQueue;

    var viewer = document.getElementById('viewer');
    if(!viewer)
    	viewer = dojo.create('div', {id:"continuousView",class:"pdfViewer"}, container);
    this.pdfViewer = new PDFViewer({
      container: container,
      viewer: viewer,
      renderingQueue: pdfRenderingQueue,
      linkService: this,
      viewManager: viewManager
    });
    pdfRenderingQueue.setViewer(this.pdfViewer);
    
    //var thumbnailContainer = document.getElementById('thumbnailPane');
//    if(thumbnailContainer){    	
//	    this.pdfThumbnailViewer = new PDFThumbnailViewer({
//	      container: thumbnailContainer,
//	      renderingQueue: pdfRenderingQueue,
//	      linkService: this
//	    });
//	    pdfRenderingQueue.setThumbnailViewer(this.pdfThumbnailViewer);
//   } 
    
	PDFViewerApplication.initialized = true;
  },
  
 get currentScale(){
 	return this.pdfViewer.currentScale;
 },
  get pagesCount() {
    return this.pdfDocument.numPages;
  },

  set page(val) {
    this.pdfViewer.currentPageNumber = val;
    this.pdfViewer.scrollPageIntoView(val);
  },

  get page() {
    return this.pdfViewer.currentPageNumber;
  },
  
  close: function pdfViewClose() {
    if (!this.pdfDocument) {
      return;
    }

    this.pdfDocument.destroy();
    this.pdfDocument = null;

    //this.pdfThumbnailViewer.setDocument(null);
    this.pdfViewer.setDocument(null);

    if (typeof PDFBug !== 'undefined') {
      PDFBug.cleanup();
    }
  },

  open: function pdfViewOpen(file, callback) {
    this.close();

    var parameters = {};
    if (typeof file === 'string') {
      parameters.url = file;
    } else if (file && 'byteLength' in file) { // ArrayBuffer
      parameters.data = file;
    } else if (file.url && file.originalUrl) {
      parameters.url = file.url;
    }
    
    var self = this;
    self.loading = true;
    self.downloadComplete = false;

    PDFJS.getDocument(parameters).then(
      function getDocumentCallback(pdfDocument) {
      	self.pdfDocument = pdfDocument;
      	callback(pdfDocument.numPages);
        self.loading = false;
      },
      function getDocumentError(exception) {
        self.error(exception);
        self.loading = false;
      }
    );
  },
  
  show: function(cb){
  	this.load(this.pdfDocument, cb);    
  },
  /**
   * Show the error box.
   * @param {String} message A message that is human readable.
   * @param {Object} moreInfo (optional) Further information about the error
   *                            that is more technical.  Should have a 'message'
   *                            and optionally a 'stack' property.
   */
  error: function pdfViewError(exception) {
	this.viewManager.error(exception);
  },

  load: function pdfViewLoad(pdfDocument, cb, scale) {
    var self = this;
    scale = scale || UNKNOWN_SCALE;
    
    var downloadedPromise = pdfDocument.getDownloadInfo().then(function() {
      self.downloadComplete = true;
    });

    var pagesCount = pdfDocument.numPages;
    
    var pdfViewer = this.pdfViewer;
    pdfViewer.currentScale = scale;
    pdfViewer.setDocument(pdfDocument);
    var firstPagePromise = pdfViewer.firstPagePromise;
    var pagesPromise = pdfViewer.pagesPromise;
    var onePageRendered = pdfViewer.onePageRendered;

 //   this.pageRotation = 0;
    this.isInitialViewSet = false;
    this.pagesRefMap = pdfViewer.pagesRefMap;

   // this.pdfThumbnailViewer.setDocument(pdfDocument);
   //var storePromise = store.initializedPromise;
    Promise.all([firstPagePromise]).then(function resolved() {  
      self.setInitialView(scale);
      cb();
      if (!self.isViewerEmbedded) {
        self.pdfViewer.focus();
      }
    }, function rejected(reason) {
      console.error(reason);
      firstPagePromise.then(function () {
        self.setInitialView(scale);
        cb();
      });
    });

    var promises = [pagesPromise];
    Promise.all(promises).then(function() {

    });

//    if (self.preferenceSidebarViewOnLoad === SidebarView.THUMBS) {
//      Promise.all([firstPagePromise, onePageRendered]).then(function () {
//        self.switchSidebarView('thumbs', true);
//      });
//    }
  },

  setInitialView: function pdfViewSetInitialView(scale) {
    this.isInitialViewSet = true;
    if (scale) {
      this.setScale(scale, true);
      this.page = 1;
    }

    if (this.pdfViewer.currentScale === UNKNOWN_SCALE) {
      // Scale was not initialized: invalid bookmark or scale was not specified.
      // Setting the default one.
      this.setScale(DEFAULT_SCALE, true);
    }
  },

  cleanup: function() {
    this.pdfViewer.cleanup();
    //this.pdfThumbnailViewer.cleanup();
    this.pdfDocument.cleanup();
  },

  forceRendering: function pdfViewForceRendering() {
//    this.pdfRenderingQueue.printing = this.printing;
//    this.pdfRenderingQueue.isThumbnailViewEnabled = this.sidebarOpen;
    this.pdfRenderingQueue.renderHighestPriority();
  },

  setScale: function (value, resetAutoSettings) {
    this.updateScaleControls = !!resetAutoSettings;
    this.pdfViewer.currentScaleValue = value;
    this.updateScaleControls = true;
  }

//  rotatePages: function pdfViewRotatePages(delta) {
//    var pageNumber = this.page;
//
//    this.pageRotation = (this.pageRotation + 360 + delta) % 360;
//    this.pdfViewer.pagesRotation = this.pageRotation;
//    //this.pdfThumbnailViewer.pagesRotation = this.pageRotation;
//
//    this.forceRendering();
//
//    this.pdfViewer.scrollPageIntoView(pageNumber);
//  },
};

/**
 * @typedef {Object} PDFViewerOptions
 * @property {HTMLDivElement} container - The container for the viewer element.
 * @property {HTMLDivElement} viewer - (optional) The viewer element.
 * @property {IPDFLinkService} linkService - The navigation/linking service.
 * @property {PDFRenderingQueue} renderingQueue - (optional) The rendering
 *   queue object.
 */

/**
 * Simple viewer control to display PDF content/pages.
 * @class
 * @implements {ILastScrollSource}
 * @implements {IRenderableView}
 */
var PDFViewer = (function pdfViewer() {
  /**
   * @constructs PDFViewer
   * @param {PDFViewerOptions} options
   */
  function PDFViewer(options) {
  	this.viewManager = options.viewManager;
    this.container = options.container;
    this.viewer = options.viewer || options.container.firstElementChild;
    this.linkService = options.linkService;

    this.defaultRenderingQueue = !options.renderingQueue;
    if (this.defaultRenderingQueue) {
      // Custom rendering queue is not specified, using default one
      this.renderingQueue = new PDFRenderingQueue();
      this.renderingQueue.setViewer(this);
    } else {
      this.renderingQueue = options.renderingQueue;
    }

    this.scroll = watchScroll(this.container, this._scrollUpdate.bind(this));
    this.lastScroll = 0;
    this.updateInProgress = false;
    this.presentationModeState = PresentationModeState.UNKNOWN;
    this._resetView();
  }

  PDFViewer.prototype = /** @lends PDFViewer.prototype */{
    get pagesCount() {
      return this.pages.length;
    },

    getPageView: function (index) {
      return this.pages[index];
    },

    get currentPageNumber() {
      return this._currentPageNumber;
    },

    set currentPageNumber(val) {
      if (!this.pdfDocument) {
        this._currentPageNumber = val;
        return;
      }

      if (!(0 < val && val <= this.pagesCount))
        return;

      this.pages[val - 1].updateStats();
      this._currentPageNumber = val;
    },

    /**
     * @returns {number}
     */
     get currentScale() {
      return this._currentScale;
    },

    /**
     * @param {number} val - Scale of the pages in percents.
     */
    set currentScale(val) {
      if (isNaN(val))  {
        throw new Error('Invalid numeric scale');
      }
      if (!this.pdfDocument) {
        this._currentScale = val;
        this._currentScaleValue = val.toString();
        return;
      }
      this._setScale(val, false);
    },

    /**
     * @returns {string}
     */
    get currentScaleValue() {
      return this._currentScaleValue;
    },

    /**
     * @param val - The scale of the pages (in percent or predefined value).
     */
    set currentScaleValue(val) {
      if (!this.pdfDocument) {
        this._currentScale = isNaN(val) ? UNKNOWN_SCALE : val;
        this._currentScaleValue = val;
        return;
      }
      this._setScale(val, false);
    },

//    /**
//     * @returns {number}
//     */
//   get pagesRotation() {
//      return this._pagesRotation;
//    },
//
//    /**
//     * @param {number} rotation - The rotation of the pages (0, 90, 180, 270).
//     */
//    set pagesRotation(rotation) {
//      this._pagesRotation = rotation;
//
//      for (var i = 0, l = this.pages.length; i < l; i++) {
//        var page = this.pages[i];
//        page.update(page.scale, rotation);
//      }
//
//      this._setScale(this._currentScaleValue, true);
//    },

    /**
     * @param pdfDocument {PDFDocument}
     */
    setDocument: function (pdfDocument) {
      if (this.pdfDocument) {
        this._resetView();
      }

      this.pdfDocument = pdfDocument;
      if (!pdfDocument) {
        return;
      }

      var pagesCount = pdfDocument.numPages;
      var pagesRefMap = this.pagesRefMap = {};
      var self = this;

      var resolvePagesPromise;
      var pagesPromise = new Promise(function (resolve) {
        resolvePagesPromise = resolve;
      });
      this.pagesPromise = pagesPromise;

      var isOnePageRenderedResolved = false;
      var resolveOnePageRendered = null;
      var onePageRendered = new Promise(function (resolve) {
        resolveOnePageRendered = resolve;
      });
      this.onePageRendered = onePageRendered;

      var bindOnAfterDraw = function (pageView) {
        // when page is painted, using the image as thumbnail base
        pageView.onAfterDraw = function pdfViewLoadOnAfterDraw() {
          if (!isOnePageRenderedResolved) {
            isOnePageRenderedResolved = true;
            resolveOnePageRendered();
          }
        };
      };

      var firstPagePromise = pdfDocument.getPage(1);
      this.firstPagePromise = firstPagePromise;

      // Fetch a single page so we can get a viewport that will be the default
      // viewport for all pages
      return firstPagePromise.then(function(pdfPage) {
        var scale = this._currentScale || 1.0;
        var viewport = pdfPage.getViewport(scale * CSS_UNITS);
        for (var pageNum = 1; pageNum <= pagesCount; ++pageNum) {
          var pageSource = new PDFPageSource(pdfDocument, pageNum);
          var pageView = new PageView(this.viewer, pageNum, scale,
                                      viewport.clone(), this.linkService,
                                      this.renderingQueue, this.cache,
                                      pageSource, this);
          bindOnAfterDraw(pageView);
          this.pages.push(pageView);
        }

        // Fetch all the pages since the viewport is needed before printing
        // starts to create the correct size canvas. Wait until one page is
        // rendered so we don't tie up too many resources early on.
        onePageRendered.then(function () {
          if (!PDFJS.disableAutoFetch) {
            var getPagesLeft = pagesCount;
            for (var pageNum = 1; pageNum <= pagesCount; ++pageNum) {
              pdfDocument.getPage(pageNum).then(function (pageNum, pdfPage) {
                var pageView = self.pages[pageNum - 1];
                if (!pageView.pdfPage) {
                  pageView.setPdfPage(pdfPage);
                }
                var refStr = pdfPage.ref.num + ' ' + pdfPage.ref.gen + ' R';
                pagesRefMap[refStr] = pageNum;
                getPagesLeft--;
                if (!getPagesLeft) {
                  resolvePagesPromise();
                }
              }.bind(null, pageNum));
            }
          } else {
            // XXX: Printing is semi-broken with auto fetch disabled.
            resolvePagesPromise();
          }
        });

        if (this.defaultRenderingQueue) {
          this.update();
        }
      }.bind(this));
    },

    _resetView: function () {
      this.cache = new Cache(DEFAULT_CACHE_SIZE);
      this.pages = [];
      this._currentPageNumber = 1;
      this._currentScale = UNKNOWN_SCALE;
      this._currentScaleValue = null;
      this.location = null;
     // this._pagesRotation = 0;

      var container = this.viewer;
      while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
      }
    },

    _scrollUpdate: function () {
      this.lastScroll = Date.now();

      if (this.pagesCount === 0) {
        return;
      }
      this.update();
    },

    _setScaleUpdatePages: function pdfViewer_setScaleUpdatePages(
        newScale, newValue, noScroll, preset) {
      this._currentScaleValue = newValue;
      if (newScale === this._currentScale) {
        return;
      }
      for (var i = 0, ii = this.pages.length; i < ii; i++) {
        this.pages[i].update(newScale);
      }
      this._currentScale = newScale;
	  
      if (!noScroll) {
        var page = this._currentPageNumber, dest;
        if(page == 1)
        	this.update();
        else{
	        var inPresentationMode =
	          this.presentationModeState === PresentationModeState.CHANGING ||
	          this.presentationModeState === PresentationModeState.FULLSCREEN;
	        if (this.location && !inPresentationMode &&
	            !IGNORE_CURRENT_POSITION_ON_ZOOM) {
	          page = this.location.pageNumber;
	          dest = [null, { name: 'XYZ' }, this.location.left,
	            this.location.top, null];
	        }
	        this.scrollPageIntoView(page, dest);
        }
      }
      
      if(PDFViewerApplication.updateScaleControls)
      	this.viewManager.notifyScaleChanged(newScale);
    },

    _setScale: function pdfViewer_setScale(value, noScroll) {
      if (value === 'custom') {
        return;
      }
      var scale = parseFloat(value);

      if (scale > 0) {
        this._setScaleUpdatePages(scale, value, noScroll, false);
      } 
      else {
        var currentPage = this.pages[this._currentPageNumber - 1];
        if (!currentPage) {
          return;
        }
        var inPresentationMode =
          this.presentationModeState === PresentationModeState.FULLSCREEN;
        var hPadding = inPresentationMode ? 0 : SCROLLBAR_PADDING;
        var vPadding = inPresentationMode ? 0 : VERTICAL_PADDING;
        var pageWidthScale = (this.container.clientWidth - hPadding) /
                             currentPage.width * currentPage.scale;
        var pageHeightScale = (this.container.clientHeight - vPadding) /
                              currentPage.height * currentPage.scale;
        switch (value) {
          case 'page-actual':
            scale = 1;
            break;
          case 'page-width':
            scale = pageWidthScale;
            break;
          case 'page-height':
            scale = pageHeightScale;
            break;
          case 'page-fit':
            scale = Math.min(pageWidthScale, pageHeightScale);
            break;
          case 'auto':
            var isLandscape = (currentPage.width > currentPage.height);
            // For pages in landscape mode, fit the page height to the viewer
            // *unless* the page would thus become too wide to fit horizontally.
            var horizontalScale = isLandscape ?
              Math.min(pageHeightScale, pageWidthScale) : pageWidthScale;
            scale = Math.min(MAX_AUTO_SCALE, horizontalScale);
            break;
          default:
            console.error('pdfViewSetScale: \'' + value +
              '\' is an unknown zoom value.');
            return;
        }
        this._setScaleUpdatePages(scale, value, noScroll, true);
      }
    },

    /**
     * Scrolls page into view.
     * @param {number} pageNumber
     * @param {Array} dest - (optional) original PDF destination array:
     *   <page-ref> </XYZ|FitXXX> <args..>
     */
    scrollPageIntoView: function PDFViewer_scrollPageIntoView(pageNumber,
                                                              dest) {
      var pageView = this.pages[pageNumber - 1];
      var pageViewDiv = pageView.el;

      if (this.presentationModeState ===
        PresentationModeState.FULLSCREEN) {
        if (this.linkService.page !== pageView.id) {
          // Avoid breaking getVisiblePages in presentation mode.
          this.linkService.page = pageView.id;
          return;
        }
        dest = null;
        // Fixes the case when PDF has different page sizes.
        this._setScale(this.currentScaleValue, true);
      }
      if (!dest) {
        scrollIntoView(pageViewDiv);
        return;
      }

      var x = 0, y = 0;
      var width = 0, height = 0, widthScale, heightScale;
      var changeOrientation = (pageView.rotation % 180 === 0 ? false : true);
      var pageWidth = (changeOrientation ? pageView.height : pageView.width) /
        pageView.scale / CSS_UNITS;
      var pageHeight = (changeOrientation ? pageView.width : pageView.height) /
        pageView.scale / CSS_UNITS;
      var scale = 0;
      switch (dest[1].name) {
        case 'XYZ':
          x = dest[2];
          y = dest[3];
          scale = dest[4];
          // If x and/or y coordinates are not supplied, default to
          // _top_ left of the page (not the obvious bottom left,
          // since aligning the bottom of the intended page with the
          // top of the window is rarely helpful).
          x = x !== null ? x : 0;
          y = y !== null ? y : pageHeight;
          break;
        case 'Fit':
        case 'FitB':
          scale = 'page-fit';
          break;
        case 'FitH':
        case 'FitBH':
          y = dest[2];
          scale = 'page-width';
          break;
        case 'FitV':
        case 'FitBV':
          x = dest[2];
          width = pageWidth;
          height = pageHeight;
          scale = 'page-height';
          break;
        case 'FitR':
          x = dest[2];
          y = dest[3];
          width = dest[4] - x;
          height = dest[5] - y;
          var viewerContainer = this.container;
          widthScale = (viewerContainer.clientWidth - SCROLLBAR_PADDING) /
            width / CSS_UNITS;
          heightScale = (viewerContainer.clientHeight - SCROLLBAR_PADDING) /
            height / CSS_UNITS;
          scale = Math.min(Math.abs(widthScale), Math.abs(heightScale));
          break;
        default:
          return;
      }

      if (scale && scale !== this.currentScale) {
        this.currentScaleValue = scale;
      } else if (this.currentScale === UNKNOWN_SCALE) {
        this.currentScaleValue = DEFAULT_SCALE;
      }

      if (scale === 'page-fit' && !dest[4]) {
        scrollIntoView(pageViewDiv);
        return;
      }

      var boundingRect = [
        pageView.viewport.convertToViewportPoint(x, y),
        pageView.viewport.convertToViewportPoint(x + width, y + height)
      ];
      var left = Math.min(boundingRect[0][0], boundingRect[1][0]);
      var top = Math.min(boundingRect[0][1], boundingRect[1][1]);

      scrollIntoView(pageViewDiv, { left: left, top: top });
    },

    _updateLocation: function (firstPage) {
      var currentScale = this._currentScale;
      var currentScaleValue = this._currentScaleValue;
      var normalizedScaleValue =
        parseFloat(currentScaleValue) === currentScale ?
        Math.round(currentScale * 10000) / 100 : currentScaleValue;

      var pageNumber = firstPage.id;
      var pdfOpenParams = '#page=' + pageNumber;
      pdfOpenParams += '&zoom=' + normalizedScaleValue;
      var currentPageView = this.pages[pageNumber - 1];
      var container = this.container;
      var topLeft = currentPageView.getPagePoint(
        (container.scrollLeft - firstPage.x),
        (container.scrollTop - firstPage.y));
      var intLeft = Math.round(topLeft[0]);
      var intTop = Math.round(topLeft[1]);
      pdfOpenParams += ',' + intLeft + ',' + intTop;

      this.location = {
        pageNumber: pageNumber,
        scale: normalizedScaleValue,
        top: intTop,
        left: intLeft,
        pdfOpenParams: pdfOpenParams
      };
    },

    update: function () {
      var visible = this._getVisiblePages();
      var visiblePages = visible.views;
      if (visiblePages.length === 0) {
        return;
      }

      this.updateInProgress = true;

      var suggestedCacheSize = Math.max(DEFAULT_CACHE_SIZE,
          2 * visiblePages.length + 1);
      this.cache.resize(suggestedCacheSize);

      this.renderingQueue.renderHighestPriority(visible);

      var currentId = this.currentPageNumber;
      var firstPage = visible.first;

      for (var i = 0, ii = visiblePages.length, stillFullyVisible = false;
           i < ii; ++i) {
        var page = visiblePages[i];

        if (page.percent < 100) {
          break;
        }
        if (page.id === currentId) {
          stillFullyVisible = true;
          break;
        }
      }

      if (!stillFullyVisible) {
        currentId = visiblePages[0].id;
      }

      if (this.presentationModeState !== PresentationModeState.FULLSCREEN) {
      	if(this.currentPageNumber != currentId){
        	this.currentPageNumber = currentId;
        	pe.scene.currentPage = currentId;
        	pe.scene.pagePicker.currentPage = currentId;
        	var pager = dijit.byId("T_PageIndicator");
        	if(pager) 
        		pager.updateCurrentPage(currentId);
      	}
      }

      this._updateLocation(firstPage);

      this.updateInProgress = false;
    },

    focus: function () {
      this.container.focus();
    },

    blur: function () {
      this.container.blur();
    },

    _getVisiblePages: function () {
      if (this.presentationModeState !== PresentationModeState.FULLSCREEN) {
        return getVisibleElements(this.container, this.pages, true);
      } else {
        // The algorithm in getVisibleElements doesn't work in all browsers and
        // configurations when presentation mode is active.
        var visible = [];
        var currentPage = this.pages[this._currentPageNumber - 1];
        visible.push({ id: currentPage.id, view: currentPage });
        return { first: currentPage, last: currentPage, views: visible };
      }
    },

    cleanup: function () {
      for (var i = 0, ii = this.pages.length; i < ii; i++) {
        if (this.pages[i] &&
          this.pages[i].renderingState !== RenderingStates.FINISHED) {
          this.pages[i].reset();
        }
      }
    },

    forceRendering: function (currentlyVisiblePages) {
      var visiblePages = currentlyVisiblePages || this._getVisiblePages();
      var pageView = this.renderingQueue.getHighestPriority(visiblePages,
                                                            this.pages,
                                                            this.scroll.down);
      if (pageView) {
        this.renderingQueue.renderView(pageView);
        return true;
      }
      return false;
    },

    getPageTextContent: function (pageIndex) {
      return this.pdfDocument.getPage(pageIndex + 1).then(function (page) {
        return page.getTextContent();
      });
    },

    /**
     * @param textLayerDiv {HTMLDivElement}
     * @param pageIndex {number}
     * @param viewport {PageViewport}
     * @returns {TextLayerBuilder}
     */
    createTextLayerBuilder: function (textLayerDiv, pageIndex, viewport) {
      var isViewerInPresentationMode =
        this.presentationModeState === PresentationModeState.FULLSCREEN;
      return new TextLayerBuilder({
        textLayerDiv: textLayerDiv,
        pageIndex: pageIndex,
        viewport: viewport,
        lastScrollSource: this,
        isViewerInPresentationMode: isViewerInPresentationMode,
        findController: this.findController
      });
    }

//    setFindController: function (findController) {
//      this.findController = findController;
//    }
  };

  return PDFViewer;
})();


/**
 * @constructor
 * @param {HTMLDivElement} container - The viewer element.
 * @param {number} id - The page unique ID (normally its number).
 * @param {number} scale - The page scale display.
 * @param {PageViewport} defaultViewport - The page viewport.
 * @param {IPDFLinkService} linkService - The navigation/linking service.
 * @param {PDFRenderingQueue} renderingQueue - The rendering queue object.
 * @param {Cache} cache - The page cache.
 * @param {PDFPageSource} pageSource
 * @param {PDFViewer} viewer
 *
 * @implements {IRenderableView}
 */
var PageView = function pageView(container, id, scale, defaultViewport,
                                 linkService, renderingQueue, cache,
                                 pageSource, viewer) {
  this.id = id;
  this.renderingId = 'page' + id;

  this.rotation = 0;
  this.scale = scale || 1.0;
  this.viewport = defaultViewport;
  this.pdfPageRotate = defaultViewport.rotation;
  this.hasRestrictedScaling = false;

  this.linkService = linkService;
  this.renderingQueue = renderingQueue;
  this.cache = cache;
  this.pageSource = pageSource;
  this.viewer = viewer;

  this.renderingState = RenderingStates.INITIAL;
  this.resume = null;

  this.textLayer = null;

  this.zoomLayer = null;

  this.annotationLayer = null;

  var anchor = document.createElement('a');
  anchor.name = '' + this.id;

  var div = this.el = document.createElement('div');
  div.id = 'pageContainer' + this.id;
  div.className = 'page';
  div.style.width = Math.floor(this.viewport.width) + 'px';
  div.style.height = Math.floor(this.viewport.height) + 'px';

  container.appendChild(anchor);
  container.appendChild(div);

  this.setPdfPage = function pageViewSetPdfPage(pdfPage) {
    this.pdfPage = pdfPage;
    this.pdfPageRotate = pdfPage.rotate;
    var totalRotation = (this.rotation + this.pdfPageRotate) % 360;
    this.viewport = pdfPage.getViewport(this.scale * CSS_UNITS, totalRotation);
    this.stats = pdfPage.stats;
    this.reset();
  };

  this.destroy = function pageViewDestroy() {
    this.zoomLayer = null;
    this.reset();
    if (this.pdfPage) {
      this.pdfPage.destroy();
    }
  };

  this.reset = function pageViewReset(keepAnnotations) {
    if (this.renderTask) {
      this.renderTask.cancel();
    }
    this.resume = null;
    this.renderingState = RenderingStates.INITIAL;

    div.style.width = Math.floor(this.viewport.width) + 'px';
    div.style.height = Math.floor(this.viewport.height) + 'px';

    var childNodes = div.childNodes;
    for (var i = div.childNodes.length - 1; i >= 0; i--) {
      var node = childNodes[i];
      if ((this.zoomLayer && this.zoomLayer === node) ||
          (keepAnnotations && this.annotationLayer === node)) {
        continue;
      }
      div.removeChild(node);
    }
    div.removeAttribute('data-loaded');

//    if (keepAnnotations) {
//      if (this.annotationLayer) {
//        // Hide annotationLayer until all elements are resized
//        // so they are not displayed on the already-resized page
//        this.annotationLayer.setAttribute('hidden', 'true');
//      }
//    } else {
//      this.annotationLayer = null;
//    }

    if (this.canvas) {
      // Zeroing the width and height causes Firefox to release graphics
      // resources immediately, which can greatly reduce memory consumption.
      this.canvas.width = 0;
      this.canvas.height = 0;
      delete this.canvas;
    }

//    this.loadingIconDiv = document.createElement('div');
//    this.loadingIconDiv.className = 'loadingIcon';
//    div.appendChild(this.loadingIconDiv);
  };

  this.update = function pageViewUpdate(scale, rotation) {
    this.scale = scale || this.scale;

    if (typeof rotation !== 'undefined') {
      this.rotation = rotation;
    }

    var totalRotation = (this.rotation + this.pdfPageRotate) % 360;
    this.viewport = this.viewport.clone({
      scale: this.scale * CSS_UNITS,
      rotation: totalRotation
    });

    var isScalingRestricted = false;
    if (this.canvas && PDFJS.maxCanvasPixels > 0) {
      var ctx = this.canvas.getContext('2d');
      var outputScale = getOutputScale(ctx);
      var pixelsInViewport = this.viewport.width * this.viewport.height;
      var maxScale = Math.sqrt(PDFJS.maxCanvasPixels / pixelsInViewport);
      if (((Math.floor(this.viewport.width) * outputScale.sx) | 0) *
          ((Math.floor(this.viewport.height) * outputScale.sy) | 0) >
          PDFJS.maxCanvasPixels) {
        isScalingRestricted = true;
      }
    }

//    if (this.canvas &&
//        (PDFJS.useOnlyCssZoom ||
//          (this.hasRestrictedScaling && isScalingRestricted))) {
//      this.cssTransform(this.canvas, true);
//      return;
//    } else if (this.canvas && !this.zoomLayer) {
//      this.zoomLayer = this.canvas.parentNode;
//      this.zoomLayer.style.position = 'absolute';
//    }
//    if (this.zoomLayer) {
//      this.cssTransform(this.zoomLayer.firstChild);
//    }
    this.reset(true);
  };


  Object.defineProperty(this, 'width', {
    get: function PageView_getWidth() {
      return this.viewport.width;
    },
    enumerable: true
  });

  Object.defineProperty(this, 'height', {
    get: function PageView_getHeight() {
      return this.viewport.height;
    },
    enumerable: true
  });

  var self = this;
 
  this.getPagePoint = function pageViewGetPagePoint(x, y) {
    return this.viewport.convertToPdfPoint(x, y);
  };

  this.draw = function pageviewDraw(callback) {
    var pdfPage = this.pdfPage;

    if (this.pagePdfPromise) {
      return;
    }
    if (!pdfPage) {
      var promise = this.pageSource.getPage();
      promise.then(function(pdfPage) {
        delete this.pagePdfPromise;
        this.setPdfPage(pdfPage);
        this.draw(callback);
      }.bind(this));
      this.pagePdfPromise = promise;
      return;
    }

    if (this.renderingState !== RenderingStates.INITIAL) {
      console.error('Must be in new state before drawing');
    }

    this.renderingState = RenderingStates.RUNNING;

    var viewport = this.viewport;
    // Wrap the canvas so if it has a css transform for highdpi the overflow
    // will be hidden in FF.
    var canvasWrapper = document.createElement('div');
    canvasWrapper.style.width = div.style.width;
    canvasWrapper.style.height = div.style.height;
    canvasWrapper.classList.add('canvasWrapper');

    var canvas = document.createElement('canvas');
    canvas.id = 'page' + this.id;
    canvasWrapper.appendChild(canvas);
//    if (this.annotationLayer) {
//      // annotationLayer needs to stay on top
//      div.insertBefore(canvasWrapper, this.annotationLayer);
//    } else
    {
      div.appendChild(canvasWrapper);
    }
    this.canvas = canvas;

    var ctx = canvas.getContext('2d');
    var outputScale = getOutputScale(ctx);

    if (PDFJS.useOnlyCssZoom) {
      var actualSizeViewport = viewport.clone({ scale: CSS_UNITS });
      // Use a scale that will make the canvas be the original intended size
      // of the page.
      outputScale.sx *= actualSizeViewport.width / viewport.width;
      outputScale.sy *= actualSizeViewport.height / viewport.height;
      outputScale.scaled = true;
    }

    if (PDFJS.maxCanvasPixels > 0) {
      var pixelsInViewport = viewport.width * viewport.height;
      var maxScale = Math.sqrt(PDFJS.maxCanvasPixels / pixelsInViewport);
      if (outputScale.sx > maxScale || outputScale.sy > maxScale) {
        outputScale.sx = maxScale;
        outputScale.sy = maxScale;
        outputScale.scaled = true;
        this.hasRestrictedScaling = true;
      } else {
        this.hasRestrictedScaling = false;
      }
    }

    canvas.width = (Math.floor(viewport.width) * outputScale.sx) | 0;
    canvas.height = (Math.floor(viewport.height) * outputScale.sy) | 0;
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';
    // Add the viewport so it's known what it was originally drawn with.
    canvas._viewport = viewport;
    var textLayerDiv = null;
    var textLayer = null;
    
    if (!PDFJS.disableTextLayer) {
      textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      textLayerDiv.style.width = canvas.style.width;
      textLayerDiv.style.height = canvas.style.height;
//      if (this.annotationLayer) {
//        // annotationLayer needs to stay on top
//        div.insertBefore(textLayerDiv, this.annotationLayer);
//      } else 
      	{
        div.appendChild(textLayerDiv);
      }

      textLayer = this.viewer.createTextLayerBuilder(textLayerDiv, this.id - 1,
                                                     this.viewport);
    }
    this.textLayer = textLayer;

    // Rendering area

    var self = this;
    function pageViewDrawCallback(error) {
      // The renderTask may have been replaced by a new one, so only remove the
      // reference to the renderTask if it matches the one that is triggering
      // this callback.
      if (renderTask === self.renderTask) {
        self.renderTask = null;
      }

      if (error === 'cancelled') {
        return;
      }

      self.renderingState = RenderingStates.FINISHED;

      if (self.zoomLayer) {
        div.removeChild(self.zoomLayer);
        self.zoomLayer = null;
      }

      self.error = error;
      self.stats = pdfPage.stats;
      self.updateStats();
      if (self.onAfterDraw) {
        self.onAfterDraw();
      }
      callback();
    }

    var transform = !outputScale.scaled ? null :
        [outputScale.sx, 0, 0, outputScale.sy, 0, 0];
    var renderContext = {
      canvasContext: ctx,
      transform: transform,
      viewport: this.viewport,
      // intent: 'default', // === 'display'
      continueCallback: function pdfViewcContinueCallback(cont) {
        if (!self.renderingQueue.isHighestPriority(self)) {
          self.renderingState = RenderingStates.PAUSED;
          self.resume = function resumeCallback() {
            self.renderingState = RenderingStates.RUNNING;
            cont();
          };
          return;
        }
        cont();
      }
    };
    var renderTask = this.renderTask = this.pdfPage.render(renderContext);

    this.renderTask.promise.then(
      function pdfPageRenderCallback() {
        pageViewDrawCallback(null);
        if (textLayer) {
          self.pdfPage.getTextContent().then(
            function textContentResolved(textContent) {
              textLayer.setTextContent(textContent);
            }
          );
        }
      },
      function pdfPageRenderError(error) {
        pageViewDrawCallback(error);
      }
    );
    
    if (textLayerDiv) {
      setupAnnotations(pdfPage, viewport, canvas);
    }
    div.setAttribute('data-loaded', true);

    // Add the page to the cache at the start of drawing. That way it can be
    // evicted from the cache and destroyed even if we pause its rendering.
    cache.push(this);
    
    function setupAnnotations(page, viewport, canvas) {
      self.pdfPage.getAnnotations().then(function (annotationsData) {
        for (var i = 0; i < annotationsData.length; i++) {
          var data = annotationsData[i];
          var annotation = null;
          var params = {
            data: data,
            layer: textLayerDiv,
            page: page,
            viewport: viewport
          };
          // Only support LinkAnnotation so far
          if (data.annotationType == AnnotationType.LINK) {
        	  // Ignore the link without url, that means the link is for local file, and pdfjs can not handle this
        	  if (data.url !== undefined) {
                annotation = new LinkAnnotationElement(params, true);
        	  }
          }
          if (annotation && annotation.isRenderable) {
            textLayerDiv.appendChild(annotation.render());
          }
        }
      });
    }
    
  };

  this.updateStats = function pageViewUpdateStats() {
    if (!this.stats) {
      return;
    }

    if (PDFJS.pdfBug && Stats.enabled) {
      var stats = this.stats;
      Stats.add(this.id, stats);
    }
  };
};

var AnnotationType = {
  TEXT: 1,
  LINK: 2,
  FREETEXT: 3,
  LINE: 4,
  SQUARE: 5,
  CIRCLE: 6,
  POLYGON: 7,
  POLYLINE: 8,
  HIGHLIGHT: 9,
  UNDERLINE: 10,
  SQUIGGLY: 11,
  STRIKEOUT: 12,
  STAMP: 13,
  CARET: 14,
  INK: 15,
  POPUP: 16,
  FILEATTACHMENT: 17,
  SOUND: 18,
  MOVIE: 19,
  WIDGET: 20,
  SCREEN: 21,
  PRINTERMARK: 22,
  TRAPNET: 23,
  WATERMARK: 24,
  THREED: 25,
  REDACT: 26
};

var AnnotationBorderStyleType = {
  SOLID: 1,
  DASHED: 2,
  BEVELED: 3,
  INSET: 4,
  UNDERLINE: 5
};

var LinkAnnotationElement = (function LinkAnnotationElementClosure() {
  function LinkAnnotationElement(parameters, isRenderable) {
    this.isRenderable = isRenderable || false;
    this.data = parameters.data;
    this.layer = parameters.layer;
    this.page = parameters.page;
    this.viewport = parameters.viewport;

    if (isRenderable) {
      this.container = this._createContainer();
    }
  }
  
  LinkAnnotationElement.prototype = {
    /**
     * Create an empty container for the annotation's HTML element.
     *
     * @private
     * @memberof LinkAnnotationElement
     * @returns {HTMLSectionElement}
     */
    _createContainer: function LinkAnnotationElement_createContainer() {
      var container = document.createElement('section');
      container.setAttribute('data-annotation-id', this.data.id);
      return container;
    },

    /**
     * Render the annotation's HTML element in the empty container.
     *
     * @public
     * @memberof LinkAnnotationElement
     */
    render: function LinkAnnotationElement_render() {
    	var data = this.data, page = this.page, viewport = this.viewport, container = this.container;
    	container.className = 'linkAnnotation';

        var link = document.createElement('a');
        PDFJS.addLinkAttributes(link, {
          url: data.url,
          target: 2,
        });
        
        var width = (data.rect[2] - data.rect[0]) * viewport.scale;
        var height = (data.rect[3] - data.rect[1]) * viewport.scale;

        var rect = PDFJS.Util.normalizeRect([
          data.rect[0],
          page.view[3] - data.rect[1] + page.view[1],
          data.rect[2],
          page.view[3] - data.rect[3] + page.view[1]
        ]);

        if (data.borderStyle.width > 0) {
          link.style.borderWidth = (data.borderStyle.width * viewport.scale) + 'px';
          if (data.borderStyle.style !== AnnotationBorderStyleType.UNDERLINE) {
            // Underline styles only have a bottom border, so we do not need
            // to adjust for all borders. This yields a similar result as
            // Adobe Acrobat/Reader.
            width = width - 2 * data.borderStyle.width * viewport.scale;
            height = height - 2 * data.borderStyle.width * viewport.scale;
          }

          var horizontalRadius = data.borderStyle.horizontalCornerRadius * viewport.scale;
          var verticalRadius = data.borderStyle.verticalCornerRadius * viewport.scale;
          if (horizontalRadius > 0 || verticalRadius > 0) {
            var radius = horizontalRadius + 'px / ' + verticalRadius + 'px';
            CustomStyle.setProp('borderRadius', link, radius);
          }

          switch (data.borderStyle.style) {
            case AnnotationBorderStyleType.SOLID:
              link.style.borderStyle = 'solid';
              break;

            case AnnotationBorderStyleType.DASHED:
              link.style.borderStyle = 'dashed';
              break;

            case AnnotationBorderStyleType.BEVELED:
              warn('Unimplemented border style: beveled');
              break;

            case AnnotationBorderStyleType.INSET:
              warn('Unimplemented border style: inset');
              break;

            case AnnotationBorderStyleType.UNDERLINE:
              link.style.borderBottomStyle = 'solid';
              break;

            default:
              break;
          }

          if (data.color) {
        	link.style.borderColor =
              PDFJS.Util.makeCssRgb(data.color[0] | 0,
                data.color[1] | 0,
                data.color[2] | 0);
          } else {
            // Transparent (invisible) border, so do not draw it at all.
        	link.style.borderWidth = 0;
          }
        }
        
        link.style.position = 'absolute';
        link.style.left = (rect[0] * viewport.scale) + 'px';
        link.style.top = (rect[1] * viewport.scale) + 'px';
        link.style.width = width + 'px';
        link.style.height = height + 'px';
        
        container.appendChild(link);
        return container;
    }
  };

  return LinkAnnotationElement;
})();

/**
 * @typedef {Object} TextLayerBuilderOptions
 * @property {HTMLDivElement} textLayerDiv - The text layer container.
 * @property {number} pageIndex - The page index.
 * @property {PageViewport} viewport - The viewport of the text layer.
 * @property {ILastScrollSource} lastScrollSource - The object that records when
 *   last time scroll happened.
 * @property {boolean} isViewerInPresentationMode
 * @property {PDFFindController} findController
 */

/**
 * TextLayerBuilder provides text-selection functionality for the PDF.
 * It does this by creating overlay divs over the PDF text. These divs
 * contain text that matches the PDF text they are overlaying. This object
 * also provides a way to highlight text that is being searched for.
 * @class
 */
var TextLayerBuilder = (function TextLayerBuilderClosure() {
  function TextLayerBuilder(options) {
    this.textLayerDiv = options.textLayerDiv;
    this.layoutDone = false;
    this.divContentDone = false;
    this.pageIdx = options.pageIndex;
    this.matches = [];
    this.lastScrollSource = options.lastScrollSource || null;
    this.viewport = options.viewport;
    this.isViewerInPresentationMode = options.isViewerInPresentationMode;
    this.textDivs = [];
  }

  TextLayerBuilder.prototype = {
    renderLayer: function TextLayerBuilder_renderLayer() {
      var textLayerFrag = document.createDocumentFragment();
      var textDivs = this.textDivs;
      var textDivsLength = textDivs.length;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      // No point in rendering many divs as it would make the browser
      // unusable even after the divs are rendered.
      if (textDivsLength > MAX_TEXT_DIVS_TO_RENDER) {
        return;
      }

      var lastFontSize;
      var lastFontFamily;
      for (var i = 0; i < textDivsLength; i++) {
        var textDiv = textDivs[i];
        if (textDiv.dataset.isWhitespace !== undefined) {
          continue;
        }

        var fontSize = textDiv.style.fontSize;
        var fontFamily = textDiv.style.fontFamily;

        // Only build font string and set to context if different from last.
        if (fontSize !== lastFontSize || fontFamily !== lastFontFamily) {
          ctx.font = fontSize + ' ' + fontFamily;
          lastFontSize = fontSize;
          lastFontFamily = fontFamily;
        }

        var width = ctx.measureText(textDiv.textContent).width;
        if (width > 0) {
          textLayerFrag.appendChild(textDiv);
          var transform;
          if (textDiv.dataset.canvasWidth !== undefined) {
            // Dataset values come of type string.
            var textScale = textDiv.dataset.canvasWidth / width;
            transform = 'scaleX(' + textScale + ')';
          } else {
            transform = '';
          }
          var rotation = textDiv.dataset.angle;
          if (rotation) {
            transform = 'rotate(' + rotation + 'deg) ' + transform;
          }
          if (transform) {
            CustomStyle.setProp('transform' , textDiv, transform);
          }
        }
      }

      this.textLayerDiv.appendChild(textLayerFrag);
      this.renderingDone = true;
      this.updateMatches();
    },

    setupRenderLayoutTimer:
        function TextLayerBuilder_setupRenderLayoutTimer() {
      // Schedule renderLayout() if the user has been scrolling,
      // otherwise run it right away.
      var self = this;
      var lastScroll = (this.lastScrollSource === null ?
                        0 : this.lastScrollSource.lastScroll);

      if (Date.now() - lastScroll > RENDER_DELAY) { // Render right away
        this.renderLayer();
      } else { // Schedule
        if (this.renderTimer) {
          clearTimeout(this.renderTimer);
        }
        this.renderTimer = setTimeout(function() {
          self.setupRenderLayoutTimer();
        }, RENDER_DELAY);
      }
    },

    appendText: function TextLayerBuilder_appendText(geom, styles) {
      var style = styles[geom.fontName];
      var textDiv = document.createElement('div');
      this.textDivs.push(textDiv);
      if (isAllWhitespace(geom.str)) {
        textDiv.dataset.isWhitespace = true;
        return;
      }
      var tx = PDFJS.Util.transform(this.viewport.transform, geom.transform);
      var angle = Math.atan2(tx[1], tx[0]);
      if (style.vertical) {
        angle += Math.PI / 2;
      }
      var fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
      var fontAscent = fontHeight;
      if (style.ascent) {
        fontAscent = style.ascent * fontAscent;
      } else if (style.descent) {
        fontAscent = (1 + style.descent) * fontAscent;
      }

      var left;
      var top;
      if (angle === 0) {
        left = tx[4];
        top = tx[5] - fontAscent;
      } else {
        left = tx[4] + (fontAscent * Math.sin(angle));
        top = tx[5] - (fontAscent * Math.cos(angle));
      }
      textDiv.style.left = left + 'px';
      textDiv.style.top = top + 'px';
      textDiv.style.fontSize = fontHeight + 'px';
      textDiv.style.fontFamily = style.fontFamily;
      textDiv.style.zIndex = '-1';

      textDiv.textContent = geom.str;
      // |fontName| is only used by the Font Inspector. This test will succeed
      // when e.g. the Font Inspector is off but the Stepper is on, but it's
      // not worth the effort to do a more accurate test.
      if (PDFJS.pdfBug) {
        textDiv.dataset.fontName = geom.fontName;
      }
      // Storing into dataset will convert number into string.
      if (angle !== 0) {
        textDiv.dataset.angle = angle * (180 / Math.PI);
      }
      // We don't bother scaling single-char text divs, because it has very
      // little effect on text highlighting. This makes scrolling on docs with
      // lots of such divs a lot faster.
      if (textDiv.textContent.length > 1) {
        if (style.vertical) {
          textDiv.dataset.canvasWidth = geom.height * this.viewport.scale;
        } else {
          textDiv.dataset.canvasWidth = geom.width * this.viewport.scale;
        }
      }
    },

    setTextContent: function TextLayerBuilder_setTextContent(textContent) {
      this.textContent = textContent;

      var textItems = textContent.items;
      for (var i = 0, len = textItems.length; i < len; i++) {
        this.appendText(textItems[i], textContent.styles);
      }
      this.divContentDone = true;
      this.setupRenderLayoutTimer();
    },

    convertMatches: function TextLayerBuilder_convertMatches(matches) {
      var i = 0;
      var iIndex = 0;
      var bidiTexts = this.textContent.items;
      var end = bidiTexts.length - 1;
      var queryLen = (this.findController === null ?
                      0 : this.findController.state.query.length);
      var ret = [];

      for (var m = 0, len = matches.length; m < len; m++) {
        // Calculate the start position.
        var matchIdx = matches[m];

        // Loop over the divIdxs.
        while (i !== end && matchIdx >= (iIndex + bidiTexts[i].str.length)) {
          iIndex += bidiTexts[i].str.length;
          i++;
        }

        if (i === bidiTexts.length) {
          console.error('Could not find a matching mapping');
        }

        var match = {
          begin: {
            divIdx: i,
            offset: matchIdx - iIndex
          }
        };

        // Calculate the end position.
        matchIdx += queryLen;

        // Somewhat the same array as above, but use > instead of >= to get
        // the end position right.
        while (i !== end && matchIdx > (iIndex + bidiTexts[i].str.length)) {
          iIndex += bidiTexts[i].str.length;
          i++;
        }

        match.end = {
          divIdx: i,
          offset: matchIdx - iIndex
        };
        ret.push(match);
      }

      return ret;
    },

    renderMatches: function TextLayerBuilder_renderMatches(matches) {
      // Early exit if there is nothing to render.
      if (matches.length === 0) {
        return;
      }

      var bidiTexts = this.textContent.items;
      var textDivs = this.textDivs;
      var prevEnd = null;
      var isSelectedPage = (this.findController === null ?
        false : (this.pageIdx === this.findController.selected.pageIdx));
      var selectedMatchIdx = (this.findController === null ?
                              -1 : this.findController.selected.matchIdx);
      var highlightAll = (this.findController === null ?
                          false : this.findController.state.highlightAll);
      var infinity = {
        divIdx: -1,
        offset: undefined
      };

      function beginText(begin, className) {
        var divIdx = begin.divIdx;
        textDivs[divIdx].textContent = '';
        appendTextToDiv(divIdx, 0, begin.offset, className);
      }

      function appendTextToDiv(divIdx, fromOffset, toOffset, className) {
        var div = textDivs[divIdx];
        var content = bidiTexts[divIdx].str.substring(fromOffset, toOffset);
        var node = document.createTextNode(content);
        if (className) {
          var span = document.createElement('span');
          span.className = className;
          span.appendChild(node);
          div.appendChild(span);
          return;
        }
        div.appendChild(node);
      }

      var i0 = selectedMatchIdx, i1 = i0 + 1;
      if (highlightAll) {
        i0 = 0;
        i1 = matches.length;
      } else if (!isSelectedPage) {
        // Not highlighting all and this isn't the selected page, so do nothing.
        return;
      }

      for (var i = i0; i < i1; i++) {
        var match = matches[i];
        var begin = match.begin;
        var end = match.end;
        var isSelected = (isSelectedPage && i === selectedMatchIdx);
        var highlightSuffix = (isSelected ? ' selected' : '');

        if (isSelected && !this.isViewerInPresentationMode) {
          scrollIntoView(textDivs[begin.divIdx],
                         { top: FIND_SCROLL_OFFSET_TOP,
                           left: FIND_SCROLL_OFFSET_LEFT });
        }

        // Match inside new div.
        if (!prevEnd || begin.divIdx !== prevEnd.divIdx) {
          // If there was a previous div, then add the text at the end.
          if (prevEnd !== null) {
            appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
          }
          // Clear the divs and set the content until the starting point.
          beginText(begin);
        } else {
          appendTextToDiv(prevEnd.divIdx, prevEnd.offset, begin.offset);
        }

        if (begin.divIdx === end.divIdx) {
          appendTextToDiv(begin.divIdx, begin.offset, end.offset,
                          'highlight' + highlightSuffix);
        } else {
          appendTextToDiv(begin.divIdx, begin.offset, infinity.offset,
                          'highlight begin' + highlightSuffix);
          for (var n0 = begin.divIdx + 1, n1 = end.divIdx; n0 < n1; n0++) {
            textDivs[n0].className = 'highlight middle' + highlightSuffix;
          }
          beginText(end, 'highlight end' + highlightSuffix);
        }
        prevEnd = end;
      }

      if (prevEnd) {
        appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
      }
    },

    updateMatches: function TextLayerBuilder_updateMatches() {
      // Only show matches when all rendering is done.
      if (!this.renderingDone) {
        return;
      }

      // Clear all matches.
      var matches = this.matches;
      var textDivs = this.textDivs;
      var bidiTexts = this.textContent.items;
      var clearedUntilDivIdx = -1;

      // Clear all current matches.
      for (var i = 0, len = matches.length; i < len; i++) {
        var match = matches[i];
        var begin = Math.max(clearedUntilDivIdx, match.begin.divIdx);
        for (var n = begin, end = match.end.divIdx; n <= end; n++) {
          var div = textDivs[n];
          div.textContent = bidiTexts[n].str;
          div.className = '';
        }
        clearedUntilDivIdx = match.end.divIdx + 1;
      }

        return;
    }
  };
  return TextLayerBuilder;
})();


var PDFRenderingQueue = (function PDFRenderingQueueClosure() {
  /**
   * @constructs
   */
  function PDFRenderingQueue() {
    this.pdfViewer = null;
    this.pdfThumbnailViewer = null;
    this.onIdle = null;

    this.highestPriorityPage = null;
    this.idleTimeout = null;
    this.printing = false;
    this.isThumbnailViewEnabled = false;
  }

  PDFRenderingQueue.prototype = /** @lends PDFRenderingQueue.prototype */ {
    /**
     * @param {PDFViewer} pdfViewer
     */
    setViewer: function PDFRenderingQueue_setViewer(pdfViewer) {
      this.pdfViewer = pdfViewer;
    },

    /**
     * @param {PDFThumbnailViewer} pdfThumbnailViewer
     */
    setThumbnailViewer:
        function PDFRenderingQueue_setThumbnailViewer(pdfThumbnailViewer) {
      this.pdfThumbnailViewer = pdfThumbnailViewer;
    },

    /**
     * @param {IRenderableView} view
     * @returns {boolean}
     */
    isHighestPriority: function PDFRenderingQueue_isHighestPriority(view) {
      return this.highestPriorityPage === view.renderingId;
    },

    renderHighestPriority: function
        PDFRenderingQueue_renderHighestPriority(currentlyVisiblePages) {
      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = null;
      }

      // Pages have a higher priority than thumbnails, so check them first.
      if (this.pdfViewer.forceRendering(currentlyVisiblePages)) {
        return;
      }
      // No pages needed rendering so check thumbnails.
      if (this.pdfThumbnailViewer && this.isThumbnailViewEnabled) {
        if (this.pdfThumbnailViewer.forceRendering()) {
          return;
        }
      }

      if (this.printing) {
        // If printing is currently ongoing do not reschedule cleanup.
        return;
      }

      if (this.onIdle) {
        this.idleTimeout = setTimeout(this.onIdle.bind(this), CLEANUP_TIMEOUT);
      }
    },

    getHighestPriority: function
        PDFRenderingQueue_getHighestPriority(visible, views, scrolledDown) {
      // The state has changed figure out which page has the highest priority to
      // render next (if any).
      // Priority:
      // 1 visible pages
      // 2 if last scrolled down page after the visible pages
      // 2 if last scrolled up page before the visible pages
      var visibleViews = visible.views;

      var numVisible = visibleViews.length;
      if (numVisible === 0) {
        return false;
      }
      for (var i = 0; i < numVisible; ++i) {
        var view = visibleViews[i].view;
        if (!this.isViewFinished(view)) {
          return view;
        }
      }

      // All the visible views have rendered, try to render next/previous pages.
      if (scrolledDown) {
        var nextPageIndex = visible.last.id;
        // ID's start at 1 so no need to add 1.
        if (views[nextPageIndex] &&
            !this.isViewFinished(views[nextPageIndex])) {
          return views[nextPageIndex];
        }
      } else {
        var previousPageIndex = visible.first.id - 2;
        if (views[previousPageIndex] &&
          !this.isViewFinished(views[previousPageIndex])) {
          return views[previousPageIndex];
        }
      }
      // Everything that needs to be rendered has been.
      return null;
    },

    /**
     * @param {IRenderableView} view
     * @returns {boolean}
     */
    isViewFinished: function PDFRenderingQueue_isViewFinished(view) {
      return view.renderingState === RenderingStates.FINISHED;
    },

    /**
     * Render a page or thumbnail view. This calls the appropriate function
     * based on the views state. If the view is already rendered it will return
     * false.
     * @param {IRenderableView} view
     */
    renderView: function PDFRenderingQueue_renderView(view) {
      var state = view.renderingState;
      switch (state) {
        case RenderingStates.FINISHED:
          return false;
        case RenderingStates.PAUSED:
          this.highestPriorityPage = view.renderingId;
          view.resume();
          break;
        case RenderingStates.RUNNING:
          this.highestPriorityPage = view.renderingId;
          break;
        case RenderingStates.INITIAL:
          this.highestPriorityPage = view.renderingId;
          view.draw(this.renderHighestPriority.bind(this));
          break;
      }
      return true;
    }
  };
  return PDFRenderingQueue;
})();
  
/**
 * PDFPage object source.
 * @class
 */
var PDFPageSource = (function PDFPageSourceClosure() {
  /**
   * @constructs
   * @param {PDFDocument} pdfDocument
   * @param {number} pageNumber
   * @constructor
   */
  function PDFPageSource(pdfDocument, pageNumber) {
    this.pdfDocument = pdfDocument;
    this.pageNumber = pageNumber;
  }

  PDFPageSource.prototype = /** @lends PDFPageSource.prototype */ {
    /**
     * @returns {Promise<PDFPage>}
     */
    getPage: function () {
      return this.pdfDocument.getPage(this.pageNumber);
    }
  };

  return PDFPageSource;
})();


// optimised CSS custom property getter/setter
var CustomStyle = (function CustomStyleClosure() {

  // As noted on: http://www.zachstronaut.com/posts/2009/02/17/
  //              animate-css-transforms-firefox-webkit.html
  // in some versions of IE9 it is critical that ms appear in this list
  // before Moz
  var prefixes = ['ms', 'Moz', 'Webkit', 'O'];
  var _cache = {};

  function CustomStyle() {}

  CustomStyle.getProp = function get(propName, element) {
    // check cache only when no element is given
    if (arguments.length === 1 && typeof _cache[propName] === 'string') {
      return _cache[propName];
    }

    element = element || document.documentElement;
    var style = element.style, prefixed, uPropName;

    // test standard property first
    if (typeof style[propName] === 'string') {
      return (_cache[propName] = propName);
    }

    // capitalize
    uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);

    // test vendor specific properties
    for (var i = 0, l = prefixes.length; i < l; i++) {
      prefixed = prefixes[i] + uPropName;
      if (typeof style[prefixed] === 'string') {
        return (_cache[propName] = prefixed);
      }
    }

    //if all fails then set to undefined
    return (_cache[propName] = 'undefined');
  };

  CustomStyle.setProp = function set(propName, element, str) {
    var prop = this.getProp(propName);
    if (prop !== 'undefined') {
      element.style[prop] = str;
    }
  };

  return CustomStyle;
})();


var RenderingStates = {
  INITIAL: 0,
  RUNNING: 1,
  PAUSED: 2,
  FINISHED: 3
};

var PresentationModeState = {
  UNKNOWN: 0,
  NORMAL: 1,
  CHANGING: 2,
  FULLSCREEN: 3
};

/**
 * Helper function to start monitoring the scroll event and converting them into
 * PDF.js friendly one: with scroll debounce and scroll direction.
 */
function watchScroll(viewAreaElement, callback) {
  var debounceScroll = function debounceScroll(evt) {
    if (rAF) {
      return;
    }
    // schedule an invocation of scroll for next animation frame.
    rAF = window.requestAnimationFrame(function viewAreaElementScrolled() {
      rAF = null;

      var currentY = viewAreaElement.scrollTop;
      var lastY = state.lastY;
      if (currentY > lastY) {
        state.down = true;
      } else if (currentY < lastY) {
        state.down = false;
      }
      state.lastY = currentY;
      // else do nothing and use previous value
      callback(state);
    });
  };

  var state = {
    down: true,
    lastY: viewAreaElement.scrollTop,
    _eventHandler: debounceScroll
  };

  var rAF = null;
  viewAreaElement.addEventListener('scroll', debounceScroll, true);
  return state;
}

/**
 * Scrolls specified element into view of its parent.
 * element {Object} The element to be visible.
 * spot {Object} An object with optional top and left properties,
 *               specifying the offset from the top left edge.
 */
function scrollIntoView(element, spot) {
  // Assuming offsetParent is available (it's not available when viewer is in
  // hidden iframe or object). We have to scroll: if the offsetParent is not set
  // producing the error. See also animationStartedClosure.
  var parent = element.offsetParent;
  var offsetY = element.offsetTop + element.clientTop;
  var offsetX = element.offsetLeft + element.clientLeft;
  if (!parent) {
    console.error('offsetParent is not set -- cannot scroll');
    return;
  }
  while (parent.clientHeight === parent.scrollHeight) {
    if (parent.dataset._scaleY) {
      offsetY /= parent.dataset._scaleY;
      offsetX /= parent.dataset._scaleX;
    }
    offsetY += parent.offsetTop;
    offsetX += parent.offsetLeft;
    parent = parent.offsetParent;
    if (!parent) {
      return; // no need to scroll
    }
  }
  if (spot) {
    if (spot.top !== undefined) {
      offsetY += spot.top;
    }
    if (spot.left !== undefined) {
      offsetX += spot.left;
      parent.scrollLeft = offsetX;
    }
  }
  parent.scrollTop = offsetY;
}

//function updateViewarea() {
//  if (!PDFViewerApplication.initialized) {
//    return;
//  }
//  PDFViewerApplication.pdfViewer.update();
//}

/**
 * Generic helper to find out what elements are visible within a scroll pane.
 */
function getVisibleElements(scrollEl, views, sortByVisibility) {
  var top = scrollEl.scrollTop, bottom = top + scrollEl.clientHeight;
  var left = scrollEl.scrollLeft, right = left + scrollEl.clientWidth;

  var visible = [], view;
  var currentHeight, viewHeight, hiddenHeight, percentHeight;
  var currentWidth, viewWidth;
  for (var i = 0, ii = views.length; i < ii; ++i) {
    view = views[i];
    currentHeight = view.el.offsetTop + view.el.clientTop;
    viewHeight = view.el.clientHeight;
    if ((currentHeight + viewHeight) < top) {
      continue;
    }
    if (currentHeight > bottom) {
      break;
    }
    currentWidth = view.el.offsetLeft + view.el.clientLeft;
    viewWidth = view.el.clientWidth;
    if ((currentWidth + viewWidth) < left || currentWidth > right) {
      continue;
    }
    hiddenHeight = Math.max(0, top - currentHeight) +
      Math.max(0, currentHeight + viewHeight - bottom);
    percentHeight = ((viewHeight - hiddenHeight) * 100 / viewHeight) | 0;

    visible.push({ id: view.id, x: currentWidth, y: currentHeight,
      view: view, percent: percentHeight });
  }

  var first = visible[0];
  var last = visible[visible.length - 1];

  if (sortByVisibility) {
    visible.sort(function(a, b) {
      var pc = a.percent - b.percent;
      if (Math.abs(pc) > 0.001) {
        return -pc;
      }
      return a.id - b.id; // ensure stability
    });
  }
  return {first: first, last: last, views: visible};
}

/**
 * Returns scale factor for the canvas. It makes sense for the HiDPI displays.
 * @return {Object} The object with horizontal (sx) and vertical (sy)
                    scales. The scaled property is set to false if scaling is
                    not required, true otherwise.
 */
function getOutputScale(ctx) {
  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1;
  var pixelRatio = devicePixelRatio / backingStoreRatio;
  return {
    sx: pixelRatio,
    sy: pixelRatio,
    scaled: pixelRatio !== 1
  };
}

var Cache = function cacheCache(size) {
  var data = [];
  this.push = function cachePush(view) {
    var i = data.indexOf(view);
    if (i >= 0) {
      data.splice(i, 1);
    }
    data.push(view);
    if (data.length > size) {
      data.shift().destroy();
    }
  };
  this.resize = function (newSize) {
    size = newSize;
    while (data.length > size) {
      data.shift().destroy();
    }
  };
};

var NonWhitespaceRegexp = /\S/;

function isAllWhitespace(str) {
  return !NonWhitespaceRegexp.test(str);
}

function convertUrlPath(baseUrl) {
	var jSBaseUrl = baseUrl.substring(baseUrl.indexOf('/js/')+'/js/'.length,baseUrl.length);
	var pathArr = jSBaseUrl.split('/');
	var subPathCount = 0;
	dojo.forEach(pathArr,function(item, i){
		if (typeof item !== 'undefined' && item != '' ) {
			subPathCount++;
		}
	});
	var subPathUrl = (function (){
		var subPath = "" ;
		for (var i=0; i<subPathCount; i++) {
			subPath = subPath + "..\/" ;
		}
		return subPath;
	})();
	console.log(subPathUrl);
	return subPathUrl;
}

//window.addEventListener('scalechange', function scalechange(evt) {
//  updateViewarea();
//}, true);

var CLEANUP_TIMEOUT = 30000;
var RENDER_DELAY = 200; // ms
var MAX_TEXT_DIVS_TO_RENDER = 100000;
var IGNORE_CURRENT_POSITION_ON_ZOOM = false;
var MAX_AUTO_SCALE = 1.25;
var SCROLLBAR_PADDING = 40;
var VERTICAL_PADDING = 5;
var DEFAULT_SCALE = 'auto';
var CSS_UNITS = 96.0 / 72.0;
var DEFAULT_CACHE_SIZE = 10;
var UNKNOWN_SCALE = 0;
if (typeof PDFJS.workerSrc === 'undefined') {
	if (dojo.config.baseUrl.match("/js/dojo/$")) {
		console.log("Url match.");
		var pdfjsSrc = dojo.config.baseUrl;
		PDFJS.workerSrc = pdfjsSrc.replace(/dojo\/$/i, 'pdfjs\/pdf.worker.js');
	}
	else {
		if (typeof document !== 'undefined') {
			console.log("Document defined.");
			PDFJS.workerSrc = (function () {
				'use strict';
				var scriptTagContainer = document.body || document.getElementsByTagName('head')[0];
				try {
					var pdfjsSrc = scriptTagContainer.querySelector("script[src$='/viewer/viewer\.js']").src;
					return pdfjsSrc && pdfjsSrc.replace(/viewer\/viewer\.js$/i, 'pdfjs\/pdf.worker.js');
				}
				catch (e) {
					console.log("Can not find /viewer/viewer.js with error : " + e);
					var baseUrl = dojo.config.baseUrl;
					var subPathUrl = convertUrlPath(baseUrl);
					return baseUrl + subPathUrl + 'pdfjs\/pdf.worker.js';
				}
			})();
		}
		else {
			console.log("Documentr is undefined ");
			var baseUrl = dojo.config.baseUrl;
			var subPathUrl = convertUrlPath(baseUrl);
			PDFJS.workerSrc = baseUrl + subPathUrl + 'pdfjs\/pdf.worker.js';
		}
	}
}
PDFJS.cMapUrl = PDFJS.workerSrc.replace(/pdf\.worker\.js$/i, 'cmaps/');
PDFJS.cMapPacked = true;
if (typeof DOC_SCENE !== 'undefined') {
	if (typeof DOC_SCENE.isPDFAgentList !== 'undefined') {
		try {
			var agentList = JSON.parse(DOC_SCENE.isPDFAgentList);
			console.log(agentList);
			if (typeof agentList !== 'undefined' && Object.keys(agentList).length != 0) {
				for (var key in agentList) {
					var agentVersion = dojo["is" + key];
					if (agentVersion) {
						var agentRegex = agentList[key];
						var regex = new RegExp(decodeURI(agentRegex));
						console.log("agent regex : " + regex);
						var isInList = regex.test(agentVersion);
						console.log(isInList);
						if (isInList) {
							if (typeof DOC_SCENE.isPDFRangeDisabled !== 'undefined') {
								PDFJS.disableRange = DOC_SCENE.isPDFRangeDisabled;
							}
						}
					}
				}
			} else {
				if (typeof DOC_SCENE.isPDFRangeDisabled !== 'undefined') {
					PDFJS.disableRange = DOC_SCENE.isPDFRangeDisabled;
				}
			}
		} catch (e) {
			console.log("Parse agent list with error : " + e);
			if (typeof DOC_SCENE.isPDFRangeDisabled !== 'undefined') {
				PDFJS.disableRange = DOC_SCENE.isPDFRangeDisabled;
			}
		}
	} else {
		if (typeof DOC_SCENE.isPDFRangeDisabled !== 'undefined') {
			PDFJS.disableRange = DOC_SCENE.isPDFRangeDisabled;
		}
	}
}