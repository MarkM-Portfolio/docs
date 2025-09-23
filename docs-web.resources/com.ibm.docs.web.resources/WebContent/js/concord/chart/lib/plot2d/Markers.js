dojo.provide("concord.chart.lib.plot2d.Markers");

dojo.require("concord.chart.lib.plot2d.Default");

dojo.declare("concord.chart.lib.plot2d.Markers", concord.chart.lib.plot2d.Default, {
	//	summary:
	//		A convenience plot to draw a line chart with markers.
	constructor: function(){
		//	summary:
		//		Set up the plot for lines and markers.
		this.opt.markers = true;
	}
});
