dojo.provide("concord.chart.lib.themes.PlotKit.cyan");
dojo.require("concord.chart.lib.themes.PlotKit.base");

(function(){
	var dc = concord.chart.lib, pk = dc.themes.PlotKit;

	pk.cyan = pk.base.clone();
	pk.cyan.chart.fill = pk.cyan.plotarea.fill = "#e6f1f5";
	pk.cyan.colors = dc.Theme.defineColors({hue: 194, saturation: 60, low: 40, high: 88});
})();
