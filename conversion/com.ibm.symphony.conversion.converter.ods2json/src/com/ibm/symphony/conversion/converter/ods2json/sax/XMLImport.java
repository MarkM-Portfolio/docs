/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax;

import java.io.IOException;

import java.util.ArrayList;
import java.util.Stack;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfFileDom;
import org.w3c.dom.Node;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;
import org.xml.sax.helpers.DefaultHandler;

import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.TableTableContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.TextPContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class XMLImport extends DefaultHandler
{
  private static final String CLAZZ = XMLImport.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZ);
  private OdfFileDom mDocument;
  // the context node
  private Node mNode; 
  private TransformerHandler mXMLWriter;
  // a stack of sub handlers. handlers will be pushed on the stack whenever
  // they are required and must pop themselves from the stack when done
  private Stack<GeneralContext> mContextStack = new Stack<GeneralContext>();
  //a list that have not been exported to xml writer
  //once the first ContextWriterEntry has xml id, then export all the entries in this list and clear the list
  private ArrayList<ContextWriterEntry> mXMLWriterContextList = new ArrayList<ContextWriterEntry>();
  private ConversionContext mContext;

  public XMLImport(Node rootNode)
  {
    if (rootNode instanceof OdfFileDom) {
      mDocument = (OdfFileDom) rootNode;
    } else {
      mDocument = (OdfFileDom) rootNode.getOwnerDocument();
    }
    mNode = rootNode;
  }
  //should be set before parse 
  public void setConversionContext(ConversionContext context){
    mContext = context;
  }
  
  public ConversionContext getConversionContext(){
    return mContext;
  }
  
  public OdfFileDom getDocument(){
    return mDocument;
  }
  
  public Node getCurrentNode(){
    return mNode;
  }
  
  public void setCurrentNode(Node node){
    mNode = node;
  }
  
  public void setXMLWriter(TransformerHandler xmlWriter)
  {
    mXMLWriter = xmlWriter;
  }
  
  public void startDocument() throws SAXException
  {
    mXMLWriter.startDocument();
  }

  public void endDocument() throws SAXException
  {
    mXMLWriter.endDocument();
  }

  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl(attributes);
    int cnt = mContextStack.size();
    GeneralContext context = null;
    if(cnt > 0){
      GeneralContext topContext = mContextStack.peek();
      context = topContext.createChildContext(uri, localName, qName, attrs);
      //construct the parent and child linkage
      context.setParentConvertor(topContext);
      if(topContext.isChildPreserve())
        topContext.addChildConvertor(context);
    }else{
      ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
      context = createContext(uri, localName, qName, document);
    }
    context.startElement(attrs);
    mContextStack.push(context);
    //XML writer
    int writeCnt = mXMLWriterContextList.size();
    if(!context.hasXMLId() && (writeCnt == 0))
      mXMLWriter.startElement("", localName, qName, attrs);
    else{
      ContextWriterEntry entry = new ContextWriterEntry(context, WRITEOP.START);
      mXMLWriterContextList.add(entry);
    }
  }
  //different application implement their own context
  public GeneralContext createContext(String uri, String localName, String qName, Object target)
  {
    return new GeneralContext(this, uri, localName, qName, target);
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    int cnt = mContextStack.size();
    if(cnt > 0){
      GeneralContext topContext = mContextStack.pop();
      topContext.endElement();
      //XML writer to export 
      int writeCnt = mXMLWriterContextList.size();
      if(writeCnt > 0){
        GeneralContext firstContext = mXMLWriterContextList.get(0).mContext;
        boolean flushAll = (topContext == firstContext);
        //if it is table:table context, and it has converted its first child
        //it can know the <table:table> attributes should contain xml id for this table or not
        //so here we should try to flush the sax writer ASAP, otherwise it will have all the table content in the memory
        if(!flushAll && (firstContext instanceof TableTableContext))
        {
          int writeIndex = 0;
          for(writeIndex=0; writeIndex<writeCnt; writeIndex++){
            ContextWriterEntry entry = mXMLWriterContextList.get(writeIndex);
            GeneralContext context = entry.mContext;
            if(context.hasXMLId())
              break;
          }
          if(writeIndex == writeCnt)
            flushAll = true;
        }
        if(flushAll){
          //TODO: operate all the entries in list, then clear the list
          for(int i=0; i<writeCnt; i++){
            ContextWriterEntry entry = mXMLWriterContextList.get(i);
            GeneralContext context = entry.mContext;
            WRITEOP op = entry.mOp;
//            if(entry.mOp == ContextWriterEntry.WRITEOP.START)
            switch(op){
              case START:
                mXMLWriter.startElement("", context.getLocalName(), context.getNodeName(), context.getAttrs());
                break;
              case END:
                mXMLWriter.endElement("", context.getLocalName(), context.getNodeName());
                break;
              case CHARACTERS:
                mXMLWriter.characters(entry.mChars, entry.mStart, entry.mLength);
                break;
            }
          }
          mXMLWriterContextList.clear();
          
          mXMLWriter.endElement("", localName, qName);
        }else{
          ContextWriterEntry entry = new ContextWriterEntry(topContext, WRITEOP.END);
          mXMLWriterContextList.add(entry);
        }
      }else
        mXMLWriter.endElement("", localName, qName);
    }else{
      LOG.log(Level.WARNING, "have not call startElement for sax writer");
    }
  }

  /**
   * http://xerces.apache.org/xerces2-j/faq-sax.html#faq-2 : SAX may deliver contiguous text as multiple calls to characters, for reasons
   * having to do with parser efficiency and input buffering. It is the programmer's responsibility to deal with that appropriately, e.g. by
   * accumulating text until the next non-characters event.
   */
  public void characters(char[] ch, int start, int length) throws SAXException
  {
    GeneralContext context = mContextStack.peek();
    if(context != null)
      context.characters(ch, start,length);
    
    //XML writer
    int writeCnt = mXMLWriterContextList.size();
    if(writeCnt == 0)//mXMLWriter must call startElement before characters
      mXMLWriter.characters(ch, start, length);
    else{
      ContextWriterEntry entry = new ContextWriterEntry(context,ch, start, length);
      mXMLWriterContextList.add(entry);
    }
      
  }

  public InputSource resolveEntity(String publicId, String systemId) throws IOException, SAXException
  {
    return super.resolveEntity(publicId, systemId);
  }

}

enum WRITEOP{
  START, END, CHARACTERS
}

class ContextWriterEntry{
  GeneralContext mContext;
  WRITEOP mOp;
  //the following three member only used for WRITEOP.CHARACTERS
  char[] mChars;
  int mStart;
  int mLength;
  
  //constructor for START and END
  ContextWriterEntry(GeneralContext context, WRITEOP op){
    mContext = context;
    mOp = op;
  }
  //constructor for CHARACTERS
  ContextWriterEntry(GeneralContext context, char[] chars, int start, int length){
    mContext = context;
    mOp = WRITEOP.CHARACTERS;
    StringBuffer buf = new StringBuffer();
    buf.append(chars, start, length);
    String str = buf.toString();
    mChars = str.toCharArray();
    mStart = 0;
    mLength = str.length();
    
}
}