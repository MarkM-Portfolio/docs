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
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class TextPContext extends GeneralDOMContext
{
  //TODO:
  //for now, just append all the child node to mElement, and use the odftoolkit api to getText
  //if we want to implement rich text, should override createChildContext to deal with
  //every child node to parse the <text:span>,<text:a> etc.
  private String mText;
  boolean bUnsupport;
  boolean hasText;//if text:p has text node
//  private boolean bInvalid;//if the context is invalid or not, invalid means that it should not convert as JSONModel
  public TextPContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
    mText = null;
  }
  
  //should be called after endElement
  public String getText(){
    if(mText == null){
      Node parent = (Node) mElement.getParentNode();
      mImport.setCurrentNode(parent);
      //mElement now is the dom tree which contains all the styles
      StringBuilder textBuffer = new StringBuilder();
      OdfWhitespaceProcessor textProcessor = new OdfWhitespaceProcessor();
      textBuffer.append(textProcessor.getText(mElement));
      textBuffer.append("\n");
      mText = textBuffer.toString();
    }
    return mText;
  }

	public boolean isHyperlinkExist() {
		int length = this.mChildConvertors.size();
		if(length==1){
			GeneralContext conv = mChildConvertors.get(0);
			if (conv instanceof TextAContext) {
				if(!mText.equals(((TextAContext) conv).getText()+"\n"))
					return false;			
				if(ConversionUtil.isSupportedHyperlink(((TextAContext) conv).getHerf()))
					return true;
			}
			if (conv instanceof TextSpanContext) {
              if(!mText.equals(((TextSpanContext) conv).getText()))
                  return false;           
              if(ConversionUtil.isSupportedHyperlink(((TextSpanContext) conv).getHerf()))
                  return true;
          }
		}
			
		return false;
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
			if (conv instanceof TextSpanContext) {
			  TextSpanContext spanContext = (TextSpanContext) conv;
              return spanContext.getHerf();
          }
		}
		
		return null;
		
	}




  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
	  GeneralContext context = null;
	    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
	    switch(name){
	      case TEXT_A :	     
	        context = new TextAContext(mImport, uri, localName, qName, mTarget);
	        break;
	      case TEXT_SPAN :       
            context = new TextSpanContext(mImport, uri, localName, qName, mTarget);
            break;
	      default:
	        context =  new GeneralDOMTEXTPContext(mImport, uri, localName, qName, mTarget);
	        break;
	    }
	    return context;
  
  }
  
  public void startElement(AttributesImpl attributes)
  {
    super.startElement(attributes);
    mbChildPreserve = true;
  }
  
  public void characters(char[] ch, int start, int length)
  {
    super.characters(ch, start, length);
    if(length > 0)
      hasText = true;
  }
  
  public void endElement(){
//    if(mbInvalid)
//      return;
//	bUnsupport = getUnsupportTag();
    //if the text:p not only contain the text node, but also has the other child element
    //then it should be preserved
    if(!bUnsupport && mChildConvertors.size() > 0)
    {
      for(int i = 0; i < mChildConvertors.size(); i++)
      {
        GeneralContext ctx = mChildConvertors.get(i);
        if( ctx != null && !"s".equals(ctx.mLocalName)
        && !"c".equals(ctx.mLocalName)
        && !"line-break".equals(ctx.mLocalName)
        && !"tab".equals(ctx.mLocalName) && hasText)
        {
          bUnsupport = true;
          break;
        }
        //check if the href contains mailto or external file link which is not support 
        if (ctx instanceof TextAContext)
        {
          if (!ConversionUtil.isSupportedHyperlink(((TextAContext) ctx).getHerf()))
          {
            bUnsupport = true;
            break;
          }
        }
        else if (ctx instanceof TextSpanContext)
        {
          if (!ConversionUtil.isSupportedHyperlink(((TextSpanContext) ctx).getHerf()))
          {
            bUnsupport = true;
            break;
          }
        }
      }
    }
    super.endElement();
    mImport.setCurrentNode(null);
  }
  
  public void endPreserve()
  {
    GeneralContext parentConv = this.getParentConvertor();
    if((parentConv instanceof TableCellContext) && bUnsupport){
      super.endPreserve();
    }
  }
}

class GeneralDOMTEXTPContext extends GeneralDOMContext
{
  boolean bUnsupport;
  public GeneralDOMTEXTPContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
    return new GeneralDOMTEXTPContext(mImport, uri, localName, qName, mTarget);
  }
  
  //set the parent context(TextPContext).bUnSupport=true if encounter element 
  //which is not text:s, text:c, text:tab, text:line-break
  public void endElement()
  {
    super.endElement();
    GeneralContext pContext = this.getParentConvertor();
    if(pContext instanceof TextPContext){
      TextPContext tContext = (TextPContext)pContext;
      tContext.bUnsupport = tContext.bUnsupport || this.getUnsupportTag();
    }else{
      GeneralDOMTEXTPContext gtContext = (GeneralDOMTEXTPContext)pContext;
      gtContext.bUnsupport = this.getUnsupportTag();
    }
  }
  
  private boolean getUnsupportTag()
  {
    int childType = mElement.getNodeType();
    String childName = mLocalName;
    //text, text:s, text:c, text:line-break, text:tab are what we support
    if(childType != Node.TEXT_NODE 
        && !"s".equals(childName)
        && !"c".equals(childName)
        && !"line-break".equals(childName)
        && !"tab".equals(childName))
    	  return true;
    return false;
  }
}