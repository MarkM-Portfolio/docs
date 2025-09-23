/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.WritableRaster;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Properties;
import java.util.StringTokenizer;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import com.ibm.docs.common.util.WASConfigHelper;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.outsideinsdk.ExportProperties;

public class Util {
	private static final Logger log = Logger.getLogger(Util.class.getName());

	/**
	 * Support both scale and crop
	 */
	public static final Object DOWNSIZE_GRAPHICS2D = 0;

	/**
	 * Only support scale, no cropping support
	 */
	public static final Object DOWNSIZE_SCALE_INSTANCE = 1;

	private static boolean parseConfig(Properties pros, InputStream in) throws FileNotFoundException, IOException {

		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new InputStreamReader(in));
			String line;
			while ((line = reader.readLine()) != null) {
				processLine(pros, line);
			}
			return true;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (reader != null) {
					reader.close();
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return false;
	}

	private static void processLine(Properties pros, String l) {
		int indPound = l.indexOf('#');
		String line = (indPound == -1) ? l.trim() : l.substring(0, indPound).trim();
		if (line.length() != 0) {
			StringTokenizer stl = new StringTokenizer(line);
			String key = stl.nextToken();
			String value = stl.nextToken();
			while (stl.hasMoreTokens()) {
				value += " " + stl.nextToken();
			}
			pros.setProperty(key, value);
		}
	}

	public static boolean isWindows() {
		String os = System.getProperty("os.name").toLowerCase();
		return (os.indexOf("win") >= 0);
	}

	public static String getJavaFontsPath() {

		String wasRoot = WASConfigHelper.getWasInstallRoot();
		if (wasRoot != null) {
			return new StringBuffer(wasRoot).append(File.separator).append("java").append(File.separator).append("jre")
					.append(File.separator).append("lib").append(File.separator).append("fonts").toString();
		} else {
			log.severe("Get was.install.root error.");
			return null;
		}
	}

	public static Properties getConfig(Properties config, InputStream in) {

		if (in != null) {
			try {
				parseConfig(config, in);
			} catch (Exception e) {
				e.printStackTrace();
				log.severe("Read stellent configuration file error");
				return null;
			}
		}
		return config;
	}

	/**
	 * Use Graphic2D to do scaling
	 * 
	 * @param srcFilePath
	 * @param targetFilePath
	 * @param formatName
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 * @throws IOException
	 * @throws DownsizeException
	 * @throws InterruptedException
	 */
	public static void downSize(String srcFilePath, String targetFilePath, String formatName, int x, int y, int width,
			int height, Object downsizeValue) throws IOException, DownsizeException, InterruptedException {

		log.entering(Util.class.getName(), "downSize", new Object[] { srcFilePath, targetFilePath, downsizeValue });

		if (formatName != null) {
			targetFilePath = targetFilePath.substring(0, targetFilePath.lastIndexOf(".") + 1) + formatName;
		} else {
			formatName = targetFilePath.substring(targetFilePath.lastIndexOf(".") + 1).toLowerCase();
			formatName = formatName.equals("jpg") ? "jpeg" : formatName;
		}

		if (downsizeValue != DOWNSIZE_GRAPHICS2D && downsizeValue != DOWNSIZE_SCALE_INSTANCE) {
			throw new DownsizeException(downsizeValue + " is an illegal downsize value.");
		}

		File targetFile = new File(targetFilePath);

		BufferedImage srcBufImage = ImageIO.read(new File(srcFilePath));
		if (height < 0) {
			height = (int) (srcBufImage.getHeight() * ((double) width / srcBufImage.getWidth()));
		}

		BufferedImage bufTarget = null;
		if (downsizeValue == DOWNSIZE_GRAPHICS2D) {
			int type = srcBufImage.getType();
			if (type == BufferedImage.TYPE_CUSTOM) {
				ColorModel cm = srcBufImage.getColorModel();
				WritableRaster raster = cm.createCompatibleWritableRaster(width, height);
				boolean alphaPremultiplied = cm.isAlphaPremultiplied();
				bufTarget = new BufferedImage(cm, raster, alphaPremultiplied, null);
			} else {
				bufTarget = new BufferedImage(width, height, type);
			}

			BufferedImage target = (x >= 0 && y >= 0) ? srcBufImage.getSubimage(x, y, width, height) : srcBufImage;

			Graphics2D g = bufTarget.createGraphics();
			g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
			g.drawImage(target, 0, 0, width, height, null);
			g.dispose();

		} else {
			Image thumbnail = srcBufImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);
			/* BufferedImage */bufTarget = new BufferedImage(thumbnail.getWidth(null), thumbnail.getHeight(null),
					BufferedImage.TYPE_INT_RGB);
			bufTarget.getGraphics().drawImage(thumbnail, 0, 0, null);
		}
		ImageIO.write(bufTarget, formatName, targetFile);

		log.exiting(Util.class.getName(), "downSize");
	}

	public static boolean isSpreadSheetFile(String mime) {
		if (mime != null && (mime.equals(Constants.ODS) || mime.equals(Constants.XLS) || mime.equals(Constants.XLSX)
				|| mime.equals(Constants.XLTX) || mime.equals(Constants.XLT) || mime.equals(Constants.OTS)
				|| mime.equalsIgnoreCase(Constants.XLSM_2010) || mime.equals(Constants.XLSM)))
			return true;
		return false;
	}
}
