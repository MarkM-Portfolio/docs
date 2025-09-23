package com.ibm.symphony.conversion.service.common.chart.json2odf;

import java.util.ArrayList;
import java.util.List;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.dom.OdfNamespaceNames;
import org.odftoolkit.odfdom.dom.element.chart.ChartChartElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnsElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableHeaderRowsElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableHeaderColumnsElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowsElement;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextListItemElement;
import org.odftoolkit.odfdom.dom.element.text.TextPElement;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.Constant;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser.ParsedRef;

public class LocalTableExporter
{
	TableTableElement localTable;
	public LocalTableExporter(ConversionContext context)
	{
		 ChartChartElement chartElement = (ChartChartElement)context.get("Target");
		 localTable = chartElement.newTableTableElement();
		 localTable.setTableNameAttribute( "local-table");
		 TableTableHeaderColumnsElement  thc = localTable.newTableTableHeaderColumnsElement();
		 thc.newTableTableColumnElement();
		 TableTableColumnsElement tc = localTable.newTableTableColumnsElement();		 
		 tc.newTableTableColumnElement();
		 TableTableHeaderRowsElement tableRows = localTable.newTableTableHeaderRowsElement();
		 tableRows.newTableTableRowElement();
		 context.put("localTableExporter", this);
	}
	public void converter(List<Object> pts, String ref, boolean beString)//all the ref must be single row or single column
	{
		ParsedRef parseRef = ReferenceParser.parse(ref);
		int sr = 0;
		int sc = 0;
		int er = 0;
		int ec = 0;
		if(Constant.CELL_REFERENCE.equals(parseRef.type))
		{
			sr= er = parseRef.getIntStartRow();
			sc= ec = parseRef.getIntStartCol();
		}
		else
		{
			sr = parseRef.getIntStartRow();
			sc = parseRef.getIntStartCol();
			er = parseRef.getIntEndRow();
			ec = parseRef.getIntEndCol();
		}
		int ptIdx = 0;
	
		if(sr == 1)//table-header-rows
		{
			 NodeList tableRowsList = localTable.getElementsByTagName("table:table-header-rows");
			 TableTableHeaderRowsElement tableRows = (TableTableHeaderRowsElement)tableRowsList.item(0);
			  
			 NodeList tableRowList = tableRows.getElementsByTagName("table:table-row");
			 TableTableRowElement tableRow = (TableTableRowElement)tableRowList.item(0);
			  
			 ptIdx = tableRowConverter(tableRow, sc, ec, beString, pts, ptIdx);
			 
			if(er != sr)//It is impossible
			{
			
			}
		}
		else
		{
			  sr --;
			  er --;
			  NodeList tableRowsList = localTable.getElementsByTagName("table:table-rows");
			  TableTableRowsElement tableRows;
			  if(tableRowsList == null || tableRowsList.getLength() == 0)
			  {
				  tableRows = localTable.newTableTableRowsElement();	
			  }
			  else
				  tableRows = (TableTableRowsElement)tableRowsList.item(0);
			  
			  NodeList tableRowList = tableRows.getElementsByTagName("table:table-row");
			  int start = tableRowList == null ? 0 : tableRowList.getLength();
			  start ++;
			
			  for(int i = start; i < sr; i++)
				 tableRows.newTableTableRowElement();
			  for(int i = sr; i <= er; i++)
			  {
				  TableTableRowElement tableRow;
				  if(i < start)
					  tableRow = (TableTableRowElement)tableRowList.item(i - 1);
				  else
					  tableRow = tableRows.newTableTableRowElement();
				  
				  ptIdx = tableRowConverter(tableRow, sc, ec, beString, pts, ptIdx);
			  }
		}
		
	}
	
	private int tableRowConverter(TableTableRowElement tableRow, int sc, int ec, boolean beString, List<Object> pts, int ptIdx)
	{
		  NodeList tableCellList = tableRow.getElementsByTagName("table:table-cell");
		  int start = tableCellList == null ? 0 : tableCellList.getLength();
		  start ++;
		  
		  OdfFileDom ownerDocument = (OdfFileDom)tableRow.getOwnerDocument();
		  for(int i = start; i< sc; i++)
		  {
			  TableTableCellElement tableTableCell = ownerDocument.newOdfElement(TableTableCellElement.class);
			  tableTableCell.newTextPElement();
			  tableRow.appendChild(tableTableCell);
		  }
		  int ptsSize = pts.size();
		  for(int i = sc; i<= ec; i++)
		  {
			  if(ptIdx >= ptsSize)
				  break;
			  TableTableCellElement tableTableCell;
			  if(i < start)
			  {
				  tableTableCell = (TableTableCellElement)tableCellList.item(i - 1);
				  NodeList textPList = tableTableCell.getChildNodes();
				  int l = textPList.getLength();
				  for(int k = l-1; k >=0 ; k-- )
					  tableTableCell.removeChild(textPList.item(k));
			  }
			  else
			  {
				  tableTableCell = ownerDocument.newOdfElement(TableTableCellElement.class);
				  tableRow.appendChild(tableTableCell);
			  }
			  if(beString)
			  {
				  tableTableCell.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.OFFICE, "value-type"), "string");
				  
				  TextPElement textP = tableTableCell.newTextPElement();
				  Object item = pts.get(ptIdx++);
				  if(item != null && item instanceof ArrayList)
				  {
					  StringBuffer pv = new StringBuffer();
					  List<Object> items = (List<Object>) item;
					  TextListElement textList = tableTableCell.newTextListElement();
					  for(int j = 0; j < items.size(); j ++)
					  {
						  TextListItemElement textListItem = textList.newTextListItemElement();
						  TextPElement p = textListItem.newTextPElement();
						  String v = String.valueOf(items.get(j));
						  p.setTextContent(v);
						  pv.append(v);
						  pv.append(" ");
					  }
					  if(pv.length() > 0)
						  pv.deleteCharAt(pv.length() - 1);
					  textP.setTextContent(pv.toString());
				  }
				  else
					  textP.setTextContent(String.valueOf(item));
			  }
			  else
			  {
				  tableTableCell.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.OFFICE, "value-type"), "float");
				  Object tmpPt = pts.get(ptIdx ++);
				  String strV = "1.#NAN";
				  if(tmpPt != null && !(tmpPt instanceof String))
					  strV = String.valueOf(tmpPt);
				  tableTableCell.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.OFFICE, "value"), strV);
				  TextPElement textP = tableTableCell.newTextPElement();
				  textP.setTextContent(strV);
			  }
		  }
		  return ptIdx;
	}
}