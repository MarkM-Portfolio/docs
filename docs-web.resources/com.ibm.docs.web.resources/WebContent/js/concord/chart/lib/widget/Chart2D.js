dojo.provide("concord.chart.lib.widget.Chart2D");

dojo.deprecated("concord.chart.lib.widget.Chart2D", "Use dojo.charting.widget.Chart instead and require all other components explicitly", "2.0");

dojo.require("concord.chart.lib.widget.Chart");

// require all actions to support references by name
dojo.require("concord.chart.lib.action2d.Highlight");
dojo.require("concord.chart.lib.action2d.Magnify");
dojo.require("concord.chart.lib.action2d.MoveSlice");
dojo.require("concord.chart.lib.action2d.Shake");
dojo.require("concord.chart.lib.action2d.Tooltip");

// require Chart2D to get compatibility on chart type reference by name
dojo.require("concord.chart.lib.Chart2D");

concord.chart.lib.widget.Chart2D =  concord.chart.lib.widget.Chart;
