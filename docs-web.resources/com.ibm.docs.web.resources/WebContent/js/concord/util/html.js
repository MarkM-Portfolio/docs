dojo.provide("concord.util.html");

dojo.declare("concord.util.html", null, {
	
});

concord.util.html.removeChildren = function(node) {
	if(node) {
		while(node.hasChildNodes()) {
			node.removeChild(node.lastChild);
		}	
	}			
};