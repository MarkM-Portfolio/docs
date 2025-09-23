package com.ibm.concord.spreadsheet.document.model.impl.io;

/**
 * Enums every important part in the draft JSON. These part acts like actions needs to take during deserialization.
 */
public enum Actions {
  NO_ACTION, //

  // meta.js fields
  /**
   * "version": ...
   */
  META_VERSION,
  /**
   * "sheets": { "(sheetId)": { ...
   */
  META_SHEET,
  /**
   * "sheetsIdArray": ...
   */
  META_SHEETSIDARRAY,
  /**
   * "rows": { ...
   */
  META_ROW_SHEET,
  /**
   * "rows": { "(sheetId)": { "(rowId)": { ...
   */
  META_ROW,
  /**
   * "columns": { ...
   */
  META_COLUMN_SHEET,
  /**
   * "columns": { "(sheetId)": { "(columnId)": { ...
   */
  META_COLUMN,
  /**
   * "sheetsArray": { ...
   */
  META_SHEETSARRAY,
  /**
   * "sheetsArray": { "(sheetId)": { "rowsIdArray": ...
   */
  META_ROWSIDARRAY,
  /**
   * "sheetsArray": { "(sheetId)": { "columnsIdArray": ...
   */
  META_COLUMNSIDARRAY,
  /**
   * "locale": ...
   */
  META_LOCALE,
  /**
   * "defaultcolumnwidth": ...
   */
  META_DEFAULT_COLUMN_WIDTH, 
  /**
   * "initrow": ...
   */
  META_INIT_ROWCOUNT,
  /**
   * "initcol": ...
   */
  META_INIT_COLUMNCOUNT,
  /**
   * "initstyle": ...
   */
  META_INIT_STYLECOUNT,
  /**
   * "initsheet": ...
   */
  META_INIT_SHEETCOUNT,
  /**
   * "csv": ...
   */
  META_CSV,
  /**
   * "date1904": ...
   */
  META_DATE1904,
  // content.js fields
  /**
   * "calculated": ...
   */
  CONTENT_CALCULATED,
  /**
   * "styles": { ...
   */
  CONTENT_STYLE,
  /**
   * "styles": { "defaultcolumnstyle": { "w": ...
   */
  CONTENT_STYLE_WIDTH,
  /**
   * "styles": { "defaultrowstyle": { "h": ...
   */
  CONTENT_STYLE_HEIGHT,
  /**
   * "styles": { "(styleId)": { "bg": ...
   */
  CONTENT_STYLE_BGC,
  /**
   * "styles": { "(styleId)": { "unlocked": ...
   */
  CONTENT_STYLE_UNLOCKED, 
  /**
   * "styles": { "(styleId)": { "hidden": ...
   */
  CONTENT_STYLE_HIDDEN,
  /**
   * "styles": { "(styleId)": { "align": ...
   */
  CONTENT_STYLE_ALIGN,
  /**
   * "styles": { "(styleId)": { "valign": ...
   */
  CONTENT_STYLE_VALIGN,
  /**
   * "styles": { "(styleId)": { "wrap": ...
   */
  CONTENT_STYLE_WRAP,
  /**
   * "styles": { "(styleId)": { "indent": ...
   */
  CONTENT_STYLE_INDENT,
  /**
   * "styles": { "(styleId)": { "preserve": ...
   */
  CONTENT_STYLE_PRESERVE,
  /**
   * "styles": { "(styleId)": { "dxfId": ...
   */
  CONTENT_STYLE_DXFID,  
  /**
   * "styles": { "(styleId)": { "bordercolor": { "bc": ...
   */
  CONTENT_STYLE_BBC,
  /**
   * "styles": { "(styleId)": { "bordercolor": { "rc": ...
   */
  CONTENT_STYLE_BRC,
  /**
   * "styles": { "(styleId)": { "bordercolor": { "lc": ...
   */
  CONTENT_STYLE_BLC,
  /**
   * "styles": { "(styleId)": { "bordercolor": { "tc": ...
   */
  CONTENT_STYLE_BTC,
  /**
   * "styles": { "(styleId)": { "borderstyle": { "bs": ...
   */
  CONTENT_STYLE_BBS,
  /**
   * "styles": { "(styleId)": { "borderstyle": { "rs": ...
   */
  CONTENT_STYLE_BRS,
  /**
   * "styles": { "(styleId)": { "borderstyle": { "ls": ...
   */
  CONTENT_STYLE_BLS,
  /**
   * "styles": { "(styleId)": { "borderstyle": { "ts": ...
   */
  CONTENT_STYLE_BTS,
  /**
   * "styles": { "(styleId)": { "border": { "b": ...
   */
  CONTENT_STYLE_BBW,
  /**
   * "styles": { "(styleId)": { "border": { "r": ...
   */
  CONTENT_STYLE_BRW,
  /**
   * "styles": { "(styleId)": { "border": { "l": ...
   */
  CONTENT_STYLE_BLW,
  /**
   * "styles": { "(styleId)": { "border": { "t": ...
   */
  CONTENT_STYLE_BTW,
  /**
   * "styles": { "(styleId)": { "font": { "i": ...
   */
  CONTENT_STYLE_FONT_ITALIC,
  /**
   * "styles": { "(styleId)": { "font": { "sz": ...
   */
  CONTENT_STYLE_FONT_SIZE,
  /**
   * "styles": { "(styleId)": { "font": { "st": ...
   */
  CONTENT_STYLE_FONT_ST,
  /**
   * "styles": { "(styleId)": { "font": { "c": ...
   */
  CONTENT_STYLE_FONT_COLOR,
  /**
   * "styles": { "(styleId)": { "font": { "bd": ...
   */
  CONTENT_STYLE_FONT_BOLD,
  /**
   * "styles": { "(styleId)": { "font": { "n": ...
   */
  CONTENT_STYLE_FONT_NAME,
  /**
   * "styles": { "(styleId)": { "font": { "u": ...
   */
  CONTENT_STYLE_FONT_UL,
  /**
   * "styles": { "(styleId)": { "format": { "cur": ...
   */
  CONTENT_STYLE_FM_CUR,
  /**
   * "styles": { "(styleId)": { "format": { "clr": ...
   */
  CONTENT_STYLE_FM_COLOR,
  /**
   * "styles": { "(styleId)": { "format": { "code": ...
   */
  CONTENT_STYLE_FM_CODE,
  /**
   * "styles": { "(styleId)": { "format": { "cat": ...
   */
  CONTENT_STYLE_FM_CAT,
  /**
   * "sheets": { "(sheetId)": ...
   */
  CONTENT_SHEET,
  /**
   * "sheets": { "(sheetId)": { "rows": ...
   */
  CONTENT_SHEET_ROWS,
  /**
   * "sheets": { "(sheetId)": { "rows": { "(rowId)": ...
   */
  CONTENT_SHEET_ROW,
  /**
   * "sheets": { "(sheetId)": { "rows": { "(rowId)": { "(columnId)": ...
   */
  CONTENT_SHEET_ROW_CELL,
  /**
   * "sheets": { "(sheetId)": { "rows": { "(rowId)": { "(columnId)": { "(propertyName)": ...
   */
  CONTENT_SHEET_ROW_CELL_PROPS,
  /**
   * "names": { "(name)": { ...
   */
  CONTENT_NAME,
  /**
   * "unames": { "(name)": { ...
   */
  CONTENT_UNNAME,
  /**
   * "pnames": { "(name)": { ...
   */
  CONTENT_PNAME, //
  // reference.js fields
  /**
   * "sheets": { "(sheetId)": { ...
   */
  REFERENCE_SHEET,
  /**
   * "sheets": { "(sheetId)": { "(rowId)": {
   */
  REFERENCE_SHEET_ROW,
  /**
   * "sheets": { "(sheetId)": { "(rowId)": { "(columnId)": {
   */
  REFERENCE_SHEET_ROW_COLUMN,
  /**
   * "sheets": { "(sheetId)": { "(rowId)": { "(columnId)": { "cells": ...
   */
  REFERENCE_CELLS_LIST, //
  /**
   * "sheets": { "(sheetId)": { "(rowId)": { "(columnId)": { "ep": ...
   */
  REFERENCE_CELLS_ERRORPROPS,
  // preserve.js fields
  /**
   * "maxrow": { "(sheetId)": ...
   */
  PRESERVE_MAXROW,
  /**
   * "style": { "(sheetId)": ...
   */
  PRESERVE_STYLE_SHEET,
  /**
   * "style": { "(sheetId)": { "(rangeId)": ...
   */
  PRESERVE_STYLE_SHEET_RANGE,
  /**
   * "value": { "(sheetId)": ...
   */
  PRESERVE_VALUE_SHEET,
  /**
   * "value": { "(sheetId)": { "(rowId)": ...
   */
  PRESERVE_VALUE_SHEET_ROW,
  /**
   * "pnames": { "(nX)": ...
   */
  PRESERVE_RANGE,
  /**
   * "pnames": { "(nX)": { "(nX-Y)": ...
   */
  PRESERVE_RANGE_INNER,
  /**
   * "styles": { "(styleId)": { "dir": ...
   */
  CONTENT_STYLE_DIRECTION; //
}
