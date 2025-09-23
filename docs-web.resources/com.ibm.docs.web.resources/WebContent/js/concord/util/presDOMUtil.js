/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.util.presDOMUtil");

concord.util.presDOMUtil.getTargetMainNode = function (obj){
	var drawFrameClassDiv = dojo.query('.draw_frame_classes',obj.mainNode)[0];
	return drawFrameClassDiv;
};