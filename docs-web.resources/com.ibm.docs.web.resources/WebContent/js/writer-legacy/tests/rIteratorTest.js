/**
 * 
 */

dojo.provide("writer.tests.rIteratorTest");
dojo.require("writer.tests.Model");
dojo.require("writer.core.Range");
dojo.require("writer.common.RangeIterator");

doh.register("rIteratorTest", [
	function nextModel(){
		var doc = loadSampleDocument();
		var p = doc.container.getFirst(),firstRun,lastRun;
		var p2 = doc.container.next(p);
	    var p3 = doc.container.next(p2);
	    var p4 = doc.container.next(p3);
	    
	    
	},
	
	function nextRichText(){
		
		var doc = loadSampleDocument();
		var p1 = doc.container.getFirst(),firstRun,lastRun;
		var p2 = doc.container.next(p1);
	    var p3 = doc.container.next(p2);
	    var p4 = doc.container.next(p3);
	    var p=p4;
	    //in one paragraph.
		firstRun = p.container && p.container.first && p.container.first.content;
		while(firstRun){
			lastRun=firstRun;
			while(lastRun) {
				for(var i=0;i<firstRun.length;i+=3){
			    	for(var j=0;j<lastRun.length;j+=3){
			    		var range = new writer.core.Range( {'obj':firstRun,'index':i },{'obj': lastRun, 'index': j },doc);
			    		var rIterator = new writer.common.RangeIterator(range);
			    		doh.is(firstRun,range.startModel.obj);
						doh.is(lastRun,range.endModel.obj);
						
						var c = rIterator.nextRichText(),n;
						doh.is(firstRun,c);
						while(n=rIterator.nextRichText()) {
							c=c.next();
							doh.is(c,n);
						}
						doh.is(lastRun,c);
			    	}
			    }
				lastRun=lastRun.next();
			}
			firstRun=firstRun.next();
		}
	    
		
		
	    firstRun = p1.container.first.content;
	    lastRun = p4.container.last.content;
	    
	    doh.t(firstRun);
	    doh.t(lastRun);
	    
	    var ranges=[];
	    ranges.push(new writer.core.Range({'obj':firstRun,'index':0},{'obj': lastRun, 'index': 2 },doc));
	    //TODO:if range's startModel.obj and endModel.obj type is paragraph
	    ranges.push(new writer.core.Range({'obj':p1,'index':0},{'obj':p4,'index':2},doc));
		ranges.forEach(function(range){
			var rIterator = new writer.common.RangeIterator(range);
		    var nextRun = rIterator.next(function(m){return m.modelType=="run.text";});
		    var expect=firstRun,nextExpect;
		    
		    while(nextRun&&expect){
		    	console.log(expect);
		    	console.log(nextRun);
		    	doh.is(expect,nextRun);
		    	nextExpect=expect.next();
		    	if(!nextExpect){
		    		var para = expect.paragraph,newPara;
		    		if(para==p1) newPara=p2;
		    		if(para==p2) newPara=p3;
		    		if(para==p3) newPara=p4;
		    		expect = newPara && newPara.container.first.content;
		    	}
		    	else expect=nextExpect;
		    	nextRun=rIterator.next(function(m){return m.modelType=="run.text";});
		    }
		});
	}]);