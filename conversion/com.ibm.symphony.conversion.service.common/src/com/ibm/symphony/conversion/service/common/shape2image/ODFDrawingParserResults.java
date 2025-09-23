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

public class ODFDrawingParserResults
{
  private ODFDrawingParser ivDrawingParser = null;

  private boolean ivGenerateShapeAsSvg = false;

  private boolean ivGenerateShapeAsImage = true;

  public static final ODFDrawingParserResults createODFDrawingParserResults(ODFDrawingParser drawingParser)
  {
    ODFDrawingParserResults results = new ODFDrawingParserResults();
    results.setDrawingParser(drawingParser);
    results.setGenerateShapeAsSvg(drawingParser.generateShapeAsSvg());
    results.setGenerateShapeAsImage(drawingParser.generateShapeAsImage());
    return results;
  }

  public static final ODFDrawingParserResults createODFDrawingParserResults(ODFDrawingParser drawingParser, boolean shapeHasImage,
      boolean shapeHasSvg)
  {
    ODFDrawingParserResults results = new ODFDrawingParserResults();
    results.setDrawingParser(drawingParser);
    results.setGenerateShapeAsSvg(shapeHasSvg);
    results.setGenerateShapeAsImage(shapeHasImage);
    return results;
  }

  private final void setDrawingParser(ODFDrawingParser drawingParser)
  {
    this.ivDrawingParser = drawingParser;
  }

  public final ODFDrawingParser getDrawingParser()
  {
    return (this.ivDrawingParser);
  }

  private final void setGenerateShapeAsSvg(boolean generateAsSvg)
  {
    this.ivGenerateShapeAsSvg = generateAsSvg;
  }

  public final boolean generateShapeAsSvg()
  {
    return this.ivGenerateShapeAsSvg;
  }

  private final void setGenerateShapeAsImage(boolean generateAsImage)
  {
    this.ivGenerateShapeAsImage = generateAsImage;
  }

  public final boolean generateShapeAsImage()
  {
    return this.ivGenerateShapeAsImage;
  }
}
