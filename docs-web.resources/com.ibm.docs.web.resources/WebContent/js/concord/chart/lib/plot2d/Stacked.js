dojo.provide("concord.chart.lib.plot2d.Stacked");

dojo.require("concord.chart.lib.plot2d.common");
dojo.require("concord.chart.lib.plot2d.Default");

dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.sequence");
dojo.require("dojox.lang.functional.reversed");

(function(){
	var df = dojox.lang.functional, dc = concord.chart.lib.plot2d.common,
		purgeGroup = df.lambda("item.purgeGroup()");

	dojo.declare("concord.chart.lib.plot2d.Stacked", concord.chart.lib.plot2d.Default, {
		//	summary:
		//		Like the default plot, Stacked sets up lines, areas and markers
		//		in a stacked fashion (values on the y axis added to each other)
		//		as opposed to a direct one.
		getSeriesStats: function(){
			//	summary:
			//		Calculate the min/max on all attached series in both directions.
			//	returns: Object
			//		{hmin, hmax, vmin, vmax} min/max in both directions.
			var stats = dc.collectStackedStats(this.series);
			this._maxRunLength = stats.hmax;
			return stats;
		},
		render: function(dim, offsets){
			//	summary:
			//		Run the calculations for any axes for this plot.
			//	dim: Object
			//		An object in the form of { width, height }
			//	offsets: Object
			//		An object of the form { l, r, t, b}.
			//	returns: concord.chart.lib.plot2d.Stacked
			//		A reference to this plot for functional chaining.
			if(this._maxRunLength <= 0){
				return this;
			}

			// stack all values
			var acc = df.repeat(this._maxRunLength, "-> 0", 0);
			for(var i = 0; i < this.series.length; ++i){
				var run = this.series[i];
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(v !== null){
						if(isNaN(v)){ v = 0; }
						acc[j] += v;
					}
				}
			}
			// draw runs in backwards
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

			var t = this.chart.theme, events = this.events(),
				ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler),
				vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler),
				baseline = Math.max(0, this._vScaler.bounds.lower),
				baselineHeight = vt(baseline);

			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!this.dirty && !run.dirty){
					t.skip();
					this._reconnectEvents(run.name);
					// update the accumulator
					for(var j = 0; j < run.data.length; ++j){
						var v = run.data[j];
						if(v !== null){
							if(isNaN(v)){ v = 0; }
							acc[j] -= v;
						}
					}
					continue;
				}
				run.cleanGroup();
				var theme = t.next(this.opt.areas ? "area" : "line", [this.opt, run], true),
					s = run.group, outline,
					lpoly = dojo.map(acc, function(v, i){
						return {
							x: ht(i + 1) + offsets.l,
							y: dim.height - offsets.b - vt(v)
						};
					}, this);

				
				var markers = run.markers==null ? this.opt.markers : run.markers;
				var tension = run.smooth==null ? this.opt.tension : (run.smooth==1 ? "S" : "");
				
				var lines = this.opt.lines;
				var lpath = tension ? dc.curve(lpoly, tension) : "";

				if(this.opt.areas){
					var apoly = dojo.clone(lpoly);
					if(tension){
						var p=dc.curve(apoly, tension);
						p += " L" + lpoly[lpoly.length - 1].x + "," + (dim.height - offsets.b) +
							" L" + lpoly[0].x + "," + (dim.height - offsets.b) +
							" L" + lpoly[0].x + "," + lpoly[0].y;
						run.dyn.fill = s.createPath(p).setFill(theme.series.fill).getFill();
					} else {
						apoly.push({x: lpoly[lpoly.length - 1].x, y: dim.height - offsets.b - baselineHeight});
						apoly.push({x: lpoly[0].x, y: dim.height - offsets.b - baselineHeight});
						apoly.push(lpoly[0]);
						run.dyn.fill = s.createPolyline(apoly).setFill(theme.series.fill).getFill();
					}
				}
				if(lines || markers){
					if(theme.series.outline){
						outline = dc.makeStroke(theme.series.outline);
						outline.width = 2 * outline.width ;
						if(theme.series.stroke!=null)
							outline.width += theme.series.stroke.width;
					}
				}
				
				var frontMarkers, outlineMarkers, shadowMarkers;
				if(theme.series.shadow && theme.series.stroke){
					var shadow = theme.series.shadow,
						spoly = dojo.map(lpoly, function(c){
							return {x: c.x + shadow.dx, y: c.y + shadow.dy};
						});
					if(lines){
						if(tension){
							run.dyn.shadow = s.createPath(dc.curve(spoly, tension)).setStroke(shadow).getStroke();
						} else {
							run.dyn.shadow = s.createPolyline(spoly).setStroke(shadow).getStroke();
						}
					}
					if(markers){
						shadow = theme.marker.shadow;
						shadowMarkers = dojo.map(spoly, function(c){
							return s.createPath("M" + c.x + " " + c.y + " " + theme.symbol).
								setStroke(shadow).setFill(shadow.color);
						}, this);
					}
				}
				if(lines){
//					if(outline){
//						if(tension){
//							run.dyn.outline = s.createPath(lpath).setStroke(outline).getStroke();
//						} else {
//							run.dyn.outline = s.createPolyline(lpoly).setStroke(outline).getStroke();
//						}
//					}
					if(theme.series.stroke!=null)
					{
						if(tension){
							run.dyn.stroke = s.createPath(lpath).setStroke(theme.series.stroke).getStroke();
						} else {
							run.dyn.stroke = s.createPolyline(lpoly).setStroke(theme.series.stroke).getStroke();
						}
					}
					else
						run.dyn.stroke = null;
					
					run.dyn.markerFill = theme.marker.fill;
				}
				var mfill = theme.marker.fill;
				if(markers && mfill){
					frontMarkers = new Array(lpoly.length);
					outlineMarkers = new Array(lpoly.length);
					outline = null;
					if(theme.marker.outline){
						outline = dc.makeStroke(theme.marker.outline);
						outline.width = 2 * outline.width + (theme.marker.stroke ? theme.marker.stroke.width : 0);
					}
					var ms = s.createGroup();
					ms.setFill(mfill).setStroke({color:mfill, width: 1});
					run.dyn.marker = theme.symbol;
					dojo.forEach(lpoly, function(c, i){
						var path = "M" + c.x + " " + c.y + " " + theme.symbol;
						if(outline){
							//outlineMarkers[i] = s.createPath(path).setStroke(outline);
						}
						frontMarkers[i] = this.createPath(ms, path);
					}, this);
					if(events){
						var eventSeries = new Array(frontMarkers.length);
						dojo.forEach(frontMarkers, function(s, i){
							var o = {
								element: "marker",
								index:   i,
								run:     run,
								shape:   s,
								outline: outlineMarkers[i] || null,
								shadow:  shadowMarkers && shadowMarkers[i] || null,
								cx:      lpoly[i].x,
								cy:      lpoly[i].y,
								x:       i + 1,
								y:       run.data[i]
							};
							this._connectEvents(o);
							eventSeries[i] = o;
						}, this);
						this._eventSeries[run.name] = eventSeries;
					}else{
						delete this._eventSeries[run.name];
					}
				}
				else
				{
					run.dyn.marker = null;
				}
				run.dirty = false;
				// update the accumulator
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(v !== null){
						if(isNaN(v)){ v = 0; }
						acc[j] -= v;
					}
				}
			}
			this.dirty = false;
			this.chart.isRightToLeft() && this.chart.applyMirroring(this.group, dim, offsets);
			return this;	//	concord.chart.lib.plot2d.Stacked
		}
	});
})();
