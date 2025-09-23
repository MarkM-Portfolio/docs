/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.exception;

/**
 * The numbers(19xx) are used to indicate the directory service access related error codes.
 * 
 */
public class DirectoryServiceException extends Exception
{
  private static final long serialVersionUID = 483103802384120775L;

  /**
   * Exception code(1900) indicates that having no permission this file in repository.
   *  
   */
  public static final int EC_DIRECTORY_USER_NOT_FOUND = 1900;
}
