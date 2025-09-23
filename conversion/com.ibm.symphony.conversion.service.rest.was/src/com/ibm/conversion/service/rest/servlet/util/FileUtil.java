/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

public class FileUtil {
	
	/**
	 * 
	 * @param is
	 * @return
	 * @throws IOException
	 */
	public static File saveFile(InputStream is, File parent) throws IOException {
		OutputStream os = null;
		try{
			BufferedInputStream bis = new BufferedInputStream(is);
			File file = new File(parent, generateFileName());
			os = new FileOutputStream(file);
			byte[] b = new byte[4096];
			for (int n = 0; (n = bis.read(b)) != -1;) {
				os.write(b, 0, n);
			}
			os.flush();
			return file;
		}
		finally{
			if(os != null)
				os.close();
		}
	}
	
	/**
	 * 
	 * @param is
	 * @return
	 * @throws IOException
	 */
	public static InputStream saveFileAsStream(InputStream is, File parent) throws IOException {
		File file = saveFile(is, parent);
		return new FileInputStream(file);
	}
	
	/**
	 * 
	 * @param file
	 * @param os
	 * @throws IOException
	 */
	public static void writeFileToStream(File file, OutputStream os) throws IOException{
		writeToStream(new FileInputStream(file), os);
	}
	
	/**
	 * 
	 * @param is
	 * @param os
	 * @throws IOException
	 */
	public static void writeToStream(InputStream is, OutputStream os) throws IOException{
		BufferedInputStream bis = new BufferedInputStream(is);
		byte[] b = new byte[4096];
		for (int n = 0; (n = bis.read(b)) != -1;) {
			os.write(b, 0, n);
		}
		os.flush();
	}
	
	/**
	 * delete a file
	 * @param file
	 */
	public static void deleteFile(File file){
		try{
			if(file.exists()){
				file.delete();
			}
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	public static String generateFileName(){
		return "f_" + UUID.randomUUID();
	}
	
}
