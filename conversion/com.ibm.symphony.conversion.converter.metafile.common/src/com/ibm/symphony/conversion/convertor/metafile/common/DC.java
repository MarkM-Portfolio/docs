/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.convertor.metafile.common;

import java.awt.Color;
import java.awt.Paint;
import java.awt.Shape;
import java.awt.Stroke;
import java.awt.geom.AffineTransform;
import java.awt.geom.GeneralPath;

public class DC
{
  public Paint paint;
  public Stroke stroke;
  public Paint strokePaint;
  public Paint fillPaint;
  public AffineTransform transform;
  public Shape clip;
  public GeneralPath path;
  public int polyFillMode;
  public int meterLimit;
  public int scaleMode;
  public AffineTransform pathTransform;
}
