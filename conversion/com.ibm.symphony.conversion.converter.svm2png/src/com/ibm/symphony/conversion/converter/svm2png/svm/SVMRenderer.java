/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png.svm;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Shape;
import java.io.IOException;
import java.text.AttributedString;
import java.util.ArrayList;
import java.util.Stack;

import com.ibm.symphony.conversion.converter.svm2png.SVMFont;
import com.ibm.symphony.conversion.converter.svm2png.SVMStackObject;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaRenderer;

public class SVMRenderer extends MetaRenderer
{
  int fillAlpha = 255;
  int lineAlpha = 255;
  Stack<SVMStackObject> statusStack = new Stack<SVMStackObject>();
  boolean mbLineColor = true;
  boolean mbFillColor = true;
  int recordCnt = 0;
  int textAlign = 0;
  SVMFont svmFont; 
  
  public SVMRenderer(MetaInputStream in)
  {
    super(in, 1.0f);
  } 
  
  public SVMRenderer(MetaInputStream in, float scaleRatio)
  {
    super(in, scaleRatio);
  }

  public SVMRenderer(MetaInputStream in, int targetWidth, int targetHeight)
  {
    super(in, targetWidth, targetHeight);
  }

  @Override
  public void paint(Graphics2D g2d) throws IOException
  {
    super.paint(g2d);
  }
  
  @Override
  protected void parseMetaHeader() throws IOException
  {
    super.parseMetaHeader();
    
    SVMHeader header = (SVMHeader) this.header;
    setOffsetX(header.offsetX);
    setOffsetY(header.offsetY);
    setXScale(header.scaleX);
    setYScale(header.scaleY);
    recordCnt = header.recordCnt;
  }
  
  protected void parseCommand() throws IOException
  {
    cmdList = new ArrayList<Command>();
    Command cmd = null;
    int i = 0;
    while (i++ < recordCnt)
    {
      cmd = in.readCommand();
      cmdList.add(cmd);
    }
  }
  
  public void setFillPaint(Color fillColor)
  {
    if(fillColor != null)
    {
      Color color = new Color(fillColor.getRed(),fillColor.getGreen(), 
          fillColor.getBlue(),fillAlpha);
      this.fillPaint = color;
    }
    else
      setFillAlpha();
  }
  
  public void setStrokePaint(Color strokeColor)
  {
    if(strokeColor != null)
    {
      Color color = new Color(strokeColor.getRed(),strokeColor.getGreen(), 
          strokeColor.getBlue(),lineAlpha);
      this.strokePaint = color;
    }
    else
      setLineAlpha();
  }
  
  public void setFillAlpha(int fillAlpha)
  {
    this.fillAlpha = fillAlpha;
  }
  
  public void setLineAlpha(int lineAlpha)
  {
    this.lineAlpha = lineAlpha;
  }
  
  public void setFillAlpha()
  {
    if(fillPaint != null)
    {
      Color fillColor = (Color)fillPaint;
      Color color = new Color(fillColor.getRed(),fillColor.getGreen(), 
          fillColor.getBlue(),fillAlpha);
      fillPaint = color;
    }
  }
  
  public void setLineAlpha()
  {
    if(strokePaint != null)
    {
      Color strokeColor = (Color)strokePaint;
      Color color = new Color(strokeColor.getRed(),strokeColor.getGreen(), 
          strokeColor.getBlue(),lineAlpha);
      strokePaint = color;
    }
  }
  
  public boolean getMBLineColor()
  {
    return mbLineColor;
  }
  
  public void setMBLineColor(boolean mbLineColor)
  {
    this.mbLineColor = mbLineColor;
  }
  
  public boolean getMBFillColor()
  {
    return mbFillColor;
  }
  
  public void setMBFillColor(boolean mbFillColor)
  {
    this.mbFillColor = mbFillColor;
  }
  
  public int getTextAlign()
  {
    return textAlign;
  }
  
  public void setTextAlign(int textAlign)
  {
    this.textAlign = textAlign;
  }
  
  public SVMFont getSVMFont()
  {
    return svmFont;
  }
  
  public void setSVMFont(SVMFont svmFont)
  {
    this.svmFont = svmFont;
  }
  
  public Stack<SVMStackObject> getStatusStack()
  {
    return statusStack;
  }

  public void drawShape(Shape shape)
  {
    if (stroke != null)
    {
      g2d.setStroke(stroke);
    }
    if (strokePaint != null)
    {
      g2d.setPaint(strokePaint);
    }
    g2d.draw(shape);
  }

  public void fillAndDrawShape(Shape shape)
  {
    drawShape(shape);
    processFillPaint();
    g2d.fill(shape);
  }
  
  public void processFillPaint()
  {
//    g2d.setComposite(AlphaComposite.SrcOver);
    g2d.setPaint(fillPaint);
  }
  
  public void drawText(String text, float x, float y)
  {
    if( textPaint != null )
      g2d.setPaint(textPaint);
    
    if( svmFont != null)
    {
      AttributedString as = svmFont.getAttributedString(text);       
      g2d.drawString(as.getIterator(), x, y);  
      return;
    }
    
    g2d.drawString(text, x, y);
  }
}
