package com.ibm.symphony.conversion.service.common.chart;

import java.util.ArrayList;
import java.util.List;

import com.ibm.symphony.conversion.service.common.chart.ReferenceParser.ParsedRef;
public class LocalTable
{
	private List<Row> rowList;
	//public Map<String,List<Object>> dataMap;//used for external link and named expression
	
	public LocalTable()
	{
		rowList = new ArrayList<Row>();
	}
	
	public void addRow(Row row)
	{
		rowList.add(row);
	}
	
	public List<Object>  getRangeByRef(ParsedRef parseRef)
	{
		//compose pts from local-table
		List<Object>  pts = new ArrayList<Object>();
		int len = rowList.size();
		if(Constant.CELL_REFERENCE.equals(parseRef.type))
		{
			int sr = parseRef.getIntStartRow();
			int sc = parseRef.getIntStartCol();
			if(sr -1 >= len)
				return pts;
			Row row = rowList.get(sr - 1);
			if(row != null)
			{
				int rowLen = row.size();
				if(sc- 1 >= rowLen)
					return pts;
				pts.add(row.get(sc - 1));
			}
		}
		else
		{
			int sr = parseRef.getIntStartRow();
			int sc = parseRef.getIntStartCol();
			int er = parseRef.getIntEndRow();
			int ec = parseRef.getIntEndCol();
			for(int i = sr -1 ; i < er; i++)//1 base address to 0 base array
			{
				if(i >= len)
					break;
				Row row = rowList.get(i);
				if(row != null)
				{
					int rowLen = row.size();
					for(int j = sc - 1; j< ec; j++)
					{
						if(j >= rowLen)
							break;
						pts.add(row.get(j));
					}
				}
			}
		}
		return pts;	
	}
	
	public String getCellByRef(ParsedRef parseRef)
	{
		if(Constant.CELL_REFERENCE.equals(parseRef.type))
		{
			int sr = parseRef.getIntStartRow();
			int sc = parseRef.getIntStartCol();
			if(sr -1 >= rowList.size())
				return "";
			Row row = rowList.get(sr - 1);
			if(row != null)
			{
				int rowLen = row.size();
				if(sc- 1 >= rowLen)
					return "";
				return String.valueOf(row.get(sc - 1));
			}
		}
		return "";
	}
	
	
	public static class Row
	{
		 private List<Object> valueList;
		 
		 public Row()
		 {
			 valueList = new ArrayList<Object>();
		 }
		 
		 public void add(Object value)
		 {
			 valueList.add(value);
		 }
		 
		 public Object get(int index)
		 {
			 return valueList.get(index);
		 }
		 
		 public int size()
		 {
			 return valueList.size();
		 }
	}
}
