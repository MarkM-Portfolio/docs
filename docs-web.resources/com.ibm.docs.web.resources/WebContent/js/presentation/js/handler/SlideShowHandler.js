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

dojo.provide("pres.handler.SlideShowHandler");
dojo.require("pres.widget.SlideShow");
dojo.require("concord.util.BidiUtils");
dojo.declare("pres.handler.SlideShowHandler", null, {

	viewDraftToEditMode: false,
	// D37690: [TVT][Presentation] Truncation in "Play Shared Slide Show" dialog.
	adjustListForSS: {
		'pt': 1,
		'pt-br': 1,
		'kk': 1,
		'bg': 1,
		'hu': 1,
		'hu-hu': 1,
		'ar': 1,
		'he': 1,
		'hr': 1,
		'ja': 1,
		'pl': 1,
		'sk': 1,
		'th': 1,
		'tr': 1
	},

	constructor: function()
	{
		this.coView = false;
		this.joinedOtherUserCoview = null;// Coviews joined by this user
		this.joinedMyCoview = []; // Array of users who joined this user's co-view
		this.listOfActiveCoViewInvites = []; // running list of current active co view sessions with current slide information. This will be used to build the menu when user wishes to later join coview
		this.sssUserInviteeList = []; // List of user id to invite to slide show.
		this.connectGridArray = [];
		this.editorStrings = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
	},

	reset: function()
	{
		this.inherited(arguments);
		this.coView = false;
		this.joinedOtherUserCoview = null;// Coviews joined by this user
		this.joinedMyCoview = []; // Array of users who joined this user's co-view
		this.listOfActiveCoViewInvites = []; // running list of current active co view sessions with current slide information. This will be used to build the menu when user wishes to later join coview
		this.sssUserInviteeList = []; // List of user id to invite to slide show.
		this.connectGridArray = [];
	},
	sendCoeditSlideShowCoViewMode: function(slideDoc, currentSlide)
	{
		//console.log('======= > sendCoeditSlideShowCoViewMode');
		var msgPub = pe.scene.msgPublisher;
		var msg = msgPub.createSlideShowCoviewMsg(slideDoc, currentSlide);
		msgPub.sendMessage([msg]);
	},

	sendCoeditSlideShowCoViewStart: function(slideDoc, currentSlide, userIdArray)
	{
		//console.log('======= > sendCoeditSlideShowCoViewStart');
		var msgPub = pe.scene.msgPublisher;
		var msg = msgPub.createSlideShowCoviewStartMsg(slideDoc, currentSlide, userIdArray);
		msgPub.sendMessage([msg]);
	},

	sendCoeditSlideShowCoViewEnd: function()
	{
		//console.log('======= > sendCoeditSlideShowCoViewEnd');
		var msgPub = pe.scene.msgPublisher;
		var msg = msgPub.createSlideShowCoviewEndMsg();
		msgPub.sendMessage([msg]);
	},

	sendCoeditSlideShowCoViewJoin: function()
	{
		// console.log('======= > sendCoeditSlideShowCoViewJoin');
		var msgPub = pe.scene.msgPublisher;
		var userHosting = window.pe.scene.joinedOtherUserCoview;
		var msg = msgPub.createSlideShowCoviewJoinMsg(userHosting);
		msgPub.sendMessage([msg]);
	},

	//
	// send when a user leaves a coview session that they joined
	//
	sendCoeditSlideShowCoViewLeft: function()
	{
		var msgPub = pe.scene.msgPublisher;
		var msg = msgPub.createSlideShowCoviewLeftMsg();
		msgPub.sendMessage([msg]);
	},

	//
	// handles receiving slide show coedit from other user
	//
	handleSlideShowCoeditFromOtherUser: function(curSlide, totalSlides, slideContent, userObj)
	{
		// console.log('======= > handleSlideShowCoeditFromOtherUser');
		if (curSlide != null && this.ssObject != null && this.joinedOtherUserCoview == userObj.getEditorId())
		{
			this.ssObject.storeCurrentShowDivToModel();
			this.ssObject.currSlide = curSlide;
			this.ssObject.showSlide(totalSlides, slideContent);
		}
		this.listOfActiveCoViewInvites[userObj.getEditorId()] = {
			'curSlide': curSlide,
			'totalSlides': totalSlides,
			'slideContent': slideContent
		}; // contains current slide
	},

	//
	// handles receiving slideshow coview Start from other users
	//
	handleSlideShowCoviewStartFromOtherUser: function(curSlide, totalSlides, slideContent, userObj, inviteeList)
	{
		// console.log('======= > handleSlideShowCoviewStartFromOtherUser');
		// need to launch dialog
		// if (inviteeList.indexOf(this.authUser.getId())>-1){
		if (PresCKUtil.isInArray(inviteeList, this.authUser.getId()) > -1)
		{
			this.openSlideShowCoviewInviteDialog(userObj);
		}
		// We also need to keep a running list of active invites
		this.listOfActiveCoViewInvites[userObj.getEditorId()] = {
			'curSlide': curSlide,
			'totalSlides': totalSlides,
			'slideContent': slideContent
		}; // contains current slide
	},

	//
	// handles receiving slideshow coview end from other users
	//
	handleSlideShowCoviewEndFromOtherUser: function(userObj)
	{
		// What do we do when user closes their shared slideShow? For now we close other users slide show also
		// We may not want this behavior... so we should comment out the next if check to not close other users slide show.
		if (this.ssObject != null && this.joinedOtherUserCoview == userObj.getEditorId())
		{
			try
			{
				var message = this.nls.slideShowCoviewEndMessage2;
				message = dojo.string.substitute(message, [userObj.getName()]);
				dojo.withDoc(this.ssObject.slideShowWindow.document, dojo.hitch(this, function(){
					this.ssObject.sssEndedDialog(userObj, message);
				}));
			}
			catch (e)
			{
				console.log(e);
			}
		}
		// we at least need to remove it from the running list
		delete this.listOfActiveCoViewInvites[userObj.getEditorId()];
	},

	//
	// We need to keep track of all the users who are joining this user's coview slide show
	//
	handleUserJoingingCoview: function(userObj, userHostId)
	{
		if (this.authUser.getId() == userHostId)
		{
			this.joinedMyCoview[userObj.getEditorId()] = true;
			this.setUserJoinNumber();
		}
	},

	//
	// We need to keep track of all the users who are leaving this user's coview slide show
	//
	handleUserLeavingCoview: function(userObj)
	{
		if (this.joinedMyCoview[userObj.getEditorId()] == true)
		{
			delete this.joinedMyCoview[userObj.getEditorId()];
			this.setUserJoinNumber();
		}
	},

	updateCoViewInviteMenu: function(popupMenu, emptyString)
	{

		if (this.slideShowInProgress())
		{ // slide show in progress let's disable menu items
			this.presMenubar.ssMenuItem.attr('disabled', true);
			this.presMenubar.ssCoviewMenuItem.attr('disabled', true);
			this.presMenubar.ssFromCurrentMenuItem.attr('disabled', true);
			popupMenu.attr('disabled', true);
			this.showInfoMessage(this.nls.slideShowWarning, 5000);
			return;
		}
		else
		{
			this.presMenubar.ssMenuItem.attr('disabled', false);
			this.presMenubar.ssCoviewMenuItem.attr('disabled', false);
			this.presMenubar.ssFromCurrentMenuItem.attr('disabled', false);
		}

		var tmpDjit = dijit.byId("P_i_coviewInvitesMenuList");
		if (tmpDjit)
		{
			tmpDjit.destroyRecursive();
		}

		var subMenu = new dijit.Menu({
			id: "P_i_coviewInvitesMenuList",
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		});
		dojo.addClass(subMenu.domNode, "lotusActionMenu");
		// document.body.appendChild(subMenu.domNode);

		var found = false;
		var coViewItem = window.pe.scene.listOfActiveCoViewInvites;

		for ( var i in coViewItem)
		{
			if (i != null)
			{
				found = true;
				var userObj = pe.scene.getEditorStore().getEditorById(i);
				if (dijit.byId("A_i_CoviewEntry_" + i))
				{
					continue;
				}
				subMenu.addChild(new dijit.MenuItem({
					id: "A_i_CoviewEntry_" + i,
					label: userObj.getName(),
					iconClass: '',
					dir: BidiUtils.isGuiRtl() ? 'rtl' : '',
					onClick: dojo.hitch(window.pe.scene, "joinSharedSlideShow", userObj)
				}));
			}
		}
		if (!found)
		{
			popupMenu.attr('disabled', true);
			subMenu.destroy();
			dojo.destroy(subMenu.domNode);
			subMenu = null;
		}
		else
		{
			// popupMenu.destroyDescendants();
			popupMenu.attr('disabled', false);
			if (popupMenu.popup)
			{
				if (!popupMenu.popup._destroyed)
				{
					popupMenu.popup.destroyRecursive();
				}
				delete popupMenu.popup;
			}
			popupMenu.popup = subMenu;
			popupMenu._started = false;
			popupMenu.startup();
		}
	},

	//
	// Determines if the user has a slide show window open or not
	//
	slideShowInProgress: function()
	{
		if (this.ssObject != null)
		{
			return true;
		}
		else
		{
			return false;
		}
	},

	//
	// ProcessJoining Coview Late. Ensuring that currentslide is set appropriately.
	//
	joinSharedSlideShow: function(userObj)
	{
		if (this.listOfActiveCoViewInvites[userObj.getEditorId()])
		{// Only launch if sss is still available
			this.launchSlideShow(null, false, true, userObj.getEditorId());
			var scene = this;
			setTimeout(function()
			{
				var curslideInfo = scene.listOfActiveCoViewInvites[userObj.getEditorId()];
				if (scene.ssObject)
				{
					scene.ssObject.storeCurrentShowDivToModel();
					scene.ssObject.currSlide = curslideInfo.curSlide;
					scene.ssObject.showSlide(curslideInfo.totalSlides, curslideInfo.slideContent);
				}
			}, 2000);
		}
		else
		{ // SSS has ended this user can't join anymore
			var scene = this;
			setTimeout(function()
			{
				scene.sssEndedDialog();
			}, 100);
		}
		this.ssCoviewDialog = null;
	},

	//
	// Shared Slide Show ended dialog
	//
	sssEndedDialog: function()
	{
		var contentId = "P_d_slideShowEnd_MainDiv";
		this.sssEndDialog = new concord.widgets.presentationDialog({
			'id': 'sssEndDialog',
			'aria-describedby': 'sssEndDialog_containerNode',
			'title': this.nls.slideShowCoviewEnded,
			'content': "<div id='" + contentId + "'>" + this.nls.slideShowCoviewEndMessage + "</div>",
			'presDialogHeight': '175',
			'presDialogWidth': '360',
			// 'presDialogTop': (this.slideEditor.parentContainerNode.parentNode.offsetParent.offsetHeight / 2) - 115,
			// 'presDialogLeft': (this.slideEditor.parentContainerNode.parentNode.offsetParent.offsetWidth / 2) - 150,
			'heightUnit': 'px',
			'presModal': true,
			'destroyOnClose': true,
			'presDialogButtons': [{
				'label': this.editorStrings.ok,
				'action': dojo.hitch(this, function()
				{
				})
			}]
		});
		this.sssEndDialog.startup();
		this.sssEndDialog.show();
		var mainDialogNode = this.sssEndDialog.domNode;
		var dialogContentDiv = dojo.byId(contentId);
		setTimeout(function()
		{
			mainDialogNode.style.height = 'auto';
			dialogContentDiv.parentNode.style.width = 'auto';
		}, 100);
	},

	//
	// Opens dialog
	//
	openSlideShowCoviewInProgress: function(win, imgDiv, e)
	{
		try
		{
			if (e.target && e.target.className == "imgPlusIcon")
			{
				dojo.stopEvent(e);
			}
			dojo.withDoc(win.document, dojo.hitch(this.ssObject, this.ssObject.openSlideShowCoviewSelectUsersDialog), null);
		}
		catch (e)
		{
			console.log(e);
		}
	},

	//
	// opens invitation for slide show coview
	//
	openSlideShowCoviewSelectUsersDialog: function()
	{
		// var tmStamp = new Date().getTime();
		// var userObj = this.authUser;
		var widgetId = "P_d_slideShowCoviewSelectUsers";
		var contentId = "P_d_slideShowCoviewSelectUsers_MainDiv";
		var title = this.nls.slideShowCoviewSelectUsersTitle;

		this.ssCoviewSelectUsersDialog = new pres.widget.Dialog({
			'id': widgetId,
			'title': title,
			'aria-describedby': contentId,
			'content': "<div id='" + contentId + "' style='padding:15px; height:auto; width:385px;'> </div>",
			'presDialogHeight': (dojo.isIE) ? '290' : '371',
			'presDialogWidth': '455',
			// 'presDialogTop': (this.slideEditor.parentContainerNode.parentNode.offsetParent.offsetHeight / 2) - 115,
			// 'presDialogLeft': (this.slideEditor.parentContainerNode.parentNode.offsetParent.offsetWidth / 2) - 150,
			'heightUnit': 'px',
			'presModal': true,
			'destroyOnClose': true,
			'presDialogButtons': [{
				'label': this.editorStrings.ok,
				'id': 'ssCoviewSelectUsers_okButton',
				'action': dojo.hitch(this, this.launchSlideShowForSelectedUsers)
			}, {
				'label': this.editorStrings.cancel,
				'id': 'ssCoviewSelectUsers_cancelButton',
				'action': dojo.hitch(this, function()
				{
					this.editorGrid.destroyRecursive();
					this.editorGrid = null;
				})
			}]
		});

		// Need to overwrite closeDialog so we can prevent Presentation menu from being selected when closing the dialog.
		this.ssCoviewSelectUsersDialog.closeDialog = dojo.hitch(this.ssCoviewSelectUsersDialog, function(callback)
		{
			this.destroyToolTips();
			var keepDialogOpen = false;
			if (callback)
			{
				keepDialogOpen = callback(); // if callback has an error message do not close the dialog and allow user to correct entries to resubmit
			}

			if (keepDialogOpen)
			{
				return;
			}
			else
			{
				if (this.opts.destroyOnClose)
				{
					this.hide();
					this.uninitializePresDialog();
					this.destroyRecursive();
				}
				else
					this.hide();
			}

			if (window.pe.scene.dialogCloseEvent)
			{
				dojo.disconnect(this.dialogCloseEvent);
			}

			var presMenu = dijit.byId("P_m_Presentation");
			if (presMenu)
			{
				presMenu._setSelected(false);
			}
			// throw focus off so that the menu is not highlighted if window loses focus.
			// TODO BOB
			// window.pe.scene.slideEditor.mainNode.focus();
			setTimeout(dojo.hitch(pe.scene, pe.scene.setFocus), 0);
		});

		this.ssCoviewSelectUsersDialog.startup();
		this.ssCoviewSelectUsersDialog.show();
		// fix for defect 15588 need to move this to presentation.css
		this.ssCoviewSelectUsersDialog.domNode.style.backgroundColor = '#cccccc';

		// Now let's insert content to the dialog
		var dialogContentDiv = dojo.byId(contentId);

		// Add dialog paragraph
		var p = document.createElement("p");
		var pText = this.nls.slideShowCoviewStmt;
		p.appendChild(document.createTextNode(pText));

		dialogContentDiv.appendChild(p);
		dialogContentDiv.appendChild(document.createElement("br"));

		// Add radio options
		var frm = document.createElement("form");

		var choices = "<input id='opt1' type='radio' name='coview' value='op1v' tabindex='1' checked aria-required='true' aria-valuemax='10' aria-valuemin='1'/> <label for='opt1'>" + this.nls.slideShowCoviewOptionOne + "</label>";
		choices += "<br/>";
		choices += "<input id='opt2' type='radio' name='coview' value='op2v' tabindex='-1' aria-required='true' aria-valuemax='10' aria-valuemin='1' /> <label for='opt2'>" + this.nls.slideShowCoviewOptionTwo + "</label>";

		frm.innerHTML = choices;

		dialogContentDiv.appendChild(frm);

		dialogContentDiv.appendChild(document.createElement("br"));

		dojo.connect(dojo.byId('opt1'), 'onfocus', dojo.hitch(this, "hideUserList", this.ssCoviewSelectUsersDialog.domNode));
		dojo.connect(dojo.byId('opt2'), 'onfocus', dojo.hitch(this, "showUserList", this.ssCoviewSelectUsersDialog.domNode));

		if (dojo.isWebKit)
		{ // For webkit radio input does not fire focus when user clicks
			dojo.connect(dojo.byId('opt1'), 'onclick', dojo.hitch(this, "hideUserList", this.ssCoviewSelectUsersDialog.domNode));
			dojo.connect(dojo.byId('opt2'), 'onclick', dojo.hitch(this, "showUserList", this.ssCoviewSelectUsersDialog.domNode));
		}

		// ADD USER TABLE
		var userDivWidth = "250";
		var inputBoxDiv = document.createElement("div");
		inputBoxDiv.className = "userFilterBar";
		dojo.style(inputBoxDiv, {
			"marginBottom": "10px",
			"marginLeft": "15px",
			"marginTop": "8px",
			"position": "relative",
			"top": "-22px",
			"width": "258px",
			"color": "#CCCCCC"
		});

		dialogContentDiv.appendChild(inputBoxDiv);
		this.addSearchBar(inputBoxDiv);
		// ADD USER LIST

		var userDiv = document.createElement("div");
		userDiv.className = "userList";
		dojo.style(userDiv, {
			"padding": "5px",
			"border": "1px solid #CCCCCC",
			"height": "102px",
			"overflowX": "hidden",
			"outline": "none",
			"width": userDivWidth + "px",
			"overflowY": "auto",
			"position": "relative",
			"top": "-25px",
			"left": "13px"
		});
		dialogContentDiv.appendChild(userDiv);

		var rootEditor = document.createElement('div');
		rootEditor.id = "rootEditor_ss";
		rootEditor.className = 'editorCss';

		var newEditor = document.createElement('div');
		newEditor.id = "gridEditor_ss";
		userDiv.appendChild(rootEditor);

		var formatters = {
			// GRID FORMATTERS
			"legend": function(value, idx)
			{
				if (value && value.length)
				{
					// if there is a value, it is a color code, so create something centered for it.
					var nls = dojo.i18n.getLocalization("concord.widgets.sidebar", "SideBar");
					var ariaLabel = dojo.string.substitute(nls.editorColor, [value[2]]);
					return '<span aria-label="' + ariaLabel + '"' + 'title="' + nls.editorTitle + '"' + 'style="width:12px;height:12px;display:inline-block;background-color: ' + value[0] + ';border: 1px solid ' + value[1] + ';"></span>';
				}
				return "";
			},
			"checkBoxFunc": function(value, idx)
			{
				if (value && value.length && (window.pe.scene.authUser.getId() != value[0]))
				{
					var str = '<input id = ' + idx + ' class="gridCheckBox" type="checkbox" style="width: auto" >';
					// if (idx==0){
					// str= '<input id = '+idx+' tabindex="15" class="gridCheckBox" type="checkbox" style="width: auto" >';
					// }
					return str;
				}
				return "";
			},

			"observerStatus": function(value, idx)
			{
				if (value && value.length)
				{
					// if there is a value, it is a color code, so create something centered for it.
					// var nls = dojo.i18n.getLocalization("concord.widgets.sidebar","SideBar");
					// var ariaLabel = dojo.string.substitute(nls.editorColor,[value[2]]);
					var ariaLabel = "toupdate";
					var observerState = window.pe.scene.getObserverRoleStatusForUser(value[0]).state;

					if (observerState != null && (observerState == 'off' || observerState == false))
					{

						var imgName = window.pe.scene.getUIObserverImg(observerState);
						var opValue = "1";
						var classes = "observerImg curUser";
						if (window.pe.scene.authUser.getId() != value[0])
						{ // processing current user
							opValue = '.3';
							classes = "observerImg";
						}
						return '<img aria-label="' + ariaLabel + '" class="' + classes + '" style="opacity:' + opValue + '; height: 30px; width: 30px; cursor: pointer;" src="' + imgName + '">';
					}
					else
					{
						return "";
					}
				}
				return "";
			}
		};

		var editorConfig = {
			layout: {

				defaultCell: {
					headerStyles: 'padding: 0',
					styles: 'text-align: left;padding:4px 1px 4px 9px;'
				},
				cells: [{
					fields: ['userId', 'displayName'],
					width: '5%',
					styles: "text-align: center;",
					editable: true,
					formatter: formatters["checkBoxFunc"]
				},

				{
					field: "displayName",
					width: '95%',
					cellStyles: 'font-style: normal;font-family:Arial, Helvetica, sans-serif; cursor:default;text-align: left',
					cellClasses: 'defaultColumn',
					headerStyles: 'text-align: center;'
				}

				]
			}
		};
		var userData = this.getEditorPane().store.getClonedEditors();

		userData.items.shift(); // Remove first entry which should be the current user. May need to harden

		// Commenting line below since users who are not in the document can still be selected since they will get notified
		// as soon as they log in.
		// userData.items = this.removeInactiveUsers(userData.items); // Need to remove users who are not currently in the document

		var dataStore = new dojo.data.ItemFileReadStore({
			data: userData
		});

		// create a new grid:
		var editorGrid = this.editorGrid = new dojox.grid.DataGrid({
			store: dataStore,
			autoHeight: true,
			selectionMode: 'multiple',
			rowSelector: false,
			onCellClick: dojo.hitch(this, function(e)
			{
				this.handleRowClick(e.rowIndex);
			}),
			onRowClick: dojo.hitch(this, function(e)
			{ /* TBD */
			}),
			onKeyDown: dojo.hitch(this.editorGrid, function(e)
			{

				if (e.altKey || e.metaKey)
				{
					return;
				}
				var dk = dojo.keys;
				var colIdx;
				switch (e.keyCode)
				{
					case dk.ESCAPE:
						this.edit.cancel();
						break;
					case dk.SPACE:
					case dk.ENTER:
						window.pe.scene.handleRowClick(this.focus.rowIndex);
						break;
					case dk.TAB:
						dojo.stopEvent(e);
						this.rows.setOverRow(-2);
						if (e.shiftKey)
						{
							if (window.pe.scene.searchBoxObj && window.pe.scene.searchBoxObj.focusNode)
							{
								window.pe.scene.searchBoxObj.focusNode.focus();
								window.pe.scene.searchBoxObj.focusNode.select();
							}
						}
						else
						{
							var okBtn = dojo.byId('ssCoviewSelectUsers_okButton');
							okBtn.focus();
						}
						break;
					case dk.LEFT_ARROW:
					case dk.RIGHT_ARROW:
						if (!this.edit.isEditing())
						{
							var keyCode = e.keyCode; // IE seems to lose after stopEvent when modifier keys
							dojo.stopEvent(e);
							colIdx = this.focus.getHeaderIndex();
							if (colIdx >= 0 && (e.shiftKey && e.ctrlKey))
							{
								this.focus.colSizeAdjust(e, colIdx, (keyCode == dk.LEFT_ARROW ? -1 : 1) * 5);
							}
							else
							{
								var offset = (keyCode == dk.LEFT_ARROW) ? 1 : -1;
								if (dojo._isBodyLtr())
								{
									offset *= -1;
								}
								this.focus.move(0, offset);
							}
						}
						break;
					case dk.UP_ARROW:
						if (!this.edit.isEditing() && this.focus.rowIndex !== 0)
						{
							dojo.stopEvent(e);
							var curRow = window.pe.scene.editorGrid.rows.overRow;
							if (curRow > 0)
							{
								window.pe.scene.editorGrid.focus.setFocusIndex((curRow - 1), 1);
							}

							// this.focus.move(-1, 0);
						}
						break;
					case dk.DOWN_ARROW:
						if (!this.edit.isEditing() && this.focus.rowIndex + 1 != this.rowCount)
						{
							dojo.stopEvent(e);
							var chkInput = dojo.query(".gridCheckBox", window.pe.scene.editorGrid.domNode);
							var curRow = window.pe.scene.editorGrid.rows.overRow;
							if ((chkInput.length - 1) >= 0 && curRow < (chkInput.length - 1))
							{
								window.pe.scene.editorGrid.focus.setFocusIndex((curRow + 1), 1);
							}
							// this.focus.move(1, 0);
						}
						break;
					case dk.PAGE_UP:
						if (!this.edit.isEditing() && this.focus.rowIndex !== 0)
						{
							dojo.stopEvent(e);
							if (this.focus.rowIndex != this.scroller.firstVisibleRow + 1)
							{
								this.focus.move(this.scroller.firstVisibleRow - this.focus.rowIndex, 0);
							}
							else
							{
								this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex - 1));
								this.focus.move(this.scroller.firstVisibleRow - this.scroller.lastVisibleRow + 1, 0);
							}
						}
						break;
					case dk.PAGE_DOWN:
						if (!this.edit.isEditing() && this.focus.rowIndex + 1 != this.rowCount)
						{
							dojo.stopEvent(e);
							if (this.focus.rowIndex != this.scroller.lastVisibleRow - 1)
							{
								this.focus.move(this.scroller.lastVisibleRow - this.focus.rowIndex - 1, 0);
							}
							else
							{
								this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex + 1));
								this.focus.move(this.scroller.lastVisibleRow - this.scroller.firstVisibleRow - 1, 0);
							}
						}
						break;
					default:
						break;
				}
			}),
			structure: editorConfig.layout,
			onCellFocus: dojo.hitch(this.editorGrid, function(inCell, inRowIndex)
			{
				this.edit.cellFocus(inCell, inRowIndex);
				this.rows.setOverRow(inRowIndex);
			}),
			onSelected: dojo.hitch(this, "handleRowClick")
		}, newEditor);

		rootEditor.appendChild(this.editorGrid.domNode);

		// //Fired when a row is clicked. The event contains references to the grid, cell and rowIndex.
		// this.connectArray.push(dojo.connect(this.editorGrid,"onRowClick", this, this._selectEditorGrid));
		// this.connectArray.push(dojo.connect(this.editorGrid, "onStyleRow", this, dojo.hitch(this,"onStyleRow",this.editorGrid)));

		this.editorGrid.startup();
		// Let's update joined users
		this.sssUserInviteeList = []; // Clear selected users
		this.updateSelectedUsers(); // No need to show selected users
		// this.updateGridRowTabIndex();

		// We should also remove non active users
		// this.editorGrid.filter({observerMode:new RegExp("off|on")}); //Turn this back on when we support observer mode

		// Formatting
		var ctDiv = dojo.query(".dojoxGridContent", editorGrid.domNode);
		if (ctDiv && ctDiv.length > 0 && ctDiv[0].firstChild)
			ctDiv[0].firstChild.style.position = "";

		var chkBoxes = dojo.query(".dojoxGridHiddenFocus", editorGrid.domNode);
		for ( var i = 0; i < chkBoxes.length; i++)
		{
			chkBoxes[i].style.display = "none";
		}

		this.hideUserList(this.ssCoviewSelectUsersDialog.domNode);

		dojo.connect(this.editorGrid, "sizeChange", this.editorGrid, function()
		{
			if (window.pe.scene.editorGrid)
			{
				var ctDiv = dojo.query(".dojoxGridContent", window.pe.scene.editorGrid.domNode);
				if (ctDiv && ctDiv.length > 0 && ctDiv[0].firstChild)
					ctDiv[0].firstChild.style.position = "";

				var chkBoxes = dojo.query(".dojoxGridHiddenFocus", window.pe.scene.editorGrid.domNode);
				for ( var i = 0; i < chkBoxes.length; i++)
				{
					chkBoxes[i].style.display = "none";
				}
			}
		});

		dojo.connect(this.editorGrid.rows, "setOverRow", this, "focusAfterRowover");
		dojo.connect(this.editorGrid, "_fetch", this.editorGrid, dojo.hitch(this, "updateSelectedUsers"));

		setTimeout(function()
		{
			var sendToAllOption = dojo.query("#opt1", dojo.byId("P_d_slideShowCoviewSelectUsers_containerNode"));
			if (sendToAllOption && sendToAllOption.length > 0)
			{
				sendToAllOption[0].focus();
			}

			var okBtn = dojo.byId('ssCoviewSelectUsers_okButton');
			dojo.attr(okBtn, 'tabindex', '500');
			var cancelbtn = dojo.byId('ssCoviewSelectUsers_cancelButton');
			dojo.attr(cancelbtn, 'tabindex', '550');

			dojo.connect(cancelbtn, 'onkeydown', dojo.hitch(this, function(e)
			{
				if (e.altKey || e.metaKey)
				{
					return;
				}
				if (e.keyCode == dojo.keys.TAB)
				{
					e.stopPropagation();
					e.preventDefault();
					sendToAllOption[0].checked = true;
					sendToAllOption[0].focus();
				}
			}));
		}, 200);
		this.updateBidiStylesIfRequired();
	},

	//
	// removes inactive users from the data list
	//
	removeInactiveUsers: function(items){
		if (items!=null){
			var tmpArr =[];
			var editorPane = this.getSidebar().editorsPane;
			var size = items.length-1;
			for (var i=size; i>=0; i--){
				var obj = items[i];
				if (editorPane && editorPane.formatter && editorPane.formatter.activeIds[obj.userId]){
					tmpArr.unshift(obj);
				}					
			}
			return tmpArr;
		}
	},

	//
	// As the user mouses over the row we need to focus that row
	//
	focusAfterRowover: function()
	{
		var row = this.editorGrid.rows.overRow;
		if (row >= 0)
		{
			var inCell = this.editorGrid.getCell(1);
			var inRowIndex = row;
			if (inCell && !this.editorGrid.focus.isFocusCell(inCell, inRowIndex))
			{
				this.editorGrid.focus.tabbingOut = false;
				if (this.editorGrid.focus._colHeadNode)
				{
					this.editorGrid.focus.blurHeader();
				}
				this.editorGrid.focus._colHeadNode = this.editorGrid.focus._colHeadFocusIdx = null;
				try
				{
					this.editorGrid.focus.focusGridView();
				}
				catch (e)
				{
					console.log(e);
				}
				this.editorGrid.focus._focusifyCellNode(false);
				this.editorGrid.focus.cell = inCell;
				this.editorGrid.focus.rowIndex = inRowIndex;
				this.editorGrid.focus._focusifyCellNode(true);
			}
		}
	},

	//
	// This updates the list of selected users in the dialog
	//
	updateSelectedUsers: function()
	{
		for ( var i = 0; i < this.connectGridArray.length; i++)
		{
			dojo.disconnect(this.connectGridArray[i]);
		}
		this.connectGridArray = [];
		var chkInput = dojo.query(".gridCheckBox", this.editorGrid.domNode);
		for ( var x = 0; x < chkInput.length; x++)
		{
			var rowIndex = x;
			var item = this.editorGrid.getItem(rowIndex);
			var itemId = item.userId;

			//
			// Whenever we mousedown on the input check we need to send focus to col1 of that row
			//
			this.connectGridArray.push(dojo.connect(chkInput[x], 'onmousedown', dojo.hitch(window.pe.scene, function(node, e)
			{
				e.preventDefault();
				e.stopPropagation();
				this.handleRowClick(node.id);
				// we need to ensure that the focus is on the sibling of the parent
				node.parentNode.nextSibling.focus();
			}, chkInput[x])));

			//
			// Whenever input check is focussed we need to send focus to col1 of that row
			//
			this.connectGridArray.push(dojo.connect(chkInput[x], 'onfocus', dojo.hitch(window.pe.scene, function(node, rowIndex, e)
			{
				e.preventDefault();
				e.stopPropagation();
				// node.parentNode.nextSibling.focus();
				this.editorGrid.focus.setFocusIndex(rowIndex, 1);
			}, chkInput[x], x)));

			//
			// Whenever col1 receives the focus we need to invoke focus manager
			//
			var col0 = chkInput[x].parentNode;
			var col1 = col0.nextSibling;
			this.connectGridArray.push(dojo.connect(col1, 'onfocus', dojo.hitch(window.pe.scene, function(col1, rowIndex, e)
			{
				e.preventDefault();
				e.stopPropagation();
				this.editorGrid.focus.setFocusIndex(rowIndex, 1);
			}, col1, x)));

			// dojo.connect(chkInput[x],'onclick',function(e){console.log(e); e.preventDefault();});
			if (PresCKUtil.isInArray(this.sssUserInviteeList, itemId) > -1)
			{
				// this user was selected let's set check box
				chkInput[x].checked = true;
			}
			else
			{
				chkInput[x].checked = false;
			}
		}
		this.updateGridRowTabIndex();
	},

	//
	// This updates the tabindex of the first row
	//
	updateGridRowTabIndex: function()
	{
		var chk = dojo.query(".gridCheckBox", this.editorGrid.domNode);
		if (chk && chk.length > 0)
		{
			var col0 = chk[0].parentNode;
			var col1 = col0.nextSibling;
			if (col1 && col1.nodeName.toLowerCase() == 'td')
			{
				dojo.attr(col1, 'tabindex', 15);
			}
		}
	},

	//
	// This updates the list of selected users in the dialog
	//
	updateJoinedUsers: function()
	{
		var rows = dojo.query(".gridCheckBox", this.editorGrid.domNode);
		for ( var x = 0; x < rows.length; x++)
		{
			var rowIndex = x;
			var item = this.editorGrid.getItem(rowIndex);
			var itemId = item.userId;
			if (this.joinedMyCoview[itemId] == true)
			{
				// this user was selected let's set check box
				rows[x].checked = true;
			}
			else
			{
				rows[x].checked = false;
			}
		}
	},

	handleRowClick: function(e)
	{
		var item = this.editorGrid.getItem(e);
		var chkBx = dojo.query(".gridCheckBox", this.editorGrid.domNode);
		if (chkBx.length <= e)
		{
			return;
		}
		chkBx = chkBx[e];
		this.editorGrid.focus.rowIndex = e;
		var index = PresCKUtil.isInArray(this.sssUserInviteeList, item.userId);
		if (!chkBx.checked)
		{
			// let's check the check box
			chkBx.checked = true;
			if (index < 0)
			{// if not there then add
				this.sssUserInviteeList.push(item.userId);
			}
		}
		else
		{
			chkBx.checked = false;
			if (index >= 0)
			{// if there then remove
				this.sssUserInviteeList.splice(index, 1);
			}
		}
	},

	//
	// hide user list from the shared slideshow dialog
	//
	hideUserList: function(scope)
	{
		var locale = window.g_locale;

		var searchBar = dojo.query(".userFilterBar", scope);
		if (searchBar && searchBar.length > 0)
		{
			searchBar[0].style.display = "none";
			if (locale in this.adjustListForSS)
			{
				searchBar[0].style.width = "458px";
			}
			// console.log("searchBar[0].style:"+searchBar[0].style.width);
		}

		var userList = dojo.query(".userList", scope);

		if (userList && userList.length > 0)
		{
			userList[0].style.display = "none";
			if (locale in this.adjustListForSS)
			{
				userList[0].style.width = "450px";
			}
			// console.log("userList[0].style:"+userList[0].style.width);
		}

		// D22290: [TVT][TCT15]pt translator suggest wider "Shared Slide Show" dialog.
		var dialogDiv = dojo.byId("P_d_slideShowCoviewSelectUsers");
		// console.log("dialogDiv.style.width:"+dialogDiv.style.width);
		var dialogContent = dojo.byId("P_d_slideShowCoviewSelectUsers_containerNode");
		// console.log("dialogContent.style.width:"+dialogContent.style.width);
		var dialogContentMainDiv = dojo.byId("P_d_slideShowCoviewSelectUsers_MainDiv");
		// console.log("dialogContentMainDiv.style.width:"+dialogContentMainDiv.style.width);
		var okBtn = dojo.byId('ssCoviewSelectUsers_okButton');
		// console.log("okBtn.parent.style.width:"+okBtn.parentNode.parentNode.parentNode.style.width);

		dialogContent.style.height = "173px";
		dialogContent.style.width = "415px";
		scope.style.height = "255px";
		scope.style.width = "455px";

		if (locale in this.adjustListForSS)
		{
			dialogContent.style.width = "525px";
			dialogDiv.style.width = "565px";
			dialogContentMainDiv.style.width = "515px";
			okBtn.parentNode.parentNode.parentNode.style.width = "521px";
		}

		// D21564 - Need to adjust the dialog and scope depending on the translated text of certain
		// languages. Note that auto would also make this work but there is a known issue with setting
		// the height to auto for these elements which causes the dialog to break if the window is too small.
		var localeHeight = [{
			locale: 'el',
			heightContent: '217px',
			heightScope: '300px'
		}, {
			locale: 'pt',
			heightContent: '217px',
			heightScope: '300px'
		}, {
			locale: 'ru',
			heightContent: '217px',
			heightScope: '300px'
		}, {
			locale: 'ca',
			heightContent: '217px',
			heightScope: '300px'
		}, {
			locale: 'it',
			heightContent: '183px',
			heightScope: '265px'
		}, {
			locale: 'fr',
			heightContent: '183px',
			heightScope: '265px'
		}, {
			locale: 'de',
			heightContent: '183px',
			heightScope: '265px'
		}, {
			locale: 'nl',
			heightContent: '207px',
			heightScope: '290px'
		}, {
			locale: 'pl',
			heightContent: '200px',
			heightScope: '283px'
		}];
		for ( var i = 0; i < localeHeight.length; i++)
		{
			var index = locale.indexOf('-');
			if (index != -1)
				locale = locale.substr(0, index);

			if (localeHeight[i].locale == locale)
			{
				dialogContent.style.height = localeHeight[i].heightContent;
				scope.style.height = localeHeight[i].heightScope;
				break;
			}
		}
	},

	//
	// shows the user list in the shared slideshow view dialog
	//
	showUserList: function(scope)
	{
		var locale = window.g_locale;
		var searchBar = dojo.query(".userFilterBar", scope);
		if (searchBar && searchBar.length > 0)
		{
			searchBar[0].style.display = "";
			if (locale in this.adjustListForSS)
			{
				searchBar[0].style.width = "458px";
			}
		}

		var userList = dojo.query(".userList", scope);
		if (userList && userList.length > 0)
		{
			userList[0].style.display = "";
			if (locale in this.adjustListForSS)
			{
				userList[0].style.width = "450px";
			}
		}

		// D22290: [TVT][TCT15]pt translator suggest wider "Shared Slide Show" dialog.
		var dialogDiv = dojo.byId("P_d_slideShowCoviewSelectUsers");
		// console.log("dialogDiv.style.width:"+dialogDiv.style.width);
		var dialogContent = dojo.byId("P_d_slideShowCoviewSelectUsers_containerNode");
		// console.log("dialogContent.style.width:"+dialogContent.style.width);
		var dialogContentMainDiv = dojo.byId("P_d_slideShowCoviewSelectUsers_MainDiv");
		// console.log("dialogContentMainDiv.style.width:"+dialogContentMainDiv.style.width);
		var okBtn = dojo.byId('ssCoviewSelectUsers_okButton');
		// console.log("okBtn.parent.style.width:"+okBtn.parentNode.parentNode.parentNode.style.width);

		dialogContent.style.height = "324px";
		dialogContent.style.width = "415px";
		scope.style.height = "406px";
		scope.style.width = "455px";

		if (locale in this.adjustListForSS)
		{
			scope.style.width = "565px";
			dialogContent.style.width = "525px";
			dialogDiv.style.width = "565px";
			dialogContentMainDiv.style.width = "515px";
			okBtn.parentNode.parentNode.parentNode.style.width = "521px";
		}

		// D21564 - Need to adjust the dialog and scope depending on the translated text of certain
		// languages. Note that auto would also make this work but there is a known issue with setting
		// the height to auto for these elements which causes the dialog to break if the window is too small.
		var localeHeight = [{
			locale: 'el',
			heightContent: '370px',
			heightScope: '452px'
		}, {
			locale: 'pt',
			heightContent: '370px',
			heightScope: '452px'
		}, {
			locale: 'ru',
			heightContent: '370px',
			heightScope: '452px'
		}, {
			locale: 'ca',
			heightContent: '370px',
			heightScope: '452px'
		}, {
			locale: 'it',
			heightContent: '335px',
			heightScope: '417px'
		}, {
			locale: 'fr',
			heightContent: '335px',
			heightScope: '417px'
		}, {
			locale: 'de',
			heightContent: '335px',
			heightScope: '417px'
		}, {
			locale: 'nl',
			heightContent: '360px',
			heightScope: '442px'
		}, {
			locale: 'pl',
			heightContent: '353px',
			heightScope: '435px'
		}];
		for ( var i = 0; i < localeHeight.length; i++)
		{
			var locale = window.g_locale;
			var index = locale.indexOf('-');
			if (index != -1)
				locale = locale.substr(0, index);

			if (localeHeight[i].locale == locale)
			{
				dialogContent.style.height = localeHeight[i].heightContent;
				scope.style.height = localeHeight[i].heightScope;
				break;
			}
		}

		// var node = scope;
		// setTimeout(function(){
		// node.style.height = dojo.style(node,'height')+"px";
		// node.style.width = dojo.style(node,'width')+"px";
		// }, 800 );
	},

	//
	// Add search bar for share slide show (sss) dialog
	//
	addSearchBar: function(main)
	{
		// Add search bar
		var id = 'sss_SearchBoxID_' + new Date().getTime();
		var searchBoxTitle = this.nls.slideShowCoviewDialogInput;

		var searchDivSection = this.searchDivSection = document.createElement("div");
		main.appendChild(searchDivSection);
		searchDivSection.id = 'searchDivSection_' + new Date().getTime();
		if (dijit.byId(id) == null)
		{
			var message = this.nls.slideShowCoviewDialogInput;
			this.searchBoxObj = new dijit.form.TextBox({
				'id': 'searchBox_' + id,
				'trim': true,
				'maxLength': '100',
				'value': message
			}, searchDivSection);
			this.searchBoxObj.startup();
			dojo.attr(this.searchBoxObj.focusNode, 'tabindex', 10);
			dojo.attr(this.searchBoxObj.focusNode, 'title', searchBoxTitle);
			if (BidiUtils.getTextDir() != "")
				dojo.attr(this.searchBoxObj.focusNode, "dir", BidiUtils.getTextDir());
			if (dojo.attr(this.searchBoxObj.focusNode, "dir") == "contextual")
				dojo.connect(this.searchBoxObj.focusNode, 'onkeyup', dojo.hitch(this, function()
				{
					this.searchBoxObj.focusNode.dir = BidiUtils.calculateDirForContextual(this.searchBoxObj.focusNode.value);
				}));

			if (window.pe.scene.searchBarEvt)
			{
				dojo.disconnect(window.pe.scene.searchBarEvt);
			}
			window.pe.scene.searchBarEvt = dojo.connect(this.searchBoxObj.focusNode, "onfocus", this.searchBoxObj, function(event)
			{
				if (!this.firstClick)
				{
					this.setValue("");
					this.firstClick = true;
					this.domNode.style.color = "#000000";
				}
			});

			if (window.pe.scene.searchBarEvt2)
			{
				dojo.disconnect(window.pe.scene.searchBarEvt2);
			}
			window.pe.scene.searchBarEvt2 = dojo.connect(this.searchBoxObj.domNode, "onkeyup", this, dojo.hitch(this, "getUserKeyStroke", this.searchBoxObj));

			dojo.connect(this.searchBoxObj.domNode, "onclick", this, function()
			{
				this.searchBoxObj.focus();
			});
			// WAI-ARIA role for searchbox set to role="search"
			if (this.searchBoxObj && this.searchBoxObj.domNode && this.searchBoxObj.domNode.children && this.searchBoxObj.domNode.children.length > 0)
			{
				dijit.setWaiRole(this.searchBoxObj.domNode.children[0], 'search');
				dijit.setWaiState(this.searchBoxObj.domNode.children[0], 'label', searchBoxTitle);
			}
		}

		// dojo.addClass(this.searchBoxObj.domNode,'clipperSearchBar');
		dojo.style(this.searchBoxObj.domNode, 'width', '100%');
	},

	//
	// Gets the user keystroke for the shared slide show dialog
	//
	getUserKeyStroke: function(searchBoxObj)
	{
		var text = searchBoxObj.getValue();
		// if (text.length>0){
		this.editorGrid.filter({
			displayName: "*" + text + "*"
		});
		this.updateBidiStylesIfRequired();
		// }
	},

	//
	// opens invitation for slide show coview. This is for users who have been invited to joing a shared slide show
	//
	openSlideShowCoviewInviteDialog: function(userObj)
	{
		// var tmStamp = new Date().getTime();
		// Before we open dialog let's see if the user has already joined or already has the dialog open
		if (this.ssCoviewDialog != null || this.slideShowInProgress())
		{
			return;
		}

		var widgetId = "P_d_slideShowCoview";
		var contentId = "P_d_slideShowCoview_MainDiv";
		var message = this.nls.slideShowInviteMsg;
		message = dojo.string.substitute(message, [userObj.getName()]);
		var title = this.nls.slideShowInviteTitle;

		this.ssCoviewDialog = new pres.widget.Dialog({
			'id': widgetId,
			'title': title,
			'aria-describedby': contentId,
			'content': "<div id='" + contentId + "' style='padding:15px;'> </div>",
			'presDialogHeight': (dojo.isIE) ? '194' : '197',
			'presDialogWidth': '360',
			// 'presDialogTop': (this.slideEditor.parentContainerNode.parentNode.offsetParent.offsetHeight / 2) - 115,
			// 'presDialogLeft': (this.slideEditor.parentContainerNode.parentNode.offsetParent.offsetWidth / 2) - 150,
			'heightUnit': 'px',
			'presModal': true,
			'destroyOnClose': true,
			'presDialogButtons': [{
				'label': this.editorStrings.ok,
				'id': 'ssCoview_okButton',
				'action': dojo.hitch(this, this.joinSharedSlideShow, userObj)
			}, {
				'label': this.editorStrings.cancel,
				'id': 'ssCoview_cancelButton',
				'action': dojo.hitch(this, function()
				{
					this.ssCoviewDialog = null;
				})
			}]
		});
		this.ssCoviewDialog.startup();
		this.ssCoviewDialog.show();
		// fix for defect 15588 need to move this to presentation.css
		this.ssCoviewDialog.domNode.style.backgroundColor = '#cccccc';
		// insert content to the dialog
		var dialogContentDiv = dojo.byId(contentId);
		var contentString = "<p>" + message + "</p>";
		dialogContentDiv.innerHTML = contentString;
		this.ssCoviewDialog.domNode.style.height = 'auto';

		setTimeout(function()
		{
			dialogContentDiv.parentNode.style.width = 'auto';
		}, 500);
	},

	//
	// Gets list of users selected from dialog
	//
	launchSlideShowForSelectedUsers: function(userList)
	{
		// var userList = window.pe.scene.editorGrid.selection.getSelected();
		var userList = [];
		var dlgNode = dojo.byId("P_d_slideShowCoviewSelectUsers_containerNode");
		if (dlgNode != null)
		{
			var sendToAllOption = dojo.query("#opt1", dojo.byId("P_d_slideShowCoviewSelectUsers_containerNode"));
			if (sendToAllOption && sendToAllOption.length > 0 && sendToAllOption[0].checked == true)
			{ // Let's send to all users
				userList = window.pe.scene.editors.getAllEditors().items;
				this.sssUserInviteeList = [];
				var thisId = this.authUser.getId();
				for ( var i = 0; i < userList.length; i++)
				{
					var id = userList[i].userId;
					if (id != thisId)
					{
						this.sssUserInviteeList.push(userList[i].userId); // Should update with all users
					}
				}
			}
		}

		// At this point this.sssUserInviteeList either has all users or selected users from dialog.

		var coView = true;
		var joiningCoViewInvite = false;
		this.launchSlideShow(null, coView, joiningCoViewInvite, this.authUser.getId());
		this.editorGrid.destroyRecursive();
		this.editorGrid = null;
	},

	//
	// Add Share Slide Show user list option
	//
	addSSSbar: function(ssWindow)
	{
		//
		// Let's add shared slide show bar
		//
		var ssDoc = ssWindow.document;
		var userDiv = ssDoc.createElement("div");
		userDiv.id = "userOption";
		userDiv.className = "userOption";
		var divHeight = this.userDivHeight = 40;
		dojo.style(userDiv, {
			"height": divHeight + "px",
			"marginTop": "0px",
			"backgroundColor": "#000000",
			"position": "relative",
			"opacity": "0",
			// "top":"-50px",
			"top": (ssWindow.ssObj.slideContainer.offsetHeight - divHeight) + "px",
			// "width":(ssWindow.ssObj.slideWidth+10)+"px"
			"width": (ssWindow.ssObj.slideContainer.offsetWidth + 2) + "px",
			"zIndex": 999999
		});

		// Add user image icon
		var imgUser = ssDoc.createElement("img");
		imgUser.className = "imgUserIcon";
		imgUser.src = window.contextPath + window.staticRootPath + "/images/editors32.png";
		dojo.attr(imgUser, 'title', this.nls.slideShowHoverMsg);
		dojo.attr(imgUser, 'alt', this.nls.slideShowHoverMsg);
		dojo.attr(imgUser, 'tabindex', 500);

		dojo.style(imgUser, {
			"cursor": "pointer",
			"position": "relative",
			"top": "5"
		});

		userDiv.appendChild(imgUser);

		// Add num of users in ss
		var span = ssDoc.createElement("span");
		dojo.style(span, {
			"color": "white",
			"fontFamily": "verdana",
			"paddingRight": "35px",
			"paddingLeft": "20px",
			"top": "-10px",
			"position": "relative",
			"fontWeight": "700"
		});
		span.className = "numViewers";

		window.pe.scene.setUserJoinNumber(span);

		userDiv.appendChild(span);

		// Add plus image icon
		var imgPlus = ssDoc.createElement("img");
		imgPlus.src = window.contextPath + window.staticRootPath + "/images/plus32.png";
		imgPlus.className = "imgPlusIcon";
		dojo.attr(imgPlus, 'title', this.nls.slideShowHoverMsgAdd);
		dojo.attr(imgPlus, 'alt', this.nls.slideShowHoverMsgAdd);
		dojo.attr(imgPlus, 'tabindex', 550);

		dojo.style(imgPlus, {
			"position": "relative",
			"cursor": "pointer",
			"top": "5"
		});

		userDiv.appendChild(imgPlus);

		dojo.connect(imgPlus, 'onclick', dojo.hitch(this, "openSlideShowCoviewInProgress", ssWindow, imgPlus));

		// Add span for slide number
		var sp = ssDoc.createElement("div");
		sp.id = "slideNumCoview";
		var message = this.nls.slideShowCoviewSlidesOf;
		message = dojo.string.substitute(message, [(parseInt(ssWindow.ssObj.currSlide) + 1) + "", ssWindow.ssObj.slides.length + ""]);
		sp.appendChild(ssDoc.createTextNode(message));
		dojo.style(sp, {
			"position": "relative",
			"color": "#FFFFFF",
			"fontFamily": "verdana",
			"float": "right",
			"top": "2px",
			"fontWeight": "700"
		});
		userDiv.appendChild(sp);

		ssDoc.body.appendChild(userDiv);
		// ssWindow.ssObj.slideContainer.style.height = dojo.style(ssWindow.ssObj.slideContainer, 'height') - dojo.style(userDiv,'height')+"px";

		dojo.connect(imgUser, 'onclick', dojo.hitch(this, "toggleUserList", ssDoc, userDiv));
		// dojo.connect(imgUser,'onmouseout',dojo.hitch(this,"closeUserList",ssDoc.body));

		if (window.pe.scene.userDivEvt1)
		{
			try
			{
				dojo.disconnect(window.pe.scene.userDivEvt1);
			}
			catch (e)
			{
				// console.log("Error disconnecting user option event");
			}
		}
		window.pe.scene.userDivEvt1 = dojo.connect(userDiv, 'onmouseover', dojo.hitch(this, function(userDiv)
		{
			dojo.style(userDiv, {
				"opacity": "1"
			});
		}, userDiv));

		if (window.pe.scene.userDivEvt2)
		{
			try
			{
				dojo.disconnect(window.pe.scene.userDivEvt2);
			}
			catch (e)
			{
				// console.log("Error disconnecting user option event2");
			}
		}

		window.pe.scene.userDivEvt2 = dojo.connect(userDiv, 'onmouseout', dojo.hitch(this, function(userDiv)
		{
			dojo.style(userDiv, {
				"opacity": "0"
			});
		}, userDiv));
	},

	//
	// Destroys user list
	//
	closeUserList: function(body)
	{
		var listDiv = dojo.query(".listDiv", body);

		if (listDiv != null && listDiv.length > 0)
		{
			dojo.destroy(listDiv[0]);
		}
	},

	//
	// Returns the number of users who joined this coview slide show
	//
	getUserJoinNumber: function()
	{
		var ct = 0;
		for ( var id in window.pe.scene.joinedMyCoview)
		{
			ct++;
		}
		return ct;
	},

	//
	// Has this user initiated a shared slideshow
	//
	hasSharedSlideShowStarted: function()
	{
		if (window.pe.scene.ssObject != null && window.pe.scene.ssObject.slideShowWindow != null && window.pe.scene.coView == true)
		{
			return true;
		}
		else
		{
			return false;
		}
	},

	//
	// Sets the number of user who joined this coview slide show
	// TODO: PERHAPS NEED TO UPDATE USER LIST AS WELL just in case user has list opened when another user joins
	//
	setUserJoinNumber: function(span)
	{
		var node = null;
		if (span != null)
		{
			node = span;
		}
		else if (window.pe.scene.hasSharedSlideShowStarted())
		{
			var n = dojo.query(".numViewers", window.pe.scene.ssObject.slideShowWindow.document.body);
			if (n != null && n.length > 0)
			{
				node = n[0];
			}
			else
			{
				return;
			}
		}
		if (node != null)
		{
			var num = window.pe.scene.getUserJoinNumber();
			var message = this.nls.slideShowCoviewViewers;
			message = dojo.string.substitute(message, [num]);
			node.innerHTML = message;
			// let's update the user list if it if up
			var listDiv = dojo.query(".listDiv", this.ssObject.slideShowWindow.document.body);
			if (listDiv && listDiv.length > 0)
			{
				window.pe.scene.openUserList(window.pe.scene.ssObject.slideShowWindow.document, listDiv[0].parentNode);
			}
		}
	},

	//
	// Opens/closes the user list in the sss bar
	//
	toggleUserList: function(ssDoc, userDiv, ev)
	{
		if (ev && ev.target && ev.target.className == "imgUserIcon")
		{
			dojo.stopEvent(ev);
		}

		var listDiv = dojo.query(".listDiv", this.ssObject.slideShowWindow.document.body);
		if (listDiv && listDiv.length > 0)
		{
			this.closeUserList((ssDoc) ? ssDoc.body : this.ssObject.slideShowWindow.document.body);
		}
		else
		{
			this.openUserList((ssDoc) ? ssDoc : this.ssObject.slideShowWindow.document, ev.target.parentNode);
		}
		return;
	},

	//
	// builds and opens the list
	//
	openUserList: function(ssDoc, userDiv)
	{
		// Let's close if it exists.
		// Clicking twice on the user img will act as a refresh

		this.closeUserList(ssDoc.body);

		// Create list Div
		var listDiv = ssDoc.createElement("div");
		listDiv.className = "listDiv";
		var color = "#101010";
		dojo.style(listDiv, {
			"height": "67px",
			"width": "170px",
			"position": "fixed",
			"top": "-137px", // this needs to be adjusted
			"border": "8px solid " + color,
			"backgroundColor": color,
			"padding": "3px",
			"borderRadius": "7px",
			"visibility": "hidden"
		});

		var innerDiv = ssDoc.createElement("div");
		innerDiv.className = "innerListDiv";

		dojo.style(innerDiv, {
			"backgroundColor": "#FFFFCC",
			"padding": "2px 10px",
			"borderRadius": "7px",
			"height": "auto"
		});

		// Let's get users who joined coview slide show
		for ( var id in this.joinedMyCoview)
		{
			var p = ssDoc.createElement("p");
			dojo.style(p, {
				// "backgroundColor":"transparent",
				"zIndex": "9999",
				"fontFamily": "Arial",
				"fontSize": "9pt"
			});
			var userName = pe.scene.getEditorStore().getEditorById(id).getName();
			p.appendChild(ssDoc.createTextNode(userName));
			p.style.backgroundColor = "transparent";
			innerDiv.appendChild(p);
		}

		listDiv.appendChild(innerDiv);

		userDiv.appendChild(listDiv);

		// Let's adjust heights
		var minHeight = 70; // min height of user list div
		var ssObj = window.pe.scene.ssObject;
		var ssWindowHeight = ssObj.getBrowserHeight(ssObj.slideShowWindow);
		// var slideContainerHeight = dojo.style(ssObj.slideContainer,'height');
		innerDiv.style.height = (dojo.style(innerDiv, 'height') < minHeight) ? minHeight + "px" : "auto";
		listDiv.style.height = "auto";
		listDiv.style.top = (userDiv.offsetTop - listDiv.offsetHeight) + "px";
		listDiv.style.visibility = "visible";

		if (listDiv.offsetHeight > ssWindowHeight)
		{
			innerDiv.style.height = (dojo.style(innerDiv, 'height') < minHeight) ? minHeight + "px" : (ssWindowHeight - 100) + "px";
			innerDiv.style.overflow = "auto";
			listDiv.style.top = (userDiv.offsetTop - listDiv.offsetHeight) + "px";
		}
	},

	//
	// Launch the presentation slideshow
	// if joiningCoViewInvite is true then userId is set to the user who sent the coview invite
	//
	launchSlideShow: function(fromCurrSlide, coView, joiningCoViewInvite, userId)
	{
		var joiningCoview = (joiningCoViewInvite != null) ? joiningCoViewInvite : false;
		if (coView != null)
		{
			window.pe.scene.coView = coView;
		}
		else
		{
			window.pe.scene.coView = false;
		}

		if (window.g_slideShowDataEvt)
		{
			dojo.unsubscribe(g_slideShowDataEvt);
		}
		g_slideShow = function(ssWindow)
		{

			// concord.util.uri.createScriptNode();
			var currentSlideIndex = 0;
			var sorter = pe.scene.slideSorter;
			if (fromCurrSlide)
			{
				if(sorter && sorter.selectedThumbs && sorter.selectedThumbs.length)
					currentSlideIndex = dojo.indexOf(pe.scene.doc.slides, sorter.selectedThumbs[0].slide);
			}
			var slideShow = this.pe.scene.ssObject = new pres.widget.SlideShow(ssWindow, currentSlideIndex);
			var sorter = pe.scene.slideSorter;

			ssWindow.onbeforeunload = function()
			{
				slideShow && slideShow.destroy();
			};
			this.slideShowObj = slideShow;
			ssWindow.focus();
			if (window.pe.scene.joinedOtherUserCoview != null)
			{ // joining another user's sss
				window.pe.scene.sendCoeditSlideShowCoViewJoin();
			}
			else if (window.pe.scene.coView == true)
			{ // hosting a sss
				window.pe.scene.sendCoeditSlideShowCoViewStart(slideShow.doc, slideShow.currSlide, this.pe.scene.sssUserInviteeList);
				window.pe.scene.addSSSbar(ssWindow); // Add shared slide show bar
			}
			dojo.publish("/slideshow/on", [true]);
			// concord.util.presToolbarMgr.toggleSlideShowButton('off');
		};

		closeSlideShow = function()
		{
			if (this.errorMessageDiv)
			{
				dojo.destroy(this.errorMessageDiv);
				this.errorMessageDiv = null;
			}
			if (this.slideShowObj.myRotator)
			{
				this.slideShowObj.myRotator.destroy();
			}
			// 15549 - when the slideshow window is closed and focus set back to scene, trying to resize window in IE has issue
			// need to reset ie validResize flag to true here to activate resize

			if (this != null && this.document != null && this.document.parentWindow != null && this.document.parentWindow.pe != null && this.document.parentWindow.pe.scene != null)
			{
				this.document.parentWindow.pe.scene.validResize = true;
			}
			var currentSlide = window.pe.scene.ssObject ? window.pe.scene.ssObject.currSlide : 0;
			if (!currentSlide)
				currentSlide = 0;
			window.pe.scene.ssObject = null;
			window.pe.scene.coView = false;
			window.pe.scene.sssUserInviteeList = []; // Clear selected users
			if (window.pe.scene.joinedOtherUserCoview != null)
			{
				window.pe.scene.sendCoeditSlideShowCoViewLeft();
				window.pe.scene.joinedOtherUserCoview = null;
			}
			else
			{
				if(window.pe.scene.session)
					window.pe.scene.sendCoeditSlideShowCoViewEnd();
			}
			dojo.publish("/slideshow/off", [false, currentSlide]);
			// concord.util.presToolbarMgr.toggleSlideShowButton('on');

		};

		// fix for defect 11927 after slideshow window is open ensure focus returns back to the sorter
		// TODO, BOB
		// dojo.byId(pe.scene.slideSorterContainerId).focus();
		// pe.scene.setFocusToSlideSorter();
		var ssWindow = null;
		var strssUrl = null;
		if (window.location.search)
		{
			if(window.location.search.indexOf("mode=compact") >= 0)
			{
				strssUrl = window.location.href.replace("mode=compact", "mode=slideshow").replace("&focusWindow=false", "").replace("focusWindow=false", "");
			}
			else
			{
				strssUrl = window.location.href + '&mode=slideshow';
				// fix for defect 12880, append to existing url query if one already exists
			}
		}
		else
		{
			strssUrl = window.location.href + '?mode=slideshow';
		}
		ssWindow = window.open(strssUrl, 'SlideShow', 'height=' + screen.height + ',width=' + screen.width);	
		ssWindow.focus();
		ssWindow.moveTo(0, 0);

		if (joiningCoview)
		{ // if joining coview we need to keep track of which user's slide show user is joining
			window.pe.scene.joinedOtherUserCoview = userId;
		}

		// 15549 - when the slideshow window is closed and focus set back to scene, trying to resize window in IE has issue
		// need to reset ie validResize flag to true here to activate resize

		this.validResize = true;
	},

	updateBidiStylesIfRequired: function()
	{
		var dir = BidiUtils.getTextDir();
		if (dir == '')
			return; // non-Bidi
		var users = dojo.query(".dojoxGridCell.defaultColumn", window.pe.scene.editorGrid.domNode);
		if (users && users.length > 0)
			for ( var i = 0; i < users.length; i++)
			{
				users[i].style.direction = (dir == 'contextual' ? BidiUtils.calculateDirForContextual(users[i].innerHTML) : dir);
			}
	}
});