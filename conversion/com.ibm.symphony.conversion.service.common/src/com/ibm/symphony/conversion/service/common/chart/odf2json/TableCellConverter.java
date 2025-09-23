package com.ibm.symphony.conversion.service.common.chart.odf2json;

import java.util.ArrayList;
import java.util.List;

import org.odftoolkit.odfdom.dom.OdfNamespaceNames;
import org.odftoolkit.odfdom.dom.attribute.office.OfficeValueAttribute;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElementBase;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextListItemElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.LocalTable;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class TableCellConverter extends Converter
{
	
	public void startElement(ConversionContext context)
	{
		LocalTable.Row row = (LocalTable.Row)target ;
		TableTableCellElementBase odfCell = (TableTableCellElementBase)element;
		OfficeValueAttribute attr = (OfficeValueAttribute) odfCell.getOdfAttribute(OdfNamespaceNames.OFFICE,"value");
		String typeValue = null;
	    if (attr != null)
	      typeValue = attr.getValue();
	    String valueType = odfCell.getOfficeValueTypeAttribute();
	    if(Utils.hasValue(valueType))
	    {
	    	if(valueType.equals("string"))
	    	{	    		
	    		NodeList textLists = element.getElementsByTagName("text:list");
	    		if(textLists != null && textLists.getLength() > 0)//For multi-column category created by open office
	    		{
	    			TextListElement textList = (TextListElement)textLists.item(0);
	    			NodeList textListItems = textList.getElementsByTagName("text:list-item");
	    			if(textListItems != null && textListItems.getLength() > 0)
	    			{
	    				List<Object> value = new ArrayList<Object>();
	    				for(int i = 0; i<textListItems.getLength(); i++)
	    				{
	    					TextListItemElement textlistItem =(TextListItemElement) textListItems.item(i);
	    					NodeList list = textlistItem.getElementsByTagName("text:p");
	    					if(list != null && list.getLength() > 0)
	    					{
	    						Node textP = list.item(0);
	    						value.add(textP.getTextContent());
	    					}
	    					else
	    						value.add("");
	    				}
	    				row.add(value);
	    			}
	    		}
	    		else
	    		{
	    			NodeList list = element.getElementsByTagName("text:p");
	    			String value = "";
	    			if(list != null && list.getLength() > 0)		    		
		    		{
		    		    Node textP = list.item(0);
		    		    value = textP.getTextContent();
		    		}
		    		row.add(value);
	    		}
	    	}
	    	else if(valueType.equals("float"))
	    	{
	    		Float value = null;
	    		if(Utils.isNumberic(typeValue))
	    		{
	    			value = Float.valueOf(typeValue);
	    		}
	    		row.add(value);
	    	}
	    }
	    else
	    	row.add("");
	}
}