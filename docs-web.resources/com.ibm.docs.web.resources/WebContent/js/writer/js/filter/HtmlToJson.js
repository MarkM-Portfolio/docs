/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
define([
    "dojo/_base/declare",
    "dojo/has",
    "writer/filter/constants",
    "writer/filter/HtmlParser",
    "writer/filter/htmlParser/element",
    "writer/filter/htmlParser/cell",
    "writer/filter/htmlParser/filter",
    "writer/filter/htmlParser/image",
    "writer/filter/htmlParser/list",
    "writer/filter/htmlParser/listitem",
    "writer/filter/htmlParser/paragraph",
    "writer/filter/htmlParser/pastefromword",
    "writer/filter/htmlParser/row",
    "writer/filter/htmlParser/table",
    "writer/filter/htmlParser/text",
    "writer/filter/htmlParser/textportion",
    "writer/filter/htmlParser/fragment"
], function(declare, has, constants, HtmlParser, element, cell, filter, image, list, listitem, paragraph, pastefromword, row, table, text, textportion, fragment) {


    (function() {
        HtmlParser.createElementByTag = function(tagName, attributes) {
            return new element(tagName, attributes);
        };
        //for migrate styles
        HtmlParser.config = {};
        HtmlParser.config.pasteFromWordRemoveStyles = true;
    })();

    var HtmlToJson = declare("writer.filter.HtmlToJson", null, {
        /*
         * convert jsonArray to html string
         */
        toJson: function(data, includeToBody) {
            var bPasteFromWord = (/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/).test(data);
            if (!bPasteFromWord && has("webkit"))
            //in chrome, no others indicate whether is it copy from word
                bPasteFromWord = (/<!--\[if !supportLists\]-->/).test(data);
            HtmlParser.isPasteFromWord = bPasteFromWord;
            HtmlParser.listIds = {};
            HtmlParser.listTypes = {};

            var dataFilter = new filter();
            if (bPasteFromWord) {
                // Firefox will be confused by those downlevel-revealed IE conditional
                // comments, fixing them first( convert it to upperlevel-revealed one ).
                // e.g. <![if !vml]>...<![endif]>
                if (has("ff"))
                    data = data.replace(/(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi, '$1$2$3');

                if (has("webkit")) {
                    //					/* Bullet
                    //					 * 
                    //					 * <p><!--[if !supportLists]--><span>��<span>&nbsp;</span></span><!--[endif]-->Text</p>
                    //					 * 
                    //					 * =>
                    //					 * 
                    //					 * <p><span><span style="mso-list:Ignore">��<span>&nbsp;</span></span></span>Text</p>
                    //				    */
                    //					var regExpBullet = /<!--\[if[^<]*?\]-->(<span[\s\S]*?>)(\S+<span[\S\s]*?)<!--\[endif\]-->/gi;
                    //					
                    //					/*Bullet2
                    //					 * <p><!--[if !supportLists]--><span>��</span><!--[endif]-->Text</p>
                    //					 * 
                    //					 * =>
                    //					 * 
                    //					 * <p><span><span style="mso-list:Ignore">��</span></span>Text</p>
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
                    var regExpBullet = /<!--\[if !supportLists\]-->([\s\S]*?)<!--\[endif\]-->/gi;
                    if (regExpBullet.test(data))
                        data = data.replace(regExpBullet, '<span style="mso-list:Ignore">$1</span>');
                }
                var config = {};
                config.pasteFromWordNumberedHeadingToList = true;
                dataFilter.addRules(pastefromword.getRules(config));
            }
            var fragmentHtml = fragment.fromHtml(data, false);
            var ret = fragmentHtml.writeJson(dataFilter);
            if(includeToBody){
            	var jArr = ret || [];
            	ret = {"body": jArr};
            }
            return ret;
        }
    });
    return HtmlToJson;
});
