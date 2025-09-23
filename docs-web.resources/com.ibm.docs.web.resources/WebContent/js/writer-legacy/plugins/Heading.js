dojo.provide("writer.plugins.Heading");
dojo.require("writer.plugins.Plugin");

dojo.declare( "writer.plugins.Heading",
		[writer.plugins.Plugin], {
		HeadingStyles:{"Heading1":{"type":"paragraph","name":"heading 1","basedOn":"Normal","next":"Normal","qFormat":"1","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"17.0pt","after":"16.50pt","lineRule":"auto","line":"2.40830"},"outlineLvl":{"val":"0"}},"rPr":{"font-weight":"bold","font-size":"14.0pt"}},
					"Heading2":{"type":"paragraph","name":"heading 2","basedOn":"Normal","next":"Normal","qFormat":"1","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"13.0pt","after":"13.0pt","lineRule":"auto","line":"1.73330"},"outlineLvl":{"val":"1"}},"rPr":{"rFonts":{"asciiTheme":"majorHAnsi","eastAsiaTheme":"majorEastAsia","hAnsiTheme":"majorHAnsi","cstheme":"majorBidi"},"font-style":"italic", "font-size":"14.0pt"}},
					"Heading3":{"type":"paragraph","name":"heading 3","basedOn":"Normal","next":"Normal","qFormat":"1","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"13.0pt","after":"13.0pt","lineRule":"auto","line":"1.73330"},"outlineLvl":{"val":"2"}},"rPr":{"font-weight":"bold" ,"color":"#696969", "font-size":"12.0pt"}},
					"Heading4":{"type":"paragraph","name":"heading 4","basedOn":"Normal","next":"Normal","qFormat":"1","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"14.0pt","after":"14.50pt","lineRule":"auto","line":"1.56670"},"outlineLvl":{"val":"3"}},"rPr":{"rFonts":{"asciiTheme":"majorHAnsi","eastAsiaTheme":"majorEastAsia","hAnsiTheme":"majorHAnsi","cstheme":"majorBidi"}, "font-size":"11.0pt"}},
					"Heading5":{"type":"paragraph","name":"heading 5","basedOn":"Normal","next":"Normal","qFormat":"1","rsid":"00AE6F27","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"14.0pt","after":"14.50pt","lineRule":"auto","line":"1.56670"},"outlineLvl":{"val":"4"}},"rPr":{"font-style":"italic","font-size":"11.0pt"}},
					"Heading6":{"type":"paragraph","name":"heading 6","basedOn":"Normal","next":"Normal","qFormat":"1","rsid":"00AE6F27","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"12.0pt","after":"3.20pt","lineRule":"auto","line":"1.33330"},"outlineLvl":{"val":"5"}},"rPr":{"rFonts":{"asciiTheme":"majorHAnsi","eastAsiaTheme":"majorEastAsia","hAnsiTheme":"majorHAnsi","cstheme":"majorBidi"},"font-weight":"bold", "color":"#696969","font-size":"10.0pt"}},
					"Heading7":{"type":"paragraph","name":"heading 7","basedOn":"Normal","next":"Normal","qFormat":"1","rsid":"00AE6F27","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"12.0pt","after":"3.20pt","lineRule":"auto","line":"1.33330"},"outlineLvl":{"val":"6"}},"rPr":{"font-style":"italic","color":"#696969","font-size":"10.0pt"}},
					"Heading8":{"type":"paragraph","name":"heading 8","basedOn":"Normal","next":"Normal","qFormat":"1","rsid":"00AE6F27","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"12.0pt","after":"3.20pt","lineRule":"auto","line":"1.33330"},"outlineLvl":{"val":"7"}},"rPr":{"rFonts":{"asciiTheme":"majorHAnsi","eastAsiaTheme":"majorEastAsia","hAnsiTheme":"majorHAnsi","cstheme":"majorBidi"},"font-weight":"bold","font-size":"9.0pt"}},
					"Heading9":{"type":"paragraph","name":"heading 9","basedOn":"Normal","next":"Normal","qFormat":"1","rsid":"00AE6F27","pPr":{"keepNext":"1","keepLines":{},"space":{"before":"12.0pt","after":"3.20pt","lineRule":"auto","line":"1.33330"},"outlineLvl":{"val":"8"}},"rPr":{"rFonts":{"asciiTheme":"majorHAnsi","eastAsiaTheme":"majorEastAsia","hAnsiTheme":"majorHAnsi","cstheme":"majorBidi"},"font-style":"italic","font-size":"9.0pt"}},
					"Title":{"type":"paragraph","name":"Title","basedOn":"Normal","next":"Normal","qFormat":"1","pPr":{"space":{"before":"12.0pt","after":"3.0pt"},"align":"center","outlineLvl":{"val":"0"}},"rPr":{"font-size":"18.0pt"}},
					"Subtitle":{"type":"paragraph","name":"Subtitle","basedOn":"Normal","next":"Normal","qFormat":"1","pPr":{"space":{"before":"12.0pt","after":"3.0pt","lineRule":"auto","line":"1.30"},"align":"center","outlineLvl":{"val":"1"}},"rPr":{"font-style":"italic","color":"#696969","font-size":"16.0pt"}},
					"Normal":{"type":"paragraph","default":"1","name":"Normal","qFormat":"1","rPr":{"rFonts":{"ascii":"Arial"},"font-size":"10.0pt"}}
					},
		init: function(){
			var plugin = this;
			
			dojo.subscribe(writer.EVENT.FIRSTTIME_RENDERED, this, this.loadDefaultStyle);		
			var hCommand = 
			{
				exec: function(name)
				{
					var msgs = [];
					WRITER.MSG.beginRecord();
					try{
						var paras = pe.lotusEditor.getSelectedParagraph();
						for(var i = 0; i < paras.length; i++)
							plugin.editor.setHeadingStyle(paras[i],name,msgs);
							
						if(msgs.length > 0)
						{
							WRITER.MSG.sendMessage( msgs );
							// Fire event to update command state.
							setTimeout(function(){ dojo.publish(writer.EVENT.SELECTION_CHANGE); }, 0);
						}
					}
					catch(e){
						
					}
					WRITER.MSG.endRecord();
//					parent.update();
				}
			};
			
			this.createdNormal = false;
				
			this.editor.addCommand("headingFormat", hCommand);
			
			var selectionChange = function(){
				var status = writer.TRISTATE_OFF;
				if(writer.util.ModelTools.isInSmartart())
					status = writer.TRISTATE_DISABLED;
				
				this.editor.getCommand("headingFormat").setState(status);
			};
			dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, selectionChange);
			
//			var cleanParaProperty = {"alignment" : 1, "indent" : 1, "list" : 1};
//			var cleanRunProperty = {"font-size": 1, "font-family": 1, "font-weight": 1, "font-style":1, "strike":1};
//			var keepRunProperty = {"u": 1, "color": 1, "background-color": 1, "supscript": 1, "subscript": 1, "border" : 1};
			// Move to Paragraph
//			var cleanParagraph = function(para, msgs)
//			{
//				// Clean Paragraph property
//				var msg = para.setAlignment("none");
//				msg && msgs.push(msg);
//				
//				msg = para.setIndentRight("none");
//				msg && msgs.push(msg);
//				
//				msg = para.clearIndent();
//				msg && msgs.push(msg);
//				
//			};
			
			this.editor.setHeadingStyle = function(para,newStyle,msgs){
				var oldStyle = para.getStyleId();
				if(newStyle == "Normal" && oldStyle == null)
					return;
				if(para.parent.modelType == writer.MODELTYPE.TOC)
					return;
				// Some sample file defined style name is heading 1, but style id is not Heading 1.
				// Like style id is "Ttulo1", but style name is "heading 1". We need treat it as heading.
				if(newStyle.indexOf("Heading") == 0)
				{
					// Convert "Heading1" to "heading 1"
					var styleName = "heading " + newStyle.substring("Heading".length, newStyle.length);
					var style = this.getRefStyle(styleName);
					if(style)
						newStyle = style.getStyleId();
				}
				
				if(newStyle == oldStyle)
				{
					var refStyle = this.getRefStyle(newStyle);
					var styleProp = refStyle.getParagraphProperty();
					var styleListId = styleProp && styleProp.getNumId();
					var paraNumId = para.getListId();
					if(paraNumId != styleListId)
					{
						var msg = para.removeList(true);
						msg && msgs.push(msg);
					}
					
					return;
				}	
				
				var msg = para.removeList(true);
				msg && msgs.push(msg);
				
				para.cleanParagraphProperty(msgs);
				
				var styleMsgs = null;
				if(newStyle == "Normal")
				{
					// Set normal will remove list when it's heading outline
					if(oldStyle)
						styleMsgs = para.removeStyle(oldStyle);
				}
				else
				{
					var defaultParaStyle = this.getDefaultParagraphStyle();
					var defaultParaStyleName = defaultParaStyle ? defaultParaStyle.getStyleId() : null;
					if(!this.createdNormal)
					{
						this.createdNormal = true;
						if(!defaultParaStyle)
						{
							msg = this.createStyle("Normal");
							msg && msgs.push(msg);
						}
					}
					
					if(defaultParaStyleName != null && this.defaultStyle[newStyle])
					{
						if(this.defaultStyle[newStyle].basedOn)
							this.defaultStyle[newStyle].basedOn = defaultParaStyleName;
						if(this.defaultStyle[newStyle].next)
							this.defaultStyle[newStyle].next = defaultParaStyleName;
					}
					
					msg = this.createStyle(newStyle);
					msg && msgs.push(msg);
					
					styleMsgs = para.addStyle(newStyle);
				}
				
				for(var i = 0; styleMsgs && i < styleMsgs.length; i++)
					msgs.push(styleMsgs[i]);
				
				// fix issue 39403, update next model if it is paragraph or image
				var tools = writer.util.ModelTools;
				var m = tools.getNext( para, null, false );
				if(m && m.modelType == writer.MODELTYPE.PARAGRAPH){
					m.markReset();
				}
			};
		},
		_getDefaultFont:function(locale)
		{
			var defaultFont = {"cs":"Calibri","ascii":"Calibri","eastAsia":"Calibri","hAnsi":"Calibri"};
			return defaultFont;
		},
		loadDefaultStyle: function(){
			// Defect 41018, import ODF file has no theme. Need change the default font.
			var themeFont;
			var rel = this.editor.relations;
			var theme = rel&&rel.getTheme();
			
			var styleJson;
			for(var styleId in this.HeadingStyles)
			{
				styleJson = this.HeadingStyles[styleId];
				// No theme
				if(!theme && styleJson.rPr.rFonts && styleJson.rPr.rFonts.asciiTheme)
				{
					styleJson.rPr.rFonts = this._getDefaultFont();
				}	
				this.editor.defaultStyle[styleId] = styleJson;
			}
		}
});