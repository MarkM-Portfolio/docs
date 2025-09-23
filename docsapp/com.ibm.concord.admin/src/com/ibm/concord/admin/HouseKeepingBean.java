/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.admin;

import java.io.File;
import java.io.FileFilter;
import java.rmi.RemoteException;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.EJBException;
import javax.ejb.SessionBean;
import javax.ejb.SessionContext;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.websphere.scheduler.TaskStatus;

public class HouseKeepingBean implements SessionBean
{
  private static final Logger LOG = Logger.getLogger(HouseKeepingBean.class.getName());

  private static final long serialVersionUID = 174434127158909191L;

  public void process(TaskStatus taskStatus) throws RemoteException
  {
    String taskId = taskStatus == null ? "Unknown" : taskStatus.getTaskId();

    if (Platform.getConcordConfig().isCloud())
    {
      LOG.log(Level.INFO, "Traditional House Keeping (ID:{0}) is not supported any more on SmartCloud environments.", taskId);
      return;
    }
    
    LOG.log(Level.INFO, "House Keeping (ID:{0}) Started.", taskId);
    
    DraftComponent draftComp = (DraftComponent) Platform.getComponent(DraftComponent.COMPONENT_ID);
    File draftHome = new File(draftComp.getDraftHome());

    File jobHome = new File(Job.JOB_HOME);

    long preCleanedDraft = ConditionalCleaner.getcleanedDraft();
    long preCleanedCache = ConditionalCleaner.getcleanedCache();

    long startTime = System.currentTimeMillis();
    /**
     * Disabling the housekeeping headless draft handling for w3. And find the other solution for it.
     */
    /*
     * try { processHeadlessDraft(time, timeout); } catch (Exception e) { LOG.log(Level.WARNING, "Clean Headless Draft Failed.", e); }
     */
    LOG.log(Level.INFO, "Skip processHeadlessDraft in HouseKeeping");
    // time = System.currentTimeMillis();
    // long startTime = time;
    try
    {
      processUploadConvert();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Clean Upload Conversion Result Failed.", e);
    }
    try
    {
      processCache();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Clean Useless Cache Failed.", e);
    }

    LOG.log(Level.INFO, "House Keeping (ID:{0}) cleaned {1} draft(s).",
        new Object[] { taskId, Math.abs(ConditionalCleaner.getcleanedDraft() - preCleanedDraft) });
    LOG.log(Level.INFO, "House Keeping (ID:{0}) remains space {1} bytes(s) for draft. {2}",
        new Object[] { taskId, draftHome.getUsableSpace(), draftHome.getPath() });

    // time = System.currentTimeMillis();

    long endTime = System.currentTimeMillis();

    LOG.log(Level.INFO, "House Keeping (ID:{0}) cleaned {1} cache(s).",
        new Object[] { taskId, Math.abs(ConditionalCleaner.getcleanedCache() - preCleanedCache) });
    LOG.log(Level.INFO, "House Keeping (ID:{0}) remains space {1} bytes(s) for cache. {2}", new Object[] { taskId,
        jobHome.getUsableSpace(), jobHome.getPath() });

    LOG.log(Level.INFO, "House Keeping (ID:{0}) Done. It takes about {1} ms", new Object[] { taskId, (endTime - startTime) });
  }

