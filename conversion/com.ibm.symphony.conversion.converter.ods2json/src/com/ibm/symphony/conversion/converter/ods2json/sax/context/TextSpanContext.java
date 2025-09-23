/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import org.odftoolkit.odfdom.doc.text.OdfWhitespaceProcessor;
import org.w3c.dom.Node;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;

public class TextSpanContext extends GeneralDOMTEXTPContext
{
  private String mText;
  public TextSpanContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);   
    mText = null;
  }
  
  
  //should be called after endElement
  public String getText(){
    if(mText == null){     
      //mElement now is the dom tree which contains all the styles
      StringBuilder textBuffer = new StringBuilder();
      OdfWhitespaceProcessor textProcessor = new OdfWhitespaceProcessor();
      textBuffer.append(textProcessor.getText(mElement));
      textBuffer.append("\n");
      mText = textBuffer.toString();
    }
    return mText;
  }
  /**
   * this method should be called only isHyperlinkExist==true
   * @return
   */
  public String getHerf(){
      int length = this.mChildConvertors.size();  
      for (int i = 0; i < length; i++) {
          GeneralContext conv = mChildConvertors.get(i);
          if (conv instanceof TextAContext) {
              TextAContext aContext = (TextAContext) conv;
              return aContext.getHerf();
          }
      }
      
      return null;
      
  }
  
  
  @Override
  public void endElement()
  {
    // TODO Auto-generated method stub
    super.endElement();
    getText();
  }


  public void startElement(AttributesImpl attributes)
  {
    super.startElement(attributes);
    mbChildPreserve = true;
  }
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
      GeneralContext context = null;
        XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
        switch(name){
          case TEXT_A :      
            context = new TextAContext(mImport, uri, localName, qName, mTarget);
            break;         
          default:
            context =  new GeneralDOMTEXTPContext(mImport, uri, localName, qName, mTarget);
            break;
        }
        return context;
  
  }

}
