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

dojo.provide("concord.widgets.taskHistoryDlg");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("concord.beans.TaskService");
dojo.require("concord.beans.TaskAction");
dojo.require("concord.widgets.concordDialog");

dojo.require("dojo.date");   
dojo.require("dojox.date.buddhist.Date");       
dojo.require("dojo.date.locale"); 
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets", "taskHistoryDlg");

dojo.declare("concord.widgets.taskHistoryDlg", [concord.widgets.concordDialog], {
    _contentDiv: null,
    RECENT_ACTIVITY: null,
    MORE_LINK: null,
    
    constructor: function(editor, title, okLabel, visible, params){
    },
    _setNLSStr: function(){
        this.nls = dojo.i18n.getLocalization("concord.widgets", "taskHistoryDlg");
        if (this.nls) {
            this.RECENT_ACTIVITY = this.nls.RECENT_ACTIVITY;
            this.MORE_LINK = this.nls.MORE_LINK;
        }
    },
    
	setDialogID: function() {
		this.dialogId = "C_d_AboutSectionDialog";
	},	
	
    createContent: function(contentDiv){
        this._setNLSStr();
        this._contentDiv = dojo.create('div', null, contentDiv);
        this._contentDiv.id = "taskHisitoryId_" + (new Date()).getTime();
        this.describedInfoId = this._contentDiv.id ;        
    },
    
    renderContent: function(taskBean){
		var bidiDir = (BidiUtils.isBidiOn()) ? BidiUtils.getTextDir() : "";
        var layoutTable = dojo.create('table', {
            width: '400px',
            align: 'center',
            role: 'presentation'
        }, this._contentDiv);
        var layoutTbody = dojo.create('tbody', null, layoutTable);
        
        //create title
        var row = dojo.create('tr', null, layoutTbody);
        var cell = dojo.create('td', {
            width: '100%'
        }, row);
        var label = this.createLabel(taskBean.getTitle(), cell);
        dojo.addClass(label, 'dlg_task_history_title');
        if (bidiDir != "")
        	if (bidiDir != "contextual")
        		dojo.attr(label, "dir", bidiDir);
        	else
        		dojo.attr(label, "dir", BidiUtils.calculateDirForContextual(taskBean.getTitle()));
        //create duedate
        if(taskBean.getDuedate() != null){
            row = dojo.create('tr', null, layoutTbody);
            cell = dojo.create('td', {
                width: '100%'
            }, row);        	
            var duedate = this.parseDate(taskBean.getDuedate());
            if (bidiDir != "")
            	duedate = BidiUtils.addEmbeddingUCC(duedate);
            var content = dojo.string.substitute(this.nls.DUE_DATE, [duedate]);
            label = this.createLabel(content, cell);   
            dojo.addClass(label, 'dlg_task_history_date');  
            //create blank space 	
            dojo.addClass(label, 'dlg_task_history_emptyline');  
        }
           
        //create assignee
        if (taskBean.getAssignee() != null) {
        	var userName = this.getUserFullName(taskBean.getAssignee());
        	if (bidiDir != "")
        		userName = BidiUtils.addEmbeddingUCC(userName);
            var assigneeLiteral = dojo.string.substitute(this.nls.ASSIGNEE_LITERAL, [userName]);
            row = dojo.create('tr', null, layoutTbody);
            cell = dojo.create('td', {
                width: '100%'
            }, row);
            label = this.createLabel(assigneeLiteral, cell);
        }
        //create reviewer
        if (taskBean.getReviewer() != null) {
        	userName = this.getUserFullName(taskBean.getReviewer());
        	if (bidiDir != "")
        		userName = BidiUtils.addEmbeddingUCC(userName);
            var reviewerLiteral = dojo.string.substitute(this.nls.REVIEW_LITERAL, [userName]);
            row = dojo.create('tr', null, layoutTbody);
            cell = dojo.create('td', {
                width: '100%'
            }, row);
            label = this.createLabel(reviewerLiteral, cell);
        }
        //create author
        if (taskBean.getAuthor() != null) {
            row = dojo.create('tr', null, layoutTbody);
            cell = dojo.create('td', {
                width: '100%'
            }, row);
            var ownerLiteral = "";
            userName = this.getUserFullName(taskBean.getAuthor())
            if (bidiDir != "")
        		userName = BidiUtils.addEmbeddingUCC(userName);
            if (taskBean.getCreateDate() != null) {
                var createDate = this.parseDate(taskBean.getCreateDate());
                if (bidiDir != "")
                	createDate = BidiUtils.addEmbeddingUCC(createDate);
                ownerLiteral = dojo.string.substitute(this.nls.OWNER_LITERAL, [userName, createDate]);
            }
            else {
                ownerLiteral = dojo.string.substitute(this.nls.CREATE_TIME_LITERAL, [userName]);
            }
            label = this.createLabel(ownerLiteral, cell);            
        }

        //create content
        //if (taskBean.getContent()) {
            row = dojo.create('tr', null, layoutTbody);
            cell = dojo.create('td', {
                width: '100%'
            }, row);
            if(taskBean.getContent()){
            	cell.innerHTML = (bidiDir != "") ? BidiUtils.generateSpanWithDir (taskBean.getContent()) : taskBean.getContent();
            }
            else
            	cell.innerHTML = "";
            //label = this.createLabel(taskBean.getContent(), cell);
            dojo.addClass(cell, 'dlg_task_content');
            //create blank space 
            dojo.addClass(cell, 'dlg_task_content_space');
        //}
        //separator
        var footerDiv = dojo.create('div', null, this._contentDiv);
        dojo.addClass(footerDiv, "dijitDialogPaneActionBar");
        //create recent activities
        var recentActivity = dojo.create('div', null, this._contentDiv);
        label = this.createLabel(this.RECENT_ACTIVITY, recentActivity);
        dojo.addClass(label, 'dlg_task_history_title');
        //create blank space 	
        dojo.addClass(recentActivity, 'dlg_task_history_emptyline');  
        
        var queryResult = concord.beans.TaskService.getTaskHistory(taskBean.getDocid(), taskBean.getId());
        if (queryResult) {
            var rootDiv = dojo.create('div', null, this._contentDiv);
            dojo.addClass(rootDiv, 'dlg_task_history_panel');
            
            var historyDiv, secDiv, imgDiv, spanDiv;
            
            for (var i = 0; i < queryResult.length; i++) {               
                historyDiv = dojo.create('div', {
                    width: '100%'
                }, rootDiv);
                
                secDiv = document.createElement('div');
                historyDiv.appendChild(secDiv);
                
                imgDiv = document.createElement('div');
                secDiv.appendChild(imgDiv);
                dojo.addClass(imgDiv, 'dlg_task_history_general');
                var imgClassid ="";
                imgClassid ='dlg_history_task_' + queryResult[i].getType();
                dojo.addClass(imgDiv, imgClassid);
                
                spanDiv = document.createElement('span');               
                dojo.addClass(spanDiv, 'dlg_task_content');
                dojo.addClass(spanDiv, 'dlg_task_history_content');
                secDiv.appendChild(spanDiv);
                
                var summary =queryResult[i].getSummary();
                this.createLabel(summary, spanDiv);
                
                secDiv = document.createElement('div');
                historyDiv.appendChild(secDiv);
                spanDiv = document.createElement('span');
                dojo.addClass(spanDiv, 'dlg_task_history_date');
                dojo.addClass(spanDiv, 'dlg_task_history_createdate');                
                secDiv.appendChild(spanDiv);
                var theDatetime =this.parseDate(queryResult[i].getDateTime());
                if (theDatetime){
                    if (bidiDir != "")
                    	theDatetime = BidiUtils.addEmbeddingUCC(theDatetime);
                    this.createLabel(theDatetime, spanDiv);
                    
                }
                
            }
        }
        
    },

    getUserFullName: function(id){
        var editor = pe.scene.getEditorStore().getEditorById(id);
        return editor ? editor.getName() : null;
    },
    
    createLabel: function(text, container){
        var label = dojo.create('label', null, container);
        label.appendChild(dojo.doc.createTextNode(text));
        return label;
    },
    
    parseDate: function(datestamp)
    {
        var theDate = new Date(datestamp);        
        var locale = pe.scene.getLocale();		
        if(locale && locale.indexOf("th") > -1){
        	theDate = new dojox.date.buddhist.Date(theDate);
        }	    	        
        var td = dojo.date.locale.format(theDate, {formatLength: "medium"});
        if(td)
            return td;	
        return null; 
    },
    
	onShow:function(editor){		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs', 'presModal':true}];
		setTimeout(dojo.hitch(this, concord.util.events.publish,concord.util.events.presentationFocus, eventData), 25);
	},	
   
    onOk: function(editor){
        return true;
    },
    onCancel: function(editor){
        //do nothing
    }
    
});
