(function() {
	dojo.provide("lconn.oneui.controls.AutocompleteMenu");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	
	dojo.require("dojo.i18n");
	dojo.requireLocalization("lconn.oneui.controls", "AutocompleteMenu");
	
    var dk = dojo.keys;
    var KEY_RIGHT_ARROW = dk.RIGHT_ARROW;
    var KEY_LEFT_ARROW = dk.LEFT_ARROW;
    var KEY_DOWN_ARROW = dk.DOWN_ARROW;
    var KEY_UP_ARROW = dk.UP_ARROW;
    var KEY_PAGE_UP = dk.PAGE_UP;
    var KEY_PAGE_DOWN = dk.PAGE_DOWN;
    var KEY_HOME = dk.HOME;
    var KEY_END = dk.END;
    var KEY_ENTER = dk.ENTER;
    var KEY_ESCAPE = dk.ESCAPE;
    
	var messages = dojo.i18n.getLocalization("lconn.oneui.controls", "AutocompleteMenu");
	
	/**
	 * Implement a popup menu that accepts events from an AutocompleteInput.  Handles
	 * selection management, click events on the menu that do not steal focus from
	 * the input, and keyboard input.  Delegates most rendering to the templateNode
	 * on the dijit template, and to the updateItem() method.  Requires a conforming
	 * dojo.data.api.Read data store to send the appropriate events (see 
	 * AutocompleteDataStore for an implementation that provides many standard 
	 * behaviors).
	 * 
	 * Similar to dijit.form.ComboBox, but offers a more complete solution that does
	 * not depend on other dijit.form implementations.
	 * 
	 * DOM nodes created as children of the menu may have a number of expando properties
	 * that are used as optimizations.  They are:
	 * 		_item
	 * 			This is a DOM node that represents an item from the datastore.  Item will
	 * 			be passed to the select() method on click or on ENTER  
	 * 		_itemId
	 * 			This is a key that uniquely pairs this DOM node to a data store object.
	 * 			Used to efficiently reuse DOM nodes across renderings in a single
	 * 			viewing.  If not set, all DOM nodes are recreated every time onItem is called.
	 * 		_ignoreHide  
	 * 			When set on a child of this.listNode, the node will not be hidden by a call
	 * 			to _hideExcept(...).
	 * 		_top
	 * 			If set to 1, this is considered a top level selectable item.  Only selectable
	 * 			items should ever have this property.
	 * 
	 * DOM nodes created as children of the menu may have the following attributes:
	 * 		clickMethod (function(node, event) {})
	 * 			If this node also has the "_selectable" marker class, then invoke this method
	 * 			when the user hits ENTER while the item is selected or clicks in the menu.
	 * 			The method must return true if it wishes the ENTER key to be prevented from
	 * 			submitting the input (only methods that are menu only navigation should do this,
	 * 			like paging).   
	 * 
	 * TODO: Accessibility (announce selected item)
	 * TODO: Suggest page size based on window
	 * TODO: fix positioning issues (focus on positioning below? and scrolling?)
	 */
	dojo.declare("lconn.oneui.controls.AutocompleteMenu", [dijit._Widget, dijit._Templated], {
		messages: messages,
		templatePath: dojo.moduleUrl("lconn.oneui", "controls/templates/AutocompleteMenu.html"),
		showing: false,

		// hideOnSelect: bool
		//		When the user selects an item, hide the menu
		hideOnSelect: true,
		
		// takeEventOnSelect: bool (default true)
		//		When the user selects an item using the keyboard, prevent the input from being
		//		notified of that keystroke.  Set to false if you want hitting ENTER on a menu item
		//		to change the value of the input and then trigger a form submit.
		takeEventOnSelect: true,

		// store: implements dojo.data.api.Read 
		//		The data store used by the input control.  Data store may be passed the queryOption
		//		immediate to indicate the request should take place immediately.
		store: null,
		
		// pageSize: int (optional)
		//		If specified, requests made to the data store will be paged.
		pageSize: null,
		
		// parent: dijit._Widget
		//		The parent widget (for popup behavior)
		parent: null,
		// around: DOM node
		//		The DOM node to open around (for popup behavior)
		around: null,
		
		// idProperty: string
		//		If specified, DOM nodes will be reused if the id of an existing DOM element
		//		matches a new item returned by the data store.
		idProperty: null,
		
		selectedClass: "dijitMenuItemSelected", 

		/**
		 * Mark selectable nodes with the '_top' expando property and verify any selectable
		 * nodes also have the clickMethod set
		 */
		postCreate: function() {
			// purge top level whitespace
			var child = this.listNode.firstChild;
			var next;
			while (child) {
				next = child.nextSibling;
				if (child.nodeType != 1)
					child.parentNode.removeChild(child);
				child = next;
			}
		},
		
		/**
		 * Invoked when the input receives a click event (see AutocompleteInput for
		 * more information on when this is invoked).
		 */
		onInputClick: function() {
			return !this.showing;
		},
		
		/**
		 * Invoked when the input receives a key event.
		 * 
		 * @return true if the input should ignore this keypress
		 */
		onInputKeypress: function(key, event, w) {
			var takeEvent = false;
			if (this.showing) {
				// Escape should close the popup, but we shouldn't take the event so
				// that the input control can terminate any inflight requests
				if (key == KEY_ESCAPE || (key == KEY_LEFT_ARROW || key == KEY_RIGHT_ARROW || key == KEY_HOME || key == KEY_END))
					this.hide();
				else {
					takeEvent = true;
					// paging should function regardless of whether the user is currently 
					// searching so that the user can rapidly scan the list (if you hit
					// PAGE_UP a search begins, but if you hit it a second time we should
					// try to jump to the previous page without a delay for the search to
					// complete).
					if (key == KEY_PAGE_DOWN)
		        		this.nextPage();
					else if (key == KEY_PAGE_UP)
		        		this.previousPage();
					// when an active search is running, the down arrow should reset the list to 
					// the "loading" state and select the first item, and any other input should
					// purge the selection.  We also define a special "_rendering" state between
					// when the first item is rendered and when rendering completes - this allows
					// partial results to be keyboard navigable
					else if (w.isSearching() && !this._rendering) {
						// we leave the event to be processed by the input control
			        	takeEvent = false;
						if (key == KEY_DOWN_ARROW) {
							this.loading();
							this.next();
						}
						else {
							// navigation keys have no effect while querying
							if (key == KEY_UP_ARROW || key == KEY_PAGE_DOWN || key == KEY_PAGE_UP)
								takeEvent = true;
							this.clearSelect();
						}
					}
					// when not searching, allow keyboard navigation to change the selected item
					else {
						if (key == KEY_UP_ARROW)
			        		this.previous();
						else if (key == KEY_DOWN_ARROW)
			        		this.next();
						else if (key == KEY_ENTER) {
							// The select method can choose to take the event or not, generally it
							// should only take the event when the selection is an internal menu
							// action.  If we do take the event, it's our responsibility to stop
							// the ENTER action.
							takeEvent = this.select();
							if (takeEvent)
								dojo.stopEvent(event);
						}
						else {
							this.clearSelect(); // any other input should clear the current focus
							takeEvent = false;
						}
					}
				}
			}
			// when the menu is not showing and the user hits down, display the menu in the loading
			// state
			else if (key == KEY_DOWN_ARROW) {
				this.loading();
				this.show();
				this.next();
			}
			return takeEvent;
		},
		
		/**
		 * Invoked when the input receives a blur event.
		 */
		onInputBlur: function() {
			this.hide();
		},
		
		/**
		 * Invoked to give the renderer the opportunity to mutate the
		 * query before it is sent to the data store.  Do not override
		 * abort() or the other callbacks on the request here.
		 * 
		 * The default implementation sets the page size for requests
		 * roughly use the available window spacing.
		 */
		onBeforeRequest: function(kwArgs) {
			if (!(kwArgs.count > 0))
				kwArgs.count = this.pageSize;
		},
		
		/**
		 * Invoked by the autocomplete input only on IE 6-8,
		 * allows us to prevent focus from being lost when a user
		 * clicks in the menu.
		 */
		onBeforeDeactivate: function(event) {
			if (dojo.isDescendant(event.toElement, this.domNode))
				dojo.stopEvent(event);
		},

		/**
		 * Fired when an item in the menu is selected
		 * 
		 * @param item (Object)
		 * 		An object representing the selected node
		 * @param store (dojo.data.api.Read)
		 * 		The data store that returned the selected node object.
		 */
		onSelect: function(item, store) {
			if (this.hideOnSelect)
				this.hide();
			console.log("selected", item);
		},
		
		/**
		 * Invoked when a request has begun.  Copies information from
		 * kwArgs and determines some basic info about the response.
		 * 
		 * May be invoked prior to onError.
		 */
		onBegin: function(size, request) {
			var info = this.info = {
				expected: size, 
				query: request.query, 
				queryOptions: request.queryOptions,
				returned: 0,
				count: request.count,
				r: request
			};

			info.returned = 0;
			info.count = request.count;
			if (this.pageSize != info.count)
				throw "The count property on kwArgs does not match the widget's page size.  Subclasses that wish to alter the page size must set pageSize prior to onBegin returning.";
			var start = info.start = request.start || 0;
			info.hasLess = start > 0;
			
			// If we know results should be coming, purge the existing results and set up the empty state.
			// Otherwise, if the local results come back empty we could sit around showing the old results
			// until the remote query returns.
			info.existing = this._detachExisting();
			this.start(request, info.hasLess, size == -1);
		},
		
		/**
		 * Render each item as it is returned.  Only invoked after
		 * onBegin.  onItem must be invoked once for each item passed
		 * to onComplete.
		 */
		onItem: function(item, request) {
			var info = this.info;	
			
			var first;
			// On the first item, purge the existing results from the DOM
			// and show the loading node (if we don't know the total number of
			// results) and the previous link node.
			if (info.returned++ == 0) {
				first = true;
				this._rendering = true;
			}
			var templateNode = this.templateNode;
			var existing = info.existing;
			var newNode, id;
			var idProperty = this.idProperty;
			var store = this.store;
			// Attempt to reuse a dom node from the previous rendering
			// if it shares the same ID attribute as the current node.
			if (idProperty) {
				id = store.getValue(item, idProperty);
				newNode = existing[id];
			}
			if (!newNode) {
				newNode = templateNode.cloneNode(true);
				newNode._itemId = id;
				newNode._top = 1; // mark the node as a top level item for faster event processing
				newNode._item = item;
				this.updateItem(item, newNode, store);
			}
			// if an item is already in the DOM, it means we've already rendered an item with this id
			if (!newNode.parentNode) {
				delete this.selectable; // purge the selectable node cache prior to updating the DOM
				this.listNode.insertBefore(newNode, templateNode); 
				newNode.style.display = "";
			}
			
			// If this is the first request, ensure we are visible and
			// set the highlight (if necessary).
			if (first) {
				this.show();
				if (request.queryOptions.menuPaging)
					this._moveSelectionTo(newNode);
				else if (request.queryOptions.immediate)
					this.next();
			}
		},
		
		/**
		 * An incremental error is an error that should not terminate
		 * execution of the request - merely an indication from the
		 * data store that some set of information is not available.
		 * 
		 * May only be called after onBegin()
		 */
		onIncrementalError: function(errorData, request) {
			this.incrementalError(errorData);
			this.show();
			if (this.selectedNode == this.loadingNode) // only works when loading node is before error node
				this.next();
		},
		
		/**
		 * Given a general error, display the appropriate info.
		 * If the error occurs after results have already been
		 * displayed, do not clear the other nodes.
		 */
		onError: function(errorData, request) {
			var info = this.info;
			var firstCallback = false;
			if (!info || info.r !== request) {
				info = this.info = {
					expected: -1, 
					query: request.query, 
					queryOptions: request.queryOptions,
					returned: 0,
					count: request.count,
					r: request
				};
				firstCallback = true;
			}
			
			// when we have already started displaying results, only hide
			// the loading node
			if (!firstCallback) {
				this.onIncrementalError(errorData, request);
				return;
			}
			
			this.error(errorData, request);
			this.show();
			
			// when the user has requested an immediate query and
			// we haven't displayed yet, start the highlight in
			// the first position
			if (request.queryOptions.immediate)
				this.next();
			this._rendering = false;
		},
		
		/**
		 * Invoked after onBegin and onItem.  The items array
		 * represents all results that are available.  onItem
		 * will not be invoked if the array is empty.
		 */
		onComplete: function(items, request) {
			var size = items.length;

			var info = this.info;
			info.returned = size;
			info.queryOptions = request.queryOptions;
			info.query = request.query;
			if (size == 0) {
				this.show();
				
				// We explicitly ignore the scenario where we page past the end of results - a 
				// user can just start the search again
				this.empty(request.query, info.hasLess);
			} 
			else {
				var expectedTotal = info.expected;
				var start = info.start;
				var count = info.count;
				var showNext = info.hasMore = (expectedTotal != -1) ? (start + size < expectedTotal) : (count > 0 && size == count);
				this.done(showNext);
			}
			this._rendering = false;
		},
		
		/**
		 * Given an item, render it into the template node.
		 * @param item 
		 * 		The result from the data store
		 * @param newNode 
		 * 		A DOM node to render the item in.
		 * @param store 
		 * 		The data store which returned the item 
		 */
		updateItem: function(item, newNode, store) {
			newNode.firstChild.data = item;
		},
		
		/**
		 * The query has returned and it was fully empty.  If we attempted
		 * to go to the next page and got back an empty set, it means the data
		 * store did not properly inform us that the end of results had been reached.
		 */
		empty: function(query, hasPrevious) {
			var messages = this.messages;
			var msg = messages[hasPrevious ? "noMoreResults" : (query.length > 0 ? "noResults" : "noQuery")];
			this.emptyNode.firstChild.data = dojo.string.substitute(msg, [query]);
			this._hideExcept("emptyNode", hasPrevious ? "previousNode" : null);
		},
		
		/**
		 * We are waiting for the data store to return any information at all.  Reset any other visible 
		 * items.
		 * 
		 * Show the message indicating we are actively looking for results (is not parameterizable by
		 * query because the value of the input may not yet be available (invoked via key handler).
		 */
		loading: function() {
			this._hideExcept("loadingNode");
		},
		
		/**
		 * The query has started and only the previous or loading items should be visible.  Reset
		 * any other visible items. 
		 */
		start: function(request, hasPrevious, expectIncremental) {
			this._hideExcept(hasPrevious ? "previousNode" : null, expectIncremental ? "loadingNode" : null);			
		},

		/**
		 * We expect no more results from the data store (and we had at least one).
		 */
		done: function(hasMore) {
			this.loadingNode.style.display = "none"; // all other paths should hide the loading node
			if (hasMore)
				this.nextNode.style.display = "";
		},
		
		/**
		 * An error has occurred and we don't want to display any other operations.  Reset any
		 * other visible items. 
		 */
		error: function(errorData, request) {
			this.errorNode.firstChild.data = this.messages.error;
			this._hideExcept("errorNode");
		},
		
		/**
		 * Invoked when an incremental operation fails, when we want to show existing nodes
		 * but not the error nodes.
		 */
		incrementalError: function(errorData) {
			var errorNode = this.errorNode;
			errorNode.firstChild.data = this.messages.error;
			errorNode.style.display = "";
			this.loadingNode.style.display = "none";
		},

		/**
		 * Clear the selection on the menu.  A subsequent call to next()
		 * will highlight the first item.
		 */
		clearSelect: function() {
			if (this.selectedNode)
				dojo.removeClass(this.selectedNode, this.selectedClass);
			this.selectedNode = null;
		},
		
		/**
		 * Move the selection to the next visible, or return to the top of the
		 * menu.
		 */
		next: function() {
			this._moveSelection(1);
		},
		/**
		 * Move the selection to the previous visible item, or return to the 
		 * bottom of the menu.
		 */
		previous: function() {
			this._moveSelection(-1);
		},
		
		/**
		 * If there are more results available, move to the next page.
		 * 
		 * @return true so that keyboard ENTER events do not reset the
		 * 		search or submit the form the autocomplete input is in
		 */
		nextPage: function() {
			var info = this.info;
			if (!info.hasMore)
				return;
			var pageSize = Math.min(info.returned, this.pageSize);
			var nextStart = info.start + pageSize;
			var options = dojo.mixin({}, info.queryOptions, {
				immediate: true,
				start: nextStart,
				count: pageSize,
				menuPaging: true
			});
			this.clearSelect();
			this.fetch(info.query, options);
			// Returns true so that the ENTER key, when pressed on this item, does not submit the input value.
			return true;
		},
		/**
		 * If there are earlier results available, move to the previous
		 * page.
		 * 
		 * @return true so that keyboard ENTER events do not reset the
		 * 		search or submit the form the autocomplete input is in
		 */
		previousPage: function() {
			var info = this.info;
			if (!info.hasLess)
				return;
			var pageSize = this.pageSize;
			var nextStart = Math.max(0, info.start - pageSize);
			var options = dojo.mixin({}, info.queryOptions, {
				immediate: true,
				start: nextStart,
				count: pageSize,
				menuPaging: true
			});
			this.clearSelect();
			// the info object is not updated until fetch invokes onBegin, but we want users to be able to
			// invoke previous page rapidly.  Populate the info object with just enough info so that a call
			// to previousPage() will be able to fetch the next set.
			info.start = info.nextStart;
			info.hasLess = nextStart > 0;
			this.fetch(info.query, options);
			// Returns true so that the ENTER key, when pressed on this item, does not submit the input value.
			return true;
		},
		
		/**
		 * Select the selected item in the list or the item from a click event.
		 * 
		 * If the click occurs as a mouse input on the menu, check to see whether
		 * it falls within an element that is selectable and has the clickMethod
		 * attribute.  If so, invoke that method with the selected node and the
		 * event object.
		 * 
		 * @param event: (optional)
		 * 		If passed, check to see whether this is a mouseup event - otherwise
		 * 		ignore the event.
		 * @return bool
		 * 		For selection that begins with a keystroke, return true if we should
		 * 		capture the keystroke (paging, menu only interactions).
		 */
		select: function(event) {
			var takeEvent = false;
			var selectedNode = this.selectedNode;
			// We register handlers on mouseup in order to prevent blur from firing
			// on the input node
			if (event && event.type == 'mouseup') {
				var target = this._getItemNode(event.target);
				if (target)
					selectedNode = target;
				dojo.stopEvent(event);
			}
			if (selectedNode) {
				// If there is a selected node, we consider the keyboard focus as
				// being on the menu.  Therefore by default we'll take the event
				// for selections.
				takeEvent = this.takeEventOnSelect;
				if (selectedNode._item)
					this.onSelect(selectedNode._item, this.store);
				else {
					var m = dojo.attr(selectedNode, 'clickMethod');
					if (!m)
						throw "A _selectable, non-item node was clicked but has no 'clickMethod' attribute";
					takeEvent = this[m](selectedNode, event) === true;
				}
			}
			return takeEvent;
		},
		
		/**
		 * If the menu is not currently visible, open it and then fire the onShow() event.  
		 * Has no effect if the menu is already open.
		 */
		show: function() {
			if (!this.showing) {
				this.showing = true;
				// Retrieve the selectable nodes so that we have _top set
				this._getSelectable();
				if (this.parent)
					this._open();
				this.onShow();
			}
		},
		/**
		 * If the menu is currently visible, hide it and then fire the onHide() event.  
		 * Has no effect if the menu is already hidden.
		 */
		hide: function() {
			if (this.showing) {
				this.showing = false;
				if (this.parent)
					dijit.popup.close(this);
				this.clearSelect(); 
				this.onHide();
			}
		},
		
		/**
		 * Open the menu as a popup node around the parent, and ensure
		 * that the contents are visible on screen.  If necessary, update
		 * any scrolling or width information to ensure a good fit.
		 */
		_open: function() {
			var domNode = this.domNode;
			var minwidth = '400px';
			
			// code temporarily reused from ComboBox - needs review and possible changes
			dojo.style(domNode, {width: "400px", height: ""});
			
			var best = dijit.popup.open({popup: this, parent: this.parent, around: this.around});
			
			var parent = domNode.parentNode;
			parent.style.visibility = "hidden";
			
			//TODO: when opening above, set "bottom" instead of "top" as the style so that growth doesn't require repositioning
			/* Needs to handle body relative vs. not relative, not sure what the problem is
			var onTop = ('T' == best.aroundCorner.charAt(0));
			if (onTop) {
				var parentStyle = this.domNode.parentNode.style;
				parentStyle.top = "";
				//var viewport = dijit.getViewport();
				parentStyle.bottom = (dojo.position(document.body).h - best.y - best.h) + "px";
			}*/
			
			var popupbox = dojo.marginBox(domNode);
			domNode.style.overflow = /*((best.h == popupbox.h) && (best.w == popupbox.w)) ? "hidden" : */"auto";
			// #4134:
			//		borrow TextArea scrollbar test so content isn't covered by
			//		scrollbar and horizontal scrollbar doesn't appear
			if(minwidth < best.w)
				var newwidth = best.w;
			else 
				var newwidth = minwidth;
			
			if (best.h <= domNode.scrollHeight)
				newwidth += 16;

			dojo.marginBox(domNode, {
				//h: best.h,
				w: Math.max(newwidth, domNode.offsetWidth)
			});
			
			// If we increased the width of drop down to match the width of ComboBox.domNode,
			// then need to reposition the drop down (wrapper) so (all of) the drop down still
			// appears underneath the ComboBox.domNode
			if (newwidth < domNode.offsetWidth)
				domNode.parentNode.style.left = dojo.position(domNode).x + "px";

			parent.style.visibility = "visible";
		},
		
		
		/************************ Internal *******************/
		
		/**
		 * Prevents the browser from firing the "blur" event on the autocomplete INPUT
		 * element.
		 */
		_onMouseDown: function(event) {
			dojo.stopEvent(event);
		},
		
		/**
		 * Highlight the node that the mouse is currently over.
		 */
		_onMouseOver: function(/*Event*/ event){
			var node = this._getItemNode(event.target);
			if (node && node != this.selectedNode) {
				this.clearSelect();
				this.selectedNode = node;
				dojo.addClass(node, this.selectedClass);
			}
		},

		_onMouseOut: function(/*Event*/ event){
			this.clearSelect();
		},
		
		/**
		 * Return the node that is associated with a top level
		 * menu item, or null.
		 */
		_getItemNode: function(target) {
			var listNode = this.listNode;
			if (dojo.isDescendant(target, listNode)) {
				while (!target._top) {
					// Not all of the content of a menu is clickable - terminate
					// our search if we reach the list node
					if (target == listNode)
						return;
					target = target.parentNode;
				}
				return target;
			}
		},
		
		/**
		 * Return the selectable items in the DOM structure.  Caches the query for
		 * subsequent reuse. If the DOM changes, you must set this.selectable to null 
		 * before changing or reading the selection.
		 */
		_getSelectable: function() {
			var selectable = this.selectable;
			if (!selectable) {
				selectable = this.selectable = dojo.query("._selectable", this.listNode);
				this._initSelectable(selectable);
			}
			return selectable;
		},
		
		/**
		 * Perform any DOM operations necessary for the selectable nodes.
		 */
		_initSelectable: function(selectable) {
			selectable.forEach(function(el) {el._top = 1;}); // mark the nodes as being _top
		},
		
		/**
		 * Adjust the selected item.  See _getSelectable() for information on how this
		 * is determined.
		 *    
		 * @param direction
		 * 		1 or -1, the number of positions in the selection to move back or forward
		 * @precondition At least one item in the list is visible
		 */
		_moveSelection: function(direction) {
			// Use the cached selection list if one exists
			var selectable = this._getSelectable();
			var selectableLength = selectable.length;
			var selectedNode = this.selectedNode;
			
			// Find the location of the current selection and then adjust where we start
			var nextIndex = selectable.indexOf(selectedNode);
			if (nextIndex == -1) {
				// If the selected node is not found in the selectable node list, we
				// probably forgot to clear it, which means we just lost the user's
				// position in the selection.  When removing items from the DOM, call
				// clearSelect() OR adjust the selection to an item that already exists
				//
				// FIXME: Can reproduce rapidly paging forwards (rebuilding DOM) and moving
				// mouse over the first few items - we may want to disable before shipping.
				if (selectedNode)
					throw "Failed to call clearSelect() before altering DOM";
				nextIndex = (direction != -1 ? -1 : selectableLength);
			}

			this._moveTo(selectable, nextIndex, direction);
		},
		
		_moveSelectionTo: function(node, offset) {
			// Use the cached selection list if one exists
			var selectable = this._getSelectable();
			
			// Find the location of the current selection and then adjust where we start
			var locatedIndex = selectable.indexOf(node);
			if (locatedIndex != -1)
				// If the node is not found, nextIndex will be -1, and we set direction +1 so
				// we will look at the first index.  If the node is found, we should subtract
				// one (so locatedIndex is immediately prior to the selected item) and then
				// add whatever offset to skip forward.
				locatedIndex += (offset || 0) - 1;
			
			this._moveTo(selectable, locatedIndex, 1);
		},
		
		_moveTo: function(selectable, nextIndex, direction) {
			var selectableLength = selectable.length; 
			var selectedNode = this.selectedNode;
			var selectedClass = this.selectedClass;

			// Find the next visible item
			var tests = selectableLength;
			var nextNode;
			do {
				nextIndex = (nextIndex + direction) % selectableLength;
				if (nextIndex < 0)
					nextIndex = selectableLength-1;
				nextNode = selectable[nextIndex];
				if (nextNode.offsetHeight > 0) // if the item is visible
					break;
			} while (--tests);
			
			// Update class names and set selected item
			if (selectedNode)
				dojo.removeClass(selectedNode, selectedClass);
			dojo.addClass(nextNode, selectedClass);
			this.selectedNode = nextNode;
			
			dijit.scrollIntoView(nextNode);
		},
		
		/**
		 * Display only the named members - all other nodes are hidden.  Assumes
		 * all children of listNode are Elements (no TextContent nodes).
		 * 
		 * @param memberName (optional 0..n)
		 * 		The name of a member variable (assumed to be a Node) to make
		 * 		visible
		 */
		_hideExcept: function() {
			var child = this.listNode.firstChild;
			while (child) {
				if (!child._ignoreHide)
					child.style.display = "none";
				child = child.nextSibling;
			}
			for (var i=0,l=arguments.length; i<l; i++) {
				var name = arguments[i];
				if (name)
					this[name].style.display = "";
			}
		},
		
		/**
		 * Remove all nodes that are children of listNode that
		 * represent items.  Returns a map of the nodes by their
		 * _itemId attribute (set by onItem) to enable nodes to
		 * be reused.
		 * 
		 * @return A map of item ids to nodes
		 */
		_detachExisting: function() {
			var existing = {};
			var parent = this.listNode;
			var child = parent.firstChild;
			while (child) {
				var node = child;
				child = child.nextSibling;
				if (typeof node._item != "undefined") {
					if (node._itemId)
						existing[node._itemId] = node;
					parent.removeChild(node);
				}
			}
			return existing;
		}		
	});
})();