  private void processUploadConvert()
  {
    ConditionalCleaner cleaner = new ConditionalCleaner(CleanerType.uploadType);

    DraftComponent draftComp = (DraftComponent) Platform.getComponent(DraftComponent.COMPONENT_ID);
    File draftHome = new File(draftComp.getDraftHome());
    File[] orgHome = draftHome.listFiles(new OrganizationHomeFilter());
    long random = System.currentTimeMillis() / 2;

    for (int round = 0; round < 2; round++)
    {
      boolean bFinished = true;
      for (int i = 0; orgHome != null && i < orgHome.length; i++)
      {
        // Verify whether over time...
        if (cleaner.isTimeout())
        {
          LOG.log(Level.INFO,
              "Too many drafts to be processed in a single house keeping phase, the remaings will be continued in next round house keeping.");
          bFinished = false;
          break;
        }

        // Verify the traverse order...
        int index = i;
        if (random == 1)
        {
          index = orgHome.length - i - 1;
        }

        File orgCacheHome = orgHome[index];
        String orgCacheHomeName = orgCacheHome.getName();
        String repoType = RepositoryServiceUtil.getRepoTypeFromId(orgCacheHomeName);
        if (RepositoryConstants.REPO_TYPE_EXTERNAL_REST.equals(repoType))
        {
          File[] cacheOrgHomeArray = orgCacheHome.listFiles();
          for (File cacheOrgHomeFile : cacheOrgHomeArray)
          {
            if (!cacheOrgHomeFile.isDirectory())
            {
              continue;
            }
            File[] orgDraftCacheHomeArray = cacheOrgHomeFile.listFiles();
            for (File orgDraftCacheHome : orgDraftCacheHomeArray)
            {
              if (!orgDraftCacheHome.isDirectory())
              {
                continue;
              }
              String cacheOrgHomeName = cacheOrgHomeFile.getName();
              /**
               * for third party repo , the draft path is : DATA_SHARE/draft/repo_id/org_id/drafr/
               * 
               * cacheOrgHomeName is org_id , orgCacheHomeName is repo_id ;
               * 
               */
              generateCacheList(orgDraftCacheHome, cacheOrgHomeName, orgCacheHomeName, cleaner);
            }
          }
        }
        else
        {
          File orgDraftHome = new File(orgCacheHome, "draft");
          /**
           * the draft path is : DATA_SHARE/draft/org_id/drafr/
           * 
           * orgCacheHomeName is org_id with no repo_id ;
           * 
           */
          generateCacheList(orgDraftHome, orgCacheHomeName, null, cleaner);
        }
      }

      if (bFinished || round == 1)
      {
        break;
      }
      else
      {
        if (cleaner.needGoFurther())
        {
          cleaner.extend();
          LOG.log(Level.INFO, "HK of upload convert Round 1 finished, and Round 2 need start.");
        }
      }
    }
  }

  /**
   * @param drafts
   * @param cleaner
   * @param orgHome
   * @param index
   * @param orgDraftHome
   * @return
   */
  private void generateCacheList(File orgDraftHome, String orgCacheHomeName, String orgCacheRepoName, ConditionalCleaner cleaner)
  {
    LOG.entering(this.getClass().getName(), "generateCacheList");
    File[] primaryDraftHome = orgDraftHome.listFiles();
    for (int m = 0; primaryDraftHome != null && m < primaryDraftHome.length; m++)
    {
      if (cleaner.isTimeout())
      {
        LOG.log(Level.INFO,
            "Too many drafts to be processed in a single house keeping phase, the remaings will be continued in next round house keeping.");
        break;
      }

      int primaryHash = validateHash(primaryDraftHome[m].getName());
      if (primaryHash >= 0 && primaryHash <= DraftStorageManager.PRIMARY_MAX_SLOT && primaryDraftHome[m].isDirectory())
      {
        File[] secondaryDraftHome = primaryDraftHome[m].listFiles();
        for (int n = 0; n < secondaryDraftHome.length; n++)
        {
          int secondaryHash = validateHash(secondaryDraftHome[n].getName());
          if (secondaryHash >= 0 && secondaryHash <= DraftStorageManager.SECONDARY_MAX_SLOT && secondaryDraftHome[n].isDirectory())
          {
            File[] docDraftHome = secondaryDraftHome[n].listFiles();
            for (int j = 0; j < docDraftHome.length; j++)
            {
              if (docDraftHome[j].getName().indexOf(ConditionalCleaner.getRenameTag()) > -1)
              {
                FileUtil.cleanDirectory(docDraftHome[j]);
                docDraftHome[j].delete();
                LOG.log(Level.WARNING, "Try to delete the remaining HouseKeeping trash folder " + docDraftHome[j].getAbsolutePath());
                continue;
              }
              DraftDescriptor dd = DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(orgCacheHomeName, orgCacheRepoName,
                  docDraftHome[j].getName());
              cleaner.cleanInstance(dd);
            }
          }
          if (secondaryDraftHome[n].list().length == 0)
          {
            secondaryDraftHome[n].delete();
          }
        }
      }
      if (primaryDraftHome[m].list().length == 0)
      {
        primaryDraftHome[m].delete();
      }
    }
    LOG.exiting(this.getClass().getName(), "generateCacheList");
  }

