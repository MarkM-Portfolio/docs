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

/**
 * author: yindali@cn.ibm.com
 * This is an enhanced version of dijit.form.ComboBox. dijit.form.ComboBox has some UI defects on
 * different browser. So here I inherit the ComboBox.js and overwrite the fix onto the function
 */

dojo.provide("concord.widgets.EnhancedComboBox");
dojo.require("dijit.form.ComboBox");
dojo.declare(
		"concord.widgets.EnhancedComboBox", 
		[dijit.form.ComboBox],
		{
 
			_showResultList: function(){
				this._hideResultList();
				this._arrowPressed();
				// hide the tooltip
				this.displayMessage("");

				// Position the list and if it's too big to fit on the screen then
				// size it to the maximum possible height
				// Our dear friend IE doesnt take max-height so we need to
				// calculate that on our own every time

				// TODO: want to redo this, see
				//		http://trac.dojotoolkit.org/ticket/3272
				//	and
				//		http://trac.dojotoolkit.org/ticket/4108


				// natural size of the list has changed, so erase old
				// width/height settings, which were hardcoded in a previous
				// call to this function (via dojo.marginBox() call)
				dojo.style(this._popupWidget.domNode, {width: "", height: ""});

				var best = this.open();
				if ( window.g_presentationMode){
					// fix for defect 9421 presentations modifies parent z-index popup needs to be updated too
					var maxZIndex = concord.util.dialogs.getMaxZindex();
					dojo.style(this._popupWidget.domNode.parentNode, 'zIndex', maxZIndex + 1);
				}
				// #3212:
				//		only set auto scroll bars if necessary prevents issues with
				//		scroll bars appearing when they shouldn't when node is made
				//		wider (fractional pixels cause this)
				var popupbox = dojo.marginBox(this._popupWidget.domNode);
				this._popupWidget.domNode.style.overflow =
					((best.h == popupbox.h) && (best.w == popupbox.w)) ? "hidden" : "auto";
				// #4134:
				//		borrow TextArea scrollbar test so content isn't covered by
				//		scrollbar and horizontal scrollbar doesn't appear
				var newwidth = best.w;
				if(best.h < this._popupWidget.domNode.scrollHeight){
					newwidth += 16;
				}
				
				// #3506
				//		on Webkit browser such as Safari and Google Chrome, dojo computes the height list menu is less by one row.
				//		if there is only one row available, the data will be covered by the scrollbar. So for the webkit browser we add height of the listmenu. 
				var newheight = best.h;
				if (dojo.isWebKit) {
					newheight += 16;
				}
				//////////////
				
				dojo.marginBox(this._popupWidget.domNode, {
					h: newheight,
					w: Math.max(newwidth, this.domNode.offsetWidth)
				});
				
				// If we increased the width of drop down to match the width of ComboBox.domNode,
				// then need to reposition the drop down (wrapper) so (all of) the drop down still
				// appears underneath the ComboBox.domNode
				if(newwidth < this.domNode.offsetWidth){
					this._popupWidget.domNode.parentNode.style.left = dojo.position(this.domNode).x + "px";
				}

				dijit.setWaiState(this.comboNode, "expanded", "true");
			}
		});