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
define(["writer/filter/constants"], function(constants) {


    /**
     * A lightweight representation of HTML text.
     * @constructor
     * @example
     */
    var textModule = function(value) {
        /**
         * The text value.
         * @type String
         * @example
         */
        this.value = value;

        /** @private */
        this._ = {
            isBlockLike: false
        };
    };

    textModule.prototype = {
        /**
         * The node type. This is a constant value set to {@link writer.filter.NODE_TEXT}.
         * @type Number
         * @example
         */
        type: constants.NODE_TEXT,

        filter: function(filter) {
            var text = this.value;
            if (filter && !(text = filter.onText(text, this)))
                return null;
            return this;
        },

        writeJson: function(filter) {
            //	if (!( this.value = this.filter(filter)))
            //			return null;
            return this.toJson();
        },

        toJson: function() {
            return this.getText();
        },

        getTextFormats: function() {
            var fmt = {};
            fmt.rt = "rPr";
            fmt.l = this.getText().length;
            fmt.s = 0;
            return [fmt];
        },
        getText: function() {
            return this.value.replace(/&nbsp;/g, " ").replace(/&amp;/gm, "&").replace(/&lt;/gm, "<").replace(/&gt;/gm, ">").replace(/&quot;/gm, '"');
        }
    };


    return textModule;
});
