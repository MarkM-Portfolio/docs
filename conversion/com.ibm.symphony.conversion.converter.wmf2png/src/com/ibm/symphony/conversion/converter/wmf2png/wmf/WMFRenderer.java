/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png.wmf;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Paint;
import java.awt.Shape;
import java.awt.geom.Line2D;
import java.awt.geom.Point2D;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.WMFConst;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.cmd.CreateObject;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.cmd.SetWindowExt;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.cmd.SetWindowOrg;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaRenderer;

public class WMFRenderer extends MetaRenderer
{
  private CreateObject[] objectTable;

  private int[] availIdx;
  
  private int textAlignment = 0;
  
  private Point2D.Float linePos = null; 
  
  public void moveTo(Point2D.Float p)
  {
    linePos = p;
  }
  
  public void lineTo(Point2D.Float p)
  {
    if( linePos != null)
    {
      Line2D.Float line = new Line2D.Float(linePos.x, linePos.y, p.x, p.y);
      drawShape(line);      
    }    
    moveTo(p);
  }

  public void setTextAlignment(int textAlignment)
  {
    this.textAlignment = textAlignment;
  }

  public WMFRenderer(MetaInputStream in)
  {
    super(in, 1.0f);
  }
  
  public WMFRenderer(MetaInputStream in, float scaleRatio)
  {
    super(in, scaleRatio);
  }

  public WMFRenderer(MetaInputStream in, int targetWidth, int targetHeight)
  {
    super(in, targetWidth, targetHeight);
  }

  @Override
  public void paint(Graphics2D g2d) throws IOException
  {
    rop2Mode = WMFConst.R2_NOP;
    super.paint(g2d);
  }

  private int getAvailableIndex()
  {
    for (int i = 0; i < availIdx.length; i++)
    {
      if (availIdx[i] == 0)
      {
        return i;
      }
    }
    return -1;
  }

  @Override
  protected void parseMetaHeader() throws IOException
  {
    super.parseMetaHeader();
    
    WMFHeader header = (WMFHeader) this.header;
    objectTable = new CreateObject[header.getNumOfObj()];
    availIdx = new int[header.getNumOfObj()];
    
    if(! header.placeableWMF || header.getWidth() == 0 || header.getHeight() == 0 )
    {
      //Re calculate size for the wmf;
      parseCommand();
      boolean leftTop = false;
      boolean rightBottom = false;
      for(int i = cmdList.size() - 1;i>=0;i--)
      {
        Command cmd = cmdList.get(i);
        if( cmd instanceof SetWindowOrg )
        {
          SetWindowOrg wmfCmd = (SetWindowOrg) cmd;
          header.left = wmfCmd.getOffsetX();
          header.top = wmfCmd.getOffsetY();
          leftTop = true;
        }
        else if( cmd instanceof SetWindowExt )
        {
          SetWindowExt wmfCmd = (SetWindowExt) cmd;
          header.right = wmfCmd.getX();
          header.bottom = wmfCmd.getY();
          rightBottom = true;
        }
        if( leftTop && rightBottom)
        {
          /*
          header.setWidth(Math.abs(header.right - header.left));
          header.setHeight(Math.abs(header.bottom - header.top));
          scaleRatio = Math.min(targetWidth / (float) header.getWidth(), (float) targetHeight /  header.getHeight());
          */
          break;
        }
      }
      if( rightBottom )
      {
        header.setWidth(Math.abs(header.right));
        header.setHeight(Math.abs(header.bottom));
        scaleRatio = Math.max(targetWidth / (float) header.getWidth(), (float) targetHeight /  header.getHeight());
      }
    }
  }

  public void storeObject(CreateObject cmd)
  {
    int idx = getAvailableIndex();
    objectTable[idx] = cmd;
    availIdx[idx] = -1;
  }

  public CreateObject selectObject(int index)
  {
    return objectTable[index];
  }

  public void delectObject(int index)
  {
    objectTable[index] = null;
    availIdx[index] = 0;
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
    processFillPaint();
    g2d.fill(shape);
    drawShape(shape);
  }

  protected void processFillPaint()
  {
    if (rop2Mode == WMFConst.R2_BLACK)
    {
      g2d.setComposite(AlphaComposite.SrcOver);
      g2d.setPaint(Color.black);
    }
    // R2_COPYPEN Pixel is the pen color.
    else if (rop2Mode == WMFConst.R2_COPYPEN || rop2Mode == WMFConst.R2_NOP)
    {
      g2d.setComposite(AlphaComposite.SrcOver);
      if (fillPaint != null)
      {
        g2d.setPaint(fillPaint);
      }
    }
    // R2_WHITE Pixel is always 1.
    else if (rop2Mode == WMFConst.R2_WHITE)
    {
      g2d.setComposite(AlphaComposite.SrcOver);
      g2d.setPaint(Color.white);
    }
    // R2_NOTCOPYPEN Pixel is the inverse of the pen color.
    else if (rop2Mode == WMFConst.R2_NOTCOPYPEN)
    {
      g2d.setComposite(AlphaComposite.SrcOver);
      // TODO: set at least inverted color if paint is a color
    }
    // R2_XORPEN Pixel is a combination of the colors
    // in the pen and in the screen, but not in both.
    else if (rop2Mode == WMFConst.R2_XORPEN)
    {
      g2d.setComposite(AlphaComposite.Xor);
    }
  }
  
  public void drawText(String text, float x, float y)
  {
    int yOffset = 0;
    if( font != null)
    {
      g2d.setFont(font);
      yOffset = font.getSize();
      if( (textAlignment & 0x0018) != 0 )
      {
        //base line
        yOffset = 0;
      }
    }
    
    Paint oldPaint = null;
    if( textPaint != null )
    {
      oldPaint = g2d.getPaint();
      g2d.setPaint(textPaint);
    }
    
    g2d.drawString(text, x, y + yOffset);
    
    if( oldPaint != null )
      g2d.setPaint(oldPaint);
  }
}
