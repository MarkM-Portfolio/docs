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
    "writer/constants",
    "writer/view/Run",
    "writer/model/Model",
    "dojo/dom-class"
], function(declare, constants, Run, Model, domClass) {

    /**
     * view of TrackDeletdRef, in most cases it should has a vRun and never render
    */
    var TrackOverRef = declare(Run, {
        constructor: function(model, ownerId, start) {
            this._isVisibleInTrack = false;
        },

        getViewType: function() {
            return "text.trackOverRef";
        },

        getElementPath: function() {
            return this;
        },

        render: function()
        {
            var dom = this.inherited(arguments);
            if (dom)
                domClass.add(dom, "deleted-block-ref");
            return dom;
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.TRACKOVERREF] = TrackOverRef;

    return TrackOverRef;
});