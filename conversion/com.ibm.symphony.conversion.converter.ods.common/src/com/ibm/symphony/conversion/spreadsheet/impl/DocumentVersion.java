package com.ibm.symphony.conversion.spreadsheet.impl;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant.DocumentFeature;

/**
 * Enums all document versions that have been used.
 */
public enum DocumentVersion {
  /**
   * Version before 1.0, uses long JSON keys.
   */
  BEFORE_1_0_0(null),
  /**
   * Version that uses abbr. JSON keys. The document may have been partial loaded and saved while applying message so need to re-calculate
   * formulas, max row, column indexes and vref, etc.
   */
  VERSION_1_0_0("1.0"),
  /**
   * Version used after model refactor for SC Apr. release. The document is serializes as a whole when applying message. No need to
   * re-caculate formula.
   */
  VERSION_1_0_1("1.01"),
  /**
   * Version used after cell type is implemented.
   */
  VERSION_1_0_2("1.02"),
  /*
   * Version that style use short key
   */
  VERSION_1_0_3("1.03"),
  /*
   * use MS Excel formula format in json
   */
  VERSION_1_0_4("1.04"),
  /*
   * Version used to be compliance with draft version for Conditional Formatting in OOXML
   */
  VERSION_1_0_5("1.05");

  private String version;

  DocumentVersion(String v)
  {
    version = v;
  }

  /**
   * <p>
   * Determine if current document version has a certain feature. This should be a standard API to check document features, before adding
   * back-compatible code.
   * 
   * @param feature
   * @return
   */
  public boolean hasFeature(DocumentFeature feature)
  {
    switch (feature)
      {
        case ABBR_NAME :
          return this == BEFORE_1_0_0;
        case ALWAYS_UPDATED_FORMULA :
          return this != BEFORE_1_0_0 && this != VERSION_1_0_0;
        case TYPED_CELL :
          return this != BEFORE_1_0_0 && this != VERSION_1_0_0 && this != VERSION_1_0_1;
        default:
          return false;
      }
  }

  public String toString()
  {
    return version;
  }

  public static DocumentVersion parseVersionString(String v)
  {
    if (v == null)
    {
      return BEFORE_1_0_0;
    }
    else if ("1.0".equals(v))
    {
      return VERSION_1_0_0;
    }
    else if ("1.01".equals(v))
    {
      return VERSION_1_0_1;
    }
    else if ("1.02".equals(v))
    {
      return VERSION_1_0_2;
    }
    else if ("1.03".equals(v))
    {
      return VERSION_1_0_3;
    }
    else if ("1.04".equals(v))
    {
      return VERSION_1_0_4;
    }
    else if ("1.05".equals(v))
    {
      return VERSION_1_0_5;
    }
    else
    {
      return BEFORE_1_0_0;
    }
  }
}

