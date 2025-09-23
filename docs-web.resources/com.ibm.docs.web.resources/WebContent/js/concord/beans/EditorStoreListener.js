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

dojo.provide("concord.beans.EditorStoreListener");
dojo.declare("concord.beans.EditorStoreListener", null, {
    
    editorAdded: function (editor)
    {
        throw new Error("not implemented");
    },
    editorRemoved: function (editorId)
    {
        throw new Error("not implemented");
    },
    editorsUpdated: function()
    {
        throw new Error("not implemented");
    }
});