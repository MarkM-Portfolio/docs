package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import java.util.Set;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.service.common.chart.odf2json.ChartImport;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class DrawObjectContext extends GeneralContext {
	 boolean isChart;
	 public DrawObjectContext(XMLImport importer, String uri, String localName, String qName, Object target)
	  {
	    super(importer, uri, localName, qName, target);
	  }

	  public void startElement(AttributesImpl attrs)
	  {
		if(attrs.getLength()==0)
		   return;
	    mAttrs = attrs;
	    
	    String href = this.getAttrValue(ConversionConstant.ODF_ATTR_XLINK_HREF);
	    if(href==null)
	    	return;
	    
	    //remove "./"
	    String name = href;
	    if(name.startsWith("./"))
	    	name = name.substring(2);
	    if(name.endsWith("/"))
	    	name = name.substring(0, name.length()-1);
	    Set<String> chartNames = (Set<String>)mContext.get("ChartNames");
	    //if the object is not chart, do nothing
        if(!chartNames.contains(name))
        {
          doDetect();
          startPreserve();
          return;
        }
	    
        isChart = true;
        String targetDir = (String)mContext.get("TargetFolder");
        OdfDocument odfSheetDoc = (OdfDocument)mContext.get("Source");
        if(!new ChartImport().convert(odfSheetDoc,targetDir,name, IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_ODF)))
          return;
        
        DrawFrameContext pContext = (DrawFrameContext)this.getParentConvertor();
        pContext.setNeedAddId(true);
        pContext.addIdOnOdfElement(name);
        ConversionUtil.DrawFrameRange objRange  = pContext.getFrameRange();
        
        ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
	    objRange.rangeId = name;
	    objRange.usage = ConversionUtil.RangeType.CHART;
	    objRange.href = "Charts/" + name;
	    document.unnameList.add(objRange);
	  }
	  
	  public void endElement()
	  {
		  if(!isChart)
			  endPreserve();
	  }
	  
}
