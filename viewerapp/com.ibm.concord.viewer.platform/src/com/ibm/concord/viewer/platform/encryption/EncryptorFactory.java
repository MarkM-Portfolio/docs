package com.ibm.concord.viewer.platform.encryption;

import java.security.Provider;
import java.security.Security;

public class EncryptorFactory
{
  //private static Logger log = Logger.getLogger(EncryptorFactory.class.getName());
  private static Encryptor encryptor = null;
  
  private static byte[] alock = new byte[0];
  
  public static Encryptor getEncryptor()
		  throws UnableToInitializeEncryptorException, EncryptorConfigException
  {
	  return EncryptorFactory.getEncryptor(EncryptorConfig.getDefaultConfig());
  }
  
  public static Encryptor getEncryptor(EncryptorConfig config)
    throws UnableToInitializeEncryptorException
  {
	if (encryptor != null)
		return encryptor;

	synchronized(EncryptorFactory.alock) {
	    if (encryptor != null) // need check again
	        return encryptor;

    	try {
          String clzName = config.getJCEProviderClass();
    	  if (clzName != null && clzName.length()>0) {
    	      Class aClz = Class.forName(clzName);
    	      Security.addProvider((Provider)aClz.newInstance());
          }
    	  encryptor = new EncryptorImpl(config);
    
    	  return encryptor;
        }
        catch (Exception ex)
        {
          throw new UnableToInitializeEncryptorException(ex);
        }
	}
  }
}