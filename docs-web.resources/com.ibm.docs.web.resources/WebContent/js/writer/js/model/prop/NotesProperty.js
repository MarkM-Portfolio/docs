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
    "dojo/_base/lang",
    "writer/model/listPrototype"
], function(lang, listPrototype) {

    var NotesProperty = function(json) {
        this.init(json);
    };
    NotesProperty.prototype = {
        init: function(json) {
            json.pos && (this.pos = json.pos.val);
            json.numFmt && (this.fmt = json.numFmt.val);
            json.numRestart && (this.restart = json.numRestart.val);
            if (json.numStart) {
                this.start = parseInt(json.numStart.val);
            } else {
                this.start = 1;
            }
            this.json = lang.clone(json);
        },
        isEndSect: function() {
            return this.pos && this.pos == "sectEnd";
        },
        getFormat: function() {
            if (this.fmt) {
                switch (this.fmt) {
                    case "upperRoman":
                        return listPrototype.prototype.I;
                    case "lowerRoman":
                        return listPrototype.prototype.i;
                    case "upperLetter":
                        return listPrototype.prototype.A;
                    case "lowerLetter":
                        return listPrototype.prototype.a;
                    default:
                        return listPrototype.prototype.N;

                }
            }
        },
        isRestart: function() {
            return this.restart && this.restart == "eachSect";
        },
        getStart: function() {
            return this.start;
        },
        toJson: function() {
            return lang.clone(this.json);
        }
    };
    return NotesProperty;
});
