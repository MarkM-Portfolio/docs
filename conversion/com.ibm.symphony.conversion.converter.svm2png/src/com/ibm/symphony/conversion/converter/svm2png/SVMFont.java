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

import java.awt.Font;
import java.awt.font.TextAttribute;
import java.text.AttributedString;

public class SVMFont
{
  public String familyName;
  public String styleName;
  
  public int width;
  public int height;
  public int charset;
  public int family;
  public int pitch;
  public int weight;
  public int underLine;
  public int strikeOut;
  public int italic;
  public int language;
  public int widthType;
  public int orientation;
  
  public int wordLine;
  public int outline;
  public int shadow;
  public int kerning;
  
  public AttributedString getAttributedString(String text)
  {
    int fontStyle = 0;
    fontStyle = fontStyle | (italic != 0 ? Font.ITALIC:0);
    fontStyle = fontStyle | (weight >= 8 ? Font.BOLD:0);
    Font font = new Font(familyName, fontStyle, height);
    
    AttributedString as = new AttributedString(text);  
    as.addAttribute(TextAttribute.FONT, font);  
    
    if(underLine == 1)
      as.addAttribute(TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_ON);  
    else if(underLine == 3)
      as.addAttribute(TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_LOW_DOTTED);  
    else if(underLine == 5)
      as.addAttribute(TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_LOW_DASHED);  
    else if(underLine == 12)
      as.addAttribute(TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_LOW_TWO_PIXEL);  
    
    if(strikeOut == 1)
      as.addAttribute(TextAttribute.STRIKETHROUGH, TextAttribute.STRIKETHROUGH_ON); 
     
    return as;
  }
}
