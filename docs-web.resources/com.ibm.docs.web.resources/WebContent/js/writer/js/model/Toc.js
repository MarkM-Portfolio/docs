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
    "writer/constants",
    "writer/model/Model",
    "writer/model/update/Block_Container",
    "writer/msg/msgHelper",
    "writer/util/ModelTools"
], function(declare, constants, Model, Block_Container, msgHelper, ModelTools) {

    var Toc = declare("writer.model.Toc", [Model, Block_Container], {
        modelType: constants.MODELTYPE.TOC,
        constructor: function(json, owner) {
            this.parent = owner;
            this.doc = ModelTools.getDocument(owner);

            this.fromJson(json);
            if (!this.id)
                this.id = msgHelper.getUUID();
        },

        //implemented for ..
        toJson: function() {
            var json = {};
            json.t = "sdt";
            json.id = this.id;
            //These propertied are not used now 
            json.sdtPr = this.sdtPr;
            json.sdtEndPr = this.sdtEndPr;
            //Text contents
            var contents = [];
            this.container && this.container.forEach(function(child) {
                contents.push(child.toJson(0, null, true));
            });
            json.sdtContent = contents;
            //end

            return json;
        },
        fromJson: function(json) {
            this.id = json.id;
            var sdtContent = json.sdtContent;
            this.initContent(sdtContent);
            //These propertied are not used now 
            this.sdtPr = json.sdtPr;
            this.sdtEndPr = json.sdtEndPr;

        },
        //high light this 
        highLight: function(highLight) {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var view = viewers.getFirst();
                while (view) {
                    view.highLight(highLight);
                    view = viewers.next(view);
                }
            }
        },

        delayUpdate: true,
        getParent: function() {
            return this.parent;
        },

        getTocField: function(para) {
            function filterFunc(m) {
                if (m.modelType == constants.MODELTYPE.FIELD && m.isTOCStart()) {
                    return true;
                }
            }
            if (!para) para = this;
            return ModelTools.getNext(para, filterFunc, true, para);
        },

        getMinLevel: function() {
            var defaultLevel = 0;
            var tocField = this.getTocField();
            if (tocField) {
                var t = tocField.getInstrText().t;
                var a = t.match(/"(\d+)-(\d*)"?/);
                if (a && a[1])
                    return parseInt(a[1]) - 1;
            }
            return defaultLevel;
        },

        getMaxLevel: function() {
            var defaultLevel = 5;
            var tocField = this.getTocField();
            if (tocField) {
                var t = tocField.getInstrText().t;
                var a = t.match(/"(\d+)-(\d*)"?/);
                if (a && a[2] && a[2] != "")
                    return parseInt(a[2]);
                else if (a && a[1])
                    return parseInt(a[1]);
                else
                    return 10; //from office, its default value is 3
            } else
                return defaultLevel;
        }
    });
    return Toc;
});
