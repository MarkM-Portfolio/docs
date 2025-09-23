package com.ibm.concord.viewer.platform.encryption;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import javax.crypto.SecretKey;

public class TestEncryptor {

	public static void encode(String infile, String destfile, Encryptor encryptor, SecretKey key)
			throws Exception {
		byte[] buffer = new byte[1024];
		FileInputStream fin = new FileInputStream(infile);
		InputStream in = encryptor.getInputStream(fin, key, Encryptor.EncryptionMode.ENCRYPTION);
		OutputStream out = new FileOutputStream(destfile);
		 
		int i;
		while ((i = in.read(buffer)) != -1) {
			out.write(buffer, 0, i);
		}
		out.close();
		in.close();
	}

	public static void decode(String infile, String destfile, Encryptor encryptor, SecretKey key)
			throws Exception {

		byte[] buffer = new byte[1024];
		FileInputStream fin = new FileInputStream(infile);
		InputStream in = encryptor.getInputStream(fin, key, Encryptor.EncryptionMode.DECRYPTION);
		OutputStream out = new FileOutputStream(destfile);
		int i;
		while ((i = in.read(buffer)) != -1) {
			out.write(buffer, 0, i);
		}
		out.close();
		in.close();
	}

	public static void main(String[] args) throws Exception {
		long start, end;
		
		start = System.currentTimeMillis();
		
		EncryptorConfig config = EncryptorConfig.getDefaultConfig();
		
		System.out.println("Sample master key = " + config.generateSampleMaterKey());
		
        byte[] masterKey = config.getMasterKey();
        if(masterKey == null || masterKey.length == 0)
            System.out.println("Error, Master key is empty!");
        
        Encryptor encryptor = EncryptorFactory.getEncryptor(config);
        
        SecretKey key = encryptor.generateKey(null);

        for (int loop = 0; loop < 2; loop++) {
        
        //String keyStr = encryptor.generateKey();
        //SecretKey key = encryptor.decryptKey(keyStr);
        
		// encrypt file
		encode("C:/Java7/src.zip", "C:/Java7/src.zip.enc", encryptor, key);

		// decrypt file
		decode("C:/Java7/src.zip.enc", "C:/Java7/src.zip.0", encryptor, key);
        }
		
		end = System.currentTimeMillis();
		
		System.out.println("Elipsed time " + ((end-start)/1000) + " seconds");
	}
	
    //public long getElapsedSeconds() {
    //    return this.getEclapsedMillis() / 1000;
    //}
}
