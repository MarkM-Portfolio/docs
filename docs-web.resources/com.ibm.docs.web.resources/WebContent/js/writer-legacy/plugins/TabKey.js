dojo.provide("writer.plugins.TabKey");
dojo.require("writer.plugins.Plugin");

dojo.declare( "writer.plugins.TabKey",
		[writer.plugins.Plugin], {
		_firstLineOffset: 21,	// Unit is pt, same with indent
		init: function(){
			var plugin = this;
			var tabCmd = 
			{
				exec: function()
				{
					var isShift = (this.getName() == "shiftTab");
					
					var selection = pe.lotusEditor.getSelection();
					if (!selection) return;				
					var ranges = selection.getRanges();
					if (!ranges || ranges.length == 0)	return;
					
					var paras = pe.lotusEditor.getSelectedParagraph();
					var para = paras[0];
					if(!para){
						console.error("the range has select no para, it must be incorrect");
						return;
					}
					var msgs = [];
					
					var cell = writer.util.ModelTools.getParent(para, writer.MODELTYPE.CELL);
					if(cell){
						plugin._navigateTable(msgs, cell, paras, isShift, selection);
					}
					else if(paras.length > 1){
						if(ranges[0].isStartOfPara())
							pe.lotusEditor.execCommand(isShift ? "outdent" : "indent");
						else
							pe.lotusEditor.getShell().insertText("\t");
					}	
					else{
						if(ranges[0].isStartOfPara()){
							var isCollapsed = ranges.length > 1 ? false : ranges[0].isCollapsed();
							if(isCollapsed || ranges[0].isEndofPara())
								plugin._changeFirstLine(msgs, para, isShift);
							else
								pe.lotusEditor.getShell().insertText("\t");
						}
						else{
							pe.lotusEditor.getShell().insertText("\t");
						}	
					}
					
					WRITER.MSG.sendMessage( msgs );
					
					return true;
				}
			};
			
			var ctrlTabCmd = {
				exec: function(){
					pe.lotusEditor.getShell().insertText("\t");	// Ensure can insert Tab in table
					return true;
				}
			};
			
			this.editor.addCommand("tab", tabCmd, dojo.keys.TAB); // Tab
			this.editor.addCommand("shiftTab", tabCmd, writer.SHIFT + dojo.keys.TAB ); // Shift + Tab
			this.editor.addCommand("ctrlTab", ctrlTabCmd, writer.CTRL + dojo.keys.TAB); // Ctrl + Tab
		},
		
		_navigateTable:function(msgs, cell, paras, isShift, selection)
		{
			var selectedCell = null;
			var text = "";
			var nls = dojo.i18n.getLocalization("writer","lang");
			// notify spell check
			dojo.publish(writer.EVENT.CURSORCOMMAND, ["tab", selection.getRanges()[0]]);

			// Navigate cell
			var lastCell = paras.length > 1 ? writer.util.ModelTools.getParent(paras[paras.length - 1], writer.MODELTYPE.CELL) : null;
			if(cell != lastCell && paras.length > 1)
			{
				// Select multiple cell, will select the first cell
				selectedCell = cell;
			}
			else if(isShift)
			{
				// Select previous cell
				selectedCell = cell.previous();
				if(!selectedCell)
				{
					var preRow = cell.parent.previous();
					selectedCell = preRow && preRow.lastChild();
				}
			}
			else
			{
				selectedCell = cell.next();
				if(!selectedCell)
				{
					var nextRow = cell.parent.next();
					if(!nextRow)
					{
						pe.lotusEditor.execCommand("insertRowBelow");
						text = nls.ACC_uniformTable + " ";
						nextRow = cell.parent.next();
						selectedCell = nextRow.firstChild();
					}	
					else{
						selectedCell = nextRow.firstChild();
					}
						
				}	
			}	
			
			if(selectedCell != null)
			{
				// Select it
				
				var start = {}, end = {};
				start.obj = selectedCell.firstChild();
				start.index = 0;
				end.obj = selectedCell.lastChild();
				end.index = end.obj.getLength();
				
				var range = new writer.core.Range(start, end, selection.getRanges()[0].rootView);
				selection.selectRanges([range]);
				selection.scrollIntoView();
				if(dojo.isFF){
					var row;
					if(selectedCell)
						row =  writer.util.ModelTools.getRow(selectedCell);
					if(selectedCell && row){						
						text += selection.getSelectedText(nls);
						text +=" ";
						text +=  dojo.string.substitute(nls.acc_inTable,[row.getRowIdx(), selectedCell.getColIdx()]) ;
						pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(text);
					}
				}
			}	
		},
		
		_changeFirstLine: function(msgs, para, isShift)
		{
			var indentLeft = para.directProperty.getIndentLeft();
			if( para.isList() || indentLeft != 0)
			{
				pe.lotusEditor.execCommand(isShift ? 'outdent' : 'indent');
			}
			else
			{
				var msg = null;
				var directProp = para.directProperty;
				var specialIndent = directProp.getIndentSpecialType();
				var specialIndentVal = directProp.getIndentSpecialValue();
				if(isShift)
				{
					if(specialIndent == "firstLine")
					{
						if(specialIndentVal > this._firstLineOffset)
						{
							var delta = specialIndentVal % this._firstLineOffset;
							if(delta == 0)
								delta = plugin._firstLineOffset;
							specialIndentVal -= delta;
							msg = para.setIndentSpecialTypeValue(specialIndent, specialIndentVal + "pt");
						}
						else{
							// Remove first line
							msg = para.setIndentSpecialTypeValue('none', 'none');
						}		
					}
					else{
						pe.lotusEditor.execCommand('outdent');
					}	
				}
				else
				{
					if(specialIndent == "hanging")
						msg = para.setIndentSpecialTypeValue('none', 'none'); // Remove hanging
					else if(specialIndent == "firstLine")
					{
						// Add indent for all 
						pe.lotusEditor.execCommand('indent');
					}
					else	
						msg = para.setIndentSpecialTypeValue('firstLine', this._firstLineOffset+"pt"); // Add first line
				}	
				msg && msgs.push(msg);
			}
		}
});