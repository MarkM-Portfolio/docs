(function() {
	dojo.provide("lconn.core.widget.autocomplete.People");
	
	dojo.require("lconn.oneui.controls.AutocompleteInput");
	dojo.require("lconn.oneui.controls.AutocompleteMenu");
	dojo.require("lconn.core.widget.autocomplete.person");
	
	/**
	 * Requires a data store that implements dojo.data.api.Read.getFeatures().
	 */
	dojo.declare("lconn.core.widget.autocomplete.People", lconn.oneui.controls.AutocompleteInput, {
		initRenderer: function() {
			var widget = new lconn.core.widget.autocomplete.PeopleMenu({
				around: this.domNode,
				store: this.store,
				parent: this
			});
			this.connect(widget, "onSelect", "onSelect");
			return widget;
		}
	});
	
	dojo.declare("lconn.core.widget.autocomplete.PeopleItems", null, lconn.core.widget.autocomplete.person);
	
	dojo.declare("lconn.core.widget.autocomplete.PeopleMenu", [lconn.oneui.controls.AutocompleteMenu, lconn.core.widget.autocomplete.PeopleItems], {
		idProperty: "id",
		pageSize: 20, //FIXME: Temporary
		directoryResults: false, // When true, the menu will hide the search directory menu item
		postCreate: function() {
			this.inherited(arguments);
			this.templateNode.innerHTML = this.itemTemplate;
			if (this.store.getFeatures()['lconn.core.widget.autocomplete.directorysearch']) {
				this.searchNode = dojo.create("li", {
					className: "dijitMenuItem dijitMenuNextButton _selectable", 
					clickMethod: "searchDirectory", 
					style: {display: "none"},
					waiRole: "option", 
					innerHTML: "Person not listed?  Use full search..." 
				}, this.listNode);
			}
			this.complexity = this.store.getFeatures()['lconn.core.widget.autocomplete.complexity'] || 0;
		},
		onBeforeRequest: function(kwArgs) {
			this.inherited(arguments);
			this.directoryResults = kwArgs.queryOptions.directory;
		},		
		done: function() {
			this.inherited(arguments);
			this._showSearch();
		},
		empty: function(query, hasPrevious) {
			var validQuery = this.store.hasComplexity({query: query}, this.complexity);
			if (!validQuery) {
				var msg = (query.length > 0) 
					? this.messages.notEnoughInput
					: this.messages.noQuery;
				this.emptyNode.firstChild.data = dojo.string.substitute(msg, [query]);
				this._hideExcept("emptyNode", hasPrevious ? "previousNode" : null);
			}
			else {
				this.inherited(arguments);
				this._showSearch();
			}
		},
		_showSearch: function() {
			var searchNode = this.searchNode;
			if (searchNode && !this.directoryResults)
				searchNode.style.display = "";
		},
		
		searchDirectory: function() {
			var info = this.info;
			this.directoryResults = true;
			var options = dojo.mixin({}, info.queryOptions, {directory: true, start: 0});
			this.clearSelect();
			this.fetch(info.query, options);
			// Returns true so that the ENTER key, when pressed on this item, does not submit the input value.
			return true;
		}
	});
})();
