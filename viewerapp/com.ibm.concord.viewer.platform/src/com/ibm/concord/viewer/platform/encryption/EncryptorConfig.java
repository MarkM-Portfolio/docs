package com.ibm.concord.viewer.platform.encryption;

import java.io.IOException;
import java.io.InputStream;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.Provider;
import java.security.Security;
import java.util.Properties;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;

public class EncryptorConfig
{
  //private static Logger logger = Logger.getLogger(EncryptorConfig.class.getName());
  private static final String PROP_JCE_PROVIDER = "jce.provider";
  public static final String DEFAULT_JCE_PROVIDER = "IBMJCEFIPS";
  private static final String PROP_JCE_PROVIDER_CLASS = "jce.provider.class";
  public static final String DEFAULT_JCE_PROVIDER_CLASS = "com.ibm.crypto.fips.provider.IBMJCEFIPS";
  private static final String PROP_CIPHER_ALGO = "cipher.algorithm";
  public static final String DEFAULT_CIPHER_ALGORITHM = "AES/CBC/PKCS5Padding";
  private static final String PROP_KEY_SPEC_ALGO = "cipher.key_spec_algorithm";
  public static final String DEFAULT_KEY_SPEC_ALGORITHM = "AES";
  private static final String PROP_KEY_CIPHER_ALGO = "cipher.key_algorithm";
  public static final String DEFAULT_KEY_CIPHER_ALGORITHM = "AES/ECB/NoPadding";
  private static final String PROP_RNG_ALGO = "rng.algorithm";
  public static final String DEFAULT_RNG_ALGORITHM = "IBMSecureRandom";
  private static final String PROP_MASTER_KEY = "master_key";
  private static EncryptorConfig defaultConfig;
  protected final String jceProvider;
  protected final String jceProviderClass;
  protected final String cipherAlgorithm;
  protected final String cipherKeySpecAlgorithm;
  protected final String cipherKeyAlgorithm;
  protected final byte[] masterKey;
  protected final String rngAlgorithm;
  
  public static EncryptorConfig getDefaultConfig()
    throws EncryptorConfigException
  {
    if (null != defaultConfig) {
      return defaultConfig;
    }
    String config_file = "/com/ibm/concord/viewer/platform/encryption/config.properties";
    InputStream is = null;
    try
    {
   	  Properties prop = new Properties();
   	  is = EncryptorConfig.class.getResourceAsStream(config_file);
   	  prop.load(is);
   	  //prop.list(System.out);
   	  
      String provider = prop.getProperty(EncryptorConfig.PROP_JCE_PROVIDER, EncryptorConfig.DEFAULT_JCE_PROVIDER);
      String provider_clz = prop.getProperty(EncryptorConfig.PROP_JCE_PROVIDER_CLASS, EncryptorConfig.DEFAULT_JCE_PROVIDER_CLASS);
      String ciper_algorithm = prop.getProperty(EncryptorConfig.PROP_CIPHER_ALGO, EncryptorConfig.DEFAULT_CIPHER_ALGORITHM);
      String keyspec_algorithm = prop.getProperty(EncryptorConfig.PROP_KEY_SPEC_ALGO, EncryptorConfig.DEFAULT_KEY_SPEC_ALGORITHM);
      String key_algorithm = prop.getProperty(EncryptorConfig.PROP_KEY_CIPHER_ALGO, EncryptorConfig.DEFAULT_KEY_CIPHER_ALGORITHM);
      
      String masterkey = prop.getProperty(EncryptorConfig.PROP_MASTER_KEY);
      String rng_algorithm = prop.getProperty(EncryptorConfig.PROP_RNG_ALGO, EncryptorConfig.DEFAULT_RNG_ALGORITHM);
      defaultConfig = new EncryptorConfig(provider, provider_clz, ciper_algorithm, keyspec_algorithm, key_algorithm, masterkey, rng_algorithm);

      return defaultConfig;
    }
    catch (Exception ex)
    {
      throw new EncryptorConfigException(ex);
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
      }
    }
  }
  
  public EncryptorConfig(String provider, String providerclass, String ciper_algorithm, 
		  String keyspec_algorithm, String keyalgorithm, String masterkey, String rng_algorithm)
    throws DecoderException
  {
    this.jceProvider = provider;
    this.jceProviderClass = providerclass;
    this.cipherAlgorithm = ciper_algorithm;
    this.cipherKeySpecAlgorithm = keyspec_algorithm;
    this.cipherKeyAlgorithm = keyalgorithm;
    this.masterKey = Hex.decodeHex(masterkey.toCharArray());
    this.rngAlgorithm = rng_algorithm;
  }
  
  public String getJCEProvider()
  {
    return this.jceProvider;
  }
  
  public String getJCEProviderClass()
  {
    return this.jceProviderClass;
  }
  
  public String getCipherAlgorithm()
  {
    return this.cipherAlgorithm;
  }
  
  public String getKeySpecAlgorithm()
  {
    return this.cipherKeySpecAlgorithm;
  }
  
  public String getKeyCipherAlgorithm()
  {
    return this.cipherKeyAlgorithm;
  }
  
  public byte[] getMasterKey()
  {
    return this.masterKey;
  }
  
  public String getRNGAlgorithm()
  {
    return this.rngAlgorithm;
  }
  
  public String generateSampleMaterKey() {
	try {
		try {
		    String clzName = getJCEProviderClass();
			if (clzName != null && clzName.length()>0) {
				Class aClz = Class.forName(clzName);
				Security.addProvider((Provider)aClz.newInstance());
			}
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		} catch (InstantiationException e) {
			e.printStackTrace();
		}

		KeyGenerator keyGenerator = KeyGenerator.getInstance(getKeySpecAlgorithm(), getJCEProvider());
		SecretKey key = keyGenerator.generateKey();
		return new String(Hex.encodeHex(key.getEncoded()));
	} catch (NoSuchAlgorithmException e) {
	} catch (NoSuchProviderException e) {
		e.printStackTrace();
	}
	return "";
  }
}