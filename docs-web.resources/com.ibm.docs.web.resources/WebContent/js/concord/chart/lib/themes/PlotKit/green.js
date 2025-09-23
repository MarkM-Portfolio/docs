dojo.provide("concord.chart.lib.themes.PlotKit.green");
dojo.require("concord.chart.lib.themes.PlotKit.base");

(function(){
	var dc = concord.chart.lib, pk = dc.themes.PlotKit;

	pk.green = pk.base.clone();
	pk.green.chart.fill = pk.green.plotarea.fill = "#eff5e6";
	pk.green.colors = dc.Theme.defineColors({hue: 82, saturation: 60, low: 40, high: 88});
})();
