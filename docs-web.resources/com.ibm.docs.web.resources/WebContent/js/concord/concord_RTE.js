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

dojo.provide("concord.concord_RTE");
dojo.registerModulePath("writer", "../writer/js");
dojo.require("concord.dijit_extra");
dojo.require("dojox.uuid.generateRandomUuid");
dojo.require("writer.htmlEditor");
dojo.require("writer.RTE");

dojo.require("dijit.form.RadioButton");

// the public interface
window.NoteApp = writer.htmlEditor;