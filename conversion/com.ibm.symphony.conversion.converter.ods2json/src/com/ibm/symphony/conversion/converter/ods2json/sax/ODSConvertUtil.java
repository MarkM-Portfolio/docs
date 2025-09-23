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

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;


import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Result;
import javax.xml.transform.Transformer;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfChartDocument;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.OdfdraftPackage;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil.NODENAME;
import com.ibm.symphony.conversion.converter.ods2json.sax.xmlimport.ChartXMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.xmlimport.SpreadsheetXMLImport;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.FormulaToken;

public class ODSConvertUtil
{
  public static final String ODFDRAFT_NAME = "odfdraft";
  public static final String ID_STRING = "id";
  public final static String RESERVERED = "reserved";
  public final static String COMMENTS_MSG_FILE = RESERVERED + File.separator + "comments.json";
  public static final Pattern OPERATOR = Pattern.compile("(>|=|<|>=|<=|<>)");
  public static final Pattern NUMBER = Pattern.compile("([0-9]+|true|false)");
  public static final Pattern PATTERN_TOKEN = Pattern.compile("(" + Pattern.quote("value()")
      +  "(" + OPERATOR.toString() +")" + "(" + NUMBER.toString() + ")" + ")");
  public static final Pattern FLOAT = Pattern.compile("((-|\\+)?\\d+(\\.\\d+)?)");
  public static final Pattern PATTERN_ODF_TIME = Pattern.compile("(-?)" + Pattern.quote("PT") + 
      "(" + FLOAT.toString() + ")" + Pattern.quote("H") + "(" + FLOAT.toString() + ")"
      + Pattern.quote("M") + "(" + FLOAT.toString() + ")" + Pattern.quote("S"));
  static Logger log = Logger.getLogger(ODSConvertUtil.class.getName());
  
  private static final Pattern PATTERN_EXTERNAL_FORMULA = Pattern.compile("\\['file:///(.+)'([^\\[\\]]+)\\]");
  
  /**
   * OO format
   */
  public final static String OOOPREFIX = "ORG.OPENOFFICE.";
  public final static String OOOC = "OOOC:";
  public final static String[] ooFormulaCategory = { "com.sun.star.sheet.addin.DateFunctions.get","com.sun.star.sheet.addin.Analysis.get"};
  public final static String MCPREFIX = "COM.MICROSOFT.";
  
  /**
   * MS format
   */
  public final static String MSPREFIX = "msoxl:";
  
  private static enum FState {NONE, SINGLEQUOTE, DOUBLEQUOTE};
  
  
  /**
   * remove the oo formula category
   * @param formula
   * @return
   */
  public static String removeOOFormulaCategory(String formula){
    for(int i=0;i<ooFormulaCategory.length;i++){
       String prefix = ooFormulaCategory[i];
       formula = formula.replace(prefix, "");
       formula = formula.replace(prefix.toUpperCase(), "");
   }
   return formula;
 }
  
  //get the styleid of styles according to the cell style name in odf
  public static String findCellStyleId(ConversionContext context,String cellStyleName) {
    HashMap<String, String> cellStyleNameIdMap =(HashMap<String, String>)context.get("cellStyleNameIdMap");
    String styleId = cellStyleNameIdMap.get(cellStyleName);
    //error compatible
    //in previous version, we export the cell which has the default cell style with Name "defaultcellstyle"
    //rather than DefaultCell which is declared in autostyles.
    if(ConversionConstant.DEFAULT_CELL_STYLE.equals(cellStyleName))
      return ConversionConstant.DEFAULT_CELL_STYLE;
    return (styleId == null)?"":styleId;
  }

  public static boolean isFormulaCell (String formula) {
    return ConversionUtil.hasValue(formula);
  }
  
  /*
   * for the  "draw:object" tag, it could be a chart or ole,
   * need to distinguish them
   */
  
  public static boolean isDrawObject(String qName)
  {
    NODENAME token = XMLUtil.getXMLToken(qName);
    if(token == NODENAME.DRAW_OBJECT)
      return true;
    return false;
    
  }
  
