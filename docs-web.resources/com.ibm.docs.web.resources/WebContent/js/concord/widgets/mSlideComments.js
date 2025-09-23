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

/*
 * @mSlideComments.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.mSlideComments");
dojo.require("concord.widgets.mSlide");
dojo.require("concord.widgets.mOfflineComment");

dojo.requireLocalization("concord.widgets","mSlideComments");

dojo.declare("concord.widgets.mSlideComments", null, {
	slideEditor: null,
	slideSorter: null,

	store: null,	// comment store
	listener: null,
	
	container: null,	// comment container (mCanvas | mSticky) can contain draft or comment

	commentIndex: null,
	
	slides: null,	// associative array of mSlide
	
	mode: null,	// view | edit

	noEditLayer: null,
	
    noteIcon: null,
    noteIconConnect: null,
	
	initialized: false,
	
	draftStrokeColor: null,
	draftStrokeWidth: null,
	
	offlineContent: null,	// used to update downloaded content.html
	offlineNew: null,	// associative array of new comments created while offline
	offlineDeleted: null,	// associative array of comments deleted while offline
	
	VIEW_MODE: 'view',
	EDIT_MODE: 'edit',
	
	constructor: function(store, slideSorter, slideEditor) {
		//console.log('MOBILE mSlideComments constructor');
		
		if (!store || !slideSorter || !slideEditor)
			return null;
		
		if (store)
			this.store = store;
		
		if (slideSorter)
			this.slideSorter = slideSorter;
		
		if (slideEditor)
			this.slideEditor = slideEditor;;
		
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","mSlideComments");
			
		this.init();
	},

	init: function() {
		//console.log('MOBILE mSlideComments init');
		
		this.listener = window.pe.scene;
		
		this.slides = [];
		
		this.commentsIndex = 0;

		this.addSlide(new concord.widgets.mSlide(this.slideEditor.mainNode.id));
	
		this.noEdit();
		
		// offline
		if (concord.util.browser.isMobile() && this.isOffline()) {
			this.initOffline();
		}
		
		this.initialized = true;
	},
	
	// initialize offline data
	initOffline: function() {
		this.offlineContent = this.getOfflineContent();
		this.offlineNew = this.getOfflineNew();
		this.offlineDeleted = this.getOfflineDeleted();
	},
	
	isOffline: function() {
		if (window.pe.scene.isOffline != null && window.pe.scene.isOffline())
			return true;
		else
			return false;
	},
	
	isInitialized: function() {
		if (this.initialized != null && this.initialized == true)
			return true;
		return false;
	},
	
	isActive: function() {
		if (this.isInitialized() && this.mode != null)
			return true;
		return false;
	},
	
	// create a layer over everything to prevent editing
	noEdit: function() {
		//console.log('MOBILE mSlideComments noEdit');
		
		this.noEditLayer = dojo.byId('concord_comment_noedit');
		if (!this.noEditLayer) {
			this.noEditLayer = document.createElement('div');
			this.noEditLayer.id = 'concord_comment_noedit';
			this.slideEditor.mainNode.appendChild(this.noEditLayer);
			window.pe.scene.slideEditor.maxZindex += 15;
			dojo.style(this.noEditLayer,{
				'position': 'absolute',
				'top': '0px',
				'left': '0px',
				'zIndex': window.pe.scene.slideEditor.maxZindex,
				'width': this.slideEditor.mainNode.style.width,
				'height': this.slideEditor.mainNode.style.height,
				'visibility': 'hidden'
			});
		}
	},
	
	// show noEditLayer
	startNoEdit: function() {
		//console.log('MOBILE mSlideComments startNoEdit');
		
		if (this.noEditLayer)
			dojo.style(this.noEditLayer,{
				'visibility': 'visible'
			});
	},
	
	// hide noEditLayer
	stopNoEdit: function() {
		//console.log('MOBILE mSlideComments stopNoEdit');
		
		if (this.noEditLayer)
			dojo.style(this.noEditLayer,{
				'visibility': 'hidden'
			});
	},
	
	// switch to view mode
	view: function(commentId, expand) {
		//console.log('MOBILE mSlideComments view');
		
		// change native bar layout
		if (concord.util.browser.isMobile()) window.pe.scene.enterCommentingViewMode();
		
		this.resetContainer();
		
		// enable noEdit
		if (!this.noEditLayer)
			this.noEdit();
		this.startNoEdit();

		this.mode = this.VIEW_MODE;
		
		// delete slide comment icon
		this.slideEditor.deleteSlideCommentIcon();
		
		// reload all comments every time we switch to view mode
		this.load(commentId, expand);
	},
	
	// switch to edit mode
	edit: function() {
		//console.log('MOBILE mSlideComments edit');
		
		// change native bar layout
		if (concord.util.browser.isMobile()) window.pe.scene.enterCommentingEditMode();
		
		// disable noEdit
		this.stopNoEdit();

		this.mode = this.EDIT_MODE;
		
		if (!this.container) {
			this.container = new concord.widgets.mCanvas(this);
		}
		
		this.container.clear();
		
		this.container.show();
		
		// delete slide comment icon
		this.slideEditor.deleteSlideCommentIcon();
		
		this.deleteNoteIcon();
	},
	
	// return authenticated user object
	getUser: function() {
		//console.log('MOBILE mSlideComments getUser');
		
		var org = window.pe.scene.authUser.getOrgId();
		var uid = window.pe.scene.authUser.getId();
		var name = window.pe.scene.authUser.getName();
		
		var user = {'org':org,'uid':uid,'name':name};
		
		return user;
	},

	// return active mode (view | edit)
	getMode: function() {
		//console.log('MOBILE mSlideComments getMode: ' + this.mode);

		return this.mode;
	},

	// return active container (mCanvas | mSticky) can contain draft or comment
	getContainer: function() {
		//console.log('MOBILE mSlideComments getContainer');

		return this.container;
	},

	// reset active container (mCanvas | mSticky)
	resetContainer: function() {
		//console.log('MOBILE mSlideComments resetContainer');
		
		dojo.destroy(this.noEditLayer);	// noEditLayer is 'attached' to draw_page so we need to destroy so it can be recreated when needed
		this.noEditLayer = null;
		
		this.commentsIndex = 0;
		
		if (this.container) {
			this.container.destroy();
			this.container = null;
		}
	},
	
	// clear current slide content
	clearDraft: function() {
		//console.log('MOBILE mSlideComments clearDraft');

		if (this.container)
			this.container.clear();

		// update slides[]
		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);
		if (slide == undefined)
			slide = new concord.widgets.mSlide(slideId);
		slide.setDraft(null);
		slide.setDraftNote(null);
		slide.setUndo([]);
		this.addSlide(slide);
	},

	// save current slide content
	saveDraft: function() {
		//console.log('MOBILE mSlideComments saveDraft');
		
		if (this.container){
			var slideId = this.slideEditor.mainNode.id;

			var slide = this.getSlide(slideId);
			if (slide == undefined)
				slide = new concord.widgets.mSlide(slideId);

			var updateSlide = false;
			
			if (this.container.hasDrawing == true) {
				//console.log('MOBILE mSlideComments saveDraft - save canvas');
				var draft = this.container.getContent();
				slide.setDraft(draft);
				updateSlide = true;
			}

			if (this.container.getNote()) {
				var draftNote = this.container.getNote().getContent();
				if (draftNote && dojo.trim(draftNote).length > 0) {
					//console.log('MOBILE mSlideComments saveDraft - save note');
					slide.setDraftNote(draftNote);
					updateSlide = true;
				}
			}	

			if (updateSlide == true)
				this.addSlide(slide);
		}
	},
	
	// render draft of current slide
	loadDraft: function() {
		//console.log('MOBILE mSlideComments loadDraft');
		
		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);

		if (slide == undefined)
			slide = new concord.widgets.mSlide(slideId);
		this.addSlide(slide);

		if (slide != undefined && (slide.getDraft() || slide.getDraftNote())) {
			// if draft exists then switch to edit mode and load draft
			this.edit();
			
			if (slide.getDraft()) {
				//console.log('MOBILE mSlideComments loadDraft - load canvas');
				this.container.setContent(slide.getDraft());
			}
			
			if (slide.getDraftNote() && dojo.trim(slide.getDraftNote()).length > 0) {
				//console.log('MOBILE mSlideComments loadDraft - load note');
				this.container.getNote().show();
				this.container.getNote().setContent(slide.getDraftNote());
			}
		} else if (this.getMode() == this.EDIT_MODE) {
			// otherwise switch to edit mode
			this.edit();
		} else {
			// or view mode
			this.view();
		}
	},
	
	// commit [draft of] all slides to comments store
	save: function() {
		//console.log('MOBILE mSlideComments save');

		var user = this.getUser();
		
		for (var i in this.slides) {
			var png = this.slides[i].getDraft();
			var content = this.slides[i].getDraftNote();
			if (content && dojo.trim(content).length <= 0)
				content = null;
			
			if (png && !content)
				content = this.STRINGS.slideCommentAdded;
			
			// if no canvas or note content then skip
			if (!png && !content) {
				//console.log('MOBILE mSlideComments save - no data to save, skip');
				continue;
			}
			
			var e = concord.xcomments.CommentItem.createItem(content, user, null, png);
			//var xCommentItem = new concord.xcomments.CommentItem(xComment);
			 
			// commit to comment store
			//console.log('MOBILE mSlideComments save - commit to store');
			var comment = null;
			if (concord.util.browser.isMobile() && this.isOffline()) {				
				comment = new concord.xcomments.Comments(null);
				comment.appendItem(e);
				//console.log("MOBILE WRITE to offline: " + comment.getId());
			} else {				
				comment = this.store.add(e);
				setTimeout(dojo.hitch(this.listener,this.listener.commentsAdded,comment) ,30);
				//console.log("MOBILE WRITE to store: " + comment.getId());
			}
			
			// used the returned comment and update slides[]
			var slideId = this.slides[i].getId();
			var comments = this.slides[i].getComments();
			// add returnedComment to comments
			if (!comments)
				comments = [];
			comments.push(comment);
			this.slides[i].setComments(comments);
			
			// add to DOM
			this.addSlideCommentToSlideDom(slideId, comment.getId());
	
			if (concord.util.browser.isMobile() && this.isOffline()) {
				this.addOfflineNew(comment.getId(), slideId, content, png);
			}
			
			// clear draft and undo
			this.slides[i].setDraft(null);
			this.slides[i].setDraftNote(null);
			this.slides[i].setUndo([]);
		}		
	},
  	
	// update slide's commentsId attribute on DOM
	addSlideCommentToSlideDom: function(slideId, commentId, synchOffline) {
		//console.log('MOBILE mSlideComments addSlideCommentToSlideDom');
		
		// get the slide from sorter
		var slideElem = this.slideSorter.getSlideById(slideId);
		if (slideElem) {
			// add new comment to slide's commentsId attribute
			var domCommentsId = [];
			var oldDomCommentsId = slideElem.getAttribute('commentsId');	
			if (oldDomCommentsId) {
				oldDomCommentsId = dojo.trim(oldDomCommentsId);
				if (oldDomCommentsId.length > 0 && oldDomCommentsId != '' && oldDomCommentsId != 'false')
					domCommentsId = oldDomCommentsId.split(',');
			}	
			domCommentsId.push(commentId);
			var newDomCommentsId = domCommentsId.toString();
			
			// update slide
			var msgPairList = [];
			msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'commentsId', newDomCommentsId, msgPairList);									
			// update slide sorter doc
			slideElem.setAttribute('commentsId', newDomCommentsId);
			// update slide editor as well
			this.slideEditor.mainNode.setAttribute('commentsId', newDomCommentsId);
			if (synchOffline != null && synchOffline == true)
				msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'comments', 'true', msgPairList,'forceUpdate');									
			else
				msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'comments', 'true', msgPairList);									
			
			// update slide sorter doc
			slideElem.setAttribute('comments', 'true');
			// update slide editor as well
			this.slideEditor.mainNode.setAttribute('comments', 'true');
			// no need to update online content and other sessions when offline
			if (!concord.util.browser.isMobile() || !this.isOffline()) {
				SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
				// tells other clients to add comment icon node
				createAddMobileCommentMsg = function(elemId){		
					var msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.addSlideComment,[]);
					msgPair.msg.elemId = elemId;	
					return msgPair;		                                    
				};

				var addCommentMsg = createAddMobileCommentMsg(slideId);	
				var anotherMsgList  = [];
				anotherMsgList.push(addCommentMsg);	
				var addToUndo = false;
				anotherMsgList[0] = SYNCMSG.addUndoFlag(anotherMsgList[0],addToUndo); 
				SYNCMSG.sendMessage(anotherMsgList, SYNCMSG.NO_LOCAL_SYNC);
			}
		}
	},
	
	// load all comments of active slide from comments store
	load: function(commentId, expand) {
		//console.log('MOBILE mSlideComments load');
		
		// dojo.query all commentId of active slide
		var slideId = this.slideEditor.mainNode.id;
		var commentsIdString = this.getCommentsFromDom(slideId);
		var commentsId = [];
		if (commentsIdString) {
			commentsIdString = dojo.trim(commentsIdString);
			if (commentsIdString.length > 0 && commentsIdString != '' && commentsIdString != 'false')		
				commentsId = commentsIdString.split(',');	
		}
		
		if (commentsId.length > 0) {
			var slideId = this.slideEditor.mainNode.id;
			var slide = this.getSlide(slideId);
			if (slide == undefined)
				slide = new concord.widgets.mSlide(slideId);
			
			var comments = [];
			
			// load from comment store
			for (var i=0; i<commentsId.length; i++) {
				var comment = this.store.get(commentsId[i]);
				if (comment && comment.id != undefined) {
					//console.log("MOBILE FOUND in store: " + commentsId[i]);
					comments.push(comment);
				} else {
					//console.log("MOBILE NOT FOUND in store: " + commentsId[i]);
					if (concord.util.browser.isMobile() && this.isOffline()) {
						// load from new-offline-comments on disk
						if (!this.offlineNew)
							this.offlineNew = this.getOfflineNew();
						
						var comment = this.offlineNew[commentsId[i]];
						if (comment) {
							//console.log("MOBILE FOUND in new-comments.json: " + commentsId[i]);
							// convert from offline comment to concord comment
							var e = concord.xcomments.CommentItem.createItem(comment.getContent(), this.getUser(), null, comment.getImg());
							var o = new concord.xcomments.Comments(null);
							o.id = comment.getId();
							o.appendItem(e);
							// and add to array
							comments.push(o);
						}
					}
				}	
			}
			
			// update slides[] and display
			if (comments.length > 0) {
				slide.setComments(comments);
				this.addSlide(slide);
				
				if (commentId) {
					// show requested comment
					for (var i=0; i<comments.length; i++) {
						if ( comments[i].getId() == commentId ) {
							this.commentsIndex = i;
							break;
						}
					}		
				} else {
					// show last comment
					this.commentsIndex = comments.length-1							
				}	
				
				this.display(comments[this.commentsIndex], expand);
			}
		}
	},
	
	// return slide's commentsId attribute value from DOM
	getCommentsFromDom: function(slideId) {
		//console.log('MOBILE mSlideComments getCommentsFromDom');
		
		// get the slide from sorter
		var slideElem = this.slideSorter.getSlideById(slideId);
		if (!slideElem)
			return null;
		
		var commentsId = slideElem.getAttribute('commentsId');

		return commentsId;
	},
	
	// return number of comments of active slide
	getCount: function() {
		//console.log('MOBILE mSlideComments getCount');
		
		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);
		if (slide == undefined)
			return 0;
		
		var comments = slide.getComments();
		if (comments)
			return comments.length;
		
		return 0;
	},
	
	// return the comment being displayed on screen
	getComment: function() {
		//console.log('MOBILE mSlideComments getComment');
		
		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);
		if (slide == undefined)
			return null;
		
		var comments = slide.getComments();
		if (comments)
			return comments[this.commentsIndex];
		
		return null;
	},
	
	// delete active comment of active slide
	remove: function() {
		//console.log('MOBILE mSlideComments remove');

		if (!this.slideEditor)
			this.slideEditor = window.pe.scene.slideEditor;
		
		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);
		if (slide == undefined)
			slide = new concord.widgets.mSlide(slideId);
		var comments = slide.getComments();
		
		var comment = comments[this.commentsIndex];
		var commentId = comment.getId();
		
		// delete from comment store if online
		if (!concord.util.browser.isMobile() || !this.isOffline()) {
			//console.log("MOBILE DELETE from store: " + commentId);
			this.store.remove(commentId);
			setTimeout(dojo.hitch(this.listener,this.listener.commentsRemoved,commentId) ,30);
		}
		
		// delete from comments
		comments.splice(this.commentsIndex, 1);
		
		// update slides[]
		slide.setComments(comments);
		this.addSlide(slide);

		// delete from DOM
		//this.removeCommentsFromDom(slideId, commentId);
		this.slideEditor.removeSlideCommentFromSlideDom(slideId, commentId);

		if (concord.util.browser.isMobile() && this.isOffline()) {
			//console.log("MOBILE WRITE to delete-comments.json: " + commentId);
			this.addOfflineDeleted(commentId, slideId);
		}
		
		if (comments.length == 0) {
			if (concord.util.browser.isMobile()) {
				this.view();
				this.initNoteIcon();
			} else {	// deprecated	
				this.slideEditor.exitSlideComment();
			}
		} else {
			// if deleting last comment, show prev
			if (this.commentsIndex > comments.length-1) {
				this.commentsIndex--;
			}
			
			this.display(comments[this.commentsIndex]);
		}
	},
	
	// deprecated - moved to slideEditor
	// remove passed-in commentId from slide's commentsId attribute on DOM
	removeCommentsFromDom: function(slideId, commentId) {
		//console.log('MOBILE mSlideComments removeCommentsFromDom');
		
		// get the slide from sorter
		var slideElem = this.slideSorter.getSlideById(slideId);
		if (slideElem) {
			// remove comment from slide's commentsId attribute
			var domCommentsId = [];
			var oldDomCommentsId = slideElem.getAttribute('commentsId');
			if (oldDomCommentsId) {
				oldDomCommentsId = dojo.trim(oldDomCommentsId);
				if (oldDomCommentsId.length > 0 && oldDomCommentsId != '' && oldDomCommentsId != 'false')
					domCommentsId = oldDomCommentsId.split(',');
			}
			var deleteIndex = -1;
			for (var i=0; i<domCommentsId.length; i++) {
				if (domCommentsId[i] == commentId) {
					deleteIndex = i;
					break;
				}
			}
			if (deleteIndex > -1)
				domCommentsId.splice(deleteIndex, 1);
			var newDomCommentsId = null;
			if (domCommentsId.length == 0)
				newDomCommentsId = 'false';
			else
				newDomCommentsId = domCommentsId.toString();
			
			// update slide
			var msgPairList = [];
			msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'commentsId', newDomCommentsId, msgPairList);									
			slideElem.setAttribute('commentsId', newDomCommentsId);
			// update slide editor as well
			this.slideEditor.mainNode.setAttribute('commentsId', newDomCommentsId);
			// set comments to false if no comment
			if (domCommentsId.length == 0) {
				msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'comments', 'false', msgPairList);									
				slideElem.setAttribute('comments', 'false');	
				// update slide editor as well
				this.slideEditor.mainNode.setAttribute('comments', 'false');
			}
			SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
			
			// tells other clients to remove slide comment icon if no comment
			if (domCommentsId.length == 0) {
				createDelMobileCommentMsg = function(elemId){		
					var msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.delSlideComment,[]);
					msgPair.msg.elemId = elemId;	
					return msgPair;		                                    
				};

				var delCommentMsg = createDelMobileCommentMsg(this.slideEditor.mainNode.id);
				var anotherMsgList  = [];
				anotherMsgList.push(delCommentMsg);	
				var addToUndo = false;
				anotherMsgList[0] = SYNCMSG.addUndoFlag(anotherMsgList[0],addToUndo); 
				SYNCMSG.sendMessage(anotherMsgList, SYNCMSG.NO_LOCAL_SYNC);
			}
		}
	},

	// display passed-in comment (xcomments.CommentItem)
	display: function(comment, expand) {
		//console.log('MOBILE mSlideComments display');
		
		if (!this.container) {
			this.container = new concord.widgets.mCanvas(this);
		}
		
		var canvasData = comment.getItem(0).getImgUrl();
		if (canvasData) {
			this.container.setContent(canvasData);
			if (comment && concord.util.browser.isMobile()) {
				if (this.isOffline()) {
					this.container.info = dojo.byId('concord_comment_info');
					if (!this.container.info)
						this.container.buildInfo();
					this.container.info.innerHTML = '';	// TODO: nls localized
				} else {
					this.container.setInfo(comment);
				}
			}
		} else
			this.container.clearCanvas();

		this.container.show();
		
		var noteData = comment.getItem(0).getContent();
		if (noteData && dojo.trim(noteData).length > 0 && noteData != this.STRINGS.slideCommentAdded) {
			this.addNote();
			this.container.getNote().setContent(noteData);
			if (comment && concord.util.browser.isMobile()) {
				if (this.isOffline()) {
					this.container.info = dojo.byId('concord_comment_info');
					if (!this.container.info)
						this.container.buildInfo();
					this.container.info.innerHTML = '';	// TODO: nls localized
				} else {
					this.container.setInfo(comment);
				}
			}
		} else {
			this.container.getNote().clear();
			this.container.getNote().hide();
		}

		if (!concord.util.browser.isMobile()) {
			// update navigation buttons state
			if (this.commentsIndex == 0) {
				var scAction = dojo.byId('concord_sc_prev');
				if (scAction) {
					dojo.style(scAction,{
						opacity:0.4
					});
				}
				
				if (this.commentsIndex < this.getCount()-1) {
					scAction = dojo.byId('concord_sc_next');
					if (scAction) {
						dojo.style(scAction,{
							opacity:1
						});
					}
				}
			}
			
			if (this.commentsIndex == this.getCount()-1) {
				scAction = dojo.byId('concord_sc_next');
				if (scAction) {
					dojo.style(scAction,{
						opacity:0.4
					});
				}
				
				if (this.commentsIndex > 0) {
					var scAction = dojo.byId('concord_sc_prev');
					if (scAction) {
						dojo.style(scAction,{
							opacity:1
						});
					}
				}
			}
			
			if (this.commentsIndex > 0 && this.commentsIndex < this.getCount()-1) {
				var scAction = dojo.byId('concord_sc_prev');
				if (scAction) {
					dojo.style(scAction,{
						opacity:1
					});
				}
				
				scAction = dojo.byId('concord_sc_next');
				if (scAction) {
					dojo.style(scAction,{
						opacity:1
					});
				}
			}
			
			if (expand == null)
				expand = true;	// by default we expand
			
			if (expand == true) {
				// expand comment in comment pane
				var commentId = comment.getId();
				this.slideEditor.expandSlideComment(commentId);	
			}
		}
		
		this.initNoteIcon();
	},
	
	// show next comment
	next: function() {
		//console.log('MOBILE mSlideComments next');
		
		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);
		if (slide == undefined)
			slide = new concord.widgets.mSlide(slideId);
		var comments = slide.getComments();
		this.commentsIndex++;
		
		if (this.commentsIndex > comments.length-1) {
			this.commentsIndex = comments.length-1;
		} else {
			this.display(comments[this.commentsIndex]);
		}
	},
	
	// show prev comment
	prev: function() {
		//console.log('MOBILE mSlideComments prev');
	
		this.commentsIndex--;
		
		if (this.commentsIndex < 0) {			
			this.commentsIndex = 0;
		} else {
			var slideId = this.slideEditor.mainNode.id;
			var slide = this.getSlide(slideId);
			if (slide == undefined)
				slide = new concord.widgets.mSlide(slideId);
			var comments = slide.getComments();
			
			this.display(comments[this.commentsIndex]);
		}
	},
	
	// return slide of given id
	getSlide: function(slideId) {
		//console.log('MOBILE mSlideComments getSlide');

		return this.slides[slideId];
	},
	
	// add passed-in slide to slides[]
	addSlide: function(slide) {
		//console.log('MOBILE mSlideComments addSlide');

		this.slides[slide.getId()] = slide;
	},
	
	// remove slide of given id from slides[] 
	removeSlide: function(slideId) {
		//console.log('MOBILE mSlideComments removeSlide');

		delete this.slides[slideId];
	},

	// add to undo stack of current slide
	addUndo: function(data) {
		//console.log('MOBILE mSlideComments addUndo');

		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);
		if (slide == undefined)
			slide = new concord.widgets.mSlide(slideId);
		var undo = slide.getUndo();
		if (!undo)
			undo = [];
		undo.push(data);
		slide.setUndo(undo);
		this.addSlide(slide);
	},
	
	// perform undo operation
	undoDraft: function() {
		//console.log('MOBILE mSlideComments undoDraft');
		
		var slideId = this.slideEditor.mainNode.id;
		var slide = this.getSlide(slideId);
		if (slide == undefined)
			slide = new concord.widgets.mSlide(slideId);
		var undo = slide.getUndo();
		
		if (undo && undo.length > 0) {
			var data = undo.pop();
			
			// set data from undo as content 
			if (data) {
				this.container.setContent(data);
			}
				
			// update slides[]
			if (undo.length == 0)
				undo = null;
			slide.setUndo(undo);
			this.addSlide(slide);
		}
	},

	// instantiate note
	addNote: function() {
		//console.log('MOBILE mSlideComments addNote');

		if (this.container) {
			
			if (!this.container.note)
				this.container.note = new concord.widgets.mSticky(this);
			
			this.container.note.show();
		}
	},
	
	// check whether current slide has note
	hasNote: function() {
		//console.log('MOBILE mSlideComments hasNote');
		
		if (this.container && this.container.getNote() 
				&& this.container.getNote().getContent() && dojo.trim(this.container.getNote().getContent()).length > 0)
			return true;
		return false;
	},

	// return the note icon node
	getNoteIcon: function() {
		//console.log('MOBILE mSlideComments getNoteIcon');
		
		var ic = dojo.query(".slidenote",this.slideEditor.mainNode)[0];
		return ic;
	},
	
	// init note icon node
	initNoteIcon: function() {
		//console.log('MOBILE mSlideComments initNoteIcon');
		
		if (this.hasNote()) {
			this.addNoteIcon();
		} else {
			this.deleteNoteIcon();
		}
	},

	// add note icon on top right
	addNoteIcon: function() {
		//console.log('MOBILE mSlideComments addNoteIcon');
		
		var ic = this.getNoteIcon();
		if (!ic) {
			ic = this.noteIcon = document.createElement('img');
			ic.id = 'ic_'+this.slideEditor.mainNode.id;
			dojo.addClass(ic,'slidenote');
			ic.src = window.contextPath + window.staticRootPath + '/images/comment_note_plus.png';
			var STRINGS = dojo.i18n.getLocalization("concord.widgets","contentBox");
			dojo.attr(ic,'title',STRINGS.tooltip_comment);
			this.slideEditor.mainNode.appendChild(ic);
		}
			    
		dojo.style(ic,{
			'position':'absolute',
			'right': '0',
			'margin': concord.util.browser.isMobile() ? '-37px auto' : '-21px auto',
			'width': concord.util.browser.isMobile() ? "32px" : "16px",
			'height': concord.util.browser.isMobile() ? "32px" : "16px",
			'border':'none',
			'cursor':'pointer'
		});		
		
		this.noteIconConnect = dojo.connect(ic,'onclick', dojo.hitch(this,'addNote'));
	},
	
	// delete note icon from top right
	deleteNoteIcon: function() {
		//console.log('MOBILE mSlideComments deleteNoteIcon');
		
		var ic = this.getNoteIcon();
		if (ic) 
			dojo.destroy(ic);
	},
	
	// change container stroke color
	setDraftStrokeColor: function(value) {
		this.draftStrokeColor = value;
		
		this.container.setStrokeColor(this.draftStrokeColor);
	},
	
	// change container stroke color
	setDraftStrokeWidth: function(value) {
		this.draftStrokeWidth = value;
		
		this.container.setStrokeWidth(this.draftStrokeWidth);
	},
	
	// TODO: deprecated - returns content of downloaded content.html
	getOfflineContent: function() {
		return this.slideSorter.getSlideSorterPresContentHtml();
	},

	// update content of downloaded content.html
	setOfflineContent: function() {
		var htmlString = '<html>' + this.slideSorter.getSorterDocumentContent() + '</html>';
		this.runPostOffline("setOfflineContent", htmlString);
	},

	// return content of new-offline-comments.json as associative array
	getOfflineNew: function() {
		//console.log("MOBILE getOfflineNew");
		var offlineNew = [];
		var offlineNewJson = [];
		try {
			offlineNewJson = dojo.fromJson(this.getOfflineNewFromDisk());
		} catch (error) {
			console.log('Invalid JSON');
			offlineNewJson = [];
		}
		for (var i=0;i<offlineNewJson.length;i++) {
			var offlineComment = new concord.widgets.mOfflineComment(offlineNewJson[i].id, offlineNewJson[i].slideId, offlineNewJson[i].content, offlineNewJson[i].img);
			offlineNew[offlineComment.getId()] = offlineComment;
		}	
		return offlineNew;
	},
	
	// return content of new-offline-comments.json
	getOfflineNewFromDisk: function() {
		//console.log("MOBILE getOfflineNewFromDisk");
		var offlineString = this.runGetOffline("getNewOfflineComments");
		var offlineJson = '';
		try {
			offlineJson = dojo.toJson(offlineString);
		} catch (error) {
			console.log('Invalid JSON');
			offlineJson = '';
		}
		//console.log("MOBILE getNewOfflineComments: " + offlineJson)
		return offlineJson;
	},
	
	// update content of new-offline-comments.json from associative array
	setOfflineNew: function() {
		//console.log("MOBILE setOfflineNew");
		var offlineNew = [];
		for (var i in this.offlineNew) {
			var id = this.offlineNew[i].getId();
			var slideId = this.offlineNew[i].getSlideId();
			var content = this.offlineNew[i].getContent();
			var img = this.offlineNew[i].getImg();
			offlineNew.push({"id":id,"slideId":slideId,"content":content,"img":img});
		}	
		this.setOfflineNewToDisk(dojo.toJson(offlineNew));
	},
	
	// actual update of  content of new-offline-comments.json
	setOfflineNewToDisk: function(jsonString) {
		//console.log("MOBILE setOfflineNewToDisk");
		this.runPostOffline("setNewOfflineComments", jsonString);
	},
	
	// add new offline comment to associative array
	addOfflineNew: function(id, slideId, content, img) {
		var offlineComment = new concord.widgets.mOfflineComment(id, slideId, content, img);
		
		if (!this.offlineNew)
			this.offlineNew = this.getOfflineNew();
		
		this.offlineNew[offlineComment.getId()] = offlineComment;
		
		this.setOfflineNew();
		this.setOfflineContent();
	},
	
	// return content of delete-offline-comments.json as associative array
	getOfflineDeleted: function() {
		//console.log("MOBILE getOfflineDeleted");
		var offlineDeleted = [];
		var offlineDeletedJson = [];
		try {
			offlineDeletedJson = dojo.fromJson(this.getOfflineDeletedFromDisk());
		} catch (error) {
			console.log('Invalid JSON');
			offlineDeletedJson = [];
		}
		for (var i=0;i<offlineDeletedJson.length;i++) {
			var offlineComment = new concord.widgets.mOfflineComment(offlineDeletedJson[i].id, offlineDeletedJson[i].slideId, null, null);
			offlineDeleted[offlineComment.getId()] = offlineComment;
		}	
		return offlineDeleted;
	},
	
	// return content of delete-offline-comments.json
	getOfflineDeletedFromDisk: function() {
		//console.log("MOBILE getOfflineDeletedFromDisk");
		var offlineString = this.runGetOffline("getDeletedOfflineComments");
		var offlineJson = '';
		try {
			offlineJson = dojo.toJson(offlineString);
		} catch (error) {
			console.log('Invalid JSON');
			offlineJson = '';
		}
		//console.log("MOBILE getDeletedOfflineComments: " + offlineJson)
		return offlineJson;
	},
	
	// update content of delete-offline-comments.json from associative array
	setOfflineDeleted: function() {
		//console.log("MOBILE setOfflineDeleted");
		var offlineDeleted = [];
		for (var i in this.offlineDeleted) {
			var id = this.offlineDeleted[i].getId();
			var slideId = this.offlineDeleted[i].getSlideId();
			var content = null;
			var img = null;
			offlineDeleted.push({"id":id,"slideId":slideId,"content":content,"img":img});
		}	
		this.setOfflineDeletedToDisk(dojo.toJson(offlineDeleted));
	},

	// actual update content of delete-offline-comments.json
	setOfflineDeletedToDisk: function(jsonString) {
		//console.log("MOBILE setOfflineDeletedToDisk");
		this.runPostOffline("setDeletedOfflineComments", jsonString);
	},
	
	// add deleted offline comment to associative array
	addOfflineDeleted: function(commentId, slideId) {
		var offlineComment = new concord.widgets.mOfflineComment(commentId, slideId, null, null);
		
		if (!this.offlineDeleted)
			this.offlineDeleted = this.getOfflineDeleted();
		
		this.offlineDeleted[offlineComment.getId()] = offlineComment;
		
		this.setOfflineDeleted();
		
		// remove from this.offlineNew
		delete this.offlineNew[offlineComment.getId()];
		this.setOfflineNew();
		
		this.setOfflineContent();
	},
	
	// get dojo xhr that will be intercepted by the iOS native offline code
	runGetOffline: function(api) {	
  		//var servletUrl = window.contextPath + "/api/" + api;
  		var servletUrl = window.contextPath + "/app/doc/" + window.pe.scene.bean.getRepository() + "/" + window.pe.scene.bean.getUri() + "/api/" + api;
  		//console.log("MOBILE servletUrl: " + servletUrl);
  		var response = null;
  		
  		dojo.xhrGet({
  			url:servletUrl,
  			handleAs: "json",
  			handle: function(r, io) {
  				response = r;
  			},
  			error: function(error) {
  				response = null;
  				//console.log('An error occurred:' + error);
  			},
  			sync: true
  		});
  	
  		return (response != null && response != '' ? response : '');
  	},
  	
	// post dojo xhr that will be intercepted by the iOS native offline code
	runPostOffline: function(api, data) {	
  		//var servletUrl = window.contextPath + "/api/" + api;
  		var servletUrl = window.contextPath + "/app/doc/" + window.pe.scene.bean.getRepository() + "/" + window.pe.scene.bean.getUri() + "/api/" + api;
  		//console.log("MOBILE servletUrl: " + servletUrl);
  		var response = '';
  		
  		dojo.xhrPost({
  			url:servletUrl,
  			handleAs: "json",
  			load: function(r) {
  				response = r;
  			},
  			error: function(error) {
  				response = null;
  				//console.log('An error occurred:' + error);
  			},
  			sync: false,
  			contentType: "text/plain",
  			postData: data
  		});

  		return response;
  	},
  	
	// commit the comments created and deleted while offline
  	synchOffline: function() {
  		var user = this.getUser();
  		var synchOffline = true;

		newCommentsString = this.getOfflineNewFromDisk();
		deletedCommentsString = this.getOfflineDeletedFromDisk();
		
		// commit new comments
		var offlineNewJson = [];
		try {
			offlineNewJson = dojo.fromJson(newCommentsString);
		} catch (error) {
			console.log('Invalid JSON');
			offlineNewJson = [];
		}
		for (var i=0;i<offlineNewJson.length;i++) {
			//var commentId = offlineNewJson[i].id;	// comment store will generate new id for the committed comment
			var slideId = offlineNewJson[i].slideId;
			var content = offlineNewJson[i].content;
			var img = offlineNewJson[i].img;

			// add to comment store
			var e = concord.xcomments.CommentItem.createItem(content, user, null, img);	
			var comment = this.store.add(e);
			setTimeout(dojo.hitch(this.listener,this.listener.commentsAdded,comment) ,30);
			//console.log("MOBILE SYNC add to store: " + comment.getId());
			//console.log("MOBILE SYNC with content: " + content);

			// since we are updating the online content.html
			// we need to remove the offline generated ID from DOM
			var commentId = offlineNewJson[i].id;
			if (commentId != null && commentId != undefined && slideId != null && slideId != undefined) {
				console.log("MOBILE SYNC remove prev " + commentId + " from slide DOM: " + slideId);
				window.pe.scene.offline = true;
				this.slideEditor.removeSlideCommentFromSlideDom(slideId, commentId, synchOffline);
				window.pe.scene.offline = false;
			}
			
			// add to DOM
			this.addSlideCommentToSlideDom(slideId, comment.getId(), synchOffline);
			//console.log("MOBILE SYNC add new " + comment.getId() + " to slide DOM: " + slideId);
		}
		this.setOfflineNewToDisk("");
		
		// commit deleted comments
		var offlineDeletedJson = [];
		try {
			offlineDeletedJson = dojo.fromJson(deletedCommentsString);
		} catch (error) {
			console.log('Invalid JSON');
			offlineDeletedJson = [];
		}
		for (var i=0;i<offlineDeletedJson.length;i++) {
			var commentId = offlineDeletedJson[i].id;
			var slideId = offlineDeletedJson[i].slideId;

			if (commentId != null && commentId != undefined && slideId != null && slideId != undefined) {
				// remove from comment store
				//console.log("MOBILE SYNC remove from store: " + commentId);
				this.store.remove(commentId);
				setTimeout(dojo.hitch(this.listener,this.listener.commentsRemoved,commentId) ,30);
				
				// delete from DOM
				//console.log("MOBILE SYNC remove " + commentId + " from slide DOM: " + slideId);
				var synchOffline = true;
				this.slideEditor.removeSlideCommentFromSlideDom(slideId, commentId, synchOffline);				
			}
		}
		this.setOfflineDeletedToDisk("");
	},
	
	// exit comment mode
	exit: function(saveDraft) {
		//console.log('MOBILE mSlideComments exit');
		
		if (saveDraft == null)
			saveDraft = true;	// by default we save
		
		if (this.mode == this.EDIT_MODE && saveDraft == true) {
			// save draft
			this.saveDraft();
			
			// commit all drafts to comment store
			this.save();
		}
		
		this.deleteNoteIcon();
		
		this.slideEditor.initSlideCommentIcon();
		
		this.destroy();
	},

	// housekeeping
	destroy: function() {
		//console.log('MOBILE mSlideComments destroy');

		if (this.container)
			this.container.destroy();

		dojo.destroy(this.noEditLayer);

		dojo.destroy(this.noteIcon);
		
		dojo.disconnect(this.noteIconConnect);
		
		this.slideEditor = null;
		this.slideSorter = null;
		this.store = null;
		this.listener = null;
		this.container = null; 
		this.commentIndex = null;
		this.slides = null;
		this.mode = null;
		this.noEditLayer = null;
		this.noteIcon = null;
		this.noteIconConnect = null;
		this.initialized = false;
	}
});