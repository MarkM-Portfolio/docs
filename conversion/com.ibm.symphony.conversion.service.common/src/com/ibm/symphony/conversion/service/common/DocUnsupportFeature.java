package com.ibm.symphony.conversion.service.common;

import java.util.HashMap;

public class DocUnsupportFeature
{
  //Tokens for Unsupported XML Features detected by Symphony
  public static final String SYM_TOKEN_NUMPICBULLET = "numPicBullet";
  public static final String SYM_TOKEN_DGM = "dgm";
  public static final String SYM_TOKEN_CHART = "chart";
  public static final String SYM_TOKEN_CONTROL = "control";
  public static final String SYM_TOKEN_VBAPROJECT = "vbaProject";
  public static final String SYM_TOKEN_TBLSTYLEPR = "tblStylePr";
  
  //Error Codes for Common Unsupported Features
  public static final String UNSUPPORT_FEATURE_TRACK_CHANGE = "601";
  public static final String UNSUPPORT_FEATURE_CUSTOM_SHAPE = "602";
  public static final String UNSUPPORT_FEATURE_OLE_OBJECT = "603";
  public static final String UNSUPPORT_FEATURE_VIDEO_SOUND = "604";
  public static final String UNSUPPORT_FEATURE_FOOTNOTE_ENDNOTE = "605";
  public static final String UNSUPPORT_FEATURE_TEXT_SECTION = "606";
  public static final String UNSUPPORT_FEATURE_TEXT_COMMENT = "607";
  public static final String UNSUPPORT_FEATURE_TEXT_FIELD = "608";
  public static final String UNSUPPORT_FEATURE_FORM_CONTROL = "609";
  public static final String UNSUPPORT_FEATURE_MAIL_MERGE = "610";
  
  public static final String UNSUPPORT_FEATURE_MACRO = "611";
  public static final String UNSUPPORT_FEATURE_CHART = "612";
  public static final String UNSUPPORT_FEATURE_ACTIVEX = "613";
  public static final String UNSUPPORT_FEATURE_SMARTART = "614";
  public static final String UNSUPPORT_FEATURE_GRAPHICBULLET = "615";
  public static final String UNSUPPORT_FEATURE_TABLESTYLE = "616";
  
  //Feature Text
  public static final String FEATURE_TRACK_CHANGE = "Track Change";
  public static final String FEATURE_CUSTOM_SHAPE = "Custom Shape";
  public static final String FEATURE_OLE_OBJECT = "OLE Object";
  public static final String FEATURE_VIDEO_SOUND = "Video or Sound";
  public static final String FEATURE_FOOTNOTE_ENDNOTE = "Footnote or Endnote";
  public static final String FEATURE_TEXT_SECTION = "Text Section";
  public static final String FEATURE_TEXT_COMMENT = "Text Comment";
  public static final String FEATURE_TEXT_FIELD = "Text Field";
  public static final String FEATURE_FORM_CONTROL = "Form Control";
  public static final String FEATURE_MAIL_MERGE = "Mail Merge";
  
  public static final String FEATURE_MACRO = "Macro";
  public static final String FEATURE_CHART = "Chart";
  public static final String FEATURE_ACTIVEX = "ActiveX";
  public static final String FEATURE_SMARTART = "SmartArt";
  public static final String FEATURE_GRAPHICBULLET = "Graphic Bullet";
  public static final String FEATURE_TABLESTYLE = "Table Style";
  
  public class FeatureInfo
  {
    public String errorCode = "";
    public boolean preserved = false;
    public String featureText = "";

    public FeatureInfo(String errorCode, boolean preserved, String featureText)
    {
      this.errorCode = errorCode;
      this.preserved = preserved;
      this.featureText = featureText;
    }
  }
  
  private static final boolean NOT_PRESERVED = false;  
  private static final boolean PRESERVED = true;  
  private static final DocUnsupportFeature DOCUF = new DocUnsupportFeature();
  public static HashMap<String, FeatureInfo> DocxUnsupportFeatureMap = new HashMap<String, FeatureInfo>();
  
  static
  {
	DocxUnsupportFeatureMap.put(SYM_TOKEN_VBAPROJECT, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_MACRO, NOT_PRESERVED, FEATURE_MACRO));
    DocxUnsupportFeatureMap.put(SYM_TOKEN_CHART, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_CHART, NOT_PRESERVED, FEATURE_CHART));
    DocxUnsupportFeatureMap.put(SYM_TOKEN_CONTROL, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_ACTIVEX, NOT_PRESERVED, FEATURE_ACTIVEX));
    DocxUnsupportFeatureMap.put(SYM_TOKEN_DGM, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_SMARTART, NOT_PRESERVED, FEATURE_SMARTART));
    DocxUnsupportFeatureMap.put(SYM_TOKEN_NUMPICBULLET, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_GRAPHICBULLET, NOT_PRESERVED, FEATURE_GRAPHICBULLET));
    DocxUnsupportFeatureMap.put(SYM_TOKEN_TBLSTYLEPR, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_TABLESTYLE, NOT_PRESERVED, FEATURE_TABLESTYLE));
  }
  
  public static HashMap<String, FeatureInfo> OdtUnsupportFeatureMap = new HashMap<String, FeatureInfo>();
  
  static
  {
    OdtUnsupportFeatureMap.put(ODFConstants.TEXT_TRACKED_CHANGES, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_TRACK_CHANGE, 
        NOT_PRESERVED, FEATURE_TRACK_CHANGE));
    OdtUnsupportFeatureMap.put(ODFConstants.DRAW_OBJECT, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_OLE_OBJECT, 
        PRESERVED, FEATURE_OLE_OBJECT));
    OdtUnsupportFeatureMap.put(ODFConstants.DRAW_OBJECT_OLE, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_OLE_OBJECT, 
        PRESERVED, FEATURE_OLE_OBJECT));
    OdtUnsupportFeatureMap.put(ODFConstants.DRAW_PLUGIN, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_VIDEO_SOUND, 
        PRESERVED, FEATURE_VIDEO_SOUND));
    OdtUnsupportFeatureMap.put(ODFConstants.TEXT_NOTE, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_FOOTNOTE_ENDNOTE, 
        PRESERVED, FEATURE_FOOTNOTE_ENDNOTE));
    OdtUnsupportFeatureMap.put(ODFConstants.TEXT_SECTION, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_TEXT_SECTION, 
        NOT_PRESERVED, FEATURE_TEXT_SECTION));
    OdtUnsupportFeatureMap.put(ODFConstants.OFFICE_ANNOTATION, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_TEXT_COMMENT, 
        PRESERVED, FEATURE_TEXT_COMMENT));
    OdtUnsupportFeatureMap.put(ODFConstants.DRAW_CONTROL, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_FORM_CONTROL, 
        PRESERVED, FEATURE_FORM_CONTROL));
    OdtUnsupportFeatureMap.put(ODFConstants.TEXT_DATABASE_DISPLAY, DOCUF.new FeatureInfo(UNSUPPORT_FEATURE_MAIL_MERGE, 
        PRESERVED, FEATURE_MAIL_MERGE));    
  }
  
}
