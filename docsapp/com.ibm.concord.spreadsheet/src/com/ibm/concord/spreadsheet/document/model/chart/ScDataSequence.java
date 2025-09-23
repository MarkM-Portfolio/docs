package com.ibm.concord.spreadsheet.document.model.chart;

import java.util.ArrayList;
import java.util.List;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Reference;

public class ScDataSequence extends com.ibm.concord.document.common.chart.DataSequence 
{
	List<Reference> refs;
	Document doc;
	ScDataProvider dataProvider;
	List<String> addresses;
	String bacAddress;
	
	public ScDataSequence(ScDataProvider dataProvider, Document doc)
	{
		this.dataProvider = dataProvider;
		this.doc = doc;
		refs = new ArrayList<Reference>();
		bacAddress = null;
	}
	@Override
	public List<Float> getData() {
		// TODO Auto-generated method stub
		return null;
	}

	public String getBacAddress()
	{
		return bacAddress;
	}
	
	@Override
	public String getAddress() 
	{
		bacAddress = null;
		StringBuffer bacAddr = new StringBuffer();
		boolean needBac = false;
		StringBuffer addr = new StringBuffer();
		int len = refs.size();
		if(len > 1)
			addr.append("(");
		for(int i=0;i < len;i++)
		{
			Reference ref = refs.get(i);
			if(ref != null)
			{
				String addrStr = ref.getAddress();
				String bacAddrStr = ref.getAddress(true);
				if(!addrStr.equals(bacAddrStr))
				{
					if(!needBac)
					{
						needBac = true;
						bacAddr.append(addr);
					}
					bacAddr.append(bacAddrStr);
				}
				else if(needBac)
					bacAddr.append(addrStr);
				addr.append(addrStr);
			}
			else
			{
				addr.append(this.addresses.get(i));
				if(needBac)
					bacAddr.append(this.addresses.get(i));
			}
			if(i < len-1)
			{
				addr.append(",");
				if(needBac)
					bacAddr.append(",");
			}
		}
		if(len > 1)
		{
			addr.append(")");
			if(needBac)
				bacAddr.append(")");
		}
		if(needBac)
			bacAddress = bacAddr.toString();
		return addr.toString();
	}

	@Override
	public String getNumberFormat() {
		// TODO Auto-generated method stub
		return null;
	}
	
	public void putReference(Reference ref)
	{
		refs.add(ref);
		this.doc.getReferenceList().addRange(ref);
	}
	
	public void putReference(Reference ref, int index)
	{
		Reference oldRef = refs.get(index);
		if(oldRef != null){
			//oldRef.deleteRelateChartData(this);  //only useful when server side calculate.
			this.doc.getReferenceList().deleteRange(oldRef);
		}
		refs.set(index, ref);
		this.doc.getReferenceList().addRange(ref);
	}
	
	public Reference getReference(int index)
	{
		return refs.get(index);
	}

	public void setReference(String addr)
	{
		int size = refs.size();
		for(int i = 0; i< size; i++)
		{
			Reference oldRef = refs.get(i);
			if(oldRef != null){
				//oldRef.deleteRelateChartData(this);  //only useful when server side calculate.
				this.doc.getReferenceList().deleteRange(oldRef);
			}
		}
		refs.clear();
		
		addresses = CommonUtils.getRanges(addr);
		for(int i = 0; i< addresses.size(); i++)
		{
			ParsedRef parsedRef = ReferenceParser.parse(addresses.get(i));
			if(parsedRef !=null && FormulaUtil.isValidFormulaRef(parsedRef))
			{
				//The reftype should be different for datasequence with different roles
				Reference ref = doc.getReferenceList().getRefByAddress(parsedRef, parsedRef.sheetName, 0, true);
				this.putReference(ref);
			}else
				this.putReference(null);
		}
	}
}
