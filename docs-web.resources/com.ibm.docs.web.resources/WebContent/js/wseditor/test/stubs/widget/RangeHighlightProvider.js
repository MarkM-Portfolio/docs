dojo.provide("websheet.widget.RangeHighlightProvider");
dojo.provide("websheet.test.stubs.widget.RangeHighlightProvider");
dojo.declare('websheet.widget.RangeHighlightProvider', null, {

	constructor: function(editor)
    {
		
    },
    
    highlightRange: function()
    {
    	return [new websheet.widget._SelectRectangle()];
    },
    
    removeHighlight: function()
    {
    	
    },
    
    highlightRangeInString: function()
    {
    	return [new websheet.widget._SelectRectangle()];
    }
    
});