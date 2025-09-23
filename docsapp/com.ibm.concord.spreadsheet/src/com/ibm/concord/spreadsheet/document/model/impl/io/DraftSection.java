package com.ibm.concord.spreadsheet.document.model.impl.io;

/**
 * All "top" level fields in every draft JSON files. Used for {@link IDraftJSONWriter} implementations to mark draft sections.
 */
public enum DraftSection {
  META_ROOT("meta.js"), META_SHEETS("sheets"), META_SHEETSIDARRAY("sheetsIdArray"), META_SHEETSARRAY("sheetsArray"), //
  META_VERSION("version"), META_CSV("csv"), META_DATE1904("date1904"), //
  META_ROWS("rows"), META_COLUMNS("columns"), META_LOCALE("locale"), META_DEFAULTCOLUMNWIDTH("defaultColumnWidth"), //
  META_INIT_ROWCOUNT("initrow"), META_INIT_COLUMNCOUNT("initcol"), META_INIT_STYLECOUNT("initstyle"), META_INIT_SHEETCOUNT("initsheet"), //
  CONTENT_ROOT("content.js"), CONTENT_STYLES("styles"), CONTENT_SHEETS("sheets"), //
  CONTENT_NAMES("names"), CONTENT_UNNAMES("unnames"), CONTENT_PNAMES("pnames"), CONTENT_CALCULATED("calculated"), //
  REFERENCE_ROOT("reference.js"), REFERENCE_SHEETS("sheets"), //
  PRESERVE_ROOT("preserve.js"), PRESERVE_MAXROW("maxrow"), PRESERVE_STYLE("style"), PRESERVE_VALUE("value"), PRESERVE_PNAMES("pnames");

  final String fieldName;

  DraftSection(String v)
  {
    fieldName = v;
  }

  public String toString()
  {
    return fieldName;
  }
}
