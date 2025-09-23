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

import java.io.InputStream;

public class EMFInputStream 
//extends org.freehep.graphicsio.emf.EMFInputStream
{

  public EMFInputStream(InputStream is)
  {
 //   super(is);
  }
  
  public int readDWORD()
  {
    int ret = 0;
    try
    {
//      ret = super.readDWORD();
    }
    catch( Exception e)
    {
      
    }
    return ret;
  }
  

}
