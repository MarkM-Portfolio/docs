dojo.provide("writer.tests.Tab");
(function(){
	
	doh.register("TabLoad",[
	    function fromJson(){
	    	var doc = loadSampleDocument( );
	    	var len = doc.container.length();
//	    	doh.assertTrue( len == 2 );
	    	var p1 = doc.container.getFirst();
	    	doh.assertEqual( p1.text, getString( "Before a Tab\tAfter a Tab" ) );
	    	var p2 = doc.container.getLast();
	    	doh.assertEqual( p2.text,  getString( "fdsa" ) );
	    	return doc;
	    }
	
	]);
	
})();