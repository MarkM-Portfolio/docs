/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfXMLFile;

import com.ibm.symphony.conversion.converter.json2ods.OdfExportPackage;

public class ODSSAXWriter
{
  
  TransformerHandler mXmlWriter = null; 
  OutputStream outStream = null;
  FileOutputStream fos = null ;
  public ODSSAXWriter()
  {
    // create sax writer to save the id to odfdraft
    SAXTransformerFactory saxWriterFac = (SAXTransformerFactory) SAXTransformerFactory.newInstance();
    try
    {
      mXmlWriter = saxWriterFac.newTransformerHandler();
    }
    catch (TransformerConfigurationException e)
    {
    }
  }
  
  public TransformerHandler getXMLWriter()
  {
    return mXmlWriter;
  }
  
  public void init(OdfFileDom contentDom,OdfDocument doc, OdfExportPackage exportpackage)
  {
//    Source source = new DOMSource(contentDom);
    Transformer transformer = mXmlWriter.getTransformer();
    transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
    // transformer.setOutputProperty(OutputKeys.INDENT, "yes");
    transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
    String filePath = doc.getDocumentPackagePath() + OdfXMLFile.CONTENT.getFileName();
    outStream = exportpackage.createNewEntry(filePath);
    Result resultxml = new StreamResult(outStream);
    mXmlWriter.setResult(resultxml);
  }
}
