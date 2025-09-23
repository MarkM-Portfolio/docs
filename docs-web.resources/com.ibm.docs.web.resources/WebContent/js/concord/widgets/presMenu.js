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
 * @presSource.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.presMenu");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.widgets.presMenu", dijit.Menu, {
	constructor: function(){
		//debugger;
	},
	_openMyself: function(args){
		// summary:
		//		Internal function for opening myself when the user does a right-click or something similar.
		// args:
		//		This is an Object containing:
		//		* target:
		//			The node that is being clicked
		//		* iframe:
		//			If an <iframe> is being clicked, iframe points to that iframe
		//		* coords:
		//			Put menu at specified x/y position in viewport, or if iframe is
		//			specified, then relative to iframe.
		//
		//		_openMyself() formerly took the event object, and since various code references
		//		evt.target (after connecting to _openMyself()), using an Object for parameters
		//		(so that old code still works).
		//extended from dijit.menu so that we open the popup around the target instead of mouse position

		var target = args.target,
			iframe = args.iframe,
			coords = args.coords;

		// Get coordinates to open menu, either at specified (mouse) position or (if triggered via keyboard)
		// then near the node the menu is assigned to.
		if(coords){
			if(iframe){
				// Specified coordinates are on <body> node of an <iframe>, convert to match main document
				var od = target.ownerDocument,
					ifc = dojo.position(iframe, true),
					win = this._iframeContentWindow(iframe),
					scroll = dojo.withGlobal(win, "_docScroll", dojo);
	
				var cs = dojo.getComputedStyle(iframe),
					tp = dojo._toPixelValue,
					left = (dojo.isIE && dojo.isQuirks ? 0 : tp(iframe, cs.paddingLeft)) + (dojo.isIE && dojo.isQuirks ? tp(iframe, cs.borderLeftWidth) : 0),
					top = (dojo.isIE && dojo.isQuirks ? 0 : tp(iframe, cs.paddingTop)) + (dojo.isIE && dojo.isQuirks ? tp(iframe, cs.borderTopWidth) : 0);

				coords.x += ifc.x + left - scroll.x;
				coords.y += ifc.y + top - scroll.y;
			}
		}else{
			coords = dojo.position(target, true);
			coords.x += 10;
			coords.y += 10;
		}

		var self=this;
		var savedFocus = dijit.getFocus(this);
		function closeAndRestoreFocus(){
			// user has clicked on a menu or popup
			if(self.refocus){
				dijit.focus(savedFocus);
			}
			dijit.popup.close(self);
		}
		/*
		dijit.popup.open({
			popup: this,
			x: coords.x,
			y: coords.y,
			onExecute: closeAndRestoreFocus,
			onCancel: closeAndRestoreFocus,
			orient: this.isLeftToRight() ? 'L' : 'R'
		});
		*/
		//changed to the following so that slide sorter context menu popup around the slide within viewport
		if(BidiUtils.isGuiRtl())
			dijit.popup.open({
				popup: this,
				x: dojo.byId("leftPanel").offsetLeft,
				y: coords.y,
				onExecute: closeAndRestoreFocus,
				onCancel: closeAndRestoreFocus,
				orient: this.isLeftToRight() ?
						{'TR': 'TL', 'TL': 'TR', 'BR': 'BL', 'BL': 'BR'} :
						{'TL': 'TR', 'TR': 'TL', 'BL': 'BR', 'BR': 'BL'}
			});
		else
			dijit.popup.open({
				popup: this,
				around:target,
				onExecute: closeAndRestoreFocus,
				onCancel: closeAndRestoreFocus,
				orient: this.isLeftToRight() ?
						{'TR': 'TL', 'TL': 'TR', 'BR': 'BL', 'BL': 'BR'} :
						{'TL': 'TR', 'TR': 'TL', 'BL': 'BR', 'BR': 'BL'}
			});

		this.focus();

		this._onBlur = function(){
			this.inherited('_onBlur', arguments);
			// Usually the parent closes the child widget but if this is a context
			// menu then there is no parent
			dijit.popup.close(this);
			// don't try to restore focus; user has clicked another part of the screen
			// and set focus there
		};
	}
	
});