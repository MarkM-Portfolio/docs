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
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "dojo/i18n!concord/widgets/nls/menubar",
    "writer/constants"
], function(declare, Plugin, ModelTools, i18nmenubar, constants) {
    var Comments = declare("writer.plugins.Comments", Plugin, {
        init: function() {
            //init the comments plugin
            var editor = this.editor;
            var addCommentCommand = {
                exec: function(comments) {
                    var commentsId = comments.getId();
                    if (commentsId == null)
                        return;
                    pe.lotusEditor.relations.commentService.addComment(comments);
                    // restore state
                    pe.lotusEditor.relations.commentService.unselectAllComments();
                    /*  setTimeout( function () {
                            concord.util.events.publish(concord.util.events.comments_selected, [commentsId]);
                        } , 100);   
                        */
                }
            };
            var addableCommentCommand = {
                exec: function() {
                    return pe.lotusEditor.relations.commentService.checkAddComment();
                }
            };
            var delCommentCommand = {
                exec: function(comment_id) {
                    pe.lotusEditor.relations.commentService.deleteComment(comment_id);
                }
            };
            var appendCommentCommand = {
                exec: function(appObj) {
                    var comment_Id = appObj.cid;
                    var item = appObj.item;
                    pe.lotusEditor.relations.commentService.appendComment(comment_Id, item);
                }
            };
            var updateCommentCommand = {
                exec: function(appObj) {
                    var comment_Id = appObj.cid;
                    var item = appObj.item;
                    var index = appObj.index;
                    pe.lotusEditor.relations.commentService.updateComment(comment_Id, index, item);
                }
            };
            var selectCommentCommand = {
                exec: function(appObj) {
                    var commentsId = appObj.cid;
                    var noFocus = appObj.nofocus;
                    pe.lotusEditor.relations.commentService.selectComment(commentsId, true, noFocus);
                }
            };
            var unselectCommentCommand = {
                exec: function(commentsId) {
                    pe.lotusEditor.relations.commentService.unselectComment(commentsId);
                }
            };
            var trySetCommentCommand = {
                exec: function(obj) {
                    pe.lotusEditor.relations.commentService.trySetComment(obj);
                }
            };
            editor.addCommand("addComment", addCommentCommand);
            editor.addCommand("addableComment", addableCommentCommand);
            editor.addCommand("deleteComment", delCommentCommand);
            editor.addCommand("appendComment", appendCommentCommand);
            editor.addCommand("updateComment", updateCommentCommand);
            editor.addCommand("selectComment", selectCommentCommand);
            editor.addCommand("unselectComment", unselectCommentCommand);
            editor.addCommand("SetCommentInfo", trySetCommentCommand);
                // add comments command to context menu     
            var toggleCommentsCmd = {
                exec: function(obj) {
                    pe.scene.toggleCommentsCmd();
                }
            };
            editor.addCommand("toggleCommentsCmd", toggleCommentsCmd);
            this.addContextMenu();
        },
        addContextMenu: function() {
            var nls = i18nmenubar;
            var ctx = this.editor.ContextMenu;

            var menuItem = {
                name: 'toggleCommentsCmd',
                commandID: 'toggleCommentsCmd',
                label: nls.teamMenu_AddComment,
                group: 'toggleCommentsCmd',
                order: 'toggleCommentsCmd',
                disabled: false
            };


            if (ctx && ctx.addMenuItem) {
                ctx.addMenuItem(menuItem.name, menuItem);
            }

            var that = this;
            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var tools = ModelTools;
                ranges = selection.getRanges();
                var bAdd = pe.lotusEditor.relations.commentService.checkAddComment(true);
                var ret = {};
                if (bAdd) {
                    ret.toggleCommentsCmd = {
                        disabled: false
                    };
                    pe.lotusEditor.getCommand('toggleCommentsCmd').setState(constants.CMDSTATE.TRISTATE_OFF);
                    return ret;
                } else {
                    pe.lotusEditor.getCommand('toggleCommentsCmd').setState(constants.CMDSTATE.TRISTATE_DISABLED);
                    return;
                }

            });
        }
    });
    return Comments;
});
