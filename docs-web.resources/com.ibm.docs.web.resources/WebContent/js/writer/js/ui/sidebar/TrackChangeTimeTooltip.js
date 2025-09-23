/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

define([
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/_Templated",
    "dijit/_Widget",
    "dojo/dom",
    "dojo/dom-geometry",
    "dijit/place"
], function (declare, domClass, domStyle, _Templated, _Widget, dom, geo, place) {

    var TrackChangeTimeTooltip = declare("writer.ui.sidebar.TrackChangeTimeTooltip", [_Widget, _Templated], {
        title: null,
        colorClass: "blue",
        templateString: "<div class='track_change_time_tooltip' style='position:absolute' data-dojo-attach-point='focusNode' tabIndex='-1'><div class='anchor' data-dojo-attach-point='anchorNode'></div><div class='content' data-dojo-attach-point='contentNode'></div></div>",
        postCreate: function () {
            this.inherited(arguments);
            this.contentNode.innerHTML = this.title;
            domClass.add(this.domNode, this.colorClass);
        },
        focus: function () {
            this.focusNode.focus();
        },
        show: function (chooser, dot) {
            place.around(this.domNode, dot, ["below-centered", "below"], true);
            var chooserGeo = geo.position(chooser);
            var myPos = geo.position(this.domNode);
            var left = domStyle.get(this.domNode, "left");

            var dotGeo = geo.position(dot);
            chooserGeo.x -= 3; // margin
            chooserGeo.w += 7; // margin, FIXME, bob
            if (myPos.x < chooserGeo.x) {
                left += (chooserGeo.x - myPos.x)
                domStyle.set(this.domNode, "left", left + "px");
            }
            else if (myPos.x + myPos.w > chooserGeo.x + chooserGeo.w) {
                left += (chooserGeo.x + chooserGeo.w - (myPos.x + myPos.w))
                domStyle.set(this.domNode, "left", left + "px");
            }

            var leftOffset = left - chooserGeo.x;
            // var topOffset = myPos.y - chooserGeo.y;
            domStyle.set(this.domNode, "left", leftOffset + "px");
            domStyle.set(this.domNode, "top", "8px");
            this.domNode.style.position = "absolute";
            chooser.parentNode.appendChild(this.domNode);

            var anchorLeft = dotGeo.x - left + 2;
            var anchorWidth = 10;
            if (anchorLeft < 0)
                anchorLeft = 0;
            if (anchorLeft + anchorWidth > myPos.w)
                anchorLeft = myPos.w - anchorWidth;
            domStyle.set(this.anchorNode, "left", anchorLeft + "px");
        }
    });

    return TrackChangeTimeTooltip;
});
