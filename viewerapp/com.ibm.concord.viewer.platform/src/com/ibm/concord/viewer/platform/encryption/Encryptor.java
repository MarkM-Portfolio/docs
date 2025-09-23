package com.ibm.concord.viewer.platform.encryption;

import java.io.InputStream;
import java.io.OutputStream;
import javax.crypto.SecretKey;

public abstract interface Encryptor
{
  public abstract SecretKey decryptKey(String key) throws EncryptorException;
  
  public abstract String encryptKey(SecretKey keySpec) throws EncryptorException;
  
  public abstract String generateKey() throws EncryptorException;
  
  public abstract SecretKey generateKey(String modifier) throws EncryptorException;
  
  public String getKeyStr(SecretKey skey);
  
  public SecretKey getSecretKey(String keyStr) throws EncryptorException;
  
  public abstract InputStream getInputStream(InputStream in, SecretKey keySpec, EncryptionMode mode)
    throws EncryptorException;

  public static enum EncryptionMode
  {
    NONE,  ENCRYPTION,  DECRYPTION;
    
    private EncryptionMode() {}
  }
}