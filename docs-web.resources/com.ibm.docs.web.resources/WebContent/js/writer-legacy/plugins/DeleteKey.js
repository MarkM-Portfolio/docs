dojo.provide("writer.plugins.DeleteKey");
dojo.require("writer.plugins.Plugin");
dojo.requireLocalization("writer","lang");
dojo.declare("writer.plugins.DeleteKey",
[writer.plugins.Plugin], {
	init: function() {
		//Merge paragraph
		var tools = writer.util.ModelTools;
		
		var deleteFn = function(isBackspace){
			var selection = pe.lotusEditor.getSelection();
			if (!selection){
				return;
			}
			var ranges = selection.getRanges();
			if (!ranges){
				return;
			}
			
			var msgs = [],
				range = ranges[0], 
				para = range.getStartParaPos().obj,
				doc = tools.getDocument(para);
			var cmdId = "deleteKey";
			if(!writer.util.RangeTools.canDo(ranges)){
				/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
				return;
			}
			for (var i=ranges.length-1;i>-1;i--){
				var range = ranges[i];
				if( !range.isCollapsed() ){
				//delete contents				
					msgs = msgs.concat( range.deleteContents( true, true ));
				}
				else if (range.isCollapsed()){
					//remove a char
					msgs = msgs.concat( range.deleteAtCursor( isBackspace ) );
					cmdId = isBackspace? "backSpace" : "deleteAtCursor";
				}
			}
			
			//send msgs
			
			if( doc.firstChild() == null )
			{
				tools.fixBlock(doc, range, msgs);
				selection.selectRangesBeforeUpdate([range]);
			}else if(ranges.length>1){
				var firstPara = writer.util.RangeTools.getFirstParaInRanges(ranges);
				var newRange = new writer.core.Range(firstPara,firstPara,range.rootView);
				selection.selectRangesBeforeUpdate([newRange]);
			}
			doc.update();
			WRITER.MSG.sendMessage( msgs, cmdId );
		};
		
		var backspaceCommand =
		{
				exec : function( )
				{
					deleteFn(true);
				}
		};
		
		var deleteCommand =
		{
				exec : function( )
				{
					deleteFn();
				}
		};
		
		this.editor.addCommand("backspace", backspaceCommand, 8);
		this.editor.addCommand("delete", deleteCommand, 46);
	}

});