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
    "writer/plugins/Plugin",
    "writer/util/SectionTools",
    "writer/util/ViewTools",
    "dojo/i18n!concord/widgets/nls/menubar"
], function(declare, lang, topic, constants, Plugin, SectionTools, ViewTools, i18nmenubar) {

    var HeaderFooter = declare("writer.plugins.HeaderFooter", Plugin, {
        // on edit mode change
        onEditModeChange: function() {
            var f = function(hf, isHFEditing) {
                hf.broadcast("editModeChange", isHFEditing);
            };

            pe.lotusEditor.relations.forEachHeaderFooter(f, pe.lotusEditor.isHeaderFooterEditing());
        },

        // get header/footer
        getCurrentHeaderFooter: function() {
            var viewTools = ViewTools;
            var ret = {
                "header": null,
                "footer": null
            };
            var selection = pe.lotusEditor.getSelection();

            if (selection) {
                var ranges = selection.getRanges();
                var range = ranges && ranges[0];
                if (range) {
                    var startView = range.getStartView();
                    if (!startView) return null;
                    if (startView.obj) {
                        startView = startView.obj;
                    }
                    ret.header = viewTools.getHeader(startView);
                    if (!ret.header)
                        ret.footer = viewTools.getFooter(startView);
                }
            }

            return ret.header || ret.footer;
        },

        init: function() {
            var editor = this.editor;
            var viewTools = ViewTools;
            var secTools = SectionTools;
            var getCurrentHeaderFooter = this.getCurrentHeaderFooter;
            // is in first page of section now?
            var isInFirstPage = function() {
                var tarView = getCurrentHeaderFooter();
                if (!tarView)
                    return false;

                var page = ViewTools.getPage(tarView);
                return page && page.isFirstPage;
            };

            // is in first diff page of section now?
            var isInDiffFirstPage = function() {
                var tarView = getCurrentHeaderFooter();
                if (!tarView)
                    return false;

                var page = ViewTools.getPage(tarView);
                return page && page.isDiffFirstPage;
            };

            // is in first section now?
            var isInFirstSection = function(hf) {
                var tarView = hf || getCurrentHeaderFooter();
                if (!tarView)
                    return false;

                var page = ViewTools.getPage(tarView);
                var currentSec = page && page.section;
                if (!currentSec)
                    return false;

                var setting = pe.lotusEditor.setting;
                return setting.getFirstSection() == currentSec;
            };

            // is current header/footer is different first page
            var isDiffFirst = function() {
                var tarView = getCurrentHeaderFooter();
                if (!tarView)
                    return false;

                return secTools.isHFDiffFirstPage(tarView);
            };

            // is different odd&even pages
            var isDiffOddEven = function() {
                return secTools.isHFDiffOddEvenPages();
            };

            // is linked to previous section
            var isLinkedToPre = function(hf) {
                var tarView = hf || getCurrentHeaderFooter();
                if (!tarView)
                    return false;

                return secTools.isHFLinkedToPrevious(tarView);
            };

            // set different first page
            var SetDiffFirst = function() {
                console.log("Header/Footer: set different first page");

                var tarView = getCurrentHeaderFooter();
                tarView && secTools.setHFDifferentFirstPage(tarView);
            };

            // set different odd & even pages
            var SetDiffOddEven = function() {
                console.log("Header/Footer: set different odd & even pages");

                var tarView = getCurrentHeaderFooter();
                tarView && secTools.setHFOddEvenPages(tarView, true);
            };

            // set link to previous
            var SetLinkToPre = function() {
                console.log("Header/Footer: set link to previous");

                var tarView = getCurrentHeaderFooter();
                tarView && secTools.setHFLinkToPrevious(tarView);
            };
            
            var removeEmpty = function()
            {
                if (pe.lotusEditor.isHeaderFooterEditing())
                    return;
                var page = null;
                var selection = pe.lotusEditor.getSelection();
                if (selection) {
                    var ranges = selection.getRanges();
                    var range = ranges && ranges[0];
                    if (range) {
                        var startView = range.getStartView();
                        if (startView.obj) {
                            startView = startView.obj;
                        }
                        page = ViewTools.getPage(startView);
                    }
                }

                if (!page)
                    return;

                var secTools = SectionTools;
                var section = page.section;
                
                var header = page.getHeader();
                if (header && header.model && header.model.isContentEmpty()) {
                    if (isInFirstSection(header) || isLinkedToPre(header))
                        secTools.deleteHeaderFooter(section, header.model.rId, true);
                }

                var footer = page.getFooter();
                if (footer && footer.model && footer.model.isContentEmpty()) {
                    if (isInFirstSection(footer) || isLinkedToPre(footer))  
                        secTools.deleteHeaderFooter(section, footer.model.rId, false);
                }
            }

            // Commands
            var commands = [{
                name: "HeaderFooter",
                exec: function() {}
            }, {
                name: "DiffFirst",
                exec: function() {
                    SetDiffFirst();
                }
            }, {
                name: "DiffOddEven",
                exec: function() {
                    SetDiffOddEven();
                }
            }, {
                name: "LinkToPre",
                exec: function() {
                    SetLinkToPre();
                }
            }, ];

            // add Commands
            for (var i in commands) {
                this.editor.addCommand(commands[i].name, commands[i]);
            }

            // Context Menu
            var nls = i18nmenubar;
            var ctx = this.editor.ContextMenu;
            var menuItems = [{
                name: 'HeaderFooter',
                commandID: 'HeaderFooter',
                label: nls.ctxMenu_HeaderFooter,
                iconClass: 'dijitEditorIcon dijitEditorIconCopy',
                group: 'hdrftr',
                order: 'HeaderFooter',
                disabled: false
            }, {
                isCheckedMenu: true,
                name: 'DiffFirst',
                commandID: 'DiffFirst',
                label: nls.ctxMenu_HeaderFooter_DiffFirst,
                //iconClass : 'dijitEditorIcon dijitEditorIconCopy',
                group: 'HeaderFooter',
                order: 'DiffFirst',
                disabled: false,
                checked: false
            }, {
                isCheckedMenu: true,
                name: 'DiffOddEven',
                commandID: 'DiffOddEven',
                label: nls.ctxMenu_HeaderFooter_DiffOddEven,
                //iconClass : 'dijitEditorIcon dijitEditorIconCopy',
                group: 'HeaderFooter',
                order: 'DiffOddEven',
                disabled: false,
                checked: false
            }, {
                isCheckedMenu: true,
                name: 'LinkToPre',
                commandID: 'LinkToPre',
                label: nls.ctxMenu_HeaderFooter_LinkToPre,
                //iconClass : 'dijitEditorIcon dijitEditorIconCopy',
                group: 'HeaderFooter',
                order: 'LinkToPre',
                disabled: false,
                checked: false
            }, ];

            // add menu
            if (ctx && ctx.addMenuItem) {
                for (var i in menuItems) {
                    ctx.addMenuItem(menuItems[i].name, menuItems[i]);
                }
            }

            // add listener
            if (ctx && ctx.addListener) {
                ctx.addListener(function(target, selection) {
                    var target = getCurrentHeaderFooter();
                    if (!target)
                        return {};

                    var ret = {};
                    ret.HeaderFooter = {
                        checked: false,
                        getSubItems: function() {
                            return {
                                DiffFirst: {
                                    disabled: /*!isInFirstPage()*/ false,
                                    checked: isDiffFirst()
                                },
                                DiffOddEven: {
                                    disabled: /*isInDiffFirstPage()*/ false,
                                    checked: isDiffOddEven()
                                },
                                LinkToPre: {
                                    disabled: isInFirstSection(),
                                    checked: isLinkedToPre()
                                }
                            };
                        }
                    };

                    // set command state
                    var setCState = function(items) {
                        for (var id in items) {
                            var item = items[id];

                            cmd = pe.lotusEditor.getCommand(id);
                            if (cmd) {
                                if (item.disabled)
                                    cmd.state = constants.CMDSTATE.TRISTATE_DISABLED;
                                else
                                    cmd.state = item.checked ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_OFF;
                            }

                            if (item.getSubItems)
                                setCState(item.getSubItems());
                        }
                    }

                    setCState(ret);

                    return ret;
                });
            }

            topic.subscribe(constants.EVENT.EDITAREACHANGED, lang.hitch(this, this.onEditModeChange));
            topic.subscribe(constants.EVENT.EDITAREACHANGED, lang.hitch(this, removeEmpty));
        }
    });
    return HeaderFooter;
});
