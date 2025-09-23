dojo.provide("lconn.core.test.typeahead.FacesPeopleDataStore");

dojo.require("lconn.core.widget.autocomplete.PeopleDataStore");

dojo.declare("lconn.core.test.typeahead.FacesPeopleDataStore", lconn.core.widget.autocomplete.PeopleDataStore, {
	supportsDirectorySearch: false,
	minimumComplexity: 1,
	requestDelay: 125,

	convert: function(kwArgs, response) {
		var persons = response.persons;
		var items = [];
		var page = kwArgs.count || 100;
		for (var i=0,l=Math.min(page, persons.length); i<l; i++)
			items.push(persons[i].person);
		items.total = response.matches;
		items.hasMore = (persons.length > page);
		items.start = (kwArgs.start || 0)
		if (items.hasMore) {
			var last = items.length-1;
			var offsets = this.startOffsets;
			if (!offsets)
				offsets = this.startOffsets = {};
			offsets[last+items.start+1] = "idOffset="+encodeURIComponent(items[last].id)+"&scoreOffset="+encodeURIComponent(persons[last].score);
		}
		return items;
	},
	getValue: function(item, attr, defaultValue) {
		var value;
		if (attr == "title")
			value = item.bio;
		else if (attr == "id")
			value = item.uid;
		else if (attr == "photo")
			value = this.getPhotoUrl(item, defaultValue);
		else
			value = item[attr];
		return value === undefined ? defaultValue : value;
	},
	getUrl: function(kwArgs) {
		var start = (kwArgs.start || 0);
		var offset = (this.startOffsets || {})[start];
		return dojo.replace("http://faces.tap.ibm.com/api/find/?threshold=5&format=faces&limit={pageSize}&q={query}{offset}", {
			query: encodeURIComponent(kwArgs.query),
			start: kwArgs.start || 0,
			pageSize: (kwArgs.count || 100) + 1,
			offset: offset ? ("&"+offset) : "" 
		});
	},
	getPhotoUrl: function(item, defaultValue) {
		return "http://images.tap.ibm.com:10000/image/"+encodeURIComponent(item.email)+".jpg?s=55";
	}
});
