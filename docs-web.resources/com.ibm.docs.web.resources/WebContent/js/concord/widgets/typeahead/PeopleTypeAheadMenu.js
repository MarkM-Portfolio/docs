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
	"dojo/_base/array",                               // forEach
	"dojo/string",                                    // substitute
	"dojo/dom-construct",                             // destroy
	"dojo/query",
	"dijit/form/_ComboBoxMenu",
	"dojo/text!concord/templates/PeopleTypeAheadMenu.html",
	"dojo/i18n!./nls/PeopleTypeAhead",
	"dojo/NodeList-dom"                               // addClass
], function(dojoDeclare, dojoArray, dojoString, dojoConstruct, dojoQuery, dijitComboBoxMenu, PeopleTypeAheadMenuTemplate, nlsMessages) {

	return dojoDeclare("concord.widgets.typeahead.PeopleTypeAheadMenu", [dijitComboBoxMenu], {
		templateString: PeopleTypeAheadMenuTemplate.replace(/(<!--.*-->|\n|\r|\t)/gm, ""),

		postMixInProperties: function()
		{
			this.inherited(arguments);

			this._messages = nlsMessages;

			this._messages["previousMessage"] = this._messages["previousPage"];
			this._messages["nextMessage"    ] = this._messages["nextPage"    ];
		},

		postCreate: function()
		{
			this.inherited(arguments);

			this.noResultsMessage.innerHTML = this._messages["noResults"];

			this.noResultsMessage.id = this.id + "_noResultsMessage";
			this.listDescription.id  = this.id + "_listDescription";

			if (this.headerMessage) {
				this.containerNode.setAttribute("aria-describedby", this.listDescription.id);

				this.listDescription.innerHTML = this.headerMessage;
			} else {
				dojoConstruct.destroy(this.listDescription);
			}
		},

		//
		// OVERRIDES
		//

		_createOption: function(item) // From ComboBoxMenuMixin
		{
			var o = this.inherited(arguments);

			o.setAttribute("aria-posinset", item.posinset);
			o.setAttribute("aria-setsize" , item.setsize );

			return o;
		},

		createOptions: function(results, dataObject) // From ComboBoxMenuMixin
		{
			var from  = dataObject.start + 1;
			var to    = from + results.length - 1;
			var total = results.total;

			this.disableNoResultsMode();

			// Set the ARIA attributes for the list options
			for (var i = 0, m = results.length; i < m; i++) {
				results[i].posinset = from + i;
				results[i].setsize  = total;
			}

			// Pagination
			this.paginationInfo = {"start": from, "end": to, "totalNum": total};

			// Show pagination information only if we have more than one page, otherwise, the
			// information is not required (inherited from the previous PeopleTypeAhead)
			if (from > 1 || total > to) {
				this.listPaginationInfo.innerHTML     = dojoString.substitute(this._messages["pagination"], this.paginationInfo);
				this.listPaginationInfo.style.display = "";
			} else {
				this.listPaginationInfo.innerHTML     = "";
				this.listPaginationInfo.style.display = "none";
			}

			// Force to refresh of the drop down width
			this.domNode.style.width = "";

			this.inherited(arguments);

			// The last option shouldn't have the default bottom border
			dojoQuery(this.containerNode.lastChild.previousSibling).addClass("lastOption");

			// This is done to be RPT compliant
			dojoArray.forEach(dojoQuery("[role=option]", this.containerNode), function(e) {
				e.setAttribute("tabindex", "-1");
			});
		},

		onHover: function(node)
		{
			this._setSelectedAttr(node);
		},

		onUnhover: function(node)
		{
			//
		},

		//
		// API/INTEGRATION
		//

		enableNoResultsMode: function()
		{
			// Destroy the container node (the one with the role listbox) to avoid to be read by JAWS
			// when no results mode is enabled
			dojoConstruct.destroy(this.containerNode);

			this.noResultsMessage.style.display    = "";
			this.listPaginationInfo.style.display  = "none";

			if (this.headerMessage) {
				this.listDescription.style.display = "none";
			}
		},

		disableNoResultsMode: function()
		{
			// Rebuild the container node, won't have effect if it is alredy there
			this.domNode.insertBefore(this.containerNode, this.listPaginationInfo);

			this.containerNode.appendChild(this.previousButton);
			this.containerNode.appendChild(this.nextButton    );

			this.buildRendering();

			this.noResultsMessage.style.display    = "none";
			this.listPaginationInfo.style.display  = "";

			if (this.headerMessage) {
				this.listDescription.style.display = "";
			}
		}
	});

});