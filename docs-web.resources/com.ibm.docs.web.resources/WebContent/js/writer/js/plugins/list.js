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
    "dojo/_base/array",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/i18n!writer/nls/lang",
    "dojo/topic",
    "concord/util/browser",
    "writer/constants",
    "writer/model/abstractNum",
    "writer/model/numberingDefinition",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/plugins/ListTemplate",
    "writer/plugins/Plugin",
    "writer/ui/widget/SetNumberingValueDlg",
    "writer/util/ListTools",
    "writer/util/ModelTools"
], function(declare, lang, array, i18nmenubar, i18nlang, topic, browser, constants, abstractNumModule, numberingDefinition, msgCenter, msgHelper, ListTemplate, Plugin, SetNumberingValueDlg, ListTools, ModelTools) {

    var list = declare("writer.plugins.list", Plugin, {
        defaultNumStyle: 'decimal', // Will changed when user change list
        defaultBulStyle: 'circle', // Will changed when user change list
        staticDefaultNumStyle: 'decimal', // The document's default setting
        staticDefaultBulStyle: 'circle', // The document's default setting
        init: function() {
            var plugin = this;
            var listCommand = {
                /**
                 * The argument should be an object which include: numbering, and onOff
                 * numbering is the type of set numbering.
                 * onOff is true when click the list button, otherwise it's false
                 */
                exec: function(arg) {
                    plugin.setListCmd(arg, (this.getName() == "numbering"));
                    plugin.updateCmdStatus();
                }
            };

            var multiLevelCommand = {
                exec: function(arg) {
                    //				var tocPlugin = plugin.editor.getPlugin("Toc");
                    //				if( tocPlugin && tocPlugin.getSelectedToc( pe.lotusEditor.getSelection() ))
                    //					return;

                    msgCenter.beginRecord();
                    try {
                        plugin.setMultiLevelList(arg.numbering);
                    } catch (e) {

                    }
                    msgCenter.endRecord();

                    plugin.updateCmdStatus();
                }
            };

            var removeListCommand = {
                exec: function() {
                    var msgs = [];
                    plugin._removeList(pe.lotusEditor.getSelectedParagraph(), msgs);
                    msgCenter.sendMessage(msgs);
                    plugin.updateCmdStatus();
                }
            };
            var continueListCommand = {
                exec: function() {
                    plugin.continueList();
                    plugin.updateCmdStatus();
                }
            };
            var restartListCommand = {
                exec: function() {
                    plugin.restartList();
                    plugin.updateCmdStatus();
                }
            };

            var setNumberingValCommand = {
                exec: function() {
                    plugin.setNumberingVal();
                }
            };

            this.editor.addCommand("bullet", listCommand);
            this.editor.addCommand("numbering", listCommand);
            this.editor.addCommand("multiLevel", multiLevelCommand);
            this.editor.addCommand("removeList", removeListCommand);
            this.editor.addCommand("restartList", restartListCommand);
            this.editor.addCommand("separateList", restartListCommand);
            this.editor.addCommand("continueList", continueListCommand);
            this.editor.addCommand("joinList", continueListCommand);
            this.editor.addCommand("setNumberingVal", setNumberingValCommand);

            this._createDefaultStyle();
            this._addContextMenu();

            this._addSelectionChange();
        },

        _createDefaultStyle: function() {
            var template = new ListTemplate();
            this.listTemplate = template.getTemplate();

            this.defaultNumberings = this.listTemplate.defaultNumberings;
            this.defaultBullets = this.listTemplate.defaultBullets;

            this.multiLevelNumberings = {
                "mulNum1": JSON.parse(this.listTemplate.mulNum1),
                "mulNum2": JSON.parse(this.listTemplate.mulNum2),
                "upperRoman": JSON.parse(this.listTemplate.upperRoman),
                "romanHeading": JSON.parse(this.listTemplate.romanHeading),
                "numHeading": JSON.parse(this.listTemplate.numHeading),
                "mulNumArabic1": JSON.parse(this.listTemplate.mulNumArabic1),
                "mulNumArabic2": JSON.parse(this.listTemplate.mulNumArabic2),
                "upperRomanArabic": JSON.parse(this.listTemplate.upperRomanArabic),
                "romanHeadingArabic": JSON.parse(this.listTemplate.romanHeadingArabic),
                "numHeadingArabic": JSON.parse(this.listTemplate.numHeadingArabic)
            };

            this._cacheDefaultsDefiniton = [];
            var numDefJson;
            for (var numType in this.defaultNumberings) {
                numDefJson = JSON.parse("{" + this.defaultNumberings[numType] + "}");
                this._cacheDefaultsDefiniton[numType] = new numberingDefinition(numDefJson);
            }
            for (var numType in this.defaultBullets) {
                numDefJson = JSON.parse("{" + this.defaultBullets[numType] + "}");
                this._cacheDefaultsDefiniton[numType] = new numberingDefinition(numDefJson);
            }

            this._inited = false;
        },

        _initTemplate: function(numType) {
            this.templateNumLevel = (numType && numType.indexOf("Arabic") > 0) ? this.listTemplate.templateNumLevelArabic : this.listTemplate.templateNumLevel;

            if (this._inited) return;

            this._inited = true;

            this.templatePrefix = '{"multiLevelType":{"val":"hybridMultilevel"},"lvl":[';

            this.templateBulletLevel = this.listTemplate.templateBulletLevel;

            this.templateIndent = this.listTemplate.templateIndent;

            this.lvlPrefix = '{"t":"lvl","ilvl":';
            this.tempatePostfix = ']}';
        },

        _getCustomDefinition: function(isNumbering, numType, level) {
            this._initTemplate(numType);

            level = level || 0;
            var setType;
            if (isNumbering) {
                setType = this.defaultNumberings[numType];
                setType = setType.replace("%1", "%" + (level + 1));
            } else
                setType = this.defaultBullets[numType];

            var templateStr = this.templatePrefix;
            var templateLvl = isNumbering ? this.templateNumLevel : this.templateBulletLevel;
            for (var i = 0; i < templateLvl.length; i++) {
                if (i != 0)
                    templateStr += ",";
                if (level == i)
                    templateStr += this.lvlPrefix + '"' + i + '",' + setType + ',' + this.templateIndent[i];
                else
                    templateStr += this.lvlPrefix + '"' + i + '",' + templateLvl[i] + ',' + this.templateIndent[i];
            }

            templateStr += this.tempatePostfix;

            return templateStr;
        },

        _addContextMenu: function() {
            var nls = i18nmenubar;
            var cmds = {
                "restartList": {
                    label: nls.ctxMenu_restart,
                    commandID: 'restartList',
                    group: 'list',
                    order: 'restartList',
                    name: 'restartList'
                },
                "continueList": {
                    label: nls.ctxMenu_continue,
                    commandID: 'continueList',
                    group: 'list',
                    order: 'continueList',
                    name: 'continueList'
                },
                "separateList": {
                    label: nls.ctxMenu_separate,
                    commandID: 'separateList',
                    group: 'list',
                    order: 'separateList',
                    name: 'separateList'
                },
                "joinList": {
                    label: nls.ctxMenu_join,
                    commandID: 'joinList',
                    group: 'list',
                    order: 'joinList',
                    name: 'joinList'
                },
                "setNumberingVal": {
                    label: nls.ctxMenu_setNumberVal,
                    commandID: 'setNumberingVal',
                    group: 'list',
                    order: 'setNumberingVal',
                    name: 'setNumberingVal'
                }
            };
            var ctx = this.editor.ContextMenu;
            if (ctx && ctx.addMenuItem) {
                for (var k in cmds)
                    ctx.addMenuItem(cmds[k].name, cmds[k]);
            }
            var plugin = this;
            var continueListCmd = this.editor.getCommand("continueList");
            var restartListCmd = this.editor.getCommand("restartList");
            var separateListCmd = this.editor.getCommand("separateList");
            var joinListCmd = this.editor.getCommand("joinList");
            var setNumberingValCmd = this.editor.getCommand("setNumberingVal");
            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var paras = pe.lotusEditor.getSelectedParagraph();
                var para = paras[0];
                if (!para || !para.isList())
                    return {};
                else if (para.isHeadingOutline()) {
                    var firstPara = para.getListLevel ? para.list.getFirstParagraphInSameLevel(para) : para.list.getParagraph(0);
                    if (para.isBullet())
                        return {};
                    else {
                        setNumberingValCmd.setState(constants.CMDSTATE.TRISTATE_ON);
                        return {
                            "setNumberingVal": true
                        };
                    }
                } else {
                    // Same list type and same level
                    var isSameLevel = plugin._isSameListLevel(paras);
                    var disableStatus = !isSameLevel;
                    var firstPara = para.getListLevel ? para.list.getFirstParagraphInSameLevel(para) : para.list.getParagraph(0);
                    if (para.isBullet()) {
                        setNumberingValCmd.setState(constants.CMDSTATE.TRISTATE_DISABLED);
                        if (firstPara == para) {
                            separateListCmd.setState(constants.CMDSTATE.TRISTATE_DISABLED);
                            joinListCmd.setState(disableStatus ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_ON);
                            return {
                                "joinList": disableStatus
                            }; // First item
                        } else {
                            separateListCmd.setState(disableStatus ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_ON);
                            joinListCmd.setState(constants.CMDSTATE.TRISTATE_DISABLED);
                            return {
                                "separateList": disableStatus
                            }; // Other item
                        }

                        //					if(!disableStatus && firstPara == para )
                        //						disableStatus = true;
                        //					separateListCmd.setState(disableStatus ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_ON);
                        //					return { "separateList": disableStatus };
                    } else {
                        setNumberingValCmd.setState(constants.CMDSTATE.TRISTATE_ON);
                        if (firstPara == para) {
                            restartListCmd.setState(constants.CMDSTATE.TRISTATE_DISABLED);
                            continueListCmd.setState(disableStatus ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_ON);
                            return {
                                "continueList": disableStatus,
                                "setNumberingVal": true
                            }; // First item
                        } else {
                            restartListCmd.setState(disableStatus ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_ON);
                            continueListCmd.setState(constants.CMDSTATE.TRISTATE_DISABLED);
                            return {
                                "restartList": disableStatus,
                                "setNumberingVal": true
                            }; // Other item
                        }
                    }
                }
            });
        },

        _removeList: function(paras, msgs) {
            for (var i = 0; i < paras.length; i++) {
                var msg = paras[i].removeList();
                msgHelper.mergeMsgs(msgs, msg);
            }
        },

        /**
         * Mapping the numbering definition to default style
         * @param numDefinition
         * @returns
         */
        _numberDefintionToDefault: function(numDefinition) {
            for (var numType in this._cacheDefaultsDefiniton.length) {
                var numDef = this._cacheDefaultsDefiniton[numType];
                if (numDef.isSameStyle(numDefinition))
                    return numType;
            }
            return null;
        },

        _getSiblingList: function(para, isPrevous) {
            var func = isPrevous ? "previous" : "next";
            var sibling = para[func]();
            while (sibling) {
                if (sibling.modelType == constants.MODELTYPE.PARAGRAPH) {
                    if (sibling.isList()) {
                        if (sibling.isHeadingOutline())
                            return null;
                        else
                            return sibling;
                    } else if (sibling.text.length == 0) {
                        sibling = sibling[func]();
                        continue;
                    } else
                        break;
                }
                break;
            }

            return null;
        },

        /**
         * 
         * @param selectedParagraphs
         * @param numType
         * @param isNumbering
         * @param msgs
         * @param isFollowSibling is true will check following sibling list type, if they are same type will merge them.
         * @returns
         */
        _setList: function(selectedParagraphs, numType, isNumbering, msgs, isFollowSibling) {
            var numId = null;

            // Same list type with current list
            var sibling = isFollowSibling ? this._getSiblingList(selectedParagraphs[0], true) : null;
            if (sibling && sibling.isList()) {
                var curList = sibling.list;
                var curLevel = sibling.getListLevel();

                var curNumDef = curList.getNumberingDefintion(curLevel);
                var newNumDef = this._cacheDefaultsDefiniton[numType];
                if (curNumDef.isSameStyle(newNumDef))
                    numId = curList.id;
            }
            if (numId == null) {
                // When select paragraph is list and same level. Change this level's list type.
                var level = 0;
                if (this._isSameListLevel(selectedParagraphs)) {
                    level = selectedParagraphs[0].getListLevel();
                    if (level < 0) level = 0;
                }

                var templateStr = this._getCustomDefinition(isNumbering, numType, level);
                var numJson = JSON.parse(templateStr);
                if (selectedParagraphs[0].directProperty.getDirection() == "rtl") {
                    this._fixListAlignment(numJson);
                }
                numId = this._createList(numJson, msgs);
            }

            this._addToList(selectedParagraphs, numId, msgs);
        },
        /**
         * create default list
         * @param numType
         * @param isNumberin
         * @return numberid
         */
        createDefaultList: function(numType, level, isNumbering) {
            var msgs = [];
            var templateStr = this._getCustomDefinition(isNumbering, numType, level);
            var numJson = JSON.parse(templateStr);
            var numId = this._createList(numJson, msgs);
            if (msgs.length > 0)
                msgCenter.sendMessage(msgs);
            return numId;
        },
        _createList: function(numJson, msgs, abstractNum) {
            return ListTools.createList(numJson, msgs, abstractNum);
        },

	/* In right-to-left paragraph, list symbol alignment is treated in mirrored way, 
	   hence default list symbol alignment in RTL paragraph is opposite to that of LTR paragraph,
	   so alignment should be swapped on list update from template */
	_fixListAlignment: function(numJson)
	{
		array.forEach(numJson.lvl, function(level){
			if (level.lvlJc) {
				if (level.lvlJc.val == "left")
					level.lvlJc.val = "right";
				else if (level.lvlJc.val == "right")
					level.lvlJc.val = "left";
			}
		});
	},
        /**
         * Check if the paragraph is empty in table and has no sibling.
         * @param para
         */
        _isEmptyParaInTable: function(para) {
            var cell = para.parent;
            if (ModelTools.isCell(cell) && cell.firstChild() == para && cell.lastChild() == para) {
                return true;
            }

            return false;
        },

        _addToList: function(selectedParagraphs, numId, msgs) {
            var para, level;
            var ignoreEmptyPara = selectedParagraphs.length > 1;

            var isSameList = this._isSameList(selectedParagraphs);

            for (var i = 0; i < selectedParagraphs.length; i++) {
                para = selectedParagraphs[i];
                level = 0;
                if (para.isList()) {
                    level = para.getListLevel();
                    //				msg = para.removeList();
                    //				msgHelper.mergeMsgs(msgs, msg);
                } else if (ignoreEmptyPara && (para.getVisibleLength ? para.getVisibleLength() == 0 : para.getLength() == 0) && !this._isEmptyParaInTable(para)) {
                    // Ignore empty paragraph which not in table.
                    continue;
                }

                // Change/Add same list will not clean the indent and special indent value.
                msg = para.setList(numId, level, !isSameList);
                msgHelper.mergeMsgs(msgs, msg);
            }
        },

        _isSameListLevel: function(paras, ignoreEmptyPara) {
            var listId = null,
                listLevel;
            for (var i = 0; i < paras.length; i++) {
                var para = paras[i];
                if (!para.isList()) {
                	var len = (para.getVisibleLength ? para.getVisibleLength() : para.getLength());
                    if (ignoreEmptyPara && len == 0)
                        continue;
                    else
                        return false;
                }
                if (listId == null) {
                    listId = para.list.id;
                    listLevel = para.getListLevel();
                } else if (listId != para.list.id || listLevel != para.getListLevel())
                    return false;
            }
            return true;
        },

        _isSameList: function(paras, ignoreEmptyPara) {
            var listId = null;
            for (var i = 0; i < paras.length; i++) {
                var para = paras[i];
                if (!para.isList()) {
                	var len = (para.getVisibleLength ? para.getVisibleLength() : para.getLength());
                    if (ignoreEmptyPara && len == 0)
                        continue;
                    else
                        return false;
                }
                if (listId == null)
                    listId = para.list.id;
                else if (listId != para.list.id)
                    return false;
            }
            return true;
        },

        getListType: function(isNumbering) {
            var selection = pe.lotusEditor.getSelection();
            if (!selection)
                return "none";
            var ranges = selection.getRanges();
            if (!ranges || ranges.length == 0)
                return "none";
            var collapsed = ranges.length > 1 ? false : ranges[0].isCollapsed();
            var selectedParagraphs = pe.lotusEditor.getSelectedParagraph();
            var listType = null;
            var para = selectedParagraphs[0];
            if (!para.isList()) {
                return "none";
            }
            var curList = para.list;
            var curLevel = para.getListLevel();
            var curNumDef = curList.getNumberingDefintion(curLevel);
            var len = selectedParagraphs.length;
            for (var i = 1; i < len; i++) {
                var nextPara = selectedParagraphs[i];
                if (!nextPara.isList()) {
                    return "none";
                }
                var nextList = nextPara.list;
                var nextLevel = nextPara.getListLevel();
                var nextNumDef = nextList.getNumberingDefintion(nextLevel);
                if (!curNumDef.isSameStyle(nextNumDef)) {
                    return "none";
                }
            }
            var bulletTypes;
            if (isNumbering) {
                bulletTypes = [
                    "decimal",
                    "decimalB",
                    "decimalParenthesis",
                    "lowerLetter",
                    "lowerLetterParenthesis",
                    "upperLetter",
                    "upperRoman",
                    "lowerRoman",
                    "decimalArabic",
                    "decimalArabicParenthesis"
                ];
            } else
                bulletTypes = [
                    "circle",
                    "diamond",
                    "square",
                    "plus",
                    "fourDiamond",
                    "rightArrow",
                    "checkMark",
                    "thinArrow"
                ];
            var len = bulletTypes.length;
            for (var i = 0; i < len; i++) {
                var bulletType = bulletTypes[i];
                var tmp = this._cacheDefaultsDefiniton[bulletType];
                if (curNumDef.isSameStyle(tmp)) {
                    return bulletType;
                }
            }

            return "none";

        },

        /**
         * The argument should be an object which include: numbering, and onOff
         * numbering is the type of set numbering.
         * onOff is true when click the list button, otherwise it's false
         */
        setListCmd: function(arg, isNumbering) {
            // TODO Check the paragraph's para.getDirectProperty().getIndentSpecialValue()
            // Change the paragraph's level
            // Remove list should keep the special indent value from list
            var selection = pe.lotusEditor.getSelection();
            if (!selection) return;
            var ranges = selection.getRanges();
            if (!ranges || ranges.length == 0) return;

            var numType = arg.numbering;
            var forceChange = !arg.onOff; // User select list from list panel, not the on/off button.
            var msgs = [];

            var collapsed = ranges.length > 1 ? false : ranges[0].isCollapsed();
            var selectedParagraphs = pe.lotusEditor.getSelectedParagraph();
            var para = selectedParagraphs[0];
            if (forceChange) // Click list panel
            {
                var resetDefaultNum = numType;
                if (numType == "none") {
                    resetDefaultNum = null;
                    // 1. Remove list from current selected paragraph
                    this._removeList(selectedParagraphs, msgs);
                } else {
                    if (collapsed) {
                        if (para.isList()) {
                            var curList = para.list;
                            var curLevel = para.getListLevel();

                            var curNumDef = curList.getNumberingDefintion(curLevel);
                            var newNumDef = this._cacheDefaultsDefiniton[numType];
                            // 2. Same list type, do nothing.
                            if (!curNumDef.isSameStyle(newNumDef)) {
                                // 3. Change whole list type
                                // Replace %1 to %2 for second level.
                                var oldLvlText = null;
                                if (isNumbering && curLevel > 0) {
                                    oldLvlText = newNumDef.lvlText;
                                    newNumDef.lvlText = "%" + (curLevel + 1) + newNumDef.lvlText.substring(2, newNumDef.lvlText.length);
                                }

                                newNumDef.rPr = newNumDef.textProperty && newNumDef.textProperty.toJson();

                                msgs = curList.changeListStyle(newNumDef, curLevel);

                                // Set back 
                                if (oldLvlText != null)
                                    newNumDef.lvlText = oldLvlText;
                            }
                        } else {
                            // 4. Set the paragraph to list
                            this._setList(selectedParagraphs, numType, isNumbering, msgs, true);
                        }
                    } else {
                        // 5. If the first item is same with selected style, do nothing
                        if (para.isList()) {
                            var curList = para.list;
                            var curLevel = para.getListLevel();

                            var curNumDef = curList.getNumberingDefintion(curLevel);
                            var newNumDef = this._cacheDefaultsDefiniton[numType];
                            if (curNumDef.isSameStyle(newNumDef))
                                return;
                        }

                        // 6. Create a new list for selected items, Keep the level
                        this._setList(selectedParagraphs, numType, isNumbering, msgs);
                    }
                }
                // Update the default style
                if (isNumbering)
                    this.defaultNumStyle = resetDefaultNum;
                else
                    this.defaultBulStyle = resetDefaultNum;
            } else // Click from list on/off Button
            {
                if (isNumbering)
                    numType = this.defaultNumStyle || this.staticDefaultNumStyle;
                else
                    numType = this.defaultBulStyle || this.staticDefaultBulStyle;

                if (collapsed) {
                    if (para.isList()) {
                        // 7. Not change Numbering <-> bullet. Remove the list
                        var paraIsBullet = para.isBullet();
                        if ((paraIsBullet && !isNumbering) || (!paraIsBullet && isNumbering)) {
                            var msg = para.removeList();
                            msgHelper.mergeMsgs(msgs, msg);
                        } else {
                            // 8. Change Numbering <-> bullet, change whole same level's list
                            var curList = para.list;
                            var curLevel = para.getListLevel();

                            var newNumDef = this._cacheDefaultsDefiniton[numType];

                            // Replace %1 to %2 for second level.
                            var oldLvlText = null;
                            if (isNumbering && curLevel > 0) {
                                oldLvlText = newNumDef.lvlText;
                                newNumDef.lvlText = "%" + (curLevel + 1) + newNumDef.lvlText.substring(2, newNumDef.lvlText.length);
                            }

                            newNumDef.rPr = newNumDef.textProperty && newNumDef.textProperty.toJson();

                            msgs = curList.changeListStyle(newNumDef, curLevel);

                            // Set back 
                            if (oldLvlText != null)
                                newNumDef.lvlText = oldLvlText;
                        }
                    } else {
                        // 9. Set list type same with previous/next not empty paragraph item.  
                        // Get previous/next not empty paragraph and it's list.
                        var siblingListPara = this._getSiblingList(para, true);
                        siblingListPara = siblingListPara || this._getSiblingList(para, false);
                        if (siblingListPara) {
                            var siblingIsBullet = siblingListPara.isBullet();
                            if ((siblingIsBullet && !isNumbering) || (!siblingIsBullet && isNumbering)) {
                                // 9.1 Set the paragraph with privous list type
                                var sibList = siblingListPara.list;
                                var sibLevel = siblingListPara.getListLevel();
                                var msg = para.setList(sibList.id, sibLevel, true);
                                msgHelper.mergeMsgs(msgs, msg);

                                // Change default bullet type
                                var sibNumDef = sibList.getNumberingDefintion(sibLevel);
                                var sibNumType = this._numberDefintionToDefault(sibNumDef);
                                if (siblingIsBullet)
                                    this.defaultBulStyle = (sibNumType || this.staticDefaultBulStyle);
                                else
                                    this.defaultNumStyle = (sibNumType || this.staticDefaultNumStyle);
                            } else {
                                // 9.2 create new list with default numbering type 
                                this._setList(selectedParagraphs, numType, isNumbering, msgs);
                            }
                        } else {
                            // 9.3 create new list with default numbering type 
                            this._setList(selectedParagraphs, numType, isNumbering, msgs);
                        }
                    }
                } else {
                    // 10 Same list style will remove list style
                    var isSameList = true,
                        selectionIsBullet = false,
                        numId = null;
                    var isAllEmpty = true; // Defect 37646
                    for (var i = 0; i < selectedParagraphs.length; i++) {
                        para = selectedParagraphs[i];
                        if (para.isList()) {
                            isAllEmpty = false;
                            if (numId == null) {
                                selectionIsBullet = para.isBullet();
                                numId = para.list.id;
                            } else if (numId != para.list.id) {
                                isSameList = false;
                                break;
                            }
                        } else {
                            // Ignore empty paragraph
                            if (para.getVisibleLength ? para.getVisibleLength() == 0 : para.getLength() == 0)
                                continue;
                            isSameList = false;
                            isAllEmpty = false;
                            break;
                        }
                    }

                    if (!isAllEmpty && isSameList && ((selectionIsBullet && !isNumbering) || (!selectionIsBullet && isNumbering))) {
                        // 10.1 Remove the list
                        this._removeList(selectedParagraphs, msgs);
                    } else {
                        // 10.2 Set bullet/numbering with previouis sibling, not next sibling
                        var siblingListPara = this._getSiblingList(selectedParagraphs[0], true);
                        if (siblingListPara) {
                            // Defect 43943
                            var sameSibling = false;
                            if (isSameList && siblingListPara.list.id == numId)
                                sameSibling = true;

                            var siblingIsBullet = siblingListPara.isBullet();
                            if (!sameSibling && ((siblingIsBullet && !isNumbering) || (!siblingIsBullet && isNumbering))) {
                                // Set the paragraph with privous list type
                                var sibList = siblingListPara.list;
                                var sibLevel = siblingListPara.getListLevel();
                                var numId = sibList.id;
                                var numLevel = 0;
                                var facedList = false;
                                var ignoreEmptyPara = selectedParagraphs.length > 1;
                                for (var i = 0; i < selectedParagraphs.length; i++) {
                                    para = selectedParagraphs[i];
                                    if (para.isList()) {
                                        numLevel = para.getListLevel();
                                        facedList = true;
                                    } else if (!facedList) {
                                        // Not faced list use sibling level,
                                        // Else use previous list's level
                                        numLevel = sibLevel;
                                    }

                                    if (ignoreEmptyPara && (para.getVisibleLength ? para.getVisibleLength() == 0 : para.getLength() == 0) && !this._isEmptyParaInTable(para)) {
                                        // Ignore empty paragraph which not in table.
                                        continue;
                                    }

                                    var msg = para.setList(numId, numLevel, true);
                                    msgHelper.mergeMsgs(msgs, msg);
                                }
                                // Change default bullet type
                                var sibNumDef = sibList.getNumberingDefintion(sibLevel);
                                var sibNumType = this._numberDefintionToDefault(sibNumDef);
                                if (siblingIsBullet)
                                    this.defaultBulStyle = (sibNumType || this.staticDefaultBulStyle);
                                else
                                    this.defaultNumStyle = (sibNumType || this.staticDefaultNumStyle);
                            } else {
                                // 10.3
                                this._setList(selectedParagraphs, numType, isNumbering, msgs);
                            }
                        } else {
                            // 10.4
                            this._setList(selectedParagraphs, numType, isNumbering, msgs);
                        }
                    }
                }
            }

            msgCenter.sendMessage(msgs);
        },

        /**
         * When the numId is -1 will remove it.
         * @param numId
         * @param msgs
         */
        _updateHeadingStyle: function(numId, msgs) {
            // Set heading style
            var stylePrefix = "Heading";
            var oldNumId = -2;

            var styleId, headingStyle, styleProp, headingNumId, msg, level;
            var act, rAct, actPair;
            for (var i = 1; i <= 9; i++) {
                styleId = stylePrefix + i;

                // Same algorithm with set heading.
                // Some sample file defined style name is heading 1, but style id is not Heading 1.
                // Like style id is "Ttulo1", but style name is "heading 1". We need treat it as heading.
                var style = this.editor.getRefStyle("heading " + i);
                if (style)
                    styleId = style.getStyleId();

                if (numId != -1) {
                    level = i - 1;
                    // Create default heading style
                    msg = this.editor.createStyle(styleId);
                    msgHelper.mergeMsgs(msgs, msg);
                }

                headingStyle = pe.lotusEditor.getRefStyle(styleId);
                styleProp = headingStyle && headingStyle.getParagraphProperty();

                if (!styleProp)
                    continue;

                if (numId == -1)
                    level = styleProp.getNumLevel();

                if (oldNumId == -2)
                    oldNumId = styleProp.getNumId();
                msg = headingStyle.setList(numId, level);
                if (msg) {
                    msgHelper.mergeMsgs(msgs, msg);
                    headingStyle.updateReferers();
                }
            }

            // TOCHeading
            styleId = "TOCHeading";
            var tocHeadingStyle = this.editor.getRefStyle(styleId);
            if (tocHeadingStyle && numId != -1) {
                styleId = tocHeadingStyle.getStyleId();
                styleProp = tocHeadingStyle.getParagraphProperty();
                var curNumId = styleProp && styleProp.getNumId();
                if (!curNumId || oldNumId == curNumId || curNumId == styleProp.getDefaultVal()) {
                    msg = tocHeadingStyle.setList(0, styleProp.getNumLevel());
                    msgHelper.mergeMsgs(msgs, msg);
                }
            }

        },

        _setHeadingList: function(paras, numId, msgs) {
            var getValidHeading = function(lvl) {
                lvl += 1;
                lvl = Math.min(lvl, 9); // Max heading level
                return "Heading" + lvl;
            };

            var level, para, msg;
            var oPpr, nPpr, oStyleId, nStyleId;
            for (var i = 0; i < paras.length; i++) {
                para = paras[i];

                level = 0;
                if (para.isList()) {
                    if (para.list.id == numId)
                        continue;
                    level = para.getListLevel();
                } else if (para.isHeading()) {
                    // Defect 40317
                    var listId = para.getListId();
                    // Heading without list and is not default heading.
                    if (listId != para.directProperty.getDefaultVal() && !pe.lotusEditor.number.getSameListNumId(listId)) {
                        msg = para.removeList(true);
                        msgHelper.mergeMsgs(msgs, msg);
                    }
                    continue;
                }
                msg = para.removeList(true);
                msgHelper.mergeMsgs(msgs, msg);

                oStyleId = para.getStyleId();
                nStyleId = getValidHeading(level);
                // Same with set heading
                if (oStyleId != nStyleId) {
                    para.cleanParagraphProperty(msgs);
                    var styleMsgs = para.addStyle(nStyleId);
                    for (var j = 0; styleMsgs && j < styleMsgs.length; j++)
                        msgs.push(styleMsgs[j]);
                }
            }
        },

        setMultiLevelList: function(mulType) {
            var msgs = [];
            var paras = pe.lotusEditor.getSelectedParagraph();
            if (mulType == "none") {
                this._removeList(paras, msgs);
            } else {
                var numJson = this.multiLevelNumberings[mulType];
                if (!numJson) {
                    console.error("Wrong multiple level list type:'" + mulType + "'");
                    return;
                }

                var selection = pe.lotusEditor.getSelection();
                if (!selection) return;
                var ranges = selection.getRanges();
                if (!ranges || ranges.length == 0) return;

                var collapsed = ranges.length > 1 ? false : ranges[0].isCollapsed();
                var para = paras[0];
                var isHeadingStyle = false;
                if (mulType.indexOf("Heading") != -1)
                    isHeadingStyle = true;

                if (para.directProperty.getDirection() == "rtl") {
                    numJson = lang.clone(numJson);
                    this._fixListAlignment(numJson);
                }

                var abstractNum = new abstractNumModule(numJson);
                var numId = null;
                if (isHeadingStyle) {
                    var heading1Style = pe.lotusEditor.getRefStyle("Heading1");
                    if (heading1Style) {
                        var styleProp = heading1Style.getParagraphProperty();
                        var headingNumId = styleProp && styleProp.getNumId();
                        if (headingNumId != "none" && pe.lotusEditor.number.isValidNumId(headingNumId)) {
                            var docLists = pe.lotusEditor.lists;
                            var headingList = docLists[headingNumId];
                            if (headingList && headingList.isSameStyle(abstractNum)) {
                                if ((collapsed || this._isSameList(paras)) && para.isHeadingOutline()) {
                                    var styleId = para.getStyleId();
                                    if (styleId && styleId.indexOf("Heading") == 0) {
                                        var index = styleId.substr("Heading".length);
                                        // Heading1 to Heading9
                                        if (index && index.length == 1) {
                                            index = parseInt(index);
                                            if (index > 0 && index < 10)
                                                return;
                                        }
                                    }
                                }
                                numId = headingNumId; // Don't need to create new list item
                            }
                        }
                    }
                } else if (!para.isHeadingOutline() && this._isSameList(paras) && para.list.isSameStyle(abstractNum, true)) {
                    return;
                }

                numId = numId || this._createList(numJson, msgs, abstractNum);

                if (collapsed && para.isList()) {
                    paras = para.list.getParagraphs().concat([]); // Add all list items
                }

                if (isHeadingStyle) {
                    // Multilevel list for Heading 
                    this._updateHeadingStyle(numId, msgs);
                    this._setHeadingList(paras, numId, msgs);
                } else {
                    if (collapsed && para.isHeadingOutline()) {
                        this._updateHeadingStyle(-1, msgs);
                        // Only change current paragraph
                        paras = [para];
                    }
                    this._addToList(paras, numId, msgs);
                }
            }
            msgCenter.sendMessage(msgs);
        },

        restartList: function(forceRestart) {
            var paras = pe.lotusEditor.getSelectedParagraph();
            var para = paras[0];
            if (!para.isList())
                return;

            var firstPara = para.getListLevel ? para.list.getFirstParagraphInSameLevel(para) : para.list.getParagraph(0);
            if (para == firstPara)
                return;

            var isSameLevel = this._isSameListLevel(paras);
            if (!isSameLevel && !forceRestart)
                return;

            var msgs = [];

            var numId = this.getFreeNumId();
            var numJson = para.list.absNum.toJson();
            var absId = this.getFreeAbstractNumId();
            var abstractNum = new abstractNumModule(numJson);
            pe.lotusEditor.number.addList(numId, absId, abstractNum);
            var msg = msgCenter.createMsg(constants.MSGTYPE.List, [msgCenter.createAddListAct(numId, absId, numJson)], constants.MSGCATEGORY.List);
            msgs.push(msg);

            // remove below
            var listParas = para.getListLevel ? para.list.getParagraphsInSameOrLargerLevel(para).concat([]) : para.list.getParagraphs().concat([]);
            var startRemove = false;
            firstPara = para;
            for (var i = 0; i < listParas.length; i++) {
                para = listParas[i];
                if (!startRemove && para == firstPara)
                    startRemove = true;
                if (startRemove) {
                    // Remove from old List	
                    var level = para.getListLevel();
                    // Defect 40537
                    //				msg = para.removeList();
                    //				msgHelper.mergeMsgs(msgs, msg);

                    // Set list
                    msg = para.setList(numId, level, false);
                    msgHelper.mergeMsgs(msgs, msg);
                }
            }

            if (msgs.length > 0)
                msgCenter.sendMessage(msgs);
        },

        _getLastParagraphInCell: function(cell) {
            var lastChild = cell.lastChild();
            if (lastChild.modelType == constants.MODELTYPE.PARAGRAPH)
                return lastChild;
            else if (lastChild.modelType == constants.MODELTYPE.TABLE) {
                var lastRow = lastChild.lastChild();
                var lastCell = lastRow.lastChild();
                return this._getLastParagraphInCell(lastCell);
            } else
                return this._getPreviousParagraph(lastChild);
        },

        _getPreviousParagraph: function(para) {
            if (!para || ModelTools.isTextBox(para) || ModelTools.isDocument(para))
                return null;
            var preSib = para.previous();
            if (preSib) {
                if (preSib.modelType == constants.MODELTYPE.PARAGRAPH)
                    return preSib;
                else if (preSib.modelType == constants.MODELTYPE.TABLE) {
                    var lastRow = preSib.lastChild();
                    var lastCell = lastRow.lastChild();
                    preSib = this._getLastParagraphInCell(lastCell);
                } else if (preSib.modelType == constants.MODELTYPE.ROW) {
                    var lastCell = preSib.lastChild();
                    preSib = this._getLastParagraphInCell(lastCell);
                } else if (preSib.modelType == constants.MODELTYPE.CELL) {
                    preSib = this._getLastParagraphInCell(preSib);
                }
            } else {
                preSib = this._getPreviousParagraph(para.parent);
            }
            if (preSib && preSib.modelType == constants.MODELTYPE.PARAGRAPH)
                return preSib;
            else
                return this._getPreviousParagraph(preSib);
        },

        _findPreviousNumbering: function(para) {
            if (!para.isList())
                return null;

            var curList = para.list;
            var curLevel = para.getListLevel();
            var curNumDef = curList.getNumberingDefintion(curLevel);

            var isBullet = para.isBullet();

            var preList, preLevel, preNumDef;
            var perfectMatchList = null; // Match list type
            var matchList = null;
            var preSibling = this._getPreviousParagraph(para);
            while (preSibling) {
                if (preSibling.isList()) {
                    var preIsBullet = preSibling.isBullet();
                    if ((isBullet && preIsBullet) || (!isBullet && !preIsBullet)) {
                        preList = preSibling.list;
                        preLevel = preSibling.getListLevel();
                        preNumDef = preList.getNumberingDefintion(preLevel);
                        if (preLevel == curLevel /*&& curNumDef.isSameStyle(preNumDef)*/) {
                            perfectMatchList = preList;
                            break;
                        } else if (!matchList)
                            matchList = preList;
                    }
                }
                preSibling = this._getPreviousParagraph(preSibling);
            }

            if (perfectMatchList)
                return perfectMatchList.id;
            else if (matchList)
                return matchList.id;
            else
                return null;
        },

        continueList: function() {
            var paras = pe.lotusEditor.getSelectedParagraph();
            var para = paras[0];
            if (!para.isList())
                return;

            var firstPara = para.getListLevel ? para.list.getFirstParagraphInSameLevel(para) : para.list.getParagraph(0);
            if (para != firstPara)
                return;

            var isSameLevel = this._isSameListLevel(paras);
            if (!isSameLevel)
                return;

            var msgs = [],
                msg;

            var numId = this._findPreviousNumbering(para);
            if (numId == null || numId == 'none' || !pe.lotusEditor.number.isValidNumId(numId))
                return;

            var listParas = para.getListLevel ? para.list.getParagraphsInSameOrLargerLevel(para).concat([]) : para.list.getParagraphs().concat([]);
            for (var i = 0; i < listParas.length; i++) {
                para = listParas[i];
                // Remove from old List	
                var level = para.getListLevel();
                // Defect 40537
                //			msg = para.removeList();
                //			msgHelper.mergeMsgs(msgs, msg);

                // Set list
                msg = para.setList(numId, level, false);
                msgHelper.mergeMsgs(msgs, msg);
            }

            if (msgs.length > 0)
                msgCenter.sendMessage(msgs);
        },

        setNumberingVal: function() {
            var selection = pe.lotusEditor.getSelection();
            if (!selection) return;
            var ranges = selection.getRanges();
            if (!ranges || ranges.length == 0) return;

            var collapsed = ranges.length > 1 ? false : ranges[0].isCollapsed();
            var paras = pe.lotusEditor.getSelectedParagraph();
            var para = paras[0];
            if (!para.isList() || para.isBullet())
                return;

            // Popup a dialog
            var nls = i18nlang;

            var that = this;
            var callback = function(values) {
                msgCenter.beginRecord();

                try {
                    // Restart list
                    that.restartList(true);

                    // Set start number
                    var list = para.list;
                    var level = para.getListLevel();

                    var msgs = [];
                    if (values.length == level + 1) {
                        while (level >= 0) {
                            msgs = msgs.concat(list.setNumberingStart(values[level], level));
                            level--;
                        }
                    } else
                        msgs = list.setNumberingStart(values[values.length - 1], para.getListLevel());

                    msgCenter.sendMessage(msgs);
                } catch (e) {}

                msgCenter.endRecord();
            };

            var dialog = new SetNumberingValueDlg(pe.lotusEditor, nls.SET_NUMBERING_VALUE, null, null, {
                "para": para,
                "callback": callback
            });
            //		dialog.setInitParamter(para, callback);
            dialog.show();

        },

        getFreeAbstractNumId: function() {
            return ListTools.getFreeAbstractNumId();
        },
        getFreeNumId: function() {
            return ListTools.getFreeNumId();
        },

        updateCmdStatus: function() {
            var bulletCmd = this.editor.getCommand("bulletList");
            var numberingCmd = this.editor.getCommand("numberList");
            var multiLevelCmd = this.editor.getCommand("multiLevelList");

            var bulletState = constants.CMDSTATE.TRISTATE_OFF,
                numberingState = constants.CMDSTATE.TRISTATE_OFF,
                multiLevelState = constants.CMDSTATE.TRISTATE_OFF;
            var maxParagraphCount = 100;
            var paras = pe.lotusEditor.getSelectedParagraph(maxParagraphCount);
            var ignoreEmptyPara = true;
            if (paras.length > 0 && this._isSameList(paras, ignoreEmptyPara)) {
                if (this._isSameListLevel(paras, ignoreEmptyPara)) {
                    for (var i = 0; i < paras.length; i++) {
                        var para = paras[i];
                        if (!para.isList()) // Avoid empty paragraph
                            continue;

                        if (para.isBullet())
                            bulletState = constants.CMDSTATE.TRISTATE_ON;
                        else
                            numberingState = constants.CMDSTATE.TRISTATE_ON;
                        break;
                    }
                } else {
                    for (var i = 0; i < paras.length; i++) {
                        var para = paras[i];
                        if (!para.isList()) // Avoid empty paragraph
                            continue;

                        // Check the first level's type
                        var absNum = para.list.getAbsNum();
                        if (absNum.getNumDefinitonByLevel(0).getNumFmt() == "bullet")
                            bulletState = constants.CMDSTATE.TRISTATE_ON;
                        else
                            numberingState = constants.CMDSTATE.TRISTATE_ON;
                        break;
                    }
                }
            }
            var plugin = this.editor.getPlugin("Toc");
            var bInToc = plugin && plugin.getSelectedToc(pe.lotusEditor.getSelection());
            if (bInToc || ModelTools.isInSmartart()) {
                bulletState = constants.CMDSTATE.TRISTATE_DISABLED;
                numberingState = constants.CMDSTATE.TRISTATE_DISABLED;
                multiLevelState = constants.CMDSTATE.TRISTATE_DISABLED;
            }

            bulletCmd.setState(bulletState);
            numberingCmd.setState(numberingState);
            multiLevelCmd.setState(multiLevelState);
            if (browser.isMobile()) {
                var defaultNumberIndex = {
                    "none": 0,
                    "upperLetter": 1,
                    "lowerLetter": 2,
                    "lowerLetterParenthesis": 3,
                    "decimal": 4,
                    "decimalParenthesis": 5,
                    "decimalB": 6,
                    "upperRoman": 7,
                    "lowerRoman": 8,
                    "decimalArabic": 9,
                    "decimalArabicParenthesis": 10
                };
                var defaultBulletsIndex = {
                    "none": 0,
                    "circle": 1,
                    "diamond": 2,
                    "square": 3,
                    "plus": 4,
                    "fourDiamond": 5,
                    "rightArrow": 6,
                    "checkMark": 7,
                    "thinArrow": 8
                };
                var bulletIndex = bulletState == constants.CMDSTATE.TRISTATE_ON ? defaultBulletsIndex[this.getListType()] : 0;
                var numberIndex = numberingState == constants.CMDSTATE.TRISTATE_ON ? defaultNumberIndex[this.getListType(true)] : 0;
                this.editor.getCommand("bulletedList").setState(bulletIndex);
                this.editor.getCommand("numberedList").setState(numberIndex);
            }
        },

        _addSelectionChange: function() {
            var fakeCommand = {
                exec: function() {}
            };

            this.editor.addCommand("bulletList", fakeCommand);
            this.editor.addCommand("numberList", fakeCommand);
            this.editor.addCommand("multiLevelList", fakeCommand);
            //register selection change event
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.updateCmdStatus));
        }
    });
    return list;
});
