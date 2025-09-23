dojo.provide("concord.chart.lib.widget.Legend");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("dojox.lang.functional.array");
dojo.require("dojox.lang.functional.fold");

var REVERSED_SERIES = /\.(StackedColumns|StackedAreas|ClusteredBars)$/;

dojo.declare("concord.chart.lib.widget.Legend", null, {
	// summary: A legend for a chart. A legend contains summary labels for
	// each series of data contained in the chart.
	//
	// Set the horizontal attribute to boolean false to layout legend labels vertically.
	// Set the horizontal attribute to a number to layout legend labels in horizontal
	// rows each containing that number of labels (except possibly the last row).
	//
	// (Line or Scatter charts (colored lines with shape symbols) )
	// -o- Series1		-X- Series2		-v- Series3
	//
	// (Area/Bar/Pie charts (letters represent colors))
	// [a] Series1		[b] Series2		[c] Series3
	
	chartRef:   "",
	horizontal: true,
	swatchSize: 18,
	
	templateString: "<table dojoAttachPoint='legendNode' class='dojoxLegendNode' role='group' aria-label='chart legend'><tbody dojoAttachPoint='legendBody'></tbody></table>",
	
	legendNode: null,
	legendBody: null,
	
	font: "",
	fontColor: "",
	
	constructor: function(settings, div)
	{
		this.chart = settings.chart;
		this.horizontal = settings.horizontal;
		this.font = settings.font;
		this.fontColor = settings.fontColor;
		
		if(typeof div=="string")
			div = dojo.byId(div);
		this.legendNode = div;
		this.legendBody = dojo.create("table",{
			style:{				
				position: "relative"				
				}
			},div);
		this.series = this.chart.series;
	},
	
	postCreate: function(){
		if(!this.chart){
			if(!this.chartRef){ return; }
			this.chart = dijit.byId(this.chartRef);
			if(!this.chart){
				var node = dojo.byId(this.chartRef);
				if(node){
					this.chart = dijit.byNode(node);
				}else{
					console.log("Could not find chart instance with id: " + this.chartRef);
					return;
				}
			}
			this.series = this.chart.chart.series;
		}else{
			this.series = this.chart.series;
		}
		
		this.refresh();
	},
	
	destroy: function()
	{
		// cleanup
		if(this._surfaces){
			dojo.forEach(this._surfaces, function(surface){
				surface.destroy();
			});
		}
		this._surfaces = [];
		while(this.legendBody.lastChild){
			dojo.destroy(this.legendBody.lastChild);
		}
	},
	
	refresh: function(){
		// summary: regenerates the legend to reflect changes to the chart
		
		var df = dojox.lang.functional;

		// cleanup
		this.destroy();

		if(this.horizontal){
			//dojo.addClass(this.legendNode, "dojoxLegendHorizontal");
			// make a container <tr>
			this._tr = dojo.create("tr", null, this.legendBody);
			this._inrow = 0;
		}
		
		var s = this.series;
		if(s.length == 0){
			return;
		}
		if(s[0].chart.stack[0].declaredClass == "concord.chart.lib.plot2d.Pie"){
			var t = s[0].chart.stack[0];
			if(typeof t.run.data[0] == "number"){
				var filteredRun = df.map(t.run.data, "Math.max(x, 0)");
				if(df.every(filteredRun, "<= 0")){
					return;
				}
				var slices = df.map(filteredRun, "/this", df.foldl(filteredRun, "+", 0));
				dojo.forEach(slices, function(x, i){
					this._addLabel(t.dyn[i], /*t._getLabel(x * 100) + "%"*/i+1);
				}, this);
			}else{
				dojo.forEach(t.run.data, function(x, i){
					this._addLabel(t.dyn[i], x.legend || x.text || "");
				}, this);
			}
		}else{
			if(this._isReversal()){
				s = s.slice(0).reverse();
			}
			dojo.forEach(s, function(x){
				if(!x.hide)
					this._addLabel(x.dyn, x.legend || x.name);
			}, this);
		}
		
		if(this.horizontal)
		{
			if(this.legendBody.offsetWidth<this.legendNode.offsetWidth)
			{
				this.legendBody.style.left = (this.legendNode.offsetWidth-this.legendBody.offsetWidth)/2 + "px";
			}
		}
		else
		{
			if(this.legendBody.offsetHeight<this.legendNode.offsetHeight)
			{
				this.legendBody.style.top = (this.legendNode.offsetHeight-this.legendBody.offsetHeight)/2 + "px";
			}
		}
	},
	_addLabel: function(dyn, label){
		// create necessary elements
		var wrapper = dojo.create("td",{valign: "top"}),
			icon = dojo.create("div", null, wrapper),
			div  = dojo.create("div", {
				style: {
					"width": this.swatchSize + "px",
					"height":this.swatchSize + "px",
					"float": "left"
				}
			}, icon);
		var textTd = dojo.create("td",{valign: "top"});
		var	text = dojo.create("div",{style: {"float": "left", font: this.font, color: this.fontColor}}, textTd);
			  
		if(this._tr){
			// horizontal
			this._tr.appendChild(wrapper);
			this._tr.appendChild(textTd);
			if(++this._inrow === this.horizontal){
				// make a fresh container <tr>
				this._tr = dojo.create("tr", null, this.legendBody);
				this._inrow = 0;
			}
		}else{
			// vertical
			var tr = dojo.create("tr", null, this.legendBody);
			tr.appendChild(wrapper);
			tr.appendChild(textTd);
		}
		
		// populate the skeleton
		this._makeIcon(div, dyn);
		text.innerHTML = String(label);

		dojo.style(div,"marginBottom", "2px");
		dojo.style(div,"marginRight", "2px");
		dojo.style(text,"marginBottom", "2px");
		var lw = this.legendNode.offsetWidth-30;
		if(text.offsetWidth>lw)	
		{
			dojo.style(text,"width",lw+"px");
			dojo.style(text,"wordWrap","break-word");			
		}	
					  
	},
	_makeIcon: function(div, dyn){
		var mb = { h: this.swatchSize, w: this.swatchSize };
		var surface = dojox.gfx.createSurface(div, mb.w, mb.h);
		this._surfaces.push(surface);
		if(dyn && dyn.fill){
			// regions
			surface.createRect({x: 2, y: 2, width: mb.w - 4, height: mb.h - 4}).
				setFill(dyn.fill).setStroke(dyn.stroke);
		}else if(dyn && (dyn.stroke || dyn.marker)){
			// draw line
			var line = {x1: 0, y1: mb.h / 2, x2: mb.w, y2: mb.h / 2};
			if(dyn.stroke){
				surface.createLine(line).setStroke(dyn.stroke);
			}
			if(dyn.marker){
				// draw marker on top
				var c = {x: mb.w / 2, y: mb.h / 2};
				if(dyn.stroke){
					surface.createPath({path: "M" + c.x + " " + c.y + " " + dyn.marker}).
						setFill(dyn.stroke.color).setStroke(dyn.stroke);
				}else{
					surface.createPath({path: "M" + c.x + " " + c.y + " " + dyn.marker}).
						setFill(dyn.color).setStroke(dyn.color);
				}
			}
		}else{
			// nothing
			surface.createRect({x: 2, y: 2, width: mb.w - 4, height: mb.h - 4}).
				setStroke("black");
			surface.createLine({x1: 2, y1: 2, x2: mb.w - 2, y2: mb.h - 2}).setStroke("black");
			surface.createLine({x1: 2, y1: mb.h - 2, x2: mb.w - 2, y2: 2}).setStroke("black");
		}
	},
	_isReversal: function(){
		return (!this.horizontal) && dojo.some(this.chart.stack, function(item){
			return REVERSED_SERIES.test(item.declaredClass);
		});
	}
});
