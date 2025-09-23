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
 * @mSticky.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.mSticky");

dojo.declare("concord.widgets.mSticky", null, {
	slideSorter: null,
	slideEditor: null,
	slideComments: null,
	
	sticky: null,
	isStickyHidden: null,
	
	connectArray: [],
	
	// reference size used to find a good ratio between slide editor and sticky notes
	REF_WIDTH: 753, // slide editor width
	REF_HEIGHT: 553, // side editor height
	REF_SIZE: 250, // sticky notes width and height
	
	constructor: function(slideComments) {
		//console.log('MOBILE mSticky constructor');
		
		if (slideComments) {
			this.slideComments = slideComments;
			this.slideSorter = slideComments.slideSorter;
			this.slideEditor = slideComments.slideEditor;
		} else
			return null;
		
		this.init();
	},

    // Dynamically create sticky layer on top of slide editor
	init: function(){
		//console.log('MOBILE mSticky init');
		
		this.sticky = dojo.byId('concord_comment_sticky');
		if (!this.sticky) {
			var slideEditorW = parseFloat(this.slideEditor.mainNode.style.width);
			var slideEditorH = parseFloat(this.slideEditor.mainNode.style.height);
			
			var stickyW = (slideEditorW/this.REF_WIDTH)*this.REF_SIZE;
			var stickyH = (slideEditorH/this.REF_HEIGHT)*this.REF_SIZE;
			
			// add sticky element as child of slideEditor/ child of draw_page/ sibling of draw_frame
			this.sticky = document.createElement('div');
			this.sticky.id = 'concord_comment_sticky';
			this.slideEditor.maxZindex += 10;
			dojo.style(this.sticky,{
				'position': 'absolute',
				'top': '0',
				'right': '0',
				'zIndex': this.slideEditor.maxZindex,
				'width': concord.util.browser.isMobile() ? '250px' : stickyW + 'px',
				'height': concord.util.browser.isMobile() ? '250px' : stickyH + 'px',
				'margin': concord.util.browser.isMobile() ? '-37px -5px auto' : '-21px -5px auto',
				'backgroundColor': '#f4ea7a',
				'border': '1px solid #eaca37'
			});
			
			// add sticky bgr
			var stickybgr = document.createElement('div');
			dojo.style(stickybgr,{
				'position': 'absolute',
				'width': concord.util.browser.isMobile() ? '250px' : '100%',
				'height': concord.util.browser.isMobile() ? '220px' : '92%',
				'margin': concord.util.browser.isMobile() ? '30px auto' : '8% auto',
				'backgroundColor' : '#fef698',
				'border': '1px #eaca37'
			});
			this.sticky.appendChild(stickybgr);
			
			// add sticky form and textarea
			var stickyform = document.createElement('form');
			stickyform.setAttribute('id', 'concord_comment_sticky_form');
			var stickytext = document.createElement('textarea');
			stickytext.setAttribute('id', 'concord_comment_sticky_text');
			stickytext.setAttribute('rows', '12');
			dojo.style(stickytext,{
				'position': 'absolute',
				'width': concord.util.browser.isMobile() ? '230px' : '92%',
				'height': concord.util.browser.isMobile() ? '200px' : '84%',
				'margin': concord.util.browser.isMobile() ? '40px 10px 10px 10px' : '12% 4% 4% 4%',
				'backgroundColor' : '#fef698',
				'border': '1px #eaca37',
				'overflow': 'hidden'
			});
			stickyform.appendChild(stickytext);
			this.sticky.appendChild(stickyform);

			// add sticky hide action
			var stickyhide = document.createElement("a");
			stickyhide.setAttribute("id", "concord_comment_sticky_hide");		
			var stickyhideicon = document.createElement("img");
			stickyhideicon.setAttribute( 'src', window.contextPath + window.staticRootPath + '/images/comment_note_minus.png' );
			stickyhide.appendChild(stickyhideicon);
			stickyhide.setAttribute("href", "#");
			dojo.style(stickyhideicon,{				
				'height': concord.util.browser.isMobile() ? '16px' : '12px',
				'width': concord.util.browser.isMobile() ? '16px' : '12px',
				'marginTop': concord.util.browser.isMobile() ? '5px' : 'auto',
				'marginRight': '5px',
				'float': 'right'
			});
			this.sticky.appendChild(stickyhide);

			this.slideEditor.mainNode.appendChild(this.sticky);
			
			// disconnect listeners
			for (var i=0; i<this.connectArray.length; i++) {
	            dojo.disconnect(this.connectArray[i]);       
			}
			this.connectArray = [];
			
			// attach event listener to hide
			this.connectArray.push(dojo.connect(stickyhide, "onclick", dojo.hitch(this, "hide")));
			// attach event listener to prevent content overflow
			this.connectArray.push(dojo.connect(stickytext, "onkeypress", dojo.hitch(stickytext, function(e){				  
				if (e.keyCode != dojo.keys.DELETE && e.keyCode != dojo.keys.BACKSPACE){
					var lines = 0;
                	var prevMarker = 0;
                	var currMarker = stickytext.value.indexOf('\n'); 
                	if (currMarker == -1) {	// prevent single line from going over 250 chars 
                		if (stickytext.value.length > 250) {
                			stickytext.value = stickytext.value.substr(0,stickytext.value.length);
                			dojo.stopEvent(e);
                		}
                	} else {	// prevent from going over 10 lines (11 depending on character width, line wrap is counted as line)
                    	while (currMarker > prevMarker) {
                    		var linesToAdd = Math.ceil((currMarker - prevMarker)/26);
                    		prevMarker = currMarker;
                    		currMarker = stickytext.value.indexOf('\n', prevMarker+1);
                    		lines += linesToAdd; 
                    		if (e.keyCode == dojo.keys.ENTER && lines >= 10) {
                        		dojo.stopEvent(e);
                        		break;
                			} else if (e.keyCode != dojo.keys.ENTER && lines >= 10) {
                				stickytext.value = stickytext.value.substr(0,stickytext.value.length); 
                				var idx = stickytext.selectionStart;
                				if (idx < stickytext.value.length) {
                					var str = stickytext.value;
                					var strToIdx = str.substring(0, idx);
                					var prevN = strToIdx.lastIndexOf('\n');
                					var nextN = str.indexOf('\n', idx);
                					if ((nextN - prevN) > 25) {
                						dojo.stopEvent(e);
                						stickytext.value = str.slice(0, idx) + str.slice(idx, str.length);
                            			stickytext.selectionStart = stickytext.selectionEnd = idx;
                            		}
                				} else {
                					if ((stickytext.value.length - prevMarker) > 25) {
                						dojo.stopEvent(e);
                    					var str = stickytext.value;
                            			stickytext.value = str.slice(0, idx) + str.slice(idx+1, str.length);
                            			stickytext.selectionStart = stickytext.selectionEnd = idx;
                					}
                        		}
                				break;
                			}
                    	}
                	}
                }              	
            })));
			
			this.isStickyHidden = false;
		}
		
		// hide sticky
		this.hide();
	},
	
	// show sticky
	show: function() {
		if (!this.sticky)
			return;

		//console.log('MOBILE mSticky show');
		
		dojo.style(this.sticky,{
			'visibility': 'visible'
		});
		
		var stickytext = dojo.byId('concord_comment_sticky_text');
		if (stickytext && this.slideComments.getMode() == this.slideComments.EDIT_MODE) {
			stickytext.focus();
		}	
		
		this.isStickyHidden = false;
	},
	
	// hide sticky
	hide: function() {
		if (!this.sticky)
			return;

		//console.log('MOBILE mSticky hide');
		
		dojo.style(this.sticky,{
			'visibility': 'hidden'
		});
		this.isStickyHidden = true;
		
		this.slideComments.initNoteIcon();
	},

	// return sticky data 
	getContent: function() {
		//console.log('MOBILE mSticky getContent');
		
		if (!this.sticky)
			return "";

		var content = null;
		var stickytext = dojo.byId('concord_comment_sticky_text')
		if (stickytext)
			content = stickytext.value;
		
		return content;
	},
	
	// render the passed in content on stickypad
	setContent: function(content) {
		//console.log('MOBILE mSticky setContent');
		
		var stickytext = dojo.byId('concord_comment_sticky_text');
		if (stickytext)
			stickytext.value = content;
	},
	
	// clear sticky content
	clear: function() {
		//console.log('MOBILE mSticky clear');
		
		var stickytext = dojo.byId('concord_comment_sticky_text');
		if (stickytext)
			stickytext.value = null;
	},
	
	// when resizing manually (mouse drag), let's wait for all resize events to end before we resize
	resizestart: function() {
		//console.log('MOBILE mSticky resizestart');

		var slideComments = window.pe.scene.slideComments;
		if (slideComments && slideComments.getContainer() && slideComments.getContainer().getNote()) {
		    clearTimeout(slideComments.getContainer().getNote().doResize);
		    slideComments.getContainer().getNote().doResize = setTimeout(function() {
		    	window.pe.scene.slideComments.getContainer().getNote().resize();
		    }, 100);	    
		}
	},

	// resize sticky (used in desktop)
	resize: function() {
		//console.log('MOBILE mSticky resize');

		var slideEditorW = parseFloat(this.slideEditor.mainNode.style.width),
			slideEditorH = parseFloat(this.slideEditor.mainNode.style.height);
		
		var validSize = !isNaN(slideEditorW) && !isNaN(slideEditorH);
		
		if (this.sticky && validSize) {
			var newW = (slideEditorW/this.REF_WIDTH)*this.REF_SIZE;
			var newH = (slideEditorH/this.REF_HEIGHT)*this.REF_SIZE;
			dojo.style(this.sticky,{
				'width': newW > this.REF_SIZE ? this.REF_SIZE : newW + 'px',
				'height': newH > this.REF_SIZE ? this.REF_SIZE : newH + 'px'
			});
	    }
	},
	
	// housekeeping
	destroy: function() {
		//console.log('MOBILE mSticky destroy');

		// disconnect listeners
		for (var i=0; i<this.connectArray.length; i++) {
            dojo.disconnect(this.connectArray[i]);       
		}
		this.connectArray = null;
       
		dojo.destroy(this.sticky);
		
		this.slideSorter = null;
		this.slideEditor = null;
		this.slideComments = null;
		this.sticky = null;
		this.isStickyHidden = null;
	}
});