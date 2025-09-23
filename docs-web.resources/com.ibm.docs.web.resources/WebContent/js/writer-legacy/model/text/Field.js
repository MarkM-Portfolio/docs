dojo.provide("writer.model.text.Field");
dojo.require("writer.model.text.InlineObject");

dojo.declare("writer.model.text.Field",[writer.model.text.InlineObject],{
	modelType: writer.MODELTYPE.FIELD,

	fromJson: function( json ){
		this.id = json.id;
		this.fld = json.fld;
		this.rt = json.rt;
		//simple field
		this.t = json.t;
		if( this.t == writer.model.text.Run.SIMPLE_FIELD_Run )
			this.instr = json.instr;
		
		if( this.isSupported() )
			this.instrText = this.getInstrText();
		
		this.start = json.s;
		this.length = parseInt( json.l ) || 0;
		if( json.c == "#" && ( !this.isPageNumber() || !this.paragraph.isInHeaderFooter()) ){
		//reset content
			json.c = this.getTextContent();
			var start = this.start || json.fmt[0].s;
			var len = json.c.length;
			json.fmt = [ {
				"style" : json.fmt[0].style,
				"rt" : "rPr",
				"s" : start,
				"l" : len
			} ];
			json.l = len;
			this.length = len;
		}
		
		this.createHints(json.fmt);
		var firstHint = this.hints.getFirst();
		this.start = ( firstHint && firstHint.start ) || 0;
		
//		if( !json.l ){
//		    var length = 0;
//		    this.hints.forEach(function(run){
//		    	length += run.length;
//		    });
//		    this.length  = length;
//		}
//		else
//			this.length = parseInt( json.l );
	},
	/**
	 * check field which can be updated now
	 * maybe more support in future
	 * @returns boolean
	 */
	isSupported: function()
	{
		var instr = [], t;
		
		if( this.t == writer.model.text.Run.SIMPLE_FIELD_Run )
			//simple file use instrText directly
			t = this.instr;
		else if( this.fld ){
			for( var i= 0; i< this.fld.length; i++ )
			{
				if( this.fld[i].fldType == "instrText" )
					instr.push( this.fld[i].instrText );
			}
		}
		//only support simple field 
		if( instr.length == 1 )
		//date time or page number 
			t = instr[0].t;
		
		return  t && ( ( t.indexOf("PAGE") >=0 )||( t.indexOf("DATE") >=0 ) );
	},
	/**
	 * is start field of toc
	 * @returns
	 */
	isTOCStart: function(){
		var instrText = this.getInstrText();
		return !!( instrText && instrText.t && instrText.t.indexOf("TOC")>=0 && instrText.t.indexOf("Table")<0)
	},
	
	isTOCEnd: function(){
		if( !this.fld || this.fld.length >1 )
			return false;
		for( var i= 0; i< this.fld.length; i++ )
		{
			if( this.fld[0].fldType == "end" )
				return true;
		}
		return false;
	},
	/**
	 * get instruction text 
	 */
	getInstrText: function()
	{
		if( this.instr )
			return {"t": this.instr };
		var fld = this.fld;
		if( fld )
		{
			for ( var i = 0 ; i < fld.length; i++ )
			{
				if( fld[i].fldType == "instrText" )
					return fld[i].instrText;
			}
		}
	},
	/**
	 * create child hints from json
	 * @param jsonAttr
	 * @returns
	 */
	createHints:function(jsonAttr)
	{
		if( ( this.isPageNumber() || this.isTotalPageNumber() ) && this.paragraph.isInHeaderFooter() )
		{
			this.hints = new common.Container(this);
			var firstHint = jsonAttr && jsonAttr[0];
			if( !firstHint )
			{
				//create a dummy run
				this.hints.append(new writer.model.text.PageNumberRun({s:this.start,l:this.length,rt:"rPr"}, this));
			}
			else
			{
				this.hints.append( new writer.model.text.PageNumberRun(firstHint, this, "#"));
			}
			return this.hints;
		}
		else
		{
			return writer.model.Hints.prototype.createHints.apply( this, arguments );
		}
	},
	toJson: function( index, length )
	{
		var retVal = {};
		
		index = ( index == null ) ? this.start : index;
		length = ( length == null ) ? this.length : length;
		
		retVal.fmt = this.hintsToJson( index, length );
		retVal.id = this.id;
		if( this.isSupported() && this.instrText && this.fld )
		{ //get fld's structure
			retVal.fld =  writer.util.ModelTools.createFieldInstrTextJson( this.instrText );
		}
		else if( this.fld )
			retVal.fld = this.fld;
		//End
		this.instr && ( retVal.instr = this.instr );
		this.rt && ( retVal.rt = this.rt );
		this.t && ( retVal.t = this.t );
		
		retVal.s = "" + index;
		retVal.l = "" + length;
		
		return retVal;
	},
	isTotalPageNumber: function()
	{
		return this.instrText && ( this.instrText.t.indexOf("NUMPAGES") >=0 ||  this.instrText.t.indexOf("SECTIONPAGES") >=0 );
	},
	
	isPageNumber: function()
	{
		return this.instrText && this.instrText.t.indexOf("PAGE") >=0;
	},
	
	isPageRef: function()
	{
		return this.instrText && this.instrText.t.indexOf("PAGEREF") >=0;
	},
	
	isDateTime: function()
	{ //" DATE \\@ \"M/d/yyyy\" "
	  //" DATE \\@ \"h:mm am/pm\" "
		return this.instrText && this.instrText.t.indexOf("DATE") >=0;
	},
	getDateTimeFormat: function()
	{
		var text = this.instrText.t,
			i = text.indexOf('"'),
			e = text.lastIndexOf('"');
		return text.substring( i+1,e);
	},
	
	getTextContent: function()
	{
		if( !this.instrText || !this.instrText.t )
			return "";
		
		var text = "";
		var paragraph, index, anchor;
		if( this.isPageNumber() ){
			if( this.isPageRef() && ( anchor = this.parent.anchor || this.parent.name ) )
			{ //in toc ...
				if( anchor )
				{
					var bm = writer.util.ModelTools.getBookMark( anchor );
					
					if( bm ){
						paragraph = bm.parent;
						index = 0;
					}
					else
						return;
					
				}else
				{
					return;
				}
			}
			else if( this.isTotalPageNumber())
			{//total page numbers 
				var totalNumber = window.layoutEngine.rootView.pages.length();
				return totalNumber+"";
			}
			else if( !this.isPageRef() )
			{
				paragraph = this.parent;
				index = this.start;
			}
			
			if( paragraph )
			{
				try{
					var viewPos = writer.util.RangeTools.toViewPosition( paragraph, index );
					var page;
					if( !viewPos )
					{
						var	range = pe.lotusEditor.getSelection().getRanges()[0];
						viewPos = range && range.getStartView();
						page = !viewPos && range && range.rootView && range.rootView.page;
					}
					
					if( viewPos )
					{
					    page = writer.util.ViewTools.getPage( viewPos.obj );
					}
					
					if( page )
					{
						var pageNumber = page.pageNumber;
						text = pageNumber+"";
					}
				}
				catch(e )
				{
					console.log("Text was not rendered: "+ e.message );
				}
			}
			
		}
		else if( this.isDateTime())
		{
			var date = new Date();
			try
			{
				//in dojo, day of week is "EEEE" while "dddd" in json ??
				//		   time is "a" while "am/pm" in json 
				var format = this.getDateTimeFormat().replace(/dddd/g,"EEEE").replace(/am\/pm/g,"a")
					,options = {};
				options.datePattern = format;
				options.selector = "date";
				text = dojo.date.locale.format( date, options);
				if (BidiUtils.isBidiOn()) {
					var paraProperty = this.parent && this.parent.directProperty;
					var isRtlPara = paraProperty && (paraProperty.getDirection() == "rtl");
					if ((BidiUtils.isGuiRtl() ^ isRtlPara) && !isNaN(parseInt(text.substr(0,1)))) {
						var strongMark = isRtlPara ? BidiUtils.LRM : BidiUtils.RLM;
						text = strongMark + text + strongMark; //preserve direction
					}
					var insulationgMark = isRtlPara ? BidiUtils.RLM : BidiUtils.LRM;
					text = insulationgMark + text + insulationgMark; //ensure insulation
				}
			}
			catch( e )
			{
				text = dojo.date.locale.format(date,{
					selector: "date"
				});
				console.log(e);
			}
		}
		return text;
	},
	
	update: function( bUpdate, bSendMsg )
	{
		var oldText = this.getText();
		var text = this.getTextContent();
		if( text != oldText )
		{
			this.updateText( text, bSendMsg, bUpdate );
			this.paragraph.buildRuns();
			if( bUpdate )
			{
				this.paragraph.markDirty();
				this.paragraph.parent.update();
			}
		}
	},
	
	getText:function(start,len){
    	if( start == null )
    		start = this.start;
    	if( len == null )
    		len = this.length;
    	
    	if (!this.paragraph ){
    		return "";
    	}
    	
    	if(this.paragraph.text){
    		return this.paragraph.text.substr(start,len);
    	}
    	else
    		return "";
    },
   
	updateText: function( text, bSendMsg, bUpdate )
	{
		if( !text || text == this.getText() )
			return;
		//create new field
		var newField = {};
		var hint= this.hints.getFirst().toJson();
		hint.l= text.length;
		
		newField.id = this.id;	
		newField.instrText = this.instrText;
		newField.rt = writer.model.text.Run.FIELD_Run;
		newField.c = text;
		newField.fmt = [hint];
		var paragraph = this.paragraph;
		var idx1 = this.start;
		var idx2 = this.start + this.length;
		var msgs = [];
		if( bSendMsg )
		{
			WRITER.MSG.addDeleteMsg( paragraph,idx1, idx2, msgs);
		}
		
		// check if to check comments on field
		var needCheckCmt = false;
		var child = this.firstChild();
		while (child){
			if (child.clist && child.clist.length > 0)
				{needCheckCmt = true; break;}
			child = this.nextChild(child);
		}
		//update format of the text run 
		bUpdate && this.markDelete();
		this.createHints(newField.fmt);
		//this.text = text;
		bUpdate && this.markInsert();
		var oldLength = this.length;
		this.changeLength( text.length );
		if (bSendMsg && needCheckCmt) {
			var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
			if (cmtMsgs.length > 0)
				msgs = msgs.concat(cmtMsgs);
		}
		this.paragraph._deleteText( this.start, oldLength );
		this.paragraph._insertText(  text, this.start );
		
		if( bSendMsg )
		{
			var actPair = WRITER.MSG.createInsertTextAct(idx1, text.length, paragraph);
			var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
			msg && msgs.push( msg );
			WRITER.MSG.sendMessage( msgs );
		}
	}

});