  public static boolean isDrawFramePreserveChild(String eleName)
  {
    return eleName.equals("draw:text-box") ||eleName.equals("draw:object") 
    || eleName.equals("draw:object-ole")  ||eleName.equals("svg:desc")
    ||eleName.equals("svg:title")||eleName.equals("image-map")
    || eleName.equals("draw:applet") ||eleName.equals("draw:contour-path")
    || eleName.equals("draw:contour-polygon") ||eleName.equals("draw:floating-frame")
    || eleName.equals("draw:glue-point") ||eleName.equals("draw:plugin")
    || eleName.equals("office:event-listeners"); 
  }
  
  public static boolean isChartObject(ConversionContext context,String qName, AttributesImpl attrs)
  {
    OdfDocument odfSheetDoc = (OdfDocument)context.get("Source");
    NODENAME token = XMLUtil.getXMLToken(qName);
    if(token != NODENAME.DRAW_OBJECT) return false;
    
    String value = null;
    if(attrs != null)
      value = attrs.getValue("xlink:href");
    if(value != null)
    {
      OdfDocument chart = odfSheetDoc.getEmbeddedDocument(value);
      if(chart == null) return false;
      if(chart instanceof OdfChartDocument)
        return true;
    }
    return false;
  }
  
  public static boolean isTableCellElement(String qName)
  {
    NODENAME token = XMLUtil.getXMLToken(qName);
    if(token == NODENAME.TABLE_COVERED_TABLE_CELL || token == NODENAME.TABLE_TABLE_CELL)
      return true;
    return false;
  }
  
  public static String getColumnStyleId(ConversionContext context, ConversionUtil.Sheet sheet, int cellColumnIndex)
  {
    Document document = (Document) context.get("Target");
    String sheetId = "";
    if(sheet != null)
    	sheetId = sheet.sheetId;
    int size = document.uniqueColumns.uniqueColumnList.size();
    if (cellColumnIndex < size)
      size = cellColumnIndex + 1;
    for (int j = 0; j < size; j++)
    {
      ConversionUtil.Column column = document.uniqueColumns.uniqueColumnList.get(j);
      if(!sheetId.equals(column.sheetId))
    	  continue;
      if ((column.columnIndex <= cellColumnIndex) && (column.columnIndex + column.repeatedNum) >= cellColumnIndex)
        return column.styleId;
    }
    return null;
  }
  
  
  /*
   * for the "draw:image" tag, it could be a graphic or a child of chart
   * need to distinguish them
   * return false means it a chart, need be filter out
   */
  public static boolean isDrawImage(String qName,  AttributesImpl attributes)
  {
    NODENAME token = XMLUtil.getXMLToken(qName);
    if(token != NODENAME.DRAW_IMAGE)
      return false;
    String value = null;
    if(attributes != null)
      value = attributes.getValue("xlink:href");
    if(value != null && value.startsWith("./ObjectReplacements"))
      return false;
    return true;
  }
  

  
  public static String convertFormula(String formula)
  {
	  return convertFormula(formula, false);
  }
  
