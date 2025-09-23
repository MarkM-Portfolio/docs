/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2007, 2014                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",                            // mixin, hitch
	"dojo/_base/array",                           // forEach
	"dojo/query",
	"dojo/keys",
	"dojo/string",                                // substitute
	"dojo/on",                                    // once
	"dojo/dom-geometry",                          // position
	"dojo/dom-style",                             // getComputedStyle
	"dojox/validate/web",                         // isEmailAddress
	"dijit/form/ComboBox",
	"concord/widgets/typeahead/data/PeopleStore",
	"concord/widgets/typeahead/PeopleTypeAheadMenu",
	"dojo/text!concord/templates/PeopleTypeAhead.html",
	"dojo/NodeList-dom"                           // addClass
], function(dojoDeclare, dojoBase, dojoArray, dojoQuery, dojoKeys, dojoString, dojoOn, dojoGeometry, dojoStyle, dojoxValidate, dijitComboBox, bhcPeopleStore, bhcPeopleTypeAheadMenu, optionTemplate) {

	return dojoDeclare("concord.widgets.typeahead.PeopleTypeAhead", [dijitComboBox], {
		//
		// TODO:
		// - Add BiDi support from the previous PTA (not sure if this is required, as the current implementation of ComboBox includes this)
		// - Adjust the number of items to be displayed per page to the room available (requires UX approval)
		// - Add some useful debug information
		// - Add custom CSS classes (requires UX agreement)
		//
		// Known Issues:
		// - On home page, pressing arrow keys while no search results found message is displayed will show an error in the console
		//

		hasDownArrow: false,
		inline: false,
		multi: true,
		searchAttr: "e",
		valueAttr: "e",
		pageSize: 6,
		queryExpr: "${0}",
		searchDelay: 500,
		optionTemplate: optionTemplate.replace(/(<!--.*-->|\n|\r|\t)/gm, ""),
		helpText: "",
		headerMessage: "",

		constructor: function(parameters)
		{
			dojoBase.mixin(this, parameters);

			if (!this.store) {
				if (!this.url)
					throw "URL is missing and store was not provided";

				this.store = new bhcPeopleStore({"url": this.url});
			}
		},

		postMixInProperties: function()
		{
			if (!this.hasDownArrow) {
				this.baseClass = "dijitTextBox";
			}

			this.inherited(arguments);
		},

		buildRendering: function()
		{
			this.inherited("buildRendering", arguments);

			if (this.srcNodeRef.nodeName.toLowerCase() == "textarea") {  // TODO Is this really needed?
				// Node name
				this.srcNodeRef.setAttribute("name", this.name ? this.name : this.id);

				// ARIA
				this.srcNodeRef.setAttribute("role", "textbox");

				this.srcNodeRef.setAttribute("aria-haspopup"    , "true");
				this.srcNodeRef.setAttribute("aria-autocomplete", "list");

				// All the nodes should point to the source node
				this.domNode   = this.srcNodeRef;
				this.focusNode = this.srcNodeRef;
				this.textbox   = this.srcNodeRef;

				dojoQuery(this.srcNodeRef).addClass("dijitReset typeaheadInput");
			} else {
				dojoQuery(this.focusNode.parentNode).addClass(this.inline ? "typeaheadInputInline" : "typeaheadInput");
			}
		},

		postCreate: function()
		{
			this.inherited(arguments);
			this._setHasDownArrowAttr(this.hasDownArrow);

			if (this.helpText) {
				this.focusNode.value = this.helpText;

				dojoOn.once(this.focusNode, "focus", function() {
					this.value = "";
				});
			}
		},

		//
		// OVERRIDES
		//

		_startSearch: function(key) // From AutoCompleterMixin
		{
			if (this.multi) {
				var r = key.split(",");

				key = dojoString.trim(r[r.length - 1]);
			}

			if (key.length >= 2) {
				if (!this.dropDown) {
					this.dropDown     = new bhcPeopleTypeAheadMenu({"onChange": dojoBase.hitch(this, this._selectOption), "headerMessage": this.headerMessage});
					this._popupWidget = this.dropDown;
				}

				// Fix for Home Page
				if (this.searchTimer) {
					this.searchTimer = clearTimeout(this.searchTimer);
				}

				// If the active element is different from the focusNode, try to find a reference node to
				// position the popup
				if (document.activeElement != this.focusNode) {
					this.alternativeReferenceNode = dojoQuery("a[dojoattachpoint=linkNode]", document.activeElement)[0] || null;
				}

				this.inherited(arguments);
			} else if (this._opened) {
				this.closeDropDown(true);
			}
		},

		_announceOption: function(node) // From AutoCompleterMixin
		{
			if (node) {
				var v = this.focusNode.value;

				// If the active element is changed in some way (for example, IE set the focus on the
				// scrollbar when clicking it) this will not work, so probably this should be changed
				// to something like this.alternativeRefereceNode.setAttribute(...) if some day we
				// support JAWS + IE
				if (document.activeElement != this.focusNode)
					document.activeElement.setAttribute("aria-activedescendant", node.id);

				this.inherited(arguments);

				this.selectedItem    = this.item;
				this.focusNode.value = v; // TODO Is this required if we set autoComplete = false?

				// Force the caret to stay at the end of the focus node [140024]
				this._setCaretPos(this.focusNode, v.length);
			}
		},

		openDropDown: function() // From HasDropDown
		{
			this.inherited(arguments);

			this._isShowingNow = this._opened; // Required for Mentions

			if (this._opened) {
				// The following will break the "link" added by the inherited method between the ComboBox
				// and the ListBox, so the ListBox will be considered a separate ListBox when the focus
				// remains in the ComboBox
				this.domNode.removeAttribute("aria-owns");

				// In order to be RPT compliant, we should assign a label to the popup container; otherwise, an
				// identifier will be assigned, not useful for the JAWS user
				this.dropDown._popupWrapper.setAttribute("aria-label", "People TypeAhead Menu");

				if (this.store._items.length > 0) {
					this.dropDown.highlightFirstOption();

					this._announceOption(this.dropDown.selected);
				}
			}
		},

		closeDropDown: function() // From HasDropDown
		{
			// Fix for Home Page
			if (this.searchTimer) {
				this.searchTimer = clearTimeout(this.searchTimer);
			}

			this.inherited(arguments);

			// Remove the vertical overflow style as IE displays a disabled scrollbar if it is
			// not required (for example, for a new page being shown), also, restore the border
			// style if it was swapped from the DOM node to the Wrapper Node
			if (this.dropDown && this.dropDown._popupWrapper) {
				this.dropDown._popupWrapper.style.overflowY = "";

				if (this.borderStyle) {
					this.dropDown._popupWrapper.style.border = "none";
					this.dropDown.domNode.style.border       = this.borderStyle;

					delete this.borderStyle;
				}
			}

			// Once the dropdown is closed, remove the active descendant attribute, forcing
			// JAWS to refresh the active descendant node if the focus remains on the focus node 
			// and the dropdown is opened again
			this.focusNode.removeAttribute("aria-activedescendant");

			this._isShowingNow = this._opened; // Required for Mentions
		},

		_openResultList: function(results) // From AutoCompleterMixin
		{
			var bgIframe;

			// Required for Mentions
			this.results = results;

			if (results.length > 0) {
				this.inherited(arguments);

				// The ListBox should be included in a region to be RPT compliant
				this.dropDown._popupWrapper.setAttribute("role", "region");
			} else {
				this.dropDown.enableNoResultsMode();

				this._showResultList();

				// We have no results, be assertive and remove the label to avoid confusion to
				// the JAWS user (this is RPT compliant)
				this.dropDown._popupWrapper.setAttribute("role"      , "alert");
				this.dropDown._popupWrapper.setAttribute("aria-label", ""     );
			}

			// Removes the background inline frame as JAWS reads it when no search results are
			// found (JAWS bug?)
			bgIframe = dojoQuery("iframe", this.dropDown._popupWrapper)[0];
			bgIframe && bgIframe.parentNode.removeChild(bgIframe);

			if (this._opened) {
				this._fixPosition();
			}
		},

		_getMenuLabelFromItem: function(item) // From AutoCompleterMixin
		{
			var highlight = new RegExp("(" + this._lastInput + ")", "i");
			var innerHTML = dojoString.substitute(optionTemplate, {"p": item.i.p, "f": item.i.f.replace(highlight, "<b>$1</b>"), "occupation": item.i.j || item.i.c || "", "e": item.i.e.replace(highlight, "<b>$1</b>")});

			return {html: true, label: innerHTML};
		},

		_onKey: function(e) // From AutoCompleterMixin
		{
			var stopEvent         = false;

			var dropDown          = this.dropDown;
			var highlightedOption = dropDown ? dropDown.getHighlightedOption() : null;
			var currentPosition   = highlightedOption ? parseInt(highlightedOption.getAttribute('aria-posinset')) : null;

			if (currentPosition !== null) {
				var paginationInfo = dropDown.paginationInfo;

				switch (e.keyCode) {
					case dojoKeys.DOWN_ARROW:
						// Are we in the last element of the current page and not in the last page?
						if (currentPosition == paginationInfo.end && currentPosition < paginationInfo.totalNum) {
							stopEvent = true;

							dropDown.onPage(1);
						} else if (currentPosition == paginationInfo.totalNum)
							stopEvent = true;
						break;

					case dojoKeys.UP_ARROW:
						// Are we in the first element of the current page and not in the first page?
						if (currentPosition == paginationInfo.start && currentPosition > 1) {
							stopEvent = true;

							dropDown.onPage(-1);
						} else if (currentPosition == 1)
							stopEvent = true;
						break;

					case dojoKeys.PAGE_DOWN:
						// More pages availables?
						if (Math.ceil(currentPosition / this.pageSize) < Math.ceil(paginationInfo.totalNum / this.pageSize)) {
							dropDown.onPage(1);
						}

						// Override the default behavior (highlight Next, if any)
						stopEvent = true;
						break;

					case dojoKeys.PAGE_UP:
						// Aren't we in the first page?
						if (currentPosition > this.pageSize) {
							dropDown.onPage(-1);

							dropDown.highlightFirstOption();
							this._announceOption(dropDown.getHighlightedOption());
						}

						// Override the default behavior (highlight Previous, if any)
						stopEvent = true;
						break;

					case 188: // The default separator (,)
						this._selectOption(highlightedOption);

						// Override the default behavior
						stopEvent = true;
						break;

					default:
						break;
				}
			}

			if (!stopEvent) {
				this.inherited(arguments);

				// [139107] The input event is not available on IE8
				if (dojo.isIE == 8 && e.keyCode == 229) { // IME
					dojoOn.emit(this.textbox, "input", {
						bubbles    : true,
						cancelable : false,
						keyCode    : 229
					});
				}
			} else {
				e.stopPropagation();
				e.preventDefault ();
			}
		},

		_selectOption: function() // From AutoCompleterMixin, overriden only to trigger onSelectOption
		{
			this.inherited(arguments);

			this.onSelectOption();
		},

		//
		// API/INTEGRATION
		//

		newStore: function()
		{
			return this.store;
		},

		setInternalOnly: function(intent)
		{
			if (!this.store)
				throw "No store available";

			this.store.setInternalOnly(intent);

			if (this.externalAddButton) {
				this.externalAddButton.style.display = intent ? "none" : "inline";
			}
		},

		setHeaderMessage: function(message)
		{
			this.headerMessage = message;
		},

		clearHeaderMessage: function()
		{
			this.headerMessage = "";
		},

		getValueItems: function() // This function returns the selected item(s) on Communities/Activities/Files
		{
			var o = {"contacts": [], "users": [], "emails": []};
			var	r = this.focusNode.value.split(",");

			dojoArray.forEach(r, function(e) {
				if (e && dojoxValidate.isEmailAddress(e)) {
					var i = this.store.fetchItemByEmail(e);

					if (i) {
						var t = i.i[0] == "u" ? o.users : (i.i[0] == "c" ? o.contacts : null);

						if (t) {
							t.push({"i": i.i.substring(2), "e": i.e, "f": i.f, "o": i.o});
						}
					} else {
						o.emails.push(e);
					}
				}
			}, this);

			return o;
		},

		getItem: function() // This function returns the selected item(s) on Home Page
		{
			var i, m, r = null, o = this.getValueItems();

			var users    = o.users;
			var contacts = o.contacts;
			var emails   = o.emails;

			for (i = 0, m = users.length; i < m; i++) {
				r = {"userid": users[i].i, "name": users[i].f, "type": 0, "members": users[i].e};
			}

			for (i = 0, m = contacts.length; i < m; i++) { // TODO Is this really needed?
				this.textBoxValue = contacts[i].f + "<" + contacts[i].e + ">";
			}

			for (i = 0, m = emails.length; i < m; i++) { // TODO Is this really needed?
				this.textBoxValue = emails[i];
			}

			return r;
		},

		_hideResultList: function()
		{
			this.closeDropDown();
		},

		_onKeyPress: function(e)
		{
			this._onKey(e);
		},

		onSelectOption: function()
		{
			var m = this.focusNode.value.lastIndexOf(",");

			this.focusNode.value = this.multi ? ((m > 0 ? this.focusNode.value.substring(0, m + 1) : "") + this.selectedItem.i[this.valueAttr || this.searchAttr] + ", ") : this.selectedItem.i[this.valueAttr || this.searchAttr];

			// This is done in this way to prevent the default action for a possible event, as this
			// function - onSelectOption - could be triggered because an event
			setTimeout(dojo.hitch(this, "onSelect", this.selectedItem), 0);
		},

		onSelect: function()
		{
			// Just a callback
		},

		_fixPosition: function()
		{
			if (this.alternativeReferenceNode) {
				var pwNode = this.dropDown._popupWrapper;

				// Get the position/dimension of the popup wrapper and the alternative reference
				// node
				var pwBox  = dojoGeometry.position(pwNode                       , true);
				var arBox  = dojoGeometry.position(this.alternativeReferenceNode, true);

				/*
				 * FIX THE VERTICAL AXIS
				 */

				// Case 1: the popup wrapper top position is covering the alternative reference
				// node, so move down the popup wrapper
				if (pwBox.y > arBox.y && pwBox.y < arBox.y + arBox.h) {
					pwNode.style.top = (arBox.y + arBox.h) + "px";
				}

				// Case 2: the popup wrapper is above the alternative reference node but is covering
				// it, so if there is space move up the popup wrapper; otherwise, reduce the height
				// of the popup wrapper
				if (pwBox.y < arBox.y && pwBox.y + pwBox.h > arBox.y) {
					var spaceNeeded = pwBox.y + pwBox.h - arBox.y;

					if (dojoGeometry.position(pwNode, false).y - spaceNeeded > 0) {
						pwNode.style.top = (pwBox.y - spaceNeeded) + "px";
					} else {
						// In order to show a consistent PeopleTA when scrollbar is visible, we need to know exactly the
						// border top/bottom width
						var computedStyle = pwNode.style.overflowY != "scroll" ? dojoStyle.getComputedStyle(this.dropDown.domNode) : dojoStyle.getComputedStyle(pwNode);
						var borderStyle   = computedStyle.borderLeftWidth + " " + computedStyle.borderLeftStyle + " " + computedStyle.borderLeftColor;

						pwNode.style.height = (pwBox.h - spaceNeeded - ( parseInt(computedStyle.borderTopWidth) + parseInt(computedStyle.borderBottomWidth) )) + "px";

						// If the original view did not need scrollbar we need to update the vertical overflow
						// style and transfer the border from the DOM node to the Wrapper node
						if (pwNode.style.overflowY != "scroll") {
							this.borderStyle = borderStyle;

							pwNode.style.overflowY = "scroll";
							pwNode.style.border    = this.borderStyle;

							this.dropDown.domNode.style.border = "none";
						}
					}
				}
			}

			/*
			 * FIX THE HORIZONTAL AXIS
			 */

			// TODO For RTL, the popup widget (with results and no results) is misplaced, so it
			// should be fixed here
		}
	});

});
