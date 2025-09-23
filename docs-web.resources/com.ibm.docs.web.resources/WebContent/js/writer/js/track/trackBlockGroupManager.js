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
    "dojo/_base/lang",
    "dojo/_base/array",
    "writer/model/Paragraph",
    "writer/track/trackChange",
    "writer/track/TrackBlockGroup",
    "exports"
], function(lang, array, Paragraph, trackChange, TrackBlockGroup, exports) {
    if (!TrackBlockGroup)
        return;
    var trackBlockGroupManager = lang.mixin(lang.getObject("writer.track.trackBlockGroupManager", true), {

        pauseBuildGroup: function() {
            this._pauseBuildGroup = true;
        },

        resumeBuildGroup: function() {
            this._pauseBuildGroup = false;
        },

        isBuildGroupPaused: function() {
            return this._pauseBuildGroup;
        },

        beginBuildGroupRecord: function(delayTime) {
            this._defaultPrarBuildGroup = Paragraph.prototype.buildGroup;
            this._defaultGroupBuildGroup = TrackBlockGroup.prototype.buildGroup;
            this._needBuildGroup = [];
            this._isBuildGroupRecording = true;
            var that = this;
            Paragraph.prototype.buildGroup =  function() {
                if (that._needBuildGroup.indexOf(this) == -1)
                    that._needBuildGroup.push(this);
            };
            TrackBlockGroup.prototype.buildGroup = Paragraph.prototype.buildGroup;
            trackChange.beginRecord();
            if (delayTime){
                this._delayBuildGroup = setTimeout(lang.hitch(this, this.endBuildGroupRecord), delayTime);
                return this._delayBuildGroup;
            }
        },

        resetBuildGroupRecordDelay: function(delayTime){
            if (!this._delayBuildGroup)
                return;
            clearTimeout(this._delayBuildGroup);
            this._delayBuildGroup = setTimeout(lang.hitch(this, this.endBuildGroupRecord), delayTime);
            return this._delayBuildGroup;
        },

        endBuildGroupRecord: function(noRecordDirty) {
            if (this._delayBuildGroup)
                clearTimeout(this._delayBuildGroup);
            if (!this.isBuildGroupRecording())
                return;
            TrackBlockGroup.prototype.buildGroup = this._defaultGroupBuildGroup;
            Paragraph.prototype.buildGroup = this._defaultPrarBuildGroup;
            var needRecordDirty = !noRecordDirty && !this.isDirtyRecording();
            if (needRecordDirty)
                this.beginDirtyRecord();
            array.forEach(this._needBuildGroup, function(para){
                para.buildGroup();
            });
            if (needRecordDirty)
                this.endDirtyRecord();
            trackChange.endRecord();
            delete this._defaultPrarBuildGroup;
            delete this._defaultGroupBuildGroup;
            delete this._needBuildGroup;
            delete this._isBuildGroupRecording;
            delete this._delayBuildGroup;
        },

        isBuildGroupRecording: function() {
            return this._isBuildGroupRecording;
        },

        beginDirtyRecord: function() {
            this._needMarkDirty = [];
            this._needMarkReset = [];
            this._isDirtyRecording = true;
            var that = this;
            TrackBlockGroup.prototype.markDirty = function() {
                if (that._needMarkDirty.indexOf(this) == -1)
                    that._needMarkDirty.push(this);
            };
            TrackBlockGroup.prototype.markReset = function() {
                if (that._needMarkReset.indexOf(this) == -1)
                    that._needMarkReset.push(this);
            };
        },

        endDirtyRecord: function() {
            TrackBlockGroup.prototype.markDirty = Paragraph.prototype.markDirty;
            TrackBlockGroup.prototype.markReset = Paragraph.prototype.markReset;
            array.forEach(this._needMarkDirty, function(group) {
                group.markDirty();
            });
            array.forEach(this._needMarkReset, function(group) {
                group.markReset();
            });
            delete this._needMarkDirty;
            delete this._isDirtyRecording;
        },

        isDirtyRecording: function() {
            return this._isDirtyRecording;
        }

    });
    for (var x in trackBlockGroupManager)
        exports[x] = trackBlockGroupManager[x];
});
