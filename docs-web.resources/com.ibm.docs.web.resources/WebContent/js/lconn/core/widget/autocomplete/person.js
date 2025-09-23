dojo.provide("lconn.core.widget.autocomplete.person");

dojo.requireLocalization("lconn.oneui.controls", "AutocompleteMenu");
dojo.requireLocalization("lconn.core.widget.autocomplete", "person");

/**
 * Standard renderer and template for a person.  Assumes the data store provides the following:
 * 	name: The user's primary display name
 * 	title: Title value, optional
 * 	email: E-mail, optional
 * 	photo: A URL to a photo for the user.
 */
lconn.core.widget.autocomplete.person = {
	messages: dojo.delegate(
			dojo.i18n.getLocalization("lconn.oneui.controls", "AutocompleteMenu"), 
			dojo.i18n.getLocalization("lconn.core.widget.autocomplete", "person")
		),
	itemTemplate: "<img style='float: left; width: 48px; height: 48px; margin: 4px; -moz-box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.3)'><div style='height: 60px; margin-left: 60px;'><div>&nbsp;</div><div style='font-size: 0.9em; color: gray; display: none;'>&nbsp;</div></div>",
	updateItem: function(item, node, store) {
		var text = node.lastChild;
		text.firstChild.firstChild.data = store.getValue(item, "name");
		
		var meta = text.lastChild;
		for (var key in {title:1,email:1}) {
			var s = store.getValue(item, key);
			if (s) {
				meta = text.appendChild(meta.cloneNode(true));
				meta.firstChild.data = s;
				meta.style.display = "";
			}
		}
		
		var photo = store.getValue(item, "photo");
		if (photo)
			node.firstChild.src = photo;
		else
			node.firstChild.style.display = "none";
	}
};
