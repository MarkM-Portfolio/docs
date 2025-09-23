dojo.provide("writer.plugins.EnterKey");
dojo.require("writer.plugins.Plugin");

dojo.declare( "writer.plugins.EnterKey",
		[writer.plugins.Plugin], {
			init: function(){
				var enterCommand = 
				{
					exec: function()
					{
						var tools = writer.util.ModelTools;
						var isInFirstCell = function(p)
						{
							var cell = p.parent;
							if(tools.isCell(cell))
							{
								var table = cell.getTable();
								var colIdx = cell.getColIdx();
								if(colIdx!=0){
									return false;
								}
								var row = cell.parent;
								var rowIdx = row.getRowIdx();
								if(rowIdx!=0){
									return false;
								}
								return table;
							}
							
							return false;
						};
						
						var getToc = function( p ){
							if( p.parent && p.parent.modelType == writer.MODELTYPE.TOC )
								return p.parent;
							return null;
						};
						
						var selection = pe.lotusEditor.getSelection();
						var ranges = selection.getRanges();
						var range = ranges[0];

						// check if the drawing obj selected.
						if (range)
						{
							var drawingObj = writer.util.RangeTools.ifContainOnlyOneDrawingObj(range);
							if (drawingObj)
							{
								var vTools = writer.util.ViewTools;
								if (vTools.isTextBox(drawingObj))
								{
									// if has text content in it, enter the content editing.
									var paras = drawingObj.getContainer();
									if (paras.length() > 0)
									{
										selection.moveTo(paras.getFirst(), 0);
									}

								}
								else if (vTools.isImage(drawingObj)
									|| vTools.isCanvas(drawingObj))
								{
									// do nothing now.
								}

								return;
							}
						}

						if(!writer.util.RangeTools.canDo(ranges)){
							/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
							return;
						}
						if( range.isCollapsed()){
							// range is collapse, and it is in link, when press enter, open link
							var model = range.getStartModel().obj;
							var index = range.getStartModel().index;
							if(tools.isInLink(model)){
								var p = model.parent;
								if(index != 0 && index != model.length){
									pe.lotusEditor.execCommand( 'openlink' );
									return true;
								}
								if(p && (p.start < model.start && p.start+p.length > model.start +model.length)){
									pe.lotusEditor.execCommand( 'openlink' );
									return true;
								}									
							}
							
						}
						WRITER.MSG.beginRecord();
						try{
							var msgs = [];
							if(!range.isCollapsed() ){
								 msgs = range.deleteContents(true,true);
							}
							
							var start = range.getStartParaPos();
							if( !start )
								return false;
							var para = start.obj;
							var index = start.index;
							var newPara = null;
							var cmdId = "enter";
							if(para.text == '' && para.isList())
							{
								var listLvl = para.getListLevel();
								var cmdName = (listLvl == 0) ? "removeList" : "outdent";
								pe.lotusEditor.execCommand(cmdName);
							}
							else{
								newPara = para.split(index, msgs);
								
								var moveCursor = false;
								if(index == 0){
									var curBlock = isInFirstCell(para)||getToc(para);
									if(curBlock && !para.previous() && !tools.isParagraph(curBlock.previous()))
									{
										para = curBlock;	// Insert new paragraph before table when the table is the first object.
										moveCursor = true;
									}
									para.parent.insertBefore(newPara,para);
									cmdId = "enter_before";
								}else{
									para.parent.insertAfter(newPara,para);
								}
								msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ) );							
	
								// fix issue 39665 - reset the previous paragraph
								var m = index == 0 ? newPara : para;
									m.markReset();
								
								// fix issue 41230 - reset the next paragraph if exist							
								var n = index == 0 ?  para : newPara;
								var n = tools.getNext( n, null, false );
								if(n && n.modelType == writer.MODELTYPE.PARAGRAPH){
									n.markReset();
								}
							}
							if(msgs.length > 0)
								WRITER.MSG.sendMessage( msgs, cmdId );
						}
						catch(e){
							console.error("Press enter: " + e);
						}
						
						para.parent.update();
						
						if(moveCursor || (index != 0 && newPara != null))//there is no need to move the focus if enter from the beginning of the paragraph
						{
							range.setStartModel(newPara, 0);
							range.collapse( true );
							selection.selectRangesBeforeUpdate([range], true);
						}
						else
							selection.scrollIntoView();
						
						WRITER.MSG.endRecord();
					}
				};
				
				this.editor.addCommand("enter", enterCommand, dojo.keys.ENTER);
		}
});