dojo.provide("writer.plugins.Indent");
dojo.require("writer.plugins.Plugin");

dojo.declare( "writer.plugins.Indent",
		[writer.plugins.Plugin], {
		_indentOffset: 21,	// Unit is pt
		init: function(){
			var plugin = this;
			var indentCmd = 
			{
				exec: function()
				{
					var isOutdent = (this.getName() == "outdent");
					
					var offset = isOutdent ? (0 - plugin._indentOffset) : plugin._indentOffset;
					
					var msgs = [], msg;
					var paras = pe.lotusEditor.getSelectedParagraph();
					var para = paras[0];
					
					if(plugin._isSameList(paras))
					{
						if(para.isFirstListItem() && para.getListLevel() == 0){	
							// 1. Select include the first item, indent all list
							plugin._indentList(para.list, offset, msgs);
						}
						else{
							// 2 Else change the list level
							for(var i = 0; i < paras.length; i++)
							{
								para = paras[i];
								var curLevel = para.getListLevel();
								var oldLvl = curLevel;
								if(isOutdent)
								{
									if(curLevel > 0)
										curLevel -= 1;
								}
								else
								{
									curLevel += 1;
									if(curLevel > 8)	// Do nothing
										continue;
								}
								
								if(para.isHeadingOutline())
								{
									msg = null;
									var headingStyle = "Heading" + (curLevel + 1);
									plugin.editor.setHeadingStyle(para, headingStyle, msgs);
								}	
								else
									msg = para.setListLevel(curLevel);
								msg && msgs.push(msg);
								
//								if(curLevel == 0)
								if(curLevel != oldLvl)	// Defect  41714
								{
									// Remove paragraph indent value
									msg = para.setIndent("none");
									msg && msgs.push(msg);
								}	
							}	
						}
					}
					else
					{	
						// 3. Other case change selected paragraph's indent.
						for(var i = 0; i < paras.length; i++)
						{
							para = paras[i];
							var indentLeft = para.directProperty.getRealIndentLeft();
							if(indentLeft == para.directProperty.getDefaultVal())
								indentLeft = para.directProperty.getIndentLeft();
							indentLeft += offset;
							if(indentLeft < 0)
								indentLeft = 0;
							msg = para.setIndent(indentLeft + "pt");
							msg && msgs.push(msg);
						}
					}
					
					WRITER.MSG.sendMessage( msgs );
				}
			};
				
			this.editor.addCommand("indent", indentCmd, writer.CTRL + 77); // Ctrl + M
			this.editor.addCommand("outdent", indentCmd, writer.CTRL + writer.SHIFT + 77 ); // Ctrl + Shift + M
		},
		_indentList: function(list, offset, msgs)
		{
			var numDefinitions = list.absNum.getNumDefinition();
			var oldLeftValue, numDef, pPr;
			for(var i = 0; i < numDefinitions.length; i++)
			{
				numDef = numDefinitions[i];
				pPr = numDef.getParaProperty();
				oldLeftValue = pPr.getIndentLeft();
				if(oldLeftValue == "none")
					oldLeftValue = 0;
				
				// The first level can't be outdent, do nothing
				if(i == 0)
				{
					if(oldLeftValue <= this._indentOffset  && offset < 0)
						return;
					else if(oldLeftValue > 0 && (oldLeftValue + offset) < 0)
						offset = (0 - oldLeftValue);
				}
				
//				if( pPr.getIndentSpecialType() == "hanging" )
//					oldLeftValue += pPr.getIndentSpecialValue();
				
				pPr.setIndentLeft(oldLeftValue + offset + "pt");
				pPr.getMessage();
			}	
			
			var numId = list.id;
			var Json = {'leftChange':offset+'pt'};
			var oJson = {'leftChange': (0 - offset) +'pt'};
			msgs && msgs.push(WRITER.MSG.createMsg( WRITER.MSGTYPE.List,  [WRITER.MSG.createSetListAttributeAct( numId,Json,oJson,WRITER.ACTTYPE.IndentList )],WRITER.MSGCATEGORY.List  ));
			// update all the paragraph indent left property if the paragraph property's indent left value is > 0
			list.reset();
		},
		_isSameList: function(paras)
		{
			var para = null, listId;
			for(var i = 0; i < paras.length; i++)
			{
				para = paras[i];
				if(!para.isList())
					return false;
				
				if(i == 0)
				{
					listId = para.list.id;
				}
				else if(listId != para.list.id)
					return false;
			}	
			
			return true;
		}
});