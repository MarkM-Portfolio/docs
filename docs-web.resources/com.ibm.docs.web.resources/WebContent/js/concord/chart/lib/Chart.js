dojo.provide("concord.chart.lib.Chart");

dojo.require("dojox.gfx");
dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.fold");
dojo.require("dojox.lang.functional.reversed");

dojo.require("concord.chart.lib.Element");
dojo.require("concord.chart.lib.Theme");
dojo.require("concord.chart.lib.Series");
dojo.require("concord.chart.lib.Legend");
dojo.require("concord.chart.lib.axis2d.common");

/*=====
concord.chart.lib.__ChartCtorArgs = function(margins, stroke, fill, delayInMs){
	//	summary:
	//		The keyword arguments that can be passed in a Chart constructor.
	//
	//	margins: Object?
	//		Optional margins for the chart, in the form of { l, t, r, b}.
	//	stroke: dojox.gfx.Stroke?
	//		An optional outline/stroke for the chart.
	//	fill: dojox.gfx.Fill?
	//		An optional fill for the chart.
	//	delayInMs: Number
	//		Delay in ms for delayedRender(). Default: 200.
	this.margins = margins;
	this.stroke = stroke;
	this.fill = fill;
	this.delayInMs = delayInMs;
}
 =====*/
(function(){
	var df = dojox.lang.functional, dc = concord.chart.lib, g = dojox.gfx,
		clear = df.lambda("item.clear()"),
		purge = df.lambda("item.purgeGroup()"),
		destroy = df.lambda("item.destroy()"),
		makeClean = df.lambda("item.dirty = false"),
		makeDirty = df.lambda("item.dirty = true"),
		getName = df.lambda("item.name");

	dojo.declare("concord.chart.lib.Chart", null, {
		//	summary:
		//		The main chart object in concord.chart.lib.  This will create a two dimensional
		//		chart based on dojox.gfx.
		//
		//	description:
		//		concord.chart.lib.Chart is the primary object used for any kind of charts.  It
		//		is simple to create--just pass it a node reference, which is used as the
		//		container for the chart--and a set of optional keyword arguments and go.
		//
		//		Note that like most of dojox.gfx, most of concord.chart.lib.Chart's methods are
		//		designed to return a reference to the chart itself, to allow for functional
		//		chaining.  This makes defining everything on a Chart very easy to do.
		//
		//	example:
		//		Create an area chart, with smoothing.
		//	|	new concord.chart.lib.Chart(node))
		//	|		.addPlot("default", { type: "Areas", tension: "X" })
		//	|		.setTheme(concord.chart.lib.themes.Shrooms)
		//	|		.addSeries("Series A", [1, 2, 0.5, 1.5, 1, 2.8, 0.4])
		//	|		.addSeries("Series B", [2.6, 1.8, 2, 1, 1.4, 0.7, 2])
		//	|		.addSeries("Series C", [6.3, 1.8, 3, 0.5, 4.4, 2.7, 2])
		//	|		.render();
		//
		//	example:
		//		The form of data in a data series can take a number of forms: a simple array,
		//		an array of objects {x,y}, or something custom (as determined by the plot).
		//		Here's an example of a Candlestick chart, which expects an object of
		//		{ open, high, low, close }.
		//	|	new concord.chart.lib.Chart(node))
		//	|		.addPlot("default", {type: "Candlesticks", gap: 1})
		//	|		.addAxis("x", {fixLower: "major", fixUpper: "major", includeZero: true})
		//	|		.addAxis("y", {vertical: true, fixLower: "major", fixUpper: "major", natural: true})
		//	|		.addSeries("Series A", [
		//	|				{ open: 20, close: 16, high: 22, low: 8 },
		//	|				{ open: 16, close: 22, high: 26, low: 6, mid: 18 },
		//	|				{ open: 22, close: 18, high: 22, low: 11, mid: 21 },
		//	|				{ open: 18, close: 29, high: 32, low: 14, mid: 27 },
		//	|				{ open: 29, close: 24, high: 29, low: 13, mid: 27 },
		//	|				{ open: 24, close: 8, high: 24, low: 5 },
		//	|				{ open: 8, close: 16, high: 22, low: 2 },
		//	|				{ open: 16, close: 12, high: 19, low: 7 },
		//	|				{ open: 12, close: 20, high: 22, low: 8 },
		//	|				{ open: 20, close: 16, high: 22, low: 8 },
		//	|				{ open: 16, close: 22, high: 26, low: 6, mid: 18 },
		//	|				{ open: 22, close: 18, high: 22, low: 11, mid: 21 },
		//	|				{ open: 18, close: 29, high: 32, low: 14, mid: 27 },
		//	|				{ open: 29, close: 24, high: 29, low: 13, mid: 27 },
		//	|				{ open: 24, close: 8, high: 24, low: 5 },
		//	|				{ open: 8, close: 16, high: 22, low: 2 },
		//	|				{ open: 16, close: 12, high: 19, low: 7 },
		//	|				{ open: 12, close: 20, high: 22, low: 8 },
		//	|				{ open: 20, close: 16, high: 22, low: 8 },
		//	|				{ open: 16, close: 22, high: 26, low: 6 },
		//	|				{ open: 22, close: 18, high: 22, low: 11 },
		//	|				{ open: 18, close: 29, high: 32, low: 14 },
		//	|				{ open: 29, close: 24, high: 29, low: 13 },
		//	|				{ open: 24, close: 8, high: 24, low: 5 },
		//	|				{ open: 8, close: 16, high: 22, low: 2 },
		//	|				{ open: 16, close: 12, high: 19, low: 7 },
		//	|				{ open: 12, close: 20, high: 22, low: 8 },
		//	|				{ open: 20, close: 16, high: 22, low: 8 }
		//	|			],
		//	|			{ stroke: { color: "green" }, fill: "lightgreen" }
		//	|		)
		//	|		.render();
		//
		//	theme: concord.chart.lib.Theme?
		//		An optional theme to use for styling the chart.
		//	axes: concord.chart.lib.Axis{}?
		//		A map of axes for use in plotting a chart.
		//	stack: concord.chart.lib.plot2d.Base[]
		//		A stack of plotters.
		//	plots: concord.chart.lib.plot2d.Base{}
		//		A map of plotter indices
		//	series: concord.chart.lib.Series[]
		//		The stack of data runs used to create plots.
		//	runs: concord.chart.lib.Series{}
		//		A map of series indices
		//	margins: Object?
		//		The margins around the chart. Default is { l:10, t:10, r:10, b:10 }.
		//	stroke: dojox.gfx.Stroke?
		//		The outline of the chart (stroke in vector graphics terms).
		//	fill: dojox.gfx.Fill?
		//		The color for the chart.
		//	node: DOMNode
		//		The container node passed to the constructor.
		//	surface: dojox.gfx.Surface
		//		The main graphics surface upon which a chart is drawn.
		//	dirty: Boolean
		//		A boolean flag indicating whether or not the chart needs to be updated/re-rendered.
		//	coords: Object
		//		The coordinates on a page of the containing node, as returned from dojo.coords.

		// textDir: String Responsible for text direction.
		//		Allowed values:
		//		1. "ltr"
		//		2. "rtl"
		//		3. "auto" - contextual the direction of a text defined by first strong character.
		textDir:"",
		
		// dir: String  Responsible for the chart mirroring.
		//		Allowed values:
		//		1. "ltr"
		//		2. "rtl"
		dir: "ltr",

		// isDirChanged: String  switched on when 'dir' attribute gets changed.
		isDirChanged: false,

		constructor: function(/* DOMNode */node, /* concord.chart.lib.__ChartCtorArgs? */kwArgs){
			//	summary:
			//		The constructor for a new Chart.  Initializes all parameters used for a chart.
			//	returns: concord.chart.lib.Chart
			//		The newly created chart.

			// initialize parameters
			if(!kwArgs){ kwArgs = {}; }
			this.margins   = kwArgs.margins ? kwArgs.margins : {l: 10, t: 5, r: 10, b: 5};
			this.stroke    = kwArgs.stroke;
			this.fill      = kwArgs.fill;
			this.font      = kwArgs.font;
			this.fontColor = kwArgs.fontColor;
			this.plotarea  = kwArgs.plotarea || {};
			this.delayInMs = kwArgs.delayInMs || 200;
			this.title     = kwArgs.title;
			this.titleGap  = kwArgs.titleGap;
			this.titlePos  = kwArgs.titlePos;
			this.titleFont = kwArgs.titleFont;
			this.titleFontColor = kwArgs.titleFontColor;
			this.accDesc   = kwArgs.accDesc;
			this.chartTitle = null;

			// default initialization
			this.theme = null;
			this.axes = {};		// map of axes
			this.stack = [];	// stack of plotters
			this.plots = {};	// map of plotter indices
			this.series = [];	// stack of data runs
			this.runs = {};		// map of data run indices
			this.dirty = true;
			this.coords = null;

			// create a surface
			this.node = dojo.byId(node);
			var box = dojo.marginBox(node);
			this.surface = g.createSurface(this.node, box.w || 400, box.h || 300);
		},
		destroy: function(){
			//	summary:
			//		Cleanup when a chart is to be destroyed.
			//	returns: void
			dojo.forEach(this.series, destroy);
			dojo.forEach(this.stack,  destroy);
			df.forIn(this.axes, destroy);
            if(this.chartTitle && this.chartTitle.tagName){
                // destroy title if it is a DOM node
			    dojo.destroy(this.chartTitle);
            }
			this.surface.destroy();
		},

		getTextDir: function(text){
			// summary:
			//		Return direction of the text. 
			// description:
			//		If textDir is ltr or rtl returns the value.
			//		If it's auto, calls to another function that responsible 
			//		for checking the value, and defining the direction.			
			// text:
			//		Used in case textDir is "auto", this case the direction is according to the first
			//		strong (directionally - which direction is strong defined) letter.
			// tags:
			//		protected.
			return (this.textDir == "auto" ? this._checkContextual(text) : this.textDir);
		},

		_checkContextual: function(text){
			// summary:
			//		Finds the first strong (directional) character, return ltr if isLatin
			//		or rtl if isBidiChar.
			// tags:
			//		private.
			var fdc = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(text);
			return fdc ? ( fdc[0] <= 'z' ? "ltr" : "rtl" ) : this.dir ? this.dir : "ltr";

		},

		postscript: function(node,args){
			// summary:
			//		Kicks off chart instantiation.
			// description:
			//		Used for setting the textDir of the chart. 
			// tags:
			//		private
			if(args && args["textDir"])
				this.setTextDir(args["textDir"]);
			if(args && args["dir"])
				this.setDir(args["dir"]);
		},

		setTextDir: function(newTextDir){
			// summary:
			//		Setter for the textDir attribute.
			// description:
			//		Allows dynamically set the textDir, goes over all the text-children and  
			//		updates their base text direction.
			// tags:
			//		public
			if(newTextDir != this.textDir){
				this.textDir = newTextDir;
				//////!this.surface.setTextDir && dojo.require("dojox.gfx._gfxBidiSupport");
				!this.surface.setTextDir && dojo["require"]("dojox.gfx._gfxBidiSupport");
				
				// set automatically all the gfx objects that were created by this surface
				// (groups, text objects)
				this.surface.setTextDir(newTextDir);
			}
		},
		
		setDir: function(dir){
			// summary:
			//		Setter for the dir attribute.
			// description:
			//	Allows dynamic setting of dir attribute
			//	dir : the desired chart direction [rtl: for right to left ,ltr: for left to right]
			if(this.dir != dir){
				this.dirty = true;
				this.dir = dir;
				this.isDirChanged = true;
			}
		},
		
		isRightToLeft: function(){
			// summary:
			//		checks chart direction.
			// description:
			//		check the dir attribute to determine whether chart is mirrored
			//		of the chart.
			return this.dir == "rtl";
	        },

		_reverseMatrix: function(plot, dim, offsets){
				//summary:
				//	reverse the underlying matrix of the plots to perform the mirroring behavior.
				//plot:
				//  the plot which has the matrix to be reversed.
				//dim:
				//  the dimension (width,height) of the chart.
				//offsets:
				//  the offsets of the chart
				var shift = offsets.l - offsets.r;
				var xx = -1;
				var xy = 0;
				var yx = 0;
				var yy = 1;
				var dx = dim.width + shift;
				var dy = 0;
				if(plot.matrix){
					xx = xx * Math.abs(plot.matrix.xx);
					yy = plot.matrix.yy;
					xy = plot.matrix.xy;
					yx = plot.matrix.yx;
					dy = plot.matrix.xy;
				}
				plot.setTransform({xx: xx, xy: xy, yx: yx, yy: yy, dx: dx, dy: dy});
	 	},

		applyMirroring: function(plot, dim, offsets){
			// summary:
			//		apply the mirroring operation to the current chart plot.
			//
			this._reverseMatrix(plot, dim, offsets);
				//force the direction of the node to be ltr to properly render the axes and the plots labels.
			dojo.setStyle(this.node, "direction", "ltr");
		},

		getCoords: function(){
			//	summary:
			//		Get the coordinates and dimensions of the containing DOMNode, as
			//		returned by dojo.coords.
			//	returns: Object
			//		The resulting coordinates of the chart.  See dojo.coords for details.
			if(!this.coords){
				this.coords = dojo.coords(this.node, true);
			}
			return this.coords;	//	Object
		},
		setTheme: function(theme){
			//	summary:
			//		Set a theme of the chart.
			//	theme: concord.chart.lib.Theme
			//		The theme to be used for visual rendering.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			this.theme = theme.clone();
			this.dirty = true;
			return this;	//	concord.chart.lib.Chart
		},
		addAxis: function(name, kwArgs){
			//	summary:
			//		Add an axis to the chart, for rendering.
			//	name: String
			//		The name of the axis.
			//	kwArgs: concord.chart.lib.axis2d.__AxisCtorArgs?
			//		An optional keyword arguments object for use in defining details of an axis.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
            var axis, axisType = kwArgs && kwArgs.type || "Default";
            if(typeof axisType == "string"){
                if(!dc.axis2d || !dc.axis2d[axisType]){
                    throw Error("Can't find axis: " + axisType + " - didn't you forget to dojo" + ".require() it?");
                }
                axis = new dc.axis2d[axisType](this, kwArgs);
            }else{
                axis = new axisType(this, kwArgs);
            }
			axis.name = name;
			axis.dirty = true;
			if(name in this.axes){
				this.axes[name].destroy();
			}
			this.axes[name] = axis;
			this.dirty = true;
			return this;	//	concord.chart.lib.Chart
		},
		getAxis: function(name){
			//	summary:
			//		Get the given axis, by name.
			//	name: String
			//		The name the axis was defined by.
			//	returns: concord.chart.lib.axis2d.Default
			//		The axis as stored in the chart's axis map.
			return this.axes[name];	//	concord.chart.lib.axis2d.Default
		},
		removeAxis: function(name){
			//	summary:
			//		Remove the axis that was defined using name.
			//	name: String
			//		The axis name, as defined in addAxis.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.axes){
				// destroy the axis
				this.axes[name].destroy();
				delete this.axes[name];
				// mark the chart as dirty
				this.dirty = true;
			}
			return this;	//	concord.chart.lib.Chart
		},
		addPlot: function(name, kwArgs){
			//	summary:
			//		Add a new plot to the chart, defined by name and using the optional keyword arguments object.
			//		Note that concord.chart.lib assumes the main plot to be called "default"; if you do not have
			//		a plot called "default" and attempt to add data series to the chart without specifying the
			//		plot to be rendered on, you WILL get errors.
			//	name: String
			//		The name of the plot to be added to the chart.  If you only plan on using one plot, call it "default".
			//	kwArgs: concord.chart.lib.plot2d.__PlotCtorArgs
			//		An object with optional parameters for the plot in question.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			var plot, plotType = kwArgs && kwArgs.type || "Default";
            if(typeof plotType == "string"){
                if(!dc.plot2d || !dc.plot2d[plotType]){
                    throw Error("Can't find plot: " + plotType + " - didn't you forget to dojo" + ".require() it?");
                }
                plot = new dc.plot2d[plotType](this, kwArgs);
            }else{
                plot = new plotType(this, kwArgs);
            }
			plot.name = name;
			plot.dirty = true;
			if(name in this.plots){
				this.stack[this.plots[name]].destroy();
				this.stack[this.plots[name]] = plot;
			}else{
				this.plots[name] = this.stack.length;
				this.stack.push(plot);
				//grid plot should always lie on bottom
				if(name=="grid")
					this.movePlotToFront("grid");
			}
			this.dirty = true;
			return this;	//	concord.chart.lib.Chart
		},
		removePlot: function(name){
			//	summary:
			//		Remove the plot defined using name from the chart's plot stack.
			//	name: String
			//		The name of the plot as defined using addPlot.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.plots){
				// get the index and remove the name
				var index = this.plots[name];
				delete this.plots[name];
				// destroy the plot
				this.stack[index].destroy();
				// remove the plot from the stack
				this.stack.splice(index, 1);
				// update indices to reflect the shift
				df.forIn(this.plots, function(idx, name, plots){
					if(idx > index){
						plots[name] = idx - 1;
					}
				});
                // remove all related series
                var ns = dojo.filter(this.series, function(run){ return run.plot != name; });
                if(ns.length < this.series.length){
                    // kill all removed series
                    dojo.forEach(this.series, function(run){
                        if(run.plot == name){
                            run.destroy();
                        }
                    });
                    // rebuild all necessary data structures
                    this.runs = {};
                    dojo.forEach(ns, function(run, index){
                        this.runs[run.plot] = index;
                    }, this);
                    this.series = ns;
                }
				// mark the chart as dirty
				this.dirty = true;
			}
			return this;	//	concord.chart.lib.Chart
		},
		getPlotOrder: function(){
			//	summary:
			//		Returns an array of plot names in the current order
			//		(the top-most plot is the first).
			//	returns: Array
			return df.map(this.stack, getName); // Array
		},
		setPlotOrder: function(newOrder){
			//	summary:
			//		Sets new order of plots. newOrder cannot add or remove
			//		plots. Wrong names, or dups are ignored.
			//	newOrder: Array:
			//		Array of plot names compatible with getPlotOrder().
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			var names = {},
				order = df.filter(newOrder, function(name){
					if(!(name in this.plots) || (name in names)){
						return false;
					}
					names[name] = 1;
					return true;
				}, this);
			if(order.length < this.stack.length){
				df.forEach(this.stack, function(plot){
					var name = plot.name;
					if(!(name in names)){
						order.push(name);
					}
				});
			}
			var newStack = df.map(order, function(name){
					return this.stack[this.plots[name]];
				}, this);
			df.forEach(newStack, function(plot, i){
				this.plots[plot.name] = i;
			}, this);
			this.stack = newStack;
			this.dirty = true;
			return this;	//	concord.chart.lib.Chart
		},
		movePlotToFront: function(name){
			//	summary:
			//		Moves a given plot to front.
			//	name: String:
			//		Plot's name to move.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.plots){
				var index = this.plots[name];
				if(index){
					var newOrder = this.getPlotOrder();
					newOrder.splice(index, 1);
					newOrder.unshift(name);
					return this.setPlotOrder(newOrder);	//	concord.chart.lib.Chart
				}
			}
			return this;	//	concord.chart.lib.Chart
		},
		movePlotToBack: function(name){
			//	summary:
			//		Moves a given plot to back.
			//	name: String:
			//		Plot's name to move.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.plots){
				var index = this.plots[name];
				if(index < this.stack.length - 1){
					var newOrder = this.getPlotOrder();
					newOrder.splice(index, 1);
					newOrder.push(name);
					return this.setPlotOrder(newOrder);	//	concord.chart.lib.Chart
				}
			}
			return this;	//	concord.chart.lib.Chart
		},
		addSeries: function(name, data, kwArgs){
			//	summary:
			//		Add a data series to the chart for rendering.
			//	name: String:
			//		The name of the data series to be plotted.
			//	data: Array|Object:
			//		The array of data points (either numbers or objects) that
			//		represents the data to be drawn. Or it can be an object. In
			//		the latter case, it should have a property "data" (an array),
			//		destroy(), and setSeriesObject().
			//	kwArgs: concord.chart.lib.__SeriesCtorArgs?:
			//		An optional keyword arguments object that will be mixed into
			//		the resultant series object.
			//	returns: concord.chart.lib.Chart:
			//		A reference to the current chart for functional chaining.
			var run = new dc.Series(this, data, kwArgs);
			run.name = name;
			if(name in this.runs){
				this.series[this.runs[name]].destroy();
				this.series[this.runs[name]] = run;
			}else{
				this.runs[name] = this.series.length;
				this.series.push(run);
			}
			this.dirty = true;
			// fix min/max
			if(!("ymin" in run) && "min" in run){ run.ymin = run.min; }
			if(!("ymax" in run) && "max" in run){ run.ymax = run.max; }
			return this;	//	concord.chart.lib.Chart
		},
		removeSeries: function(name){
			//	summary:
			//		Remove the series defined by name from the chart.
			//	name: String
			//		The name of the series as defined by addSeries.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.runs){
				// get the index and remove the name
				var index = this.runs[name];
				delete this.runs[name];
				// destroy the run
				this.series[index].destroy();
				// remove the run from the stack of series
				this.series.splice(index, 1);
				// update indices to reflect the shift
				df.forIn(this.runs, function(idx, name, runs){
					if(idx > index){
						runs[name] = idx - 1;
					}
				});
				this.dirty = true;
			}
			return this;	//	concord.chart.lib.Chart
		},
		updateSeries: function(name, data){
			//	summary:
			//		Update the given series with a new set of data points.
			//	name: String
			//		The name of the series as defined in addSeries.
			//	data: Array|Object:
			//		The array of data points (either numbers or objects) that
			//		represents the data to be drawn. Or it can be an object. In
			//		the latter case, it should have a property "data" (an array),
			//		destroy(), and setSeriesObject().
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.runs){
				var run = this.series[this.runs[name]];
				run.update(data);
				this._invalidateDependentPlots(run.plot, false);
				this._invalidateDependentPlots(run.plot, true);
			}
			return this;	//	concord.chart.lib.Chart
		},
		getSeriesOrder: function(plotName){
			//	summary:
			//		Returns an array of series names in the current order
			//		(the top-most series is the first) within a plot.
			//	plotName: String:
			//		Plot's name.
			//	returns: Array
			return df.map(df.filter(this.series, function(run){
					return run.plot == plotName;
				}), getName);
		},
		setSeriesOrder: function(newOrder){
			//	summary:
			//		Sets new order of series within a plot. newOrder cannot add
			//		or remove series. Wrong names, or dups are ignored.
			//	newOrder: Array:
			//		Array of series names compatible with getPlotOrder(). All
			//		series should belong to the same plot.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			var plotName, names = {},
				order = df.filter(newOrder, function(name){
					if(!(name in this.runs) || (name in names)){
						return false;
					}
					var run = this.series[this.runs[name]];
					if(plotName){
						if(run.plot != plotName){
							return false;
						}
					}else{
						plotName = run.plot;
					}
					names[name] = 1;
					return true;
				}, this);
			df.forEach(this.series, function(run){
				var name = run.name;
				if(!(name in names) && run.plot == plotName){
					order.push(name);
				}
			});
			var newSeries = df.map(order, function(name){
					return this.series[this.runs[name]];
				}, this);
			this.series = newSeries.concat(df.filter(this.series, function(run){
				return run.plot != plotName;
			}));
			df.forEach(this.series, function(run, i){
				this.runs[run.name] = i;
			}, this);
			this.dirty = true;
			return this;	//	concord.chart.lib.Chart
		},
		moveSeriesToFront: function(name){
			//	summary:
			//		Moves a given series to front of a plot.
			//	name: String:
			//		Series' name to move.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.runs){
				var index = this.runs[name],
					newOrder = this.getSeriesOrder(this.series[index].plot);
				if(name != newOrder[0]){
					newOrder.splice(index, 1);
					newOrder.unshift(name);
					return this.setSeriesOrder(newOrder);	//	concord.chart.lib.Chart
				}
			}
			return this;	//	concord.chart.lib.Chart
		},
		moveSeriesToBack: function(name){
			//	summary:
			//		Moves a given series to back of a plot.
			//	name: String:
			//		Series' name to move.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.runs){
				var index = this.runs[name],
					newOrder = this.getSeriesOrder(this.series[index].plot);
				if(name != newOrder[newOrder.length - 1]){
					newOrder.splice(index, 1);
					newOrder.push(name);
					return this.setSeriesOrder(newOrder);	//	concord.chart.lib.Chart
				}
			}
			return this;	//	concord.chart.lib.Chart
		},
		
		addLegend: function(kwArgs)
		{
			this.legend = new dc.Legend(this, kwArgs);
			this.dirty = true;
			return this;	//	concord.chart.lib.Chart
		},
		
		resize: function(width, height){
			//	summary:
			//		Resize the chart to the dimensions of width and height.
			//	description:
			//		Resize the chart and its surface to the width and height dimensions.
			//		If no width/height or box is provided, resize the surface to the marginBox of the chart.
			//	width: Number
			//		The new width of the chart.
			//	height: Number
			//		The new height of the chart.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			var box;
			switch(arguments.length){
				// case 0, do not resize the div, just the surface
				case 1:
					// argument, override node box
					box = dojo.mixin({}, width);
					dojo.marginBox(this.node, box);
					break;
				case 2:
					box = {w: width, h: height};
					// argument, override node box
					dojo.marginBox(this.node, box);
					break;
			}
			// in all cases take back the computed box
			box = dojo.marginBox(this.node);
			// and set it on the surface
			this.surface.setDimensions(box.w, box.h);
			this.dirty = true;
			this.coords = null;
			return this.render();	//	concord.chart.lib.Chart
		},
		getGeometry: function(){
			//	summary:
			//		Returns a map of information about all axes in a chart and what they represent
			//		in terms of scaling (see concord.chart.lib.axis2d.Default.getScaler).
			//	returns: Object
			//		An map of geometry objects, a one-to-one mapping of axes.
			var ret = {};
			df.forIn(this.axes, function(axis){
				if(axis.initialized()){
					ret[axis.name] = {
						name:		axis.name,
						vertical:	axis.vertical,
						scaler:		axis.scaler,
						ticks:		axis.ticks
					};
				}
			});
			return ret;	//	Object
		},
		setAxisWindow: function(name, scale, offset, zoom){
			//	summary:
			//		Zooms an axis and all dependent plots. Can be used to zoom in 1D.
			//	name: String
			//		The name of the axis as defined by addAxis.
			//	scale: Number
			//		The scale on the target axis.
			//	offset: Number
			//		Any offest, as measured by axis tick
			//	zoom: Boolean|Object?
			//		The chart zooming animation trigger.  This is null by default,
			//		e.g. {duration: 1200}, or just set true.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			var axis = this.axes[name];
			if(axis){
				axis.setWindow(scale, offset);
				dojo.forEach(this.stack,function(plot){
					if(plot.hAxis == name || plot.vAxis == name){
						plot.zoom = zoom;
					}
				})
			}
			return this;	//	concord.chart.lib.Chart
		},
		setWindow: function(sx, sy, dx, dy, zoom){
			//	summary:
			//		Zooms in or out any plots in two dimensions.
			//	sx: Number
			//		The scale for the x axis.
			//	sy: Number
			//		The scale for the y axis.
			//	dx: Number
			//		The pixel offset on the x axis.
			//	dy: Number
			//		The pixel offset on the y axis.
			//	zoom: Boolean|Object?
			//		The chart zooming animation trigger.  This is null by default,
			//		e.g. {duration: 1200}, or just set true.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(!("plotArea" in this)){
				this.calculateGeometry();
			}
			df.forIn(this.axes, function(axis){
				var scale, offset, bounds = axis.getScaler().bounds,
					s = bounds.span / (bounds.upper - bounds.lower);
				if(axis.vertical){
					scale  = sy;
					offset = dy / s / scale;
				}else{
					scale  = sx;
					offset = dx / s / scale;
				}
				axis.setWindow(scale, offset);
			});
			dojo.forEach(this.stack, function(plot){ plot.zoom = zoom; });
			return this;	//	concord.chart.lib.Chart
		},
		zoomIn:	function(name, range){
			//	summary:
			//		Zoom the chart to a specific range on one axis.  This calls render()
			//		directly as a convenience method.
			//	name: String
			//		The name of the axis as defined by addAxis.
			//	range: Array
			//		The end points of the zoom range, measured in axis ticks.
			var axis = this.axes[name];
			if(axis){
				var scale, offset, bounds = axis.getScaler().bounds;
				var lower = Math.min(range[0],range[1]);
				var upper = Math.max(range[0],range[1]);
				lower = range[0] < bounds.lower ? bounds.lower : lower;
				upper = range[1] > bounds.upper ? bounds.upper : upper;
				scale = (bounds.upper - bounds.lower) / (upper - lower);
				offset = lower - bounds.lower;
				this.setAxisWindow(name, scale, offset);
				this.render();
			}
		},
		calculateGeometry: function(){
			//	summary:
			//		Calculate the geometry of the chart based on the defined axes of
			//		a chart.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(this.dirty){
				return this.fullGeometry();
			}

			// calculate geometry
			var dirty = dojo.filter(this.stack, function(plot){
					return plot.dirty ||
						(plot.hAxis && this.axes[plot.hAxis].dirty) ||
						(plot.vAxis && this.axes[plot.vAxis].dirty);
				}, this);
			calculateAxes(dirty, this.plotArea);

			return this;	//	concord.chart.lib.Chart
		},
		
		getTitleFont: function()
		{
			var titleFont = dojo.mixin({}, this.theme.chart.titleFont, this.font, this.titleFont);
			if((!this.titleFont || !this.titleFont.size) && this.font && this.font.size)
				titleFont.size = parseFloat(this.font.size) * 1.2 + "pt";
			
			return titleFont;
		},
		
		getTitleFontColor: function()
		{
			return this.titleFontColor || this.fontColor || this.theme.chart.titleFontColor || "black";
		},
		
		fullGeometry: function(){
			//	summary:
			//		Calculate the full geometry of the chart.  This includes passing
			//		over all major elements of a chart (plots, axes, series, container)
			//		in order to ensure proper rendering.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			this._makeDirty();

			// clear old values
			dojo.forEach(this.stack, clear);

			// rebuild new connections, and add defaults

			// set up a theme
			if(!this.theme){
				this.setTheme(new concord.chart.lib.Theme(concord.chart.lib._def));
			}

			// assign series
			dojo.forEach(this.series, function(run){
				if(!(run.plot in this.plots)){
                    if(!dc.plot2d || !dc.plot2d.Default){
                        throw Error("Can't find plot: Default - didn't you forget to dojo" + ".require() it?");
                    }
					var plot = new dc.plot2d.Default(this, {});
					plot.name = run.plot;
					this.plots[run.plot] = this.stack.length;
					this.stack.push(plot);
				}
				this.stack[this.plots[run.plot]].addSeries(run);
			}, this);
			// assign axes
			dojo.forEach(this.stack, function(plot){
				if(plot.hAxis){
					plot.setAxis(this.axes[plot.hAxis]);
				}
				if(plot.vAxis){
					plot.setAxis(this.axes[plot.vAxis]);
				}
			}, this);

			// calculate geometry

			// 1st pass
			var dim = this.dim = this.surface.getDimensions();
			dim.width  = g.normalizedLength(dim.width);
			dim.height = g.normalizedLength(dim.height);
			df.forIn(this.axes, clear);
			calculateAxes(this.stack, dim);

			// assumption: we don't have stacked axes yet
			var offsets = this.offsets = { l: 0, r: 0, t: 0, b: 0 };
			var isDirChanged = this.isDirChanged;
			df.forIn(this.axes, function(axis){
				if(axis.vertical && isDirChanged) {
					axis.opt.leftBottom = !axis.opt.leftBottom;
				}
				df.forIn(axis.getOffsets(), function(o, i){ offsets[i] = Math.max(offsets[i],o); });
			});
			this.isDirChanged = false;
			// add title area
			var titleH = 0;
			if(this.title){
				this.titleGap = (this.titleGap==0) ? 0 : this.titleGap || this.theme.chart.titleGap || 20;
				this.titlePos = this.titlePos || this.theme.chart.titlePos || "top";
				var titleFont = this.getTitleFont();
				var tsize = g.normalizedLength(titleFont.size);
				offsets[this.titlePos=="top" ? "t":"b"] += (tsize + this.titleGap);
				titleH = tsize + this.titleGap;
			}
			
			if(this.legend)
			{
				var lengendOffsets = this.legend.getOffsets();
				this.legend.adjustPosition(dim, offsets,titleH);
				df.forIn(lengendOffsets, function(o, i){ offsets[i] += o; });
			}
			// add margins
			df.forIn(this.margins, function(o, i){ offsets[i] += o; });

			// 2nd pass with realistic dimensions
			if(dim.width*0.9<offsets.l + offsets.r)
				offsets.l = offsets.r = 0;
			if(dim.height*0.9<offsets.t + offsets.b)
				offsets.t = offsets.b = 0;
			this.plotArea = {
				width: dim.width - offsets.l - offsets.r,
				height: dim.height - offsets.t - offsets.b
			};
			df.forIn(this.axes, clear);
			calculateAxes(this.stack, this.plotArea);

			return this;	//	concord.chart.lib.Chart
		},
		
		render: function(){
			//	summary:
			//		Render the chart according to the current information defined.  This should
			//		be the last call made when defining/creating a chart, or if data within the
			//		chart has been changed.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(this.theme){
				this.theme.clear();
			}

			if(this.dirty){
				return this.fullRender();
			}

			this.calculateGeometry();

			df.forEach(this.stack, function(plot){ plot.render(this.dim, this.offsets); }, this);

			// go over axes
			df.forIn(this.axes, function(axis){ axis.render(this.dim, this.offsets); }, this);
			
			if(this.legend && this.offsets[this.legend.position]>0)
				this.legend.render();

			this._makeClean();

			// BEGIN FOR HTML CANVAS
			if(this.surface.render){ this.surface.render(); };
			// END FOR HTML CANVAS

			return this;	//	concord.chart.lib.Chart
		},
		fullRender: function(){
			//	summary:
			//		Force a full rendering of the chart, including full resets on the chart itself.
			//		You should not call this method directly unless absolutely necessary.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.

			// calculate geometry
			this.fullGeometry();
			var offsets = this.offsets, dim = this.dim, rect;

			// get required colors
			//var requiredColors = df.foldl(this.stack, "z + plot.getRequiredColors()", 0);
			//this.theme.defineColors({num: requiredColors, cache: false});

			// clear old shapes
			dojo.forEach(this.series, purge);
			df.forIn(this.axes, purge);
			dojo.forEach(this.stack,  purge);
			if(this.legend!=null)
				this.legend.purgeGroup();
            if(this.chartTitle && this.chartTitle.tagName){
                // destroy title if it is a DOM node
			    dojo.destroy(this.chartTitle);
            }
			this.surface.clear();
            this.chartTitle = null;
            this.rects = {};
			
            var accDesc = dojo.doc.createElementNS(g.svg.xmlns.svg,"desc");
            var escDesc = this.accDesc;
            if(typeof escDesc == "string")
            	escDesc = escDesc.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&#39;");

            accDesc.innerHTML = escDesc || "";
            this.surface.rawNode.appendChild(accDesc);
            

			this.rects.a = this.surface.createRect({width:  this.dim.width,	height: this.dim.height});
			this.setChartArea();
			
			this.setPlotArea();
			df.foldl(this.stack, function(z, plot){ return plot.render(dim, offsets), 0; }, 0);
			
			//create title: Whether to make chart title as a widget which extends concord.chart.lib.Element?
			if(this.title){
				var titleFont = this.getTitleFont(); 
				var titleFontColor = this.getTitleFontColor();
				var forceHtmlLabels = (g.renderer == "canvas"),
					labelType = "gfx"; //forceHtmlLabels || !dojo.isIE && !dojo.isOpera ? "html" : "gfx",
					tsize = g.normalizedLength(titleFont.size);
				
				var titletxt = concord.chart.lib.Element.prototype.getTextWithLimitLength(this.title,titleFont,dim.width - 4,false);

				var fixBidiOffset = dojo.isIE && (g.renderer == "svg") && (BidiUtils.isBidiOn() || this.textDir);
				var x = dim.width/2;
				if (fixBidiOffset)
					x = concord.chart.lib.axis2d.Default.prototype.getStartOffset(x, titletxt.text, "middle", titleFont);

				this.chartTitle = dc.axis2d.common.createText[labelType](
					this,
					this.surface,
					x,
					this.titlePos=="top" ? tsize + this.margins.t : dim.height - this.margins.b,
					fixBidiOffset ? "start" : "middle",
					titletxt.text,
					titleFont,
					titleFontColor
				);
			}
			
			if(this.legend)
			{
				if(offsets[this.legend.position]>0)
					this.legend.render();
			}

			// go over axes
			df.forIn(this.axes, function(axis){ axis.render(dim, offsets); });

			this._makeClean();

			// BEGIN FOR HTML CANVAS
			if(this.surface.render){ this.surface.render(); };
			// END FOR HTML CANVAS

			return this;	//	concord.chart.lib.Chart
		},
		
		setChartArea: function(settings)
		{
			var t = this.theme;
			
			var fill = null;
			if(settings && "fill" in settings)
				fill = this.fill = settings.fill;
			else
	            fill = this.fill != null ? this.fill : (t.chart && t.chart.fill);
			
			//Limitation, can't support no fill now
			if(!fill)
				fill = "#FFFFFF";
			
	        this.rects.a.setFill(fill);
	        
	        var stroke = null;
	        if(settings && "stroke" in settings)
			{
				if(!this.stroke)
					this.stroke = settings.stroke;
				else
				{
					if(settings.stroke==null)
						this.stroke = null;
					else
						dojo.mixin(this.stroke,settings.stroke);
				}
				
				stroke = this.stroke;
			}
			else
			    stroke = this.stroke !=null ? this.stroke : (t.chart && t.chart.stroke);
	        if(stroke)
	        {
	        	var sw = stroke.width || 0;
	        	dojo.attr(this.rects.a.rawNode,{x:sw,y:sw,width:this.dim.width-2*sw,height:this.dim.height-2*sw});
	        }
	        this.rects.a.setStroke(stroke);
		},
		
		setPlotArea: function(settings)
		{
			//pie chart should not draw plot area fill
			if(this.stack.length==1 && this.stack[0].declaredClass == "concord.chart.lib.plot2d.Pie")
				return;
			
			var t = this.theme;
			var fill = null;
			if(settings && "fill" in settings)
				fill = this.plotarea.fill = settings.fill;
			else
			{
				if("fill" in this.plotarea)
					fill = this.plotarea.fill;
				else
					fill = t.plotarea && t.plotarea.fill;
			}
			
			var stroke = null;
			if(settings && "stroke" in settings)
			{
				if(!this.plotarea.stroke)
					this.plotarea.stroke = settings.stroke;
				else
				{
					if(!settings.stroke)
						this.plotarea.stroke = null;
					else
						dojo.mixin(this.plotarea.stroke,settings.stroke);
				}
				
				stroke = this.plotarea.stroke;
			}
			else
			{
				if("stroke" in this.plotarea)
					stroke = this.plotarea.stroke;
				else
					stroke = t.plotarea && t.plotarea.stroke;
			}
			
			if(!this.rects.p)
			{
				var offsets = this.offsets, dim = this.dim;
				// draw a plot background
				var rect = {
						x: offsets.l - 1, y: offsets.t - 1,
						width:  dim.width  - offsets.l - offsets.r + 2,
						height: dim.height - offsets.t - offsets.b + 2
				};
				this.rects.p = this.surface.createRect(rect);
			}
			this.rects.p.setFill(fill);
			this.rects.p.setStroke(stroke);
		},
		
		delayedRender: function(){
			//	summary:
			//		Delayed render, which is used to collect multiple updates
			//		within a delayInMs time window.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.

			if(!this._delayedRenderHandle){
				this._delayedRenderHandle = setTimeout(
					dojo.hitch(this, function(){
						clearTimeout(this._delayedRenderHandle);
						this._delayedRenderHandle = null;
						this.render();
					}),
					this.delayInMs
				);
			}

			return this;	//	concord.chart.lib.Chart
		},
		connectToPlot: function(name, object, method){
			//	summary:
			//		A convenience method to connect a function to a plot.
			//	name: String
			//		The name of the plot as defined by addPlot.
			//	object: Object
			//		The object to be connected.
			//	method: Function
			//		The function to be executed.
			//	returns: Array
			//		A handle to the connection, as defined by dojo.connect (see dojo.connect).
			return name in this.plots ? this.stack[this.plots[name]].connect(object, method) : null;	//	Array
		},
		fireEvent: function(seriesName, eventName, index){
			//	summary:
			//		Fires a synthetic event for a series item.
			//	seriesName: String:
			//		Series name.
			//	eventName: String:
			//		Event name to simulate: onmouseover, onmouseout, onclick.
			//	index: Number:
			//		Valid data value index for the event.
			//	returns: concord.chart.lib.Chart
			//		A reference to the current chart for functional chaining.
			if(seriesName in this.runs){
				var plotName = this.series[this.runs[seriesName]].plot;
				if(plotName in this.plots){
					var plot = this.stack[this.plots[plotName]];
					if(plot){
						plot.fireEvent(seriesName, eventName, index);
					}
				}
			}
			return this;	//	concord.chart.lib.Chart
		},
		_makeClean: function(){
			// reset dirty flags
			dojo.forEach(this.axes,   makeClean);
			dojo.forEach(this.stack,  makeClean);
			dojo.forEach(this.series, makeClean);
			this.dirty = false;
		},
		_makeDirty: function(){
			// reset dirty flags
			dojo.forEach(this.axes,   makeDirty);
			dojo.forEach(this.stack,  makeDirty);
			dojo.forEach(this.series, makeDirty);
			this.dirty = true;
		},
		_invalidateDependentPlots: function(plotName, /* Boolean */ verticalAxis){
			if(plotName in this.plots){
				var plot = this.stack[this.plots[plotName]], axis,
					axisName = verticalAxis ? "vAxis" : "hAxis";
				if(plot[axisName]){
					axis = this.axes[plot[axisName]];
					if(axis && axis.dependOnData()){
						axis.dirty = true;
						// find all plots and mark them dirty
						dojo.forEach(this.stack, function(p){
							if(p[axisName] && p[axisName] == plot[axisName]){
								p.dirty = true;
							}
						});
					}
				}else{
					plot.dirty = true;
				}
			}
		}
	});

	function hSection(stats){
		return {min: stats.hmin, max: stats.hmax};
	}

	function vSection(stats){
		return {min: stats.vmin, max: stats.vmax};
	}

	function hReplace(stats, h){
		stats.hmin = h.min;
		stats.hmax = h.max;
	}

	function vReplace(stats, v){
		stats.vmin = v.min;
		stats.vmax = v.max;
	}

	function combineStats(target, source){
		if(target && source){
			target.min = Math.min(target.min, source.min);
			target.max = Math.max(target.max, source.max);
		}
		return target || source;
	}

	function calculateAxes(stack, plotArea){
		var plots = {}, axes = {};
		dojo.forEach(stack, function(plot){
			var stats = plots[plot.name] = plot.getSeriesStats();
			if(plot.hAxis){
				axes[plot.hAxis] = combineStats(axes[plot.hAxis], hSection(stats));
			}
			if(plot.vAxis){
				axes[plot.vAxis] = combineStats(axes[plot.vAxis], vSection(stats));
			}
		});
		dojo.forEach(stack, function(plot){
			var stats = plots[plot.name];
			if(plot.hAxis){
				hReplace(stats, axes[plot.hAxis]);
			}
			if(plot.vAxis){
				vReplace(stats, axes[plot.vAxis]);
			}
			plot.initializeScalers(plotArea, stats);
		});
	}
})();
