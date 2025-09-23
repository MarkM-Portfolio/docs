dojo.provide("concord.chart.lib.plot2d.Areas");

dojo.require("concord.chart.lib.plot2d.Default");

dojo.declare("concord.chart.lib.plot2d.Areas", concord.chart.lib.plot2d.Default, {
	//	summary:
	//		Represents an area chart.  See concord.chart.lib.plot2d.Default for details.
	constructor: function(){
		this.opt.lines = true;
		this.opt.areas = true;
		this.opt.stroke = null;
	}
});
