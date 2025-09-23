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
 * @mCanvas.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.mCanvas");
dojo.require("concord.util.date");

dojo.requireLocalization("concord.widgets","mSlideComments");

dojo.declare("concord.widgets.mCanvas", null, {
	slideSorter: null,
	slideEditor: null,
	slideComments: null,

	note: null,
	
	canvas: null,
	ctx: null,
	
	info: null,
	
	strokeColor: null,
	strokeWidth: null,
	
	isCanvasHidden: null,
	isDrawing: null,
	hasDrawing: null,

	doResize: null,
	
	connectArray: [],
	
	DEFAULT_STROKE_COLOR: '#FF0000',
	DEFAULT_STROKE_WIDTH: 6,
	DEFAULT_CANVAS_WIDTH: 1920,
	DEFAULT_CANVAS_HEIGHT: 1080,
	DEFAULT_LINE_JOIN: 'round',
	
	constructor: function(slideComments) {
		//console.log('MOBILE mCanvas constructor');
		
		if (slideComments) {
			this.slideComments = slideComments;
			this.slideSorter = slideComments.slideSorter;
			this.slideEditor = slideComments.slideEditor;
		} else
			return null;
			
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","mSlideComments");
		
		this.init();
	},

    // Dynamically create canvas layer on top of slide editor
	// 	<canvas id="concord_canvas" style='position:absolute; left:0px; top:0px;'>
	//	</canvas>
	init: function(){
		//console.log('MOBILE mCanvas init');

		this.canvas = dojo.byId('concord_comment_canvas');
		if (!this.canvas) {
			// add canvas element as child of slideEditor/ child of draw_page/ sibling of draw_frame
			this.canvas = document.createElement('canvas');
			this.canvas.id = 'concord_comment_canvas';
			//dojo.addClass(this.canvas, 'concordMobile');
			this.slideEditor.mainNode.appendChild(this.canvas);
			window.pe.scene.slideEditor.maxZindex +=5;
			dojo.style(this.canvas,{
				'position': 'absolute',
				'top': '0px',
				'left': '0px',
				'zIndex': window.pe.scene.slideEditor.maxZindex,
				'imageRendering': 'optimizeSpeed'
			});
		
			this.isCanvasHidden = false;
			this.isDrawing = false;
			this.hasDrawing = false;
		}

		// set canvas size
		this.canvas.setAttribute('width', this.slideEditor.mainNode.style.width);
		this.canvas.setAttribute('height', this.slideEditor.mainNode.style.height);
		
		this.ctx = this.canvas.getContext('2d');

		this.strokeColor = this.slideComments.draftStrokeColor ? this.slideComments.draftStrokeColor : this.DEFAULT_STROKE_COLOR;
		this.strokeWidth = this.slideComments.draftStrokeWidth ? this.slideComments.draftStrokeWidth : this.DEFAULT_STROKE_WIDTH;
		
		this.ctx.strokeStyle = this.strokeColor;
		this.ctx.lineWidth = this.strokeWidth;
		this.ctx.lineJoin = this.DEFAULT_LINE_JOIN;

		// disconnect listeners
		for (var i=0; i<this.connectArray.length; i++) {
            dojo.disconnect(this.connectArray[i]);       
		}
		this.connectArray = [];
		
		// attach event listeners to the canvas
		this.connectArray.push(dojo.connect(this.canvas,'touchstart', dojo.hitch(this,this.handleTouchStart)));
		this.connectArray.push(dojo.connect(this.canvas,'touchmove', dojo.hitch(this,this.handleTouchMove)));
		this.connectArray.push(dojo.connect(this.canvas,'touchend', dojo.hitch(this,this.handleTouchEnd)));
		this.connectArray.push(dojo.connect(this.canvas,'mousedown', dojo.hitch(this,this.handleMouseDown)));
		this.connectArray.push(dojo.connect(this.canvas,'mousemove', dojo.hitch(this,this.handleMouseMove)));
		this.connectArray.push(dojo.connect(this.canvas,'mouseup', dojo.hitch(this,this.handleMouseUp)));
		
		// prevent elastic scrolling
		document.body.addEventListener('touchmove',function(event){event.preventDefault();},false);
		
		// hide canvas
		this.hide();
		
		// instantiate note
		this.note = new concord.widgets.mSticky(this.slideComments);
	},
	
	// touchstart event handler
	handleTouchStart: function(event) {
		//console.log('MOBILE mCanvas handleTouchStart');

		var content = this.getContent();
		if (content)
			this.slideComments.addUndo(content);

		this.ctx.beginPath();
		this.ctx.moveTo(event.targetTouches[0].pageX-this.slideEditor.mainNode.offsetLeft, event.targetTouches[0].pageY-this.slideEditor.mainNode.offsetTop);
		this.hasDrawing = true;
		this.isDrawing = true;
	},
	
	// touchmove event handler
	handleTouchMove: function(event) {
		//console.log('MOBILE mCanvas handleTouchMove');

		if (this.isDrawing) {
			this.ctx.lineTo(event.targetTouches[0].pageX-this.slideEditor.mainNode.offsetLeft, event.targetTouches[0].pageY-this.slideEditor.mainNode.offsetTop);
			this.ctx.stroke();
		}
	},
	
	// touchend event handler
	handleTouchEnd: function(event) {
		//console.log('MOBILE mCanvas handleTouchEnd');

		if (this.isDrawing) {
			this.ctx.lineTo(event.targetTouches[0].pageX-this.slideEditor.mainNode.offsetLeft, event.targetTouches[0].pageY-this.slideEditor.mainNode.offsetTop);
			this.ctx.stroke();
			this.isDrawing = false;
		}
	},
	
	// mousedown event handler
	handleMouseDown: function(event) {
		//console.log('MOBILE mCanvas handleMouseDown');

		var content = this.getContent();
		if (content)
			this.slideComments.addUndo(content);

		this.ctx.beginPath();
		this.ctx.moveTo(event.layerX, event.layerY);
		this.hasDrawing = true;
		this.isDrawing = true;
	},
	
	// mousemove event handler
	handleMouseMove: function(event) {
		//console.log('MOBILE mCanvas handleMouseMove');

		if (this.isDrawing) {
			this.ctx.lineTo(event.layerX, event.layerY);
			this.ctx.stroke();
		}
	},
	
	// mouseup event handler
	handleMouseUp: function(event) {
		//console.log('MOBILE mCanvas handleMouseUp');

		if (this.isDrawing) {
			this.ctx.lineTo(event.layerX, event.layerY);
			this.ctx.stroke();
			this.isDrawing = false;
		}
	},
	
	// show canvas
	show: function() {
		if (!this.canvas)
			return;

		//console.log('MOBILE mCanvas show');

		// re-'attach' canvas to slideEditor.mainNode as necessary
		if (!this.canvas.parentNode) {
			this.canvas = null;
			this.init();
		}
		
		dojo.style(this.canvas,{
			'visibility': 'visible'
		});

		this.isCanvasHidden = false;
	},
	
	// hide canvas
	hide: function() {
		if (!this.canvas)
			return;

		//console.log('MOBILE mCanvas hide');

		dojo.style(this.canvas,{
			'visibility': 'hidden'
		});

		this.isCanvasHidden = true;
	},

	// when resizing manually (mouse drag), let's wait for all resize events to end before we resize
	resizestart: function() {
		//console.log('MOBILE mCanvas resizestart');

		var slideComments = window.pe.scene.slideComments;
		if (slideComments && slideComments.getContainer()) {
		    clearTimeout(slideComments.getContainer().doResize);
		    slideComments.getContainer().doResize = setTimeout(function() {
		    	window.pe.scene.slideComments.getContainer().resize();
		    }, 100);	    
		}
	},

	// resize canvas (used in desktop)
	resize: function() {
		//console.log('MOBILE mCanvas resize');

		var slideEditorW = parseFloat(this.slideEditor.mainNode.style.width),
			slideEditorH = parseFloat(this.slideEditor.mainNode.style.height),
			canvasW = parseFloat(this.canvas.getAttribute('width')),
			canvasH = parseFloat(this.canvas.getAttribute('height'));
		
		var validSize = !isNaN(slideEditorW) && !isNaN(slideEditorH) && !isNaN(canvasW) && !isNaN(canvasH);
		
		if (this.canvas && validSize && (canvasW != slideEditorW || canvasH != slideEditorH)) {
			////console.log('MOBILE convert canvas to data url to resize');
	  		var oldCanvas = null;
	  		var comment = this.slideComments.getComment();
	  		if (comment)
	  			oldCanvas = comment.getItem(0).getImgUrl();
	  		if (!oldCanvas)
	  			oldCanvas = this.canvas.toDataURL("image/png");

	  		// scale stroke width
	  		var scaleX = slideEditorW/canvasW,
	  			scaleY = slideEditorH/canvasH;
	  		var	scale = (scaleX+scaleY)/2;
	  		////console.log('MOBILE new scale: ' + scale);
	  		this.strokeWidth = this.strokeWidth*scale;
	  		////console.log('MOBILE new strokeWidth: ' + this.strokeWidth);
	  		
	  		this.canvas.setAttribute('width', slideEditorW);
	  		this.canvas.setAttribute('height', slideEditorH);
	    
	    	var img = new Image();
	    	img.src = oldCanvas;
	    	
	    	img.onload = function (){
	    		canvas = window.pe.scene.slideComments.getContainer();
	    		if (canvas && canvas.ctx) {
	    			////console.log('MOBILE redraw image with new size');
	    			canvas.ctx.drawImage(img, 0, 0, slideEditorW, slideEditorH);
	    			canvas.ctx.strokeStyle = canvas.strokeColor;
	    			canvas.ctx.lineWidth = canvas.strokeWidth;
	    			canvas.ctx.lineJoin = canvas.DEFAULT_LINE_JOIN;
	    		}
	    	};
	    }
	},
	
	// deprecated
	save: function() {
		//console.log('MOBILE mCanvas save');

		if (!this.canvas)
			return;
		
		var data = this.canvas.toDataURL('image/png');
		var imageUrl = this.uploadImageData(data);
		return imageUrl;
	},
	
	// deprecated
	load: function() {
		//console.log('MOBILE mCanvas load');
		// load previously saved canvas png
		var canvasUri = this.slideEditor.mainNode.getAttribute('canvasUri');
		////console.log('MOBILE mCanvas load - previously saved png uri ' + canvasUri);
		
		if (!canvasUri) {
			return;
		}
		
		var img = new Image();
    	img.src = canvasUri; 
    	
    	img.onload = function (){
    		canvas = window.pe.scene.slideComments.getContainer();
    		if (canvas && canvas.ctx) {
    			var slideEditorW = parseFloat(canvas.slideEditor.mainNode.style.width),
    				slideEditorH = parseFloat(canvas.slideEditor.mainNode.style.height);

    			canvas.ctx.drawImage(img, 0, 0, slideEditorW, slideEditorH);
    			canvas.ctx.strokeStyle = canvas.strokeColor;
    			canvas.ctx.lineWidth = canvas.strokeWidth;
    			canvas.ctx.lineJoin = canvas.DEFAULT_LINE_JOIN;
       			////console.log('MOBILE mCanvas load - previously saved canvas data loaded');
       		}
    	};	
	},
	
	// return canvas' note object
	getNote: function() {
		//console.log('MOBILE mCanvas getNote');
		
		return this.note;
	},
	
	// return canvas data 
	getContent: function() {
		//console.log('MOBILE mCanvas getContent');

		if (!this.canvas)
			return null;

		var data = this.canvas.toDataURL('image/png');

		return data;
	},
	
	// render passed-in data on canvas
	setContent: function(data) {
		//console.log('MOBILE mCanvas setContent');
		var img = new Image();
    	img.src = data; 
    	//img.src = contextPath + window.staticRootPath + '/images/comment_add_sticky.png';	// temp test
    	
    	img.onload = function (){
    		canvas = window.pe.scene.slideComments.getContainer();
    		if (canvas && canvas.ctx) {
    			var slideEditorW = parseFloat(canvas.slideEditor.mainNode.style.width),
    				slideEditorH = parseFloat(canvas.slideEditor.mainNode.style.height);

    			canvas.ctx.clearRect(0, 0, slideEditorW, slideEditorH);
    			canvas.ctx.drawImage(img, 0, 0, slideEditorW, slideEditorH);
    			canvas.ctx.strokeStyle = canvas.strokeColor;
    			canvas.ctx.lineWidth = canvas.strokeWidth;
    			canvas.ctx.lineJoin = canvas.DEFAULT_LINE_JOIN;
    		}
    	};	
	},
	
	// render passed-in comment info above canvas
	setInfo: function(comment) {
		this.info = dojo.byId('concord_comment_info');
		if (!this.info)
			this.buildInfo();
		var creator = null;
		var timestamp = null;
		var commentItem = comment.getItem(0);
		if (commentItem) {
			creator =  commentItem.getCreatorName();
			timestamp = commentItem.getTimestamp();
			if (timestamp)
				timestamp = concord.util.date.parseDate(timestamp);
		
		}
		if (creator && timestamp) {
			//this.info.innerHTML = this.STRINGS.slideCommentCreatedBy + ' ' + creator + ' ' + this.STRINGS.slideCommentCreatedOn + ' ' + timestamp;
			var htmlString = this.STRINGS.slideCommentCreatedBy;  //slideCommentCreatedBy is like: "Created by %creator on %timestamp"
			htmlString = dojo.string.substitute(htmlString,[creator, timestamp]);
			this.info.innerHTML = htmlString;
		} else
			this.info.innerHTML = '';
	},
	
	// build the comment info container
	buildInfo: function() {
		this.info = document.createElement('div');
		this.info.id = 'concord_comment_info';
		this.slideEditor.mainNode.appendChild(this.info);
		window.pe.scene.slideEditor.maxZindex +=5;
		dojo.style(this.info,{
			'position': 'absolute',
			'top': concord.util.browser.isMobile() ? '-30px' : '-23px',
			'left': concord.util.browser.isMobile() ? '0px' : '100px',
			'zIndex': window.pe.scene.slideEditor.maxZindex,
			'color': '#606060'
		});
	},
	
	// clear canvas
	clearCanvas: function() {
		//console.log('MOBILE mCanvas clearCanvas');
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.hasDrawing = false;
		
		if (this.info)
			this.info.innerHTML = '';
	},

	// clear canvas and canvas' note
	clear: function() {
		//console.log('MOBILE mCanvas clear');

		this.clearCanvas();

		if (this.note) {
			this.note.clear();
			this.note.hide();
		}
	},
	
	// change container stroke color
	setStrokeColor: function(value) {
		this.strokeColor = value;
		if (this.ctx) {
			this.ctx.strokeStyle = this.strokeColor;
		}
	},
	
	// change container stroke color
	setStrokeWidth: function(value) {
		this.strokeWidth = value;
		if (this.ctx) {
			this.ctx.lineWidth = this.strokeWidth;
		}
	},
	
	// housekeeping
	destroy: function() {
		//console.log('MOBILE mCanvas destroy');

		// disconnect listeners
		for (var i=0; i<this.connectArray.length; i++) {
            dojo.disconnect(this.connectArray[i]);       
		}
		this.connectArray = null;
       
		if (this.note)
			this.note.destroy();

		dojo.destroy(this.canvas);
		
		dojo.destroy(this.info);

		this.slideSorter = null;
		this.slideEditor = null;
		this.slideComments = null;
		this.note = null;
		this.canvas = null;
		this.info = null;
		this.ctx = null;
		this.strokeColor = null;
		this.strokeWidth = null;
		this.isCanvasHidden = null;
		this.isDrawing = null;
		this.hasDrawing = null;
		this.doResize = null;
	}
});