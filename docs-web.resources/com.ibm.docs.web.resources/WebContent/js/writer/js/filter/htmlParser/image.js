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
    "writer/filter/htmlParser/textportion",
    "writer/model/text/Image"
], function(declare, textportion, ImageModel) {

    var image = declare("writer.filter.htmlParser.image", textportion, {
        constructor: function(element) {

            var src = this.getSrc(),
                that = this;
            this.element.getTextFormats = function() {
                var isShape = this.attributes["v:shapes"];
                if ((!isShape) && src && src.match(/^data:image\/([\w]+);base64/)) {
                    return that.getFormatJson(src);
                } else if(src && src.match(/^https?:\/\//)){
                	return that.getFormatJson(src);
                } else
                    return [];
            };

        },
        /**
         * to json object
         * @returns {___anonymous497_498}
         */
        toJson: function() {
            var retVal = {},
                src = this.getSrc();
            var isShape = this.element.attributes["v:shapes"];
            if ((!isShape) && src && (src.match(/^data:image\/([\w]+);base64/) || src.match(/^https?:\/\//)))
            // local file paste support
            {
                retVal = this.getFormatJson(src);
                retVal.c = "\u0001";
            }
            return retVal;
        },
        /**
         * get json 
         * @param src
         * @returns
         */
        getFormatJson: function(src) {
            var imageObj = new ImageModel();
            imageObj.width = "15px";
            imageObj.height = "15px";
            imageObj.url = src;
            imageObj.noChangeAspect = "1";
            return imageObj.toJson();
        },
        /**
         * get src file
         * @returns
         */
        getSrc: function() {
            return this.element.attributes.src;
        },
        /**
         * override function of JsonWriter
         * @returns
         */
        getText: function() {
            var src = this.getSrc();
            if (src && (src.match(/^data:image\/([\w]+);base64/) || src.match(/^https?:\/\//))) {
                return "\u0001";
            } else
                return "";
        }
    });

    return image;
});
