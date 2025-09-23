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
    "dojo/dom-class",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/query",
    "dojo/_base/window",
    "dojo/dom-attr",
    "dojo/has",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/topic",
    "concord/task/AbstractTaskHandler",
    "concord/task/CachedTask",
    "writer/common/RangeIterator",
    "writer/util/HelperTools",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/constants",
    "dijit/registry",
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/MenuSeparator",
    "dijit/form/DropDownButton"
], function(domClass, declare, array, dom, query, windowModule, domAttr, has, lang, domStyle, domConstruct, topic, AbstractTaskHandler, CachedTask, RangeIterator, HelperTools, ModelTools, RangeTools, msgCenter, msgHelper, constants, registry, Menu, MenuItem, MenuSeparator, DropDownButton) {

    var TaskHandler = declare("writer.collaboration.TaskHandler", AbstractTaskHandler, {

        FIELDSET_CLASS: ["concordWriteTaskBlock", "concordReviewTaskBlock", "concordLockTaskBlock", "concordWriteCompleteTaskBlock", "concordReviewCompleteTaskBlock", "concordCachedTaskBlock"],
        currentDlg: null, // a reference for an opened dialog
        curTaskId: null,
        enable: false,

        // This object need reimplement it. Like remove syncmsg, msgutil etc.

        constructor: function() {
            this.bStrict = false;
        },
        selectionChange: function(range) {
            var iterator = new RangeIterator(range);
            var para = iterator.nextParagraph();
            var taskId = null;
            if (para) {
                if (HelperTools.canTaskCreate())
                    this.enableTaskCmds(true);
                else
                    this.enableTaskCmds(false);
                if (para.isTask()) {
                    taskId = para.getTaskId();
                } else {
                    var table = ModelTools.getRootTable(para);
                    if (table && table.isTask()) {
                        taskId = table.getTaskId();
                    }
                }
                if (taskId != this.curTaskId) {
                    if (taskId)
                        this.forceUpdateTaskModel(taskId);
                    if (this.curTaskId)
                        this.forceUpdateTaskModel(this.curTaskId);
                    var taskBean = this.getTaskBeanById(HelperTools.getSelectedTaskId());
                    var taskId = taskBean ? taskBean.getId() : null;
                    this.setTaskSelected(taskId);
                    pe.lotusEditor.updateManager.update();
                }

            }
        },
        getTaskCSSStyle: function(taskId) {
            var taskBean = this.getTaskBeanById(taskId);
            if (taskBean && taskBean.getState() == 'complete')
                return "task_done";
            else
                return "task";
        },
        getTaskStyle: function(flag, width, height, left, top) {
            var style = "height: " + height + "px; left: " + left + "px; width:" + width + "px; ";
            return style + "top: " + top + "px;";
        },
        createTaskNode: function(viewNode, flag, width, height, left, top) {
            var taskNode = domConstruct.create("div", {
                "class": this.getTaskCSSStyle(viewNode.model.getTaskId()),
                "style": this.getTaskStyle(flag, width, height, left, top)
            });
            viewNode.tpNode.appendChild(taskNode);
            return taskNode;
        },
        isTaskTop: function(viewNode) {
            if (viewNode.model.isTask()) {
                var pre_obj = ModelTools.getPrev(viewNode.model, ModelTools.isParaOrTable);
                if (pre_obj == null || !pre_obj.isTask())
                    return true;
                else
                    return pre_obj.getTaskId() != viewNode.model.getTaskId();
            }
            return false;
        },
        isTaskBottom: function(viewNode) {
            if (viewNode.model.isTask()) {
                var next_obj = ModelTools.getNext(viewNode.model, ModelTools.isParaOrTable);
                if (next_obj == null || !next_obj.isTask())
                    return true;
                else
                    return next_obj.getTaskId() != viewNode.model.getTaskId();
            }
            return false;
        },
        createTaskAction: function(viewNode) {
            if (viewNode.model.getTaskId() != this.curTaskId)
                return;
            var taskActionNode = domConstruct.create("div", {
                "class": "oneui30 dropdownbtn",
                "style": "position:absolute;left:" + (viewNode.parent.getWidth() - 3) + "px;top:0px;z-index:10001;",
                "id": viewNode.model.getTaskId()
            });
            this.destroyActionButton(viewNode.model.getTaskId());
            taskActionNode.appendChild(this.createActionButton(viewNode.model.getTaskId()).domNode);
            viewNode.tpNode.appendChild(taskActionNode);
            viewNode.taskNode.action = taskActionNode;
        },
        createTaskTitle: function(viewNode) {
            if (viewNode.model.getTaskId() != this.curTaskId)
                return;
            var taskTitleNode = domConstruct.create("span", {
                "class": "task_title"
            });
            var taskBean = this.getTaskBeanById(viewNode.model.getTaskId());
            if (taskBean)
                taskTitleNode.innerHTML = this.getTitleInfo(taskBean).title;
            viewNode.tpNode.appendChild(taskTitleNode);
            viewNode.taskNode.title = taskTitleNode;
        },
        removeTaskNode: function(viewNode) {
            if (viewNode.model.isTask()) {
                if (viewNode.taskNode.left) {
                    viewNode.tpNode.removeChild(viewNode.taskNode.left);
                    viewNode.taskNode.left = null;
                }
                if (viewNode.taskNode.right) {
                    viewNode.tpNode.removeChild(viewNode.taskNode.right);
                    viewNode.taskNode.right = null;
                }
                if (viewNode.taskNode.bottom) {
                    viewNode.tpNode.removeChild(viewNode.taskNode.bottom);
                    viewNode.taskNode.bottom = null;
                }
                if (viewNode.taskNode.top) {
                    viewNode.tpNode.removeChild(viewNode.taskNode.top);
                    viewNode.taskNode.top = null;
                    if (viewNode.taskNode.title) {
                        viewNode.tpNode.removeChild(viewNode.taskNode.title);
                        viewNode.taskNode.title = null;
                        this.destroyActionButton(viewNode.model.getTaskId());
                    }
                    if (viewNode.taskNode.action) {
                        viewNode.tpNode.removeChild(viewNode.taskNode.action);
                        viewNode.taskNode.action = null;
                    }
                }
            }
        },
        _taskRender: function(viewNode) {
            if (this.getShow()) {
                if (viewNode.model.isTask()) {
                    var bold_size = 2;
                    var x_offsize = 10;
                    var height = viewNode.h;
                    if (viewNode.height)
                        height = viewNode.height;
                    var border_top_w = 0;
                    var border_left_w = 0;
                    var border_right_w = 0;
                    var border_bottom_w = 0;

                    if (viewNode.getTopBorderWidth)
                        border_top_w = viewNode.getTopBorderWidth();
                    if (viewNode.getLeftBorderWidth)
                        border_left_w = viewNode.getLeftBorderWidth();
                    if (viewNode.getRightBorderWidth)
                        border_right_w = viewNode.getRightBorderWidth();
                    if (viewNode.getBottomBorderWidth)
                        border_bottom_w = viewNode.getBottomBorderWidth();

                    viewNode.taskNode.left = this.createTaskNode(viewNode, constants.TASK.FLAG_LEFT, bold_size,
                        height, -bold_size - x_offsize - border_left_w, -border_top_w);;
                    viewNode.taskNode.right = this.createTaskNode(viewNode, constants.TASK.FLAG_RIGHT, bold_size,
                        height, viewNode.parent.getWidth() + x_offsize - border_right_w, -border_top_w);
                    if (this.isTaskTop(viewNode)) {
                        var next_view = RangeTools.getNextPara(viewNode);
                        if (next_view && next_view.taskNode.top) {
                            next_view.tpNode.removeChild(next_view.taskNode.top);
                            next_view.taskNode.top = null;
                            if (next_view.taskNode.title) {
                                next_view.tpNode.removeChild(next_view.taskNode.title);
                                next_view.taskNode.title = null;
                            }
                            if (next_view.taskNode.action) {
                                this.destroyActionButton(next_view.model.getTaskId());
                                next_view.tpNode.removeChild(next_view.taskNode.action);
                                next_view.taskNode.action = null;
                            }
                        }

                        viewNode.taskNode.top = this.createTaskNode(viewNode, constants.TASK.FLAG_TOP, viewNode.parent.getWidth() + 2 * x_offsize, bold_size, -x_offsize - border_left_w, -border_top_w);
                        this.createTaskAction(viewNode);
                        this.createTaskTitle(viewNode);
                    }
                    if (this.isTaskBottom(viewNode)) {
                        viewNode.taskNode.bottom = this.createTaskNode(viewNode, constants.TASK.FLAG_BOTTOM, viewNode.parent
                            .getWidth() + 2 * x_offsize, bold_size, -x_offsize - border_left_w, height - border_top_w - bold_size);
                        var pre_view = RangeTools.getPrevPara(viewNode);
                        if (pre_view && pre_view.taskNode.bottom) {
                            pre_view.tpNode.removeChild(pre_view.taskNode.bottom);
                            pre_view.taskNode.bottom = null;
                        }
                    }
                }

            }
        },
        taskRender: function(viewNode) {
            this._taskRender(viewNode);
        },
        updateTaskNode: function(viewNode) {
            if (this.getShow()) {
                if (viewNode.model.isTask()) {
                    this.removeTaskNode(viewNode);
                    this.taskRender(viewNode);
                }
            }
        },
        showInfomationMessage: function(fieldsetId, title, content, interval) {},

        showFieldsetTitle: function(fieldsetId, title) {
            var fieldset = this.getTaskFrame(fieldsetId);
            this.updateTaskLegend(fieldset, title);
        },

        updateTaskLegend: function(fieldset, title) {
            return;
            var legend = this.getLegendChild(fieldset);
            // firefox cannot refresh UI when legend's content update, so remove the legend and append it again 
            legend.$.innerHTML = "";
            legend.remove(false);
            legend.$.innerHTML = title;

            legend.setAttribute('contentEditable', 'false');
            legend.setAttribute('unselectable', "on");

            fieldset.append(legend, true);
        },

        showFieldsetMsgDiv: function(fieldsetId, content, interval) {
            var fieldset = this.getTaskFrame(fieldsetId);
            var legend = this.getLegendChild(fieldset);
            var actionDiv = this.getActionChild(fieldset);
            var msgInfoDivArr = query(".concordTaskLlotusWarning", fieldset.$);
            if (msgInfoDivArr[0]) {
                var msgInfoBodyDivArr = query(".concordTaskLotusMessageBody", msgInfoDivArr[0]);
                msgInfoBodyDivArr[0].innerHTML = content;
                domStyle.set(msgInfoDivArr[0], 'display', '');
            } else {
                this.constructMsgInfoDiv(content, actionDiv.$);
            }

            if (interval) {
                window.setTimeout(
                    lang.hitch(this, function() {
                        this.hideInformationMessage(fieldsetId);
                    }),
                    interval
                );
            }
        },

        constructMsgInfoDiv: function(content, container) {
            var parentDiv = domConstruct.create('div', null, container);
            domAttr.set(parentDiv, "contenteditable", "false");
            domAttr.set(parentDiv, "unselectable", "on");

            //add class attr for querying
            domClass.add(parentDiv, 'concordTaskLlotusWarning');
            domAttr.set(parentDiv, 'role', 'status');

            var img = domConstruct.create('img', {
                src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
                alt: 'Information'
            }, parentDiv);
            domClass.add(img, 'concordTaskLotusIcon');
            domClass.add(img, 'yourProductSprite yourProductSprite-msgInfo16');

            var bodyDiv = domConstruct.create('div', null, parentDiv);
            domClass.add(bodyDiv, 'concordTaskLotusMessageBody');

            domAttr.set(bodyDiv, "contenteditable", "false");
            domAttr.set(bodyDiv, "unselectable", "on");

            bodyDiv.innerHTML = content;
        },

        hideInformationMessage: function(fieldsetId) {
            return;
            var fieldset = this.getTaskFrame(fieldsetId);
            //if error happened, won't update border style. so, add set original border style.
            if (fieldset != null) {
                var taskBean = this.getTaskBeanById(fieldsetId);
                if (taskBean != null) {
                    var titleInfo = this.getTitleInfo(taskBean);
                    if (titleInfo != null) {
                        var titleMode = titleInfo.mode;
                        //update border style
                        this.setTaskFieldStyle(fieldset, titleMode);
                        //update title content;
                        var titleContent = titleInfo.title;
                        this.showFieldsetTitle(fieldsetId, titleContent);
                    }
                }
            }
            var msgInfoDivArr = query(".concordTaskLlotusWarning", fieldset.$);
            for (var i = 0; i < msgInfoDivArr.length; i++) {
                domStyle.set(msgInfoDivArr[i], 'display', 'none');
            }
        },

        disableTaskArea: function(fieldsetId, flag) {
            return;
            if (fieldsetId) {
                fieldset = this.getTaskFrame(fieldsetId);
                var actionDiv = query(".concordBtnContainer", fieldset.$)[0];
                var widgets = registry.findWidgets(actionDiv);
                if (widgets.length != 0) {
                    var actionBtn = widgets[0];
                    if (actionBtn != null) {
                        actionBtn.setDisabled(flag);
                    }
                }
                var taskBean = this.getTaskBeanById(fieldsetId);
                if (taskBean)
                    taskBean.setbDisable(flag);
                var selectedTask = this.getSelectedTask();
                if (selectedTask && (selectedTask.getId() == fieldsetId))
                    this.updateCommandState(taskBean);
            }
        },

        showErrorMessage: function(fieldsetId, title, content, interval, bean) {
            if (title != null) {
                this.showFieldsetTitle(fieldsetId, title);
            } else {
                var taskBean = bean;
                if (typeof taskBean == 'undefined' || !taskBean)
                    taskBean = this.getTaskBeanById(fieldsetId);

                var titleInfo = this.getTitleInfo(taskBean);
                var title = titleInfo.title;
                this.showFieldsetTitle(fieldsetId, title);
                this.showFieldsetErrorDiv(fieldsetId, content);
                if (interval) {
                    window.setTimeout(
                        lang.hitch(this, function() {
                            this.hideFieldsetErrorDiv(fieldsetId); //, content);
                        }),
                        interval
                    );
                }

            }
        },

        showFieldsetErrorDiv: function(fieldsetId, content) {
            var fieldset = this.getTaskFrame(fieldsetId);
            var legend = this.getLegendChild(fieldset);
            var actionDiv = this.getActionChild(fieldset);

            var msgErrorDivArr = query(".concordTaskLotusError", fieldset.$);
            if (msgErrorDivArr[0]) {
                var msgErrorBodyDivArr = query(".concordTaskLotusMessageBody", msgErrorDivArr[0]);
                msgErrorBodyDivArr[0].innerHTML = content;
                domStyle.set(msgErrorDivArr[0], 'display', '');
            } else {
                this.constructMsgErrorDiv(content, actionDiv.$);
            }
        },

        hideFieldsetErrorDiv: function(fieldsetId) {
            var fieldset = this.getTaskFrame(fieldsetId);
            var msgErrorDivArr = query(".concordTaskLotusError", fieldset.$);
            for (var i = 0; i < msgErrorDivArr.length; i++) {
                domStyle.set(msgErrorDivArr[i], 'display', 'none');
            }
        },

        constructMsgErrorDiv: function(content, container) {
            var parentDiv = domConstruct.create('div', null, container);
            domAttr.set(parentDiv, "contenteditable", "false");
            domAttr.set(parentDiv, "unselectable", "on");

            domClass.add(parentDiv, 'concordTaskLotusError');
            domAttr.set(parentDiv, 'role', 'status');

            var img = domConstruct.create('img', {
                src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
                alt: 'Error'
            }, parentDiv);
            domClass.add(img, 'concordTaskLotusIcon');
            domClass.add(img, 'yourProductSprite yourProductSprite-msgError16');

            var bodyDiv = domConstruct.create('div', null, parentDiv);

            domAttr.set(bodyDiv, "contenteditable", "false");
            domAttr.set(bodyDiv, "unselectable", "on");

            domClass.add(bodyDiv, 'concordTaskLotusMessageBody');
            bodyDiv.innerHTML = content;
        },

        assignTask: function(action) {
            var context = this.context;
            //need check the task is valid now
            // createTask message may conflict with other 
            /*
            var fieldset = this.editor.document.getById(context.uuid);
            if ( fieldset == null)
            {
                pe.scene.showWarningMessage(this.nls.taskAlreadyRemoved, 10000);
                return;
            }   
            */
            this.inherited(arguments);
        },
        forceUpdateTaskModel: function(taskId) {
            var taskObjs = pe.lotusEditor.document.getAllParaOrTable();
            for (var i = 0; i < taskObjs.length; i++) {
                if (taskObjs[i].isTask() && taskObjs[i].getTaskId() == taskId)
                    taskObjs[i].markDirty();
            }
        },
        updateTaskModel: function(taskId, state) {
            var taskObjs = pe.lotusEditor.document.getAllParaOrTable();
            var msgs = [],
                msg;
            for (var i = 0; i < taskObjs.length; i++) {
                var taskObj = taskObjs[i];
                if (taskObj.getTaskId() == taskId) {
                    if (state == 0)
                        msg = taskObj.setTask("");
                    else if (state == 1)
                        msg = taskObj.setTask(taskId);
                    msgHelper.mergeMsgs(msgs, msg);
                }
            }
            msgCenter.sendMessage(msgs);
            pe.lotusEditor.updateManager.update(true);
        },

        updateAllTaskModel: function() {
            var taskObjs = pe.lotusEditor.document.getAllParaOrTable();
            var msgs = [],
                msg;
            for (var i = 0; i < taskObjs.length; i++) {
                if (taskObjs[i].isTask())
                    taskObjs[i].markDirty();
            }
            pe.lotusEditor.updateManager.update();
        },

        postTaskCreate: function(taskBean, context, info) {
            var msgs = [],
                msg;
            var taskObjs = HelperTools.getSelectedParaOrTable();
            for (var i = 0; i < taskObjs.length; i++) {
                msg = taskObjs[i].setTask(taskBean.getId());
                msgHelper.mergeMsgs(msgs, msg);
            }
            var updateAct = msgCenter.createTaskAct(constants.ACTTYPE.TaskUpdate, taskBean.getId());
            var updateMsg = msgCenter.createMsg(constants.MSGTYPE.Task, [updateAct]);
            updateMsg && msgs.push(updateMsg);
            //  msg.msg.disableRedo = true;
            //  msg.rMsg.disableUndo = true;
            msgCenter.sendMessage(msgs);
            pe.lotusEditor.updateManager.update(true);
            if (pe.scene.session.isSingleMode())
                pe.scene.session.save(true);
            var selectedTask = this.getSelectedTask();
            if (selectedTask && selectedTask.getId()) {
                if (selectedTask.getId() == taskBean.getId()) {
                    this.setTaskSelected(taskBean.getId());
                }
            }
        },

        setCommandState: function(commandList) {
            if (!commandList || commandList.length == 0)
                return;
            for (var i = 0; i < commandList.length; i++) {
                var command = this.editor.getCommand(commandList[i].name);
                command.setState(commandList[i].disableCondition ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_OFF);
            }
        },

        updateCommandState: function(taskBean) {
            if (!this.bSocial) return;
            //var taskBean = editor.getTaskHdl().getSelectedTask();
            var isGetSelectedTask = taskBean ? true : false;
            var canEnableCmds = this.isServiceReady() && this.bTMenusEnabled;
            var isCreateAssignment = canEnableCmds && !isGetSelectedTask;
            var isEditAssignment = false;
            var isReopenAssignmen = false;
            var isReassignAssignment = false;
            var isMarkAssignComplete = false;
            var isWorkPrivate = false;
            var isCancelPrivate = false;
            var isApproveSection = false;
            var isReturnSection = false;
            var isRemoveSectionAssign = false;
            var isAbout = false;

            if (canEnableCmds && isGetSelectedTask) {

                var actions = concord.beans.TaskService.util.getAvailableActions(taskBean, pe.authenticatedUser);
                var actionsLength = actions.length;
                if (actionsLength > 0) {
                    for (var i = 0; i < actionsLength; i++) {

                        switch (actions[i]) {
                            case concord.beans.TaskService.ACTION_EDIT:
                                isEditAssignment = true;
                                break;
                            case concord.beans.TaskService.ACTION_REOPEN:
                                isReopenAssignmen = true;
                                break;
                            case concord.beans.TaskService.ACTION_REASSIGN:
                                isReassignAssignment = true;
                                break;
                            case concord.beans.TaskService.ACTION_WORKDONE:
                                isMarkAssignComplete = true;
                                break;
                            case concord.beans.TaskService.ACTION_PRIVATE:
                                isWorkPrivate = true;
                                break;
                            case concord.beans.TaskService.ACTION_CANCEL_PRIVATE:
                                isCancelPrivate = true;
                                break;
                            case concord.beans.TaskService.ACTION_APPROVE:
                                isApproveSection = true;
                                break;
                            case concord.beans.TaskService.ACTION_REJECT:
                                isReturnSection = true;
                                break;
                            case concord.beans.TaskService.ACTION_REMOVE:
                                isRemoveSectionAssign = true;
                                break;
                            case concord.beans.TaskService.ACTION_ABOUT:
                                isAbout = true;
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            var commandList = [{
                    name: 'assignTask',
                    disableCondition: !isCreateAssignment
                }, {
                    name: 'removeCompletedAssign',
                    disableCondition: !canEnableCmds
                }, {
                    name: 'editAssignment',
                    disableCondition: !isEditAssignment
                }, {
                    name: 'markAssignComplete',
                    disableCondition: !isMarkAssignComplete
                },
                // {name:'workPrivate',disableCondition: !isWorkPrivate},
                // {name:'cancelPrivate',disableCondition: !isCancelPrivate},
                {
                    name: 'approveSection',
                    disableCondition: !isApproveSection
                }, {
                    name: 'returnSection',
                    disableCondition: !isReturnSection
                }, {
                    name: 'removeSectionAssign',
                    disableCondition: !isRemoveSectionAssign
                }, {
                    name: 'reopenAssignment',
                    disableCondition: !isReopenAssignmen
                }, {
                    name: 'reassignAssignment',
                    disableCondition: !isReassignAssignment
                }, {
                    name: 'about',
                    disableCondition: !isAbout
                }
            ];

            this.setCommandState(commandList);
            topic.publish(concord.util.events.taskEvents_eventName_taskCreateEnabled, isCreateAssignment);

        },

        setTaskSelected: function(taskId) {
            if (taskId != this.curTaskId) {
                var taskEvent = null;
                if (taskId) {
                    taskEvent = [{
                        taskId: taskId,
                        selected: true
                    }];
                    concord.util.events.publish(concord.util.events.taskEvents_eventName_taskSelected, taskEvent);
                }

                if (this.curTaskId) {
                    taskEvent = [{
                        taskId: this.curTaskId,
                        selected: false
                    }];
                    concord.util.events.publish(concord.util.events.taskEvents_eventName_taskSelected, taskEvent);
                }
                this.curTaskId = taskId;
                this.updateCommandState(this.getTaskBeanById(taskId));
            }

        },

        ////////////////////////////////TextTaskHandler private function////////////
        updateFragment: function(fragId, fragDoc) {
            var taskList = new Array();
            var sInx = fragDoc.indexOf('<body');
            var eInx = fragDoc.indexOf('</body>');
            sInx = fragDoc.indexOf('>', sInx);
            var content = fragDoc.substring(sInx + 1, eInx);
            var selectedTask = this.getSelectedTask();
            var selection = this.editor.getSelection();
            content = content.replace(/[\r\n]/g, '');
            query('.reference[frag_id=' + fragId + ']', this.editor.document.$).forEach(lang.hitch(this, function(node) {
                var taskId = node.getAttribute('task_id');
                node.innerHTML = content;
                domAttr.set(node, "frag_id", "");
                taskList.push(taskId);
                contentNode = CKEDITOR.dom.node(node);
                if (selectedTask && taskId == selectedTask.getId()) {
                    while (contentNode.getFirst && contentNode.getFirst()) {
                        contentNode = contentNode.getFirst();
                    }
                    TASK.tools.cursor.moveToStart(contentNode, selection);
                }
                if (this.editor.spellchecker && this.editor.spellchecker.isAutoScaytEnabled())
                //setTimeout(dojo.hitch(this, function() {this.editor.spellchecker.checkNodes(node, node)}), 0);
                    this.editor.spellchecker.checkNodes(node, node);
            }));
            return taskList;
        },

        fixTaskBlock: function(task) {
            // before
            var msgs = [];
            var acts = [];
            var node = task.getPrevious();
            if (!node || TASK.tools.node.isTaskContainer(node)) {
                var block = this.createEditBlock();
                block.insertBefore(task);
                var act = SYNCMSG.createInsertBlockElementAct(block);
                acts.push(act);
                //          var blockId = block.getAttribute("id");
                //          cmdList.push(LB_COM.createNodeInsertCmd(blockId))
            }
            var contentContainer = TASK.tools.task.getTaskContentContainer(task);
            if (contentContainer) {
                node = contentContainer.getFirst();
                // inject empty paragraph for special blocks
                if (this.isSpecialEditBlock(node)) {
                    // none content
                    var block = this.createEditBlock();
                    block.insertBefore(node);
                    var act = SYNCMSG.createInsertBlockElementAct(block);
                    acts.push(act);
                    //              var blockId = block.getAttribute("id");
                    //              cmdList.push(LB_COM.createNodeInsertCmd(blockId));
                }
                node = contentContainer.getLast();
                if (this.isSpecialEditBlock(node)) {
                    // none content
                    var block = this.createEditBlock();
                    block.insertAfter(node);
                    var act = SYNCMSG.createInsertBlockElementAct(block);
                    acts.push(act);
                    //          var blockId = block.getAttribute("id");
                    //          cmdList.push(LB_COM.createNodeInsertCmd(blockId));
                }
            }
            // after
            node = task.getNext();
            if (!node || TASK.tools.node.isTaskContainer(node)) {
                var block = this.createEditBlock();
                block.insertAfter(task);
                var act = SYNCMSG.createInsertBlockElementAct(block);
                acts.push(act);
            }
            var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Element, acts);
            msgs.push(msg);
            msgs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, LISTUTIL.fixListInTask(task)));
            msgs && SYNCMSG.sendMessage(msgs);
        },

        createEditBlock: function() {
            var p = new CKEDITOR.dom.element('p', this.editor.document);
            p.setAttribute("id", MSGUTIL.getUUID());
            p.appendHtml("&nbsp;");
            return p;
        },

        // block only contains blocks like table
        isSpecialEditBlock: function(node) {
            if (TASK.tools.dom.is(node, "table"))
                return true;
            else
                return false;
        },

        createLegend: function(fieldset, id) {
            var legend = fieldset.getDocument().createElement("legend");
            legend.setAttribute('id', 'legend_' + id);
            legend.setAttribute('contentEditable', 'false');
            legend.setAttribute('unselectable', "ON");
            legend.setAttribute('aria-live', 'assertive');
            legend.setAttribute('aria-relevant', 'all');
            legend.setAttribute('aria-atomic', 'true');
            legend.innerHTML = "";
            legend.addClass("concordContainer");
            fieldset.append(legend, true);
            return legend;
        },

        getLegendChild: function(fieldset) {
            if (fieldset) {
                var legend = query("legend", fieldset.$)[0];
                if (legend) {
                    return CKEDITOR.dom.node(legend);
                } else {
                    return null;
                }
            } else
                return null;
        },

        getActionChild: function(fieldset) {
            if (fieldset) {
                var actionDiv = query(".concordBtnContainer", fieldset.$)[0];
                if (actionDiv)
                    return CKEDITOR.dom.node(actionDiv);
                else
                    return null;
            } else
                return null;
        },

        createActionArea: function(fieldset, id) {
            var first = this.getLegendChild(fieldset);
            if (first == null || first.getName() != 'legend') { // invalid
                return null;
            } else {
                var legend = first;
                var actionDiv = fieldset.getDocument().createElement("div");
                actionDiv.setAttribute("contentEditable", "false");
                actionDiv.setAttribute("unselectable", "ON");
                //actionDiv.setAttribute("align", "right");
                actionDiv.setAttribute("align", "left");
                actionDiv.setAttribute("id", "action_" + id);
                actionDiv.addClass("concordBtnContainer");
                actionDiv.insertAfter(legend);
                return actionDiv;
            }
        },
        _initActionMenu: function(taskId, actionMenu) {
            var actions = null;
            var taskBean = this.getTaskBeanById(taskId);
            if (taskBean != null)
                actions = concord.beans.TaskService.util.getAvailableActions(taskBean, pe.authenticatedUser);
            if (actions != null) {
                array.forEach(actions, lang.hitch(this, function(actionType) {
                    var menuItem = null;
                    if (actionType == "") {
                        menuItem = new MenuSeparator;
                    } else {
                        var menuLabel = '';
                        var menuId = '';
                        if (actionType == concord.beans.TaskService.ACTION_EDIT) {
                            menuLabel = this.nls.actionBtnEdit;
                            //  menuId = 'D_p_'+taskBean.getId()+'_EditAssignment';
                        } else if (actionType == concord.beans.TaskService.ACTION_REMOVE) {
                            menuLabel = this.nls.actionBtnRemove;
                            //  menuId = 'D_p_'+taskBean.getId()+'_RemoveAssignment';
                        } else if (actionType == concord.beans.TaskService.ACTION_WORKDONE) {
                            menuLabel = this.nls.actionBtnMarkComplete;
                            //  menuId = 'D_p_'+taskBean.getId()+'_MarkComplete';
                        } else if (actionType == concord.beans.TaskService.ACTION_PRIVATE) {
                            menuLabel = this.nls.actionBtnWorkPrivately;
                            //  menuId = 'D_p_'+taskBean.getId()+'_WorkPrivately';
                        } else if (actionType == concord.beans.TaskService.ACTION_CANCEL_PRIVATE) {
                            menuLabel = this.nls.actionBtnCancelPrivate;
                            //  menuId = 'D_p_'+taskBean.getId()+'_CancelPrivateWork';
                        } else if (actionType == concord.beans.TaskService.ACTION_GOTO_PRIVATE) {
                            menuLabel = this.nls.actionBtnGotoPrivate;
                            //  menuId = 'D_p_'+taskBean.getId()+'_GoToPrivateDocument';
                        } else if (actionType == concord.beans.TaskService.ACTION_APPROVE) {
                            menuLabel = this.nls.actionBtnApprove;
                            //  menuId = 'D_p_'+taskBean.getId()+'_ApproveThisSection';
                        } else if (actionType == concord.beans.TaskService.ACTION_REJECT) {
                            menuLabel = this.nls.actionBtnRework;
                            //  menuId = 'D_p_'+taskBean.getId()+'_ReworkRequired';
                        } else if (actionType == concord.beans.TaskService.ACTION_REOPEN) {
                            menuLabel = this.nls.actionBtnReopen;
                            //  menuId = 'D_p_'+taskBean.getId()+'_ReopenAssignment';
                        } else if (actionType == concord.beans.TaskService.ACTION_REASSIGN) {
                            menuLabel = this.nls.actionBtnReassign;
                            //  menuId = 'D_p_'+taskBean.getId()+'_ReassignSection';
                        } else if (actionType == concord.beans.TaskService.ACTION_ABOUT) {
                            menuLabel = this.nls.actionBtnAbout;
                            //  menuId = 'D_p_'+taskBean.getId()+'_AboutThisSection';
                        }
                        menuItem = new MenuItem({
                            label: menuLabel,
                            //  id : menuId,
                            onClick: function(evt) {
                                if (pe.lotusEditor.getTaskHdl())
                                    pe.lotusEditor.getTaskHdl().doAction(taskBean, actionType);
                            }
                        });
                    }
                    actionMenu.addChild(menuItem);
                }));
            }

        },
        destroyActionButton: function(taskId) {
            var actionBtn = registry.byId(taskId + '_Action');
            if (actionBtn)
                actionBtn.destroyRecursive();
        },
        createActionButton: function(taskId, disable) {
            var actionMenu = new Menu();
            if (typeof disable == 'undefined')
                disable = false;
            domClass.add(actionMenu.domNode, "lotusActionMenu");
            this._initActionMenu(taskId, actionMenu);
            var actionBtn = new DropDownButton({
                //  label: this.nls.actions,
                disabled: disable,
                style: this.bSocial ? "float: right;" : "display: none;",
                id: taskId + '_Action',
                dropDown: actionMenu
            });
            // workaround
            // dojo._abs always considers the node is a child of dojo.window
            // in CKEditor, editor.window.$ is not dojo.window
            // here we have to move the dropdown menu positon according to the offset of editor.window
            actionBtn.openDropDown = function() {
                if (actionBtn.dropDown && actionBtn.dropDown.getChildren().length == 0) {
                    if (pe.lotusEditor.getTaskHdl())
                        pe.lotusEditor.getTaskHdl()._initActionMenu(taskId, actionMenu);
                }
                if (actionBtn.dropDown) {
                    var retval = DropDownButton.prototype.openDropDown.apply(this, arguments);
                    var menuFrame = this.dropDown.domNode.parentNode;
                    var x = domStyle.get(menuFrame, "left");
                    var y = domStyle.get(menuFrame, "top");
                    //adjust the position
                    domStyle.set(menuFrame, "left", x + dom.byId('editorFrame').offsetLeft + "px");
                    domStyle.set(menuFrame, "top", y + dom.byId("editorFrame").offsetTop + "px");
                    return retval;
                };
            };

            var _oldOnDropDownMouse = actionBtn._onDropDownMouseDown;
            // dijit._HasDropDown connect mouseup event on dojo.doc in _onDropDownMouse
            // Same as above issue, dojo.doc is not editor document
            // Here we disconnect the original event, and connect to the correct document.
            actionBtn._onDropDownMouseDown = function(e) {
                _oldOnDropDownMouse.apply(this, [e]);
                if (this._docHandler)
                    this.disconnect(this._docHandler);
                var doc = concord.util.browser.getEditAreaDocument();
                this._docHandler = this.connect(doc, "onmouseup", "_onDropDownMouseUp");
            };

            return actionBtn;
        },

        setTaskFieldStyle: function(fieldset, mode) {
            if (has("ff") && domClass.contains(windowModule.body(), "dijit_a11y"))
                return;
            for (var index in this.FIELDSET_CLASS) {
                if (mode == index) {
                    fieldset.addClass(this.FIELDSET_CLASS[index]);
                } else {
                    fieldset.removeClass(this.FIELDSET_CLASS[index]);
                }
            }
        },
        //////////////////////////////////Abstract function//////////////////////
        initStore: function() {
            if (typeof this.editor.sections == 'undefined')
                this.editor.sections = {};
            this.store = new concord.task.TaskStoreProxy(this.editor.sections);
        },

        getShow: function() {
            return this.enable && this.bShow;
        },

        preLoadTask: function() {
            this.enable = false;
            var that = this;
            var loadFinished = function() {
                that.enable = true;
                that.updateAllTaskModel();
            };
            topic.subscribe(concord.util.events.taskEvents_eventName_taskLoaded, lang.hitch(this, loadFinished));
        },

        applyCachedTasks: function() {
            console.log("applyCachedTasks");
            var document = this.editor.document.$;
            var bSocialWarning = true;
            query('fieldset.concordNode', document).forEach(lang.hitch(this, function(node) {
                var id = node.getAttribute("id");
                var taskbean = new CachedTask();
                var taskObj = this.getCachedTaskObj(id);
                taskObj.id = id;

                lang.mixin(taskbean, taskObj);
                this.updateTaskArea(id, taskbean);

                if (this.bSocial) {
                    this.showErrorMessage(id, null, this.nls.cannotLoadAssignment, 600000, taskbean);
                } else {
                    if (bSocialWarning) {
                        //                  pe.scene.showWarningMessage(this.nls.cannotSupportSocialEdit, 30000);                   
                    }
                    bSocialWarning = false;
                }
            }));
        },

        clearCachedTasks: function() {
            console.log("clearCachedTasks");
            var document = this.editor.document.$;
            query('fieldset.concordNode', document).forEach(lang.hitch(this, function(node) {
                var id = node.getAttribute("id");
                if (id)
                    this.removeTask(id);
            }));
        },

        clearTasks: function() {
            if (!this.bSocial) {
                if (this.getLoadStatus() < 0) {
                    //remove cached tasks within document
                    this.clearCachedTasks();
                } else {
                    this.deleteTasks(null);
                }
            }
        },
        updateTaskArea: function(id, taskBean) {

        },
        parseTasks: function() {
            console.log("parseTasks");
            return;
            if (this.masterDoc && this.masterTask) {
                // for a private document, disable insert header and footer
                pe.headerMenuItem.setDisabled(true);
                pe.footerMenuItem.setDisabled(true);

                this.editor.fire('updateWorkPrivateCmd', this);
            }

            var document = this.editor.document.$;
            var selection = this.editor.getSelection();
            query('fieldset.concordNode', document).forEach(lang.hitch(this, function(node) {
                var id = node.getAttribute("id");
                var taskBean = this.getTaskBeanById(id);
                if (taskBean == null) {
                    // wait 5 second to make sure this is a single mode or co-edit mode
                    setTimeout(lang.hitch(this, function(taskId) {
                        console.log("section " + taskId + " is removed");
                        if (pe.scene.session.isSingleMode())
                            this.removeTask(taskId);
                    }, id), 5000);
                } else {
                    this.updateSection(taskBean, {
                        area: node
                    });
                    if (this.bSocial) {
                        var docid = taskBean.getDocid();
                        var taskDamaged = (docid == 'undefined' || docid == null);
                        var valid = this.checkTask(taskBean);
                        if (valid) {
                            if (!taskDamaged) {
                                this.updateTaskArea(id);
                                this.checkAccessError(taskBean, true);
                            }
                        } else {
                            taskBean.setbInvalid(true);
                            this.updateTaskArea(taskBean.getId());
                            this.showErrorMessage(taskBean.getId(), null, this.nls.notValidAssignment);
                        }
                    } else {
                        this.updateTaskArea(taskBean.getId()); //just update title information
                    }
                }
            }));
            this.removeEmptyDocidTasks();
        },

        removeEmptyDocidTasks: function() {
            var sections = this.store.getAllSections();
            if (!sections) return;

            for (var i in sections) {
                var section = sections[i];
                var taskBean = section.bean;
                if (taskBean && !taskBean.getDocid()) {
                    var info = section.info;
                    if (info == null || typeof info.area == 'undefined' || info.area == null) {
                        this.deleteSection(taskBean.getId());
                    }
                }
            }
        },

        isTaskExisted: function(taskId) {
            if (!this.store) {
                return false;
            }
            var section = this.store.getSection(taskId);
            if (section) {
                var info = section.info;
                //  if(info == null || typeof info.area == 'undefined' || info.area == null ){
                //      return false;
                //  }
                return true;
            }
            return false;
        },

        showAllTasks: function() {
            var document = this.editor.document.$;
            query('fieldset.concordNode', document).forEach(lang.hitch(this, function(node) {
                var task = TASK.tools.node.getTaskContainer(CKEDITOR.dom.node(node));
                this.showTask(task);
            }));

        },

        hideAllTasks: function() {
            var document = this.editor.document.$;
            query('fieldset.concordNode', document).forEach(lang.hitch(this, function(node) {
                var task = TASK.tools.node.getTaskContainer(CKEDITOR.dom.node(node));
                this.hideTask(task);
            }));

        },

        cancelAssignment: function() {
            var uuid = this.context.uuid;
            this.removeTask(uuid);
            this.context = {};
        },

        changeMode: function(typeId) {
            return;
            // if mode is null, then no style is changed
            if (typeId == "delegationsection") {
                this.setTaskFieldStyle(this.context.area, this.WRITE_MODE);
            } else if (typeId == "reviewsection") {
                this.setTaskFieldStyle(this.context.area, this.REVIEW_MODE);
            }
        },

        getFragId: function(taskId) {
            var fieldset = this.getTaskFrame(taskId);
            var fragId = null;
            if (fieldset != null) {
                query('.reference', fieldset.$).forEach(function(node) {
                    fragId = node.getAttribute('frag_id');
                });
            }
            return fragId;
        },

        getCachedTaskObj: function(taskId) {
            var fieldset = this.getTaskFrame(taskId);
            var taskObj = {};
            if (fieldset != null) {
                query('.reference', fieldset.$).forEach(function(node) {
                    taskObj.title = node.getAttribute('c_title') == null ? "" : node.getAttribute('c_title');
                    taskObj.content = node.getAttribute('c_content') == null ? "" : node.getAttribute('c_content');
                    taskObj.author = node.getAttribute('c_author') == null ? "" : node.getAttribute('c_author');
                    taskObj.owner = node.getAttribute('c_owner') == null ? "" : node.getAttribute('c_owner');
                    taskObj.state = node.getAttribute('c_state') == null ? "" : node.getAttribute('c_state');
                    taskObj.assignee = node.getAttribute('c_assignee') == null ? "" : node.getAttribute('c_assignee');
                    taskObj.reviewer = node.getAttribute('c_reviewer') == null ? "" : node.getAttribute('c_reviewer');
                    taskObj.activity = node.getAttribute('c_activity') == null ? "" : node.getAttribute('c_activity');
                    taskObj.duedate = node.getAttribute('c_duedate') == null ? "" : node.getAttribute('c_duedate');
                    taskObj.createDate = node.getAttribute('c_createDate') == null ? "" : node.getAttribute('c_createDate');
                    //taskObj.fragid =  node.getAttribute('frag_id') == null ? "" : node.getAttribute('frag_id');
                });
            }
            return taskObj;
        },
        /*
         * Set cached task into attributes of reference node in document 
         */
        setCachedTaskObj: function(taskDiv, taskBean) {
            if (!taskDiv || !taskBean) return;
            taskDiv.setAttribute("c_title", taskBean.getTitle() == null ? "" : taskBean.getTitle());
            taskDiv.setAttribute("c_content", taskBean.getContent() == null ? "" : taskBean.getContent());
            taskDiv.setAttribute("c_author", taskBean.getAuthor() == null ? "" : taskBean.getAuthor());
            taskDiv.setAttribute("c_owner", taskBean.getOwner() == null ? "" : taskBean.getOwner());
            taskDiv.setAttribute("c_state", taskBean.getState() == null ? "" : taskBean.getState());
            taskDiv.setAttribute("c_assignee", taskBean.getAssignee() == null ? "" : taskBean.getAssignee());
            taskDiv.setAttribute("c_reviewer", taskBean.getReviewer() == null ? "" : taskBean.getReviewer());
            taskDiv.setAttribute("c_activity", taskBean.getActivity() == null ? "" : taskBean.getActivity());
            taskDiv.setAttribute("c_duedate", taskBean.getDuedate() == null ? this.getCachedTaskObj(taskBean.getId()).duedate : this.parseDateToTime(taskBean.getDuedate()));
            taskDiv.setAttribute("c_createDate", taskBean.getCreateDate() == null ? this.getCachedTaskObj(taskBean.getId()).createDate : this.parseDateToTime(taskBean.getCreateDate()));
            //taskDiv.setAttribute("frag_id", taskBean.getFragid() == null ? "" : taskBean.getFragid());                     
        },

        createTaskArea: function(range, nodeId) {
            var target = range.target;
            var id = null;
            var index = range.index;
            var length = range.offset;
            if (lang.isString(nodeId))
                id = nodeId;
            else if (lang.isObject(nodeId))
                id = nodeId.taskId ? nodeId.taskId : nodeId.uuid;

            var editorDoc = this.editor.document;
            var parent = editorDoc.getById(target);
            if (parent.getName() == "fieldset")
                return;

            var fieldset = editorDoc.createElement('fieldset');
            fieldset.setAttribute("id", id);
            fieldset.addClass("concordNode");
            fieldset.setAttribute("contentEditable", "false");

            var taskStartDiv = editorDoc.createElement('div');
            taskStartDiv.setAttribute("id", "start_" + id);
            //taskStartDiv.setAttribute("task_id", taskId);
            taskStartDiv.setAttribute("contentEditable", "false");
            taskStartDiv.setAttribute("unselectable", "ON");
            taskStartDiv.addClass('concord_range_start hidden lock');
            taskStartDiv.setStyle("display", "none");

            var taskEndDiv = editorDoc.createElement('div');
            taskEndDiv.setAttribute("id", "end_" + id);
            //taskEndDiv.setAttribute("task_id", taskId);
            taskEndDiv.setAttribute("contentEditable", "false");
            taskEndDiv.setAttribute("unselectable", "ON");
            taskEndDiv.addClass('concord_range_end hidden lock');
            taskEndDiv.setStyle("display", "none");


            //add a div as container of all selected contents
            var taskDiv = editorDoc.createElement('div');
            //taskDiv.setAttribute("task_id", taskId);
            taskDiv.setAttribute("frag_id", "");
            taskDiv.setAttribute("id", "reference_" + id);
            taskDiv.addClass('reference');
            taskDiv.setAttribute("contentEditable", "true");

            //#2585
            //The default body width is 615px, and the default div under fieldset width is 581px.
            //If the body width is redefined, so should the div do.
            //#2298
            //Some section (e.g. table) may has negtive margin style. So create corresponding padding style for div element.
            //If the width is larger than default, modify the width style also.
            var body = editorDoc.getBody();
            var sections = range.sections;
            if (sections && sections.length) {
                var width = CKEDITOR.tools.toCmValue(body.getComputedStyle('width')) - CKEDITOR.tools.toCmValue('34px'); //34px is computed by default design, 34 = 615 - 581.
                var left = 0;
                var right = 0;
                var top = 0;
                var bottom = 0;

                for (var i = 0; i < sections.length; i++) {
                    var temp;
                    temp = CKEDITOR.tools.toCmValue(sections[i].getComputedStyle('margin-left'));
                    (temp < left) && (left = temp);
                    temp = CKEDITOR.tools.toCmValue(sections[i].getComputedStyle('margin-right'));
                    (temp < right) && (right = temp);
                    temp = CKEDITOR.tools.toCmValue(sections[i].getComputedStyle('margin-top'));
                    (temp < top) && (top = temp);
                    temp = CKEDITOR.tools.toCmValue(sections[i].getComputedStyle('margin-bottom'));
                    (temp < bottom) && (bottom = temp);
                }
                taskDiv.setStyle('width', width + 'cm');

                //If sections contain negtive margin style, create padding style for div element.
                if (left < 0)
                    taskDiv.setStyle('padding-left', (-left) + 'cm');
                if (right < 0)
                    taskDiv.setStyle('padding-right', (-right) + 'cm');
                if (top < 0)
                    taskDiv.setStyle('padding-top', (-top) + 'cm');
                if (bottom < 0)
                    taskDiv.setStyle('padding-bottom', (-bottom) + 'cm');
            }

            this.createLegend(fieldset, id);
            this.createActionArea(fieldset, id);


            var start = MSGUTIL.getChildNode(parent, parseInt(index));
            fieldset.insertBefore(start);

            for (var i = 0; i < length; i++) {
                var next = start.getNext();
                start.move(taskDiv);
                start = next;
            }

            fieldset.append(taskStartDiv);
            fieldset.append(taskDiv);
            fieldset.append(taskEndDiv);
            return fieldset;
        },

        updateNewTaskArea: function(context, taskBean) {
            return {
                area: {}
            };
        },

        deleteTaskArea: function(id) {
            var editorDoc = this.editor.document;
            var fieldset = null;
            if (id != null)
                fieldset = this.getTaskFrame(id);
            if (fieldset == null)
                return;
            var actionDiv = query(".concordBtnContainer", fieldset.$)[0];
            var widgets = registry.findWidgets(actionDiv);
            if (widgets.length != 0) {
                var actionBtn = widgets[0];
                if (((actionBtn == null) || (typeof actionBtn == 'undefined')) || (actionBtn.get("task_id") != fieldset.getId())) {
                    actionDiv.innerHTML = '';
                } else {
                    actionBtn.destroyRecursive();
                    actionDiv.innerHTML = '';
                }
            }

            var reference = query(".reference", fieldset.$)[0];
            if (reference) {
                var node = CKEDITOR.dom.node(reference).getFirst();
                while (node) {
                    var t = node.getNext();
                    node.insertBefore(fieldset);
                    node = t;
                }
            }
            //fieldset.remove();
            domConstruct.destroy(fieldset.$);
        },

        enableTaskCmds: function(bEnable) {
            var selectedTask = null;
            this.bTMenusEnabled = bEnable;
            if (bEnable && this.bServiceReady) {
                // if service is not ready, no need to get selected task
                selectedTask = this.getTaskBeanById(HelperTools.getSelectedTaskId());
            }
            this.updateCommandState(selectedTask);
        },

        showTask: function(taskFrame) {
            TASK.tools.task.show(taskFrame);
        },

        hideTask: function(taskFrame) {
            TASK.tools.task.hide(taskFrame);
        },

        preTaskCreate: function() {
            var context = {};
            context.title = null;
            if (!HelperTools.canTaskCreate()) {
                window.pe.scene.showWarningMessage(this.nls.assignmentAlreadyExist, 10000);
                return;
            }
            return context;
        },

        taskCreateFailed: function(context) {
            if (this.isSync) {
                this.removeTask(context.area.getId());
            } else {
                window.setTimeout(
                    lang.hitch(this, function() {
                        this.removeTask(context.area.getId());
                    }),
                    5000
                );
            }
        },

        postSubmitTask: function(taskBean, submitted) {
            //      var body = this.editor.document.getBody();
            //      var doc_id = taskBean.getDocid();       
            //      dojo.removeAttr(body, "doc_id");    

            var opener = window.opener;
            var bOpenMasterDoc = false;
            var a = this.masterDoc.split("/", 2);
            var uri = concord.util.uri.getDocPageUriById(this.masterDoc);

            if (opener) {
                if (opener.closed) {
                    // open master document
                    bOpenMasterDoc = true;
                } else {
                    // check if opener is master doc
                    var openerUri = opener.location.pathname;
                    if (openerUri != uri)
                        bOpenMasterDoc = true;

                }
            } else
                bOpenMasterDoc = true;

            if (bOpenMasterDoc) {
                var docUri = a[1];
                var name = docUri.replace(/[-\s.@]/g, '_');
                window.open(uri, name);
            }

            if (this.masterDoc && this.masterTask) {
                pe.headerMenuItem.setDisabled(false);
                pe.footerMenuItem.setDisabled(false);

                this.editor.fire('updateWorkPrivateCmd', this);
            }
            if (submitted)
                window.close();
            else
                pe.scene.showErrorMessage(this.nls.cannotDeleteDraft, 10000);

        },

        getSelectedTask: function(selection) {
            return this.getTaskBeanById(HelperTools.getSelectedTaskId());
            try {
                if (!selection) {
                    selection = this.editor.getSelection();
                } else if (selection.getSelection) {
                    //to avoid defect, in case selection is editor.
                    selection = selection.getSelection();
                }

                var taskContainer = null;
                if (selection) {
                    var ranges = selection.getRanges();
                    if (ranges != null) {
                        var range = ranges[0];
                        var boundary = TASK.tools.range.getBoundary(range);
                        var startNode = boundary.startNode;
                        var endNode = boundary.endNode;
                        taskContainer = TASK.tools.node.getTaskContainer(startNode);

                        if (taskContainer == null) {
                            if (!range.collapsed) {
                                taskContainer = TASK.tools.node.getTaskContainer(endNode);
                                if (taskContainer == null) {
                                    var tasks = TASK.tools.range.getContainedTasks(startNode, endNode);
                                    if ((tasks != null) && (tasks.length != 0)) {
                                        taskContainer = tasks[0];
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // IE, if focus is on sidebar, editor.getSelection return null
                    // So use backup selection in editor
                    var selectionPath = this.editor._.selectionPreviousPath;
                    var elements = selectionPath.elements;
                    var element = elements[0];
                    taskContainer = TASK.tools.node.getTaskContainer(element);
                }

                if (taskContainer != null) {
                    var taskId = taskContainer.getAttribute("id");
                    return this.getTaskBeanById(taskId);
                } else
                    return null;
            } catch (e) {
                console.log('getSelectedTask' + e);
                return null;
            }
        },

        doAction: function(taskBean, actionType) {
            var taskBean = this.store.getTaskBean(taskBean.getId());
            if (taskBean == null) return;
            var task = this.getTaskFrame(taskBean.getId());
            if (task) {
                task.getWindow().focus();
            }
            this.inherited(arguments);
        },

        selectTask: function(taskId) {
            if (taskId) {
                var task = this.getTaskFrame(taskId);
                if (!task) return;

                var elementPosition = task.getDocumentPosition().y;
                var scrollPosition = task.getWindow().getScrollPosition().y;
                var winHeight = task.getWindow().getViewPaneSize().height;
                var elementHeight = task.$.offsetHeight || 0;
                task.getWindow().focus();
                if ((elementPosition <= scrollPosition) || (elementPosition + elementHeight - scrollPosition > winHeight)) {
                    var offset = elementPosition - scrollPosition;
                    task.getWindow().$.scrollBy(0, offset);
                }
                var reference = TASK.tools.task.getTaskContentContainer(task);
                if (reference) {
                    // element.focus doesn't work in FF, so use range.select here
                    var range = new CKEDITOR.dom.range(this.editor.document);
                    range.setStart(reference.getFirst(), 0);
                    range.collapse();
                    range.select();
                }
                // for this case, no selection change event fired
                // I have to make the selected task updated
                this.setTaskSelected(taskId);
            }
        },

        onDialogShow: function(dlg) {
            this.currentDlg = dlg;
        },

        onDialogHide: function() {
            this.currentDlg = null;
        },

        onResetData: function() {
            if (this.currentDlg) {
                if (this.currentDlg._destroy)
                    this.currentDlg._destroy();
                else
                    this.currentDlg.hide();
            }

            var sections = this.store ? this.store.sections : null;
            if (sections) {
                for (var i in sections) {
                    var section = sections[i];
                    if (section && section.info && section.info.area) {
                        var widgets = registry.findWidgets(section.info.area);
                        if (widgets.length != 0) {
                            var actionBtn = widgets[0];
                            try {
                                console.log('destroy actionBtn for ' + actionBtn.get('id'));
                                actionBtn.destroyRecursive(true); // don't destroy the domNode
                                actionBtn.destroy(true);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
            }

        },

        getTaskFrame: function(taskId) {
            return null;
        },

        publishInsertTaskMsg: function(taskId, info) {
            throw new Error("publishInsertTaskMsg not implememented");
        },

        publishUpdateTaskMsg: function(taskId, cachedTask) {
            if (taskId != null)
                this.updateTaskModel(taskId, 1);
            var msgs = [];
            var updateAct = msgCenter.createTaskAct(constants.ACTTYPE.TaskUpdate, taskId);
            var updateMsg = msgCenter.createMsg(constants.MSGTYPE.Task, [updateAct]);
            updateMsg && msgs.push(updateMsg);
            //  msg.msg.disableRedo = true;
            //  msg.rMsg.disableUndo = true;
            msgCenter.sendMessage(msgs);
            console.log("Sending update task message");
        },

        publishDeleteTaskMsg: function(taskId) {
            if (taskId == null)
                return;
            this.updateTaskModel(taskId, 0);
            var msgs = [];
            var updateAct = msgCenter.createTaskAct(constants.ACTTYPE.TaskDelete, taskBean.getId());
            var updateMsg = msgCenter.createMsg(constants.MSGTYPE.Task, [updateAct]);
            updateMsg && msgs.push(updateMsg);
            //  msg.msg.disableRedo = true;
            //  msg.rMsg.disableUndo = true;
            msgCenter.sendMessage(msgs);
        },

        // =0, means task1 is the same as task2
        // >0, means task1 is after task2
        // <0, means task1 is before task2
        compare: function(task1, task2) {
            var taskId1 = task1.getId();
            var taskId2 = task2.getId();

            if (taskId1 == taskId2)
                return 0;
            if (taskId1 == null)
                return 1;
            if (taskId2 == null)
                return -1;
            var taskArea1 = this.getTaskFrame(taskId1);
            var taskArea2 = this.getTaskFrame(taskId2);

            if ((taskArea1 == null) && (taskArea2 == null))
                return 0;

            if (taskArea1 == null)
                return 1;

            if (taskArea2 == null)
                return -1;

            if (taskArea1.getPosition(taskArea2) & CKEDITOR.POSITION_FOLLOWING) {
                return 1;
            } else
                return -1;

        },

        processMessage: function(act) {
            switch (act.t) {
                case constants.ACTTYPE.TaskDelete:
                    var taskId = act.tsk;
                    var selectedTask = this.getSelectedTask();
                    if (selectedTask && selectedTask.getId() == taskId) {
                        this.setTaskSelected(null);
                    }
                    this.updateTaskModel(act.tsk, 0);
                    this.deleteSection(data.tsk);
                    break;
                case constants.ACTTYPE.TaskUpdate:
                    if (act.tsk != null) {
                        // try to get taskbean from server when we receive update message, and then save it to store.
                        var taskBean = concord.beans.TaskService.getTask(this.docBean, act.tsk);
                        if (taskBean != null) {
                            var bAdd = false;
                            console.log("Receive update task message and get task bean, title: " + taskBean.getTitle());
                            this.store.startBatchUpdate();
                            if (this.store.getTaskBean(act.tsk) == null) {
                                bAdd = true;
                                this.addSection(taskBean, null);
                            } else {
                                this.updateSection(taskBean, null);
                            }
                            //
                            this.updateTaskModel(act.tsk, 1);
                            if (bAdd)
                                this.store.endBatchUpdate(concord.util.events.taskEvents_eventName_taskAdded, [taskBean]);
                            else
                                this.store.endBatchUpdate(concord.util.events.taskEvents_eventName_taskUpdated, [taskBean]);
                            if (taskBean == this.getSelectedTask()) {
                                this.setTaskSelected(taskBean.getId());
                            }
                            if (taskBean.getAssignee()) {
                                this.refreshEditorIfNeeded(taskBean.getAssignee());
                            }
                            if (taskBean.getReviewer()) {
                                this.refreshEditorIfNeeded(taskBean.getReviewer());
                            }
                        } else {
                            console.log("Error: cannot get taskbean from activity server.");
                        }
                    }
                    break;
                default:
                    break;
            }
            return;
        }
    });



    return TaskHandler;
});
