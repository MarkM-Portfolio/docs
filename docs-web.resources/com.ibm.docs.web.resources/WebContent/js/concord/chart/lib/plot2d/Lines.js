dojo.provide("concord.chart.lib.plot2d.Lines");

dojo.require("concord.chart.lib.plot2d.Default");

dojo.declare("concord.chart.lib.plot2d.Lines", concord.chart.lib.plot2d.Default, {
	//	summary:
	//		A convenience constructor to create a typical line chart.
	constructor: function(chart, settings){
		//	summary:
		//		Preset our default plot to be line-based.
		//this.opt.lines = true;
		this.opt.interpolate = settings && settings.interpolate ? settings.interpolate : false;
	}
});
