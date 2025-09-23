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

dojo.provide("writer.plugins.pastefilter.table");
dojo.declare( "writer.plugins.pastefilter.table", null, {
	cmd : "createTable",
	/**
	 * filter 
	 * @param m
	 * @returns
	 */
	filter: function( m, webClipBoard, pasteBin ){
//		if(m instanceof writer.model.table.Table) {
//			m.setTask(writer.util.HelperTools.getSelectedTaskId());
//		}
		return m;
	}}
);