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
    "dojo/_base/declare"
], function(declare) {

    /**
     * All controllers should extend this class, 
     * Use constructor if you want to do some "before init" actions
     * Use "init" or "afterinit" if you want to do some other actions, like "addCommand" and "listen event"
     *
     */
    var Plugin = declare("writer.plugins.Plugin", null, {
        editor: null,
        constructor: function(createParam) {
            this.editor = createParam.editor;
        },
        /* @Abstract */
        init: function() {},

        /* @Abstract */
        afterInit: function() {}
    });
    return Plugin;
});
