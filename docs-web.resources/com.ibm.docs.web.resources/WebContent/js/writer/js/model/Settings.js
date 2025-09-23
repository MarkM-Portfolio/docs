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
    "dojo/topic",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Section",
    "writer/model/prop/NotesProperty"
], function(topic, tools, constants, Section, NotesProperty) {

    var Settings = function(settingJSON) {
        //  this.jsonData = settingJSON;
        // TODO TRACK, this is only for debug
        this._trackChangeOnTime = settingJSON.docsTrackChangeOnTime;

        this._dts = settingJSON.dts;
        if (!this._dts) {
            //default is 36pt
            this._dts = 36;
        }
        if (!isNaN(this._dts)) {
            this._dts = this._dts + "pt";
        }
        this._dts = tools.toPxValue(this._dts);

        if (settingJSON.evenAndOddHeaders) {
            this._evenOddHeader = true;
        } else {
            this._evenOddHeader = false;
        }
        var sects = settingJSON.sects;
        this._sections = [];
        var section;
        if (sects && sects.length) {
            for (var i = 0; i < sects.length; i++) {
                section = new Section(sects[i]);
                this._sections.push(section);
            }
        } else {
            // console.log("since there is no sections information, use default page");
            var defaultSect = {
                "id": "sect001",
                "pgSz": {
                    "w": "8in",
                    "h": "11in"
                },
                "pgMar": {
                    "left": "1.25in",
                    "right": "1.25in",
                    "top": "1in",
                    "bottom": "1in",
                    "header": "0.5in"
                },
                cols: {
                    space: "0.5in",
                    num: 1
                }
            };
            section = new Section(defaultSect);
            this._sections.push(section);
        }
        if (settingJSON.footnotePr) {
            this.footnotePr = new NotesProperty(settingJSON.footnotePr);
        }
        if (settingJSON.endnotePr) {
            this.endnotePr = new NotesProperty(settingJSON.endnotePr);
        }
    };
    Settings.prototype = {
        _sections: [],
        //	jsonData: null,
        _dts: 36,
        _evenOddHeader: false,
        _importedFromOdt: null,
        isTrackChangeOn: function() {
            return this._trackChangeOnTime;
        },
        setTrackChangeOn: function(time) {
            if (!this.isTrackChangeOn()) {
                this._trackChangeOnTime = time;
                return this._trackChangeOnTime;
            }
        },

        setTrackChangeOff: function() {
            if (this.isTrackChangeOn())
            	delete this._trackChangeOnTime;
        },

        getDts: function() {
            return this._dts;
        },
        isDiffOddEvenPages: function() {
            return this._evenOddHeader;
        },
        setDiffOddEvenPages: function(isDiffOddEven) {
            this._evenOddHeader = isDiffOddEven;
        },
        getFirstSection: function() {
            if (this._sections && this._sections[0]) {
                return this._sections[0];
            }
            return null;
        },
        getEndnotePr: function() {
            return this.endnotePr;
        },
        /* only relevant for odt import, where it has impact */
        getDefaultDirection: function() {
            var section = this.getSection("default");
            var direction = section ? section.direction : null;
            return (direction ? ((direction.val == "rl-tb" || direction.val == "lr-tb") ? direction.val : null) : null);
        },
        isOdtImport: function() {
            return this._importedFromOdt;
        },
        setImportFormat: function(isOdtFromat) {
            this._importedFromOdt = isOdtFromat;
        },
        getFootnotePr: function() {
            return this.footnotePr;
        },
        deleteSection: function(sectId) {
            if (!sectId) {
                console.error("the section id can not be null");
            }
            if (this._sections && this._sections[0]) {
                var index = 0;
                for (; index < this._sections.length; index++) {
                    var sect = this._sections[index];
                    if (sect.id && sect.id == sectId) {
                        break;
                    }
                }
                if (index >= this._sections.length) {
                    console.warn("section already deleted");
                    return;
                }
                topic.publish(constants.EVENT.DELETESECTION, index);
                this._sections.splice(index, 1);
                return {
                    'sect': sect,
                    'idx': index
                };
            }
        },
        insertSection: function(sect, idx) {
            var nextSect = this._sections[idx];
            this._sections[idx] = sect;
            while (nextSect) {
                idx++;
                var t = this._sections[idx];
                this._sections[idx] = nextSect;
                nextSect = t;
            }
            topic.publish(constants.EVENT.INSERTSECTION, idx);
        },
        getMaxSectionPageWidth: function() {
            var maxWidth = 0;
            for (var i = 0; i < this._sections.length; i++) {
                var sect = this._sections[i];
                maxWidth = sect.pageSize.w > maxWidth ? sect.pageSize.w : maxWidth;
            }
            return maxWidth;
        },
        getSectionLength: function() {
            return this._sections.length;
        },
        getSection: function(sectId) {
            if (!sectId) {
                return null;
            }
            if (this._sections && this._sections[0]) {
                for (var i = 0; i < this._sections.length; i++) {
                    var sect = this._sections[i];
                    if (sect.id && sect.id == sectId) {
                        return sect;
                    }
                }
            }
            return null;
        },
        getSectionByIndex: function(i) {
            if (i < 0 || i >= this._sections.length)
                return null;

            return this._sections[i];
        },
        getSectionIndex: function(sectId) {
            if (!sectId)
                return -1;

            if (this._sections && this._sections[0]) {
                for (var i = 0; i < this._sections.length; ++i) {
                    var sect = this._sections[i];
                    if (sect.getId() && sect.getId() == sectId)
                        return i;
                }
            }

            return -1;
        },
        getPreSection: function(sectId) {
            sectId = sectId && sectId.id || sectId;
            if (!sectId)
                return null;

            var i = this.getSectionIndex(sectId);
            --i;
            if (i < 0)
                return null;

            return this._sections[i];
        },
        getNextSection: function(sectId) {
            sectId = sectId && sectId.id || sectId;
            if (!sectId) {
                return null;
            }
            if (this._sections && this._sections[0]) {
                for (var i = 0; i < this._sections.length; i++) {
                    var sect = this._sections[i];
                    if (sect.id && sect.id == sectId) {
                        if (this._sections[i + 1]) {
                            return this._sections[i + 1];
                        } else {
                            return null;
                        }

                    }
                }
            }
            return null;

        },
        isContinuousLayout: function (section) {
            var i = section ? this.getSectionIndex(section.id) : 0;
            var setting = pe.lotusEditor.setting;
            for (; i < setting.getSectionLength(); ++i) {
                var sect = setting.getSectionByIndex(i);
                if (sect.isContinuous())
                    return true;
            }
            return false;
        },
        getNextPageTypeSection: function (sectId) {
            sectId = sectId.id || sectId;
            if (!sectId) {
                return null;
            }
            var i = 0;
            while (i < this._sections.length) {
                var sect = this._sections[i];
                if (sect.id && sect.id == sectId) 
                    break;
                i++;
            }
            while(i < this._sections.length){
                var sect = this._sections[i+1];
                i++;
                //null is next page type section break
                if(sect && (sect.getType() == null || sect.getType() == ""))
                    return sect;
            }
            return null;
        },
        getNextPageSizeSection: function (sectId) {
        	sectId = sectId.id || sectId;
        	var i = this.getSectionIndex(sectId);
        	if(i == -1 || (i == (this._sections.length - 1)))
        		return null;
        	var sSect = this.getSectionByIndex(i);

            while(i < this._sections.length){
                var sect = this._sections[i+1];
                //null is next page type section break
                if(sect && sect.pageSize && (sect.pageSize.orient == sSect.pageSize.orient))
                	i++;
                else
                	return sect;
            }
            return null;
        },
        hasDiffSizeSects: function() {
        	var fistSect = this.getFirstSection();
        	var nextSizeSect = this.getNextPageSizeSection(fistSect);
        	return (nextSizeSect ? true : false);
        },
        getLastSection: function() {
            if (this._sections) {
                return this._sections[this._sections.length - 1];
            }
        },
        /**
         * Get the message target by id
         * @param id
         */
        byId: function(id) {

        }

    };
    return Settings;
});
