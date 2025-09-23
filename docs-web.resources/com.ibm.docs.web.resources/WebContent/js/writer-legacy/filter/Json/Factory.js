dojo.provide("writer.filter.Json.Factory");
dojo.require("writer.filter.Json.Paragraph");
dojo.require("writer.filter.Json.RichText");
dojo.require("writer.filter.Json.Table");
dojo.require("writer.filter.Json.Row");
dojo.require("writer.filter.Json.Cell");
dojo.require("writer.filter.Json.Div");

dojo.declare("writer.filter.Json.Factory", null, {

	createBlock : function(json) {
		if (json.t == null && json.c) {
		//rich text
			return new writer.filter.Json.RichText(json);
		}

		switch (json.t) {
		case 'p':
			return new writer.filter.Json.Paragraph(json);
			break;
		case 'tbl':
			return new writer.filter.Json.Table(json);
			break;
		case 'tr':
			return new writer.filter.Json.Row(json);
			break;
		case 'tc':
			return new writer.filter.Json.Cell(json);
			break;
		case "sdt":
			return new writer.filter.Json.Div( json );
			// todo:
			break;
		case "tr":
			// todo:
		case "tc":
			// todo;
			break;
		}
	}
});