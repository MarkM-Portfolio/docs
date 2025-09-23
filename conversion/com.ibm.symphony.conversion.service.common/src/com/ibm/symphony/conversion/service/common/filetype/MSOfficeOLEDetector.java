/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.filetype;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.common.util.FileUtil;

public class MSOfficeOLEDetector implements IMimeTypeDetector
{
  private static Logger log = Logger.getLogger(MSOfficeOLEDetector.class.getName());

  // MS OFFICE file header must be (DO CF 11 E0 A1 B1 1A E1)
  private static final byte[] MS_OFFICE_OLE_FILE_HEADER = { -48, -49, 17, -32, -95, -79, 26, -31 };

  private static final int MS_OFFICE_FILE_HEADER_LENGTH = MS_OFFICE_OLE_FILE_HEADER.length;

  private static final int SECTOR_ID_LENGTH = 4;

  private static final int LE_OR_BIG_ENDIAN_OFFSET = 28;

  private static final int LE_OR_BIG_ENDIAN_LENGTH = 2;

  private static final int SEC_SIZE_OFFSET = 30;

  private static final int SEC_SIZE_LENGTH = 2;

  private static final int NUM_OF_SEC_USED_BY_SAT_OFFSET = 44;

  private static final int NUM_OF_SEC_LENGTH = 4;

  private static final int FIRST_SEC_ID_OF_DIR_OFFSET = 48;

  private static final int FIRST_SEC_ID_USED_BY_MSAT_OFFSET = 68;

  private static final int NUM_OF_SEC_USED_BY_MSAT_OFFSET = 72;

  private static final int FIRST_SEC_ID_USED_BY_SAT_OFFSET = 76;

  private static final int MAX_NUM_OF_SEC_USED_BY_SAT_IN_OLE_HEADER = 109;

  private static final int ENTRY_LENGTH = 128;

  private static final int OLE_HEADER_LENGTH = 512;

  private static final int END_OF_CHAIN_SEC_ID = -2;

  private RandomAccessFile raf;

  private int secSize;

  private boolean isLE;

  private int firstSecIDOfDir;

  private int[] iMSATSec;

  private int maxSecIDNum;

  private List<Integer> secIDChainOfDir;

  private List<String> oleMainStreamName;

  public MSOfficeOLEDetector()
  {
    super();
    secSize = -1;
    isLE = true;
    firstSecIDOfDir = -1;
    iMSATSec = null;
    maxSecIDNum = -1;
    secIDChainOfDir = null;
  }

  private void init()
  {
    isLE = isLE(raf);
    secSize = getSectorSize();
    firstSecIDOfDir = getValue(FIRST_SEC_ID_OF_DIR_OFFSET, SECTOR_ID_LENGTH);
    oleMainStreamName = getOleMainStreamName();
  }

  public boolean isCorrectMimeType(File sourceFile, String source_MIMETYPE, Map<String, String> options)
  {
    return isMSOfficeOLEMime(sourceFile, source_MIMETYPE);
  }

  private boolean isMSOfficeOLEMime(File sourceFile, String source_MIMETYPE)
  {
    try
    {
      this.raf = new RandomAccessFile(sourceFile, "r");
      if (!isMSOfficeFile(raf))
      {
        log.finer("The source file is not office file.");
        return false;
      }

      init();
      int directoryOffset = getREOffset();
      if (directoryOffset == -1)
        return false;

      if (secSize < 0 || secSize > 102400)
        return false;

      if (source_MIMETYPE.equals(MimeTypeConstants.DOC_MIMETYPE))
        return isMSWord();
      else if (source_MIMETYPE.equals(MimeTypeConstants.XLS_MIMETYPE))
        return isMSExcel();
      else if (source_MIMETYPE.equals(MimeTypeConstants.PPT_MIMETYPE))
        return isMSPresentation();
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read raf .", e);
    }
    finally
    {
      try
      {
        if (this.raf != null)
        {
          this.raf.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINEST, "Failed to close file.", e);
      }
    }
    return false;
  }

