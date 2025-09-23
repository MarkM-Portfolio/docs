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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.DetectorUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.PreserveManager;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;

public class GeneralContext
{
  XMLImport mImport;
  String mUri;
  String mLocalName;
  String mQName;
  AttributesImpl mAttrs;//all the attributes of the current parsing node
  HashMap<String, RangeType> preserveMap;
  ConversionContext mContext;
  Object mTarget;//ConversionUtil object which can present one dom node
  boolean mbChildPreserve;//if child should be preserved
  ArrayList<GeneralContext> mChildConvertors;//only add child when mbChildPreserve=true
  GeneralContext mParentConvertor;
  //if the corresponding element will generate xml id(export to odf draft) after endElement
  //for example, row, column and all the element which need preserved\
  //by default it is false
  boolean mbGenerateXMLIdAtEnd;
//  boolean mbInvalid;
  public GeneralContext(XMLImport importer, String uri, String localName, String qName, Object target){
    mImport = importer;
    mUri = uri;
    mLocalName = localName;
    mQName = qName;
    mTarget = target;
    mbChildPreserve = false;
    mContext = mImport.getConversionContext();
    mChildConvertors = new ArrayList<GeneralContext>();
    mbGenerateXMLIdAtEnd = false;
//    mbInvalid = false;
  }
  
  public XMLImport getImporter(){
    return mImport;
  }
  
  public Object getTarget(){
    return mTarget;
  }
  
  public boolean isChildPreserve(){
    return mbChildPreserve;
  }
  
  public GeneralContext getParentConvertor(){
    return mParentConvertor;
  }
  
  public void setParentConvertor(GeneralContext context){
    mParentConvertor = context;
  }
  
  public ArrayList<GeneralContext> getChildConvertor(){
    return mChildConvertors;
  }
  
  public void addChildConvertor(GeneralContext context){
    mChildConvertors.add(context);
  }
  
  public String getNodeName(){
    return mQName;
  }
  
  public String getLocalName(){
    return mLocalName;
  }
  
  public AttributesImpl getAttrs(){
    return mAttrs;
  }
  
