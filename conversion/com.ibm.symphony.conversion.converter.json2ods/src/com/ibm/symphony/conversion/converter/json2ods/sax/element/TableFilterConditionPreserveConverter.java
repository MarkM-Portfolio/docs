package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.Iterator;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.table.TableDatabaseRangeElement;
import org.odftoolkit.odfdom.dom.element.table.TableFilterConditionElement;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.json2ods.PreserveManager;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class TableFilterConditionPreserveConverter extends GeneralPreserveConvertor
{
  private static final Logger LOG = Logger.getLogger(TableFilterConditionPreserveConverter.class.getName());
  public void doPreserve(ConversionContext context,OdfElement target,OdfElement parent)
  {
    //change the value for table:field-number according to position of the range of table:filter and range of filter range
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    String filterRange = null;
    if(id != null && !"".equals(id))
    {
      Set<PreserveNameIndex> nameSet = index.getPreserveData(id);
      if(nameSet == null)
        return;
      Iterator<PreserveNameIndex> it =  nameSet.iterator();
      //in JsonToODSIndex.indexPreserveData it will not add the invalid delete range to the preserve data
      //so if nameSet is empty, it means that it must be delete range type with invalid range
      boolean bHasFieldNumber = false;
      while( it.hasNext())
      {
        PreserveNameIndex nameIndex = it.next();
        switch(nameIndex.type)
        {
          case DELETE:
          {
            String fieldAddress = nameIndex.address;
            if(null == fieldAddress || nameIndex.address.contains("#REF!"))
            {
              if(parent.hasChildNodes())
                parent.removeChild(target);
            }
            else
            {
              if(filterRange == null)
              {
                Node filterRangeNode = parent.getParentNode();
                while(filterRangeNode != null && !(filterRangeNode instanceof TableDatabaseRangeElement))
                {
                  filterRangeNode = filterRangeNode.getParentNode();
                }
                if(filterRangeNode != null && filterRangeNode instanceof TableDatabaseRangeElement)
                {
                  TableDatabaseRangeElement rangeEle = (TableDatabaseRangeElement)filterRangeNode;
                  filterRange = rangeEle.getTableTargetRangeAddressAttribute();
                }
              }
              
              if(filterRange != null)
              {
                //compare the fieldAddress and filerRange
                ParsedRef rangeRef = ReferenceParser.parse(filterRange);
                ParsedRef fieldRef = ReferenceParser.parse(fieldAddress);
                if(rangeRef.getSheetName().equals(fieldRef.getSheetName()))
                {
                  int fieldSC = ReferenceParser.translateCol(fieldRef.getStartCol());
                  int rangeSC = ReferenceParser.translateCol(rangeRef.getStartCol());
                  int rangeEC = ReferenceParser.translateCol(rangeRef.getEndCol());
                  if(fieldSC >= rangeSC && fieldSC <= rangeEC)
                  {
                    int fieldNum = fieldSC - rangeSC;
                    if(target instanceof TableFilterConditionElement)
                    {
                      TableFilterConditionElement filterEle = (TableFilterConditionElement)target;
                      filterEle.setTableFieldNumberAttribute(fieldNum);
                      bHasFieldNumber = true;
                    }
                  }
                }
              }
            }
            break;
          }
          default:
//            manager.doPreserve(context, id, target,parent);
            LOG.log(Level.WARNING, "should deal with the {0} pnames with id {1}for table:filter-condition element");
            break;
        }
      }
      if(!bHasFieldNumber)
      {
        //the field address is still not valid
        if(parent.hasChildNodes())
          parent.removeChild(target);
      }
    }
  }
}