  /**
   * clean job cache folder
   */
  private void processCache()
  {
    ConditionalCleaner cleaner = new ConditionalCleaner(CleanerType.cacheType);
    long random = System.currentTimeMillis() / 2;
    File jobHome = new File(Job.JOB_HOME);
    File[] orgHome = jobHome.listFiles(new OrganizationHomeFilter());
    // Vector<File> remained = new Vector<File>();

    for (int round = 0; round < 2; round++)
    {
      boolean bFinished = true;
      for (int i = 0; orgHome != null && i < orgHome.length; i++)
      {
        // Verify Over time or not....
        if (cleaner.isTimeout())
        {
          LOG.log(Level.INFO,
              "Too many caches to be processed in a single house keeping phase, the remaings will be continued in next round house keeping.");
          bFinished = false;
          break;
        }

        // Verify the traverse order....
        int index = i;
        if (random == 1)
        {
          index = orgHome.length - i - 1;
        }

        File orgCacheHome = new File(orgHome[index], JobUtil.JOB_CACHE);

        if (!orgCacheHome.exists())
        {
          continue;
        }

        File[] primaryCacheHome = orgCacheHome.listFiles();
        for (int m = 0; m < primaryCacheHome.length; m++)
        {
          if (cleaner.isTimeout())
          {
            LOG.log(Level.INFO,
                "Too many caches to be processed in a single house keeping phase, the remaings will be continued in next round house keeping.");
            break;
          }

          int primaryHash = validateHash(primaryCacheHome[m].getName());
          if (primaryHash >= 0 && primaryHash <= JobUtil.PRIMARY_MAX_SLOT && primaryCacheHome[m].isDirectory())
          {
            File[] secondaryCacheHome = primaryCacheHome[m].listFiles();
            for (int n = 0; n < secondaryCacheHome.length; n++)
            {
              int secondaryHash = validateHash(secondaryCacheHome[n].getName());
              if (secondaryHash >= 0 && secondaryHash <= JobUtil.SECONDARY_MAX_SLOT && secondaryCacheHome[n].isDirectory())
              {
                File[] docCacheHome = secondaryCacheHome[n].listFiles();
                for (int j = 0; j < docCacheHome.length; j++)
                {
                  File[] cacheInstanceHome = docCacheHome[j].listFiles();
                  for (int o = 0; o < cacheInstanceHome.length; o++)
                  {
                    cleaner.cleanInstance(cacheInstanceHome[o]);
                  }

                  if (docCacheHome[j].list().length == 0)
                  {
                    docCacheHome[j].delete();
                  }
                }
                if (secondaryCacheHome[n].list().length == 0)
                {
                  secondaryCacheHome[n].delete();
                }
              }
            }
          }
          if (primaryCacheHome[m].list().length == 0)
          {
            primaryCacheHome[m].delete();
          }
        }
      }
      if (bFinished || round == 1)
      {
        break;
      }
      else
      {
        if (cleaner.needGoFurther())
        {
          cleaner.extend();
          LOG.log(Level.INFO, "HK of cache Round 1 finished, and Round 2 need start.");
        }
      }
    }

  }

  private void processDraft(Vector<DraftDescriptor> drafts)
  {
    ConditionalCleaner cleaner = new ConditionalCleaner(CleanerType.draftType);
    for (int round = 0; round < 2; round++)
    {
      boolean bFinished = cleaner.cleanInstances(drafts);
      if (bFinished || round == 1)
      {
        break;
      }
      else
      {
        if (cleaner.needGoFurther())
        {
          cleaner.extend();

          LOG.log(Level.INFO, "HK of draft Round 1 finished, and Round 2 need start.");
        }
      }
    }
  }

  public void ejbActivate() throws EJBException, RemoteException
  {
    ;
  }

  public void ejbPassivate() throws EJBException, RemoteException
  {
    ;
  }

  public void ejbRemove() throws EJBException, RemoteException
  {
    ;
  }

  public void setSessionContext(SessionContext sc) throws EJBException, RemoteException
  {
    ;
  }

