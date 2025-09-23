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
    "writer/constants",
    "writer/model/abstractNum",
    "writer/model/numberingDefinition",
    "writer/msg/msgCenter",
    "exports"
], function(array, lang, constants, abstractNumModule, numberingDefinition, msgCenter, exports) {

    var ListTools = lang.mixin(lang.getObject("writer.util.ListTools", true), {
        /**
         * get free num id
         */
        getFreeNumId: function() {
            var id = 1;
            var numbering = pe.lotusEditor.number;
            var prefix = "" + this._getIdPrefix();
            while (numbering.nums[prefix + id] != undefined) id++;
            return prefix + id;
        },
        /**
         * get free abstract num id
         */
        getFreeAbstractNumId: function() {
            var id = 1;
            var numbering = pe.lotusEditor.number;
            var prefix = "" + this._getIdPrefix();
            while (numbering.abstracts[prefix + id] != undefined) id++;
            return prefix + id;
        },

        /**
         * Calculate the sequence by user's id
         */
        _getIdPrefix: function() {
        	var seq = 0;
            var editorStore = pe.scene.getEditorStore();
            if(editorStore){
	            var allEditors = editorStore.getAllEditors();
	            var curId = pe.scene.getCurrUserId();
	            try {
	                for (var i = 0; i < allEditors.items.length; i++) {
	                    if (curId >= allEditors.items[i].userId)
	                        seq++;
	                }
	            } catch (e) {
	                console.log("Exception in ListTools._getIdPrefix: " + e);
	                seq = "";
	            }
            }
            return seq;
        },

        /**
         * create list
         * @param numJson
         * @param msgs
         * @param abstractNum
         * @returns
         */
        createList: function(numJson, msgs, abstractNum, numId, absId, imgs) {
            numId = numId || this.getFreeNumId();
            absId = absId || this.getFreeAbstractNumId();
            abstractNum = abstractNum || new abstractNumModule(lang.clone(numJson));
            pe.lotusEditor.number.addList(numId, absId, abstractNum);
            var imgsJson = {};
            if (imgs) {
                array.forEach(abstractNum.numDefintions, function(lvl) {
                    if (lvl.lvlPicBulletId) {
                        var img = pe.lotusEditor.number.getImg(lvl.lvlPicBulletId);
                        if (!img) {
                            imgsJson[lvl.lvlPicBulletId] = imgs[lvl.lvlPicBulletId];
                            pe.lotusEditor.number.addImg(lvl.lvlPicBulletId, imgs[lvl.lvlPicBulletId]);
                        }
                    }
                });
            }

            var msg = msgCenter.createMsg(constants.MSGTYPE.List, [msgCenter.createAddListAct(numId, absId, numJson, imgsJson)], constants.MSGCATEGORY.List);
            msgs.push(msg);

            return numId;
        }

    });

    for (var x in ListTools)
        exports[x] = ListTools[x];

});
