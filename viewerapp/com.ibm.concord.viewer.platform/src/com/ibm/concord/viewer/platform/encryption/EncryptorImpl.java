package com.ibm.concord.viewer.platform.encryption;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.SequenceInputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.DESedeKeySpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Hex;

public class EncryptorImpl implements Encryptor
{
  private   static Logger log = Logger.getLogger(EncryptorImpl.class.getName());
  private   final SecureRandom secRandom;
  protected final KeyGenerator keyGenerator;
  protected final EncryptorConfig config;
  protected final SecretKeyFactory secretKeyFactory;
  
  private HashMap<String, SecretKey> keyMap;
  
  protected EncryptorImpl(EncryptorConfig config)
    throws NoSuchAlgorithmException, NoSuchProviderException
  {
    this.config = config;
    this.secRandom = SecureRandom.getInstance(config.getRNGAlgorithm(), config.getJCEProvider());
    this.keyGenerator = KeyGenerator.getInstance(config.getKeySpecAlgorithm(), config.getJCEProvider());
    this.secretKeyFactory = SecretKeyFactory.getInstance(config.getKeySpecAlgorithm(), config.getJCEProvider());
    
    this.keyMap = new HashMap<String, SecretKey>();
  }
  
  public SecretKey decryptKey(String encryptedKey) throws EncryptorException
  {
    if (encryptedKey == null) {
      throw new IllegalArgumentException("encryptedKey");
    }
    try
    {
      byte[] keyArr = Hex.decodeHex(encryptedKey.toCharArray());
      
      SecretKey masterkey = generateKeyFromMasterKey();
      Cipher cipher = Cipher.getInstance(config.getKeyCipherAlgorithm(), config.getJCEProvider());
      cipher.init(Cipher.DECRYPT_MODE, masterkey);
      byte[] deKey = cipher.doFinal(keyArr);
      
      return decodeKey(deKey);
    }
    catch (Exception e)
    {
      throw new EncryptorException(e);
    }
  }
  
  /*
   * Encrypt the key with mater key
   */
  public String encryptKey(SecretKey key) throws EncryptorException
  {
    if (key == null) {
      throw new IllegalArgumentException("key");
    }
    try
    {
      SecretKey masterKey = generateKeyFromMasterKey();
      
      Cipher cipher = Cipher.getInstance(config.getKeyCipherAlgorithm(), config.getJCEProvider());
      cipher.init(Cipher.ENCRYPT_MODE, masterKey);
      byte[] b = cipher.doFinal(key.getEncoded());
      
      return new String(Hex.encodeHex(b));
    }
    catch (Exception e)
    {
      throw new EncryptorException(e);
    }
  }
  
  public String generateKey() throws EncryptorException
  {
    SecretKey key = keyGenerator.generateKey();
    return encryptKey(key);
  }
  
  public SecretKey generateKey(String s) throws EncryptorException
  {
	  int reqKeyLen = config.getMasterKey().length;
	  if (s == null || s.length() == 0)
		  s = "defaultOrgnization";
	  
	  SecretKey key = keyMap.get(s);  
	  if (key != null)
		  return key;
	  byte[] b = new byte[reqKeyLen];
	  byte[] src_b = s.getBytes(); 
	  System.arraycopy(src_b, 0, b, 0, src_b.length>reqKeyLen?reqKeyLen:src_b.length);
	  try {
		SecretKey k = decodeKey(b);
		String encryptkey = encryptKey(k);
		b = encryptkey.getBytes();
		key = decodeKey(b, 0, reqKeyLen);
		keyMap.put(s, key);
		return key;
		} catch (InvalidKeyException e) {
			//
		} catch (InvalidKeySpecException e) {
			//
		}
	  return null;
  }
  
  public InputStream getInputStream(InputStream in, SecretKey key, Encryptor.EncryptionMode mode)
    throws EncryptorException
  {
    if (log.isLoggable(Level.FINER)) {
      log.entering(EncryptorImpl.class.getName(), "encryptStream(InputStream in, SecretKey key, Encryptor.CipherMode mode)",
    		  new Object[] { in, key, mode });
    }
    if ((null == in) || (null == key) || (null == mode)) {
      throw new IllegalArgumentException("in or key or mode");
    }
    try
    {
      if (Encryptor.EncryptionMode.NONE == mode)
        return in;
      
      CipherInputStream ciperis;
      
      // encrypt
      if (Encryptor.EncryptionMode.ENCRYPTION == mode)
      {
    	IvParameterSpec spec = generateIvParameterSpec();
    	Cipher ciper1 = Cipher.getInstance(config.getCipherAlgorithm(), config.getJCEProvider());
    	ciper1.init(Cipher.ENCRYPT_MODE, key, spec);
        ciperis = new CipherInputStream(in, ciper1);
        return new SequenceInputStream(new ByteArrayInputStream(spec.getIV()), ciperis);
      }
      
      // decrypt
      byte[] b = new byte[16];
      in.read(b);
      Cipher ciper2 = Cipher.getInstance(config.getCipherAlgorithm(), config.getJCEProvider());
      ciper2.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(b));
      ciperis = new CipherInputStream(in, ciper2);
      return ciperis;
    }
    catch (Exception e)
    {
      throw new EncryptorException(e);
    }
    finally
    {
      if (log.isLoggable(Level.FINER)) {
        log.exiting(EncryptorImpl.class.getName(), "encryptStream(InputStream in, SecretKey key, Encryptor.CipherMode mode)");
      }
    }
  }
  
  private SecretKey generateKeyFromMasterKey() throws InvalidKeySpecException, InvalidKeyException
  {
    byte[] b = config.getMasterKey();
    return decodeKey(b);
  }
  
  protected SecretKey decodeKey(byte[] ar) throws InvalidKeySpecException, InvalidKeyException
  {
	  return decodeKey(ar, 0, ar.length);
  }
  
  protected SecretKey decodeKey(byte[] ar, int off, int len) throws InvalidKeySpecException, InvalidKeyException
  {
    KeySpec keySpec = null;
    String keySpecAlg = config.getKeySpecAlgorithm(); 
    if ("DESede".equals(keySpecAlg))
    	keySpec = new DESedeKeySpec(ar, off);
    else if ("DES".equals(keySpecAlg))
    	keySpec = new DESKeySpec(ar, off);
//    else if (keySpecAlg.equals("Seal")) // for seal, need to return SecretKeySpec object directly
//    	return new SecretKeySpec(ar, config.getKeySpecAlgorithm());
    else
    	keySpec = new SecretKeySpec(ar, off, len, config.getKeySpecAlgorithm());

    return secretKeyFactory.generateSecret(keySpec);
  }
  
  // convert SecretKey to string 
  public String getKeyStr(SecretKey skey) {
    byte[] key_bytes = skey.getEncoded();
    return new String(Hex.encodeHex(key_bytes));
  }
  
  // convert key string to SecretKey
  public SecretKey getSecretKey(String keyStr) throws EncryptorException {
    SecretKey skey = null;
    if (keyStr == null || keyStr.length() == 0)
      return skey;
    try {
      byte[] key_bytes = Hex.decodeHex(keyStr.toCharArray());
      skey = this.decodeKey(key_bytes); 
    }
    catch (Exception e)
    {
      throw new EncryptorException(e);
    }
    
    return skey;
  }
  
  protected IvParameterSpec generateIvParameterSpec()
  {
    byte[] b = new byte[16];
    secRandom.nextBytes(b);
    
    return new IvParameterSpec(b);
  }
}