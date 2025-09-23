dojo.provide("writer.filter.HtmlToJson");

writer.filter.NODE_ELEMENT = 1;
writer.filter.NODE_TEXT = 3;
writer.filter.NODE_COMMENT = 8;
writer.filter.NODE_DOCUMENT = 9;
writer.filter.NODE_DOCUMENT_FRAGMENT = 11;

writer.filter.ENTER_P	= 1;
writer.filter.ENTER_BR	= 2;
writer.filter.ENTER_DIV	= 3;
dojo.require("writer.filter.htmlParser.element");
dojo.require("writer.filter.htmlParser.text");
dojo.require("writer.filter.htmlParser.textportion");
dojo.require("writer.filter.htmlParser.paragraph");
dojo.require("writer.filter.htmlParser.image");
dojo.require("writer.filter.htmlParser.list");
dojo.require("writer.filter.htmlParser.listitem");
dojo.require("writer.filter.htmlParser.table");
dojo.require("writer.filter.htmlParser.row");
dojo.require("writer.filter.htmlParser.cell");
dojo.require("writer.filter.htmlParser.pastefromword");
dojo.require("writer.filter.htmlParser.filter");

(function(){
	writer.filter.htmlParser.createElementByTag = function( tagName, attributes ){
			return new writer.filter.htmlParser.element(tagName,attributes);
};	
//for migrate styles
writer.filter.htmlParser.config ={};
writer.filter.htmlParser.config.pasteFromWordRemoveStyles = true;
})();

dojo.declare("writer.filter.HtmlToJson",
		null, {
		/*
		 * convert jsonArray to html string
		 */
		toJson : function( data ){
			var bPasteFromWord = ( /(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ ).test( data );
			if( !bPasteFromWord && dojo.isWebKit )
			//in chrome, no others indicate whether is it copy from word
				 bPasteFromWord = ( /<!--\[if !supportLists\]-->/ ).test( data );
			writer.filter.htmlParser.isPasteFromWord = bPasteFromWord;
			writer.filter.htmlParser.listIds = {};
			writer.filter.htmlParser.listTypes = {};
			
			var dataFilter = new writer.filter.htmlParser.filter();
			if( bPasteFromWord){
				// Firefox will be confused by those downlevel-revealed IE conditional
				// comments, fixing them first( convert it to upperlevel-revealed one ).
				// e.g. <![if !vml]>...<![endif]>
				if( dojo.isFF )
					data = data.replace( /(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi, '$1$2$3' );
				
				if ( dojo.isWebKit ) 
				{
//					/* Bullet
//					 * 
//					 * <p><!--[if !supportLists]--><span>，<span>&nbsp;</span></span><!--[endif]-->Text</p>
//					 * 
//					 * =>
//					 * 
//					 * <p><span><span style="mso-list:Ignore">，<span>&nbsp;</span></span></span>Text</p>
//				    */
//					var regExpBullet = /<!--\[if[^<]*?\]-->(<span[\s\S]*?>)(\S+<span[\S\s]*?)<!--\[endif\]-->/gi;
//					
//					/*Bullet2
//					 * <p><!--[if !supportLists]--><span>，</span><!--[endif]-->Text</p>
//					 * 
//					 * =>
//					 * 
//					 * <p><span><span style="mso-list:Ignore">，</span></span>Text</p>
//					 */
//					 var regExpBullet2 =/<!--\[if[^<]*?\]-->(<span[^<>]*?>)([^<>]+<\/span[^<>]*?>)<!--\[endif\]-->/gi;
//					/* Nubmberic
//					 * 
//					 * <p><!--[if !supportLists]-->1.<span>&nbsp;</span><!--[endif]--><span>Text</span></p>
//					 * 
//					 * =>
//					 * 
//					 * <p><span><span>1.<span>&nbsp;</span></span></span><span>dfafsafsa</span></p>"
//					 */
//					var regExpNubmberic= /<!--\[if[^<]*?\]-->(\d+[\.|\)*]<span[\S\s]*?)<!--\[endif\]-->/gi;
//					/*Nubmberic2
//					 * 
//					 * <p><!--[if !supportLists]--><span>1.<span>&nbsp;&nbsp;</span></span><!--[endif]-->...</p>
//					 * 
//					 * =>
//					 * 
//					 * <p><span>1.<span>&nbsp;&nbsp;</span></span>...</p>
//					 */
//					var regExpNubmberic2= /<!--\[if[^<]*?\]-->(<span[\s\S]*?>)((\d+[\.|\)]*)*?<span[\S\s]*?)<!--\[endif\]-->/gi;
//			
//					if ( regExpBullet2.test( data ) )
//						data = data.replace( regExpBullet2, '$1<span style="mso-list:Ignore">$2</span>' );
//					if ( regExpBullet.test( data ) )
//						data = data.replace( regExpBullet, '$1<span style="mso-list:Ignore">$2</span>' );
//					if ( regExpNubmberic.test( data ) )
//						data = data.replace( regExpNubmberic, '<span><span style="mso-list:Ignore">$1</span></span>' );
//					if ( regExpNubmberic2.test( data ) )
//						data = data.replace( regExpNubmberic2, '$1<span style="mso-list:Ignore">$2</span>' );
					/*
					 * 
					 * <p><!--[if !supportLists]-->...<!--[endif]-->Text</p>
					 * 
					 * =>
					 * 
					 * <p><span style="mso-list:Ignore"> ... </span>Text</p>
					 */
					var regExpBullet =/<!--\[if !supportLists\]-->([\s\S]*?)<!--\[endif\]-->/gi;
					if ( regExpBullet.test( data ) )
						data = data.replace( regExpBullet, '<span style="mso-list:Ignore">$1</span>' );
				}
				var config = {};
				config.pasteFromWordNumberedHeadingToList = true;
				dataFilter.addRules( writer.filter.htmlParser.pastefromword.getRules( config ) );
			}
			var fragment = writer.filter.htmlParser.fragment.fromHtml( data, false );
			return fragment.writeJson( dataFilter );
		}
	}
);