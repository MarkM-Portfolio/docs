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
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/json",
    "dojo/topic",
    "writer/constants",
    "writer/msg/msgCenter",
    "writer/msg/msgHandler",
    "writer/msg/otService",
    "writer/plugins/Plugin"
], function(array, declare, lang, JSON, topic, constants, msgCenter, msgHandler, otService, Plugin) {

    var UndoManager = declare("writer.plugins.UndoManager", Plugin, {
        limit: 2000,
        index: -1,
        stack: null,
        imeing: false,
        imeInput: false,
        imeAction: 0,
        ignoreUndoMsg: false,

        init: function() {
            this.editor.undoManager = this;

            var that = this;
            var undoCommand = {
                exec: function() {
                    that.undo();
                },
                state: constants.CMDSTATE.TRISTATE_DISABLED
            };
            this.editor.addCommand("undo", undoCommand, constants.KEYS.CTRL + 90); // CTRL + Z

            var redoCommand = {
                exec: function() {
                    that.redo();
                },
                state: constants.CMDSTATE.TRISTATE_DISABLED
            };
            this.editor.addCommand("redo", redoCommand, constants.KEYS.CTRL + 89); // CTRL + Y

            this.reset();
        },

        reset: function() {
            this.index = -1;
            this.stack = [];
            this.onChange();
        },

        getStack: function() {
            return this.stack;
        },

        imeBegin: function() {
            this.imeing = true;
            this.imeAction = 0;
        },

        ignoreUndo: function(isIgnore) {
            this.ignoreUndoMsg = isIgnore;
        },

        imeEnd: function() {
            this.imeing = false;
            for (var i = 0; i < this.imeAction; i++) {
                if (this.stack.length <= 0)
                    break;
                this.removeUndo();
            }
            this.imeAction = 0;
        },

        isIMEing: function() {
            return this.imeing;
        },

        isIgnoreUndoMsg: function() {
            return this.ignoreUndoMsg;
        },

        imeCommit: function(b) {
            this.imeInput = b;
        },

        isIMEInput: function() {
            return this.imeInput;
        },


        _getMsgModel: function(msg) {
            var editor = pe.lotusEditor;
            var msgCat = constants.MSGCATEGORY;

            var msgModel = null;
            switch (msg.mc) {
                case msgCat.Style:
                    msgModel = editor.styles;
                    break;
                case msgCat.List:
                    msgModel = editor.number;
                    break;
                case msgCat.Setting:
                    msgModel = editor.setting;
                    break;
                case msgCat.Relation:
                    msgModel = editor.relations;
                    break;
                case msgCat.Footnotes:
                case msgCat.Endnotes:
                    msgModel = editor.relations;
                    break;
                default:
                    msgModel = editor.document;
                    break;
            }

            return msgModel;
        },

        /**
         * Check if the message is empty undo/redo action.
         * @param msgList
         * @returns
         */
        isEmptyMsg: function(msgList) {
            var msgCat = constants.MSGCATEGORY,
                msgType = constants.MSGTYPE,
                actType = constants.ACTTYPE;

            var msg, actList, act, msgModel;
            for (var i = 0; i < msgList.length; i++) {
                msg = msgList[i];
                switch (msg.type) {
                    case msgType.Text:
                    case msgType.Element:
                    case msgType.Table:
                    case msgType.Attribute:
                    case msgType.TextAttribute:
                        {
                            msgModel = this._getMsgModel(msg);
                            actList = msg.updates;
                            for (var j = 0; actList && j < actList.length; j++) {
                                act = actList[j];
                                // Check Text Message Length
                                if (msg.type == msgType.Text && act.len != 0)
                                    return false;
                                else if (msg.type == msgType.Element && act.idx >= 0) // Element.
                                    return false;

                                // Check Target
                                var target = msgModel.byId(act.tid);
                                if (target)
                                    return false;
                            }
                        }
                        break;
                    default:
                        return false;
                }
            }

            return true;
        },

        undo: function() {
            // TODO For undo/redo insert/delete element.
            // Should regenerate the undo/redo message in coediting mode.
            while (this.undoable()) {
                var msgList = this.getAction(true);
                if (!this.isEmptyMsg(msgList)) {
                    this.performAction(msgList);
                    return true;
                }
            }

            return false;
        },

        redo: function() {
            while (this.redoable()) {
                var msgList = this.getAction(false);
                if (!this.isEmptyMsg(msgList)) {
                    this.performAction(msgList);
                    return true;
                }
            }

            return false;
        },

        addUndo: function(msgList, rmsgList) {
            if (this.ignoreUndoMsg)
                return;

            var action = {};
            action.undo = rmsgList.reverse();
            action.redo = msgList;
            if (this.isIMEInput()) {
                action.compress = false;
            } else {
                action.compress = true;
            }
            this._removeAction(this.index + 1);

            //add new action			
            if (this.stack.length >= (this.limit + this.imeAction)) {
                var topaction = this.stack[0];
                var msgs = topaction.redo;
                var sendoutList = pe.scene.session ? pe.scene.session.sendoutList : [];
                var find = false;
                for (var i = 0; !find && i < msgs.length; i++) {
                    for (var j = 0; j < sendoutList.length; j++) {
                        if (msgs[i].client_seq == sendoutList[j].client_seq) {
                            find = true;
                            break;
                        }
                    }
                }
                // when the message is still waiting server's confirm, it should not be removed from undo list,
                //  because co-edit need undo/redo list to resolve conflict issue.
                if (!find)
                    this.stack.shift();
            }
            this.index = this.stack.push(action) - 1;

            if (this.isIMEing()) {
                this.imeAction++;
            }
            this.onChange();
        },

        removeUndo: function() {
            return this._removeAction(this.stack.length - 1);
        },

        _removeAction: function(idx) {
            var action = this.stack[idx];
            var len = this.stack.length - idx;
            this.stack.splice(idx, len);
            this.index = this.stack.length - 1;
            this.onChange();

            return action;
        },

        onChange: function() {
            // Use this flag to update screen in update manager.
            this.editor.needScroll = true;

            this.editor.getCommand('undo').setState(this.undoable() ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_DISABLED);
            this.editor.getCommand('redo').setState(this.redoable() ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_DISABLED);
        },

        hasUndo: function() {
            return this.index != -1 ? true : false;
        },

        hasRedo: function() {
            return this.index < this.stack.length - 1 ? true : false;
        },

        /**
         * Check the current undo state.
         * @return {Boolean} Whether the document has future state to restore.
         */
        undoable: function() {
            var undoable = false;
            if (this.hasUndo()) {
                undoable = true;
                var msgList = this.stack[this.index].undo;
                for (var i = 0; i < msgList.length; i++) {
                    if (msgList[i].disableUndo != null) {
                        undoable = false;
                        break;
                    }
                }
            }
            return undoable;
        },

        /**
         * Check the current redo state.
         * @return {Boolean} Whether the document has previous state to
         *		retrieve.
         */
        redoable: function() {
            var redoable = false;
            if (this.hasRedo()) {
                redoable = true;
                var msgList = this.stack[this.index + 1].redo;
                for (var i = 0; i < msgList.length; i++) {
                    if (msgList[i].disableRedo != null) {
                        redoable = false;
                        break;
                    }
                }
            }
            return redoable;
        },

        getAction: function(isUndo, isFromUndo) {
            if (isUndo) {
                if (this.hasUndo()) {
                    var action = this.stack[this.index];
                    this.index = this.index - 1;
                    return action.undo;
                }
            } else if (this.hasRedo()) {
                this.index = this.index + 1;
                var action = this.stack[this.index];
                if (isFromUndo) //when perform undo,we just need redo message,but we don't actually redo 
                    this.index = this.index - 1;
                return action.redo;
            }
            return null;
        },

        _getMsgIndex: function(msg, isUndo) {
            var stackIndex = -1;
            for (var i = 0; i < this.stack.length; i++) {
                var msgList;
                if (isUndo) {
                    msgList = this.stack[i].undo;
                } else
                    msgList = this.stack[i].redo;

                var find = false;
                var interIndex = 0;
                for (var j = 0; j < msgList.length; j++) {
                    if (msgList[j].client_seq == msg.client_seq) {
                        find = true;
                        interIndex = j;
                        break;
                    }
                }
                if (find) {
                    stackIndex = i;
                    break;
                }
            }
            return {
                "stackIndex": stackIndex,
                "interIndex": interIndex
            };
        },

        _rollbackUndo: function(msg) {
            //get conflict msg index on stack
            var stack = this._getMsgIndex(msg, false);
            var stackIndex = stack.stackIndex;
            if (stackIndex == -1)
                return false;

            var ignoreFirstMsg = false; // For list, defect 39495
            if (stack.interIndex > 0) {
                if (stack.interIndex == 1) {
                    var firstMsg = this.stack[stackIndex][0];
                    if (firstMsg.mc == constants.MSGCATEGORY.List)
                        ignoreFirstMsg = true;
                }
                if (!ignoreFirstMsg)
                    return true;
            }

            for (var i = this.index; i >= stackIndex; i--) {
                var msgList = this.stack[i].undo;
                if (ignoreFirstMsg && i == stackIndex)
                    msgList.shift();
                this.performAction(msgList, true);
            }
            //remove roll backed actions on undo stack
            this._removeAction(stackIndex);
        },

        _rollbackRedo: function(msg) {
            //get conflict msg index on stack
            var stack = this._getMsgIndex(msg, true);
            var stackIndex = stack.stackIndex;
            if (stackIndex == -1)
                return;

            var interIndex = this.stack[stackIndex].redo.length - 1 - stack.interIndex;
            //roll back actions
            for (var i = this.index + 1; i <= stackIndex; i++) {
                var msgList = this.stack[i].redo;

                this.performAction(msgList, true);
                if(pe.scene.session){
                    for (var j = 0; j < msgList.length; j++) {
                        var msg = msgList[j];
                        if (msg.updates.length == 0)
                            continue;

                        if (i == stackIndex && j > interIndex) //should send out undo message again
                        {
                            var sess = pe.scene.session;
                            msg.client_seq = sess.increaseClientSeq();
                            msg.server_seq = sess.getCurrentSeq() - 1;
                            sess.sendMessage(lang.clone(msg));
                        }
                    }
                }
            }
            //remove roll backed actions on undo stack
            this.index = stackIndex;
            this.onChange();
        },

        rollback: function(msg) {
            var ret = this._rollbackUndo(msg);
            if (ret === false)
                ret = this._rollbackRedo(msg);

            return ret;
        },

        transform: function(baseMsg) {
            var strMsg = JSON.stringify(baseMsg);

            var undoList = [],
                redoList = [];
            for (var i = 0; i < this.stack.length; i++) {
                var action = this.stack[i];
                undoList = action.undo.concat(undoList); //from top to bottom
                redoList = redoList.concat(action.redo); //from bottom to top
            }
            var msg, baseList;
            //transform with undo first
            var conflicted = false;
            var clonedBaseMsg = JSON.parse(strMsg);

            for (i = 0; i < undoList.length; i++) {
                msg = undoList[i];
                if (otService.transform(msg, [clonedBaseMsg], true)) { //rejected
                    msg.disableUndo = true;
                    conflicted = true;
                }
                if (clonedBaseMsg.changed) {
                    clonedBaseMsg = JSON.parse(strMsg);
                }
            }

            //then transform with redo with transform result of undo
            clonedBaseMsg = JSON.parse(strMsg);
            for (i = 0; i < redoList.length; i++) {
                msg = redoList[i];
                if (otService.transform(msg, [clonedBaseMsg], true)) { //rejected
                    msg.disableRedo = true;
                    conflicted = true;
                }
                if (clonedBaseMsg.changed) {
                    clonedBaseMsg = JSON.parse(strMsg);
                }
            }

            conflicted && this.onChange();
        },

        inUndoRedo: function() {
            return (this._inUndoRedo === true);
        },

        enterUndoRedo: function() {
            this._inUndoRedo = true;
        },

        exitUndoRedo: function() {
            this._inUndoRedo = false;
        },

        performAction: function(msgList, isRollback) {
            if (!msgList || msgList.length == 0)
                return;
            this.enterUndoRedo();

			pe.scene.editorContentChanged = true;
			
            topic.publish(constants.EVENT.GROUPCHANGE_START);
            msgHandler.beginAction();

            for (var i = 0; i < msgList.length; i++) {
                var msg = msgList[i];
                if (msg.updates != null && msg.updates.length == 0) //ts added the check if updates is null
                    continue;

                // Ignore the create List object action
                if (msg.mc == constants.MSGCATEGORY.Selection)
                    continue;
                if (msg.mc == constants.MSGCATEGORY.List && msg.updates[0].t == constants.ACTTYPE.AddList)
                    continue;
                // Ignore add style action
                if (msg.mc == constants.MSGCATEGORY.Style && msg.type == constants.MSGTYPE.Style && msg.updates[0].t == constants.ACTTYPE.AddStyle)
                    continue;

                msgHandler.processMessage(msg, true, (i == msgList.length - 1));
            }
            delete msgCenter._notesMsg;
            msgHandler.endAction();
            topic.publish(constants.EVENT.GROUPCHANGE_END);
            //dojo.publish(writer.constants.EVENT.SELECTION_CHANGE);//defect33824 to update the toolbar status
            if (!isRollback) {
                var cloneList = array.map(msgList, function(item) {
                	var nItem = lang.mixin({}, item);
                	if(item.updates && item.updates.length > 0)
                	{
                		var newUp = [];
                		array.forEach(item.updates, function(update){
        					if(update.unProcessed)
        						delete update.unProcessed;
        					else
        					{
        						var appendMsgs = update.appendProssMsg;
	        					if(appendMsgs)
	        					{
	        						delete update.appendProssMsg;
	        						newUp.push(update);
	        						newUp = newUp.concat(appendMsgs);
	        					}
	        					else
	        						newUp.push(update);
        					}
                		});
                		nItem.updates = newUp;
                	}
                    return nItem;
                });
                pe.scene.session && pe.scene.session.sendMessage(cloneList);
                msgCenter.updateMsgState(cloneList, msgList);

                this.onChange();
            }

            this.exitUndoRedo();
        },

        updateCompositeKeyAction: function(type) {
            var idx = this.stack.length - 1;
            var action = this.stack[idx];
            if (type == 1) //end
            {
                action.undo.pop();
                action.redo.shift();
            } else if (type == 2) //start && selected
            {
                action.undo.shift();
                action.redo.pop();
            }
        },

    });
    return UndoManager;
});
