package com.ibm.concord.viewer.platform.encryption;

public class EncryptorConfigException
  extends EncryptionException
{
  private static final long serialVersionUID = 1L;
  
  public EncryptorConfigException(Throwable paramThrowable)
  {
    super("Encryption config error", paramThrowable);
  }
}