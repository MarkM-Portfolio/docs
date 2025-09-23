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

// Please keep the order, make writer/core/Range & writer/controller/Editor in ahead.
define([
	"dojo/_base/lang",
    "writer/RTE",
    "writer/plugins/PluginsListExt",
    "writer/track/TrackBlockGroup",    
    "writer/track/trackBlockGroupManager",
    "writer/ui/sidebar/TrackChangeSidePane",
    "writer/view/TrackDeletedRef",
    "writer/view/TrackDeletedObjs",
    "writer/view/TrackOverRef",
    "writer/ui/sidebar/NavigationPane",
    "writer/model/comments/CommentService"
], function(lang) {
    return lang.mixin(lang.getObject("writer.json", true), {});
});
