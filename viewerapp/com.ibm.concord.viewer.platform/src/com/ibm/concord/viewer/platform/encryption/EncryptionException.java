package com.ibm.concord.viewer.platform.encryption;

public class EncryptionException extends Exception
{
  private static final long serialVersionUID = 1L;
  
  protected EncryptionException()
  {
    super("Encryption Error.");
  }
  
  protected EncryptionException(Throwable paramThrowable)
  {
    super("Encryption Error.", paramThrowable);
  }
  protected EncryptionException(String message, Throwable paramThrowable)
  {
    super("Encryption Error.", paramThrowable);
  }
}