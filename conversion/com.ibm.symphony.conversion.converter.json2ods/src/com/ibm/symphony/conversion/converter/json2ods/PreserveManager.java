/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.Map.Entry;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.FormulaToken;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class PreserveManager
{
  private static final Logger LOG = Logger.getLogger(PreserveManager.class.getName());
  
  public void doPreserve(ConversionContext context,String id,OdfElement target,OdfElement parent)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    Set<PreserveNameIndex> ids = index.getPreserveData(id);
    if(ids == null)
      return;
    //for formula and validation, there might be several ranges in one attribute, 
    //which should not preserveByType one by one
    // TODO: for formula and validation,  only one attribute for preserve id(such as "n1") for now
    // if there are cases that in "n1" not only exist formula type, but other types, 
    // should not break directly when encouter formula and validation 
    RangeType type = null;
    boolean bPass = false;
    Set<PreserveNameIndex> refIndex = new HashSet<PreserveNameIndex>();
    for(PreserveNameIndex indexName: ids)
    {
      switch(indexName.type)
      {
        case FORMULA:
        case VALIDATION_REF:
          type = indexName.type;
          bPass = true;
          refIndex.add(indexName);
          break;
      }
      
      if(bPass)
        continue;//deal with doUpdateReference later
      preserveByType(context,indexName,target, parent);
    }
    
    if(refIndex.size() > 0)
      this.doUpdateReference(context, refIndex, target, type);
    //TODO: check for validation, in fact no neccessary to getDataValidation here
//    Set<PreserveNameIndex> ref = index.getDataValidations().get(id);
//    this.doUpdateReference(context, ref, target);

  }
  
  private void preserveByType(ConversionContext context,PreserveNameIndex indexName,OdfElement target,OdfElement parent)
  {
    RangeType type = indexName.type;
    switch(type)
    {
      case ANCHOR:
      {
        doAnchorAction(context, indexName, target);
        break;
      }
      case DELETE:
      case RANGEFILTER:
      {
        if(null == indexName.address || indexName.address.contains("#REF!"))
        {
          if(parent.hasChildNodes())
            parent.removeChild(target);
        }
        else
          doAppend(context, indexName, target);
        break;
      }
      case FORMULA:
      {
        break;
      }
      case CHART:
      {
    	//If chart:label-cell-address and chart:values-cell-range-address contains #REF, "chart:series" node will not be removed
    	boolean bCheckREF = !"chart:label-cell-address".equals(indexName.attrName) && 
    	                    !"chart:values-cell-range-address".equals(indexName.attrName);
        if(bCheckREF && (null == indexName.address || indexName.address.contains("#REF!")))
          parent.removeChild(target);
        else
          preserveAttribute(context, indexName, target);
        break;
      }
      case VALIDATION_REF:
      {
        break;
      }
      case SPLIT:
      {
        List<PreserveNameIndex> list = new ArrayList<PreserveNameIndex>();
        list.add(indexName);
        doMerge(indexName.attrName,list,target);
        break;
      }
      case COPY:
      {
        doCopy(context, indexName, target);
        break;
      }
      case INHERIT:
      case NORMAL:  
      default:
        break;
    }
  }
  //infact useless for this method
  private void doCopy(ConversionContext context,PreserveNameIndex indexName,OdfElement target)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    String id = target.getAttribute("id");
    boolean bChange = index.isCellChanged(id);
    OdfElement pChild = index.getOdfNodes(indexName.elementId);
    if(!bChange)
    {
      if(target != pChild)
        target.appendChild(pChild);
    }
  }

  private void doUpdateReference(ConversionContext context,Set<PreserveNameIndex> indexNames,OdfElement target, RangeType rangeType)
  {
    if(indexNames == null)
      return;
    String attr = null;
    if(rangeType == RangeType.FORMULA)
    {
      attr = ConversionConstant.ODF_ATTRIBUTE_TABLE_EXPRESSION;
      //compatable with old formula named expression type which does not have "s" and "e"
      boolean withoutStartIndex = false;
      Iterator<PreserveNameIndex> preserveIt = indexNames.iterator();
      while(preserveIt.hasNext())
      {
        PreserveNameIndex nameIndex = preserveIt.next();
        if(nameIndex.data == null || nameIndex.data.get("s") == null)
        {
          withoutStartIndex = true;
        }
        //else do the next action which is the same as VALIDATION_REF type
        break;
      }
      if(withoutStartIndex)
      {
        this.doUpdateFormula(context, indexNames, target);
        return;
      }
    }
    else if(rangeType == RangeType.VALIDATION_REF)
      attr = ConversionConstant.ODF_ATTRIBUTE_TABLE_CONDITION;
    if(attr == null)
      return;
    String condition = target.getAttribute(attr);
    if(rangeType == RangeType.FORMULA)
    {
      String formula = "=" + condition;
      condition = ConversionUtil.convertFormula(formula);
    }
    Iterator<PreserveNameIndex> preserveIt = indexNames.iterator();
    ArrayList<PreserveNameIndex> orderNames = new ArrayList<PreserveNameIndex>();
    ArrayList<Integer> orderNameStartIndexes = new ArrayList<Integer>();
    //reorder the validation ranges with the start index ascending order
    while(preserveIt.hasNext())
    {
      PreserveNameIndex nameIndex = preserveIt.next();
      int s = Integer.parseInt(nameIndex.data.get("s").toString());
      int index = orderNameStartIndexes.size();
      for(int i = orderNameStartIndexes.size() - 1; i >= 0; i--)
      {
        if(s > orderNameStartIndexes.get(i))
        {
          index = i + 1;
          break;
        }else
        {
          index = i;
        }
      }
      orderNames.add(index, nameIndex);
      orderNameStartIndexes.add(index, s);
    }
    
    StringBuilder x = new StringBuilder();
    int pres = 0;
    int end = 0;
    for(int i = 0; i < orderNames.size(); i++)
    {
      PreserveNameIndex nameIndex = orderNames.get(i);
      String addr = nameIndex.address;
      int s = orderNameStartIndexes.get(i);
      int e = Integer.parseInt(nameIndex.data.get("e").toString());
      String oriAddress = condition.substring(s, e);
      if(oriAddress.startsWith("."))
      {
        //remove the sheet name
        ReferenceParser.ParsedRef ref = ReferenceParser.parse(addr);
        ref.sheetName = "";
        ref.endSheetName = "";
        addr = ref.toString();
      }
      x.append(condition.substring(pres, s));
      x.append(addr) ;
      pres = e;
      end = e;
    }
    x.append(condition.substring(end));
    String value = x.toString();
    if(rangeType == RangeType.FORMULA)
      value = value.substring(1);//"remove ="
    target.setAttribute(attr, value);
  }
  
  @Deprecated
  private void doUpdateFormula(ConversionContext context,Set<PreserveNameIndex> indexNames, OdfElement target)
  {
    String attr = null;
    List<PreserveNameIndex> names = new ArrayList<PreserveNameIndex>();
    for(PreserveNameIndex indexName : indexNames)
    {
      attr = indexName.attrName;
      names.add(indexName);//WARNING, put the PreserveNameIndex by order, in fact, here the order might be changed
    }
    if(attr == null)
      return;
    String originalFormula = target.getAttribute(attr);
    String formula = "=" + originalFormula;
    formula = ConversionUtil.convertFormula(formula);
    Document document = (Document) context.get("Source");
    ArrayList<ConversionUtil.Range> nameList = (ArrayList<ConversionUtil.Range>)document.nameList;
    ArrayList<FormulaToken> tokenList = ConversionUtil.getTokenFromFormula(formula, nameList);
    for (int i = 0; i < tokenList.size(); i++)
    {
      ConversionUtil.FormulaToken token = tokenList.get(i);
      if(token.getRef() != null && i < names.size())
      {
        PreserveNameIndex nameIndex = names.get(i);
        if(nameIndex != null)
          token.setChangeText("[" + nameIndex.address + "]");
      }
    }
    formula = ConversionUtil.updateFormula(formula, tokenList);
    formula = formula.substring(1);
    target.setAttribute(attr,formula);
  }

  public void doPreserve(ConversionContext context,Entry<String,List<PreserveNameIndex>> entry,OdfElement target)
  {
    String attrName = entry.getKey();
    doMerge(attrName,entry.getValue(),target);
  }
  
  private void doMerge(String attrName,List<PreserveNameIndex> index,OdfElement target)
  {
    
    StringBuffer buf = new StringBuffer();
    for(PreserveNameIndex nameIndex: index)
    {
      buf.append(nameIndex.address).append(" ");
    }
    String value = buf.toString();
    if(value.endsWith(" "))
      value = value.substring(0, value.length()-1);
    target.setAttribute(attrName,value);
  }
  
  private void doAppend(ConversionContext context, PreserveNameIndex indexName, OdfElement target)
  {
    
    if(indexName.attrName.equals("child"))
    {
      doAppendAction(context,indexName,target);
    }
    else if(indexName.attrName.equals("parent"))
    {
      doAppendAction(context,indexName,target);
    }
    else
    {
      String value = indexName.address;
      target.setAttribute(indexName.attrName,value);
    }
  }
  
  private void doAnchorAction(ConversionContext context, PreserveNameIndex indexName, OdfElement target)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    OdfElement pElement = index.getOdfNodes(indexName.elementId);
    if(indexName.attrName.equals("parent"))
    {
      pElement.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_END_CELL_ADDRESS);
      pElement.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_END_X);
      pElement.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_END_Y);
      try
      {
        if(pElement != null)
          target.appendChild(pElement);
      }
      catch(Exception e)
      {
      }
    }else if( !indexName.attrName.equals("child"))
    {
      //it must be attribute
      String value = indexName.address;
      target.setAttribute(indexName.attrName,value);
    }
  }
  
  private void doAppendAction(ConversionContext context, PreserveNameIndex indexName, OdfElement target)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    OdfElement pElement = index.getOdfNodes(indexName.elementId);
    try
    {
      if(pElement != null)
        target.appendChild(pElement);
    }
    catch(Exception e)
    {
    }
  }

  private void doAnchor(ConversionContext context,PreserveNameIndex indexName,OdfElement target)
  {
    doAppend(context,indexName,target);
  }
  
  private void preserveAttribute(ConversionContext context, PreserveNameIndex indexName, OdfElement target){
    String value = indexName.address;
    target.setAttribute(indexName.attrName,value);
  }
}
