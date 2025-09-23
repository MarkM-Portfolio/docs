/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf;

public class ByteUtil
{
  public static int readUByte(byte[] b)
  {
    if (b == null)
    {
      return -1;
    }

    return b[0] & 0xff;
  }

  public static int readWord(byte b1, byte b2)
  {
    return ((b2 & 0xff) << 8) | (b1 & 0xff);
  }
  
  public static int readWord(int b1, int b2)
  {
    return ((b2 & 0xff) << 8) | (b1 & 0xff);
  }

  public static int BLInt(int x)
  {
    return (x << 24) | ((x & 0x0000ff00) << 8) | ((x & 0x00ff0000) >> 8) | (x >>> 24);
  }

  
  public static long toUnsign(int x)
  {
    return ( 0L | ( x >>> 1 ) ) << 1 | ( x & 1); 
  }
  

  public static int BLWord(int x)
  {
    return ((x << 8) & 0xffff) | ((x >>> 8) & 0xff);
  }

  public static short BLSignedWord(int x)
  {
    short tmp = (short) (((x << 8) & 0xffff) | ((x >>> 8) & 0xff));
    return tmp;
  }

  public static int readInt(byte b1, byte b2, byte b3, byte b4)
  {
    return ((b4 & 0xff) << 24) | ((b3 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b1 & 0xff);
  }
  
  public static int readInt(int b1, int b2, int b3, int b4)
  {
    return ((b4 & 0xff) << 24) | ((b3 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b1 & 0xff);
  }

}