  public static String convertFormula(String formula, boolean bValidation){
	  	String value = formula.startsWith("of:")?formula.substring(3):formula;
	    if(!bValidation && !value.startsWith("="))
	      return null;
	    String valueUpperCase = value.toUpperCase();
	    if(value.contains(OOOPREFIX))
	      value = value.replace(OOOPREFIX, "");
	    else if(valueUpperCase.startsWith(OOOC)){
	      value = value.substring(OOOC.length());
          value = removeOOFormulaCategory(value);
	    }else if(value.contains(MCPREFIX))
	      value = value.replace(MCPREFIX, "");
	    
	    // keep the value of the external link
	    Matcher m = PATTERN_EXTERNAL_FORMULA.matcher(value);
	    ArrayList<int[]> externalPos = new ArrayList<int[]>();
	    while(m.find())
	    {
	      String link = m.group();
	      int start = m.start();
	      int end = m.end();
	      int[] pos = {start, end};
	      externalPos.add(pos);
	    }
	    
	    char[] b = new char[value.length()]; 
	    value.getChars(0, value.length(), b, 0);
	    char[] f = new char[value.length()];
	    int k = 0;
	    int p = 0;
		FState state = FState.NONE;
		
		int externalStart = -1;
	    int externalEnd = -1;
	    int pos = 0;
	    if(externalPos.size() > pos)
	    {
	      int[] e = externalPos.get(pos);
	      externalStart = e[0];
	      externalEnd = e[1];
	    }
	    
	    for (int j = 0; j < b.length; ++j) {
	      // keep the char if j in externalPos
  	      if(j >= externalStart && j <= externalEnd)
  	      {
  	        f[k++] = b[j];
  	        if(j == externalEnd)
  	        {
  	          //move to the next external position
  	          if(externalPos.size() > ++pos)
  	          {
  	            int[] e = externalPos.get(pos);
  	            externalStart = e[0];
  	            externalEnd = e[1];
  	          }
  	        }
  	        continue;
  	      }
	        
	    	int c = b[j];
	    	switch (c) {
	    		case '\'':
	    			if (state == FState.NONE) state = FState.SINGLEQUOTE; // the first single quote
	    			else if (state == FState.SINGLEQUOTE) state = FState.NONE; // found the end single quote
	    			break;
	    		case '"':
	    			if (state == FState.NONE) state = FState.DOUBLEQUOTE; // the first double quote
	    			else if (state == FState.DOUBLEQUOTE) state = FState.NONE;
	    			break;
	    		default:
		    }
			if (state == FState.NONE) {
			    // ignore those character if it isn't included by neither single quote nor double quote
				if ((c == '[') || (c == '.' && (p == '[' || p == ':')) || (c == ']')){
				    	p = b[j];
				    	continue;
				}
			    else
			     	f[k++] = b[j];
			 } else
			  f[k++] = b[j];
			p = b[j];
    	}
	    value = String.valueOf(f, 0, k);
	    return value;
  }
  //the address might composed by several range address with space as seperator
  public static ArrayList<String> getRanges(String address){
    String sep = "'";
    Pattern pattern = Pattern.compile("( )+");
    ArrayList<String> newRanges = new ArrayList<String>();
    
    if(ConversionUtil.hasValue(address)){
      StringBuffer partRange = new StringBuffer();
      int count = 0;
      int index = 0;
//      String[] ranges = address.split(" ");
      ArrayList<String> ranges = new ArrayList<String>();
      Matcher m = pattern.matcher(address);
      while(m.find()){
        int start = m.start();
        String range = address.subSequence(index, start).toString();
        index = m.end();
//        ranges.add(match);
//        index = m.end();
//      }
//      for(int i=0; i<ranges.length; i++){
//        String range = ranges[i];
        int n=0;
        while(true){
          n = range.indexOf(sep, n);
          if( n != -1){
            count++;
            n++;
          }else
            break;
        }
        partRange.append(range);
        if(count%2 == 0){
          newRanges.add(partRange.toString());
          partRange = new StringBuffer();
          count = 0;
        }else{
          partRange.append(address.subSequence(start, index).toString());
        }
      }
      partRange.append(address.subSequence(index, address.length()).toString());//last one
      newRanges.add(partRange.toString());
    }
    
    return newRanges;
  }

