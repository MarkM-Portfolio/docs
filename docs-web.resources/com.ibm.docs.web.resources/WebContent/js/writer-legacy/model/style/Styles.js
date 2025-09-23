dojo.provide("writer.model.style.Styles");
dojo.require("writer.model.style.Style");
dojo.require("writer.model.style.TableStyle");
writer.model.defaultStyle = "docDefaults";
writer.model.style.skipStyle = {"latentStyles":1};

writer.model.style.Styles=function(jsonData){
	this.styles = {};
	this.stylesName = {};
	this.defaultTextStyle = null;
	this.defaultParagraphStyle = null;
	this.defaultListStyle = null;
	this.defaultTableStyle = null;
	
	if(jsonData)
	{
		for(var s in jsonData)
		{
			if( !writer.model.style.skipStyle[s] )
			{	
				var type = jsonData[s].type;
				var style = this.createStyle( jsonData[s],s );
				this.styles[s] = style;
				this.stylesName[style.getName()] = style;
//				if(style.name )
//				{	
//					if(style.name.indexOf("Heading") != -1)
//					{	
//						var name = dojo.trim(style.name);
//						name = name.substr(name.length-1);
//						this.headings["H"+name] = s;
//					}
//					else if(style.name.indexOf("Title") != -1||
//							style.name.indexOf("Subtitle") != -1)
//						this.headings[style.name] = s;
//				}
			}
		}	
	}
},
writer.model.style.Styles.prototype={
	createCSSStyle: function()
	{
		for (var k in this.styles)
		{
			var style = this.styles[k];
			style.createCSSStyle();
		}
	},
	_getDefaultStyle: function(styleType)
	{
		for(var styleName in this.styles)
		{
			var style = this.styles[styleName];
			if(style.type == styleType && style.isDefault)
			{
				return style;
			}	
		}	
		return "empty";
	},
		
	getDefaultTextStyle: function()
	{
		if( !this.defaultTextStyle )
			this.defaultTextStyle = this._getDefaultStyle("character");	
		return this.defaultTextStyle;
	},
	
	getDefaultParagraphStyle: function()
	{
		if( !this.defaultParagraphStyle )
			this.defaultParagraphStyle = this._getDefaultStyle("paragraph");	
		return this.defaultParagraphStyle;
	},
	
	getDefaultListStyle: function()
	{
		if( !this.defaultListStyle )
			this.defaultListStyle = this._getDefaultStyle("numbering");
		return this.defaultListStyle;
	},
	
	getDefaultTableStyle: function()
	{
		if( !this.defaultTableStyle )
			this.defaultTableStyle = this._getDefaultStyle("table");
		return this.defaultTableStyle;
	},
	
	getStyle:function(id){
		return this.styles[id] || this.stylesName[id];
	},
	addStyle:function(id, style)
	{
		this.styles[id] = style;
		this.stylesName[style.getName()] = style;
		style.createCSSStyle();
	},
	/**
	 * Get the message target by id
	 * @param id
	 */
	byId : function(id) {

	},
	createStyle:function(jsonData,s){
		var type = jsonData.type&&jsonData.type.toLowerCase()||"";
		switch( type){
			case "table":
				return new writer.model.style.TableStyle( jsonData,s );
			default:
				return new writer.model.style.Style( jsonData,s );
		}
	}
		
};