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
    "dojo/_base/array",
    "writer/constants",
    "writer/view/Run",
    "writer/model/Model",
    "dojo/dom-class",
    "writer/track/trackChange"
], function (declare, array, constants, Run, Model, domClass, trackChange) {

    /**
     * view of TrackDeletedObjs, in most cases it should has a vRun and never render
    */
    var TrackDeletedObjs = declare(Run, {
        constructor: function (model, ownerId, start) {
            this._isVisibleInTrack = false;
            this.w = 0;
        },

        getViewType: function () {
            return "text.trackDeletedObjs";
        },

        getElementPath: function () {
            return this;
        },

        render: function () {
            var dom = this.inherited(arguments);
            if (dom)
                domClass.add(dom, "deleted-block-ref");
            return dom;
        },

        isTrackIdListed: function () {
            var tc = trackChange;
            if (!tc.sum || !tc.sum.activated)
                return;
            var id = this._getFirstDeletedTrackId(this.model);
            return id;
        },

        _getFirstDeletedTrackId: function (c) {
            var me = this;
            var tc = trackChange;
            var id = null;
            var acts = tc.sum.getActsByModel(c, null, true);
            if (acts.length) {
                return "track-id-" + acts[0].id
            }
            if (c.objs) {
                c.objs.forEach(function (d) {
                    id = me._getFirstDeletedTrackId(d);
                    if (id)
                        return false;
                });
            }
            if (c.container) {
                c.container.forEach(function (run) {
                    id = me._getFirstDeletedTrackId(run);
                    if (id)
                        return false;
                })
            }
            return id;
        },

        _getTrackClassId: function (c, ids) {
            var me = this;
            var tc = trackChange;
            var acts = tc.sum.getActsByModel(c);
            if (acts.length) {
                array.forEach(acts, function (act) {
                    var id = "track-id-" + act.id;
                    if (ids.indexOf(id) < 0) {
                        ids.push(id);
                    }
                })
            }

            if (c.container) {
                c.container.forEach(function (run) {
                    me._getTrackClassId(run, ids);
                })
            }

            if (c.objs) {
                c.objs.forEach(function (d) {
                    me._getTrackClassId(d, ids);
                });
            }
        },

        getTrackClassIds: function (onlyForDelete) {
            var tc = trackChange;
            if (!tc.sum || !tc.sum.activated)
                return;

            var ids = [];
            this._getTrackClassId(this.model, ids);

            return ids;
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.TRACKDELETEDOBJS] = TrackDeletedObjs;
    return TrackDeletedObjs;
});