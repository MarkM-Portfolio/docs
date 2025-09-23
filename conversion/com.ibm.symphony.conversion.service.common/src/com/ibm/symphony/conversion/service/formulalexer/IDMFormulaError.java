/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.formulalexer;

public class IDMFormulaError
{
  public String errorCode;

  public String message;

  public IDMFormulaError(String message, String errorCode)
  {
    this.message = message;
    this.errorCode = errorCode;
  }

  static IDMFormulaError IDMNULError = new IDMFormulaError("1", "#NULL!");

  static IDMFormulaError IDMDIVError = new IDMFormulaError("2", "#DIV/0!");

  static IDMFormulaError IDMVALError = new IDMFormulaError("3", "#VALUE!");

  static IDMFormulaError IDMREFError = new IDMFormulaError("4", "#REF!");

  static IDMFormulaError IDMNAMError = new IDMFormulaError("5", "#NAME?");

  static IDMFormulaError IDMNUMError = new IDMFormulaError("6", "#NUM!");

  static IDMFormulaError IDMNAError = new IDMFormulaError("7", "#N/A");

  static IDMFormulaError IDMUnParseError = new IDMFormulaError("2001", "unparse");

  static IDMFormulaError IDMERRError = new IDMFormulaError("1002", "#ERR!");

  static IDMFormulaError IDMUnSupportError = new IDMFormulaError("1001", "IDMUnSupportError");

  static IDMFormulaError IDMUnCalcError = new IDMFormulaError("3001", "IDMUnCalcError");
}
