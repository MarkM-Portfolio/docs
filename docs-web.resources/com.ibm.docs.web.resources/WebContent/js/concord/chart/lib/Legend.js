dojo.provide("concord.chart.lib.Legend");

dojo.require("dojox.gfx");
dojo.require("concord.chart.lib.Theme");
dojo.require("concord.chart.lib.Series");
dojo.require("concord.chart.lib.axis2d.common");
dojo.require("concord.chart.lib.Element");
dojo.require("dojox.lang.functional");

var REVERSED_SERIES = /\.(StackedColumns|StackedAreas|ClusteredBars)$/;

dojo.declare("concord.chart.lib.Legend", concord.chart.lib.Element, {
	
	font: "",
	fontColor: "",
	position: null,
	series: null,
	horizontal: 1,
	vertical: 1,
	gap: 8,
	swatchSize: 18,
	itemH: 0,
	width: 0,
	height: 0,
	x: 0,
	y: 0,
	
	constructor: function(chart, kwArgs)
	{
		this.series = chart.series;
		
		this.font = kwArgs.font;
		this.fontColor = kwArgs.fontColor;
		this.position = kwArgs.legendPos;
		if(this.position==null)
			this.position = "top";
	},
	
	getFont: function()
	{
		return dojo.mixin({},{family:"Arial",size:"10pt"},this.chart.font, this.font);
	},
	
	getFontColor: function()
	{
		return this.fontColor || this.chart.fontColor || "#000000";
	},
	
	getOffsets: function()
	{
		var offsets = { l: 0, r: 0, t: 0, b: 0 };
		var s = this.series;
		if(s.length == 0){
			return offsets;
		}
		var g = dojox.gfx;
		var legendItems = [];
		
		var t = this.chart.stack[0];
		if(this.chart.stack.length == 1 && t.declaredClass == "concord.chart.lib.plot2d.Pie")
		{
			if(typeof t.run.data[0] == "number")
			{
				for(var i=0;i<t.run.data.length;i++)
					legendItems.push(i+"");
			}
			else
			{
				for(var i=0;i<t.run.data.length;i++)
				{
					var x = t.run.data[i];
					legendItems.push(x.legend || x.text || "");
				}
			}
		}
		else
		{
			if(this._isReversal()){
				s = s.slice(0).reverse();
			}
			dojo.forEach(s, function(x){
				if(!x.hide)
					legendItems.push(x.legend || x.name);
			}, this);
		}
		
		var dim = this.chart.dim;
		
		legendItems = dojox.lang.functional.map(legendItems,function(legendItem){return this.escapeXml(legendItem);}, this);
		var all = legendItems.join("<br/>");
		
		var font = this.getFont();
		var maxWidth = g._base._getTextBox(all, {font: this.makeFontString(font)}).w || 0;
		var itemH = g.normalizedLength(font.size);
		this.itemH = itemH + this.gap;
		
		var heightLimit = dim.height/3;
		var widthLimit = dim.width/3;
		
		if(this.position == "t" || this.position == "b")
		{
			if(maxWidth+this.swatchSize>=dim.width)
			{
				var n = heightLimit/(itemH + this.gap);
				n = Math.floor(n);
				var num = legendItems.length;
				if(num>n)
					num = n;
				this.height = num*(itemH + this.gap);
				this.width = dim.width;
				this.horizontal = 1;
				this.vertical = num;
			}
			else
			{
				 var itemWidthArray = [];
				 for(var i=0;i<legendItems.length;i++)
				 {
					 var d = this.getTextWidth(legendItems[i],font);
					 itemWidthArray[i] = d + 25;
				 }
				 var lw = 0;
				 var n = 1;
				 var st = 1;
				 //find how many items the first row can contain. n is the count
				 for(var i=0;i<itemWidthArray.length;i++)
				 {
					 lw += itemWidthArray[i];
					 if(lw>dim.width)
					 {
						 n = i;
						 break;
					 }
					 if(i==itemWidthArray.length-1)
						 n = i+1;
				 }
				 //adjust n
				 if(n<itemWidthArray.length)
				 {
					 while(n>1)
					 {
						 st = Math.floor(itemWidthArray.length/n);
						 if(itemWidthArray.length % n)
							 st++;
						 var bak = n;
						 for(var i=1;i<st;i++)
						 {
							 lw = 0;
							 for(var j=n*i;j<n*i+n && j<itemWidthArray.length;j++)
							 {
								 lw += itemWidthArray[j];
							 }
							 if(lw>dim.width)
							 {
								 n--;
								 break;
							 }
						 }
						 if(bak==n)
							 break;
					 }
				 }
				 
				 //average row and column number
				 n = Math.floor(itemWidthArray.length/st);
				 if(itemWidthArray.length % st)
					 n++;
				 //How many rows can be contained in heightLimit 
				 var lim = Math.floor(heightLimit/(itemH+this.gap));
				 if(st>lim)
					 st = lim;
				
				 if(st==0)
					 st = 1;
				 this.vertical = st;
				 this.horizontal = n;
				 
				 this.height = (itemH+this.gap)*st;
				 this.colWidth = [];
				 this.width = 0;
				 for(var i=0;i<itemWidthArray.length;i+=this.horizontal)
				 {
					 var hw = 0;
					 for(var j=i;j<i+this.horizontal && j<itemWidthArray.length;j++)
					 {
						 var d = itemWidthArray[j];
						 var col = j % this.horizontal;
						 if(this.colWidth[col]==null)
							 this.colWidth[col] = d;
						 else
							 if(this.colWidth[col]<d)
								 this.colWidth[col] = d;
						 hw += d;
					 }
					 if(hw>this.width)
						 this.width = hw;
				 }
				 this.width += 10;
				 if(this.width > dim.width)
					 this.width = dim.width;
			}
			offsets[this.position] += this.height;
		}
		else
		{
			this.width = maxWidth+this.swatchSize + 14;
			if(this.width>widthLimit)
				this.width = widthLimit;
			
			var n = dim.height/(itemH + this.gap);
			n = Math.floor(n);
			
			var num = legendItems.length;
			if(num>n)
				num = n;
			this.height = num*(itemH + this.gap);
			
			this.horizontal = 1;
			this.vertical = num;
			
			offsets[this.position] += this.width;
		}
		return offsets;
	},
	
	adjustPosition: function(dim, offsets, titleHeight)
	{
		if(this.position=="l")
		{
			this.x = 2;
			this.y = offsets["t"] + (dim.height-offsets["t"]-offsets["b"]-this.height)/2 + 2;
		}
		else if(this.position=="r")
		{
			this.x = dim.width - this.width - 2;
			this.y =  offsets["t"] + (dim.height-offsets["t"]-offsets["b"]-this.height)/2 + 2;
		}
		else if(this.position=="t")
		{
			this.x = (dim.width - this.width)/2 + 2;
			this.y = titleHeight + 2;
		}
		else
		{
			this.x = (dim.width - this.width)/2 + 2;
			this.y = dim.height - this.height - 2;
		}
		if(this.x<2)
			this.x = 2;
		if(this.y<2)
			this.y = 2;
	},
	
	render: function()
	{
		var s = this.series;
		if(s.length == 0){
			return;
		}
		this.cleanGroup();
		
		var t = this.chart.stack[0];
		if(this.chart.stack.length == 1 && t.declaredClass == "concord.chart.lib.plot2d.Pie")
		{
			if(typeof t.run.data[0] == "number")
			{
				for(var i=0;i<t.run.data.length;i++)
					this._addLabel(i, t.dyn[i], i+1);
			}
			else
			{
				dojo.forEach(t.run.data, function(x, i){
					this._addLabel(i, t.dyn[i], x.legend || x.text || "");
				}, this);
			}
		}
		else
		{
			if(this._isReversal()){
				s = s.slice(0).reverse();
			}
			var i=0;
			dojo.forEach(s, function(x){
				if(!x.hide)
					this._addLabel(i++, x.dyn, x.legend);
			}, this);
		}
	},
	
	_addLabel: function(i, dyn, label)
	{
		if(i>=this.horizontal*this.vertical)
			return;
		
		var mb = { h: this.swatchSize, w: this.swatchSize };
		var surface = this.group;
		
		var row = Math.floor(i / this.horizontal);
		var y = this.y + row * this.itemH;
		var x = this.x;
		if(this.horizontal>1)
		{
			var col = i % this.horizontal;
			for(var n=0;n<col;n++)
				x += this.colWidth[n];
		}
		if(dyn && dyn.fill){
			// regions
			surface.createRect({x: x+10, y: y+6, width: 6, height: 6}).
				setFill(dyn.fill).setStroke(dyn.stroke);
		}
		else if(dyn && (dyn.stroke || dyn.marker)){
			// draw line
			var line = {x1: x, y1: mb.h / 2 + y, x2: mb.w + x, y2: mb.h / 2 + y};
			if(dyn.stroke){
				surface.createLine(line).setStroke(dyn.stroke);
			}
			if(dyn.marker){
				// draw marker on top
				var c = {x: mb.w / 2 + x, y: mb.h / 2 + y};
				var path = surface.createPath({path: "M" + c.x + " " + c.y + " " + dyn.marker});
				var strokeColor = null;
				if(dyn.stroke)
					strokeColor = dyn.stroke.color;
				
				//path.setStroke(dyn.markerStroke || dyn.stroke || dyn.color);
				var fill = dyn.markerFill || strokeColor || dyn.color;
				path.setFill(fill).setStroke({color:fill, width: 1});
			}
		}else{
			// nothing
//			surface.createRect({x: x+2, y: y+2, width: mb.w - 4, height: mb.h - 4}).setStroke("black");
//			surface.createLine({x1: x+2, y1: y+2, x2: x + mb.w - 2, y2: y + mb.h - 2}).setStroke("black");
//			surface.createLine({x1: x + 2, y1: y + mb.h - 2, x2: x + mb.w - 2, y2: y + 2}).setStroke("black");
		}
		var font = this.getFont();
		var color = this.getFontColor();
		
		if(label && label.length>1)
		{
			var limLabel = this.getTextWithLimitLength(label, font, this.width-20, false);
			label = limLabel.text;
		}
		surface.createText({x: x+2+mb.w, y: y+this.itemH/2+2, text: label}).setFont(font).setFill(color);			  
	},
	
	_isReversal: function(){
		return (this.position == "l" || this.position == "r") && dojo.some(this.chart.stack, function(item){
			return REVERSED_SERIES.test(item.declaredClass);
		});
	}
	
});