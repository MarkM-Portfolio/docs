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
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.Paint;
import java.awt.Stroke;
import java.awt.geom.GeneralPath;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

public class MetaRenderer
{
  protected Graphics2D g2d;

  protected MetaInputStream in;

  protected MetaHeader header;

  protected List<Command> cmdList = null;

  protected int targetWidth = 0;

  protected int targetHeight = 0;

  protected float scaleRatio = -1.0f;

  protected float xScale = 1.0f;

  protected float yScale = 1.0f;

  protected int offsetX = 0;

  protected int offsetY = 0;
  
  protected Stroke stroke;

  protected Paint strokePaint;

  protected Paint fillPaint;

  protected Font font;
  
  protected Paint textPaint = new Color(0,0,0);

  private int windingRule = GeneralPath.WIND_EVEN_ODD;
  
  protected int rop2Mode;

  public Graphics2D getGraphics()
  {
    return g2d;
  }
  
  public void setStroke(Stroke stroke)
  {
    this.stroke = stroke;
  }

  public void setStrokePaint(Paint strokePaint)
  {
    this.strokePaint = strokePaint;
  }
  
  public Paint getStrokePaint()
  {
    return this.strokePaint;
  }

  public void setFillPaint(Paint fillPaint)
  {
    this.fillPaint = fillPaint;
  }
  
  public Paint getFillPaint()
  {
    return this.fillPaint;
  }

  public void setFont(Font f)
  {
    this.font = f;
  }

  public int getWindingRule()
  {
    return this.windingRule;
  }

  public void setWindingRule(int windingRule)
  {
    this.windingRule = windingRule;
  }

  public int getOffsetX()
  {
    return offsetX;
  }

  public void setOffsetX(int offsetX)
  {
    this.offsetX = offsetX;
  }

  public int getOffsetY()
  {
    return offsetY;
  }

  public void setOffsetY(int offsetY)
  {
    this.offsetY = offsetY;
  }

  public float getXScale()
  {
    return xScale;
  }

  public void setXScale(float scale)
  {
    xScale = scale;
  }

  public float getYScale()
  {
    return yScale;
  }

  public void setYScale(float scale)
  {
    yScale = scale;
  }

  public float getScaleRatio()
  {
    return scaleRatio;
  }
  
  public void setTextPaint(Paint paint)
  {
    this.textPaint = paint;
  }

  public void setROP2Mode(int rop2Mode)
  {
    this.rop2Mode = rop2Mode;
  }
  
  public MetaRenderer(MetaInputStream in, float scaleRatio)
  {
    this.in = in;
    this.scaleRatio = scaleRatio;
  }

  public MetaRenderer(MetaInputStream in, int targetWidth, int targetHeight)
  {
    this.in = in;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
  }

  public MetaHeader getHeader() throws IOException
  {
    if (header == null)
    {
      parseMetaHeader();
    }
    return header;
  }

  public void paint(Graphics2D g2d) throws IOException
  {
    this.g2d = g2d;
    if (header == null)
    {
      parseMetaHeader();
    }
    if ( cmdList == null )
    {
      parseCommand();
    }
    
    for (int i=0;i<cmdList.size();i++)
    {
      Command cmd = cmdList.get(i);
      cmd.execute(this);
    }
  }

  protected void parseMetaHeader() throws IOException
  {
    header = in.readHeader();
    if( header == null )
      throw new RuntimeException("failed to parse meta file");

    if (scaleRatio > 0)
    {
      targetWidth = (int) (header.getWidth() * scaleRatio);
      targetHeight = (int) (header.getHeight() * scaleRatio);
    }
    else
    {
      scaleRatio = Math.min(targetWidth / (float) header.getWidth(), (float) targetHeight /  header.getHeight());
      targetWidth = (int) (header.getWidth() * scaleRatio);
      targetHeight = (int) (header.getHeight() * scaleRatio);
    }
  }

  protected void parseCommand() throws IOException
  {
    cmdList = new ArrayList<Command>();
    Command cmd = null;
    while (true)
    {
      cmd = in.readCommand();
      if (cmd != null)
      {
        cmdList.add(cmd);
      }
      else
      {
        break;
      }
    }
  }

  
  private static class DC 
  {
    Stroke stroke;
    Paint strokePaint;
    Paint fillPaint;
    Font font;
    Paint textPaint;
    int windingRule;
     
  }
  
  private Stack<DC> dcStack = new Stack<DC>();
  
  public void saveDC()
  {
    DC dc = new DC();
    dc.stroke = g2d.getStroke();
    dc.strokePaint = this.strokePaint;
    dc.fillPaint = this.fillPaint;
    dc.font = this.font;
    dc.textPaint = this.textPaint;
    dc.windingRule = this.windingRule;
    dcStack.push(dc);
  }
  
  public void restoreDC()
  {
    if(! dcStack.empty() )
    {
      DC dc = dcStack.pop();
      if( dc.stroke != null)
      {
        g2d.setStroke(dc.stroke);
        this.stroke = dc.stroke;
      }
      this.strokePaint = dc.strokePaint;
      this.fillPaint = dc.fillPaint;
      this.windingRule = dc.windingRule;
      this.font = dc.font;
      this.textPaint = dc.textPaint;
    }
  }
}
