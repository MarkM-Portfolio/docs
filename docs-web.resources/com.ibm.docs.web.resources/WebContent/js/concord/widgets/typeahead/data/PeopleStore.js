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
	"dojo/_base/lang",
	"dojo/_base/array",         // forEach
	"dojo/cookie",
	"dojox/data/QueryReadStore"
], function(dojoDeclare, dojoBase, dojoArray, dojoCookie, dojoxQueryReadStore) {

	return dojoDeclare("concord.widgets.typeahead.data.PeopleStore", [dojoxQueryReadStore], {
		// The parameters to be added to the base URL (in other words, the query string)
		_parameters: {},
		
		token: "",
		// The base class stores all the elements by identity (_itemsByIdentity), so we provide
		// a way to retrieve items by using the email as the key
		_itemsByEmail: null,

		// Avoid base class to add paging information to the query string, as the paging will
		// be done on the client side
		doClientPaging: true,

		constructor: function(parameters)
		{
			this.token = parameters.token;
			if (!this.token){
				console.debug("no token was specified, check cookie");
				this.token = dojo.cookie("token");
			}		
			if (!this.token){
				console.debug("you need a token to work with typeahead");
			}			
			this._extractBaseUrlAndParameters(parameters);
		},

		//
		// OVERRIDES
		//

		/*
		 * The base class stores all the items using the id as the key in the following function, so after
		 * executing the function, we do the same but using the email as the key
		 */

		_xhrFetchHandler: function() // From QueryReadStore
		{
			this.inherited(arguments);

			if (this._items) {
				this._itemsByEmail = [];

				dojoArray.forEach(this._items, function(o) {
					var e = o.i.e;

					if(e && !this._itemsByEmail[e]) {
						this._itemsByEmail[e] = o.i;
					}
				}, this);
			}
		},

		fetch: function(request) // From QueryReadStore
		{
			request.serverQuery             = this._parameters;
			request.serverQuery.search_text = request.query.e;

			return this.inherited(arguments);
		},

		//
		// API/INTEGRATION
		//

		_extractBaseUrlAndParameters: function(parameters)
		{
			var r, o = [];

			if (!parameters.url)
				throw "URL is missing";

			r = parameters.url.split("?");
			delete parameters["url"];

			if (r.length > 2)
				throw "Unable to determine the base URL";

			// The base URL
			this.url = r[0];
			
			// The required token
			this._parameters.token = this.token ? this.token : dojoCookie("token");

//			if (!this._parameters.token)
//				throw "Token is missing";

			// The options from the actual query string, if any
			dojoBase.mixin(o, this._parameters);

			if (r.length == 2) {
				dojoArray.forEach(r[1].split("&"), function(p) {
					var r = p.split("=");

					if (r.length > 2)
						throw "Unable to determine the actual value of the current parameter";

					this._parameters[r[0]] = r[1] ? r[1] : "";
				}, this);
			}
		},

		setInternalOnly: function(intent)
		{
			this._parameters.intent = intent ? "internal" : "external";

			// Because we change the scope of the search, we need to resend the query for the same key
			this._lastServerQuery = null;
		},

		fetchItemByEmail: function(e)
		{
			return this._itemsByEmail && this._itemsByEmail[e] ? this._itemsByEmail[e] : null;
		}
	});

});
