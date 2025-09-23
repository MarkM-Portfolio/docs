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
    "dojo/_base/lang",
    "dojo/topic",
    "writer/constants",
    "writer/core/Event",
    "writer/plugins/Plugin"
], function(declare, lang, topic, constants, Event, Plugin) {

    var FootEndNotes = declare("writer.plugins.FootEndNotes", Plugin, {
        init: function() {
            topic.subscribe(constants.EVENT.BEFORE_SELECT, lang.hitch(this, function(ranges) {
                var mt = constants.MODELTYPE;
                for (var rangeIdx = 0; rangeIdx < ranges.length; rangeIdx++) {

                }
            }));
        }
    });
    return FootEndNotes;
});
