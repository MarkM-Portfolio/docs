dojo.provide("writer.model.Section");
dojo.require("writer.model.prop.NotesProperty");
writer.HF_TYPE =
{
	isValid: function(t)
	{
		return t >= writer.HF_TYPE.BEGIN && t < writer.HF_TYPE.END;
	},

	INVALID: 		-1,
	BEGIN:			0,

	FIRST_HEADER:	0,
	FIRST_FOOTER:	1,
	DEFAULT_HEADER:	2,
	DEFAULT_FOOTER:	3,
	EVEN_HEADER:	4,
	EVEN_FOOTER:	5,
	
	END:			6
};

writer.model.Section=function(sectJSON){
	this.init(sectJSON);
};
writer.model.Section.prototype={
	
	_clean: function()
	{
		this.firstDifferent = null;
		this.defaultHeader = null;
		this.defaultFooter = null;
		this.firstHeader = null;
		this.firstFooter = null;
		this.evenHeader = null;
		this.evenFooter = null;
		this.pageSize = null;
		this.pageMargin = null;
		this.cols =null;
		this.id = null;
	},
	
	//get from settings
	init: function(sectJSON){
		this._clean();	// For apply message to clean data
		
		if (!sectJSON)
			return;
		
		this.firstDifferent = sectJSON.titlePg;
		this.defaultHeader = sectJSON.dh;
		this.firstHeader = sectJSON.fh;
		this.evenHeader = sectJSON.eh;
		this.defaultFooter = sectJSON.df;
		this.firstFooter = sectJSON.ff;
		this.evenFooter = sectJSON.ef;
		this.pageSize = dojo.clone(sectJSON.pgSz);
		this.pageMargin = dojo.clone(sectJSON.pgMar);
		this.id = sectJSON.id;
		this.cols = dojo.clone(sectJSON.cols);
		this.direction = sectJSON.bidi;

		for (var x in this.pageMargin){
			if (!this.pageMargin[x]){
				continue;
			}
			if (!isNaN(this.pageMargin[x])){
				this.pageMargin[x] = this.pageMargin[x] + "pt"; 
			}
			this.pageMargin[x] = Math.abs(common.tools.toPxValue(this.pageMargin[x]));
		}
		
		if (!this.pageMargin.header)
			this.pageMargin.header = 0;
		
		if (!this.pageMargin.footer)
			this.pageMargin.footer = 0;
		
		for (var x in this.pageSize){
			if (!this.pageSize[x]){
				continue;
			}
			if ("orient" != x && "code" != x){
				if (!isNaN(this.pageSize[x]))
					this.pageSize[x] = this.pageSize[x] + "pt";

				this.pageSize[x] = common.tools.toPxValue(this.pageSize[x]);
			}
		}
		if(sectJSON.footnotePr){
			this.footnotePr = new writer.model.prop.NotesProperty(sectJSON.footnotePr);
		}
		if(sectJSON.endnotePr){
			this.endnotePr = new writer.model.prop.NotesProperty(sectJSON.endnotePr);
		}
	},
//	getJSONPath: function(){
//		return ['sects',{id:this.id}];
//	},
	setId: function(id){
		this.id = id;
	},
	getId: function(){
		return this.id;
	},
	getHeaderFooterByType: function(hfType){
		switch (hfType)
		{
			case writer.HF_TYPE.FIRST_HEADER:
				return this.firstHeader;
				break;
			case writer.HF_TYPE.FIRST_FOOTER:
				return this.firstFooter;
				break;
			case writer.HF_TYPE.DEFAULT_HEADER:
				return this.defaultHeader;
				break;
			case writer.HF_TYPE.DEFAULT_FOOTER:
				return this.defaultFooter;
				break;
			case writer.HF_TYPE.EVEN_HEADER:
				return this.evenHeader;
				break;
			case writer.HF_TYPE.EVEN_FOOTER:
				return this.evenFooter;
				break;
		}
	},
	setHeaderFooterByType: function(hfType, headerfooter){
		switch (hfType)
		{
			case writer.HF_TYPE.FIRST_HEADER:
				this.firstHeader = headerfooter;
				break;
			case writer.HF_TYPE.FIRST_FOOTER:
				this.firstFooter = headerfooter;
				break;
			case writer.HF_TYPE.DEFAULT_HEADER:
				this.defaultHeader = headerfooter;
				break;
			case writer.HF_TYPE.DEFAULT_FOOTER:
				this.defaultFooter = headerfooter;
				break;
			case writer.HF_TYPE.EVEN_HEADER:
				this.evenHeader = headerfooter;
				break;
			case writer.HF_TYPE.EVEN_FOOTER:
				this.evenFooter = headerfooter;
				break;
		}
	},
	getHeaderMinH: function(){
		return this.pageMargin.top - this.pageMargin.header;
	},
	getFooterMinH: function(){
		return this.pageMargin.bottom - this.pageMargin.footer;
	},
	getEndnotePr:function(){
		return this.endnotePr;
	},
	getFootnotePr:function(){
		return this.footnotePr;
	},
	toJson: function(){
		var sectJSON =  {"t": "sectPr"};
		this.firstDifferent && (sectJSON.titlePg= this.firstDifferent ) ;
		this.defaultHeader && (sectJSON.dh=this.defaultHeader)  ;
		this.firstHeader&& ( sectJSON.fh=this.firstHeader) ;
		this.evenHeader && (sectJSON.eh=this.evenHeader );
		this.defaultFooter &&( sectJSON.df=this.defaultFooter );
		this.firstFooter  && (sectJSON.ff=this.firstFooter) ;
		this.evenFooter && (sectJSON.ef=this.evenFooter);
		sectJSON.id=this.id? this.id: "";
		this.cols && (sectJSON.cols=this.cols);
		sectJSON.pgMar={};
		sectJSON.pgSz={};
		if(this.endnotePr){
			sectJSON.endnotePr = this.endnotePr.toJson();
		}
		if(this.footnotePr){
			sectJSON.footnotePr = this.footnotePr.toJson();
		}
		for (var x in this.pageMargin){
			sectJSON.pgMar[x] = common.tools.toPtValue(this.pageMargin[x]+'px') +'pt';
		}
		
		for (var x in this.pageSize){
			if ("orient" != x && "code" != x)
				sectJSON.pgSz[x] = common.tools.toPtValue(this.pageSize[x]+'px') +'pt';
			else
				sectJSON.pgSz[x] = this.pageSize[x];
		}
		return sectJSON;
	},
	clone: function(){
		var newSect = new writer.model.Section();
		
		newSect.firstDifferent	= dojo.clone(this.firstDifferent);
		/*  note! the header/footer is only the reference of the header/footer, so it cannot be simplely copied!
		newSect.defaultHeader 	= this.defaultHeader;
		newSect.firstHeader 	= this.firstHeader;
		newSect.evenHeader 		= this.evenHeader;
		newSect.defaultFooter	= this.defaultFooter;
		newSect.firstFooter		= this.firstFooter;
		newSect.evenFooter		= this.evenFooter;
		*/
		newSect.id				= this.id;
		newSect.cols			= this.cols;
		newSect.pageMargin		={};
		newSect.pageSize		={};
		
		for (var x in this.pageMargin){
			newSect.pageMargin[x] = this.pageMargin[x];
		}
		
		for (var x in this.pageSize){
			newSect.pageSize[x] = this.pageSize[x];
		}
		if(this.footnotePr){
			newSect.footnotePr = new writer.model.prop.NotesProperty(this.footnotePr.toJson());
		}
		if(this.endnotePr){
			newSect.endnotePr = new writer.model.prop.NotesProperty(this.endnotePr.toJson());
		}
		
		return newSect;
	},
	isHeaderFooterNull: function(){
		return 	!this.defaultHeader && !this.defaultFooter &&
			!this.firstHeader && !this.firstFooter &&
			!this.evenHeader && !this.evenFooter;
	},
	setHeaderFooterFromSect: function(sect){
		this.firstDifferent	= sect.firstDifferent;
		this.defaultHeader	= sect.defaultHeader;
		this.defaultFooter	= sect.defaultFooter;
		this.firstHeader	= sect.firstHeader;
		this.firstFooter	= sect.firstFooter;
		this.evenHeader		= sect.evenHeader;
		this.evenFooter		= sect.evenFooter;
	}
};