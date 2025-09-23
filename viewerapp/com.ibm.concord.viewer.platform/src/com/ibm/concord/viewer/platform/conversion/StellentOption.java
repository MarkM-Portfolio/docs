/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

/**
 * stellent options
 * 
 * @author niebomin
 * 
 */
public enum StellentOption {

  OUTPUT_ID("outputid"),
  GRAPHIC_WIDTH("graphicwidth"),
  EXE_PATH("exepath"),
  DBPRINTFITTOPAGE("dbfittopage"),
  DBPRINTGRIDLINES("dbshowgridlines"),
  DBPRINTHEADINGS("dbshowheadings"),
  DEFAULTPRINTFONT("defaultprintfontface"),
  DEFAULTPRINTFONT_HEIGHT("defaultprintfontheight"),
  DEFAULTPRINTFONT_TYPE("defaultprintfonttype"),
  DEFAULT_HEIGHT("defaultheight"),
  DEFAULT_WIDTH("defaultwidth"),
  UNITS("units"),
  DEFAULT_PRINT_MARGINS_TOP("defaultmargintop"),
  DEFAULT_PRINT_MARGINS_BOTTOM("defaultmarginbottom"),
  DEFAULT_PRINT_MARGINS_LEFT("defaultmarginleft"),
  DEFAULT_PRINT_MARGINS_RIGHT("defaultmarginright"), 
  FALLBACK_FORMAT("fallbackformat"),
  DEFAULT_INPUT_CHARSET("defaultinputcharset"),
  FIFLAGS("fiflags"),
  TIMEZONE("timezone"),
  FORMATFLAGS("isodateformatting"),
  STRICT_FILE_ACCESS("strictfileaccess"),
  SHOW_HIDDENSS_DATA("showhiddenssdata"),
  FILTER_JPG("jpegcompression"),
  FILTER_LZW("lzwcompression"),
  EMAIL_HEADER_OUTPUT("emailheader"),
  GIF_INTERLACED("gifinterlace"),
  GRAPHIC_CROPPING("imagecropping"),
  GRAPHIC_HEIGHT("graphicheight"),
  GRAPHIC_HEIGHTLIMIT("graphicheightlimit"),
  GRAPHIC_OUTPUTDPI("graphicoutputdpi"),
  GRAPHIC_SIZELIMIT("graphicsizelimit"),
  GRAPHIC_SIZEMETHOD("graphicsizemethod"),
  QUICK_THUMBNAIL("quickthumbnail"),
  GRAPHIC_TRANSPARENCYCOLOR_RED("red"),
  GRAPHIC_TRANSPARENCYCOLOR_BLUE("blue"),
  GRAPHIC_TRANSPARENCYCOLOR_GREEN("green"),
  GRAPHIC_WIDTHLIMIT("graphicwidthlimit"),
  IMAGEX_TIFFOPTIONS_COLORSPACE("tiffcolorspace"),
  IMAGEX_TIFFOPTIONS_COMPRESSION("tiffcompression"),
  IMAGEX_TIFFOPTIONS_BYTESORDER("tiffbyteorder"),
  IMAGEX_TIFFFLAGS_ONEFILE("tiffmultipage"),
  IMAGEX_TIFFFLAGS_ONESTRIP("onestriptiff"),
  IMAGEX_TIFFOPTIONS_FILLORDER("tifffillorder"),
  JPEG_QUALITY("jpegquality"),
  PRINT_FONTALIAS("printfontalias"),
  PRINT_FONTALIAS_ORIGINAL("printfontaliasoriginal"),
  FONTALIAS_FLAG("printfontaliasflag"),
  PRINT_STARTPAGE("exportstartpage"),
  PRINT_ENDPAGE("exportendpage"),
  SSPRINT_DIRECTION("ssdirection"),
  SSPRINT_GRIDLINES("ssshowgridlines"),
  SSPRINT_HEADINGS("ssshowheadings"),
  MAX_SSDBPAGE_HEIGHT("maxssdbpageheight"),
  MAX_SSDBPAGE_WIDTH("maxssdbpagewidth"),
  RENDERING_PREFER_OIT("preferoitrendering"),
  SSPRINT_FITTOPAGE("ssfittopage"),
  SSPRINT_SCALEPERCENT("ssscalepercent"),
  SSPRINT_SCALEXHIGH("ssscalexhigh"),
  SSPRINT_SCALEXWIDE("ssscalexwide"),
  TEMPDIR("tempdir"),
  UNMAPPABLECHAR("unmappablechar"),
  USE_DOCPAGE_SETTINGS("usedocpagesettings"),
  WHAT_TO_PRINT("whattoexport"),
  IO_READ_BUFFERSIZE("readbuffersize"),
  IO_MAP_BUFFERSIZE("mapbuffersize"),
  IO_TEMP_BUFFERSIZE("tempbuffersize"),
  PARSE_XMP_METADATA("parsexmpmetadata"),
  GRAPHIC_WATERMARK_PATH("imagewatermarkpath"),
  GRAPHIC_WATERMARK_OPACITY("imagewatermarkopacity"),
  GRAPHIC_WATERMARK_SCALETYPE("imagewatermarkscaletype"),
  GRAPHIC_WATERMARK_SCALEPERCENT("imagewatermarkscalepercent"),
  GRAPHIC_WATERMARK_HORIZONTALPOS("imagewatermarkhorizontalpos"),
  GRAPHIC_WATERMARK_VERTICALPOS("imagewatermarkverticalpos"),
  CALLBACK_ID_NEWFILEINFO("handlenewfileinfo"),
  NUMBER_OF_STAT_CALLBACK("numberofstatcallbacks"),
  REDIRECT_TEMP_FILE("redirecttempfile"),
  DOCUMENT_MEMORY_MODE("documentmemorymode"),
  TEXT_REORDER("reordermethod"), 
  LOTUS_NOTES_DIRECTORY("lotusnotesdirectory"),
  SSSHOW_HIDDEN_CELLS("showhiddensscells"),
  PDF_FILTER_REORDER_BIDI("pdffilterreorderbidi"),
  //thumbnailwidth(which is not a standard stellent parameter) will replace graphicwidth when thumbnail conversion is called 
  THUMBNAIL_WIDTH("thumbnailwidth"),
  //this option is to control whether thumbnail of spreadsheet should be convert.
  SPREADSHEET_THUMBNAIL_CONVERSION_SWITCH("convertthumbnail");
  
  private String optionName;

  private StellentOption(String name)
  {
    this.optionName = name;
  }

  public String getName()
  {
    return optionName;
  }
}
