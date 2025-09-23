dojo.provide("writer.tests.PageField");
(function(){
	var  paraJson = {
			"fmt" : [ {
				"style": {},
				"rt" : "rPr",
				"s" : 0,
				"l" : 9
			}, {
				"fmt" : [ {
					"style" : {
						"font-weight" : "bold"//,
					},
					"rt" : "rPr",
					"s" : 9,
					"l" : 1
				} ],
				"id" : "2",
				"instrText" : {
					"space" : "preserve",
					"t" : " PAGE   \\* MERGEFORMAT "
				},
				"rt" : "fld",
				"s" : 9,
				"l" : 1
			}, {
				"style" : {
					"font-weight" : "bold"//,
				},
				"rt" : "rPr",
				"s" : 10,
				"l" : 1
			}, {
				"style": {},
				"rt" : "rPr",
				"s" : 11,
				"l" : 1
			}, {
				"style" : {
					"font-weight" : "bold"//,
				},
				"rt" : "rPr",
				"s" : 12,
				"l" : 1
			}, {
				"style" : {
					"color" : "#808080",
					"space" : {
						"val" : "3.0pt"
					}
				},
				"rt" : "rPr",
				"s" : 13,
				"l" : 4
			}, {
				"style":{},
				"rt" : "rPr",
				"s" : 17,
				"l" : 6
			}],
			"c" : "Test page2 | Page field",
			"t" : "p",
			"id" : "1"
	} ;
	
	doh.register("PageField",[
         	    function testPageFieldLoad(){
         	    	var doc = loadDocument([ paraJson ]);
         	    	var p = doc.byId("1");
         	    	console.log(JSON.stringify(p.toJson(0,null,true)))
         	    	assertJSONEqual( paraJson, p.toJson(0,null,true) );
         	    },
         	    
         	    function testUpdatePageField(){
	         	   	var doc = loadDocument([ paraJson ]);
	     	    	var p = doc.byId("1");
	     	    	var field =p.byId("2");
	     	    	console.log(JSON.stringify(field.toJson(0,null,true)));
	     	    	field.updateText("3");
	     	    	console.log(JSON.stringify(p.toJson(0,null,true)));
	     	    	var para2 = dojo.clone( paraJson );
	     	    	para2.c = "Test page3 | Page field";
	     	    	assertJSONEqual( para2, p.toJson(0,null,true) );
         	    }
         	
         	]);
})();