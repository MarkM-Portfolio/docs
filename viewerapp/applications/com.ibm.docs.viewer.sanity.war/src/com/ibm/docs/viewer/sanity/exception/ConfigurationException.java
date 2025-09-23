package com.ibm.docs.viewer.sanity.exception;

public class ConfigurationException extends Exception
{

  /**
   * 
   */
  private static final long serialVersionUID = 1L;

  private String message;

  public ConfigurationException(String message)
  {
    super();
    this.message = message;
  }

  @Override
  public String getMessage()
  {
    return message;
  }

}
