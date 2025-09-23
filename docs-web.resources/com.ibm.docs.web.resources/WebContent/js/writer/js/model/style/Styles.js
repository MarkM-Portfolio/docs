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
	"writer/constants",
    "writer/model/style/Style",
    "writer/model/style/TableStyle"
], function(constants, Style, TableStyle) {


    var skipStyle = {
        "latentStyles": 1
    };

    var Styles = function(jsonData) {
        this.styles = {};
        this.stylesName = {};
        this.defaultTextStyle = null;
        this.defaultParagraphStyle = null;
        this.defaultListStyle = null;
        this.defaultTableStyle = null;
        this.docDefaultsStyle = null;

        if (jsonData) {
            for (var s in jsonData) {
                if (!skipStyle[s]) {
                    var type = jsonData[s].type;
                    var style = this.createStyle(jsonData[s], s);
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
    };
    Styles.prototype = {
        createCSSStyle: function() {
            for (var k in this.styles) {
                var style = this.styles[k];
                style.createCSSStyle();
            }
        },
        _getDefaultStyle: function(styleType) {
            for (var styleName in this.styles) {
                var style = this.styles[styleName];
                if (style.type == styleType && style.isDefault) {
                    return style;
                }
            }
            return "empty";
        },

        getDefaultTextStyle: function() {
            if (!this.defaultTextStyle)
                this.defaultTextStyle = this._getDefaultStyle("character");
            return this.defaultTextStyle;
        },

        getDefaultParagraphStyle: function() {
            if (!this.defaultParagraphStyle)
                this.defaultParagraphStyle = this._getDefaultStyle("paragraph");
            return this.defaultParagraphStyle;
        },

        getDefaultListStyle: function() {
            if (!this.defaultListStyle)
                this.defaultListStyle = this._getDefaultStyle("numbering");
            return this.defaultListStyle;
        },

        getDefaultTableStyle: function() {
            if (!this.defaultTableStyle)
                this.defaultTableStyle = this._getDefaultStyle("table");
            return this.defaultTableStyle;
        },
        
        getDocDefaultStyle: function(){
        	if(!this.docDefaultsStyle)
        		this.docDefaultsStyle = this.getStyle(constants.STYLE.DEFAULT);
        	return this.docDefaultsStyle;
        },

        getDocDefaultLang: function() {
            var ds = this.getDocDefaultStyle();
            return (ds && ds._textProperty && ds._textProperty.preserve 
                        && ds._textProperty.preserve.lang);
        },

        getDocMergedDefaultTextStyle: function() {
            if (!this._docMergedDefaultStyle){
                var docDS = this.getDocDefaultStyle();
                var txtDS = this.getDefaultTextStyle();
                var docDTP = docDS && docDS != "empty" && docDS.getMergedTextProperty();
                var tDTP = txtDS && txtDS != "empty" && txtDS.getMergedTextProperty();

                var mergeTextProp = function(srcTextProp, destTextProp) {
                    if (srcTextProp && srcTextProp != "empty") {
                        if (destTextProp && destTextProp != "empty")
                            return srcTextProp.merge(destTextProp, true);
                        else
                            return srcTextProp;
                    } else if (destTextProp && destTextProp != "empty")
                        return destTextProp;
                    return null;
                };

                var docPDS = this.getDefaultParagraphStyle();
                var pTDS = docPDS && docPDS != "empty" && docPDS.getMergedTextProperty();
                
                var mTDS = mergeTextProp(docDTP, pTDS);
                
                this._docMergedDefaultStyle = mergeTextProp(mTDS, tDTP);
            }

            return this._docMergedDefaultStyle;
        },

        getStyle: function(id) {
            return this.styles[id] || this.stylesName[id];
        },
        addStyle: function(id, style) {
            this.styles[id] = style;
            this.stylesName[style.getName()] = style;
            style.createCSSStyle();
        },
        /**
         * Get the message target by id
         * @param id
         */
        byId: function(id) {

        },
        createStyle: function(jsonData, s) {
            var type = jsonData.type && jsonData.type.toLowerCase() || "";
            switch (type) {
                case "table":
                    return new TableStyle(jsonData, s);
                default:
                    return new Style(jsonData, s);
            }
        }

    };
    return Styles;
});
