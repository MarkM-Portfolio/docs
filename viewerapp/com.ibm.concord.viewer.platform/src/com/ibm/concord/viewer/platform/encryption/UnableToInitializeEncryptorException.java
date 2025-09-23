package com.ibm.concord.viewer.platform.encryption;

public class UnableToInitializeEncryptorException
  extends Exception
{
  private static final long serialVersionUID = 1682229061256597577L;
  
  public UnableToInitializeEncryptorException()
  {
    super("Unable to Initialize Encryptor.");
  }
  
  public UnableToInitializeEncryptorException(Throwable paramThrowable)
  {
    super("Unable to Initialize Encryptor.", paramThrowable);
  }
}