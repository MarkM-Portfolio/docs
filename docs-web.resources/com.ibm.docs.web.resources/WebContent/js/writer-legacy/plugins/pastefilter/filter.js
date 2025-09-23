dojo.provide("writer.plugins.pastefilter.filter");
dojo.require("writer.plugins.pastefilter.image");
dojo.require("writer.plugins.pastefilter.textbox");
dojo.require("writer.plugins.pastefilter.paragraph");
dojo.require("writer.plugins.pastefilter.table");
dojo.require("writer.plugins.pastefilter.canvas");
dojo.require("writer.plugins.pastefilter.toc");

dojo.declare( "writer.plugins.pastefilter.filter", null, {
	constructor: function( webClipBoard ){
		if( webClipBoard ){
			var srcUrl = webClipBoard.href;
			function getDocName( url ){
				var idx = url.lastIndexOf("/",url.length-13); 
				return url.substring( url.lastIndexOf("/", idx-1)+1,idx);
			}
			var currentDoc = getDocName( window.location.toString());
			
			webClipBoard.fromDocName = getDocName( srcUrl );
			webClipBoard.isSameFile = ( currentDoc == webClipBoard.fromDocName );
		}	
	},
	/**
	 * create filter
	 * @param m
	 * @returns
	 */
	createFilter: function( m ){
		switch( m.modelType ){
		case writer.MODELTYPE.PARAGRAPH:
			return new writer.plugins.pastefilter.paragraph( m );
			break;
		case writer.MODELTYPE.TABLE:
			return new writer.plugins.pastefilter.table( m );
			break;	
		default: 
			return null;
		}
	},
	/**
	 * create json filter
	 * @param json
	 * @returns
	 */
	createJsonFilter: function( json ){
		var proType = writer.model.text.Run;
		var rt = json.rt || json.t;
		switch( rt ){
		case proType.IMAGE:
		case "pic": //picture in group object 
			return new writer.plugins.pastefilter.image( json );
		case proType.TXBX:
			return new writer.plugins.pastefilter.textbox( json );
		case "grpSp":
		case "wgp":
		case "wpc":
		case "smartart":
			return new writer.plugins.pastefilter.canvas( json );
		case "sdt":
			return new writer.plugins.pastefilter.toc( json );
		case "tbl":
			return new writer.plugins.pastefilter.table( json );
		default:
			return null;
		}
	},
	/**
	 * filter model
	 * @param m
	 * @returns
	 */
	filter: function( m,  webClipBoard, pasteBin  ){
		//reset id 
		if( m.id && webClipBoard )//internal
			m.id = WRITER.MSG_HELPER.getUUID();
		
		var modelFilter = this.createFilter(m);
		if( modelFilter ){
			if( !this.checkCmdStatus(modelFilter, pasteBin.avoidCheckCmds))
				return null;
			else
				m = modelFilter.filter( m,  webClipBoard, pasteBin );
		}
			
		if( m )
			m = this.filterParagraphPropty(m, webClipBoard, pasteBin);
		if( m )
			m = this.filterTextProperty(m, webClipBoard, pasteBin);
		if( m )
			m = this.filterTableProperty(m, webClipBoard, pasteBin);
		return m;
	},
	/**
	 * create new numbering
	 * @param numId
	 * @param webClipBoard
	 */
	createNumbering: function ( numId, webClipBoard, msgs, pasteBin ){
		//number id 
		var msg;
		if( numId && webClipBoard && webClipBoard.numbers ){
				if( !webClipBoard.isSameFile ){
				//not same file
					var docName = webClipBoard.fromDocName;
					var numbers = webClipBoard.numbers, g_number = pe.lotusEditor.number;
					if( numbers[numId ]){
						var numJson = dojo.clone( numbers[numId] );
						numId = docName+"_"+numId, pre = docName+"_";
						if( !g_number.getAbsNum(numId)){
							var lvl = numJson.lvl, imgs={};
							for( var i= 0; i< lvl.length; i++){
							//filter images for graphic bullet
								if( lvl[i].lvlPicBulletId && lvl[i].lvlPicBulletId.val){
									var imgId = lvl[i].lvlPicBulletId.val;
									var img = dojo.clone( webClipBoard.imgs[ imgId ] );
									//create new image id 
										imgId= pre + imgId;
										lvl[i].lvlPicBulletId.val = imgId;
									if( img && !imgs[ imgId ] ){
										var imgFilter = new  writer.plugins.pastefilter.image( img );
									    imgFilter.filter( img, webClipBoard, pasteBin);	
									    img.numPicBulletId = imgId;
									    img.t = "numPicBullet";
									    imgs[ imgId ] = img ;
									}
								}
							}
							writer.util.ListTools.createList( numJson, msgs, null, numId, null, imgs, docName );
						}
					}
				}
				else {
				//same document
				//need check if paste from another view root
				//example copy from header/footer view to editor area
					var newId = this._clearListPre(numId);
					var list = pe.lotusEditor.lists[newId];
					var para = list && list.getParagraph(0);
					if( para ){
						var doc = writer.util.ModelTools.getDocument( para );
						var curRoot = writer.util.ModelTools.getDocument( 
								pe.lotusEditor.getSelection().getRanges()[0].getStartModel().obj );
						if( curRoot != doc )
						//need add pre of document
							newId = this._getListPre(doc)+"_"+this._getListPre(curRoot)+"~"+ newId;
					}
					if( newId != numId ){
						if( !pe.lotusEditor.number.getAbsNum(newId)){
							var abstractNum = pe.lotusEditor.number.getAbsNum( numId );
							numId = writer.util.ListTools.createList( abstractNum.toJson(), msgs, null , newId );
						}
						else
							numId  = newId;
					}
				}
		}
		//msgs
		if( msgs.length)
			WRITER.MSG.sendMessage( msgs );
		return numId;
	},
	/**
	 * get list pre of document
	 * @param doc
	 * @returns {String}
	 */
	_getListPre: function( doc ){
		var pre = "";
		switch( doc.modelType ){
		case writer.MODELTYPE.HEADERFOOTER:
			pre= doc.hfType;
			break;
		case writer.MODELTYPE.DOCUMENT:
			pre = "body";
			break;
		case writer.MODELTYPE.FOOTNOTE:
			pre = "footNote";
			break;
		case writer.MODELTYPE.ENDNOTE:
			pre = "endNote";
			break;
		}
		return pre;
	},
	/**
	 * clear pre of document
	 */
	_clearListPre: function( numId ){
		if( numId != -1 && numId != "none"){
			var index = numId.indexOf && numId.indexOf("~");
			if( index >=0 && index != (numId.length-1))
				numId = numId.substring( index + 1 );
		}
		return numId;
	},
	/**
	 * filter paragraph property
	 * @param m
	 * @param webClipBoard
	 * @returns
	 */
	filterParagraphPropty: function( m, webClipBoard, pasteBin ){
		var msgs = [];
		if( webClipBoard ){
			var paragraphPropty = m.directProperty;
			if( paragraphPropty ){
				var styleId = paragraphPropty.styleId;
				var numId = paragraphPropty.numId;
				//styleId
				if( styleId && styleId != "none"){
					this.createStyle(styleId, webClipBoard, msgs, pasteBin);
				}
				if( numId ){
					numId = this.createNumbering(numId, webClipBoard, msgs, pasteBin);
					paragraphPropty.numId = numId;
				}
			}
		}
		if( msgs.length)
			WRITER.MSG.sendMessage( msgs );
		return m;
	},
	/**
	 * filter json paragraph property 
	 * @param json
	 * @param webClipBoard
	 * @param pasteBin
	 * @returns
	 */
	filterJsonParagraphPropty: function( json,webClipBoard, pasteBin  ){
		var msgs = [];
		
			var pPr = json.pPr||json.tblPr||json.trPr||json.tcPr;
			if( pPr ){
				var styleId = pPr.styleId;
				var numId = pPr.numPr && pPr.numPr.numId && pPr.numPr.numId.val;
				//styleId
				if( styleId && styleId != "none"){
					this.createStyle(styleId, webClipBoard, msgs, pasteBin);
				}
				if( webClipBoard ){
					if( numId && numId != "none" && numId!= -1){
						numId = this.createNumbering(numId, webClipBoard, msgs, pasteBin);
						pPr.numPr.numId.val = numId;
					}
					else if( numId )
						delete pPr.numPr;
				}
			}
	
		if( msgs.length)
			WRITER.MSG.sendMessage( msgs );
		return json;
		
	},
	/**
	 * filter json text style
	 * @param json
	 * @param webClipBoard
	 * @param pasteBin
	 */
	filterJsonTextProperty: function( json, webClipBoard, pasteBin ,parentJson ){
		var styleId = json.style && json.style.styleId;
		if( styleId ){
			if( parentJson && parentJson.rt != "hyperlink" && styleId == "Hyperlink"){
				delete json.style.styleId;
				return json;
			}
			var msgs = [];
			this.createStyle(styleId, webClipBoard, msgs, pasteBin);
			if( msgs.length)
				WRITER.MSG.sendMessage( msgs );
		}
		return json;
	},
	/**
	 * filter text property
	 * @param m
	 * @param webClipBoard
	 */
	filterTextProperty: function( m, webClipBoard, pasteBin ){
		var textProperty = m.textProperty;
		if( textProperty ){
			var styleId = textProperty.getStyleId();
			if( styleId )
			{
				var msgs = [];
				this.createStyle(styleId, webClipBoard, msgs, pasteBin);
				if( msgs.length)
					WRITER.MSG.sendMessage( msgs );
			}
		}
		return m;
	},
	/**
	 * Filter table property
	 * @param m
	 * @param webClipBoard
	 * @param pasteBin
	 * @returns
	 */
	filterTableProperty: function( m, webClipBoard, pasteBin ){
		var styleId = m.tableStyleId;
		if( styleId )
		{
			var msgs = [];
			this.createStyle(styleId, webClipBoard, msgs, pasteBin);
			if( msgs.length)
				WRITER.MSG.sendMessage( msgs );
		}
		return m;
	},
	/**
	 * create style 
	 * @param styleId
	 * @param webClipBoard
	 */
	createStyle: function( styleId, webClipBoard, msgs , pasteBin ){
		var styles = webClipBoard && webClipBoard.styles;
		if( styles && styles[ styleId ] ){
		//create num list
			styleProperty = styles[styleId].pPr;
			if( styleProperty && styleProperty.numPr && styleProperty.numPr.numId ){
			//do not override exist style, only create create numbering for new style
				styleProperty.numPr.numId.val = this.createNumbering(styleProperty.numPr.numId.val, webClipBoard, msgs, pasteBin );
			}
		}
		if(  styles && styles[ styleId ] ){
			var msg = pe.lotusEditor.createStyle( styleId, styles && styles[ styleId ] );
			msg && msgs.push( msg );
			if( styles[ styleId ].basedOn )
				this.createStyle( styles[ styleId ].basedOn , webClipBoard, msgs, pasteBin);
		}
		if( !styles ){
		//create some default styles for paste from word
			if( styleId.match("^Heading[1-6]$")|| styleId == "Hyperlink"){
				var msg = pe.lotusEditor.createStyle( styleId );
				msg && msgs.push( msg );
			}
		}
	},
	
	/**
	 * check cmd status
	 * such as insertImage ....
	 * if not allowed, return false
	 * or return true
	 */
	checkCmdStatus: function( subfilter, avoidCheckCmds ){
		var cmdName;
		avoidCheckCmds = avoidCheckCmds||[];
		if( cmdName = subfilter.cmd )
		{
			for( var i =0; i< avoidCheckCmds.length; i++ ){
				if( cmdName == avoidCheckCmds[i])
					return true;
			}
			var command = pe.lotusEditor.getCommand( cmdName );
			if( command && ( command.state == writer.TRISTATE_DISABLED || command.state == writer.TRISTATE_HIDDEN ) )
				return false;
		}
		return true;
	},
	/**
	 * filter rich text json
	 * @param json
	 * @returns
	 */
	filterText: function( json, webClipBoard, pasteBin, parent ){
		//reset id
		if( json.id && webClipBoard  )//internal
			json.id = WRITER.MSG_HELPER.getUUID();
		
		var modelFilter = this.createJsonFilter(json);
		if( modelFilter ){
			if( !this.checkCmdStatus(modelFilter, pasteBin && pasteBin.avoidCheckCmds ))
				return null;
			else
				json =  modelFilter.filter( json, webClipBoard, pasteBin );
		}
		if( !json )
			return null;
		
		var bTrackAuthor = pe.scene.isTrackAuthor();
		var author = pe.scene.getCurrUserId();
		if( json.rt && bTrackAuthor){
			json.e_a = author;
		}
		
		if( json.fmt){
			var newfmt, newfmts= [], isParagraph = ( json.t == 'p' ),
				start = isParagraph ? 0 : ( ( json.s )? parseInt( json.s ) : 0 ),
				length = 0, oldlen;
			for( var i = 0 ; i< json.fmt.length; i++ ){
				oldlen = parseInt(json.fmt[i].l);
				newfmt = this.filterText(json.fmt[i], webClipBoard, pasteBin , json );
				if( newfmt ){
					newfmts.push( newfmt );
					newfmt.s = ""+ (start + length) ;
					newlen = parseInt( newfmt.l)
					length += newlen;
				}
				else{
					var text = json.c, index  = start + length;
					json.c =  text.substring(0, index) + text.substring(index + oldlen);
				}
			}
			json.fmt = newfmts; 
		}
		else{
			var children = writer.util.ModelTools.getJsonChildren( json ) || [];
			for( var i = 0 ; i< children.length; i++ ){
				this.filterText( children[i], webClipBoard, pasteBin, parent );
			}
		}
		json = this.filterJsonParagraphPropty(json, webClipBoard, pasteBin);
		if( json )
			json = this.filterJsonTextProperty(json, webClipBoard, pasteBin, parent );
		return json;
	}
});