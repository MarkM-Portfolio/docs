dojo.provide("concord.chart.lib.action2d.Tooltip");

dojo.require("dijit.Tooltip");

dojo.require("concord.chart.lib.action2d.Base");
dojo.require("dojox.gfx.matrix");

dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.scan");
dojo.require("dojox.lang.functional.fold");

/*=====
dojo.declare("concord.chart.lib.action2d.__TooltipCtorArgs", concord.chart.lib.action2d.__BaseCtorArgs, {
	//	summary:
	//		Additional arguments for tooltip actions.

	//	text: Function?
	//		The function that produces the text to be shown within a tooltip.  By default this will be
	//		set by the plot in question, by returning the value of the element.
	text: null
});
=====*/
(function(){
	var DEFAULT_TEXT = function(o){
		var t = o.run && o.run.data && o.run.data[o.index];
		if(t && typeof t != "number" && (t.tooltip || t.text)){
			return t.tooltip || t.text;
		}
		if(o.element == "candlestick"){
			return '<table cellpadding="1" cellspacing="0" border="0" style="font-size:0.9em;">'
				+ '<tr><td>Open:</td><td align="right"><strong>' + o.data.open + '</strong></td></tr>'
				+ '<tr><td>High:</td><td align="right"><strong>' + o.data.high + '</strong></td></tr>'
				+ '<tr><td>Low:</td><td align="right"><strong>' + o.data.low + '</strong></td></tr>'
				+ '<tr><td>Close:</td><td align="right"><strong>' + o.data.close + '</strong></td></tr>'
				+ (o.data.mid !== undefined ? '<tr><td>Mid:</td><td align="right"><strong>' + o.data.mid + '</strong></td></tr>' : '')
				+ '</table>';
		}
		
		var v = o.element == "bar" ? o.x : o.y;
		if(typeof v != "number")
                    return v || "";
		var axId = o.element == "bar" ? o.hAxis: o.vAxis;
		var axis = o.chart.axes[axId];
		if(axis==null)
			return v;
		var tip = axis.formatString(v);
		return tip;
	};

	var df = dojox.lang.functional, m = dojox.gfx.matrix, pi4 = Math.PI / 4, pi2 = Math.PI / 2;
	
	dojo.declare("concord.chart.lib.action2d.Tooltip", concord.chart.lib.action2d.Base, {
		//	summary:
		//		Create an action on a plot where a tooltip is shown when hovering over an element.

		// the data description block for the widget parser
		defaultParams: {
			text: DEFAULT_TEXT	// the function to produce a tooltip from the object
		},
		optionalParams: {},	// no optional parameters

		constructor: function(chart, plot, kwArgs){
			//	summary:
			//		Create the tooltip action and connect it to the plot.
			//	chart: concord.chart.lib.Chart2D
			//		The chart this action belongs to.
			//	plot: String?
			//		The plot this action is attached to.  If not passed, "default" is assumed.
			//	kwArgs: concord.chart.lib.action2d.__TooltipCtorArgs?
			//		Optional keyword arguments object for setting parameters.
			this.text = kwArgs && kwArgs.text ? kwArgs.text : DEFAULT_TEXT;
			
			this.connect();
		},
		
		process: function(o){
			//	summary:
			//		Process the action on the given object.
			//	o: dojox.gfx.Shape
			//		The object on which to process the highlighting action.
			if(o.type === "onplotreset" || o.type === "onmouseout"){
                dijit.hideTooltip(this.aroundRect);
				this.aroundRect = null;
				if(o.type === "onplotreset"){
					delete this.angles;
				}
				return;
			}
			
			if(!o.shape || o.type !== "onmouseover"){ return; }
			
			// calculate relative coordinates and the position
			var aroundRect = {type: "rect"}, position = ["after", "before"];
			switch(o.element){
				case "marker":
					aroundRect.x = o.cx;
					aroundRect.y = o.cy;
					aroundRect.width = aroundRect.height = 1;
					break;
				case "circle":
					aroundRect.x = o.cx - o.cr;
					aroundRect.y = o.cy - o.cr;
					aroundRect.width = aroundRect.height = 2 * o.cr;
					break;
				case "column":
					position = ["above", "below"];
					// intentional fall down
				case "bar":
					aroundRect = dojo.clone(o.shape.getShape());
					break;
				case "candlestick":
					aroundRect.x = o.x;
					aroundRect.y = o.y;
					aroundRect.width = o.width;
					aroundRect.height = o.height;
					break;
				default:
				//case "slice":
					if(!this.angles){
						// calculate the running total of slice angles
						var vs = null;
						if(typeof o.run.data[0] == "number"){
							vs = df.map(o.run.data,"x ? Math.abs(x) : 0");
						}else{
							vs = df.map(o.run.data,"x.y ? Math.abs(x.y) : 0");
						}
						this.angles = df.map(df.scanl(vs, "+", 0),"* 2 * Math.PI / this", df.foldl(vs, "+", 0));
					}
					var startAngle = m._degToRad(o.plot.opt.startAngle),
						angle = (this.angles[o.index] + this.angles[o.index + 1]) / 2 + startAngle;
					aroundRect.x = o.cx + o.cr * Math.cos(angle);
					aroundRect.y = o.cy + o.cr * Math.sin(angle);
					aroundRect.width = aroundRect.height = 1;
					// calculate the position
					if(angle < pi4){
						// do nothing: the position is right
					}else if(angle < pi2 + pi4){
						position = ["below", "above"];
					}else if(angle < Math.PI + pi4){
						position = ["before", "after"];
					}else if(angle < 2 * Math.PI - pi4){
						position = ["above", "below"];
					}
					/*
					else{
						// do nothing: the position is right
					}
					*/
					break;
			}
			
			// adjust relative coordinates to absolute, and remove fractions
			var lt = dojo.coords(this.chart.node, true);
			aroundRect.x += lt.x;
			aroundRect.y += lt.y;
			aroundRect.x = Math.round(aroundRect.x);
			aroundRect.y = Math.round(aroundRect.y);
			aroundRect.width = Math.ceil(aroundRect.width);
			aroundRect.height = Math.ceil(aroundRect.height);
			this.aroundRect = aroundRect;

			var tooltip = this.text(o);
			if(tooltip){
				var escTooltip = tooltip;
				if(typeof tooltip == "string")
				  escTooltip = tooltip.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&#39;");
                dijit.showTooltip(escTooltip, this.aroundRect, position);
			}
		}
	});
})();
