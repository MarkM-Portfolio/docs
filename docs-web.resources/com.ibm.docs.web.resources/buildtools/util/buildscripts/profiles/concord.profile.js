﻿﻿﻿﻿﻿﻿dependencies = {
	selectorEngine: "acme",
	localeList: "ar,bg,bs,ca,cs,da,de,de-de,el,en,en-gb,en-us,es,es-419,es-ar,es-bo,es-cl,es-co,es-cr,es-cu,es-do,es-ec,es-es,es-gq,es-hn,es-mx,es-ni,es-pa,es-pe,es-ph,es-py,es-pr,es-py,es-us,es-uy,es-ve,eu,fi,fi-fi,fr,fr-fr,fr-ca,fr-ch,he,he-il,hi-in,hr,hu,id,it,it-ch,it-it,ja,ja-jp,kk,ko-kr,mk,nl,nl-aw,nl-cw,nl-be,nl-nl,nl-sr,nl-sx,no,nb,nb-no,nn-no,nn,pl,pt,pt-ao,pt-br,pt-cv,pt-mo,pt-mz,pt-pt,pt-st,ro,ru,sk,sl,sr-latn,sv,th,tr,uk,zh-tw,zh-cn",
	
	"prefixes": [
		           ["dijit", "../../WebContent/js/dijit"], 
		           ["dojox", "../../WebContent/js/dojox"], 
		           ["concord", "../../WebContent/js/concord"],
		           ["lconn", "../../WebContent/js/lconn"],
		           ["wseditor/css", "../../WebContent/js/wseditor/css"],
		           ["websheet", "../../WebContent/js/wseditor/js"], 
		           ["styles", "../../WebContent/styles"],
		           ["writer/css", "../../WebContent/js/writer/css"],
		           ["writer","../../WebContent/js/writer/js"],
		           ["presentation/css", "../../WebContent/js/presentation/css"],
		           ["pres", "../../WebContent/js/presentation/js"],
		           ["viewer", "../../WebContent/js/viewer"]
		         ],  		         
    layers: [   
     	{
    		name: "../dojo/dojo.js",
    		dependencies: [
    			"dojo.loadInit",
    			"dojo.text",
    			"dojo.i18n"
    		]
    	},  		
	    {
	    	name :"../concord/concord_text.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	
	    	copyrightFile:"copyright.txt",
	    	dependencies:["concord.concord_text"] 
	    },
	    {
	    	name: "../concord/concord_sheet.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	
	    	copyrightFile: "copyright.txt",
	    	dependencies: ["concord.concord_sheet"]
	    },
	    {
	    	name: "../concord/concord_sheet_widgets.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	
	    	copyrightFile: "copyright.txt",
	    	dependencies: ["concord.concord_sheet_widgets"]
	    },
	    {
	    	name: "../concord/concord_sheet_extras.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	
	    	copyrightFile: "copyright.txt",
	    	dependencies: ["concord.concord_sheet_extras"]
	    },
	    {
	    	name: "../concord/concord_sheet_mobile.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	
	    	copyrightFile: "copyright.txt",
	    	dependencies: ["concord.concord_sheet_mobile"]
	    },
	    {
	    	name: "../concord/concord_pres.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	  
	    	copyrightFile: "copyright.txt",
	    	dependencies: ["concord.concord_pres"]
	    },
		{
			name: "../concord/concord_sheet_view.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],			
	    	copyrightFile: "copyright.txt",			
			dependencies: [
				"concord.concord_sheet_view"
			]
		},
		{
			name: "../concord/concord_view.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],			
	    	copyrightFile: "copyright.txt",			
			dependencies: [
				"concord.concord_view"
			]
		},
	    {
	    	name :"../concord/concord_RTE.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	
	    	copyrightFile:"copyright.txt",
	    	dependencies:["concord.concord_RTE"] 
	    },
	    {
	    	name :"../concord/concord_RTE_plus.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],	    	
	    	copyrightFile:"copyright.txt",
	    	dependencies:["concord.concord_RTE_plus"] 
	    },
		{
			name: "../concord/scenes/ErrorScene.js",
			customBase: true,
			layerDependencies: [
				"../dojo/dojo.js"
			],			
	    	copyrightFile: "copyright.txt",			
			dependencies: [
				"concord.scenes.ErrorScene"
			]
		}
	]	
}
