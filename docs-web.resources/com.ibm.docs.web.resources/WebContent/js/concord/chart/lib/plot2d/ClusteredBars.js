dojo.provide("concord.chart.lib.plot2d.ClusteredBars");

dojo.require("concord.chart.lib.plot2d.common");
dojo.require("concord.chart.lib.plot2d.Bars");

dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.reversed");

(function(){
	var df = dojox.lang.functional, dc = concord.chart.lib.plot2d.common,
		purgeGroup = df.lambda("item.purgeGroup()");

	dojo.declare("concord.chart.lib.plot2d.ClusteredBars", concord.chart.lib.plot2d.Bars, {
		//	summary:
		//		A plot representing grouped or clustered bars (horizontal bars)
		render: function(dim, offsets){
			//	summary:
			//		Run the calculations for any axes for this plot.
			//	dim: Object
			//		An object in the form of { width, height }
			//	offsets: Object
			//		An object of the form { l, r, t, b}.
			//	returns: concord.chart.lib.plot2d.ClusteredBars
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
			var t = this.chart.theme, f, gap, height, thickness,
				ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler),
				vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler),
				baseline = Math.max(0, this._hScaler.bounds.lower),
				baselineWidth = ht(baseline),
				events = this.events();
			f = dc.calculateBarSize(this._vScaler.bounds.scale, this.opt, this.series.length);
			gap = f.gap;
			height = thickness = f.size;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i], shift = thickness * (this.series.length - i - 1);
				if(!this.dirty && !run.dirty){
					t.skip();
					this._reconnectEvents(run.name);
					continue;
				}
				run.cleanGroup();
				var theme = t.next("bar", [this.opt, run]), s = run.group,
					eventSeries = new Array(run.data.length);
				
				var groupTheme = t.post(theme, "bar");
				var groupFill = this._plotFill(groupTheme.series.fill, dim, offsets);
				s.setFill(groupFill).setStroke(groupTheme.series.stroke);
				run.dyn.fill   = groupFill;
				run.dyn.stroke = groupTheme.series.stroke;
				
				for(var j = 0; j < run.data.length; ++j){
					var value = run.data[j];
					if(value != null){
						var v = typeof value == "number" ? value : value.y,
							hv = ht(v),
							width = hv - baselineWidth,
							w = Math.abs(width);
						
						var	finalTheme = null;
						if(typeof value != "number" && value.color)
							finalTheme = t.addMixin(theme, "bar", value, true);
						
						if(w >= 0 && height >= 1){
							var rect = {
								x: offsets.l + (v < baseline ? hv : baselineWidth),
								y: dim.height - offsets.b - vt(j + 1.5) + gap + shift,
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
			return this;	//	concord.chart.lib.plot2d.ClusteredBars
		}
	});
})();
