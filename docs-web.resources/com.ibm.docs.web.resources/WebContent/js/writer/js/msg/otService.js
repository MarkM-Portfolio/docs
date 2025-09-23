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
    "writer/constants"
], function(lang, constants) {

    var otService = {

        /**
         * Transform the received message with local message List.
         * The function maybe change the received message content before apply it. 
         *  
         * @param msg The incoming message which will be do OT.
         * @param localList The base message list.
         * @param isFromUndo boolean It's do OT for undo/redo message
         * @returns Return the conflicted message in the local list.
         */
        transform: function(msg, localList, isTransformUndo) {
            var isReject = false;
            var msgType = constants.MSGTYPE;
            for (var i = 0; i < localList.length; i++) {
                var baseMsg = localList[i];
                // Different message category.
                if (msg.mc != baseMsg.mc)
                    continue;
                if (msg.updates.length == 0 || baseMsg.updates.length == 0)
                    continue;

                switch (baseMsg.type) {
                    case msgType.Text:
                        isReject = this.transTextMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.Element:
                        isReject = this.transElementMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.Attribute:
                        isReject = this.transAttributeMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.TextAttribute:
                        isReject = this.transTextAttributeMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.Table:
                        isReject = this.transTableMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.TextComment:
                        isReject = this.transTextCommentMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.List:
                        isReject = this.transListMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.Section:
                        isReject = this.transSectionMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.Style:
                        // No OT needed for style message.
                        break;
                    case msgType.KeyMessage:
                        isReject = this.transKeyMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.Setting:
                        isReject = this.transSettingMsg(baseMsg, msg, isTransformUndo);
                        break;
                    case msgType.Task:
                        // No OT needed for task message.
                        break;
                    case msgType.Selection:
                        // No OT needed for selection message.
                        break;
                    case msgType.CheckModel:
                        // No OT needed for checkmodel message.
                        break;
                    case msgType.AcceptTrackChange:
                        // No OT needed for AcceptTrackChange message.
                        break;
                    default:
                        console.error("Missing OT for message type: " + baseMsg.type);
                        break;
                }

                if (isReject)
                    return baseMsg;
            }

            return null;
        },

        /**
         * Transform Text and Text message
         * @param baseMsg Action type: Insert Text, Delete Text
         * @param msg Action type: Insert Text, Delete Text
         * @param isTransformUndo 
         * @returns
         */
        _transTextText: function(baseMsg, msg, isTransformUndo) {
            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            var baseChanged = false;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                var opLens = ops.length;
                var bSkipNewOp = false;
                for (var j = 0; j < opLens; j++) {
                    if (bSkipNewOp) {
                        bSkipNewOp = false;
                        continue;
                    }
                    op = ops[j];
                    if (baseOp.tid != op.tid)
                        continue;

                    if (baseOp.t == actType.InsertText) {
                        if (op.t == actType.InsertText) {
                            if (op.idx > baseOp.idx || (op.idx == baseOp.idx && isTransformUndo))
                                op.idx += baseOp.len;
                            else {
                                baseOp.idx += op.len;
                                baseChanged = true;
                            }


                        } else if (op.t == actType.DeleteText) {
                            if (op.idx >= baseOp.idx)
                                op.idx += baseOp.len;
                            else {
                                if (op.idx + op.len <= baseOp.idx) {
                                    baseOp.idx -= op.len;
                                    baseChanged = true;
                                } else {
                                    var newDeleteOp = {};
                                    newDeleteOp.tid = op.tid;
                                    newDeleteOp.t = op.t;
                                    newDeleteOp.idx = op.idx + baseOp.len;
                                    newDeleteOp.len = op.idx + op.len - baseOp.idx;

                                    op.len = baseOp.idx - op.idx;
                                    ops.splice(j + 1, 0, newDeleteOp);
                                    opLens++;
                                    bSkipNewOp = true;
                                }
                            }
                        }
                    } else if (baseOp.t == actType.DeleteText) {
                        if (op.t == actType.InsertText) {
                            if (op.idx > baseOp.idx) {
                                if (op.idx <= baseOp.idx + baseOp.len)
                                    op.idx = baseOp.idx;
                                else
                                    op.idx -= baseOp.len;
                            } else {
                                baseChanged = true;
                                baseOp.idx += op.len;
                            }
                        } else if (op.t == actType.DeleteText) {
                            if (op.idx <= baseOp.idx) {
                                if (op.idx + op.len > baseOp.idx) {
                                    if (op.idx + op.len < baseOp.idx + baseOp.len)
                                        op.len = baseOp.idx - op.idx;
                                    else
                                        op.len -= baseOp.len;
                                } else {
                                    baseChanged = true;
                                    baseOp.idx -= op.len;
                                }
                            } else {
                                if (op.idx < baseOp.idx + baseOp.len) {
                                    if (op.idx + op.len < baseOp.idx + baseOp.len)
                                        op.len = 0;
                                    else
                                        op.len = op.len - (baseOp.idx + baseOp.len - op.idx);
                                    //                                  op.len = op.idx + op.len - baseOp.idx - baseOp.len;
                                    op.idx = baseOp.idx;
                                } else
                                    op.idx -= baseOp.len;
                            }
                        }
                    }
                }
            }
            if (baseChanged && isTransformUndo) {
                baseMsg.changed = true;
            }
            return false;
        },

        /**
         * Transform Text Message & TextAttribute Message
         * @param baseMsg Action type: InsertText, Delete Text
         * @param msg Action type: SetTextAttribute
         * @param isTransformUndo
         * @returns
         */
        _transTextTextAttribute: function(baseMsg, msg, isTransformUndo) {
            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            var baseIdx, baseLen, idx, len;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                baseIdx = baseOp.idx;
                baseLen = baseOp.len;

                var opLens = ops.length;
                var bSkipNewOp = false;
                for (var j = 0; j < opLens; j++) {
                    if (bSkipNewOp) {
                        bSkipNewOp = false;
                        continue;
                    }
                    op = ops[j];
                    if (baseOp.tid != op.tid)
                        continue;

                    idx = op.idx;
                    len = op.len;
                    if (baseOp.t == actType.InsertText) {
                        if (baseIdx > idx && baseIdx <= idx + len) {
                            var newOp = {};
                            newOp.tid = op.tid;
                            newOp.t = op.t;
                            newOp.st = lang.clone(op.st);
                            newOp.idx = baseIdx + baseLen;
                            newOp.len = len - (baseIdx - idx);

                            ops.splice(j + 1, 0, newOp);
                            op.len = baseIdx - idx;

                            opLens++;
                            bSkipNewOp = true;
                        } else
                            op.idx += baseLen;
                    } else if (baseOp.t == actType.DeleteText) {
                        if (idx <= baseIdx) {
                            if (idx + len > baseIdx) {
                                if (idx + len < baseIdx + baseLen)
                                    op.len = baseIdx - idx;
                                else
                                    op.len = len - baseLen;
                            }
                        } else {
                            if (idx < baseIdx + baseLen) {
                                op.idx = baseIdx;
                                if (idx + len < baseIdx + baseLen)
                                    op.len = 0;
                                else
                                    op.len = idx + len - baseIdx - baseLen;
                            } else
                                op.idx = idx - baseLen;
                        }
                    }
                }
            }

            return false;
        },

        /**
         * Transform Text Message & TextComment Message
         * @param baseMsg Action type: InsertText, DeleteText
         * @param msg Action type: AddComment, DelComment
         * @param isTransformUndo
         * @returns
         */
        _transTextTextComment: function(baseMsg, msg, isTransformUndo) {
            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            var baseIdx, baseLen, idx, len;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                baseIdx = baseOp.idx;
                baseLen = baseOp.len;
                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (baseOp.tid != op.tid || op.t == actType.DelComment)
                        continue;

                    // Operation is Insert Comments
                    idx = op.idx;
                    len = op.len;
                    if (baseOp.t == actType.InsertText) {
                        // Client: Insert text in comments will reject it.
                        // Server: Base is comment and insert text in comment, reject it.
                        if (baseIdx > idx && baseIdx < idx + len) {
                            //                      if(isTransformUndo)
                            op.len += baseLen;
                            //                      else
                            //                          return true;
                        } else if (baseIdx <= idx)
                            op.idx += baseLen;
                    } else if (baseOp.t == actType.DeleteText) {
                        if (idx <= baseIdx) {
                            if (idx + len > baseIdx) {
                                if (idx + len < baseIdx + baseLen)
                                    op.len = baseIdx - idx;
                                else
                                    op.len = len - baseLen;
                            }
                        } else {
                            if (idx < baseIdx + baseLen) {
                                op.idx = baseIdx;
                                if (idx + len < baseIdx + baseLen)
                                    op.len = 0;
                                else
                                    op.len = idx + len - baseIdx - baseLen;
                            } else
                                op.idx = idx - baseLen;
                        }
                    }
                }
            }

            return false;
        },

        _transTextAttribute: function(baseMsg, msg, isTransformUndo) {
            if (!isTransformUndo)
                return false;

            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                var bmkId = baseOp.oid;
                if (!bmkId || baseOp.t != actType.DeleteText)
                    continue;

                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (bmkId != op.tid || op.t != actType.SetAttribute)
                        continue;
                    op.tid = null; // Set the change bookmark id to null.
                }
            }

            return false;
        },

        /**
         * Transform Text message with other message.
         * @param baseMsg type is Text Message
         * @param msg type is Text, Text Attribute, Text Comment. 
         * @param isTransformUndo
         * @returns
         */
        transTextMsg: function(baseMsg, msg, isTransformUndo) {
            var msgType = constants.MSGTYPE;
            switch (msg.type) {
                case msgType.Text:
                    return this._transTextText(baseMsg, msg, isTransformUndo);
                case msgType.TextAttribute:
                    return this._transTextTextAttribute(baseMsg, msg, isTransformUndo);
                case msgType.TextComment:
                    return this._transTextTextComment(baseMsg, msg, isTransformUndo);
                case msgType.Attribute:
                    return this._transTextAttribute(baseMsg, msg, isTransformUndo); // Delete bookmark and change bookmark
            }

            return false;
        },

        /**
         * Transform Element/Table with Element/Table message.
         * @param baseMsg Element Message or Table Message
         * @param msg Element Message or Table Message
         * @param isTransformUndo
         */
        _transElementElement: function(baseMsg, msg, isTransformUndo) {
            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            var baseIdx, idx;
            var baseChanged = false;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                baseIdx = baseOp.idx;
                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    // baseMsg is in my stack, msg is incoming.
                    if (baseOp.tid != op.tid)
                    {
                        if (baseOp.t == actType.DeleteElement && baseOp.sid && baseOp.sid == op.tid)
                            return true;
                        continue;
                    }
                    if (baseOp.t == actType.InsertElement) {
                        baseIdx = baseOp.idx;
                        if (op.t == actType.InsertElement) {
                            idx = op.idx;

                            if (idx < 0) // OT maybe transformed the idx to -1.
                                continue;

                            if (isTransformUndo && baseOp.cnt && op.cnt && baseOp.cnt.id && baseOp.cnt.id == op.cnt.id) {
                                op.idx = -1; // Don't insert it back 
                                // Hack way for OT. Change this message from insert element to delete element.
                                op.t = actType.DeleteElement;
                                continue;
                            }


                            if (idx > baseIdx || (idx == baseIdx && isTransformUndo))
                                op.idx = op.idx + 1;
                            else {
                                baseOp.idx = baseIdx + 1;
                                baseChanged = true;
                            }
                        } else if (op.t == actType.DeleteElement) {
                            idx = op.idx;
                            if (idx < 0) // OT maybe transformed the idx to -1.
                                continue;

                            if (idx >= baseIdx)
                                op.idx = idx + 1;
                            else {
                                baseOp.idx = baseIdx - 1;
                                baseChanged = true;
                            }
                        }
                    } else if (baseOp.t == actType.DeleteElement) {
                        baseIdx = baseOp.idx;
                        if (baseIdx < 0)
                            break;

                        if (op.t == actType.InsertElement) {
                            idx = op.idx;
                            if (idx < 0)
                                continue;

                            if (idx > baseIdx)
                                op.idx = idx - 1;
                            else if (idx == baseIdx)
                            ; // No change
                            else {
                                baseOp.idx = baseIdx + 1;
                                baseChanged = true;
                            }
                        } else if (op.t == actType.DeleteElement) {
                            idx = op.idx;
                            if (idx < 0)
                                continue;

                            if (idx < baseIdx) {
                                baseOp.idx = baseIdx - 1;
                                baseChanged = true;
                            } else if (idx == baseIdx) {
                                op.idx = -1; // Delete same element, set index to -1
                                if (!isTransformUndo)
                                    baseOp.idx = -1; // Avoid to transfer with next insert element.
                            } else
                                op.idx = idx - 1;
                        }
                    }
                }
            }
            if (baseChanged && isTransformUndo) {
                baseMsg.changed = true;
            }
            return false;
        },

        /**
         * Transform Element message with other message
         * @param baseMsg Element message
         * @param msg Element message and Table Message
         * @param isTransformUndo
         * @returns
         */
        transElementMsg: function(baseMsg, msg, isTransformUndo) {
            var msgType = constants.MSGTYPE;
            var actType = constants.ACTTYPE;
            if (msg.type == msgType.Element || msg.type == msgType.Table)
                return this._transElementElement(baseMsg, msg, isTransformUndo);
            else {
                var baseOps = baseMsg.updates;
                var ops = msg.updates;
                var baseOp, op;

                switch (msg.type) {
                    case msgType.Text:
                    case msgType.Attribute:
                    case msgType.TextAttribute:
                    case msgType.TextComment:
                        for (var i = 0; i < baseOps.length; i++) {
                            baseOp = baseOps[i];
                            if (baseOp.t != actType.DeleteElement)
                                continue;
                            for (var j = 0; j < ops.length; j++) {
                                op = ops[j];
                                if (baseOp.sid && baseOp.sid == op.tid)
                                    return true;
                                if (baseOp.tid != op.tid)
                                    continue;

                                if (op.t == actType.InsertText) {
                                    op.len = 0;
                                } else if (op.t == actType.SetAttribute) {
                                    op.st = null;
                                    op.at = null;
                                } else if (op.t == actType.SetTextAttribute) {
                                    op.len = 0;
                                } else if (op.t == actType.AddComment) {
                                    op.len = 0;
                                    op.cpid = null;
                                }
                            }
                        }
                        break;
                }
            }
            return false;
        },

        /**
         * Check if these object has same key
         * @param json1
         * @param json2
         * @returns
         */
        _hasSameKey: function(json1, json2) {
            if (json1 && json2) {
                for (var key in json1) {
                    if (json2[key])
                        return true;
                }
            }
            return false;
        },

        /**
         * Transform Attribute and Attribute Message
         * @param baseMsg Attribute message with SetAttribute action.
         * @param msg Attribute message with SetAttribute action.
         * @param isTransformUndo
         * @returns
         */
        transAttributeMsg: function(baseMsg, msg, isTransformUndo) {
            // Don't do Attribute message OT for undo/redo
            if (msg.type != constants.MSGTYPE.Attribute)
                return false;

            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (baseOp.tid != op.tid)
                        continue;

                    if (this._hasSameKey(baseOp.st, op.st))
                        return true;
                    if (this._hasSameKey(baseOp.at, op.at));
                    return true;
                }
            }
            return false;
        },

        /**
         * Transform TextAttribute message with TextAttribute message
         * @param baseMsg Action type is SetTextAttribute
         * @param msg Action type is SetTextAttribute
         * @param isTransformUndo
         */
        _transTextAttributeTextAttribute: function(baseMsg, msg, isTransformUndo) {
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            var baseIdx, baseLen, idx, len;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                baseIdx = baseOp.idx;
                baseLen = baseOp.len;
                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (baseOp.tid != op.tid)
                        continue;

                    idx = op.idx;
                    len = op.len;
                    if ((idx >= baseIdx && idx <= baseIdx + baseLen) || (baseIdx >= idx && baseIdx <= idx + len)) {
                        if (this._hasSameKey(baseOp.st, op.st))
                            return true;
                    }
                }
            }
        },

        /**
         * Transform TextAttribute message with Text/TextAttribute message
         * @param baseMsg Action type is SetTextAttribute
         * @param msg Action type is SetTextAttribute
         * @param isTransformUndo
         * @returns
         */
        transTextAttributeMsg: function(baseMsg, msg, isTransformUndo) {
            // Don't do OT for undo/redo
            //      if(isTransformUndo)
            //          return false;

            if (msg.type == constants.MSGTYPE.TextAttribute)
                return this._transTextAttributeTextAttribute(baseMsg, msg, isTransformUndo);

            return false;
        },

        /**
         * Transform Table with Table and Element message.
         * @param baseMsg
         * @param msg
         * @param isTransformUndo
         * @returns
         */
        transTableMsg: function(baseMsg, msg, isTransformUndo) {
            if (msg.type == constants.MSGTYPE.Table) {
                var baseOps = baseMsg.updates;
                var ops = msg.updates;

                for (var i = 0; i < baseOps.length; i++) {
                    for (var j = 0; j < ops.length; j++) {
                        if (baseOps[i].tbId && baseOps[i].tbId == ops[j].tbId)
                            return true;
                    }
                    var baseOp = baseOps[i], op = ops[j];
                    if (op.t == constants.ACTTYPE.InsertRow) {
                        if (baseOp.tbId && baseOp.tbId == op.tid)
                            return true;
                    }
                    if (baseOp.t == constants.ACTTYPE.InsertRow) {
                        if (baseOp.tid && baseOp.tid == op.tbId)
                            return true;
                    }
                    if (op.t == constants.ACTTYPE.DeleteRow) {
                        if (op.fc && op.fc.length && baseOp.tbId && baseOp.tbId == op.tid)
                            return true;
                    }
                    if (baseOp.t == constants.ACTTYPE.DeleteRow) {
                        if (baseOp.fc && baseOp.fc.length && op.tbId && op.tbId == baseOp.tid)
                            return true;
                    }
                }
            } else if (msg.type == constants.MSGTYPE.Element)
                return this._transElementElement(baseMsg, msg, isTransformUndo);
            return false;
        },
        /**
         * Transform TextComment with Text message.
         * @param baseMsg
         * @param msg
         * @param isTransformUndo
         * @returns
         */
        transTextCommentMsg: function(baseMsg, msg, isTransformUndo) {
            if (msg.type != constants.MSGTYPE.Text)
                return false;

            var actType = constants.ACTTYPE;

            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            var baseIdx, baseLen, idx, len;
            var baseChanged = false;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                if (baseOp.t != actType.AddComment)
                    continue;

                baseIdx = baseOp.idx;
                baseLen = baseOp.len;
                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (baseOp.tid != op.tid)
                        continue;
                    idx = op.idx;
                    len = op.len;
                    if (op.t == actType.InsertText) {
                        if (idx < baseIdx) {
                            baseOp.idx += len;
                            baseChanged = true;
                        }
                        //                  else if(!isTransformUndo && idx < baseIdx + baseLen)    // Insert text conflict with comments
                        //                      return true;    // The case should not happened, which has been rejected by server.
                    } else if (op.t == actType.DeleteText) {
                        if (idx < baseIdx) {
                            if (idx + len < baseIdx) {
                                baseOp.idx = idx;
                                var newLen = baseLen + baseIdx - idx;
                                if (newLen < 0)
                                    newLen = 0;
                                baseOp.len = newLen;
                                baseChanged = true;
                            } else {
                                baseOp.idx -= len;
                                baseChanged = true;
                            }
                        } else if (idx < baseIdx + baseLen) {
                            var newLen = 0;
                            if (idx + len < baseIdx + baseLen)
                                newLen = baseLen - len;
                            else
                                newLen = idx - baseIdx;
                            baseOp.len = newLen;
                            baseChanged = true;
                        }
                    }
                }
            }
            if (baseChanged && isTransformUndo) {
                baseMsg.changed = true;
            }
            return false;
        },

        /**
         * Transform List and List message
         * @param baseMsg
         * @param msg
         * @param isTransformUndo
         * @returns
         */
        transListMsg: function(baseMsg, msg, isTransformUndo) {
            if (msg.type != constants.MSGTYPE.List)
                return false;

            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (baseOp.nid == op.nid)
                        return true;
                }
            }
            return false;
        },

        /**
         * Transform Section message
         * @param baseMsg
         * @param msg
         * @param isTransformUndo
         */
        transSectionMsg: function(baseMsg, msg, isTransformUndo) {
            if (msg.type != constants.MSGTYPE.Section)
                return false;

            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];

                var baseTarget = null;
                if (baseOp.t == actType.InsertSection || baseOp.t == actType.DeleteSection)
                    baseTarget = baseOp.tid;
                else
                    continue;

                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (op.t == actType.InsertSection || op.t == actType.DeleteSection) {
                        if (baseTarget == op.tid)
                            return true;
                    }
                }
            }
        },

        /**
         * Transform Key and Key message
         * @param baseMsg
         * @param msg
         * @param isTransformUndo
         */
        transKeyMsg: function(baseMsg, msg, isTransformUndo) {
            if (msg.type != constants.MSGTYPE.KeyMessage)
                return false;

            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            var keyId = null,
                arrayKeyId = null;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                if (baseOp.t == actType.InsertKey || baseOp.t == actType.DeleteKey || baseOp.t == actType.ReplaceKey)
                    keyId = baseOp.k;
                else if (baseOp.t == actType.InsertArray || baseOp.t == actType.DeleteArray)
                    arrayKeyId = baseOp.k;
                else
                    continue;

                for (var j = 0; j < ops.length; j++) {
                    op = ops[j];
                    if (op.t == actType.InsertKey || op.t == actType.DeleteKey || op.t == actType.ReplaceKey) {
                        if (keyId != null && keyId == op.k)
                            return true;
                    } else if (op.t == actType.InsertArray || op.t == actType.DeleteArray) {
                        if (arrayKeyId != null && arrayKeyId == op.k)
                            return true;
                    }
                }
            }

            return false;
        },

        /**
         * Transform Setting and Setting message
         * @param baseMsg
         * @param msg
         * @param isTransformUndo
         * @returns
         */
        transSettingMsg: function(baseMsg, msg, isTransformUndo) {
            if (msg.type != constants.MSGTYPE.Setting)
                return false;

            var actType = constants.ACTTYPE;
            var baseOps = baseMsg.updates;
            var ops = msg.updates;

            var baseOp, op;
            for (var i = 0; i < baseOps.length; i++) {
                baseOp = baseOps[i];
                if (baseOp.t == actType.AddEvenOdd || baseOp.t == actType.RemoveEvenOdd) {
                    for (var j = 0; j < ops.length; j++) {
                        op = ops[j];
                        if (op.t == actType.AddEvenOdd || op.t == actType.RemoveEvenOdd)
                            return true;
                    }
                }
            }

            return false;
        }

    }
    return otService;
});
