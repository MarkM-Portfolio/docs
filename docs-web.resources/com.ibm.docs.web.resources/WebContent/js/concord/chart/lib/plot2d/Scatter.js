dojo.provide("concord.chart.lib.plot2d.Scatter");

dojo.require("concord.chart.lib.plot2d.common");
dojo.require("concord.chart.lib.plot2d.Base");

dojo.require("dojox.lang.utils");
dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.reversed");

dojo.require("dojox.gfx.gradutils");


(function(){
	var df = dojox.lang.functional, du = dojox.lang.utils,
		dc = concord.chart.lib.plot2d.common,
		purgeGroup = df.lambda("item.purgeGroup()");

	dojo.declare("concord.chart.lib.plot2d.Scatter", concord.chart.lib.plot2d.Base, {
		//	summary:
		//		A plot object representing a typical scatter chart.
		defaultParams: {
			hAxis: "x",		// use a horizontal axis named "x"
			vAxis: "y",		// use a vertical axis named "y"
			shadows: null,	// draw shadows
			animate: null	// animate chart to place
		},
		optionalParams: {
			// theme component
			markerStroke:		{},
			markerOutline:		{},
			markerShadow:		{},
			markerFill:			{},
			markerFont:			"",
			markerFontColor:	""
		},

		constructor: function(chart, kwArgs){
			//	summary:
			//		Create the scatter plot.
			//	chart: concord.chart.lib.Chart2D
			//		The chart this plot belongs to.
			//	kwArgs: concord.chart.lib.plot2d.__DefaultCtorArgs?
			//		An optional keyword arguments object to help define this plot's parameters.
			this.opt = dojo.clone(this.defaultParams);
            du.updateWithObject(this.opt, kwArgs);
            du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.animate = this.opt.animate;
		},

		render: function(dim, offsets){
			//	summary:
			//		Run the calculations for any axes for this plot.
			//	dim: Object
			//		An object in the form of { width, height }
			//	offsets: Object
			//		An object of the form { l, r, t, b}.
			//	returns: concord.chart.lib.plot2d.Scatter
			//		A reference to this plot for functional chaining.
			if(this.zoom && !this.isDataDirty()){
				return this.performZoom(dim, offsets);
			}
			this.resetEvents();
			this.dirty = this.isDirty();
			if(this.dirty){
				dojo.forEach(this.series, purgeGroup);
				this._eventSeries = {};
				this.cleanGroup();
				var s = this.group;
				df.forEachRev(this.series, function(item){ item.cleanGroup(s); });
			}
			var t = this.chart.theme, events = this.events();
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				//if no marker, this series need not be rendered
				if(run.markers==0)
					continue;
				if(!this.dirty && !run.dirty){
					t.skip();
					this._reconnectEvents(run.name);
					continue;
				}
				run.cleanGroup();
				if(!run.data.length){
					run.dirty = false;
					t.skip();
					continue;
				}

				var theme = t.next("marker", [this.opt, run]), s = run.group, lpoly,
					ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler),
					vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler);
				
				
				if(typeof run.data[0] == "number"){
					lpoly = dojo.map(run.data, function(v, i){
						return {
							x: ht(i + 1) + offsets.l,
							y: dim.height - offsets.b - vt(v)
						};
					}, this);
				}else{
					lpoly = dojo.map(run.data, function(v, i){
						if(v==null) return null;
						return {
							x: ht(v.x) + offsets.l,
							y: dim.height - offsets.b - vt(v.y)
						};
					}, this);
				}

				var shadowMarkers  = new Array(lpoly.length),
					frontMarkers   = new Array(lpoly.length),
					outlineMarkers = new Array(lpoly.length);

				var finalTheme = t.post(theme, "marker");
				
				var stroke = dc.makeStroke(finalTheme.marker.stroke),
				    fill = this._plotFill(finalTheme.marker.fill, dim, offsets);
			    if(fill && (fill.type === "linear" || fill.type == "radial"))
			    {
					var color = dojox.gfx.gradutils.getColor(fill, {x: c.x, y: c.y});
					if(stroke){
						stroke.color = color;
					}
					s.setStroke(stroke).setFill(color);
					run.dyn.color = color;
			    }
			    else{
				   s.setStroke(stroke).setFill(fill);
				   run.dyn.color = fill;
			    }
			    
			    run.dyn.marker = finalTheme.symbol;
			    
				dojo.forEach(lpoly, function(c, i){
					if(c==null)
						return;
					var path = "M" + c.x + " " + c.y + " " + finalTheme.symbol;
					if(finalTheme.marker.shadow){
						shadowMarkers[i] = s.createPath("M" + (c.x + finalTheme.marker.shadow.dx) + " " +
							(c.y + finalTheme.marker.shadow.dy) + " " + finalTheme.symbol).
							setStroke(finalTheme.marker.shadow).setFill(finalTheme.marker.shadow.color);
						if(this.animate){
							this._animateScatter(shadowMarkers[i], dim.height - offsets.b);
						}
					}
					if(finalTheme.marker.outline){
//						var outline = dc.makeStroke(finalTheme.marker.outline);
//						outline.width = 2 * outline.width;
//						if(finalTheme.marker.stroke!=null)
//							outline.width += finalTheme.marker.stroke.width;
//						outlineMarkers[i] = s.createPath(path).setStroke(outline);
//						if(this.animate){
//							this._animateScatter(outlineMarkers[i], dim.height - offsets.b);
//						}
					}
					frontMarkers[i] = this.createPath(s, path);
					if(this.animate){
						this._animateScatter(frontMarkers[i], dim.height - offsets.b);
					}
				}, this);

				if(events){
					var eventSeries = new Array(frontMarkers.length);
					dojo.forEach(frontMarkers, function(s, i){
						if(lpoly[i]==null)
							return;
						var o = {
							element: "marker",
							index:   i,
							run:     run,
							shape:   s,
							outline: outlineMarkers && outlineMarkers[i] || null,
							shadow:  shadowMarkers && shadowMarkers[i] || null,
							cx:      lpoly[i].x,
							cy:      lpoly[i].y
						};
						if(typeof run.data[0] == "number"){
							o.x = i + 1;
							o.y = run.data[i];
						}else{
							o.x = run.data[i].x;
							o.y = run.data[i].y;
						}
						this._connectEvents(o);
						eventSeries[i] = o;
					}, this);
					this._eventSeries[run.name] = eventSeries;
				}else{
					delete this._eventSeries[run.name];
				}
				run.dirty = false;
			}
			this.dirty = false;
			this.chart.isRightToLeft() && this.chart.applyMirroring(this.group, dim, offsets);
			return this;	//	concord.chart.lib.plot2d.Scatter
		},
		_animateScatter: function(shape, offset){
			dojox.gfx.fx.animateTransform(dojo.delegate({
				shape: shape,
				duration: 1200,
				transform: [
					{name: "translate", start: [0, offset], end: [0, 0]},
					{name: "scale", start: [0, 0], end: [1, 1]},
					{name: "original"}
				]
			}, this.animate)).play();
		}
	});
})();
