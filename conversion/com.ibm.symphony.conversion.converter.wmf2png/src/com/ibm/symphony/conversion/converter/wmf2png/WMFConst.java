/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png;



public class WMFConst
{
  private static int list[] = new int[0xfff];

  private static WMFConst instance = new WMFConst();

  final public static int AbortDoc = 0x0052;

  final public static int Arc = 0x0817;

  final public static int Chord = 0x0830;

  final public static int Ellipse = 0x0418;

  final public static int EndDoc = 0x005E;

  final public static int EndPage = 0x0050;

  final public static int ExcludeClipRect = 0x0415;

  final public static int ExtFloodFill = 0x0548;

  final public static int FillRegion = 0x0228;

  final public static int FloodFill = 0x0419;

  final public static int FrameRegion = 0x0429;

  final public static int IntersectClipRect = 0x0416;

  final public static int InvertRegion = 0x012A;

  final public static int LineTo = 0x0213;

  final public static int MoveTo = 0x0214;

  final public static int OffsetClipRgn = 0x0220;

  final public static int OffsetViewportOrg = 0x0211;

  final public static int OffsetWindowOrg = 0x020F;

  final public static int PaintRegion = 0x012B;

  final public static int PatBlt = 0x061D;

  final public static int Pie = 0x081A;

  final public static int RealizePalette = 0x0035;

  final public static int Rectangle = 0x041B;

  final public static int ResetDc = 0x014C;

  final public static int ResizePalette = 0x0139;

  final public static int RestoreDC = 0x0127;

  final public static int RoundRect = 0x061C;

  final public static int SaveDC = 0x001E;

  final public static int ScaleViewportExt = 0x0412;

  final public static int ScaleWindowExt = 0x0410;

  final public static int SelectClipRegion = 0x012C;

  final public static int SelectObject = 0x012D;

  final public static int SelectPalette = 0x0234;

  final public static int SetBkColor = 0x0201;

  final public static int SetBkMode = 0x0102;

  final public static int SetDibToDev = 0x0d33;

  final public static int SetMapMode = 0x0103;

  final public static int SetMapperFlags = 0x0231;

  final public static int SetPalEntries = 0x0037;

  final public static int SetPixel = 0x041F;

  final public static int SetPolyFillMode = 0x0106;

  final public static int SetRelabs = 0x0105;

  final public static int SetROP2 = 0x0104;

  final public static int SetStretchBltMode = 0x0107;

  final public static int SetTextAlign = 0x012E;

  final public static int SetTextCharExtra = 0x0108;

  final public static int SetTextColor = 0x0209;

  final public static int SetTextJustification = 0x020A;

  final public static int SetViewportExt = 0x020E;

  final public static int SetViewportOrg = 0x020D;

  final public static int SetWindowExt = 0x020C;

  final public static int SetWindowOrg = 0x020B;

  final public static int StartDoc = 0x014D;

  final public static int StartPage = 0x004F;

  final public static int AnimatePalette = 0x0436;

  final public static int BitBlt = 0x0922;

  final public static int CreateBitmap = 0x06FE;

  final public static int CreateBitmapIndirect = 0x02FD;

  final public static int CreateBrush = 0x00F8;

  final public static int CreateBrushIndirect = 0x02FC;

  final public static int CreateFontIndirect = 0x02FB;

  final public static int CreatePalette = 0x00F7;

  final public static int CreatePatternBrush = 0x01F9;

  final public static int CreatePenIndirect = 0x02FA;

  final public static int CreateRegion = 0x06FF;

  final public static int DeleteObject = 0x01F0;

  final public static int DibBitblt = 0x0940;

  final public static int DibCreatePatternBrush = 0x0142;

  final public static int DibStretchBlt = 0x0B41;

  final public static int DrawText = 0x062F;

  final public static int Escape = 0x0626;

  final public static int ExtTextOut = 0x0A32;

  final public static int Polygon = 0x0324;

  final public static int PolyPolygon = 0x0538;

  final public static int Polyline = 0x0325;

  final public static int TextOut = 0x0521;

  final public static int StretchBlt = 0x0B23;

  final public static int StretchDIBits = 0x0F43;

  private WMFConst()
  {
    list[0x0436] = 1;
    list[0x0922] = 1;
    list[0x06FE] = 1;
    list[0x02FD] = 1;
    list[0x00F8] = 1;
    list[0x02FC] = 1;
    list[0x02FB] = 1;
    list[0x00F7] = 1;
    list[0x01F9] = 1;
    list[0x02FA] = 1;
    list[0x06FF] = 1;
    list[0x0940] = 1;
    list[0x0142] = 1;
    list[0x0B41] = 1;
    list[0x062F] = 1;
    list[0x0626] = 1;
    list[0x0A32] = 1;
    list[0x0324] = 1;
    list[0x0538] = 1;
    list[0x0325] = 1;
    list[0x0521] = 1;
    list[0x0B23] = 1;
    list[0x0F43] = 1;
  }

  public static WMFConst getInstance()
  {
    return instance;
  }

  public static int getRecordType(int idx)
  {
    if (idx > 0xfff || idx < 0)
    {
      return -1;
    }

    return list[idx];
  }

//  final public static Mode[] porterDuffMode = PorterDuff.Mode.values();

  public static final int R2_BLACK = 1;

  public static final int R2_NOTMERGEPEN = 2;

  public static final int R2_MASKNOTPEN = 3;

  public static final int R2_NOTCOPYPEN = 4;

  public static final int R2_MASKPENNOT = 5;

  public static final int R2_NOT = 6;

  public static final int R2_XORPEN = 7;

  public static final int R2_NOTMASKPEN = 8;

  public static final int R2_MASKPEN = 9;

  public static final int R2_NOTXORPEN = 10;

  public static final int R2_NOP = 11;

  public static final int R2_MERGENOTPEN = 12;

  public static final int R2_COPYPEN = 13;

  public static final int R2_MERGEPENNOT = 14;

  public static final int R2_MERGEPEN = 15;

  public static final int R2_WHITE = 16;
  
  public static final int ALTERNATE = 1;
}
