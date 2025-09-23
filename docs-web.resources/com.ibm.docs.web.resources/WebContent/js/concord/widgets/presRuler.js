dojo.provide("concord.widgets.presRuler");
dojo.provide("concord.widgets.horizontalRuler");
dojo.provide("concord.widgets.verticalRuler");
dojo.require("dijit._Widget");
dojo.require("dijit.form.HorizontalRuleLabels");
dojo.require("dijit.form.VerticalRuleLabels");
dojo.require("dijit.form.HorizontalRule");
dojo.require("dijit.form.VerticalRule");

dojo.declare("concord.widgets.presRuler", dijit._Widget, {
	positionIndicator: null,
	scaleUnits: null,
	scaleHalfUnits: null,
	scaleSmallUnits: null,
	scaleLabelsDiv: null,
	scaleLabels: null,
	scaleLabelsArr: [],
	numUnits: 8,
	numUnitMarks: 9,
	numHalfUnitMarks: 17,
	numSmallUnitMarks: 65,
	pixelsPerUnit: 80.0,
	
	constructor: function() {
		//
	},
	
    buildRendering: function() {
    	this.inherited(arguments);
		dojo.style(this.domNode, { 'display' : 'none' });
    },
    
    setPixelsPerUnit: function(pixels) {
    	this.pixelsPerUnit = pixels;
    },
    
    calculateUnitMarks: function(numPixelsInScale) {
    	this.numUnits = Math.ceil(numPixelsInScale/this.pixelsPerUnit);
    	if (this.numUnits%2 == 1)
    		this.numUnits += 1;
    	this.numUnitMarks = this.numUnits + 1;
    	this.numHalfUnitMarks = (this.numUnitMarks)*2 - 1;
    	this.numSmallUnitMarks = this.numUnits*8 + 1;
    },
    
    calculateLabels: function() {
    	// Populate the array containing unit labels
    	this.scaleLabelsArr.length = this.numUnitMarks;
    	var currMark = this.numUnits/(-2);
    	for (var i = 0; i < this.numUnitMarks; i++) {
    		if (currMark < 0)
    			this.scaleLabelsArr[i] = currMark*(-1);
    		else
    			this.scaleLabelsArr[i] = currMark;
    		currMark++;
    	}
    },
    
    destroyRulerElements: function() {
    	dojo.empty(this.domNode);
		this.scaleUnits = null;
		this.scaleHalfUnits = null;
		this.scaleSmallUnits = null;
		this.scaleLabels = null;
		this.scaleLabelsDiv = null;
		this.positionIndicator = null;
    },
    
    move: function(x, y) {
    	this.domNode.style.top = y + 'px';
    	this.domNode.style.left = x + 'px';
    },
    
    resize: function(w, h) {
    	this.domNode.style.width = w + 'px';
    	this.domNode.style.height = h + 'px';
    },
    
    setVisible: function(visible) {
    	if (visible)
    		this.domNode.style.display = 'block';
    	else
    		this.domNode.style.display = 'none';
    }
});

