package com.ibm.concord.viewer.platform.encryption;

public class EncryptorException
  extends EncryptionException
{
  private static final long serialVersionUID = 1L;
  
  public EncryptorException(Throwable paramThrowable)
  {
    super("Encryptor Error.", paramThrowable);
  }
}