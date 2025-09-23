/**
 * Unit test for plugins/styles.js
 */
dojo.provide("writer.tests.stylesTest");
dojo.require("writer.tests.Model");
dojo.require("writer.core.Range");

/*var splitRun= function(run,startIdx,len){
	if(!run || len < 0 || run.start>startIdx) return null;
	if(run.start+run.length < startIdx+len) len = run.start+run.length-startIdx;//reset len if out of the run.
	if(len < 0) return null;
	if(startIdx===run.start && run && run.length === len) return run;
	var first=null,third=null,//new parts.
		container = run && run.paragraph.container;//interface for properties operation.
	if(startIdx !== run.start) {//selection doesn't start at the beginning.
		first = run.clone();
		with(first){
			length = startIdx-run.start;
			markInsert();
		}
	}
	if(startIdx + len !== run.length+run.start) {//selection doesn't end at the end.
		third = run.clone();
		with(third){
			start = startIdx+len;
			length=run.length-(startIdx-run.start)-len;
			markInsert();
		}
	}
	with(run){//fix current as the second.
		start = startIdx;
		length = len;
		markDirty();
	}
	if(container && first) container.insertBefore(first,run);//insert new parts.
	if(container && third) container.insertAfter(third,run);
	return run;
};
*/doh.register("stylesTest", [
                              
    function splitRunInBold(){
    	var paraJson =  {
				'c' : 'Test Link element',
				't' : 'p',
				'id' : '1',
				'fmt' : [ {
					'rt' : 'rPr',
					's' : '0',
					'l' : '5'
				}, {
					'rt' : 'hyperlink',
					's' : '5',
					'history' : '1',
					'src' : 'http://www.ibm.com',
					'id' : '2',
					's' : '5',
					'l' : '4',
					'fmt' : [ {
						'rt' : 'rPr',
						'style' : {
							'styleId' : 'Hyperlink'
						},
						's' : '5',
						'l' : '4'
					} ]
				}, {
					'rt' : 'rPr',
					's' : '9',
					'l' : '1'
				}, {
					'rt' : 'rPr',
					'style' : {
						'font-weight' : 'bold'
					},
					's' : '10',
					'l' : '7'
				} ]
			};
		


			var result = {
			'fmt' : [ {
				'style' : {},
				'rt' : 'rPr',
				's' : 0,
				'l' : 5
			}, {
				'fmt' : [ {
					'style' : {
						'styleId' : 'Hyperlink'
					},
					'rt' : 'rPr',
					's' : 5,
					'l' : 4
				} ],
				'id' : '2',
				'rt' : 'hyperlink',
				'src' : 'http://www.ibm.com',
				's' : 5,
				'l' : 4,
				'history' : '1'
			}, {
				'style' : {},
				'rt' : 'rPr',
				's' : 9,
				'l' : 1
			}, {
				'style' : {
					'font-weight' : 'bold'
				},
				'rt' : 'rPr',
				's' : 10,
				'l' : 2
			}, {
				'style' : {
					'font-weight' : 'normal'
				},
				'rt' : 'rPr',
				's' : 12,
				'l' : 3
			}, {
				'style' : {
					'font-weight' : 'bold'
				},
				'rt' : 'rPr',
				's' : 15,
				'l' : 2
			} ],
			'c' : 'Test Link element',
			't' : 'p',
			'id' : '1',
			'rPr' : {},
			'pPr' : {}
		};
		var doc = loadDocument([ paraJson ]);
		var p = doc.byId("1");
		var runs = p.splitRuns(12,3);
		runs.forEach(function(run){
			run.setStyle({ 'font-weight':'normal' } );
		});
		console.log(JSON.stringify(p.toJson(0, null, true)));
		assertJSONEqual(result, p.toJson(0, null, true));
    	
    	
    },
	function splitRunInHyperLink(){
		var paraJson =  {
				'c' : 'Test Link element',
				't' : 'p',
				'id' : '1',
				'fmt' : [ {
					'rt' : 'rPr',
					's' : '0',
					'l' : '5'
				}, {
					'rt' : 'hyperlink',
					's' : '5',
					'history' : '1',
					'src' : 'http://www.ibm.com',
					'id' : '2',
					's' : '5',
					'l' : '4',
					'fmt' : [ {
						'rt' : 'rPr',
						'style' : {
							'styleId' : 'Hyperlink'
						},
						's' : '5',
						'l' : '4'
					} ]
				}, {
					'rt' : 'rPr',
					's' : '9',
					'l' : '1'
				}, {
					'rt' : 'rPr',
					'style' : {
						'font-weight' : 'bold'
					},
					's' : '10',
					'l' : '7'
				} ]
			};
		

		var result = {
		"fmt" : [ {
			"style" : {},
			"rt" : "rPr",
			"s" : 0,
			"l" : 5
		}, {
			"fmt" : [ {
				"style" : {
					"styleId" : "Hyperlink"
				},
				"rt" : "rPr",
				"s" : 5,
				"l" : 1
			}, {
				"style" : {
					"font-weight" : "bold",
					"styleId" : "Hyperlink"
				},
				"rt" : "rPr",
				"s" : 6,
				"l" : 2
			}, {
				"style" : {
					"styleId" : "Hyperlink"
				},
				"rt" : "rPr",
				"s" : 8,
				"l" : 1
			} ],
			"id" : "2",
			"rt" : "hyperlink",
			"src" : "http://www.ibm.com",
			"s" : 5,
			"l" : 4,
			"history" : "1"
		}, {
			"style" : {},
			"rt" : "rPr",
			"s" : 9,
			"l" : 1
		}, {
			"style" : {
				"font-weight" : "bold"
			},
			"rt" : "rPr",
			"s" : 10,
			"l" : 7
		} ],
		"c" : "Test Link element",
		"t" : "p",
		"id" : "1",
		"rPr" : {},
		"pPr" : {}
	};
		var doc = loadDocument([ paraJson ]);
		var p = doc.byId("1");
		var runs = p.splitRuns(6,2);
		runs.forEach(function(run){
			run.setStyle({ 'font-weight':'bold' } );
		});
		console.log(JSON.stringify(p.toJson(0, null, true)));
		assertJSONEqual(result, p.toJson(0, null, true));
	},
	
	function splitRunTest(){
		//TODO:
	/*	var doc = loadSampleDocument();
		var p1 = doc.container.getFirst();
	    var p2 = doc.container.next(p1);
	    var firstRun = p1.container.first.content;
	    var firstRunLen = firstRun.length;
	    var nextRun = p1.container.first.next.next.content;
	    var range = new writer.core.Range( {'obj':firstRun,'index': 2 },{'obj': nextRun, 'index': 6 },doc);
	    var start = range.startModel.obj;
	    var si=range.startModel.index;
	    var last = range.endModel.obj;
	    var li = range.endModel.index;
	    //case insert an empty run.
	    var result = splitRun(start,si,0);
	    doh.isNot(null,result);
	    doh.is(0,result.length);
	    doh.is(last,result.next().next().next());
	    //case len<0
	    result = splitRun(range.startModel.obj,range.startModel.index,-1);
	    doh.is(null,result);
	    //case run is null.
	    result = splitRun(null,2,2);
	    doh.is(null,result);
	    //case run is undefined.
	    result = splitRun(undefined,3,3);
	    doh.is(null,result);
	    //case startIdx<run.start.
	    result = splitRun(range.startModel.obj,range.startModel.obj.start-1,4);
	    doh.is(null,result);
	    //case len+startIdx > run.start+run.length. out of run's length. reset len. 
	    result = splitRun(range.startModel.obj,2,12);
	    doh.isNot(null,result);
	    doh.isNot(12,result.length);
	    doh.is(0,result.length);
	    //case startIdx > run.start+run.length
	    result = splitRun(range.startModel.obj,12,4);
	    doh.f(result);
	    result = splitRun(last,li+8,3);
	    doh.isNot(null,result);
	    doh.is(li+8,result.start);
	    doh.is(3,result.length);
	    */
//	    result = splitRun(range.startModel.obj,range.startModel.index+1,0);
//	    doh.isNot(null,result);
//	    doh.is(0,result.length);
	}
]);