dojo.declare("concord.widgets.horizontalRuler", concord.widgets.presRuler, {
	constructor: function() {
		//
	},
	
	updateScale: function() {
		// Clean up previously rendered markers and labels
		this.destroyRulerElements();
		this.scaleLabelsDiv = document.createElement('div');
		this.domNode.appendChild(this.scaleLabelsDiv);
		
		// Create the scale marks for whole units and half units
		this.scaleUnits = new dijit.form.HorizontalRule( { count:this.numUnitMarks } );
    	this.scaleHalfUnits = new dijit.form.HorizontalRule( { count:this.numHalfUnitMarks } );
    	// The actual size of the scale, which may be longer than the visible part of the ruler
    	var scaleWidth = Math.ceil(this.pixelsPerUnit*this.numUnits);
    	var rulerWidth = dojo.coords(this.domNode).w;
    	var offsetLeft = 0;
        if (rulerWidth < scaleWidth)
        	offsetLeft = (rulerWidth - scaleWidth)/2;
    	dojo.style(this.scaleUnits.domNode, {
			'position' : 'absolute',
			'left' : offsetLeft + 'px',
			'top' : '0px',
			'width' : scaleWidth + 'px',
			'height' : '15px'
		});
    	dojo.style(this.scaleHalfUnits.domNode, {
			'position' : 'absolute',
			'left' : offsetLeft + 'px',
			'top' : '7px',
			'width' : scaleWidth + 'px',
			'height' : '8px'
		});
        this.domNode.appendChild(this.scaleUnits.domNode);
        this.domNode.appendChild(this.scaleHalfUnits.domNode);
       
        // Don't label the scale if there is not enough pixel space
        if (this.pixelsPerUnit >= 25 ) {
        	var scaleLabelsDiv = this.scaleLabelsDiv;
        	var scaleLabelsOffset = offsetLeft+10;
        	this.calculateLabels();
        	this.scaleLabels = new dijit.form.HorizontalRuleLabels({
        		container: this,
        		count: this.numUnitMarks,
        		labels: this.scaleLabelsArr,
        		style: "margin-top: 0px; top: -4px; left: "+scaleLabelsOffset+"px; width: "+scaleWidth+"px;",
        		labelStyle: "font-family: arial; font-size: 11px; color: #666666;"
        	}, scaleLabelsDiv);
        	this.domNode.appendChild(scaleLabelsDiv);
        } 	
        
        // Create 1mm or 1/8 inch marks, if pixel space permits
        if (this.pixelsPerUnit >= 40) {
            this.scaleSmallUnits = new dijit.form.HorizontalRule( { count:this.numSmallUnitMarks } );
        	dojo.style(this.scaleSmallUnits.domNode, {
    			'position' : 'absolute',
    			'left' : offsetLeft + 'px',
    			'top' : '11px',
    			'width' : scaleWidth + 'px',
    			'height' : '4px'
    		});
            this.domNode.appendChild(this.scaleSmallUnits.domNode); 
        }
        
        // This div will be moved to along with the mouse cursor position
        var positionIndicator = this.positionIndicator = document.createElement('div');
        positionIndicator.id = 'horizontalRulerPositionIndicator';
        dojo.removeClass(positionIndicator,'horizontalRuler');
        dojo.addClass(positionIndicator,'horizontalRulerPositionIndicator');
        this.domNode.appendChild(positionIndicator);
	},
	
    buildRendering: function() {
    	this.inherited(arguments);
		dojo.style(this.domNode, {
			'width' : '100px',
			'height' : '15px'
		});
		this.updateScale();
		dojo.addClass(this.domNode,'horizontalRuler');
    },

    postCreate: function() {
        // connect events here
    	this.inherited(arguments);
    },
    
    // update mouse position indicator on the ruler
    handleMouseMove: function(e){       
    	if (e == null) {
    		e = window.event;
    	}
    	var positionIndicator = this.positionIndicator;
    	if (positionIndicator && positionIndicator.parentNode)
    		positionIndicator.style.left = e.clientX - 2 - dojo.coords(positionIndicator.parentNode).x + 'px';
    },
    
    resize: function(w, h) {
    	this.inherited(arguments);
    	this.calculateUnitMarks(w);
    	this.updateScale();
    } 
});

