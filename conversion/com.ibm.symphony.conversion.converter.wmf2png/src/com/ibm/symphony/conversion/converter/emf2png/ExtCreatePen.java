/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.emf2png;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.IOException;

//import org.freehep.graphicsio.emf.EMFTag;
//import org.freehep.util.io.Tag;
//import org.freehep.util.io.TaggedInputStream;
//import org.freehep.graphicsio.emf.EMFInputStream;
//import org.freehep.graphicsio.emf.gdi.ExtLogPen;

public class ExtCreatePen //extends org.freehep.graphicsio.emf.gdi.ExtCreatePen
{
  public ExtCreatePen()
  {
 //   super();
  }
  
  public ExtCreatePen(int index, ExtLogPen extLogPen)
  {
 //   super(index, extLogPen);
  }
  /*
  public Tag read(int tagID, TaggedInputStream emf, int len) throws IOException
  {
    return read(tagID, (EMFInputStream)emf, len);
  }

  public EMFTag read(int tagID, EMFInputStream emf, int len) throws IOException
  {

    int index = emf.readDWORD();
    // int bmiOffset =  emf.readDWORD();
    // int bmiSize =  emf.readDWORD();
    // int brushOffset =  emf.readDWORD();
    // int brushSize =  emf.readDWORD();
    
    int penStyle = emf.readDWORD();
    int penWidth = emf.readDWORD();
    int brushStyle = emf.readDWORD();
    Color color = emf.readCOLORREF();
    
    emf.readBYTE( len - (4 * 8 + 4)  );
    
    return new ExtCreatePen(index, new ExtLogPen(penStyle, penWidth, brushStyle, color, 0, new int[0]));
  }
*/
}
