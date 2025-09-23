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
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/topic",
    "writer/constants",
    "writer/model/numberingDefinition"
], function(array, lang, topic, constants, numberingDefinition) {

    var abstractNum = function(source) {
        this.numDefintions = [];
        this.init(source);
    };

    abstractNum.prototype = {
        init: function(source) {
            //			this.nsid = source.nsid && source.nsid.val;
            this.multiLevelType = source.multiLevelType && source.multiLevelType.val;
            this.tmpl = source.tmpl && source.tmpl.val;
            this.numStyleLink = source.numStyleLink && source.numStyleLink.val;

            if (this.numStyleLink && !pe.lotusEditor.layoutEngine.styleLoaded)
                this._loadHandler = topic.subscribe(constants.EVENT.STYLE_LOADED, lang.hitch(this, this._load));
            else
                this._load(source);
        },

        _load: function(source) {
            if (this.numStyleLink) {
                if (this._loadHandler) {
                    this._loadHandler.remove();
                    this._loadHandler = null;
                }
                var editor = pe.lotusEditor;
                var style = editor.getRefStyle(this.numStyleLink);
                var paraProp = style.getParagraphProperty();
                var numId = paraProp.getNumId();
                var absNumber = editor.number.getAbsNum(numId);
                source = absNumber.toJson();
            }

            array.forEach(source.lvl, function(json) {
                var numDef = new numberingDefinition(json);
                this.numDefintions.push(numDef);
            }, this);
        },

        getNumDefinitonByLevel: function(lvl) {
            if (lvl >= this.numDefintions.length)
                lvl = this.numDefintions.length - 1;
            return this.numDefintions[lvl];
        },
        getNumDefinition: function() {
            return this.numDefintions;
        },
        //		setNsid : function(nsid){
        //			this.nsid = nsid;
        //		},
        //		getNsid : function(){
        //			this.nsid;
        //		},
        setMLType: function(multiLevelType) {
            this.multiLevelType = multiLevelType;
        },
        getMLType: function() {
            return this.multiLevelType;
        },
        setTmpl: function(tmpl) {
            this.tmpl = tmpl;
        },
        getTmpl: function() {
            return this.tmpl;
        },
        toJson: function() {
            var json = {};
            //			json.nsid = {}, 
            if (this.multiLevelType) {
                json.multiLevelType = {};
                json.multiLevelType.val = this.multiLevelType;
            }
            //			json.nsid.val = this.nsid;
            if (this.tmpl != undefined) {
                json.tmpl = {};
                json.tmpl.val = this.tmpl;
            }
            json.lvl = [];
            array.forEach(this.numDefintions, function(lvl) {
                json.lvl.push(lvl.toJson());
            }, this);
            return json;
        }
    };
    return abstractNum;
});
