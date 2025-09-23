/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2pdf;

import java.io.File;
import java.util.Map;

import org.w3c.dom.Document;

import com.ibm.symphony.conversion.service.exception.ConversionException;

public interface IProcessor
{
  Document preProcess(File sourceFile, File targetFolder, Map parameters) throws ConversionException; 
  
  void postProcess(File sourceFile, File targetFolder, Map parameters);
  
  String getUserStyle(Map parameters);
}
