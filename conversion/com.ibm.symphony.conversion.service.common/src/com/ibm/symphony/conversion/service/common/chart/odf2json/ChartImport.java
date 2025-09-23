package com.ibm.symphony.conversion.service.common.chart.odf2json;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfChartDocument;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfMediaType;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;

public class ChartImport
{
	private static final Logger LOG = Logger.getLogger(ChartImport.class.getName());
	
	public boolean convertAll(OdfDocument doc, String targetFolder, boolean isODFFormula)
	{
		List<OdfDocument> odsChartDocs = doc.getEmbeddedDocuments(OdfMediaType.CHART);
		for (int i = 0; i < odsChartDocs.size(); i++)
		{
            OdfDocument odfChartDoc = odsChartDocs.get(i);
            convert(odfChartDoc, targetFolder, isODFFormula);
		}
		return true;
	}
	
	public boolean convert(OdfDocument doc, String targetFolder, String chartId, boolean isODFFormula)
	{
	  OdfChartDocument chart = (OdfChartDocument)doc.getEmbeddedDocument(chartId);
	  if(chart==null)
	    return false;
	  return convert(chart,targetFolder, isODFFormula);
	}
	
	private boolean convert(OdfDocument odfChartDoc, String targetFolder, boolean isODFFormula)
	{
	  FileOutputStream os = null;
	  String chartName = "";
      try
      {
        String chartPath = odfChartDoc.getDocumentPackagePath();
        int sublen = chartPath.lastIndexOf("/");
        chartName = sublen > 0 ? chartPath.substring(0, sublen) : chartPath;
        
        OdfFileDom contentDom = odfChartDoc.getContentDom();
        ChartDocument chart = new ChartDocument();
        chart.importFromOdfDom(contentDom);

        String folderPath = targetFolder + File.separator + "Charts";
        File chartsFolder = new File(folderPath);
        if (!chartsFolder.exists())
          chartsFolder.mkdir();

        os = new FileOutputStream(new File(folderPath + File.separator + chartName + ".js"));
        JSONObject ocontent = chart.toJson();
        if (!isODFFormula)
        {
          IDMFormulaLexer.transODFFormulaToOOXML(ocontent, "ref");
        }
        ocontent.serialize(os);
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "export " + chartName + " failed", e);
        return false;
      }
      finally
      {
        try
        {
          if(os!=null)
            os.close();
        }
        catch (Exception e)
        {
          LOG.log(Level.SEVERE, "close " + chartName + " failed", e);
        }
      }
      
	  return true;
	}
	
}
