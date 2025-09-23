/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.io;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public class XMLFilterInputStream extends FilterInputStream
{

  public XMLFilterInputStream(InputStream in)
  {
    super(in);
  }

  public int read() throws IOException {
    int b = in.read();
    if(b < 0 || b >= 0x80)
      return 'a';
    return b;
  }


  public int read(byte b[]) throws IOException {
    return read(b, 0, b.length);
  }

  public int read(byte b[], int off, int len) throws IOException {
    int count = in.read(b, off, len);
    for(int i = 0; i < count; i++)
    {
      int b0 = b[i];
      if(b0 <0 || b0 >= 0x80)
      {
        b[i] = 'a';
      }
      else if( b0 == 0x0D)
      {
        b[i] = '@';
        if( (i + 1 < count) && (b[i+1] == 0x0A))
          b[i+1] = '@';
      }
    }
    return count;
  }

}
