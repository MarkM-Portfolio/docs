dojo.provide("writer.filter.htmlParser.paragraph");
dojo.require("writer.filter.htmlParser.element");

dojo.declare("writer.filter.htmlParser.paragraph", [writer.filter.htmlParser.JsonWriter],{
	
	numId: -1,
	level: 0,
	
	toJson : function()
	{
		var retVal = {};
		retVal.id = WRITER.MSG_HELPER.getUUID();
		retVal.t = 'p';
		retVal.rPr = this.getPragraphTextProperties();
		retVal.pPr = this.getPragraphProperties();
		retVal.fmt = [];
		retVal.c = "";
		var element = this.element;
		//get formats
		var index = 0, text, i, children = element.children;
		 
		for ( i = 0 ; i < children.length ; i++ )
		{//add children fmts
			text = children[i].getText();
			if( text.length )
			{
				retVal.c += text;
				if ( children[i].name == "br"){
					if( children.length == 1 )
					{//only one br in paragraph.
						retVal.fmt.push({ "rt": "rPr", "s": 0, "l":0, "br": {"t": "br"}});
						retVal.c = "";
					}
					else 
						retVal.fmt.push({ "rt": "rPr", "s": 0, "l":1, "br": {"t": "br"}});
				}
				else if( !children[i].getTextFormats )
					console.error("error element in paragraph ??");
				else
				{
					var reFmt = children[i].getTextFormats();
					if(reFmt.length == 1 && reFmt[0].tab)
					{
						var iL = parseInt(reFmt[0].l) || 0;
						reFmt[0].l = 1;
						do
						{
							retVal.fmt = retVal.fmt.concat(reFmt);
							iL--;
						}while(iL>0)
					}
					else
						retVal.fmt = retVal.fmt.concat( reFmt );
				}
			}
		}
		 
		for(  i =0 ;i< retVal.fmt.length; i++ ){
		//fix fmt start
			retVal.fmt[i].s = index;
			index += retVal.fmt[i].l;
		}
		return retVal;
	},
	
	setNumId: function( numId, level ){
		this.numId = numId;
		this.level = level || 0 ;
	},
	/**
	 * rPr;
	 */
	getPragraphTextProperties: function(){
		var rPr = {}, element = this.element;
		var styles = element.getStyle();
		var supported = ["font-size", "font-weight","font-style","font-family","background-color","text-decoration","color"];
		for( var i= 0; i< supported.length; i++ ){
			var styleName = supported[i];
			if(  styles[ styleName] )
				rPr[styleName] = styles[styleName];
		}
		return rPr;
	},
	/**
	 * 
	 * @returns pPr
	 */
	getPragraphProperties: function()
	{
		var pPr = {}, element = this.element;
		var ret;
		if( (ret = element.name.match(/h([1-6])/) )&& ret[1] ){
			pPr.styleId = "Heading"+ret[1];
		}
		else if( element.attributes.styleId)//from word
		{
			pPr.styleId = element.attributes.styleId;
		}
		
		var styles = element.getStyle();
		
		var msolistId = element.attributes[ "cke:listId"];
		if( msolistId )
		{
			this.numId = writer.filter.htmlParser.listIds[ msolistId ];
			this.level = (element.attributes[ "cke:indent" ]-1)||0;
		}
			
		if(  this.numId == -1 ){
			if( styles["text-align"] ){
				var align = styles["text-align"].toLowerCase();
				if( align == "justify" )
					pPr["align"] ="both";
				else
					pPr["align"] = align;
			}
				
			if(  styles["margin-left"])
				pPr["indent"] = {"left":styles["margin-left"] };
			else if( styles["margin"])
			{
				var values = styles["margin"].split( ' ' );
				if( values )
					pPr["indent"] =  { "left": values[ 3 ] || values[ 1 ] || values [ 0 ] };
			}
			if(  styles["text-indent"])
			{
				if( !pPr["indent"] ) pPr["indent"] = {};
				pPr["indent"].firstLine = styles["text-indent"];
			}
			
			if( styles["tab-stops"]){
				var values =  styles["tab-stops"].split(/ /);
				pPr["tabs"] = [];
				var tab = {};
				for( var i=0; i< values.length; i++ ){
					if( values[i]!= "list" )
					{
						if( values[i] == "right" || values[i] == "left"|| values[i] == "center" || values[i] == "decimal" ) {
							tab = {};
							tab.val = values[i];
						}
						else{
							tab.val = tab.val || "left";
							tab.pos = values[i];
							tab.t = "tab";
							pPr["tabs"].push( tab );
						}
						tab = {};
					}
				}
			}
		}
		
		if( this.numId != -1 ){
			pPr["numPr"] = {
					"numId": {
						"val": this.numId
					},
				    "ilvl": {
				    	"val": ""+this.level
				    }
			};
		}
		return pPr;
	}


});