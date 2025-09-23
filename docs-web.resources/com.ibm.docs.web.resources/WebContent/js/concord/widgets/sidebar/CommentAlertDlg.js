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

dojo.provide("concord.widgets.sidebar.CommentAlertDlg");
dojo.require("concord.widgets.MessageBox");

dojo.declare("concord.widgets.sidebar.CommentAlertDlg", [concord.widgets.MessageBox], {
    "-chains-": {
        constructor: "manual"//prevent from calling super class constructor
    },
    
    constructor: function(object, title, oklabel, visible, params) {
        visible = false;
        this.inherited( arguments );
    },
    
    onOk: function (editor) {
        if( this.params.callback )
            this.params.callback(editor);
    },
    
    returnFocus : function(){
  
    }
});
