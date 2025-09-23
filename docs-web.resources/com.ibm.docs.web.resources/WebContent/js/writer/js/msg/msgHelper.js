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
define(["dojo/_base/lang", "dojo/_base/array"], function(lang, array) {

    var msgHelper =  lang.mixin(lang.getObject("writer.msg.msgHelper", true), {

        mergeMsgs: function(msgs, msg, head) {
            if (msgs && msg) {
                var type = head ? "unshift" : "push";
                if (lang.isArray(msg))
                    msgs[type].apply(msgs, msg);
                else
                    msgs[type](msg);
            }
            return msgs;
        },


        getUUID: function() {
            var seedA = Math.random().toString(16);
            var seedB = Math.random().toString(16);
            var uuid = seedA + seedB;
            uuid = uuid.replace(/0\./g, "");
            // Add id_ prefix for export usage.
            return "id_" + uuid.substring(0, 12);
        },

        getBlockTarget: function(modelNode) {

        },

        /**
         * 
         * The same with MessageUtil.getJsonByPath, if you modify here, don't forget to modify there
         * @argument model the JSON root for relations, styles, numbering 
         * @argument path the JSON array for the path
         * @returns the JSON object
         */
        getJsonByPath: function(model, path) {
            if (!model || !path) {
                console.log("Target not found for the path:" + path);
                return null;
            }
            var current = model;
            for (var i = 0; i < path.length; i++) {
                var pathitem = path[i];
                if (typeof(pathitem) == "string") {
                    current = current[pathitem];
                } else if (typeof(pathitem) == "object" && current.length) {
                    //pathitem is a JSON object, current is a JSON array
                    for (var j = 0; j < current.length; j++) {
                        var temp = current[j];
                        var found = true;
                        for (var key in pathitem) {
                            if (pathitem[key] != temp[key]) {
                                found = false;
                                break;
                            }
                        }
                        if (found) {
                            current = temp;
                            break;
                        }
                    }

                } else {
                    console.log("target not found, since the path is not right");
                    return null;
                }

                if (!current) {
                    console.log("target not found, since the path is not right");
                    return null;
                } else if (typeof(current) == "string") {
                    console.log("target is a string, not support:" + current);
                }
            }
            return current;
        },

        getIndex: function(modelNode) {

        },

        insertAt: function(modelNode, index) {

        },

        insertBefore: function(modelNode, relNode) {

        },

        createMessage: function(isControl, asControl)
        {
        	var msg = new Object();
        	if (isControl)
        	{
        		msg.isCtrl = true;
        	}
        	if (asControl)
        	{
        		msg.asCtrl = true;
        	}	
        	return msg;
        }
    });
    return msgHelper;
});
