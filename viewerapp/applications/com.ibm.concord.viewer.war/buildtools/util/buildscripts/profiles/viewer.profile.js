﻿dependencies = {
    localeList:"ar,bg,bs,ca,cs,da,de,el,en-gb,en-us,es,es-es,eu,fi,fi-fi,fr,fr-fr,he,he-il,hr,hu,id,it,it-it,ja,kk,ko-kr,mk,nb,nl,no,nn,pl,pt,pt-br,ro,ru,sk,sl,sr-latn,sv,th,tr,zh-tw,zh-cn".split(","),
    layers: [
    	{
			name: "../dijit/dijit.js",
			dependencies: [
				"dijit.dijit"
			]
		},
		{
			name: "../dijit/dijit-all.js",
			layerDependencies: [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.dijit-all"
			]
		},
		{
			name: "../dojox/grid/DataGrid.js",
			dependencies: [
				"dojox.grid.DataGrid"
			]
		},
	    {
	    	name:"../viewer/viewer.js",
	    	copyrightFile:"copyright.txt",
	    	dependencies:["viewer.viewer"] 
	    },
	    {
	    	name:"../html/htmlview.js",
	    	copyrightFile:"copyright.txt",
	    	dependencies:["html.htmlview"] 
	    }
	],
	
    prefixes: [
        ["dijit", "../../WebContent/js/dijit"], 
        ["dojox", "../../WebContent/js/dojox"], 
        ["pdfjs", "../../WebContent/js/pdfjs"],
        ["viewer", "../../WebContent/js/viewer"],
        ["html", "../../WebContent/js/html"],
        ["styles", "../../WebContent/styles"]
    ]
}