  private int validateHash(String hash)
  {
    try
    {
      return Integer.valueOf(hash).intValue();
    }
    catch (NumberFormatException e)
    {
      return -1;
    }
  }
  /*
   * private void cleanDB(final DraftDescriptor dd, final IDocumentEntry docEntry) { DbCleaner.cleanDb(dd, docEntry); }
   * 
   * private BigInteger calculateTotalSize(File[] dirs, BigInteger result) { for (int i = 0; dirs != null && i < dirs.length; i++) { File[]
   * allFiles = dirs[i].listFiles(new FileFilter() { public boolean accept(File pathname) { return pathname.isFile(); } });
   * 
   * long totalSize = 0L; for (int j = 0; allFiles != null && j < allFiles.length; j++) { totalSize += allFiles[j].length(); }
   * 
   * if (allFiles == null) { LOG.log(Level.WARNING, "FILE Size Calculation Failed for: " + dirs[i]); } else { result =
   * result.add(BigInteger.valueOf(totalSize));
   * 
   * if (LOG.isLoggable(Level.FINE)) { LOG.log(Level.FINE, "FILE Size Caculation Success for: " + dirs[i] + " Size:" + result.toString()); }
   * } }
   * 
   * for (int i = 0; dirs != null && i < dirs.length; i++) { File[] allDirs = dirs[i].listFiles(new FileFilter() { public boolean
   * accept(File pathname) { return pathname.isDirectory(); } });
   * 
   * if (allDirs == null) { LOG.log(Level.WARNING, "DIR Size Calculation Failed for: " + dirs[i]); } else { result =
   * calculateTotalSize(allDirs, result);
   * 
   * if (LOG.isLoggable(Level.FINE)) { LOG.log(Level.FINE, "DIR Size Caculation Success for: " + dirs[i] + " Size:" + result.toString()); }
   * } }
   * 
   * return result; } /* private BigInteger calculateTotalSize(DraftDescriptor[] draftDescriptors) { BigInteger result =
   * BigInteger.valueOf(0L); for (int i = 0; i < draftDescriptors.length; i++) { try { JSONArray draftFiles =
   * DraftStorageManager.getDraftStorageManager(false).listDraftSections(draftDescriptors[i], null); long totalSize = 0; for (int j = 0; j <
   * draftFiles.size(); j++) { totalSize += ((Long) ((JSONObject) draftFiles.get(j)).get("size")).longValue(); } result =
   * result.add(BigInteger.valueOf(totalSize)); } catch (ConcordException e) { continue; } } return result; }
   * 
   * 
   * void processHeadlessDraft(long startTime, long timeout) { DraftComponent draftComp = (DraftComponent)
   * Platform.getComponent(DraftComponent.COMPONENT_ID); File draftHome = new File(draftComp.getDraftHome());
   * 
   * final String HK_POSTFIX = ".hk"; final Map<String, IDocumentEntry> headlessDrafts = new HashMap<String, IDocumentEntry>(); final File
   * hkDataDir = draftHome;
   * 
   * File hkDataFile = null; long currExecTimestamp = 0;
   * 
   * try { ByteBuffer timeBuf = ByteBuffer.allocate(8); File[] prevHKTimestamp = hkDataDir.listFiles(new FilenameFilter() { public boolean
   * accept(File dir, String name) { String REG_EXP = "\\d+" + HK_POSTFIX; Pattern pattern = Pattern.compile(REG_EXP); Matcher matcher =
   * pattern.matcher(name); return matcher.matches(); } });
   * 
   * if (prevHKTimestamp == null) { LOG.log(Level.WARNING, "Failed to clean headless draft due to illegal config directory. " +
   * hkDataDir.getPath()); return; }
   * 
   * long prevExecTimestamp = 0; if (prevHKTimestamp.length == 0) { try { long initTimestamp = System.currentTimeMillis(); hkDataFile = new
   * File(hkDataDir, initTimestamp + HK_POSTFIX); hkDataFile.createNewFile(); Calendar prevCal =
   * AtomDate.valueOf(initTimestamp).getCalendar(); prevCal.add(Calendar.MINUTE, -3); prevExecTimestamp = prevCal.getTimeInMillis(); } catch
   * (IOException e) { throw new RepositoryAccessException(e); } } else if (prevHKTimestamp.length == 1) { hkDataFile = prevHKTimestamp[0];
   * String hkData = prevHKTimestamp[0].getName(); long prevLong = Long.valueOf(hkData.substring(0, hkData.length() -
   * HK_POSTFIX.length())).longValue(); Calendar prevCal = AtomDate.valueOf(prevLong).getCalendar(); prevCal.add(Calendar.MINUTE, -3);
   * prevExecTimestamp = prevCal.getTimeInMillis(); } else // (prevHKTimestamp.length > 1 || prevHKTimestamp.length < 0) {
   * LOG.log(Level.WARNING, "Failed to clean headless draft due to illegal HK data in draft home root."); return; }
   * 
   * timeBuf.putLong(prevExecTimestamp); String crawlerTime = Base64.encode(timeBuf.array()); crawlerTime = URLEncoder.encode(crawlerTime,
   * "UTF-8");
   * 
   * RepositoryProviderRegistry registry = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
   * .getService(RepositoryProviderRegistry.class); IRepositoryAdapter repoAdpt =
   * registry.getRepository(RepositoryServiceUtil.getDefaultRepositoryId()); Iterator<IDocumentEntry> iter =
   * repoAdpt.getSeedList(crawlerTime, 500, ActionEnum.DELETE);
   * 
   * try { currExecTimestamp = System.currentTimeMillis();
   * 
   * while (iter.hasNext()) { IDocumentEntry docEntry = iter.next(); if (docEntry != null) { headlessDrafts.put(docEntry.getDocId(),
   * docEntry);
   * 
   * if (LOG.isLoggable(Level.FINE)) { LOG.log(Level.FINE, "Headless Draft Found at " + docEntry.getDocId()); } } } } catch
   * (IllegalStateException e) { throw (RepositoryAccessException) e.getCause(); } } catch (UnsupportedEncodingException e) {
   * currExecTimestamp = 0; LOG.log(Level.WARNING, "Failed to clean headless draft due to illegal encoding.", e); } catch
   * (RepositoryAccessException e) { currExecTimestamp = 0; LOG.log(Level.WARNING, e.getErrMsg(), e); }
   * 
   * LOG.log(Level.INFO, "Headless Drafts Count: " + headlessDrafts.size());
   * 
   * File[] orgHome = draftHome.listFiles(new OrganizationHomeFilter()); for (int j = 0; j < orgHome.length; j++) { File orgDraftHome = new
   * File(orgHome[j], "draft"); File[] primaryDraftHome = orgDraftHome.listFiles(); for (int m = 0; primaryDraftHome != null && m <
   * primaryDraftHome.length; m++) { int primaryHash = validateHash(primaryDraftHome[m].getName()); if (primaryHash >= 0 && primaryHash <=
   * DraftStorageManager.PRIMARY_MAX_SLOT && primaryDraftHome[m].isDirectory()) { File[] secondaryDraftHome =
   * primaryDraftHome[m].listFiles(); for (int n = 0; n < secondaryDraftHome.length; n++) { int secondaryHash =
   * validateHash(secondaryDraftHome[n].getName()); if (secondaryHash >= 0 && secondaryHash <= DraftStorageManager.SECONDARY_MAX_SLOT &&
   * secondaryDraftHome[n].isDirectory()) { File[] docDraftHome = secondaryDraftHome[n].listFiles(new FileFilter() { public boolean
   * accept(File file) { String docUri = file.getName(); int index = docUri.indexOf(IDocumentEntry.DOC_URI_SEP); if (index != -1) { return
   * headlessDrafts.get(docUri.substring(index + 1)) != null; } else { return headlessDrafts.get(docUri) != null; } } });
   * 
   * for (int o = 0; o < docDraftHome.length; o++) { DraftDescriptor dd =
   * DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(orgHome[j].getName(), null, docDraftHome[o].getName()); int index
   * = dd.getDocId().indexOf(IDocumentEntry.DOC_URI_SEP);
   * 
   * if (LOG.isLoggable(Level.FINE)) { LOG.log(Level.FINE, "Begin Process Headless Draft: " + dd); }
   * 
   * clean(dd, AtomDate.valueOf(0L).getCalendar(), 0); if (index != -1) { cleanDB(dd, headlessDrafts.get(dd.getDocId().substring(index +
   * 1))); } else { cleanDB(dd, headlessDrafts.get(dd.getDocId())); }
   * 
   * if (LOG.isLoggable(Level.FINE)) { LOG.log(Level.FINE, "End Process Headless Draft: " + dd); } } } } } } }
   * 
   * if (currExecTimestamp != 0) { if (hkDataFile.exists() && !hkDataFile.renameTo(new File(hkDataDir, currExecTimestamp + HK_POSTFIX))) {
   * LOG.log(Level.WARNING, "Failed to update house keeping timestamp."); } } }
   */

}

class OrganizationHomeFilter implements FileFilter
{
  public boolean accept(File orgHome)
  {
    return orgHome.isDirectory() && !"stateful_draft_list".equalsIgnoreCase(orgHome.getName())
        && !"draft_temp".equalsIgnoreCase(orgHome.getName()) && !"global_cache".equalsIgnoreCase(orgHome.getName());
  }
}
