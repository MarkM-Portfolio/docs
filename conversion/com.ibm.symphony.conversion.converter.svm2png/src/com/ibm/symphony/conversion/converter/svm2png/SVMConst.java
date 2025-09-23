/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png;

public class SVMConst {
	private static SVMConst instance = new SVMConst();
	
	final public static int META_NULL_ACTION = 0;
	final public static int META_PIXEL_ACTION = 100;
	final public static int META_POINT_ACTION = 101;
	final public static int META_LINE_ACTION = 102;
	final public static int META_RECT_ACTION = 103;
	final public static int META_ROUNDRECT_ACTION = 104;
	final public static int META_ELLIPSE_ACTION = 105;
	final public static int META_ARC_ACTION = 106;
	final public static int META_PIE_ACTION = 107;
	final public static int META_CHORD_ACTION = 108;
	final public static int META_POLYLINE_ACTION = 109;
	final public static int META_POLYGON_ACTION = 110;
	final public static int META_POLYPOLYGON_ACTION = 111;
	final public static int META_TEXT_ACTION = 112;
	final public static int META_TEXTARRAY_ACTION = 113;
	final public static int META_STRETCHTEXT_ACTION = 114;
	final public static int META_TEXTRECT_ACTION = 115;
	final public static int META_BMP_ACTION = 116;
	final public static int META_BMPSCALE_ACTION = 117;
	final public static int META_BMPSCALEPART_ACTION = 118;
	final public static int META_BMPEX_ACTION = 119;
	final public static int META_BMPEXSCALE_ACTION = 120;
	final public static int META_BMPEXSCALEPART_ACTION = 121;
	final public static int META_MASK_ACTION = 122;
	final public static int META_MASKSCALE_ACTION = 123;
	final public static int META_MASKSCALEPART_ACTION = 124;
	final public static int META_GRADIENT_ACTION = 125;
	final public static int META_HATCH_ACTION = 126;
	final public static int META_WALLPAPER_ACTION = 127;
	final public static int META_CLIPREGION_ACTION = 128;
	final public static int META_ISECTRECTCLIPREGION_ACTION = 129;
	final public static int META_ISECTREGIONCLIPREGION_ACTION = 130;
	final public static int META_MOVECLIPREGION_ACTION = 131;
	final public static int META_LINECOLOR_ACTION = 132;
	final public static int META_FILLCOLOR_ACTION = 133;
	final public static int META_TEXTCOLOR_ACTION = 134;
	final public static int META_TEXTFILLCOLOR_ACTION = 135;
	final public static int META_TEXTALIGN_ACTION = 136;
	final public static int META_MAPMODE_ACTION = 137;
	final public static int META_FONT_ACTION = 138;
	final public static int META_PUSH_ACTION = 139;
	final public static int META_POP_ACTION = 140;
	final public static int META_RASTEROP_ACTION = 141;
	final public static int META_TRANSPARENT_ACTION = 142;
	final public static int META_EPS_ACTION = 143;
	final public static int META_REFPOINT_ACTION = 144;
	final public static int META_TEXTLINECOLOR_ACTION = 145;
	final public static int META_TEXTLINE_ACTION = 146;
	final public static int META_FLOATTRANSPARENT_ACTION = 147;
	final public static int META_GRADIENTEX_ACTION = 148;
	final public static int META_LAYOUTMODE_ACTION = 149;
	final public static int META_TEXTLANGUAGE_ACTION = 150;
	final public static int META_OVERLINECOLOR_ACTION = 151;
	final public static int META_POLYGON_FILL_MODE_ACTION = 152;
	final public static int META_COMMENT_ACTION = 512;
	
	public static SVMConst getInstance() {
		return instance; 
	}
		
	public final static int ROP_OVERPAINT = 0;
	public final static int ROP_XOR = 1;
	public final static int ROP_0 = 2;
	public final static int ROP_1 = 3;
	public final static int ROP_INVERT = 4;
	
	static int rgbColorData(int r, int g, int b) {
		return 0xFF000000 | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
	}
	
	static int rgbColorData(int a, int r, int g, int b) {
		return ((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
	}
	
	public static final int ALIGN_TOP = 0;
	public static final int ALIGN_BASELINE = 1;
	public static final int ALIGN_BOTTOM = 2;
	
	// Flags for Push()
	public static final char PUSH_LINECOLOR = 0x0001;
	public static final char PUSH_FILLCOLOR = 0x0002;
	public static final char PUSH_FONT = 0x0004;
	public static final char PUSH_TEXTCOLOR = 0x0008;
	public static final char PUSH_MAPMODE = 0x0010;
	public static final char PUSH_CLIPREGION = 0x0020;
	public static final char PUSH_RASTEROP = 0x0040;
	public static final char PUSH_TEXTFILLCOLOR = 0x0080;
	public static final char PUSH_TEXTALIGN = 0x0100;
	public static final char PUSH_REFPOINT = 0x0200;
	public static final char PUSH_TEXTLINECOLOR = 0x0400;
	public static final char PUSH_TEXTLAYOUTMODE = 0x0800;
	public static final char PUSH_TEXTLANGUAGE = 0x1000;
	public static final char PUSH_OVERLINECOLOR = 0x2000;
	public static final char PUSH_FILLPOLYMODE = 0x4000;
	
	//mapmode unit
	public static final char MAP_RELATIVE = 13;
	public static final char MAP_POINT = 8;
}
