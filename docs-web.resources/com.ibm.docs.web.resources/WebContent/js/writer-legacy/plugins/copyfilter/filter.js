dojo.provide("writer.plugins.copyfilter.filter");

dojo.declare( "writer.plugins.copyfilter.filter", null, {
	styles : {},
	absNumers : {},
	imgs : {},
	/**
	 * constructor
	 */
	constructor: function(){
		this.styles = {};
		this.imgs = {};
		this.absNumers = {};
	},
	/**
	 * filter model
	 * @param m
	 * @returns
	 */
	filter: function( m, editor ){
		
		this.editor = editor;
		
		if(m.modelType==writer.MODELTYPE.TABLE)
		{
			this.filterTable(m, editor);
			return;
		}
		else
		{
			this.filterParagraphProperty(m.directProperty);
			this.filterTextProperty(m.textProperty);
		}	
		
		if( m ){
			var that = this;
			var container = m.hints || ( m.getContainer && m.getContainer());
			if( container ){
				container.forEach( function( item ){
					that.filter( item, editor );
				} );
			}
		}
	},
	
	/**
	 * Pick style in table
	 * @param table
	 * @param editor
	 * @param startRow
	 * @param endRow
	 * @param startCol
	 * @param endCol
	 */
	filterTable: function(table, editor, startRow, endRow, startCol, endCol){
		this.editor = editor;
		startRow = startRow || 0;
		startCol = startCol || 0;
		endRow = (endRow != undefined) ? endRow : (table.rows.length() - 1);
		endCol = (endCol != undefined) ? endCol : table.getColumnCount();

		// Get table Style 
		var talbeStyleId = table.tableStyleId;
		talbeStyleId && this.addStyle( talbeStyleId );
		
		// Filter rows
		var tableMatrix = table.getTableMatrix();
		var that = this;
		
		var row = table.rows.getFirst();
		var i = 0;
		while(row){
			if(i >= startRow)
			{
				// Filter Cell
				var cells = tableMatrix.getRowMatrix(row);
				for(var j=startCol;j< endCol;j++){
					if(j > 0 && cells[j]==cells[j-1]){
						continue;
					}
					var paraContainer = cells[j].getContainer();
					if( paraContainer ){
						paraContainer.forEach( function( item ){
							that.filter( item, editor );
						} );
					}
				}
			}
			i++;
			if(i > endRow)
				break;
			
			row = table.rows.next(row);
		}
	},
	/**
	 * filter json, remove comments, task, indicator
	 * @param json
	 * @param editor
	 */
	filterJson: function( jsonData, editor, parentJson ){
		//remove comments, tasks...
		this.editor = editor;
		if( jsonData ){
			if (jsonData.anchor && jsonData.anchor.docPr && jsonData.anchor.docPr.isWMO)
			// remove water maker.
				return null;
			if( jsonData.rt == "bmk" || jsonData.rt == "fn" || jsonData.rt == "en" )
			//remove bookmark
				return null;
			//remove comments
			if( jsonData.rt && jsonData.cl&& jsonData.cl.length>0 ){
				delete jsonData.cl;
				delete jsonData.cselected;
			}
			if( jsonData.c )
				jsonData.c =jsonData.c.replace(/\u2028/," ");
			
			if( jsonData.br && jsonData.br.type == "page")
			//convert page break to shift enter
				return null;
			//console.info(jsonData)
			//remove taskId 
			if( jsonData.taskId != null )
				delete jsonData.taskId;
			
			if( parentJson == null )
				this.removeTocProperty(jsonData);
			
			else if(  !jsonData.t &&  jsonData.fmt  && this.isTocPara(parentJson)){
				jsonData.fmt = this.collectFmts( jsonData );
			}
			
			//remove section break
			if( jsonData.pPr && jsonData.pPr.secId )
				delete jsonData.pPr.secId;
			
			var children = writer.util.ModelTools.getJsonChildren( jsonData );
			if( children ){
				if( jsonData.fmt ){
				//paragraph or hints 
					var newChildren= [],
						child,
						isParagraph = ( jsonData.t == 'p' ),
						start = isParagraph ? 0 : ( ( jsonData.s )? parseInt( jsonData.s ) : 0 ),
						length = 0;
					for( var i = 0; i< children.length; i++ ){
						var child = this.filterJson(children[i], editor, jsonData );
						if( child){
							child.s = ""+ (start + length) ;
							length += parseInt( child.l);
							newChildren.push( child );
						}
						else if( jsonData.c && children[i].l ){
						//change text
							var l = parseInt( children[i].l);
							var text = jsonData.c;
							jsonData.c = text.substring( 0, length-start ) + text.substring( length-start+1 );
						}
					}
					jsonData.fmt = newChildren;
				}
				else {
					for( var i = 0; i< children.length; i++ ){
						this.filterJson(children[i], editor, jsonData);
					}
				}
			}
		}
		return jsonData;
	},
	/**
	 * is toc para
	 * @param jsonData
	 * @returns
	 */
	isTocPara: function( jsonData  ){
			return jsonData.pPr && jsonData.pPr.styleId &&jsonData.pPr.styleId.match(/TOC[1-6]/);
	},
	/**
	 * collect fmts 
	 * @param data
	 * @returns {Array}
	 */
	collectFmts: function( data ){
		var fmts = [];
		if( data.fmt ){
			for( var i = 0; i< data.fmt.length; i++ ){
				fmts = fmts.concat( this.collectFmts( data.fmt[i]));
			}
		}
		else if ( data.rt ){
			fmts.push( data );
		}
		return fmts;
	},
	/**
	 * remove toc property
	 * @param jsonData
	 */
	
	removeTocProperty: function( jsonData ){
		if( jsonData.pPr && jsonData.pPr.styleId ){
			var styleId = jsonData.pPr.styleId;
			if( styleId == "TOCHeading" )
				delete jsonData.pPr.styleId;
			else if ( styleId.match(/TOC[1-6]/) ){
				delete jsonData.pPr.styleId;
				if( jsonData.fmt ){
				//paragraph or hints 
					jsonData.fmt = this.collectFmts( jsonData );
				}
			}
		}
	},
	/**
	 * filter paragraphPorpty
	 * @param paragraphPropty
	 */
	filterParagraphProperty: function( paragraphPropty ){
		if( paragraphPropty )
		{
			var styleId = paragraphPropty.styleId;
			var numId = paragraphPropty.numId;
			styleId && this.addStyle( styleId );
			numId && this.addNumber( numId );
		}
	},
	/**
	 * filter text property
	 * @param textProperty
	 */
	filterTextProperty: function( textProperty ){
		if( textProperty ){
			var styleId = textProperty.getStyleId();
			styleId && this.addStyle( styleId );
		}
	},
	/**
	 * add styles for json
	 * @param styleId
	 */
	addStyle: function ( styleId ){
		if( !this.styles[styleId] ){
			var style =  this.editor.getRefStyle(styleId);
			if( style ){
				this.styles[styleId] = style.toJson();
				var pr = style.getParagraphProperty();
				if( pr && pr.numId )
					this.addNumber(pr.numId);
				if( style.parentId )
				//parent style id 
					this.addStyle(style.parentId);
			}
		}
	},
	/**
	 * add number 
	 * @param numId
	 */
	addNumber: function ( numId ){
		if( !this.absNumers[numId] )
		{
			var absNumber = this.editor.number.getAbsNum(numId);
			if( absNumber ){
				this.absNumers[numId] = absNumber.toJson();
				dojo.forEach( absNumber.numDefintions, function(lvl){
					if( lvl.lvlPicBulletId ){
						this.addImg( lvl.lvlPicBulletId );
					}
				},this);
			}
		}
	},
	/**
	 * add img
	 * @param picBulletId
	 */
	addImg: function ( picBulletId ){
		if( !this.imgs[ picBulletId ]){
			this.imgs[ picBulletId ] = this.editor.number.getImg( picBulletId ).toJson();
		}
	}
});
