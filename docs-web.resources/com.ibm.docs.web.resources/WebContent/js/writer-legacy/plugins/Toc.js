dojo.provide("writer.plugins.Toc");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.util.BidiUtils");

dojo.declare( "writer.plugins.Toc", [writer.plugins.Plugin], {
	/**
	 * check cmd status when selection change
	 */
	onSelectionChange: function(){
		var viewTools = writer.util.ViewTools;
		var selection = pe.lotusEditor.getSelection();
		var range = selection.getRanges()[0];
		if(!range)
		{
			this.editor.getCommand('createTOC').setState( writer.TRISTATE_DISABLED);
			return;
		}
		
		var startView = range.getStartView();
		var startViewObj = startView && startView.obj;
		var toc = this.getSelectedToc();
		var enable = ( toc == null ),plugin;
		
		if( toc != selection.hightToc  ){
			if( selection.hightToc )
				selection.hightToc.highLight( false );
			if( toc )
				toc.highLight( true );
			selection.hightToc = toc;
		}

		if (enable){
			// check textbox
			var textbox = writer.util.ViewTools.getTextBox(startViewObj);
			if (textbox)
				enable = false;
		}
		var editMode = pe.lotusEditor.getShell().getEditMode();
		if(editMode == EDITMODE.FOOTNOTE_MODE||editMode == EDITMODE.ENDNOTE_MODE){
			enable = false;
		}
		if( enable ){
		//check table
			plugin = this.editor.getPlugin("Table");
			if( plugin )
			{
				var res = plugin.getStateBySel(this.editor.getSelection());
				enable = !res.isInTable; 
			}
		}
		if( enable ){ //check header footer
			plugin = this.editor.getPlugin("HeaderFooter");
			if( plugin )
				enable = !( plugin.getCurrentHeaderFooter && plugin.getCurrentHeaderFooter()); 
		}
		var bInFootnotes = false;
		var bInEndnotes = false;
		plugin = this.editor.getPlugin("Footnotes");
		if(plugin){
			bInFootnotes = plugin.isInFootnotes();
		}
		plugin = this.editor.getPlugin("Endnotes");
		if(plugin){
			bInEndnotes = plugin.isInEndnotes();
		}
		enable = enable&&!bInFootnotes&&!bInEndnotes;
		this.editor.getCommand('createTOC').setState( enable ? writer.TRISTATE_ON :writer.TRISTATE_DISABLED);
	},
	/**
	 * get selected toc
	 * @returns
	 */
	 getSelectedToc: function ( selection ){
	 	if( !selection )
	 		selection = this.editor.getSelection();
		var ranges = selection.getRanges();
		if( ranges.length == 1 )
		{
			var range = ranges[0];
			var ancestor = range.getCommonAncestor( true );
			if( ancestor ){
				return ( ancestor.modelType == writer.MODELTYPE.TOC ) ? ancestor : writer.util.ModelTools.getParent( ancestor,writer.MODELTYPE.TOC);
			}
		}
		return null;
	 },
	 /**
	  * is hint in toc
	  * @param hint
	  * @returns
	  */
	 isInToc: function ( hint ){
		 return writer.util.ModelTools.isInToc( hint );
	 },
	
	init: function() {
		var editor = this.editor, plugin = this;
		//Commands
		var deleteTOCCmd = 
		{
			exec: function(){
				var toc = plugin.getSelectedToc();
				if( toc )
				{
					var	selection = editor.getSelection(),
					ranges = selection.getRanges();
					var msgs = [];
					writer.util.ModelTools.removeBlock( toc , ranges[0], msgs );
					
					toc.parent.update();
					pe.lotusEditor.updateManager.update();
					WRITER.MSG.sendMessage(msgs);
				}
			}
		};
		
		function getTocTabLength()
		{
			var	selection = editor.getSelection(),
			ranges = selection.getRanges();
			var viewPos = ranges[0].getStartView();
			
			var pxLength =  writer.util.ViewTools.getBody( viewPos.obj ).getWidth()-0.5;
			return common.tools.toPtValue( pxLength + "px" ) + "pt";
		}
		
		function updatePageNumber( para, msgs )
		{
			var styleId = para.getStyleId();
			if( !styleId || styleId == "TOCHeading" )
				return;
			
			var filterFunc = function( m ){
				   return m.isPageRef && m.isPageRef(); };
			var oldText = para.text;
			var delAct,insAct;
			var parent = para.parent;
			var pageNumber = writer.util.ModelTools.getNext( para, filterFunc, true, para );
			
			if( pageNumber ){
				delAct = WRITER.MSG.createDeleteElementAct( para );
				pageNumber.update( false, false );
			}
			if( para.text != oldText )
			{//replace toc item
				var newJson = para.toJson( 0, null, true ); 
				newJson.id = WRITER.MSG_HELPER.getUUID(); // Change ID to avoid OT
				var newPara = new writer.model.Paragraph( newJson, parent, true );
				parent.insertAfter(newPara,para);
				parent.remove(para);
				insAct = WRITER.MSG.createInsertElementAct( newPara );
				msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [delAct, insAct ] ));
			}
		}
		function updateTocNumber( toc )
		{ 
			var container = toc.container;
			var msgs = [];
			
			container.forEach(function( para ){
				updatePageNumber(para, msgs );
			});
			if( msgs.length )
			{
				toc.parent.update();
				WRITER.MSG.sendMessage(msgs);
			}
		}
		
		function getAnchorId( heading )
		{ //"_Toc...."
			var start_bm = writer.util.ModelTools.getChild( heading, function( model ){
				if( model.modelType == writer.MODELTYPE.BOOKMARK && model.t == "s" )
					return true;
			} );
			
			var bmId;
			if( !start_bm ){
				bmId = WRITER.MSG_HELPER.getUUID();
				start_bm = {
						"rt" : "bmk",
						"t" : "s",
						"id" :bmId,
						"name" : "_Toc"+  WRITER.MSG_HELPER.getUUID()
					};
				writer.util.ModelTools.insertInlineObject( start_bm, heading, 0 , false);
			}
// Do not create end bookmark now
//			else 
//				bmId = start_bm.id;
//			
//			var end_bm = writer.util.ModelTools.getChild( heading, function( model ){
//				if( model.modelType == writer.MODELTYPE.BOOKMARK && model.t == "e" )
//					return true;
//			} );
//			if( !end_bm )
//			{ //create book marks for heading
//				var end_bm = {
//						"rt" : "bmk",
//						"t" : "e",
//						"id" : bmId
//				};
//				writer.util.ModelTools.insertInlineObject( end_bm, heading, heading.text.length, false );
//			}
			return start_bm.name;
		}
		
		function createTOCItemJson( para, paraStyles, tocField, bfirst )
		{
			var styleId = para.getStyleId(), itemStyleId;
			
			var anchorId = getAnchorId( para ),
			pageNumber = "1";
			
			var text = para.text.trim();
			if( para.listSymbols )
				text = para.listSymbols.txt + text;
			text = text.replace(/\t/gi," ").replace(/\r/gi,"").replace(/\u0001/gi,"");
			if( !paraStyles )
			{
				if( styleId == "Caption")
					itemStyleId = "TableofFigures";
				else
				{
					var level = para.getOutlineLvl();
					if( level != null )//heading 
						itemStyleId = "TOC"+ (level+1);
					else
						return null;
				}
				
				paraStyles = {
						"styleId" : itemStyleId,
						"tabs" : [ {
							"t":"tab",
							"val" : "right",
							"leader" : "dot",
							"pos" : getTocTabLength()
						}]
				 };
			}
			else
			{
				// Defect 35104. Update paragraph style Id	
				if( styleId == "Caption")
					itemStyleId = "TableofFigures";
				else
				{
					var level = para.getOutlineLvl();
					if( level != null )//heading 
						itemStyleId = "TOC"+ (level+1);
					else
						return null;
				}
				
				paraStyles.styleId = itemStyleId;
			}	
			
			var textlength = text.length;
			if((para.directProperty.getDirection() == 'rtl') && (para.directProperty.getAlign() == 'right')) {
				paraStyles.direction = pe.lotusEditor.setting.isOdtImport() ? 'rl-tb' : 'rtl';
			} else {
				paraStyles.direction = 'ltr';
			}
			var obj = {
					"t" : "p",
					"id" :  WRITER.MSG_HELPER.getUUID(),
					"rPr" : {
						"rFonts" : {
							"eastAsiaTheme" : "majorEastAsia",
							"asciiTheme" : "minorHAnsi",
							"cstheme" : "minorBidi",
							"hAnsiTheme" : "minorHAnsi"
						},
						"preserve" : {}
					},
					"pPr": paraStyles,
					"c" : text + "\t" + pageNumber,
					"fmt":[],
					"s":0
				};
			obj.l = obj.c.length;
			
			
			//add hyper link
			//link contains heading text + 
			var textFmt = {
					"style" : {
						"styleId" : "Hyperlink",
						"preserve" : {}
					},
					"rt" : "rPr",
					"s" : '0',
					"l" : ''+ textlength
					},
			tabFmt =  {
					"style" : {
						"preserve" : {
							"webHidden" : "1"
						}
					},
					"tab":{"t":"tab"},
					"rt" : "rPr",
					"s" : ''+textlength,
					"l" : '1'
				},
			pageFieldFmt = {
					"rt" : "fld",
					"s" :  textlength+1,
					"l" : 1,
					"fld": writer.util.ModelTools.createFieldInstrTextJson( " PAGEREF "+anchorId+" \\h ", textlength+1, 1 ),
					"id" : WRITER.MSG_HELPER.getUUID(),
					"fmt" : [ {
						"style" : {
							"preserve" : {
								"webHidden" : "1"
							}
						},
						"rt" : "rPr",
						"s" :  ""+ ( textlength+1 ),
						"l" : '1'
					} ]
				},
			linkfmt = {
						"rt" : "hyperlink",
						"history" : "1",
						"anchor" : anchorId,
						"id" :  WRITER.MSG_HELPER.getUUID(),
						"s" : '0',
						"l" : ''+( textlength+2 ),
						"fmt" : [ textFmt, tabFmt, pageFieldFmt ]
				};

			if( bfirst || tocField ){
				if( !tocField || !tocField.fld){
					var string = " TOC \\o \"1-5\" \\h \\z \\u ";
					tocField = [
                     {
                         "fldType": "begin",
                         "l": "0",
                         "rt": "fld",
                         "s": "0",
                         "t": "r"
                     },
                     {
                         "fldType": "instrText",
                         "instrText": {
                             "attr_pre": {
                                 "space": "xml"
                             },
                             "space": "preserve",
                             "t": string
                         },
                         "l": "0",
                         "rt": "fld",
                         "s": "0",
                         "t": "r"
                     },
                     {
                         "fldType": "separate",
                         "l": "0",
                         "rt": "fld",
                         "s": "0",
                         "t": "r"
                     }
                 ];
				}
				else
					tocField = tocField.fld;
				
				var fieldfmt = {
						"fld": tocField,
                        "fmt": [],
                        "l": ""+(textlength+2),
                        "rt": "fld",
                        "s": "0",
                        "t": "r"
				};
				fieldfmt.fmt.push( linkfmt );
				obj.fmt.push( fieldfmt );
			}
			else {
				obj.fmt.push( linkfmt );
			}
			
			return obj;
		}
		
		function createEmptyTocJson(){
			return {
				 "t": "p",
					"id": WRITER.MSG_HELPER.getUUID(),
					"rsidR": "00794EB5",
					"rsidRDefault": "00794EB5",
					"fmt": [{
						"t": "fldSimple",
						"id": WRITER.MSG_HELPER.getUUID(),
						"instr": " TOC \\o \"1-5\" \\h \\z \\u ",
						"fmt": [{
							"t": "r",
							"rt": "rPr"
						}]
					}]
			};
		}
		
		function createEndTocFieldJson(){
			return {
                "c": "",
                "fmt": [
                    {
                        "fld": [
                            {
                                "fldType": "end",
                                "l": "0",
                                "rt": "fld",
                                "s": "0",
                                "style": {
                                    "font-weight": "bold",
                                    "preserve": {
                                        "bCs": "1",
                                        "noProof": {}
                                    },
                                    "t": "rPr"
                                },
                                "t": "r"
                            }
                        ],
                        "fmt": [],
                        "l": "0",
                        "rt": "fld",
                        "t": "r"
                    }
                ],
                "id": WRITER.MSG_HELPER.getUUID(),
                "rsidR": "00E30472",
                "rsidRDefault": "00E30472",
                "t": "p"
            };
		};
		
		function createContentsJson( headings )
		{
			var nls = dojo.i18n.getLocalization("writer","lang");
			var tocHeadingText =  nls.toc.title;
			var contents =[{
				"t" : "p",
				"id" : WRITER.MSG_HELPER.getUUID(),
				"pPr" : {
					"styleId" : "TOCHeading",
					"numPr":{"numId":{"val":-1},"ilvl":{"val":0}},
					"outlineLvl": {
						"val": -1
					}
				},
				"c" : tocHeadingText,
				"fmt" : [ {
					"rt" : "rPr",
					"s" : "0",
					"l" : ""+tocHeadingText.length
				} ]
			}];
			if( headings.length == 0 ){
				contents.push( createEmptyTocJson());
			}
			else
			{
				var i = 0;
				if((headings[0].directProperty.getDirection() == 'rtl') && (headings[0].directProperty.getAlign() == 'right')) {
					contents[0].pPr.direction = pe.lotusEditor.setting.isOdtImport() ? 'rl-tb' : 'rtl';
					contents[0].pPr.align = pe.lotusEditor.setting.isOdtImport() ? 'right' : 'left';
				} else {
					contents[0].pPr.direction = 'ltr';
				}
				dojo.forEach( headings, function( item ){
					var obj = createTOCItemJson( item, null, null, i==0 );
					obj && contents.push(obj) && i++;
				});
				//append an empty paragraph which has an end field
				contents.push( createEndTocFieldJson());
			}
			
			return contents;
		}
		
		function createTocStyles()
		{
			var tocHeading = {
				"type" : "paragraph",
				"name" : "TOC Heading",
				"basedOn" : "Heading1",
				"next" : "Normal",
				"uiPriority" : "39",
				"semiHidden" : "1",
				"unhideWhenUsed" : "1",
				"qFormat" : "1",
				"pPr" : {
					"outlineLvl" : {
						"val" : "9"
					}
				},
				"rPr" : {
					"preserve" : {
						"lang" : {
							"bidi" : "en-US"
						}
					}
				}
			};
			var toc1Style =  {
	      			"type" : "paragraph",
	    			"name" : "toc 1",
	    			"basedOn" : "Normal",
	    			"next" : "Normal",
	    			"autoRedefine" : "1",
	    			"uiPriority" : "39",
	    			"unhideWhenUsed" : "1",
	    			"qFormat" : "1",
	    			"pPr" : {
	    				"space" : {
	    					"after" : "5.0pt"
	    				}
	    			},
	    			"rPr" : {
	    				"rFonts" : {
	    					"ascii" : "Calibri",
	    					"eastAsia" : "宋体",
	    					"hAnsi" : "Calibri",
	    					"cs" : "Times New Roman"
	    				}
	    			}
	    		};
			var toc2Style = {
	    			"type" : "paragraph",
	    			"name" : "toc 2",
	    			"basedOn" : "Normal",
	    			"next" : "Normal",
	    			"autoRedefine" : "1",
	    			"uiPriority" : "39",
	    			"unhideWhenUsed" : "1",
	    			"qFormat" : "1",
	    			"pPr" : {
	    				"space" : {
	    					"after" : "5.0pt"
	    				},
	    				"indent" : {
	    					"left" : "11.0pt"
	    				}
	    			},
	    			"rPr" : {
	    				"rFonts" : {
	    					"ascii" : "Calibri",
	    					"eastAsia" : "宋体",
	    					"hAnsi" : "Calibri",
	    					"cs" : "Times New Roman"
	    				}
	    			}
	    		};
			var toc3Style = {
	    			"type" : "paragraph",
	    			"name" : "toc 3",
	    			"basedOn" : "Normal",
	    			"next" : "Normal",
	    			"autoRedefine" : "1",
	    			"uiPriority" : "39",
	    			"unhideWhenUsed" : "1",
	    			"qFormat" : "1",
	    			"pPr" : {
	    				"space" : {
	    					"after" : "5.0pt"
	    				},
	    				"indent" : {
	    					"left" : "22.0pt"
	    				}
	    			},
	    			"rPr" : {
	    				"rFonts" : {
	    					"ascii" : "Calibri",
	    					"eastAsia" : "宋体",
	    					"hAnsi" : "Calibri",
	    					"cs" : "Times New Roman"
	    				}
	    			}
	    		};
			var toc4Style = {
	    			"type" : "paragraph",
	    			"name" : "toc 4",
	    			"basedOn" : "Normal",
	    			"next" : "Normal",
	    			"autoRedefine" : "1",
	    			"uiPriority" : "39",
	    			"unhideWhenUsed" : "1",
	    			"qFormat" : "1",
	    			"pPr" : {
	    				"space" : {
	    					"after" : "5.0pt"
	    				},
	    				"indent" : {
	    					"left" : "33.0pt"
	    				}
	    			},
	    			"rPr" : {
	    				"rFonts" : {
	    					"ascii" : "Calibri",
	    					"eastAsia" : "宋体",
	    					"hAnsi" : "Calibri",
	    					"cs" : "Times New Roman"
	    				}
	    			}
	    		};
			var toc5Style = {
	    			"type" : "paragraph",
	    			"name" : "toc 5",
	    			"basedOn" : "Normal",
	    			"next" : "Normal",
	    			"autoRedefine" : "1",
	    			"uiPriority" : "39",
	    			"unhideWhenUsed" : "1",
	    			"qFormat" : "1",
	    			"pPr" : {
	    				"space" : {
	    					"after" : "5.0pt"
	    				},
	    				"indent" : {
	    					"left" : "44.0pt"
	    				}
	    			},
	    			"rPr" : {
	    				"rFonts" : {
	    					"ascii" : "Calibri",
	    					"eastAsia" : "宋体",
	    					"hAnsi" : "Calibri",
	    					"cs" : "Times New Roman"
	    				}
	    			}
	    		};
			var styles= [
				            {
				            	"name" : "Normal",
				            	"json" : null		// Use default Normal JSON data. 
				            }, {
				            	 "name" : "Heading1",
					             "json" : null		// Use default Heading JSON data. 
				            }, {
								"name" : "Hyperlink",
								"json" : null
							}, {
								"name" : "TOCHeading",
								"json" : tocHeading
							}, {
								"name" : "TOC1",
								"json" : toc1Style
							}, {
								"name" : "TOC2",
								"json" : toc2Style
							}, {
								"name" : "TOC3",
								"json" : toc3Style
							}, {
								"name" : "TOC4",
								"json" : toc4Style
							}
							, {
								"name" : "TOC5",
								"json" : toc5Style
							}
							, {
								"name" : "TOC6",
								"json" : toc5Style
							}
			             ];
			var msgs = [], msg;
			for( var i =0; i< styles.length;i ++ )
			{
				msg = editor.createStyle(styles[i].name, styles[i].json);
				msg && msgs.push(msg);
			}
			
			WRITER.MSG.sendMessage(msgs);
		}
		/**
		 * create table of content
		 */
		function createToc()
		{
			var msgs=[];
			//split para first
			var nextPara = editor.getShell().split();
			
			//Create TOC styles
			createTocStyles();
			var contents = createContentsJson( writer.util.ModelTools.getOutlineParagraphs() );
			var id = WRITER.MSG_HELPER.getUUID();
			var tocJson = {
					"t" : "sdt",
					"id": id,
					"sdtPr" : {
						"rPr" : {
							"space" : {
								"val" : "0.0pt"
							},
							"text-transform" : {
								"val" : "0"
							},
							"preserve" : {
								"szCs" : "11.0pt",
								"lang" : {
									"bidi" : "ar-SA"
								}
							},
							"font-size" : "11.0pt"
						},
						"docPartObj" : {
							"docPartGallery" : {
								"val" : "Table of Contents"
							},
							"docPartUnique" : {}
						}
					},
					"sdtContent": contents,
					"sdtEndPr" : {
						"rPr" : {
							"font-weight" : "bold",
							"preserve" : {
								"bCs" : "bold"
							}
						}
					}
			};
			
			msgs = []
			var toc = new writer.model.Toc( tocJson, editor.document );
			nextPara.parent.insertBefore(toc,nextPara);
			msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( toc )] ) );
			
			var selection = pe.lotusEditor.getSelection();
			var range = selection.getRanges()[0];
			range.moveToEditStart( nextPara );
			selection.selectRanges([range]);
			
			nextPara.parent.update( true );
			WRITER.MSG.sendMessage( msgs );
			updateTocNumber( toc );
		};
		
		var createTOCCmd = 
		{
			exec: function(){
				console.log("createTOCCmd");
				WRITER.MSG.beginRecord();
				try{
					createToc();
				}
				catch(e )
				{
					console.error("error in createTOCCmd !!!");
					console.error( e.message);
				}
				WRITER.MSG.endRecord();
			}
		};
		
		var updatePageNumberCmd = 
		{ 
			exec: function(){
				var toc = plugin.getSelectedToc();
				if( toc )
				{
					updateTocNumber( toc );
				}
			}
		};
		
		function getLinkAnchor( para )
		{
			var link = writer.util.ModelTools.getNext( para,writer.MODELTYPE.LINK, true, para );
			if( link ) 
				return link.anchor;
			else{
				var anchor;
				var pageField = writer.util.ModelTools.getNext( para, function( m ){
					 if(m.modelType == writer.MODELTYPE.FIELD ){
						var instr = m.getInstrText();
						var ret = instr && instr.t && instr.t.match(/\s*PAGEREF\s+(\w+)\s+/i);
						anchor = ret && ret[1];
						return !!anchor;
					 }
				}, true, para );
				return anchor;
			}
		}
		
		function createNewTabs (  para, tabs ){
			tabs = tabs || para.getDirectProperty().toJson().tabs;
			if( !tabs ){
				var styleId =  para.getStyleId();
				var refStyle = editor.getRefStyle(styleId);
				if( refStyle ){
					tabs = refStyle.getParagraphProperty().toJson().tabs;
				}
			}
			var ret = tabs;
			if( tabs && tabs.length )
			{
				var tablist = para.text.match(/\t/gi);
				var index = tablist && (tablist.length-1);
				if( index != null && index >=0 )
				{
					var tab = tabs[ index ];
					if( tab ){
						tab.pos = getTocTabLength();
						tab.val = "right";
					}
					else{
						tab = {
							"t":"tab",
							"val" : "right",
							"leader" : "dot",
							"pos" : getTocTabLength()
						}
					}
					ret = [tab];	
				}
			}
			return ret;
		};
		
		function updateReferencePara( para, msgs, bfirst, heading, oldTocSetting )
		{
			var anchor = getLinkAnchor( para );
			var parent = para.parent;
			if( anchor )
			{
				var doc = window.layoutEngine.rootModel,bm;
				function filterfunc( model ){
					return ( model.modelType == writer.MODELTYPE.BOOKMARK && model.name== anchor );
				}
				if( heading ){
					bm = writer.util.ModelTools.getNext( heading,filterfunc, true, heading );
				}
				else{
					bm = writer.util.ModelTools.getNext( doc, filterfunc, true );
				}
				
				if( bm )
				{ //update
					function filterFunc( m )
					{
						if( m.modelType == writer.MODELTYPE.FIELD )
						{
							var instrText = m.getInstrText();
							if( instrText && instrText.t && instrText.t.indexOf("TOC") && instrText.t.match(/"(\d+)-(\d+)"/))
								return true;
						}
					}
					var tocField = writer.util.ModelTools.getNext( para, filterFunc, true, para );
					if( tocField )
						tocField =tocField.toJson();
					var pDR = para.directProperty.toJson();
					pDR.tabs = createNewTabs( para, pDR.tabs ) || oldTocSetting.tabs;
					
					var newjson =  createTOCItemJson( bm.parent, pDR, tocField, bfirst );
					if( newjson)
					{
						var delAct = WRITER.MSG.createDeleteElementAct( para );
						var newPara = new writer.model.Paragraph( newjson, parent, true );
						parent.insertAfter(newPara,para);
						parent.remove(para);
						var insAct = WRITER.MSG.createInsertElementAct( newPara );
						msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [delAct, insAct ] ));
						return newPara;
					}
				}
			}
			//remove invalid toc item
			var act = WRITER.MSG.createDeleteElementAct( para );
			msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [act] ));
			parent.remove( para  );
			return null;
		}
		
		function hasAnchorBmk ( para, anchor )
		{
			return  writer.util.ModelTools.getNext( para, function( model ){
					if( model.modelType == writer.MODELTYPE.BOOKMARK && model.name== anchor )
						return true;
				}, true, para ) != null;
		
		}
		/**
		 * get toc template 
		 * {
		 *   'maxLevel': ...
		 *   'tabs': ...
		 * }
		 * @param toc
		 */
		function getTocSetting( toc ){
			var ret = {};
			ret["maxLevel"] = toc.getMaxLevel();
			ret["minLevel"] = toc.getMinLevel();
			var container = toc.container;
			container.forEach( function(para){
				var styleId = para.getStyleId();
				if(  styleId && styleId.match(/TOC[1-6]/)&& !ret["tabs"] ){
					ret["tabs"] = createNewTabs( para );
					return false;
				}
			});
			return ret;
		}
		
		function updateTOC()
		{//....
			var toc =  plugin.getSelectedToc();
			if( toc )
			{
				var selection = pe.lotusEditor.getSelection();
				if( selection.hightToc )//remove hight light
					delete selection.hightToc;
				
				var oldTocSetting = getTocSetting( toc );
				var headings = writer.util.ModelTools.getOutlineParagraphs( oldTocSetting["maxLevel"] );
					   
			    createTocStyles();
			    
				var container = toc.container;
				var msgs = [], lastItem;
				//remove paras 
				var lastPara, deletedParas = [];
				var endField, tocField =  toc.getTocField(), endFieldPara;
				container.forEach( function( para ){
					//remove para
					if( para.getStyleId() != "TOCHeading"){
						var field = writer.util.ModelTools.getChild( para, writer.MODELTYPE.FIELD );
						if( field && field.isTOCEnd() ){
							endField = field;
							endFieldPara = para;
						}
						else{
						//do not remove paragraph contains end field
						//for conversion export
							deletedParas.push(para);
						}
					}
					else
						lastPara = para;
					}
				);
				//for migration code
				var next_para = toc.next();
				if( next_para && writer.util.ModelTools.getChild( next_para, writer.MODELTYPE.FIELD ) ){
				//remove next end field 
					var act = WRITER.MSG.createDeleteElementAct( next_para );
					msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [act] ));
					next_para.parent.remove( next_para );
				}
				
				for( var i= 0; i< deletedParas.length; i++ )
				{
					var act = WRITER.MSG.createDeleteElementAct( deletedParas[i] );
					msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [act] ));
					toc.remove( deletedParas[i] );
				}
				
				
				for ( var i=0; i< headings.length; i++ )
				{ //update headings 
						var tocItemJson = createTOCItemJson( headings[i], null,(i==0 )? tocField:null, i==0 );
						if(oldTocSetting.tabs)
							tocItemJson.pPr.tabs = oldTocSetting.tabs;
						
						var newPara = new writer.model.Paragraph( tocItemJson, toc, true );
						
						if( lastPara )
							toc.insertAfter(newPara,lastPara);
						else
							toc.insertBefore( newPara,toc.getByIndex(0)); 
						
						msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [ WRITER.MSG.createInsertElementAct( newPara ) ] ));
						lastPara = newPara;
				}
				
				var newPara = null;
				if( headings.length == 0 ){
				// then create an empty paragraph which contains a simple toc field.
					if( endFieldPara ){
						var act = WRITER.MSG.createDeleteElementAct( endFieldPara );
						msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [act] ));
						toc.remove( endFieldPara );
					}
					 newPara = new writer.model.Paragraph( createEmptyTocJson(), toc, true );
				}
				
				else if( !endField ){
				// create empty paragraph which contains an end toc field.
					newPara = new writer.model.Paragraph( createEndTocFieldJson(), toc, true );
				}
				if( newPara ){
				//append empty para
					toc.insertAfter(newPara,lastPara);
					msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [ WRITER.MSG.createInsertElementAct( newPara ) ] ));
				}
				
				if( msgs.length )
				{
					var range = selection.getRanges()[0];
					range.moveToEditStart( toc );
					selection.selectRangesBeforeUpdate([range]);
				
					WRITER.MSG.sendMessage(msgs);
					toc.parent.update();
				}
				
				try{
					updateTocNumber( toc );
				}
				catch( e )
				{
					console.log( e.message );
				}
				//
			}
		}
		
		var updateTOCCmd = 
		{
			exec: function()
			{
				WRITER.MSG.beginRecord();
				try{
					updateTOC();
				}
				catch(e )
				{
					console.error( "updateTOCCmd error: "+ e.message);
				}
				
				WRITER.MSG.endRecord();
			}
		};
		
		 editor.addCommand( 'createTOC', createTOCCmd );			
		 editor.addCommand( 'deleteTOC',deleteTOCCmd);
		 editor.addCommand( 'updatePageNumber',updatePageNumberCmd);
		 editor.addCommand( 'updateTOC',updateTOCCmd );
		//Context menu
		var nls = dojo.i18n.getLocalization("writer","lang");
		var cmds ={
				updateToc:
				{
					label : nls.toc.update,
					commandID : 'updateTOC',
					group : 'tableofcontents',
					order : 'updateTOC',
					name  : 'updateToc'
				},
				
				deleteToc :
				{
					label : nls.toc.del,
					commandID : 'deleteTOC',
					group : 'tableofcontents',
					order : 'deleteTOC',
					name  : 'deleteToc'
				},
				pageNumber: 
				{
					label : nls.toc.pageNumber,
					commandID : 'updatePageNumber',
					group : 'update',
					order : 'updatePageNumber',
					name  : 'pageNumber'
				},
				entireTable: 
				{
					label : nls.toc.entireTable,
					commandID : 'updateTOC',
					group : 'update',
					order : 'updateEntireTOC',
					name  : 'entireTable'
				}
		};
		
		var ctx = this.editor.ContextMenu;
		if(ctx && ctx.addMenuItem){
			for(var k in cmds)
				ctx.addMenuItem(cmds[k].name,cmds[k]);
		}
		if(ctx && ctx.addListener) ctx.addListener(function(target,selection){
			var toc = plugin.getSelectedToc();
			if( toc )
				 if( toc.getTocField() ){
					 return {
							updateToc: {
								getSubItems:function(){
									return { pageNumber: false, entireTable: false};
								}
							},
							deleteToc: false
						};
				 }
				 else{
					 return {
							deleteToc: false
						};
				 }	
			else
				return {};
		});
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.onSelectionChange);
		
		//Table of Figures
		dojo.subscribe(writer.EVENT.UPDATE_REFERENCE, this, function( type ){
			if( type == "TableofFigures")
			{
				
				var doc = window.layoutEngine.rootModel;
				var paras = [], msgs = [];
				function isTableOfFigure( model ){
					if(  model.modelType == writer.MODELTYPE.PARAGRAPH && model.getStyleId() == type )
						return true;
				}
				var para = writer.util.ModelTools.getNext( doc, isTableOfFigure, true );
				
				while( para ){
					paras.push( para );
					para = writer.util.ModelTools.getNext( para,isTableOfFigure, false );
				};
				var newPara, newParas = [];
				for( var i =0 ; i < paras.length; i++ )
				{// update one paragraph
					newPara = updateReferencePara( paras[i],msgs );
					newPara && newParas.push(newPara);
				}	
				doc.update();
				//update number
				for( var i =0 ; i < newParas.length; i++ )
				{// update one paragraph
					updatePageNumber( newParas[i],msgs );
				}
				doc.update();
				WRITER.MSG.sendMessage(msgs);
			}
		});
	}
});