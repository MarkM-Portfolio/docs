dojo.provide("concord.chart.lib.plot2d.StackedColumns");

dojo.require("concord.chart.lib.plot2d.common");
dojo.require("concord.chart.lib.plot2d.Columns");

dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.reversed");
dojo.require("dojox.lang.functional.sequence");

(function(){
	var df = dojox.lang.functional, dc = concord.chart.lib.plot2d.common,
		purgeGroup = df.lambda("item.purgeGroup()");

	dojo.declare("concord.chart.lib.plot2d.StackedColumns", concord.chart.lib.plot2d.Columns, {
		//	summary:
		//		The plot object representing a stacked column chart (vertical bars).
		getSeriesStats: function(){
			//	summary:
			//		Calculate the min/max on all attached series in both directions.
			//	returns: Object
			//		{hmin, hmax, vmin, vmax} min/max in both directions.
			var stats = dc.collectStackedBarStats(this.series);
			this._maxRunLength = stats.hmax;
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			return stats;
		},
		render: function(dim, offsets){
			//	summary:
			//		Run the calculations for any axes for this plot.
			//	dim: Object
			//		An object in the form of { width, height }
			//	offsets: Object
			//		An object of the form { l, r, t, b}.
			//	returns: concord.chart.lib.plot2d.StackedColumns
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
			var t = this.chart.theme, f, gap, width,
				ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler),
				vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler),
				baseline = Math.max(0, this._vScaler.bounds.lower),
				baselineHeight = vt(baseline),
				events = this.events();
			f = dc.calculateBarSize(this._hScaler.bounds.scale, this.opt);
			gap = f.gap;
			width = f.size;
			for(var i = this.series.length - 1; i >= 0; --i)
			{
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
				
				var theme = t.next("column", [this.opt, run]), s = run.group,
					eventSeries = new Array(acc.length);
				
				
				var groupTheme = t.post(theme, "column");
				var groupFill = this._plotFill(groupTheme.series.fill, dim, offsets);
				s.setFill(groupFill).setStroke(groupTheme.series.stroke);
				run.dyn.fill   = groupFill;
				run.dyn.stroke = groupTheme.series.stroke;
				
				for(var j = 0; j < acc.length; ++j)
				{
					var value = run.data[j];
					if(value != null)
					{
						var curValue = value;
						var	finalTheme = null;
						if(typeof value != "number" && value.color)
						{
							finalTheme = t.addMixin(theme, "column", value, true);
							curValue = value.y;
						}
						
						var v = acc[j],
						    lastV = v - curValue;
							vv = vt(v),
							lvv = vt(lastV),
							height = vv - lvv,
							h = Math.abs(height);
							
						if(width >= 1 && h >= 0){
							var rect = {
								x: offsets.l + ht(j + 0.5) + gap,
								y: dim.height - offsets.b - (v > baseline ? vv : lvv),
								width: width, height: h
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
									element: "column",
									index:   j,
									run:     run,
									shape:   shape,
									x:       j + 0.5,
									y:       v
								};
								this._connectEvents(o);
								eventSeries[j] = o;
							}
							if(this.animate){
								this._animateColumn(shape, dim.height - offsets.b - baselineHeight, h);
							}
						}
					}
				}
				this._eventSeries[run.name] = eventSeries;
				run.dirty = false;
			}
			this.dirty = false;
			this.chart.isRightToLeft() && this.chart.applyMirroring(this.group, dim, offsets);
			return this;	//	concord.chart.lib.plot2d.StackedColumns
		}
	});
})();
