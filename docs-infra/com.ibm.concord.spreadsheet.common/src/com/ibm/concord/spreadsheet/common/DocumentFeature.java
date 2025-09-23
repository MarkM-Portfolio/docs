package com.ibm.concord.spreadsheet.common;

/**
 * Document feature items (in developer's view) implemented in draft JSON.
 */
public enum DocumentFeature {
  /**
   * JSON property name is abbred. Introduced after document version 1.0
   */
  ABBR_NAME,
  /**
   * Formula in draft JSON is always updated and don't need to be updated during partial load.
   */
  ALWAYS_UPDATED_FORMULA,
  /**
   * Cell has precise type marked in JSON.
   */
  TYPED_CELL,
  /**
   * More JSON property name is abbred, including font and number format properties
   */
  MORE_ABBR_NAME,
  /**
   * Shape is in draft, without text box.
   */
  SHAPE_WITHOUT_TXT;
}