  public String getAttrValue(String attrKey){
    if(mAttrs != null)
      return mAttrs.getValue(attrKey);
    return null;
  }
  ///////////////////////////////////////////////////////////////////
  ///////////////XML Writer/////////////////////////////////////////
  //used for xml writer to export xml id
  public boolean hasXMLId(){
    return mbGenerateXMLIdAtEnd;
  }
  //////////////////////////////////////////////////////////
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
      GeneralContext context = null;
      XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
      switch(name){
        //for text:p only attached to table:cell should be preserved
        case TEXT_P:
        case TEXT_H:
          context = new TextPContext(mImport, uri, localName, qName, mTarget);
          break;
        case DRAW_FRAME:
          context = new DrawFrameContext(mImport, uri, localName, qName, mTarget);
          break;  
        case DRAW_IMAGE:
          context = new DrawImageContext(mImport, uri, localName, qName, mTarget);
          break;
        case DRAW_A:
          context = new DrawAContext(mImport, uri, localName, qName, mTarget);
          break;  
        default:
          context = new GeneralContext(mImport, uri, localName, qName, mTarget);
      }
      return context;
//    return OdfElementContextFactory.getInstance().getContext(mImport, uri, localName, qName, mTarget);
  }

  public void startElement(AttributesImpl attributes)
  {
    mAttrs = attributes;
    doDetect();
    startPreserve();
  }

  public void endElement()
  {
    endPreserve();
  }

  public void characters(char[] ch, int start, int length)
  {
  }

  protected boolean doDetect()
  {
    HashMap<String, Integer> result = (HashMap<String, Integer>) mContext.get("UnsupportFeatureResult");
    Set<String> contentUnsupFeatureSet = (Set<String>) mContext.get("ContentUnsupportFeatureSet");
    String tagName = mQName;
    String type = null;
    type = DetectorUtil.unsupContentTagMap.get(tagName);
    if ((tagName.equals("draw:image") && !ODSConvertUtil.isDrawImage(mQName, mAttrs)) || !ODSConvertUtil.isDrawObject(mQName)
        && ODSConvertUtil.isChartObject(mContext, mQName, mAttrs))
      type = null;
    boolean bMatch = false;
    if (null != type)
      bMatch = DetectorUtil.isAttrsMatch(tagName, mAttrs);
    if (null != type && bMatch)
    {
      Integer count = result.get(tagName);
      if (count == null)
      {
        result.put(tagName, 1);
        contentUnsupFeatureSet.add(type);
        if (!DetectorUtil.bRecordCount && contentUnsupFeatureSet.size() == DetectorUtil.content_feature_num)
          return true;
      }
      else
      {
        if (DetectorUtil.bRecordCount)
          result.put(tagName, count + 1);
      }
    }
    return false;
  }

  /**
   * Preserve odf attribute or element according to "preserve_name.json" config file
   */
  protected void startPreserve()
  {
    PreserveManager manager = (PreserveManager) mContext.get("PreserveManager");
    String tagName = mQName;
    preserveMap = manager.getConfigByElementName(tagName);
    if (preserveMap != null)
    {
      // set it if it need preserved and cache the all the context after this context until this context.endElement is done
      mbGenerateXMLIdAtEnd = true;
      //if preserveMap contains "child" or "parent", it means that the JSONModel must be there
      //if JSONModel does not exist, then set mbGenerateXMLIdAtEnd to false, because do not need to generate xml id for it.
      ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
      Iterator<String> keyIter = preserveMap.keySet().iterator();
      while(keyIter.hasNext()){
        String key = keyIter.next();
        if(key.equals(PreserveManager.CHILD_KEY) || key.equals(PreserveManager.PARENT_KEY)){
          if(document == null){
            mbGenerateXMLIdAtEnd = false;
          }
        }else{
          mbGenerateXMLIdAtEnd = true;
          break;//contains other preserve type(such as attribute, then should still generate xml id)
        }
      }
      //check if the child context should be cached
      if (preserveMap.containsKey(PreserveManager.CHILD_KEY))
        mbChildPreserve = true;
    }
  }

  // should implement by each convertor if they need preserve child, such as table:table-column-group
  public void preserveChild(ConversionContext context, ArrayList<GeneralContext> childConvertor)
  {
  }

  // 1)get the "parent" type of range
  // 2)update the collection of target to ConversionUtil.Range and put it to preserveManager
  // 3) generate Ods2Index for the odf element, and save it back, as to the range id, it generated by PreserveManager?
  // 4) if the target does not need exist, set it to null, in fact, no need, because it will not insert to the parent
  public void endPreserve()
  {
    if (preserveMap != null)
    {
      if (mbChildPreserve)
        this.preserveChild(mContext, mChildConvertors);
      PreserveManager manager = (PreserveManager) mContext.get("PreserveManager");
      manager.addRangeByTarget(mContext, this);
    }
  }
  
  //if the preserved range need to be transformed from other info,
  //then do it by the specific element convertor
  //such as TableFilterConditionContext
  public ParsedRef generatePreserveRef(String address, String attrName)
  {
    return ReferenceParser.parse(address);
  }

  // /////////////////////////////////////////////////
  // ///////////XML ODS ID EXPORT/////////////////////
  // Note: if mAttrs is null, will not able to add "id" attribute for xml node
  public void addIdOnOdfElement(String id)
  {
    if (mAttrs != null && ConversionUtil.hasValue(id)){
        mAttrs.addAttribute("", "", "id", "ID", id);
    }
  }
  
  public void removeIdOnOdfElement()
  {
    if(mAttrs != null){
      int index = mAttrs.getIndex("id");
      if(index > -1)
        mAttrs.removeAttribute(index);
    }
  }

  public boolean isOdfNodeIndexed()
  {
    String xmlid = this.getAttrValue(ODSConvertUtil.ID_STRING);
    if (xmlid == null || xmlid.equals(""))
      return false;
    return true;
  }

  public String getOdfNodeIndex()
  {
    String xmlid = this.getAttrValue(ODSConvertUtil.ID_STRING);
    return xmlid;
  }
}
