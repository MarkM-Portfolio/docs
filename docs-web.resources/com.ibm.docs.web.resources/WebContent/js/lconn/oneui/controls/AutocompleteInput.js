(function() {
	dojo.provide("lconn.oneui.controls.AutocompleteInput");
	dojo.require("dijit._Widget");
	// This module relies on methods that are not properly separated from
	// base dijit classes.  When both dijit.form.ComboBoxMixin and 
	// dijit.form.TextBox are already included, OR if you are not using
	// multiple values in your input, you may omit the following require 
	// statement.  
	// TODO: Open as Dojo TRAC ticket
	//dojo.//require("lconn.oneui.controls._caret");
	
	
    var dk = dojo.keys;
    var KEY_ENTER = dk.ENTER;
    var KEY_DELETE = dk.DELETE;
    var KEY_BACKSPACE = dk.BACKSPACE;
    var KEY_SHIFT = dk.SHIFT;
    
    var SEARCH_IMMEDIATELY_KEYS = {};
    SEARCH_IMMEDIATELY_KEYS[dk.DOWN_ARROW] = 1;

	var NOT_SEARCHABLE = {};
    dojo.forEach([
          dk.RIGHT_ARROW,
          dk.LEFT_ARROW,
          dk.PAGE_UP,
          dk.PAGE_DOWN,
          dk.UP_ARROW,
          dk.DOWN_ARROW,
          dk.HOME,
          dk.END,
          dk.TAB,
          dk.ESCAPE
        ], 
        function(s) {this[s]=1;}, 
        NOT_SEARCHABLE);
	
    // Interval between when normal key events are sent
    // to the data store, since the final value of the 
    // input is not available when the event handler is
    // called.
    var DELAY_FOR_MORE_EVENTS = 50;
    // When a direct input event occurs we invoke the
    // data store immediately
    var DELAY_FOR_DIRECT_INPUT = 1;
    
    var WAIT_FOR_VALUE = "_waitForValue";
    
    function FetchArguments(widget, query, opts) {
		widget.inflight = this;
    	this.w = widget;
    	this.query = query;
    	if (opts) {
    		this.queryOptions = opts;
    		this.count = opts.count;
    		this.start = opts.start;
    	}
    	var renderer = widget.renderer;
    	if (renderer) {
    		renderer.onBeforeRequest(this);
        	this.scope = renderer;
    	}
    	else
    		this.scope = widget;
    	if (!this.scope.onIncrementalError)
    		this.onIncrementalError = null;
    }
    FetchArguments.prototype = {
    	queryOptions: {},
    	matches: function(query, opts) {
    		if (opts)
    			return this.query == query && (this.queryOptions.immediate || !opts.immediate) && (this.count == opts.count) && (this.start == opts.start);
			return this.query == query && !(this.count > 0) && !(this.start > 0);
    		
    	},
    	ignore: function() {
    		if (!this.finished) {
        		this.finish();
    			this.abort();
    		}
    	},
    	done: function() {
    		var current = (this.w.inflight === this);
    		if (!current) {
    			console.log("inflight: '"+(this.w.inflight ? this.w.inflight.query : "null")+"' this: '"+this.query+"'");
    			return true;
    		}
    		return this.finished;
    	},
    	finish: function() {
    		this.finished = true;
    		this.w._finishFetch();
    	},
    	onComplete: function(items, request) {
    		if (request.done()) 
    			return;
			request.finish();
    		this.onComplete(items, request);
    	},
    	onBegin: function(size, request) {
    		if (request.done()) 
    			return;
    		this.onBegin(size, request);
    	},
    	onItem: function(item, request) {
    		if (request.done()) 
    			return;
    		this.onItem(item, request);
    	},
    	onError: function(errorData, request) {
    		if (request.done()) 
    			return;
			request.finish();
    		this.onError(errorData, request);
    	},
    	onIncrementalError: function(errorData, request) {
    		if (request.done() || !this.onIncrementalError) 
    			return;
    		this.onIncrementalError(errorData, request);
    	}
    };
    
    /**
     * An INPUT DOM element that can provide suggestions to user input.  Typically
     * used in concert with AutocompleteMenu, but the two classes are decoupled.
     * Also used in concert with AutocompleteDataStore, which provides helper methods
     * for chaining requests and providing intelligent delays (so that cached content
     * can be displayed immediately, but remote content requires more of a pause).
     * 
     * The methods in this widget do not require subclassing to function, instead
     * a renderer widget can be passed to the widget to handle the display of the
     * output.  The widget handles most responsibility for interacting with the
     * data store, although some renderers may invoke the fetch method to return
     * additional sets of data or to page responses. 
     * 
     * Subclasses of this class may choose to provide a default implementation
     * of initRenderer that instantiates a default rendering to provide a 
     * replacement for a widget like dijit.form.ComboBox.
     * 
     * It is the responsibility of the renderer to provide accessibility support
     * through the use of ARIA or other techniques.
     * 
     * It is the responsibility of the caller to connect to the onSelect method
     * to access selections made from the renderer.  The data
     * store object and the data store are passed to this handler.  The event
     * information is not available from this call - instead clients may
     * choose to invoke methods on the renderer.
     * 
     * TODO: Needs test case of multivalue with comma as delimeter
     * TODO: fix firefox position setting scrolling issue (set cursor to end, input doesn't scroll)
     */
	dojo.declare("lconn.oneui.controls.AutocompleteInput", [dijit._Widget], {
		// store: implements dojo.data.api.Read 
		//		The data store for this input.  Data store may be passed the queryOption
		//		immediate to indicate the request should take place immediately.
		store: null,
		
      // multipleValues: bool
      //      Sets whether or not this type-ahead should support multiple values.
      //      If true, then typing a token (usually comma) will cause the type-ahead
      //      to reset and begin searching for a new name. 
      multipleValues: false,
        
      // valueOnSelect: string
		//		The attribute name on the item to set the input to on selection. If null,
		//		no input value will be adjusted.
		valueOnSelect: null,
        
      // token: string
      //      The character to split all the names by in the text box.
      //      Only used if multipleValues is true.
      token: ',',
        
      // allowSubmit: bool
      //		If true, ENTER on this input will have the default behavior
      allowSubmit: true,
        
      // fetchOnClick: bool
      //		If true, make a request to retrieve whenever the input field is clicked
      fetchOnClick: true,

 		postMixInProperties: function() {
        	this._search = dojo.hitch(this, "search", null);
        	this._searchImmediate = dojo.hitch(this, "search", {immediate: true});
 		},
        
 		destroy: function() {
			clearTimeout(this[WAIT_FOR_VALUE]);
        	this.ignoreFetch();
        	this._finishFetch();
        	this.inherited(arguments);
      },
      destroyDescendants: function(preserveDom) {
        	this.inherited(arguments);
        	var renderer = this.renderer;
        	if (renderer)
        		renderer.destroyRecursive(preserveDom);
      },
        
		buildRendering: function() {
			var node = this.srcNodeRef;
			if (!node || node.nodeName.toUpperCase() != "INPUT")
				node = dojo.create("input", {autocomplete: "off"}, node);
			this.domNode = node;
			this.connect(node, "onclick", "onClick");
			this.connect(node, "onkeypress", "onKeyPress");
			this.connect(node, "oncut", "suggestSearch");
			this.connect(node, "onpaste", "suggestSearch");
			
			if (dojo.isIE < 9)
				this.connect(node, "onbeforedeactivate", "onBeforeDeactivate");
		},
		
		_getValueAttr: function() {
			return this.domNode.value;
		},	
		
		_setValueAttr: function(value) {
			this.domNode.value = value;
		},	
		
		/**
		 * Invoked the first time the renderer widget is needed.  
		 * Calls initRenderer() once and only once per widget, and
		 * hooks the fetch method on the renderer widget to this
		 * object.
		 */
		_initRenderer: function() {
			var renderer = this.renderer;
			if (this.initRenderer) {
				renderer = this.renderer = this.initRenderer();
	        	this._initRenderer = null;
			}
        	if (renderer)
        		renderer.fetch = dojo.hitch(this, "fetch");
		},
		
		/**
		 * Optional method that will be invoked the first time the renderer 
		 * is needed.  This method may lazily instantiate the renderer.
		 * 
		 * @return A renderer object
		 */
		initRenderer: null,
		
		/**
		 * Process incoming key events and dispatch accordingly.  The 
		 * renderer widget is allowed to suppress or intercept all 
		 * keystrokes.
		 * 
		 * Some keystrokes will immediately invoke a search, others
		 * will queue that search for the next wait interval to elapse.
		 * 
		 * All searches are done after a timeout of at least 1ms, because
		 * the INPUT value element is not updated until after the
		 * event handler is invoked.
		 */
		onKeyPress: function(event) {
         var key = event.charOrCode;
         var keyCode = event.keyCode;
         
         /* TODO: evaluate
         var autoReplace = this.autoReplace;
         var keyChar = event.keyChar;
         // If we have an autoreplace pattern, convert anything that matches it into multi-value-separating tokens            
         if (this.multipleValues && autoReplace && keyChar) {
            autoReplace.lastIndex = 0;
            if (autoReplace.exec(keyChar)) {
               dojo.stopEvent(event);
               this._normalize(autoReplace, this.token);

               // Behave as if we typed a separating character
               key = keyChar = this.token;
            }
         }*/

         //except for cutting/pasting case - ctrl + x/v
         if (event.altKey || (event.ctrlKey && (key != 'x' && key != 'v')) || event.key == KEY_SHIFT)
             return; // throw out weird key combinations and spurious events
         
         var handled = false;
         var renderer = this.renderer;
         if (renderer && renderer.onInputKeypress(key, event, this))
     		return;

         // These keys should trigger an immediate search
         if (SEARCH_IMMEDIATELY_KEYS[key]) {
         	dojo.stopEvent(event);
         	this._shouldSearch = true;
         	clearTimeout(this[WAIT_FOR_VALUE]);
         	this[WAIT_FOR_VALUE] = setTimeout(this._searchImmediate, DELAY_FOR_DIRECT_INPUT);
         	return;
         }
         
         var search = false;            	
         if (!NOT_SEARCHABLE[key]) {
            switch (key) {
            	case KEY_ENTER:
            		// When using a renderer widget that captures ENTER (to select a highlighted item),
            		// onSelect will have fired from the renderer widget prior to this line of code.
            		console.log("User hit ENTER on input");
            		if (!this.allowSubmit) {
            			event.preventDefault();
            			this.onSubmit(this.domNode.value);
            		}
            		break;
		    	case KEY_DELETE:
		        case KEY_BACKSPACE:
		        	// Both of these keys change the value of the input, so they should always search
		        	search = true;
		            break;
		            
		        default: 
		            // Non char keys (F1-F12 etc..)  shouldn't open list. 
		            // Ascii characters and IME input (Chinese, Japanese etc.) should. 
		            // On IE and safari, IME input produces keycode == 229, and we simulate 
		            // it on firefox by attaching to compositionend event (see compositionend method)
		        	search = typeof key == 'string' || key == 229; 
		    }
         }

         // if the character isn't one that we would add to the search we want to terminate
         // the currently executing request to the datastore.  Otherwise, wait for the next
         // search event timer to fire.
         if (!search)
         	this.ignoreFetch();
         else if (!(WAIT_FOR_VALUE in this))
         	this[WAIT_FOR_VALUE] = setTimeout(this._search, DELAY_FOR_MORE_EVENTS);
         
         this._shouldSearch = search;
		},
		
		_onFocus: function(e) {
			if (this._initRenderer)
				this._initRenderer();
			this.inherited(arguments);
		},
		
		/**
		 * The blur event on the input should cancel any current timers, abort the current 
		 * datastore request, and notify the renderer that the blur has occurred. 
		 */
		onBlur: function() {
			clearTimeout(this[WAIT_FOR_VALUE]);
			delete this[WAIT_FOR_VALUE];
            this.ignoreFetch();
			if (this.renderer)
				this.renderer.onInputBlur();
		},
		
		/**
		 * Only do a search on click if we have focus, if no other search is in flight, and 
		 * if the renderer approves.
		 * 
		 * When the input is in multiple value mode, we disable click handling because the
		 * user is much more likely to use the mouse to set specific locations.
		 */
		onClick: function() {
			if (this.fetchOnClick && !this.multipleValues && this._focused && !this.isSearching() && (!this.renderer || this.renderer.onInputClick())) {
				this._shouldSearch = true;
				this.search();
			}
		},
		
		/**
		 * Support IE6-8 with focus management
		 */
		onBeforeDeactivate: function(event) {
			var renderer = this.renderer;
			if (renderer && renderer.onBeforeDeactivate)
				renderer.onBeforeDeactivate(event);
		},
		
		/**
		 * The default implementation allows selection to fill the input.
		 */
		onSelect: function(item, store) {
			var valueOnSelect = this.valueOnSelect;
			if (valueOnSelect) {
				var itemValue = store.getValue(item, valueOnSelect);
				var domNode = this.domNode;
				if (this.multipleValues) {
					var value = domNode.value;
					var position = dijit.form.ComboBoxMixin.prototype._getCaretPos(domNode);
					var token = this.token; 
					var r= new RegExp("(^|\\"+token+")[^\\"+token+"]*","g");
					r.lastIndex = 0; 
					while (res = r.exec(value)) {
						var last = r.lastIndex;
						if (last >= position) {
							itemValue = 
								value.substring(0, last - res[0].length + (res[1].length > 0 ? 1 : 0)) + 
								itemValue + 
								value.substring(last) + 
								token + 
								(token != ' ' ? ' ' : '');
							break;
						}
					}
				}
				this.attr("value", itemValue);
				dijit.selectInputText(domNode, itemValue.length, itemValue.length);
			}
		},	

		/**
		 * Invoked when a user hits ENTER on the input and allowSubmit is false.
		 */
		onSubmit: function(value) {
		},
				
		/**
		 * A search *should* happen, but can wait a short interval
		 * to see if other keystrokes occur.  Remember, the datastore
		 * may not immediately invoke the query, so this interval is
		 * shorter than in past autocomplete implementations.
		 */
		suggestSearch: function() {
			this._shouldSearch = true;
			if (!(WAIT_FOR_VALUE in this))
            	this[WAIT_FOR_VALUE] = setTimeout(this._search, DELAY_FOR_MORE_EVENTS);
		},

		/**
		 * Invoke a search. 
		 * 
		 * @precondition This method requires that the caller has waited
		 * 		for any event which updates the value of the INPUT to
		 * 		complete
		 */
		search: function(opts) {
			delete this[WAIT_FOR_VALUE];
			if (this._shouldSearch) {
				delete this._shouldSearch;
				var domNode = this.domNode;
				var value = domNode.value;
				var immediate = opts && opts.immediate;
				var last = value.length;
				if (this.multipleValues) {
					var position = dijit.form.ComboBoxMixin.prototype._getCaretPos(domNode);
					var token = this.token;
					// when our cursor is at the end of a token,
					// if we asked for an immediate search move
					// the cursor and start the search.  Otherwise
					// do nothing.
					if (position != last) {
						if (token != value.charAt(position)) {
							if (immediate) {
								var next = value.indexOf(token, position+1);
								if (next != -1)
									last = next;
							}
							else
								return;
						}
						else
							last = position;
					}
					var start = value.lastIndexOf(token, position-1) + 1;
					value = value.substring(start, last);
				}
				if (immediate)
					dijit.selectInputText(domNode, last, last);
				this.fetch(dojo.trim(value), opts);
			}
		},
		
		/**
		 * @return true if there is an active search request being processed
		 */
		isSearching: function() {
			return ((WAIT_FOR_VALUE in this) && this._shouldSearch) || this.inflight;
		},
		
		/**
		 * Invoke the data store to retrieve the results of a search.  This
		 * implementation assumes the data store may wish to delay requests,
		 * so we aggressively request content from the data store and abort
		 * inflight requests frequently. 
		 */
		fetch: function(value, opts) {
			var inflight = this.inflight;
			if (inflight) {
				/* If we have an inflight request with the same query and we don't want
				 * to upgrade it to an immediate query, let it run.  Otherwise, instruct
				 * the data store to abort the request if possible.
				 */
				if (inflight.matches(value, opts))
					return;
				inflight.ignore();
			}
        	dojo.addClass(this.domNode, "lotusLoading");
			this.store.fetch(new FetchArguments(this, value, opts));
		},
		
		/**
		 * Reset the input to a "not searching" state.
		 */
		_finishFetch: function() {
        	dojo.removeClass(this.domNode, "lotusLoading");
    		delete this.inflight;
		},
		
		/**
		 * Ignore the results of the current fetch, which will
		 * abort any remote calls and prevent the event handler
		 * methods on the renderer from being invoked.
		 */
		ignoreFetch: function() {
			var inflight = this.inflight;
			if (inflight)
				inflight.ignore();
		}	
	});
})();