  public static void parseXML(OdfDocument doc, OdfdraftPackage odfdraft, String filePath, ConversionContext context) throws Exception
  {
    InputStream fileStream = null;
    OutputStream outStream = null;
    try
    {
      if (odfdraft != null)
      {
        outStream = odfdraft.createNewEntry(filePath);
      }
      else
      {
        outStream = new ByteArrayOutputStream();
      }
      // create sax parser
      SAXParserFactory saxFactory = SAXParserFactory.newInstance();
      saxFactory.setNamespaceAware(true);
      saxFactory.setValidating(false);
      SAXParser parser = saxFactory.newSAXParser();
      XMLReader xmlReader = parser.getXMLReader();
      // More details at http://xerces.apache.org/xerces2-j/features.html#namespaces
      xmlReader.setFeature("http://xml.org/sax/features/namespaces", true);
      // More details at http://xerces.apache.org/xerces2-j/features.html#namespace-prefixes
      xmlReader.setFeature("http://xml.org/sax/features/namespace-prefixes", true);
      // More details at http://xerces.apache.org/xerces2-j/features.html#xmlns-uris
      xmlReader.setFeature("http://xml.org/sax/features/xmlns-uris", true);

      // create sax writer to save the id to odfdraft
      SAXTransformerFactory saxWriterFac = (SAXTransformerFactory) SAXTransformerFactory.newInstance();
      TransformerHandler xmlWriter = saxWriterFac.newTransformerHandler();
      Transformer transformer = xmlWriter.getTransformer();
      transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
      // transformer.setOutputProperty(OutputKeys.INDENT, "yes");
      transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
      // outStream = new ByteArrayOutputStream();
      Result resultxml = new StreamResult(outStream);
      xmlWriter.setResult(resultxml);
      // initialize the input source's xml, such as content.xml
      fileStream = doc.getPackage().getUncachedInputStream(filePath);
      if (fileStream != null)
      {
        XMLImport handler = getImportInstance(doc, filePath);
        handler.setConversionContext(context);
        handler.setXMLWriter(xmlWriter);
        xmlReader.setContentHandler(handler);
        InputSource contentSource = new InputSource(fileStream);
        xmlReader.parse(contentSource);
        if (outStream instanceof ByteArrayOutputStream)
        {
          byte[] bytes = ((ByteArrayOutputStream) outStream).toByteArray();
          doc.getPackage().insert(bytes, filePath, "text/xml");
          outStream.close();
        }
        // doc.getPackage().insert(bytes, OdfXMLFile.CONTENT.getFileName(), "text/xml");
      }
    }
    catch (Exception e)
    {
      if (outStream != null)
        outStream.close();
      throw e;
    }
    finally
    {
      if (fileStream != null)
        fileStream.close();
    }
  }
  
  private static XMLImport getImportInstance(OdfDocument doc, String filePath){
    XMLImport importer;
    OdfFileDom fileDom = new OdfFileDom(doc, filePath);
    if(doc instanceof OdfSpreadsheetDocument){
      importer = new SpreadsheetXMLImport(fileDom);
    }else if (doc instanceof OdfChartDocument){
      importer = new ChartXMLImport(fileDom);
    }else
      importer = new XMLImport(fileDom);
    return importer;
  }
  

  /**
   * Copy Images which under Pictures/ to draft folder.
   */
  public static void copyImageToDraftFolder(ConversionContext context, String imageSrc)
  {
    // before use this func should use func updateImageDir to ensure that all images are under Pictures/.
    if (imageSrc == null)
      return;
    boolean bImage = imageSrc.startsWith(ConversionConstant.DIR_PIC_PREFIX);; 
    boolean bObject = false;
    if(!bImage)
        bObject = imageSrc.startsWith(ConversionConstant.DIR_OBJ_PREFIX);
    if(!bImage && !bObject)
        return;

    InputStream in = null;
    OutputStream out = null;
    try
    {
      OdfDocument odf = (OdfDocument) context.get("Source");
      OdfPackage odfPackage = odf.getPackage();
      
      File targetFolder = new File((String) context.get("TargetFolder"));
      String targetDir = targetFolder.getPath() + File.separator + "Pictures";
      String fileName = null;
      if(bImage)
        fileName = imageSrc.substring(ConversionConstant.DIR_PIC_PREFIX.length()+1); 
      else if(bObject)
      {
        fileName = imageSrc.substring(ConversionConstant.DIR_OBJ_PREFIX.length()+1);
        targetDir +=  File.separator + "object";
      }
      File pictureDir = new File(targetDir);
      if (!pictureDir.exists())
        pictureDir.mkdirs();
      String targetFilePath = pictureDir.getAbsolutePath() + File.separator + fileName;
      if(bObject)
        targetFilePath += ".png";
      if (!new File(targetFilePath).exists())
      {
        in = odfPackage.getInputStream(imageSrc);
        out = new FileOutputStream(targetFilePath);
        int len = 0;
        byte[] buf = new byte[4096];
        while ((len = in.read(buf)) > 0)
        {
          out.write(buf, 0, len);
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.INFO, e.getMessage(), e);
    }
    finally
    {
      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          log.log(Level.INFO, e.getMessage(), e);
        }
      }
      if (out != null)
      {
        try
        {
          out.close();
        }
        catch (IOException e)
        {
          log.log(Level.INFO, e.getMessage(), e);
        }
      }
    }
  }

  
}
