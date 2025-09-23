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

dojo.provide("concord.widgets.outlineDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.util.dialogs");
dojo.requireLocalization("concord.widgets","outlineDlg");
dojo.declare("concord.widgets.outlineDlg", [concord.widgets.concordDialog], {
	nls:null,
	outLines:[],
	selectedItem : null,
	oldSelection : null,
	selectorParas : [{enabled:true,label:['',''],className:[],value:[],padding:[],text:['','','']},
	                 {enabled:true,label:['',''],className:[],value:[],padding:[],text:['','','']},
	                 {enabled:true,label:['',''],className:[],value:[],padding:[],text:['','','']},
	                 {enabled:true,label:['',''],className:[],value:[],padding:[],text:['','','']},
	                 {enabled:true,label:['',''],className:[],value:[],padding:[],text:['','','']},
	                 {enabled:true,label:['',''],className:[],value:[],padding:[],text:['','','']}],
	multilevel_0 :  '',
	multilevel_1 :  'lst-n,1:lst-la,1:lst-lr,1:lst-n,1:lst-la,1:lst-lr,1:lst-n,1:lst-la,1:lst-lr,1:lst-n,1',
	multilevel_2 :  'lst-n2,1:lst-n,2:lst-n,3:lst-n,4:lst-n,5:lst-n,6:lst-n,7:lst-n,8:lst-n,9:lst-n,10',
	multilevel_3 :  'lst-ua,1:lst-la,1:lst-n,1:lst-ua,1:lst-la,1:lst-n,1:lst-ua,1:lst-la,1:lst-n,1:lst-ua,1',
	multilevel_4 :  'lst-ur,1:lst-ua,1:lst-n,1:lst-ur,1:lst-ua,1:lst-n,1:lst-ur,1:lst-ua,1:lst-n,1:lst-ur,1',  // outline
	multilevel_5 :  'lst-n,1:lst-n,2:lst-n,3:lst-n,4:lst-n,5:lst-n,6:lst-n,7:lst-n,8:lst-n,9:lst-n,10', // outline
	multilevelBullets: [],
                         
	constructor: function  (object, title, oklabel) {
		this.outLinesID = [];
		
		// Should not use image in the dialog, the heading in dialog will be translated.
		for(var i =0; i< 6;i++){
			this.outLinesID.push("outLine_outlineItem_"+i);
		}
		// IBM Docs internal defined outline class pattern: lst-outline-xxxx
		this.multilevelBullets = [this.multilevel_0, '', this.multilevel_1, '', this.multilevel_2, '',
		                          this.multilevel_3, '', this.multilevel_4, 'lst-outline-upper', this.multilevel_5, 'lst-outline-number'];
	},
	setDialogID: function() {
		this.dialogId = "C_d_outLineDlg";
		return this.dialogId;
	},
	createContent: function (contentDiv) {
		dojo.addClass( contentDiv, "lotusui30_layout ");
		this.initOutlineSelectorInnerHtml();
		var content = contentDiv;
		var templatesMainDiv = dojo.create("div", null, contentDiv);
		this.addOutLineSection(templatesMainDiv);
		setTimeout(dojo.hitch(this, this.createOutLineItem, null), 0);
	},
	addOutLineSection:function(container){
		var outLineDiv = document.createElement("div");
		dojo.addClass(outLineDiv,'concordTemplatesDialogResultBox');
		outLineDiv.id = "concordOutLineDialogSection";
		container.appendChild(outLineDiv);
	},
	getSelectedItem : function()
	{
		var editor = window.pe.lotusEditor;
		var body = editor.document.getBody();
		var bulletClass = body.getAttribute('bulletclass') || '';
//		var bulletType = body.getAttribute('type');
		
		var selectContext = {};
		selectContext.isOutline = false;
		selectContext.bulletType = '';
		selectContext.bulletClass = bulletClass;
		selectContext.complex = false;
		
		var selection = editor.getSelection();
		var ranges = selection && selection.getRanges(); 
		var isDefaultNumbering = false;
		var isDefaultBullet = false;
		var isInBullet = false;
		if(ranges && ranges.length > 0)
		{
			var range = ranges[0];
			var ancestor = MSGUTIL.getCommonListAncestor(range.startContainer, range.endContainer);
			if(ancestor)
			{
				var listInfo = LISTUTIL.getWholeListInfo(ancestor);
				selectContext.bulletType = listInfo.outline;
				if(bulletClass && bulletClass != '')
					selectContext.isOutline = listInfo.header.hasClass(bulletClass);
				
				if( !selectContext.bulletType )
				{
					if(listInfo.header.is('ol') )
						isDefaultNumbering = true;
					else if(listInfo.header.is('ul'))
						isDefaultBullet = true;
				}
				isInBullet = true;
			}
			else
			{
				ancestor = range.getCommonAncestor();
				if(ancestor.type == CKEDITOR.NODE_ELEMENT)
				{
					var nodeList = ancestor.getElementsByTag('li');
					if(nodeList.count() > 0)
					{
						// Selection contains bullet and other content.
						selectContext.complex = true;
					}	
				}	
			}	
		}
		
		var selectItem = 0;
		if(selectContext.complex)
			return -1;
		if(isDefaultNumbering)
		{
			if(selectContext.isOutline)
				selectItem = -1;  // Imported default outline, has no selection. 
			else
				selectItem = 1; // Default bullet has no bullet type, select the item 1
		}
		else if(isDefaultBullet)
			selectItem = -1;
		else if(isInBullet)
		{	
			selectItem = -1;
			for(var i = 0; i < this.multilevelBullets.length / 2; i++)
			{
				var item = this.multilevelBullets[i*2];
				if(selectContext.bulletType == item)
				{
					if(selectContext.isOutline)
					{
						var bulletClass = this.multilevelBullets[i * 2 + 1]; // Should define a class for outline
						if( bulletClass != '' && selectContext.bulletClass == bulletClass) 
							selectItem = i;
						else
							selectItem = -1;
					}	
					else
					{	
						selectItem = i;
					}
					break;
				}	
			}	
		}
		
		return selectItem;
	},
	createOutLineItem:function(){
		this.clickFn = CKEDITOR.tools.addFunction( function( outlineImg )
				{
					if(typeof outlineImg == 'undefined' || outlineImg == this.selectedItem)
						return;
					
					var node = dojo.byId(outlineImg);
					if(node)
					{
						dojo.style(node, 'border', '2px solid #0000AF');
						dojo.style(node, 'padding', '0px');
					}
					
					if(this.selectedItem)
					{
						node = dojo.byId(this.selectedItem);
						dojo.style(node, 'border', '1px solid #222222');
						dojo.style(node, 'padding', '1px');
					}
					
					this.selectedItem = outlineImg;
				}, this);
		this.onKeydownFn = CKEDITOR.tools.addFunction(  function( ev )
				{
			ev = new CKEDITOR.dom.event( ev );

			// Get an Anchor element.
			var element = ev.getTarget();
			var relative, nodeToMove;
			var td = element.getParent();
			var keystroke = ev.getKeystroke();
				var keystroke = ev.getKeystroke();
				switch ( keystroke )
				{
					// RIGHT-ARROW
					case 39 :
						// relative is TD
						if ( ( relative = element.getParent().getNext() ) )
						{
							nodeToMove = relative.getChild( 0 );
							nodeToMove.focus();
						}
						//relative is TR
						else if( ( relative = element.getParent().getParent().getNext() ) )
						{
							nodeToMove = relative.getChild( 0 ).getChild(0);
							nodeToMove.focus();
						}
						ev.preventDefault();
						break;
					// LEFT-ARROW
					case 37 :
						// relative is TD
						if ( ( relative = element.getParent().getPrevious() ) )
						{
							nodeToMove = relative.getChild( 0 );
							nodeToMove.focus();
						}
						//relative is TR
						else if( ( relative = element.getParent().getParent().getPrevious() ) )
						{
							nodeToMove = relative.getLast().getChild( 0 );
							nodeToMove.focus();
						}
						ev.preventDefault();
						break;
					// UP-ARROW
					case 38 :
						// relative is TR
						if ( ( relative = element.getParent().getParent().getPrevious() ) )
						{
							nodeToMove = relative.getChild( [element.getParent().getIndex(), 0] );
							nodeToMove.focus();
						}
						ev.preventDefault();
						break;
					// DOWN-ARROW
					case 40 :
						// relative is TR
						if ( ( relative = element.getParent().getParent().getNext() ) )
						{
							nodeToMove = relative.getChild( [element.getParent().getIndex(), 0] );
							if ( nodeToMove )
								nodeToMove.focus();
						}
						ev.preventDefault();
						break;
					default :
						// Do not stop not handled events.
						;
				}
				if(nodeToMove){
					var id=nodeToMove.getChild(0).getAttribute("id");
					CKEDITOR.tools.callFunction(this.clickFn,id);
				}
				
		}, this);
		var outLineDiv = dojo.byId('concordOutLineDialogSection');
		
		var output = [];
		output.push('<table ' +
		'align="center" cellspacing="20" cellpadding="0" border="0" role="listbox" >');
		
		var isCoeditMode = !window.pe.scene.session.isSingleMode();
		for(var i=0; i < this.outLinesID.length; i++)
		{
			var id = this.outLinesID[i];
			var isOutline = this.multilevelBullets[i * 2 + 1] == '' ? false : true;
			
			if( i === 0 )
				output.push( '<tr role="presentation">' );
			else if( (i%3) === 0)
				output.push( '</tr><tr role="presentation">' );
			
			output.push('<td style="padding: 2px" role="presentation">'
						+ this.createOutlineSelector(i, !isCoeditMode || !isOutline ) + '</td>');
			this.selectorParas[i].enabled = isCoeditMode && isOutline;
		}
		
		output.push( '</tr></table>' );
		var innerHtml = output.join( '' );
		outLineDiv.innerHTML = innerHtml;

		// Select the selected item
		var selectItem = this.getSelectedItem();
		if( selectItem >= 0 )
		{
			this.oldSelection = this.outLinesID[selectItem];
			CKEDITOR.tools.callFunction(this.clickFn, this.outLinesID[selectItem]);
		}
	},
	
	initOutlineSelectorInnerHtml: function()
	{
		this.nls = dojo.i18n.getLocalization("concord.widgets", "outlineDlg");                              
		this.selectorParas[0].label = [this.nls.label0,this.nls.label0];
		this.selectorParas[1].label = [this.nls.label1,this.nls.label0];
		this.selectorParas[2].label = [this.nls.label2,this.nls.label0];
		this.selectorParas[3].label = [this.nls.label3,this.nls.label0];
		this.selectorParas[4].label = [this.nls.label4_enabled,this.nls.label4_disabled,];
		this.selectorParas[5].label = [this.nls.label5_enabled,this.nls.label5_disabled,];

		this.selectorParas[4].text[0] = this.nls.heading + ' 1 ';
		this.selectorParas[4].text[1] = this.nls.heading + ' 2 ';
		this.selectorParas[4].text[2] = this.nls.heading + ' 3 ';
		this.selectorParas[5].text[0] = this.nls.heading + ' 1 ';
		this.selectorParas[5].text[1] = this.nls.heading + ' 2 ';
		this.selectorParas[5].text[2] = this.nls.heading + ' 3 ';
		
		this.selectorParas[1].value = ['1','a','i'];
		this.selectorParas[2].value = ['1','1.1','1.1.1'];
		this.selectorParas[3].value = ['A','a','1'];
		this.selectorParas[4].value = ['I','A','1'];
		this.selectorParas[5].value = ['1','1.1','1.1.1'];
		
		this.selectorParas[1].padding = ['5px','15px','15px'];
		this.selectorParas[2].padding = ['5px','15px','15px'];
		this.selectorParas[3].padding = ['5px','15px','15px'];
		this.selectorParas[4].padding = ['5px','15px','15px'];
		this.selectorParas[5].padding = ['5px','0px','0px'];
		
		var reg = /([^\,\:]+)\,[^\,\:]+/g;
		this.selectorParas[1].className = this.multilevel_1.replace(reg, "$1").split(":",3);
		this.selectorParas[2].className = this.multilevel_2.replace(reg, "$1").split(":",3);
		this.selectorParas[3].className = this.multilevel_3.replace(reg, "$1").split(":",3);
		this.selectorParas[4].className = this.multilevel_4.replace(reg, "$1").split(":",3);
		this.selectorParas[5].className = this.multilevel_5.replace(reg, "$1").split(":",3);
	},
	
	createOutlineSelector: function (item, enable)
	{
		var id = this.outLinesID[item];
		var borderColor = enable?'#222222':'#AAAAAA';
		var spanColor = enable?'#BBBBBB':'#EEEEEE';
		var tabindex= item==0 ? 0 : -1;
		var output = [];
		var labelIndex = enable?0:1;
		var linkId = "D_d_"+id;
		output.push('<a role="option" id="',linkId,'" _cke_focus=1 hidefocus=true ' +
					' title="' + this.selectorParas[item].label[labelIndex] + 
					'" tabindex="' +tabindex+'" onkeydown="CKEDITOR.tools.callFunction( ', this.onKeydownFn, ', event );"'+
					' style="text-decoration:none;color:' + borderColor + ';');
		if( enable == false )
		{
			output.push('cursor:default;"');
		}
		else
		{
			output.push('" onclick="CKEDITOR.tools.callFunction(', this.clickFn,
					',\'', id, '\'); return false;"');
		}
		output.push(' href="javascript:void(\'', '\')">');
		output.push('<table role="presentation" id="'+ id +'" style="table-layout:fixed; padding: 1px;border: 1px solid ' + borderColor + '; height: 100px; width: 130px;">'
					+ '<tbody><tr><td height="100%" style="white-space:nowrap;overflow:hidden;border: 3px solid #FFFFFF;vertical-align:middle;">');
		if(item == 0)
		{
			output.push('<p style="text-align: center;">' + this.nls.none + '</p>');
		}
		else
		{
			for(var i=0;i<3;i++)
			{
				output.push('<ol style="padding-left:' + this.selectorParas[item].padding[i] + ';">'
							+ '<li style="display: block;">'
							+ '<div class="' + this.selectorParas[item].className[i] + '" value="' + this.selectorParas[item].value[i] + '">'
							+ this.selectorParas[item].text[i]
							+ '<span style="border-top: 3px solid ' + spanColor + '; display: inline-block; width: 100px; vertical-align: middle; height: 2px;"> </span></div>');
			}
			output.push('</li></ol></li></ol></li></ol>');
		}
		output.push('</td></tr></tbody></table></a>');
		return output.join( '' );
	},
	
	onOk: function (editor) {
//		console.log("Select items: " + this.selectedItem);
		if( this.selectedItem == null || this.oldSelection == this.selectedItem )
			return true;
		var item = this.selectedItem.substr(this.selectedItem.lastIndexOf('_')+1);
		var bulletType = this.multilevelBullets[item * 2];
		var isOutline = this.multilevelBullets[item * 2 + 1] == '' ? false : true;
		var bulletClass = this.multilevelBullets[item * 2 + 1];
		// TODO remove timer
		// The timer just used for development 
		var func = function(){
			if(isOutline)
				editor.fire("setDocumentOutline", {'bulletType' : bulletType, 'bulletClass' : bulletClass});
			else
				editor.execCommand('numberedlist', {'bulletOutline' : bulletType});
		};
		
		setTimeout(func, 100);
		
		return true;
	}
});