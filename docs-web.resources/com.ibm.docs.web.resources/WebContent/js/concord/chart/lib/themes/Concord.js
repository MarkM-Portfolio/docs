dojo.provide("concord.chart.lib.themes.Concord");

dojo.require("dojox.gfx.gradutils");
dojo.require("concord.chart.lib.Theme");

// created by Julie Santilli

(function(){
	var dxc=concord.chart.lib;
	dxc.themes.Concord=new dxc.Theme({
		colors: [
			"#00B2EF",
			"#F04E37",
			"#8CC63F",
			"#F19027",
			"#00A6A0",
			"#AB1A86",
			"#A5A215",
			"#008ABF",
			"#EE3D96",
			"#FFE14F",
			"#82D1F5",
			"#D9182D",
			"#17AF4B",
			"#DD731C",
			"#007670",
			"#7F1C7D",
			"#838329",
			"#00649D",
			"#F389AF",
			"#FFCF01",
			"#00B0DA",
			"#A91024",
			"#008A52",
			"#B8471B",
			"#006058",
			"#3B0256",
			"#594F13",
			"#003F69",
			"#BA006E",
			"#FDB813",
			"#014263",
			"#7E2224",
			"#00512F",
			"#913824",
			"#00443D",
			"#29013B",
			"#3C390D",
			"#011932",
			"#8C004F",
			"#C59242"
		],
		axis:{
			stroke:	{ // the axis itself
				color: "#000000",
				width: 1
			},
			tick: {	// used as a foundation for all ticks
				color:     "#000000",
				position:  "center",
				font:   // labels on axis   
				{
					style : "normal",
					weight : "normal",
					variant: "normal",
					size : "10pt",
					family: "Arial"	
				},
				fontColor: "#000000",								// color of labels
				titleGap:  15,
				titleFont:	// labels on axis
				{
					style : "normal",
					weight : "bold",
					variant: "normal",
					size : "10pt",
					family: "Arial"	
				},
				titleFontColor: "#000000",							// color of labels
				titleOrientation: "axis"						// "axis": facing the axis, "away": facing away
			},
			majorTick:	{ // major ticks on axis, and used for major gridlines
				width:  0.6,
				length: 6
			},
			minorTick:	{ // minor ticks on axis, and used for minor gridlines
				width:  0.4,
				length: 3
			},
			microTick:	{ // minor ticks on axis, and used for minor gridlines
				width:  0.3,
				length: 1
			}
		},
		chart: {
			titleFont:
			{
				style : "normal",
				weight : "bold",
				size : "18pt",
				family: "Arial"
			},
			fill: "#FFFFFF"
		},
		plotarea: {
			fill: "#FFFFFF"
		}
			
	});
})();
