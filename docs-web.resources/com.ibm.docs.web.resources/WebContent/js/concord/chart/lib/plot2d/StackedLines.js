dojo.provide("concord.chart.lib.plot2d.StackedLines");

dojo.require("concord.chart.lib.plot2d.Stacked");

dojo.declare("concord.chart.lib.plot2d.StackedLines", concord.chart.lib.plot2d.Stacked, {
	//	summary:
	//		A convenience object to create a stacked line chart.
	constructor: function(){
		//	summary:
		//		Force our Stacked base to be lines only.
		this.opt.lines = true;
	}
});
