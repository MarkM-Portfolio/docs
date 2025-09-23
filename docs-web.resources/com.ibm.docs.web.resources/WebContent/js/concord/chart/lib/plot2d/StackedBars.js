dojo.provide("concord.chart.lib.plot2d.StackedBars");

dojo.require("concord.chart.lib.plot2d.common");
dojo.require("concord.chart.lib.plot2d.Bars");

dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.reversed");
dojo.require("dojox.lang.functional.sequence");

(function(){
	var df = dojox.lang.functional, dc = concord.chart.lib.plot2d.common,
		purgeGroup = df.lambda("item.purgeGroup()");

	dojo.declare("concord.chart.lib.plot2d.StackedBars", concord.chart.lib.plot2d.Bars, {
		//	summary:
		//		The plot object representing a stacked bar chart (horizontal bars).
		getSeriesStats: function(){
			//	summary:
			//		Calculate the min/max on all attached series in both directions.
			//	returns: Object
			//		{hmin, hmax, vmin, vmax} min/max in both directions.
			var stats = dc.collectStackedBarStats(this.series), t;
			this._maxRunLength = stats.hmax;
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			t = stats.hmin, stats.hmin = stats.vmin, stats.vmin = t;
			t = stats.hmax, stats.hmax = stats.vmax, stats.vmax = t;
			return stats;
		},
		render: function(dim, offsets){
			//	summary:
			//		Run the calculations for any axes for this plot.
			//	dim: Object
			//		An object in the form of { width, height }
			//	offsets: Object
			//		An object of the form { l, r, t, b}.
			//	returns: concord.chart.lib.plot2d.StackedBars
			//		A reference to this plot for functional chaining.
			if(this._maxRunLength <= 0){
				return this;
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
			var t = this.chart.theme, f, gap, height,
				ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler),
				vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler),
				baseline = Math.max(0, this._hScaler.bounds.lower),
				baselineWidth = ht(baseline),
				events = this.events();
			
			f = dc.calculateBarSize(this._vScaler.bounds.scale, this.opt);
			gap = f.gap;
			height = f.size;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!this.dirty && !run.dirty){
					t.skip();
					this._reconnectEvents(run.name);
					continue;
				}
				run.cleanGroup();
				
				var acc = df.repeat(this._maxRunLength, "-> 0", 0);
				var bacc = new Array(acc.length);
				for(var tt = 0; tt <= i; ++tt){
					var t_run = this.series[tt];
					for(var j = 0; j < t_run.data.length; ++j){
						var value = t_run.data[j];
						if(value != null){
							var v = typeof value == "number" ? value : value.y;
							if(isNaN(v)){ v = 0; }
							if(v>=0)
							{
								if(bacc[j]==null)
									bacc[j] = {p:v};
								else
								{
									if(bacc[j].p==null)
										bacc[j].p = v;
									else
										bacc[j].p += v;
								}
								acc[j] = bacc[j].p;
							}
							else
							{
								if(bacc[j]==null)
									bacc[j] = {n:v};
								else
								{
									if(bacc[j].n==null)
										bacc[j].n = v;
									else
										bacc[j].n += v;
								}
								acc[j] = bacc[j].n;
							}
						}
					}
				}
				
				var theme = t.next("bar", [this.opt, run]), s = run.group,
					eventSeries = new Array(acc.length);
				
				var groupTheme = t.post(theme, "bar");
				var groupFill = this._plotFill(groupTheme.series.fill, dim, offsets);
				s.setFill(groupFill).setStroke(groupTheme.series.stroke);
				run.dyn.fill   = groupFill;
				run.dyn.stroke = groupTheme.series.stroke;
				
				for(var j = 0; j < acc.length; ++j){
					var value = run.data[j];
					if(value != null)
					{
						var curValue = value;
						var	finalTheme = null;
						if(typeof value != "number" && value.color)
						{
							finalTheme = t.addMixin(theme, "bar", value, true);
							curValue = value.y;
						}
						
						var v = acc[j],
						    lastV = v - curValue,
							hv = ht(v),
							lhv = ht(lastV),
							width = hv - lhv,
							w = Math.abs(width);
						
						if(w >= 0 && height >= 1){
							var rect = {
								x: offsets.l  + (v < baseline ? hv : lhv),
								y: dim.height - offsets.b - vt(j + 1.5) + gap,
								width: w, height: height
							};
							var shape = this.createRect(s,rect);
							if(finalTheme!=null)
							{
								var specialFill = this._plotFill(finalTheme.series.fill, dim, offsets);
								specialFill = this._shapeFill(specialFill, rect);
								shape.setFill(specialFill).setStroke(finalTheme.series.stroke);
							}
							if(events){
								var o = {
									element: "bar",
									index:   j,
									run:     run,
									shape:   shape,
									x:       v,
									y:       j + 1.5
								};
								this._connectEvents(o);
								eventSeries[j] = o;
							}
							if(this.animate){
								this._animateBar(shape, offsets.l + baselineWidth, -width);
							}
						}
					}
				}
				this._eventSeries[run.name] = eventSeries;
				run.dirty = false;
			}
			this.dirty = false;
			this.chart.isRightToLeft() && this.chart.applyMirroring(this.group, dim, offsets);
			return this;	//	concord.chart.lib.plot2d.StackedBars
		}
	});
})();
