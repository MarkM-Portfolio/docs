/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

/**
 * General class to help with the line or connector markers. This basically is the graphics that are attached to a line and can be
 * represented as a number of shapes.
 * 
 * Until full SVG support is used, many of the shapes are defined in this file. Currently we support circles, squares, arrows and diamonds
 * for the markers.
 * 
 */
public class MarkerTransform
{
  // ================================================================================================
  // Marker path and viewbox Constant Definitions
  // ================================================================================================
  public final static String ARROWENDPATH = "M 0 0 L 30 10 L 0 20 z";

  public final static String ARROWSTARTPATH = "M 0 10 L 30 0 L 30 20 z";

  public final static String SQUAREMARKERPATH = "M 0 0 L 10 0 L 10 10 L 0 10 z";

  public final static String CIRCLEMARKERPATH = "m462 1118-102-29-102-51-93-72-72-93-51-102-29-102-13-105 13-102 29-106 51-102 72-89 93-72 102-50 102-34 106-9 101 9 106 34 98 50 93 72 72 89 51 102 29 106 13 102-13 105-29 102-51 102-72 93-93 72-98 51-106 29-101 13z";

  public final static String DIAMONDMARKERPATH = "M 0 135 L 135 270 L 270 135 L 135 0 z";

  public final static String DIMENSIONMARKERPATH = "M 0 0 L 0 400 L 10 400 L 10 0 z";

  public final static String ARROWMARKERVIEWBOX = "0 0 30 20";

  public final static String SQUAREMARKERVIEWBOX = "0 0 10 10";

  public final static String CIRCLEMARKERVIEWBOX = "0 0 1131 1131";

  public final static String DIAMONDMARKERVIEWBOX = "0 0 270 270";

  public final static String DIMENSIONMARKERVIEWBOX = "0 0 10 400";

  public final static String DEFAULTMARKERPATH = CIRCLEMARKERPATH;

  public final static String DEFAULTMARKERVIEWBOX = CIRCLEMARKERVIEWBOX;

  // ================================================================================================
  // Enum to handle the different supported marker types
  // ================================================================================================
  public enum MarkerTypes {
    ArrowStart, ArrowEnd, Square, Circle, Diamond, Dimension;
    public static boolean isDiamond(String type)
    {
      return type.equals(Diamond.toString());
    }

    public static boolean isArrowStart(String type)
    {
      return type.equals(ArrowStart.toString());
    }

    public static boolean isArrowEnd(String type)
    {
      return type.equals(ArrowEnd.toString());
    }

    public static boolean isSquare(String type)
    {
      return type.equals(Square.toString());
    }

    public static boolean isCircle(String type)
    {
      return type.equals(Circle.toString());
    }

    public static boolean isDimension(String type)
    {
      return type.equals(Dimension.toString());
    }
  };

  // ================================================================================================
  // General Constants
  // ================================================================================================

  public final static String START = "Start";

  public final static String END = "End";

  public final static String ARROW = "Arrow";

  public final static String CIRCLE = MarkerTypes.Circle.toString();

  public final static String DIMENSION = MarkerTypes.Dimension.toString();

  public final static String DIAMOND = MarkerTypes.Diamond.toString();

  public final static String SQUARE = MarkerTypes.Square.toString();

  public final static String DIAMOND_SQUARE = "Square_20_45";

  // ================================================================================================
  // Instance Variables
  // ================================================================================================

  private String ivType;

  private String ivStyleName;

  private double ivRefX = 566.0;

  private double ivRefY = 566.0;

  private String ivPath = DEFAULTMARKERPATH;

  private String ivViewbox = DEFAULTMARKERVIEWBOX;

  private double ivRatio = 1.0;

  private double ivWidthToHeightRatio = 1.0;
  
  // ================================================================================================
  // Constructor / Initialization Methods
  // ================================================================================================

  public MarkerTransform(String markerType, double ratio, String orient)
  {
    this.ivRatio = ratio;
    
    if (markerType.contains(ARROW))
    {
      initForArrow(markerType, orient);
    }
    else if (markerType.equals(DIAMOND_SQUARE))
    {
      initForDiamond(markerType, orient);
    }
    else if (markerType.contains(SQUARE))
    {
      initForSquare(markerType, orient);
    }
    else if (markerType.contains(CIRCLE))
    {
      initForCircle(markerType, orient);
    }
    else if (markerType.contains(DIMENSION))
    {
      initForDimension(markerType, orient);
    }
    else
    {
      this.ivType = markerType;
      this.ivStyleName = markerType;
    }
  }