dojo.declare("concord.widgets.verticalRuler", concord.widgets.presRuler, {	
	constructor: function() {
		//
	},
	
	updateScale: function() {
		// Clean up previously created markers and labels
		this.destroyRulerElements();
		this.scaleLabelsDiv = document.createElement('div');
		this.domNode.appendChild(this.scaleLabelsDiv);
		
		// Create the scale marks for whole units and half units
		this.scaleUnits = new dijit.form.VerticalRule( { count:this.numUnitMarks } );
    	this.scaleHalfUnits = new dijit.form.VerticalRule( { count:this.numHalfUnitMarks } );
    	
    	// The actual size of the scale, which may be longer than the visible part of the ruler
    	var scaleHeight = Math.ceil(this.pixelsPerUnit*this.numUnits);
    	var rulerHeight = dojo.coords(this.domNode).h;
    	var offsetTop = 0;
        if (rulerHeight < scaleHeight)
        	offsetTop = (rulerHeight - scaleHeight)/2;
    	dojo.style(this.scaleUnits.domNode, {
			'position' : 'absolute',
			'left' : '0px',
			'top' : offsetTop + 'px',
			'width' : '15px',
			'height' : scaleHeight + 'px'
		});
    	dojo.style(this.scaleHalfUnits.domNode, {
			'position' : 'absolute',
			'left' : '7px',
			'top' : offsetTop + 'px',
			'width' : '8px',
			'height' : scaleHeight + 'px'
		});
        this.domNode.appendChild(this.scaleUnits.domNode);
        this.domNode.appendChild(this.scaleHalfUnits.domNode);
        
        // Don't label the scale if there is not enough pixel space
        if (this.pixelsPerUnit >= 25 ) {
        	// Older browsers all handle text rotation differently
        	// IE8 offers writing-mode only, which offers no equivalent of 270deg rotation
        	var rotationStyle = "-webkit-transform: rotate(270deg); -moz-transform: rotate(270deg); -o-transform: rotate(270deg);";
        	var scaleLabelsDiv = this.scaleLabelsDiv;
        	var scaleLabelsOffset = offsetTop-10;
        	this.calculateLabels();
        	this.scaleLabels = new dijit.form.VerticalRuleLabels({
        		container: this,
        		count: this.numUnitMarks,
        		labels: this.scaleLabelsArr,
        		style: "left: 0px; top: "+scaleLabelsOffset+"px; height: "+scaleHeight+"px;",
        		labelStyle: "font-family: arial; font-size: 11px; color: #666666; "+rotationStyle
        	}, scaleLabelsDiv);
        	this.domNode.appendChild(scaleLabelsDiv);
        } 	
        
        // Create 1mm or 1/8 inch marks, if pixel space permits
        if (this.pixelsPerUnit >= 40) {
            this.scaleSmallUnits = new dijit.form.VerticalRule( { count:this.numSmallUnitMarks } );
        	dojo.style(this.scaleSmallUnits.domNode, {
    			'position' : 'absolute',
    			'left' : '11px',
    			'top' : offsetTop + 'px',
    			'width' : '4px',
    			'height' : scaleHeight + 'px'
    		});
            this.domNode.appendChild(this.scaleSmallUnits.domNode); 
        }
        
        // This div will be moved to along with the mouse cursor position
        var positionIndicator = this.positionIndicator = document.createElement('div');
        positionIndicator.id = 'verticalRulerPositionIndicator';
        dojo.removeClass(positionIndicator,'verticalRuler');
        dojo.addClass(positionIndicator,'verticalRulerPositionIndicator');
        this.domNode.appendChild(positionIndicator);
	},
	
    buildRendering: function() {
    	this.inherited(arguments);
		dojo.style(this.domNode, {
			'width' : '15px',
			'height' : '100px'
		});
		this.updateScale();
		dojo.addClass(this.domNode,'verticalRuler');
    },

    postCreate: function() {
        // connect events here
    	this.inherited(arguments);
    },
    
    // update mouse position indicator on the ruler
    handleMouseMove: function(e){       
    	if (e == null)
    		e = window.event;
    	var positionIndicator = this.positionIndicator;
    	if (positionIndicator) 
    		positionIndicator.style.top = e.clientY - dojo.coords(positionIndicator.parentNode).y + 'px';
    },
    
    resize: function(w, h) {
    	this.inherited(arguments);
    	this.calculateUnitMarks(h);
    	this.updateScale();
    }
});


