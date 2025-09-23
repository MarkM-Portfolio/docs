dojo.provide("concord.chart.lib.plot3d.Base");

dojo.require("concord.chart.lib.Chart3D");

dojo.declare("concord.chart.lib.plot3d.Base", null, {
	constructor: function(width, height, kwArgs){
		this.width  = width;
		this.height = height;
	},
	setData: function(data){
		this.data = data ? data : [];
		return this;
	},
	getDepth: function(){
		return this.depth;
	},
	generate: function(chart, creator){
	}
});