  public boolean isMSOfficeEncrypt(File sourceFile)
  {
    try
    {
      this.raf = new RandomAccessFile(sourceFile, "r");
      if (!isMSOfficeFile(raf))
      {
        log.finer("The source file is not office file.");
        return false;
      }

      init();
      int directoryOffset = getREOffset();
      if (directoryOffset == -1)
        return false;

      if (secSize < 0 || secSize > 102400)
        return false;

      return isOLEFile("EncryptedPackage");
     }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read raf .", e);
    }
    finally
    {
      try
      {
        if (this.raf != null)
        {
          this.raf.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINEST, "Failed to close file.", e);
      }
    }
    return false;
  }

  private boolean isMSOfficeFile(RandomAccessFile raf)
  {
    try
    {
      raf.seek(0);
      byte[] buf = new byte[MS_OFFICE_FILE_HEADER_LENGTH];
      int iRead = raf.read(buf);
      if (iRead > 0)
        return FileUtil.isMatched(buf, MS_OFFICE_OLE_FILE_HEADER);
    }
    catch (IOException e)
    {
      log.log(Level.FINER, "Failed to read raf to buf.", e);
    }
    return false;
  }

  private boolean isMSExcel()
  {
    if (isOLEFile("Workbook"))
      return true;
    else
      return isOLEFile("Book");// MS EXCEL 5.0
  }

  private boolean isMSPresentation()
  {
    return isOLEFile("PowerPoint Document");
  }

  private boolean isMSWord()
  {
    return isOLEFile("WordDocument");
  }

  private boolean isOLEFile(String OLEMimeInfo)
  {
    int OLEMimeInfoLength = OLEMimeInfo.length() * 2;

    return isInFirstSec(OLEMimeInfo, OLEMimeInfoLength);
  }

  private boolean isInFirstSec(String OLEMimeInfo, int OLEMimeInfoLength)
  {
    int offset = OLE_HEADER_LENGTH + secSize * firstSecIDOfDir;
    int entryOffset = -1;
    for (int entryIndex = 0; entryIndex < secSize / ENTRY_LENGTH; entryIndex++)
    {
      entryOffset = offset + ENTRY_LENGTH * entryIndex;
      byte[] buf = new byte[OLEMimeInfoLength];
      String magic = getMagic(entryOffset, buf);
      magic = (magic == null) ? null : magic.trim();
      if (magic != null)
      {
        if (magic.equals(OLEMimeInfo))
          return true;
        else if (oleMainStreamName.contains(magic))
          return false;
      }
    }
    return isInSecChain(OLEMimeInfo, OLEMimeInfoLength);
  }

  private boolean isInSecChain(String OLEMimeInfo, int OLEMimeInfoLength)
  {

    iMSATSec = getMSATSec();

    maxSecIDNum = getMAXSecIDNum();
    if (maxSecIDNum == -1)
      return false;

    secIDChainOfDir = getSecIDChainOfDir();

    if (secIDChainOfDir == null)
      return false;

    int offset = -1;
    int entryOffset = -1;

    for (Integer secID : secIDChainOfDir)
    {
      if (secID == END_OF_CHAIN_SEC_ID)
      {
        return false;
      }
      offset = OLE_HEADER_LENGTH + secSize * secID;
      for (int entryIndex = 0; entryIndex < secSize / ENTRY_LENGTH; entryIndex++)
      {
        entryOffset = offset + ENTRY_LENGTH * entryIndex;
        byte[] buf = new byte[OLEMimeInfoLength];
        String magic = getMagic(entryOffset, buf);
        magic = (magic == null) ? null : magic.trim();
        if (magic != null)
        {
          if (magic.equals(OLEMimeInfo))
            return true;
          else if (oleMainStreamName.contains(magic))
            return false;
        }
      }
    }
    return false;
  }

  private int getMAXSecIDNum()
  {
    int maxSecIDNum = secSize / SECTOR_ID_LENGTH;
    if (maxSecIDNum <= 0)
      return -1;
    else
      return maxSecIDNum;
  }

  private int getREOffset()
  {
    return OLE_HEADER_LENGTH + secSize * firstSecIDOfDir;
  }

  // read offset 28,length 2,FE FF = Little-Endian,FF FE = Big-Endian
  // mostly is Little-Endian
  private boolean isLE(RandomAccessFile raf)
  {
    boolean isLE = true;
    try
    {
      raf.seek(LE_OR_BIG_ENDIAN_OFFSET);
      byte[] buf = new byte[LE_OR_BIG_ENDIAN_LENGTH];
      raf.read(buf);
      if (buf[0] == -2 && buf[1] == -1)
        isLE = true;
      else if (buf[0] == -1 && buf[2] == -2)
        isLE = false;
    }
    catch (IOException e)
    {
      log.log(Level.FINER, "Failed to read raf to buf .", e);
    }
    return isLE;
  }

  // read offset 30,length 2,sec size,mostly is 09 00,means 512bytes a sector
  private int getSectorSize()
  {
    int secSize = -1;
    byte[] buf = readBytes(SEC_SIZE_OFFSET, SEC_SIZE_LENGTH);

    if (buf != null)
      secSize = (int) Math.pow(2, bytesToInt(buf));

    return secSize;
  }

  // return the sectors used by the MSAT
  private int[] getMSATSec()
  {
    int[] iMSATSector = null;
    // if there is no extended sector used by MSAT,there is only sector 0
    // the first 109 SecID is stored in the header ,
    // read number of sectors used by MSAT,offset 72,length 4
    int extendedMSATSecNum = getValue(NUM_OF_SEC_USED_BY_MSAT_OFFSET, NUM_OF_SEC_LENGTH);
    if (extendedMSATSecNum <= 0 || extendedMSATSecNum > 102400)
    {
      // here null,means the MSAT only used the header,starts from 76
      return null;
    }
    iMSATSector = new int[extendedMSATSecNum];
    // read offset 68,length 4,first sector ID of the sector of the MSAT
    int firstExtendedSecID = getValue(FIRST_SEC_ID_USED_BY_MSAT_OFFSET, SECTOR_ID_LENGTH);
    if (firstExtendedSecID == END_OF_CHAIN_SEC_ID)
      return null;
    int secID = firstExtendedSecID;
    for (int i = 0; i < iMSATSector.length; i++)
    {
      iMSATSector[i] = secID;
      if (secID < 0)
        break;
      secID = getNextMSATSecID(secID);
    }
    return iMSATSector;
  }

  private int getValue(int offset, int length)
  {
    byte[] buf = readBytes(offset, length);
    return bytesToInt(buf);
  }

  // get the next sector ID which used by MSAT
  private int getNextMSATSecID(int secID)
  {
    int nextSecID = -1;
    int offset = OLE_HEADER_LENGTH + (secSize * secID) + secSize - SECTOR_ID_LENGTH;
    if (offset >= 0)
    {
      byte[] buf = readBytes(offset, SECTOR_ID_LENGTH);
      nextSecID = bytesToInt(buf);
    }
    return nextSecID;
  }

  private byte[] readBytes(int offset, int length)
  {
    byte[] buf = new byte[length];
    try
    {
      raf.seek(offset);
      raf.read(buf);
    }
    catch (IOException e)
    {
      log.log(Level.FINER, "Failed to read bytes .", e);
      return null;
    }

    return buf;
  }

  private int bytesToInt(byte[] buf)
  {
    if (buf == null)
      return END_OF_CHAIN_SEC_ID;

    int value = 0;
    // 00 10 00 00 little-Endian <=> (00001000)H
    // 00 10 00 00 big-Endian <=> (00100000)H
    if (!isLE)
    {
      for (int i = 0; i < buf.length; i++)
      {
        value = (value << 8) | (buf[i] & 0xFF);
      }
    }
    else
    {
      for (int i = buf.length - 1; i >= 0; i--)
      {
        value = (value << 8) | (buf[i] & 0xFF);
      }
    }
    return value;
  }

  private List<Integer> getSecIDChainOfDir()
  {
    List<Integer> secIDChain = new ArrayList<Integer>();

    // get number of sectors used by SAT
    int iSATSecNum = getValue(NUM_OF_SEC_USED_BY_SAT_OFFSET, NUM_OF_SEC_LENGTH);
    if (iSATSecNum < 0)
      return null;

    // first sec id of dir sec id chain in sector used by SAT's index
    int iSATSECIndex = firstSecIDOfDir / maxSecIDNum;
    int iSATIndex = firstSecIDOfDir % maxSecIDNum;

    int secIDInChain = 0;
    int secIDNumber = 0;

    // index in a sector which stored sector id to store streams
    // index in a sector used by SAT to store sector ids
    while (iSATSECIndex < iSATSecNum && iSATIndex < maxSecIDNum && secIDNumber < maxSecIDNum)
    {
      int secIDInSATSEC = getSecIDInSATSec(iSATSECIndex);
      if (secIDInSATSEC < 0)
        return null;
      int secIDInSATSECOffset = OLE_HEADER_LENGTH + secSize * secIDInSATSEC;
      int secIDInSATOffset = secIDInSATSECOffset + SECTOR_ID_LENGTH * iSATIndex;
      byte[] buf = readBytes(secIDInSATOffset, SECTOR_ID_LENGTH);
      secIDInChain = bytesToInt(buf);

      if (secIDInChain < 0 || secIDChain.contains(secIDInChain))
        secIDInChain = END_OF_CHAIN_SEC_ID;

      while (secIDInChain != END_OF_CHAIN_SEC_ID && iSATIndex < maxSecIDNum && secIDNumber < maxSecIDNum)
      {
        secIDChain.add(secIDInChain);
        secIDNumber++;

        int iSATSECIndexTemp = secIDInChain / maxSecIDNum;
        int iSATIndexTemp = secIDInChain % maxSecIDNum;
        if (iSATSECIndexTemp == iSATSECIndex)
        {
          iSATIndex = iSATIndexTemp;
          secIDInSATOffset = secIDInSATSECOffset + SECTOR_ID_LENGTH * iSATIndex;
          buf = readBytes(secIDInSATOffset, SECTOR_ID_LENGTH);
          secIDInChain = bytesToInt(buf);
          if (secIDInChain < 0 || secIDChain.contains(secIDInChain))
            secIDInChain = END_OF_CHAIN_SEC_ID;
        }
        else
        {
          iSATSECIndex = iSATSECIndexTemp;
          iSATIndex = iSATIndexTemp;
          break;
        }
      }

      if (secIDInChain == END_OF_CHAIN_SEC_ID)
      {
        secIDChain.add(secIDInChain);
        break;
      }
    }
    return secIDChain;
  }

  private int getSecIDInSATSec(int iSATSECIndex)
  {
    int secIDInSATSEC = -1;
    int secIDInSATSECOffset = -1;
    if (iSATSECIndex < MAX_NUM_OF_SEC_USED_BY_SAT_IN_OLE_HEADER)
      secIDInSATSECOffset = FIRST_SEC_ID_USED_BY_SAT_OFFSET + SECTOR_ID_LENGTH * iSATSECIndex;
    else
    {
      if (iMSATSec == null)
        return -1;
      int iMSATSECIndex = (iSATSECIndex - MAX_NUM_OF_SEC_USED_BY_SAT_IN_OLE_HEADER) / (maxSecIDNum - 1);
      iSATSECIndex = (iSATSECIndex - MAX_NUM_OF_SEC_USED_BY_SAT_IN_OLE_HEADER) % (maxSecIDNum - 1);
      if (iMSATSECIndex > iMSATSec.length - 1)
      {
        return -1;
      }
      int secIDInMSATSEC = iMSATSec[iMSATSECIndex];
      if (secIDInMSATSEC < 0)
        return -1;
      int secIDInMSATOffset = OLE_HEADER_LENGTH + secSize * secIDInMSATSEC;
      secIDInSATSECOffset = secIDInMSATOffset + SECTOR_ID_LENGTH * iSATSECIndex;
    }
    if (secIDInSATSECOffset < 0)
      return -1;
    byte[] buf = readBytes(secIDInSATSECOffset, SECTOR_ID_LENGTH);
    secIDInSATSEC = bytesToInt(buf);
    return secIDInSATSEC;
  }

  private String getMagic(int offset, byte[] buf)
  {
    byte[] bf = new byte[buf.length / 2];
    try
    {
      if (offset < 0)
        return null;
      raf.seek(offset);
      raf.read(buf);
      for (int i = 0; i < buf.length; i += 2)
      {
        bf[i / 2] = buf[i];
      }
    }
    catch (IOException e)
    {
      log.log(Level.FINER, "Failed to read magic .", e);
      return null;
    }

    return new String(bf);
  }

  private List<String> getOleMainStreamName()
  {
    List<String> oleMainStream = new ArrayList<String>();
    oleMainStream.add("PowerPoint Document");
    oleMainStream.add("WordDocument");
    oleMainStream.add("Workbook");
    oleMainStream.add("Book");
    return oleMainStream;
  }

  public void updateTemplateMimeType(File sourceFile, String source_MIMETYPE, File targetFolder, Map obj)
  {
    try
    {
      String fileName = sourceFile.getName();
      String newFileName = (fileName.indexOf(".") > 0) ? fileName.substring(0, fileName.indexOf(".")) : fileName;
      newFileName += getExtension(source_MIMETYPE);
      if (!targetFolder.exists())
        targetFolder.mkdirs();

      FileUtil.copyFileToDir(sourceFile, targetFolder, newFileName);

      obj.put("filePath", targetFolder + File.separator + newFileName);
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, "Failed to update Template MimeType.", e);
    }
  }

  private String getExtension(String source_MIMETYPE)
  {
    String ext = ".doc";
    if (source_MIMETYPE.equals(MimeTypeConstants.PPT_MIMETYPE))
      ext = ".ppt";
    else if (source_MIMETYPE.equals(MimeTypeConstants.XLS_MIMETYPE))
      ext = ".xls";

    return ext;
  }
}
