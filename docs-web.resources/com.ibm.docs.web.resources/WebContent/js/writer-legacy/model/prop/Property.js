dojo.provide("writer.model.prop.Property");

writer.model.prop = {};
writer.model.prop.Property = {};

writer.model.prop.Property.TEXT_PROPERTY = "rPr";
writer.model.prop.Property.PARAGRAPH_PROPERTY = "pPr";
writer.model.prop.Property.BOOKMARK_PROPERTY = "bmk";	// Enclosed or not. should remove continuous <bmk start><bmk end>
writer.model.prop.Property.COMMENTS_PROPERTY = "cmt";
writer.model.prop.Property.REVISION_PROPERTY = "rev";
writer.model.prop.Property.FIELD_PROPERTY = "fld";
writer.model.prop.Property.LINK_PROPERTY = "lnk";
// Compound property include: comments, revision, field and link
writer.model.prop.Property.COMPOUND_PROPERTY = "cpd";
writer.model.prop.Property.TAB_PROPERTY = "tabs";
writer.model.prop.Property.TABLE_PROPERTY = "tblPr";
writer.model.prop.Property.CELL_PROPERTY = "tcPr";
//model.prop.Property = function() { };
//
//model.prop.Property.createProperty = function(attJson, hint, shouldRemovedAfterImport)
//{
//	var type = attJson.rt;	// Run type
//	var proType = model.prop.Property;
//	switch(type)
//	{
//	case proType.TEXT_PROPERTY:
//		return new model.prop.TextProperty(attJson, hint, shouldRemovedAfterImport);
//	case proType.PARAGRAPH_PROPERTY:
//		return new model.prop.PragraphProperty(attJson, hint);
////	case proType.BOOKMARK_PROPERTY:
////		return new model.prop.BookmarkProperty(attJson, hint);
////	case proType.COMMENTS_PROPERTY:
////		return new model.prop.CommentsProperty(attJson, hint);
////	case proType.REVISION_PROPERTY:
////		return new model.prop.RevisionProperty(attJson, hint);
////	case proType.FIELD_PROPERTY:
////		return new model.prop.FieldProperty(attJson, hint);
//	case proType.LINK_PROPERTY:
//		return new model.prop.LinkProperty(attJson, hint);
//	};
//	return null;
//};
