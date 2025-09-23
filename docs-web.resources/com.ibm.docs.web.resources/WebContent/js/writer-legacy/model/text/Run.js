dojo.provide("writer.model.text.Run");
writer.model.text={};
writer.model.text.Run = {};
writer.model.text.Run.TEXT_Run = "rPr";
writer.model.text.Run.FIELD_Run = "fld";
writer.model.text.Run.SIMPLE_FIELD_Run = "fldSimple";
writer.model.text.Run.LINK_Run = "hyperlink";
writer.model.text.Run.IMAGE = "img";
writer.model.text.Run.TXBX = "txbx";
writer.model.text.Run.SMARTART = "smartart";
writer.model.text.Run.CANVAS = "wpc";
writer.model.text.Run.GROUP = "wgp";
writer.model.text.Run.BOOKMARK ="bmk";
writer.model.text.Run.COMMENT ="cmt";
writer.model.text.Run.FOOTNOTE = "fn";
writer.model.text.Run.ENDNOTE = "en";
//current comment list
writer.model.text.Run.createRun = function(attJson, owner)
{
	var type = attJson.rt;
	if( !type )//Simple field only have t?
		type = attJson.t;
	
	var proType = writer.model.text.Run;
	switch(type)
	{
	case proType.TEXT_Run:
		if (attJson.AlternateContent)
			return new writer.model.text.AltContent(attJson, owner);
		else
			return new writer.model.text.TextRun(attJson, owner);
		break;
	case proType.LINK_Run:
		return new writer.model.text.Link(attJson, owner);
	case proType.IMAGE:
	case proType.SMARTART:
		return new writer.model.text.Image(attJson, owner);
	case proType.TXBX:
		return new writer.model.text.TextBox(attJson, owner);
	case proType.CANVAS:
	case proType.GROUP:
		return new writer.model.text.Canvas(attJson, owner);
	case proType.FIELD_Run:
	case proType.SIMPLE_FIELD_Run:
		return new writer.model.text.Field(attJson, owner );
	case proType.BOOKMARK:
		return new writer.model.text.BookMark(attJson, owner );
	case proType.FOOTNOTE:
		return new writer.model.text.RFootNote(attJson, owner);
	case proType.ENDNOTE:
		return new writer.model.text.REndNote(attJson, owner);
	};
	return null;
};