  /**
   * Initializes MarkerTransform for Arrows
   */
  private void initForArrow(String markerType, String orient)
  {
    this.ivType = ARROW + orient;
    this.ivStyleName = ARROW;
    this.ivRefY = 10.0;
    this.ivViewbox = ARROWMARKERVIEWBOX;
    this.ivWidthToHeightRatio = 2.0 / 3.0;
    if (orient.equals(START))
    {
      this.ivRefX = 29.0;
      this.ivPath = ARROWSTARTPATH;
    }
    else
    {
      this.ivRefX = 1.0;
      this.ivPath = ARROWENDPATH;
    }
  }

  /**
   * Initializes MarkerTransform for Squares
   */
  private void initForSquare(String markerType, String orient)
  {
    this.ivType = markerType;
    this.ivStyleName = markerType;
    this.ivRefX = 0.0;
    this.ivRefY = 5.0;
    this.ivWidthToHeightRatio = 1.0;
    this.ivViewbox = SQUAREMARKERVIEWBOX;
    this.ivPath = SQUAREMARKERPATH;
  }

  /**
   * Initializes MarkerTransform for Circles
   */
  private void initForCircle(String markerType, String orient)
  {
    this.ivType = markerType;
    this.ivStyleName = markerType;
    this.ivRefX = 0.0;
    this.ivRefY = 566.0;
    this.ivWidthToHeightRatio = 1.0;
    this.ivViewbox = CIRCLEMARKERVIEWBOX;
    this.ivPath = CIRCLEMARKERPATH;
  }

  /**
   * Initializes MarkerTransform for Diamonds
   */
  private void initForDiamond(String markerType, String orient)
  {
    this.ivType = DIAMOND;
    this.ivStyleName = markerType;
    this.ivRefX = 1.0;
    this.ivRefY = 85.0;
    this.ivWidthToHeightRatio = 85.0 / 120.0;
    this.ivViewbox = DIAMONDMARKERVIEWBOX;
    this.ivPath = DIAMONDMARKERPATH;
  }

  /**
   * Initializes MarkerTransform for Dimension Lines
   */
  private void initForDimension(String markerType, String orient)
  {
    this.ivType = DIMENSION;
    this.ivStyleName = markerType;
    this.ivRefX = 0.0;
    this.ivRefY = 200.0;
    this.ivWidthToHeightRatio = 1.0;
    this.ivViewbox = DIMENSIONMARKERVIEWBOX;
    this.ivPath = DIMENSIONMARKERPATH;
  }

  // ================================================================================================
  // Public Getter Methods
  // ================================================================================================

  /**
   * Gets the Marker Type
   */
  public String getType()
  {
    return this.ivType;
  }

  /**
   * Gets the Marker Style Name
   */
  public String getStyleName()
  {
    return this.ivStyleName;
  }

  /**
   * Defines the refX value used in the svg file
   */
  public double refX()
  {
    return this.ivRefX;
  }

  /**
   * Defines the refY value used in the svg file
   */
  public double refY()
  {
    return this.ivRefY;
  }

  /**
   * Defines the viewbox value used in the svg file
   */
  public String viewBox()
  {
    return this.ivViewbox;
  }

  /**
   * Defines the path value used in the svg file. This is the main definition of the shape. Can be relative or absolute
   */
  public String path()
  {
    return this.ivPath;
  }

  /**
   * Defines the ratio of marker height ratio used in the svg file
   */
  public double getMarkerHeightRatio()
  {
    return this.ivRatio * this.ivWidthToHeightRatio;
  }

  /**
   * Defines the ratio of marker width ratio used in the svg file
   */
  public double getMarkerWidthRatio()
  {
    if (MarkerTypes.isDimension(this.ivType))
    {
      return 1; // The Marker width is the same width as the stroke width (1:1)
    }
    return this.ivRatio;
  }
}
