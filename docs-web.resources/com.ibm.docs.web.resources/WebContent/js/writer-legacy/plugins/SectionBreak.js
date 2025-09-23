dojo.provide("writer.plugins.SectionBreak");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.util.SectionTools");

dojo.declare( "writer.plugins.SectionBreak",
		[writer.plugins.Plugin], {
			init: function(){
				var pbCommand = 
				{
					exec: function()
					{
						var secTools = writer.util.SectionTools;
						
						// be in table?
						
						
						// get split position
						var msgs = [];
						var selection = pe.lotusEditor.getSelection();
						var range = selection.getRanges()[0];
						var startModel = range.getStartModel().obj;
						var isInTable = writer.util.ModelTools.inTable(startModel);
						var startView = range.getStartView();
						if (!startView)
							return;
						var currSect = secTools.getCurrentSection(startView.obj);
						if (!currSect)
						{
							console.error("cannot find current section!");
							return;
						}
						
						var start = range.getStartParaPos();
						if( !start &&!isInTable)
						{
							console.error("insert position not exist in range when insert section break!");
							return false;
						}
						
					
						
					
					
						
						// get current section ID
						
						
						
						// generate new section, and insert it to setting.
						var newSect = currSect.clone();
						var newSecId = secTools.getNewSectionId();
						newSect.setId(newSecId);
						var oldSecJson = currSect.toJson();
						var sectChg = false;
						for (var i = writer.HF_TYPE.BEGIN; i < writer.HF_TYPE.END; ++i)
						{
							var oldHF = currSect.getHeaderFooterByType(i);
							newSect.setHeaderFooterByType(i, oldHF);
							currSect.setHeaderFooterByType(i, null);
							if(oldHF != null){
								sectChg = true;
							}
						}
						var newSecJson = currSect.toJson();
						if(sectChg){
							var sectAct = WRITER.MSG.createReplaceKeyAct(currSect.getId(), oldSecJson, newSecJson, WRITER.KEYPATH.Section);
							msgs.push( WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [sectAct], WRITER.MSGCATEGORY.Setting));
						}
						var setting = pe.lotusEditor.setting;
						var idx = setting.getSectionIndex(currSect.getId());
						secTools.insertSection(newSect, idx, msgs);
						
						
						if(isInTable){
							var currentRow = writer.util.ModelTools.getRow(startModel);
							var table = currentRow.parent;
							var plugin = this._editor.getPlugin("Table");							
							var ret = plugin.splitTable(table,currentRow);
							var doc = table.parent;
							var newPara = new writer.model.Paragraph(writer.util.ModelTools.getEmptyParagraphSource(),doc);
							newPara.setSectionId(newSect.getId());
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
							doc.update();
							WRITER.MSG.sendMessage(msgs);
							range.setStartModel( cursorObj, cursorIdx);
							range.collapse( true );
							selection.selectRanges([range]);
							selection.scrollIntoView();						
						}else{
							var para = start.obj;
							//defect 44283?Insert one table, select all, then insert page/section break, break is inserted in first cell.
							var table = writer.util.ModelTools.getTable(para);
							if(table){
								para = table;
								var index = 0;
							}else{
								var index = start.index;
							}								
							var updatePara;
							var newPara;
							
							var moveCursor = false;
							if(index == 0)
							{
								var prePara = para.previous();

								if (prePara && writer.util.ModelTools.isParagraph(prePara)
									&& !(prePara.directProperty && prePara.directProperty.getSectId()))
								{
									/* if the paragraph has previous paragraph without sect id,
									 * then add sect id to prev para
									*/
									updatePara = prePara;
								}
								else
								{
									// split paragraph
									if(writer.util.ModelTools.isParagraph(para)){
										newPara = para.split(index, msgs);
									}else{
										newPara = writer.util.ModelTools.createEmptyParagraph(para.parent);
									}									
									/*
										newPara	-> add new sec id
										--------split-------------
										para	-> no change
									*/
									newPara.setSectionId(newSect.getId(), false);
									para.parent.insertBefore(newPara,para);
									updatePara = newPara;
								}
							}
							else
							{
								// split paragraph
								newPara = para.split(index, msgs);
								/*
									para	-> add new sec id
									--------split-------------
									newPara	-> keep old para sec id
								*/
								para.parent.insertAfter(newPara,para);
								updatePara = para;
							}

							if (newPara)
								msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ) );

							// insert section, set section id in paragraph property
							if (updatePara != newPara)
							{
								var msg = updatePara.setSectionId(newSect.getId(), true);
								// Add the message to first for OT purpose.
								msg && msgs.unshift(msg);
							}
							
							// send message
							if(msgs.length > 0)
								WRITER.MSG.sendMessage( msgs );
							
							// update insert new section
							if (updatePara != newPara)
							{
								var views = updatePara.getRelativeViews("rootView");
								var paraView = views && views.getFirst();
								if (paraView)
									dojo.publish(writer.EVENT.UPDATEINSERTSECTION,[paraView, paraView.directProperty.getSectId()]);
							}
							updatePara.parent.update();

							// update cursor and selection
							if(moveCursor || (index != 0 && newPara != null))//there is no need to move the focus if enter from the beginning of the paragraph
							{
								range.setStartModel(newPara, 0);
								range.collapse( true );
								selection.selectRangesBeforeUpdate([range], true);
							}
							else
								selection.scrollIntoView();
						}
						
					}
				};
				
				this.editor.addCommand("sectionbreak", pbCommand);
				dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.onSelectionChange);
		},
		onSelectionChange: function(){
			var bInField		= false;
			var bInTextbox		= false;
			var bIntable		= false;
			var bInHeaderFooter	= false;
			var bInFootnotes = false;
			var bInEndnotes = false;
			var  bNestTable = false;
			var viewTools = writer.util.ViewTools;
			var selection = pe.lotusEditor.getSelection();
			var range = selection.getRanges()[0];
			if(!range)
			{
				this.editor.getCommand('sectionbreak').setState(writer.TRISTATE_DISABLED);
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
				var cell = writer.util.ViewTools.getTable(startViewObj);
				if(cell && writer.util.ViewTools.getCell(cell.getParent())){
					bNestTable = true;
				}
			}

			// in table?
//			plugin = this.editor.getPlugin("Table");
//			if( plugin )
//			{
//				var res = plugin.getStateBySel(this.editor.getSelection());
//				bIntable = res.isInTable; 
//			}
			
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
			
			this.editor.getCommand('sectionbreak').setState( !(bInField || bInTextbox  ||bNestTable|| bInHeaderFooter||bInFootnotes||bInEndnotes||bInToc) ? writer.TRISTATE_ON :writer.TRISTATE_DISABLED);
		}
});