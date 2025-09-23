dojo.provide("writer.plugins.FootEndNotes");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.core.Event");
dojo.declare("writer.plugins.FootEndNotes",
[writer.plugins.Plugin], {
	init: function() {
		dojo.subscribe(writer.EVENT.BEFORE_SELECT, this, function( ranges ){
			var mt = writer.MODELTYPE;
			for( var rangeIdx= 0; rangeIdx< ranges.length; rangeIdx++ ){
				
			}
		});
	}
	
});