dojo.provide("writer.plugins.PageBreak");
dojo.require("writer.plugins.Plugin");

dojo.declare( "writer.plugins.PageBreak",
		[writer.plugins.Plugin], {
			/**
			 * check cmd status when selection change
			 */
			onSelectionChange: function(){
				var bInField		= false;
				var bInTextbox		= false;
				var bIntable		= false;
				var bInHeaderFooter	= false;
				var bInFootnotes = false;
				var bInEndnotes = false;
				var bNestTable = false;

				var viewTools = writer.util.ViewTools;
				var selection = pe.lotusEditor.getSelection();
				var range = selection.getRanges()[0];
				
				if(!range)
				{
					this.editor.getCommand('pagebreak').setState(writer.TRISTATE_DISABLED);
					return;
				}
				
				var startView = range.getStartView();
				var startViewObj = startView && startView.obj;

				// in field
				var plugin = this.editor.getPlugin("Field");
				if (plugin)
				{
					bInField = plugin.ifInField();
				}

				// in textbox?
				if (startViewObj)
				{
					var textbox = writer.util.ViewTools.getTextBox(startViewObj);
					if (textbox)
						bInTextbox = true;
					
					var table = writer.util.ViewTools.getTable(startViewObj);
					if(table && writer.util.ViewTools.getCell(table.getParent())){
						bNestTable = true;
					}
				}

				// in table?
//				plugin = this.editor.getPlugin("Table");
//				if( plugin )
//				{
//					var res = plugin.getStateBySel(this.editor.getSelection());
//					bIntable = res.isInTable; 
//				}
				
				// in header/footer?
				plugin = this.editor.getPlugin("HeaderFooter");
				if( plugin )
					bInHeaderFooter = plugin.getCurrentHeaderFooter && plugin.getCurrentHeaderFooter();
				plugin = this.editor.getPlugin("Footnotes");
				if(plugin){
					bInFootnotes = plugin.isInFootnotes();
				}
				plugin = this.editor.getPlugin("Endnotes");
				if(plugin){
					bInEndnotes = plugin.isInEndnotes();
				}
				
				plugin = this.editor.getPlugin("Toc");
				var bInToc = plugin && plugin.getSelectedToc();
				
				this.editor.getCommand('pagebreak').setState( !(bInField || bInTextbox ||bNestTable|| bIntable || bInHeaderFooter||bInFootnotes||bInEndnotes ||bInToc) ? writer.TRISTATE_ON :writer.TRISTATE_DISABLED);
			},

			init: function(){
				var pbCommand = 
				{
					exec: function()
					{
						
						var msgs = [];
						WRITER.MSG.beginRecord();
						try{
						// split para
						var selection = pe.lotusEditor.getSelection();
						var range = selection.getRanges()[0];
						
						if( !range.isCollapsed()){
							 msgs = range.deleteContents(true,true);
						}
						var currentMsgIndex = msgs.length;
						
						var startModel = range.getStartModel().obj;
						if(writer.util.ModelTools.inTable(startModel)){
							var currentRow = writer.util.ModelTools.getRow(startModel);
							var table = currentRow.parent;
							var doc = table.parent;
							var plugin = this._editor.getPlugin("Table");							
							var ret = plugin.splitTable(table,currentRow);
							var newPara = new writer.model.Paragraph(writer.util.ModelTools.getEmptyParagraphSource(),doc);
							newPara.insertRichText({c:"\r",fmt:[{br:{type:"page"},s:0,l:1, rt:"rPr"}]}, 0);
							var cursorObj = newPara;
							var cursorIdx = 0; 
							if(ret){
								msgs.push(WRITER.MSG.createMsg( WRITER.MSGTYPE.Table,ret.acts));							
								doc.insertAfter(newPara,table);							
								msgs.push(WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ));							
								var newTable = new writer.model.table.Table(ret.newTable,doc);
								newTable.updateConditonStyle("row");
								doc.insertAfter(newTable,newPara);
								msgs.push(WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newTable )] ));
							}else{
								doc.insertBefore(newPara,table);
								msgs.push(WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ));							
							}
						}else{
							var start = range.getStartParaPos();
							if( !start )
							{
								WRITER.MSG.endRecord();
								console.error("insert position not exist in range when insert page break!");
								return false;
							}

							var para = start.obj;
							//defect 44283£ºInsert one table, select all, then insert page/section break, break is inserted in first cell.
							var table = writer.util.ModelTools.getTable(para);
							if(table){
								para = table;
								var index = 0;
							}else{
								var index = start.index;
							}							
							var newPara = null;
							var updatePara = para;
							var doc = updatePara.parent;
							var cursorObj = updatePara;
							var cursorIdx = 0;

							
							var moveCursor = false;
							if(index == 0){
								newPara = writer.util.ModelTools.createEmptyParagraph(para.parent);
//								newPara.setSectionId("");
								para.parent.insertBefore(newPara,para);
								updatePara = newPara;
							}else{
								newPara = para.split(index, msgs);
								para.parent.insertAfter(newPara,para);
								//remove section property from the old 
								var message = para.setSectionId("", true);
								if (message){
									msgs.push(message);
								}
								updatePara = para;
								cursorObj = newPara;
							}
							msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ) );
						
							
							// insert page break
							var jsonContent = {c:"\r",fmt:[{br:{type:"page"},s:0,l:1, rt:"rPr"}]};
							updatePara.insertRichText(jsonContent,index);
							var actPair = WRITER.MSG.createInsertTextAct(index, 1, updatePara);
							msgs.push(WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]));
						}
						
						for( var i=currentMsgIndex; i< msgs.length; i++ ){
							msgs[i].msg.cmdId = "pagebreak";
						}
						WRITER.MSG.sendMessage(msgs);
						
						doc.update();
						}
						catch(e){
							
						}
						WRITER.MSG.endRecord();
		
						//reset selection
						range.setStartModel( cursorObj, cursorIdx);
						range.collapse( true );
						selection.selectRanges([range]);
						selection.scrollIntoView();
					}
				};
				
				this.editor.addCommand("pagebreak", pbCommand);

				dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.onSelectionChange);
		}
});