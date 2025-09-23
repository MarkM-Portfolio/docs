dojo.provide("concord.chart.lib.axis2d.Default");

dojo.require("concord.chart.lib.axis2d.Invisible");

dojo.require("concord.chart.lib.scaler.linear");
dojo.require("concord.chart.lib.axis2d.common");

dojo.require("dojo.colors");
dojo.require("dojo.string");
dojo.require("dojox.gfx");
dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.utils");

/*=====
	concord.chart.lib.axis2d.__AxisCtorArgs = function(
		vertical, fixUpper, fixLower, natural, leftBottom,
		includeZero, fixed, majorLabels, minorTicks, minorLabels, microTicks, htmlLabels,
		min, max, from, to, majorTickStep, minorTickStep, microTickStep,
		labels, labelFunc, maxLabelSize,
		stroke, majorTick, minorTick, microTick, tick,
		font, fontColor
	){
	//	summary:
	//		Optional arguments used in the definition of an axis.
	//
	//	vertical: Boolean?
	//		A flag that says whether an axis is vertical (i.e. y axis) or horizontal. Default is false (horizontal).
	//	fixUpper: String?
	//		Align the greatest value on the axis with the specified tick level. Options are "major", "minor", "micro", or "none".  Defaults to "none".
	//	fixLower: String?
	//		Align the smallest value on the axis with the specified tick level. Options are "major", "minor", "micro", or "none".  Defaults to "none".
	//	natural: Boolean?
	//		Ensure tick marks are made on "natural" numbers. Defaults to false.
	//	leftBottom: Boolean?
	//		The position of a vertical axis; if true, will be placed against the left-bottom corner of the chart.  Defaults to true.
	//	includeZero: Boolean?
	//		Include 0 on the axis rendering.  Default is false.
	//	fixed: Boolean?
	//		Force all axis labels to be fixed numbers.  Default is true.
	//	majorLabels: Boolean?
	//		Flag to draw all labels at major ticks. Default is true.
	//	minorTicks: Boolean?
	//		Flag to draw minor ticks on an axis.  Default is true.
	//	minorLabels: Boolean?
	//		Flag to draw labels on minor ticks. Default is true.
	//	microTicks: Boolean?
	//		Flag to draw micro ticks on an axis. Default is false.
	//	htmlLabels: Boolean?
	//		Flag to use HTML (as opposed to the native vector graphics engine) to draw labels. Default is true.
	//	min: Number?
	//		The smallest value on an axis. Default is 0.
	//	max: Number?
	//		The largest value on an axis. Default is 1.
	//	from: Number?
	//		Force the chart to render data visible from this value. Default is 0.
	//	to: Number?
	//		Force the chart to render data visible to this value. Default is 1.
	//	majorTickStep: Number?
	//		The amount to skip before a major tick is drawn.  Default is 4.
	//	minorTickStep: Number?
	//		The amount to skip before a minor tick is drawn. Default is 2.
	//	microTickStep: Number?
	//		The amount to skip before a micro tick is drawn. Default is 1.
	//	labels: Object[]?
	//		An array of labels for major ticks, with corresponding numeric values, ordered by value.
	//	labelFunc: Function?
	//		An optional function used to compute label values.
	//	maxLabelSize: Number?
	//		The maximum size, in pixels, for a label.  To be used with the optional label function.
	//	stroke: dojox.gfx.Stroke?
	//		An optional stroke to be used for drawing an axis.
	//	majorTick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a major tick.
	//	minorTick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a minor tick.
	//	microTick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a micro tick.
	//	tick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a tick.
	//	font: String?
	//		An optional font definition (as used in the CSS font property) for labels.
	//	fontColor: String|dojo.Color?
	//		An optional color to be used in drawing labels.

	this.vertical = vertical;
	this.fixUpper = fixUpper;
	this.fixLower = fixLower;
	this.natural = natural;
	this.leftBottom = leftBottom;
	this.includeZero = includeZero;
	this.fixed = fixed;
	this.majorLabels = majorLabels;
	this.minorTicks = minorTicks;
	this.minorLabels = minorLabels;
	this.microTicks = microTicks;
	this.htmlLabels = htmlLabels;
	this.min = min;
	this.max = max;
	this.from = from;
	this.to = to;
	this.majorTickStep = majorTickStep;
	this.minorTickStep = minorTickStep;
	this.microTickStep = microTickStep;
	this.labels = labels;
	this.labelFunc = labelFunc;
	this.maxLabelSize = maxLabelSize;
	this.stroke = stroke;
	this.majorTick = majorTick;
	this.minorTick = minorTick;
	this.microTick = microTick;
	this.tick = tick;
	this.font = font;
	this.fontColor = fontColor;
}
=====*/
(function(){
	var dc = concord.chart.lib,
		du = dojox.lang.utils,
		g = dojox.gfx,
		lin = dc.scaler.linear,
		labelGap = 2,			// in pixels
		centerAnchorLimit = 45;	// in degrees

	dojo.declare("concord.chart.lib.axis2d.Default", concord.chart.lib.axis2d.Invisible, {
		//	summary:
		//		The default axis object used in concord.chart.lib.  See concord.chart.lib.Chart.addAxis for details.
		//
		//	defaultParams: Object
		//		The default parameters used to define any axis.
		//	optionalParams: Object
		//		Any optional parameters needed to define an axis.

		/*
		//	TODO: the documentation tools need these to be pre-defined in order to pick them up
		//	correctly, but the code here is partially predicated on whether or not the properties
		//	actually exist.  For now, we will leave these undocumented but in the code for later. -- TRT

		//	opt: Object
		//		The actual options used to define this axis, created at initialization.
		//	scalar: Object
		//		The calculated helper object to tell charts how to draw an axis and any data.
		//	ticks: Object
		//		The calculated tick object that helps a chart draw the scaling on an axis.
		//	dirty: Boolean
		//		The state of the axis (whether it needs to be redrawn or not)
		//	scale: Number
		//		The current scale of the axis.
		//	offset: Number
		//		The current offset of the axis.

		opt: null,
		scalar: null,
		ticks: null,
		dirty: true,
		scale: 1,
		offset: 0,
		*/
		defaultParams: {
			vertical:    false,		// true for vertical axis
			fixUpper:    "none",	// align the upper on ticks: "major", "minor", "micro", "none"
			fixLower:    "none",	// align the lower on ticks: "major", "minor", "micro", "none"
			natural:     false,		// all tick marks should be made on natural numbers
			leftBottom:  true,		// position of the axis, used with "vertical"
			includeZero: false,		// 0 should be included
			fixed:       true,		// all labels are fixed numbers
			majorLabels: true,		// draw major labels
			minorTicks:  true,		// draw minor ticks
			minorLabels: true,		// draw minor labels
			microTicks:  false,		// draw micro ticks
			rotation:    0,			// label rotation angle in degrees
			autoRotation: 0,
			htmlLabels:  true		// use HTML to draw labels
		},
		optionalParams: {
			min:			0,	// minimal value on this axis
			max:			1,	// maximal value on this axis
			from:			0,	// visible from this value
			to:				1,	// visible to this value
			expand:         0,
			majorTickStep:	4,	// major tick step
			minorTickStep:	2,	// minor tick step
			microTickStep:	1,	// micro tick step
			labels:			[],	// array of labels for major ticks
								// with corresponding numeric values
								// ordered by values
			labelFunc:		null, // function to compute label values
			maxLabelSize:	0,	// size in px. For use with labelFunc
			maxLabelCharCount:	0,	// size in word count.
			trailingSymbol:	null,

			// TODO: add support for minRange!
			// minRange:		1,	// smallest distance from min allowed on the axis

			// theme components
			stroke:			{},	// stroke for an axis
			majorTick:		{},	// stroke + length for a tick
			minorTick:		{},	// stroke + length for a tick
			microTick:		{},	// stroke + length for a tick
			tick:           {},	// stroke + length for a tick
			font:			{},	// font for labels
			fontColor:		"",	// color for labels as a string
			title:		 		"",	// axis title
			titleGap:	 		0,		// gap between axis title and axis label
			titleFont:	 		{},		// axis title font
			titleFontColor:	 	"",		// axis title font color
			titleOrientation: 	""		// "axis" means the title facing the axis, "away" means facing away
		},

		constructor: function(chart, kwArgs){
			//	summary:
			//		The constructor for an axis.
			//	chart: concord.chart.lib.Chart2D
			//		The chart the axis belongs to.
			//	kwArgs: concord.chart.lib.axis2d.__AxisCtorArgs?
			//		Any optional keyword arguments to be used to define this axis.
			this.opt = dojo.clone(this.defaultParams);
            //du.updateWithObject(this.opt, kwArgs);
			//du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
            dojo.mixin(this.opt,kwArgs);
		},
		
		getOffsets: function(){
			//	summary:
			//		Get the physical offset values for this axis (used in drawing data series).
			//	returns: Object
			//		The calculated offsets in the form of { l, r, t, b } (left, right, top, bottom).
			var s = this.scaler, offsets = { l: 0, r: 0, t: 0, b: 0 };
			if(!s){
				return offsets;
			}
			var o = this.opt, labelWidth = 0, a, b, c, d,
				gl = dc.scaler.common.getNumericLabel,
				offset = 0, ma = s.major, mi = s.minor,
				ta = this.chart.theme.axis;
			
			var	taFont = this.getFont();
			var taTitleFont = this.getTitleFont();
			
			var	taTitleGap = (o.titleGap==0) ? 0 : o.titleGap || (ta.tick && ta.tick.titleGap) || 5,
				taMajorTick = this.chart.theme.getTick("major", o),
				taMinorTick = this.chart.theme.getTick("minor", o),
				size = taFont ? g.normalizedLength(taFont.size) + 2 : 0,
				tsize = taTitleFont ? g.normalizedLength(taTitleFont.size) + 2: 0,
				rotation = o.rotation % 360, leftBottom = o.leftBottom,
				cosr = Math.abs(Math.cos(rotation * Math.PI / 180)),
				sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
			this.trailingSymbol = (o.trailingSymbol === undefined || o.trailingSymbol === null) ? this.trailingSymbol : o.trailingSymbol;
			if(rotation < 0){
				rotation += 360;
			}
			
			if(size){
				// we need width of all labels
				var firstLabelWidth = 0;
				var lastLabelWidth = 0;
				var firstLabel = "";
				var lastLabel = "";
				if(this.labels)
				{
					firstLabel = this.labels[s.bounds.lower] || " ";
					if(dojo.isObject(firstLabel))
						firstLabel = firstLabel.text || " ";
					
					if(typeof firstLabel=="number" && o.labelFunc)
						firstLabel = o.labelFunc(firstLabel,firstLabel,0);
					
					lastLabel = this.labels[s.bounds.upper];
					if(dojo.isObject(lastLabel))
						lastLabel = lastLabel.text || " ";
					
					if(typeof lastLabel=="number" && o.labelFunc)
						lastLabel = o.labelFunc(lastLabel,lastLabel,0);
					
					var allLabels = [];
					for(var i=0;i<this.labels.length;i++)
					{
						var la = this.labels[i];
						if(dojo.isObject(la))
							la = la.text || " ";
						if(typeof la=="number" && o.labelFunc)
							la = o.labelFunc(la,la,0);
						allLabels.push(la);
					}
					labelWidth = this._groupLabelWidth(allLabels, taFont, o.maxLabelCharCount);
				}
				else
				{
					firstLabel = gl(ma.start, ma.prec, o) || " ";
					lastLabel = gl(ma.start + ma.count * ma.tick, ma.prec, o) || " ";
					
					labelWidth = this._groupLabelWidth([
						gl(ma.start, ma.prec, o),
						gl(ma.start + ma.count * ma.tick, ma.prec, o)
					], taFont, o.maxLabelCharCount);
				}
				
				firstLabelWidth = this._groupLabelWidth([firstLabel], taFont, o.maxLabelCharCount);
				lastLabelWidth = this._groupLabelWidth([lastLabel], taFont, o.maxLabelCharCount);
				
				labelWidth = o.maxLabelSize ? Math.min(o.maxLabelSize, labelWidth) : labelWidth;
				firstLabelWidth = o.maxLabelSize ? Math.min(o.maxLabelSize, firstLabelWidth) : firstLabelWidth;
				lastLabelWidth = o.maxLabelSize ? Math.min(o.maxLabelSize, lastLabelWidth) : lastLabelWidth;
				
				if(this.vertical){
					var side = leftBottom ? "l" : "r";
					switch(rotation){
						case 0:
						case 180:
							offsets[side] = labelWidth;
							offsets.t = offsets.b = size / 2;
							break;
						case 90:
						case 270:
							offsets[side] = size;
							offsets.b = firstLabelWidth/2;
							offsets.t = lastLabelWidth/2;
							break;
						default:
							if(rotation <= centerAnchorLimit || (180 < rotation && rotation <= (180 + centerAnchorLimit))){
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "t" : "b"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "b" : "t"] = size * cosr / 2;
							}else if(rotation > (360 - centerAnchorLimit) || (180 > rotation && rotation > (180 - centerAnchorLimit))){
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "b" : "t"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "t" : "b"] = size * cosr / 2;
							}else if(rotation < 90 || (180 < rotation && rotation < 270)){
								offsets[side] = size * sinr + labelWidth * cosr;
								offsets[leftBottom ? "t" : "b"] = size * cosr + labelWidth * sinr;
							}else{
								offsets[side] = size * sinr + labelWidth * cosr;
								offsets[leftBottom ? "b" : "t"] = size * cosr + labelWidth * sinr;
							}
							break;
					}
					offsets[side] += labelGap + Math.max(taMajorTick.length, taMinorTick.length) + (o.title ? (tsize + taTitleGap) : 0);
				}
				else
				{
					if(rotation==0)
					{
						var lim = this.scaler.bounds.span/this.scaler.major.count;
						if(labelWidth>lim)
						{
							if(!this.labels || this.labels.length==0)
								this.opt.autoRotation = 270;
							else
								this.opt.autoRotation = 315;
						}
						else
							this.opt.autoRotation = 0;
						
						rotation = this.opt.autoRotation;
						cosr = Math.abs(Math.cos(rotation * Math.PI / 180)),
						sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
					}
					var side = leftBottom ? "b" : "t";
					switch(rotation){
						case 0:
						case 180:
							offsets[side] = size;
							offsets.l = firstLabelWidth/2;
							offsets.r = lastLabelWidth / 2;
							break;
						case 90:
						case 270:
							offsets[side] = labelWidth;
							offsets.l = offsets.r = size / 2;
							break;
						default:
							if((90 - centerAnchorLimit) <= rotation && rotation <= 90 || (270 - centerAnchorLimit) <= rotation && rotation <= 270){
								offsets[side] = size * cosr / 2 + labelWidth * sinr + 2;
								offsets[leftBottom ? "r" : "l"] = size * cosr / 2 + lastLabelWidth * sinr;
								offsets[leftBottom ? "l" : "r"] = size * cosr / 2;
							}else if(90 <= rotation && rotation <= (90 + centerAnchorLimit) || 270 <= rotation && rotation <= (270 + centerAnchorLimit)){
								offsets[side] = size * cosr / 2 + labelWidth * sinr + 2;
								offsets[leftBottom ? "l" : "r"] = size * cosr / 2 + firstLabelWidth * sinr;
								offsets[leftBottom ? "r" : "l"] = size * cosr / 2;
							}else if(rotation < centerAnchorLimit || (180 < rotation && rotation < (180 + centerAnchorLimit))){
								offsets[side] = size * cosr/2 + labelWidth * sinr + 2;
								offsets[leftBottom ? "r" : "l"] = size * sinr + lastLabelWidth * cosr; 
							}else{
								offsets[side] = size * cosr + labelWidth * sinr + 2;
								offsets[leftBottom ? "l" : "r"] = size * sinr + firstLabelWidth * cosr;
							}
							break;
					}
					offsets[side] += labelGap + Math.max(taMajorTick.length, taMinorTick.length) + (o.title ? (tsize + taTitleGap) : 0);
				}
			}
			if(labelWidth){
				this._cachedLabelWidth = labelWidth;
			}
			return offsets;	//	Object
		},
		render: function(dim, offsets){
			//	summary:
			//		Render/draw the axis.
			//	dim: Object
			//		An object of the form { width, height}.
			//	offsets: Object
			//		An object of the form { l, r, t, b }.
			//	returns: concord.chart.lib.axis2d.Default
			//		The reference to the axis for functional chaining.
			var isRtl = this.chart.isRightToLeft(), 
				fixBidiOffset = dojo.isIE && (g.renderer == "svg") && (BidiUtils.isBidiOn() || this.chart.textDir);

			if(!this.dirty || this.scaler==null){
				return this;	//	concord.chart.lib.axis2d.Default
			}
			// prepare variable
			var o = this.opt, ta = this.chart.theme.axis, leftBottom = o.leftBottom, rotation = o.rotation % 360,
				start, stop, titlePos, titleRotation=0, titleOffset, axisVector, tickVector, anchorOffset, labelOffset, labelAlign;
			
			var	taFont = this.getFont();
			var taTitleFont = this.getTitleFont();
			var	taFontColor = this.getFontColor();
			var	taTitleFontColor =this.getTitleFontColor();
			
			var	taTitleGap = (o.titleGap==0) ? 0 : o.titleGap || (ta.tick && ta.tick.titleGap) || 5,
				taTitleOrientation = o.titleOrientation || (ta.tick && ta.tick.titleOrientation) || "axis",
				taMajorTick = this.chart.theme.getTick("major", o),
				taMinorTick = this.chart.theme.getTick("minor", o),
				taMicroTick = this.chart.theme.getTick("micro", o),

				tickSize = Math.max(taMajorTick.length, taMinorTick.length, taMicroTick.length),
				taStroke = "stroke" in o ? o.stroke : ta.stroke,
				size = taFont ? g.normalizedLength(taFont.size) : 0,
				tsize = taTitleFont ? g.normalizedLength(taTitleFont.size) : 0;
				
			if("stroke" in o)
				dojo.mixin(taMajorTick,o.stroke);
				
			if(rotation < 0){
				rotation += 360;
			}
			rotation = rotation || o.autoRotation; 
			var cosr = Math.abs(Math.cos(rotation * Math.PI / 180));
			var sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
			if(this.vertical){
				start = {y: dim.height - offsets.b};
				stop  = {y: offsets.t};
				titlePos = {y: (dim.height - offsets.b + offsets.t)/2};
				titleOffset = size * sinr + (this._cachedLabelWidth || 0) * cosr + labelGap + Math.max(taMajorTick.length, taMinorTick.length) + tsize + taTitleGap;
				axisVector = {x: 0, y: -1};
				labelOffset = {x: 0, y: 0};
				tickVector = {x: 1, y: 0};
				anchorOffset = {x: labelGap, y: 0};
				switch(rotation){
					case 0:
						labelAlign = "end";
						labelOffset.y = size * 0.4;
						break;
					case 90:
						labelAlign = "middle";
						labelOffset.x = -size;
						break;
					case 180:
						labelAlign = "start";
						labelOffset.y = -size * 0.4;
						break;
					case 270:
						labelAlign = "middle";
						break;
					default:
						if(rotation < centerAnchorLimit){
							labelAlign = "end";
							labelOffset.y = size * 0.4;
						}else if(rotation < 90){
							labelAlign = "end";
							labelOffset.y = size * 0.4;
						}else if(rotation < (180 - centerAnchorLimit)){
							labelAlign = "start";
						}else if(rotation < (180 + centerAnchorLimit)){
							labelAlign = "start";
							labelOffset.y = -size * 0.4;
						}else if(rotation < 270){
							labelAlign = "start";
							labelOffset.x = leftBottom ? 0 : size * 0.4;
						}else if(rotation < (360 - centerAnchorLimit)){
							labelAlign = "end";
							labelOffset.x = leftBottom ? 0 : size * 0.4;
						}else{
							labelAlign = "end";
							labelOffset.y = size * 0.4;
						}
				}
				if(leftBottom){
					start.x = stop.x = offsets.l;
					titleRotation = (taTitleOrientation && taTitleOrientation == "away") ? 90 : 270;
					titlePos.x = offsets.l - titleOffset + (titleRotation == 270 ? tsize : 0);
					tickVector.x = -1;
					anchorOffset.x = -anchorOffset.x;
				}else{
					start.x = stop.x = dim.width - offsets.r;
					titleRotation = (taTitleOrientation && taTitleOrientation == "axis") ? 90 : 270;
					titlePos.x = dim.width - offsets.r + titleOffset - (titleRotation == 270 ? 0 : tsize);
					switch(labelAlign){
						case "start":
							labelAlign = "end";
							break;
						case "end":
							labelAlign = "start";
							break;
						case "middle":
							labelOffset.x += size;
							break;
					}
				}
			}else{
				start = {x: offsets.l};
				stop  = {x: dim.width - offsets.r};
				titlePos = {x: (dim.width - offsets.r + offsets.l)/2};
				titleOffset = size * cosr + (this._cachedLabelWidth || 0) * sinr + labelGap + Math.max(taMajorTick.length, taMinorTick.length) + tsize + taTitleGap;
				axisVector = {x: isRtl ? -1 : 1, y: 0};
				labelOffset = {x: 0, y: 0};
				tickVector = {x: 0, y: 1};
				anchorOffset = {x: 0, y: labelGap};
				switch(rotation){
					case 0:
						labelAlign = "middle";
						labelOffset.y = size;
						break;
					case 90:
						labelAlign = "start";
						labelOffset.x = -size * 0.4;
						break;
					case 180:
						labelAlign = "middle";
						break;
					case 270:
						labelAlign = "end";
						labelOffset.x = size * 0.4;
						break;
					default:
						if(rotation < (90 - centerAnchorLimit)){
							labelAlign = "start";
							labelOffset.y = leftBottom ? size : 0;
						}else if(rotation < (90 + centerAnchorLimit)){
							labelAlign = "start";
							labelOffset.x = -size * 0.4;
						}else if(rotation < 180){
							labelAlign = "start";
							labelOffset.y = leftBottom ? 0 : -size;
						}else if(rotation < (270 - centerAnchorLimit)){
							labelAlign = "end";
							labelOffset.y = leftBottom ? 0 : -size;
						}else if(rotation < (270 + centerAnchorLimit)){
							labelAlign = "end";
							labelOffset.y = leftBottom ? size * 0.4 : 0;
						}else{
							labelAlign = "end";
							labelOffset.y = leftBottom ? size * 0.4 : 0;
						}
				}
				if(leftBottom){
					start.y = stop.y = dim.height - offsets.b;
					titleRotation = (taTitleOrientation && taTitleOrientation == "axis") ? 180 : 0;
					titlePos.y = dim.height - offsets.b + titleOffset - (titleRotation ? tsize : 0);
				}else{
					start.y = stop.y = offsets.t;
					titleRotation = (taTitleOrientation && taTitleOrientation == "away") ? 180 : 0;
					titlePos.y = offsets.t - titleOffset + (titleRotation ? 0 : tsize);
					tickVector.y = -1;
					anchorOffset.y = -anchorOffset.y;
					switch(labelAlign){
						case "start":
							labelAlign = "end";
							break;
						case "end":
							labelAlign = "start";
							break;
						case "middle":
							labelOffset.y -= size;
							break;
					}
				}
			}

			// render shapes

			this.cleanGroup();

			try{
				var s = this.group,
					c = this.scaler,
					t = this.ticks,
					canLabel,
					f = lin.getTransformerFromModel(this.scaler),
					// GFX Canvas now supports labels, so let's _not_ fallback to HTML anymore on canvas, just use
					// HTML labels if explicitly asked + no rotation + no IE + no Opera
					labelType = "gfx";//!titleRotation && !rotation && this.opt.htmlLabels && !dojo.isIE && !dojo.isOpera ? "html" : "gfx",
					dx = tickVector.x * taMajorTick.length,
					dy = tickVector.y * taMajorTick.length;

				if(taStroke)
				{
					s.createLine({
							x1: start.x,
							y1: start.y,
							x2: stop.x,
							y2: stop.y
						}).setStroke(taStroke);
				}
				
				
				//create axis title
				if(o.title){
					var x = titlePos.x;
					if (fixBidiOffset)
						x = this.getStartOffset(x, o.title, "middle", taTitleFont, o.maxLabelCharCount);

					var axisTitle = dc.axis2d.common.createText[labelType](
						this.chart,
						s,
						x,
						titlePos.y,
						fixBidiOffset ? "start" : "middle",
						o.title,
						taTitleFont,
						taTitleFontColor
					);
					if(labelType == "html"){
						this.htmlElements.push(axisTitle);
					}else{
						//as soon as rotation is provided, labelType won't be "html"
						//rotate gfx labels
						axisTitle.setTransform(g.matrix.rotategAt(titleRotation, titlePos.x, titlePos.y));
					}
				}
				
				if(t!=null)
				dojo.forEach(t.major, function(tick){
					var offset = f(tick.value), elem,
						x = (isRtl ? stop.x : start.x) + axisVector.x * offset,
						y = start.y + axisVector.y * offset;
						s.createLine({
							x1: x, y1: y,
							x2: x + dx,
							y2: y + dy
						}).setStroke(taMajorTick);
						if(tick.label!=null)
						{
							var label = {text: tick.label,truncated: false};
							if((tick.label+"").length>2)
							{
								if(o.maxLabelCharCount)
									label = this.getTextWithLimitCharCount(tick.label+"", taFont, o.maxLabelCharCount);
								if(o.maxLabelSize)
									label = this.getTextWithLimitLength(label.text, taFont, o.maxLabelSize, label.truncated);
								
								var abs_cos = Math.abs(Math.cos(rotation*Math.PI / 180));
								var abs_sin = Math.abs(Math.sin(rotation*Math.PI / 180));
								var lim = this.scaler.bounds.span/this.scaler.major.count;
								if(this.vertical)
								{
									if(abs_cos==0)
										label = this.getTextWithLimitLength(label.text, taFont, lim, label.truncated);
								}
								else
								{
									if(abs_sin==0)
										label = this.getTextWithLimitLength(label.text, taFont, lim, label.truncated);
								}
							}
							
							var x = x + dx + anchorOffset.x + (rotation ? 0 : labelOffset.x);
							if (fixBidiOffset && labelAlign != "start")
								x = this.getStartOffset(x, label, labelAlign, taFont, o.maxLabelCharCount);

							elem = dc.axis2d.common.createText[labelType](
								this.chart,
								s,
								x,
								y + dy + anchorOffset.y + (rotation ? 0 : labelOffset.y),
								fixBidiOffset ? "start" : labelAlign,
								label.text,
								taFont,
								taFontColor
								//this._cachedLabelWidth
							);
							label.truncated && this.labelTooltip(elem, this.chart, tick.label, label.text, taFont, labelType);
							if(labelType == "html"){
								this.htmlElements.push(elem);
							}else if(rotation){
								elem.setTransform([
									{dx: labelOffset.x, dy: labelOffset.y},
									g.matrix.rotategAt(
										rotation,
										x + dx + anchorOffset.x,
										y + dy + anchorOffset.y
									)
								]);
							}
						}
				}, this);

				dx = tickVector.x * taMinorTick.length;
				dy = tickVector.y * taMinorTick.length;
				canLabel = c.minMinorStep <= c.minor.tick * c.bounds.scale;
				
				if(t!=null)
				dojo.forEach(t.minor, function(tick){
					var offset = f(tick.value), elem,
						x = (isRtl ? stop.x : start.x)  + axisVector.x * offset,
						y = start.y + axisVector.y * offset;
						s.createLine({
							x1: x, y1: y,
							x2: x + dx,
							y2: y + dy
						}).setStroke(taMinorTick);
						if(canLabel && tick.label!=null){
							var label = o.maxLabelCharCount ? this.getTextWithLimitCharCount(tick.label, taFont, o.maxLabelCharCount) : {
								text: tick.label,
								truncated: false
							};
							label = o.maxLabelSize ? this.getTextWithLimitLength(label.text, taFont, o.maxLabelSize, label.truncated) : label;

							var x = x + dx + anchorOffset.x + (rotation ? 0 : labelOffset.x);
							if (fixBidiOffset && labelAlign != "start")
								x = this.getStartOffset(x, label, labelAlign, taFont, o.maxLabelCharCount);

							elem = dc.axis2d.common.createText[labelType](
								this.chart,
								s,
								x,
								y + dy + anchorOffset.y + (rotation ? 0 : labelOffset.y),
								fixBidiOffset ? "start" : labelAlign,
								label.text,
								taFont,
								taFontColor
								//this._cachedLabelWidth
							);
							label.truncated && this.labelTooltip(elem, this.chart, tick.label, label.text, taFont, labelType);
							if(labelType == "html"){
								this.htmlElements.push(elem);
							}else if(rotation){
								elem.setTransform([
									{dx: labelOffset.x, dy: labelOffset.y},
									g.matrix.rotategAt(
										rotation,
										x + dx + anchorOffset.x,
										y + dy + anchorOffset.y
									)
								]);
							}
						}
				}, this);

				dx = tickVector.x * taMicroTick.length;
				dy = tickVector.y * taMicroTick.length;
				
				if(t!=null)
				dojo.forEach(t.micro, function(tick){
					var offset = f(tick.value), elem,
						x = start.x + axisVector.x * offset,
						y = start.y + axisVector.y * offset;
						s.createLine({
							x1: x, y1: y,
							x2: x + dx,
							y2: y + dy
						}).setStroke(taMicroTick);
				}, this);
			}catch(e){
				// squelch
			}

			this.dirty = false;
			return this;	//	concord.chart.lib.axis2d.Default
		},
		labelTooltip: function(elem, chart, label, truncatedLabel, font, elemType){
			// to avoid requiring dijit module for that feature, let's test that
			// dynamically and return if we can't do it
			if(!dijit || !dijit.Tooltip){
				return;
			}
			if(chart.getTextDir(label) == "rtl"){
				label = BidiUtils.RLE + label;
			}
			var aroundRect = {type: "rect"}, position = ["above", "below"],
				fontWidth = this.getTextWidth(truncatedLabel, font);
				fontHeight = font ? g.normalizedLength(font.size) : 0;
			if(elemType == "html"){
				dojo.mixin(aroundRect, dojo.coords(elem.firstChild, true));
				aroundRect.width = Math.ceil(fontWidth);
				aroundRect.height = Math.ceil(fontHeight);
				this._events.push({
					shape:  dojo,
					handle: dojo.connect(elem.firstChild, "onmouseover", this, function(e){
						dijit.showTooltip(this.escapeXml(label), aroundRect, position);
					})
				});
				this._events.push({
					shape:  dojo,
					handle: dojo.connect(elem.firstChild, "onmouseout", this, function(e){
						dijit.hideTooltip(aroundRect);
					})
				});
			}else{
				var getRect = function()
				{
					var shp = elem.getShape(),
					lt = dojo.coords(chart.node, true);
					aroundRect = dojo.mixin(aroundRect, {
						x: shp.x - fontWidth / 2,
						y: shp.y
					});
					aroundRect.x += lt.x;
					aroundRect.y += lt.y;
					aroundRect.x = Math.round(aroundRect.x);
					aroundRect.y = Math.round(aroundRect.y);
					aroundRect.width = Math.ceil(fontWidth);
					aroundRect.height = Math.ceil(fontHeight);
				};
				this._events.push({
					shape:  elem,
					handle: elem.connect("onmouseenter", this, function(e){
						getRect();
						dijit.showTooltip(this.escapeXml(label), aroundRect, position);
						this.tooltipRect = aroundRect;
					})
				});
				this._events.push({
					shape:  elem,
					handle: elem.connect("onmouseleave", this, function(e){
						getRect();
						dijit.hideTooltip(aroundRect);
						this.tooltipRect = null;
					})
				});
			}
		},
		destroy: function()
		{
			this.inherited(arguments);
			if(this.tooltipRect)
				dijit.hideTooltip(this.tooltipRect);
		}
	});
})();
