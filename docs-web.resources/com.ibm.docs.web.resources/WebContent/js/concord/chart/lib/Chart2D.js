dojo.provide("concord.chart.lib.Chart2D");

dojo.deprecated("concord.chart.lib.Chart2D", "Use dojo.charting.Chart instead and require all other components explicitly", "2.0");

// require all axes to support references by name
dojo.require("concord.chart.lib.axis2d.Default");
dojo.require("concord.chart.lib.axis2d.Invisible");

// require all plots to support references by name
dojo.require("concord.chart.lib.plot2d.Default");
dojo.require("concord.chart.lib.plot2d.Lines");
dojo.require("concord.chart.lib.plot2d.Areas");
dojo.require("concord.chart.lib.plot2d.Markers");
dojo.require("concord.chart.lib.plot2d.MarkersOnly");
dojo.require("concord.chart.lib.plot2d.Scatter");
dojo.require("concord.chart.lib.plot2d.Stacked");
dojo.require("concord.chart.lib.plot2d.StackedLines");
dojo.require("concord.chart.lib.plot2d.StackedAreas");
dojo.require("concord.chart.lib.plot2d.Columns");
dojo.require("concord.chart.lib.plot2d.StackedColumns");
dojo.require("concord.chart.lib.plot2d.ClusteredColumns");
dojo.require("concord.chart.lib.plot2d.Bars");
dojo.require("concord.chart.lib.plot2d.StackedBars");
dojo.require("concord.chart.lib.plot2d.ClusteredBars");
dojo.require("concord.chart.lib.plot2d.Grid");
dojo.require("concord.chart.lib.plot2d.Pie");
dojo.require("concord.chart.lib.plot2d.Bubble");
dojo.require("concord.chart.lib.plot2d.Candlesticks");
dojo.require("concord.chart.lib.plot2d.OHLC");
dojo.require("concord.chart.lib.plot2d.Spider");

// require the main file
dojo.require("concord.chart.lib.Chart");

concord.chart.lib.Chart2D = concord.chart.lib.Chart;
