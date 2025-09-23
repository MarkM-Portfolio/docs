/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2014, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.fixpack;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.IOUtils;
import com.ibm.docs.fixpack.config.Config;
import com.ibm.docs.fixpack.config.Constant;
import com.ibm.docs.fixpack.util.Utils;
import com.ibm.json.java.JSONObject;

public class FixPackTool
{

  public static final Logger LOGGER = Logger.getLogger(FixPackTool.class.getName());

  Config config = null;

  private Config getConfig() throws IOException
  {
    if (config == null)
    {
      config = Config.getInstance();
      config.init();
    }
    return config;
  }

  /**
   * create patch
   *
   * @throws IOException
   */
  private void createPatch() throws IOException
  {
    long start = System.currentTimeMillis();
    // get current build and unzip
    String localFilePath = getConfig().getBuildOutput() + File.separator + Constant.ONPREMISE + File.separator + getConfig().getCurrentProductNumber() + ".zip";
    File localFile = new File(localFilePath);
    if (!localFile.exists())
    {
      throw new FileNotFoundException("current build does not exist");
    }
    String workplace = getConfig().getBuildRoot() + Constant.WORK_PLACE;
    if (new File(workplace).exists())
    {
      Utils.delete(new File(workplace));
    }
    String currentProduct = getConfig().getBuildRoot() + Constant.WORK_PLACE + "CurrentProduct.zip";
    LOGGER.log(Level.INFO, "Copying current build...");
    Utils.copyFile(localFile, new File(currentProduct));
    Utils.unzip(new File(currentProduct));

    // get last build and unzip
    String lastProduct = getConfig().getBuildRoot() + Constant.WORK_PLACE + "LastProduct.zip";
    //  String remoteFile = getConfig().getRemoteBuildPath();
    String remoteFile = getConfig().getBaseBuildPath();
    LOGGER.log(Level.INFO, "Copying last published build: " + remoteFile + " -> " + lastProduct);
    Utils.copyFile(new File(remoteFile), new File(lastProduct));
    Utils.unzip(new File(lastProduct));

    // absolute path of the patch file
    String patchPath = getConfig().getBuildRoot() + Constant.FIXPACK_DIR + getConfig().getPatchName();
    File patchFile = new File(patchPath);
    if (patchFile.exists())
    {
      Utils.delete(patchFile);
    }
    patchFile.mkdirs();

    // modules under "native" directory in the build
    String[] oldModules = new File(lastProduct + Constant.NATIVE_DIR).list();
    String[] newModules = new File(currentProduct + Constant.NATIVE_DIR).list();
    if (oldModules == null || newModules == null)
    {
      throw new FileNotFoundException("No modules found in one of the two builds.");
    }
    if (oldModules.length != newModules.length)
    {
      throw new FileNotFoundException("Some modules are lost in one of the two versions.");
    }
    Arrays.sort(oldModules);
    Arrays.sort(newModules);

    // compare modules
    for (int i = 0; i < newModules.length; i++)
    {
      String moduleName = newModules[i].substring(0, newModules[i].lastIndexOf(config.getCurrentVersion()) - 1);
      LOGGER.log(Level.INFO, "begin to create patch of module " + moduleName);
      String oldModulePath = lastProduct + Constant.NATIVE_DIR + oldModules[i];
      String newModulePath = currentProduct + Constant.NATIVE_DIR + newModules[i];
      File oldModule = new File(oldModulePath);
      File newModule = new File(newModulePath);
      File modulePatch = new File(patchFile, moduleName);
      createModulePatch(oldModule, newModule, modulePatch);
      LOGGER.log(Level.INFO, "finish patch of module " + moduleName);
    }

    // create iFix zip
    File iFixFile = new File(getConfig().getBuildOutput() + File.separator + getConfig().getEnvType() + File.separator
        + getConfig().getPatchName());
    if (iFixFile.exists())
    {
      Utils.delete(iFixFile);
    }
    if (isSmartCloud())
    {
      // SmartCloud
      createPatch4SC(patchFile, iFixFile);

    }
    else
    {
      // OnPremise
      createDBPacth(new File(lastProduct), new File(currentProduct), patchFile);
      createHelpPacth(new File(lastProduct), new File(currentProduct), patchFile);
      Utils.copyAllFiles(new File(config.getBuildRoot() + Constant.FIXPACK_DIR + "script"), patchFile);
      createRemoteInstaller(patchFile);
      Utils.copyFile(new File(config.getBuildRoot() + Constant.FIXPACK_DIR + "guide", "README.txt"), new File(patchFile,
          "README.txt"));
      File onPremisePatch = new File(getConfig().getBuildOutput() + File.separator + Constant.ONPREMISE + File.separator
          + getConfig().getPatchName() + ".zip");
      Utils.zip(patchFile, onPremisePatch);
      Utils.createMD5(onPremisePatch);
    }

    long end = System.currentTimeMillis();

    LOGGER.log(Level.INFO, "Patch cost " + (end - start) + "ms");

  }

  /**
   * create final iFix for SmartCloud
   *
   * @param patchFile
   *          : patch file before zip
   * @param iFixFile
   *          : final file of iFix
   * @throws IOException
   */
  private void createPatch4SC(File patchFile, File iFixFile) throws IOException
  {
    File smartCloudPatch = new File(config.getBuildOutput() + File.separator + getConfig().getPatchName());
    File[] modules = patchFile.listFiles();
    if (modules != null)
    {
      for (File module : modules)
      {
        File subPatch = null;
        if ("DocsApp".equals(module.getName()))
        {
          subPatch = new File(smartCloudPatch, Constant.SC_DOCS_PATCH + "-" + getConfig().getCurrentVersion() + "-"
              + getConfig().getCurrentTimestamp());

          Utils.copyAllFiles(module, new File(subPatch, module.getName()));
          Utils.copyAllFiles(new File(config.getBuildRoot() + Constant.FIXPACK_DIR + "script"), subPatch);
          Utils.copyAllFiles(new File(config.getBuildRoot() + Constant.FIXPACK_DIR + "rundeck/docs"), subPatch);
          Utils.copyFile(new File(config.getBuildRoot() + Constant.ManageZkNodes_PY), new File(subPatch, "manageZkNodes.py"));
          Utils.zip(subPatch, new File(subPatch.getAbsolutePath() + ".zip"));
          Utils.createMD5(new File(subPatch.getAbsolutePath() + ".zip"));
          Utils.delete(subPatch);
        }
      }
    }
  }

  /**
   * generate ear patch ,zip patch for components under module(DocsApp,Viewer...)
   *
   * @param oldModule
   *          : module(Such as DocsApp,DocsConversion...) path in the old version
   * @param newModule
   *          : module path in the new version
   * @param modulePatch
   *          : patch directory
   * @throws IOException
   */
  private void createModulePatch(File oldModule, File newModule, File modulePatch) throws IOException
  {
    Set<String> newNames = Utils.getZipFiles(newModule);
    Set<String> oldNames = Utils.getZipFiles(oldModule);

    if (newNames.isEmpty())
    {
      LOGGER.log(Level.INFO, "no zip files found in " + newModule);
      return;
    }
    for (String fileName : newNames)
    {
      if (!oldNames.contains(fileName) && Utils.isNotUnzipped(fileName))
      {
        // files only exist in the new build
        LOGGER.log(Level.INFO, fileName + " only exists in the new build");
        Utils.copyFile(new File(newModule, fileName), new File(modulePatch, fileName));
      }
      else
      {
        // files exist in both the new build and the old build

        // this ear hardly change
        if (fileName.endsWith(Constant.SPELLCHECK_EAR))
        {
          continue;
        }

        // ear and zip files that have not been unzipped
        if (Utils.isNotUnzipped(fileName))
        {
          if (Utils.isZipEqual(new File(oldModule, fileName), new File(newModule, fileName)))
          {
            LOGGER.log(Level.INFO, fileName + " has no changes");
          }
          else
          {
            LOGGER.log(Level.INFO, fileName + " has changes");
            Utils.copyFile(new File(newModule, fileName), new File(modulePatch, fileName));

          }
          continue;
        }

        // other zip files that have been unzipped
        if (fileName.endsWith(".zip"))
        {
          File newZipFile = new File(newModule, fileName);
          File oldZipFile = new File(oldModule, fileName);
          File zipPatch = new File(modulePatch, fileName + Constant.TEMP);

          if (fileName.endsWith("Extension.zip"))
          {
            // DocsExt and ViewerExt have jar file with timestamp
            if (newZipFile.listFiles() != null && oldZipFile.listFiles() != null)
            {
              File newJarFile = newZipFile.listFiles()[0];
              File oldJarFile = oldZipFile.listFiles()[0];
              if (Utils.isJarEqual(newJarFile, oldJarFile, true))
              {
                LOGGER.log(Level.INFO, newJarFile.getName() + " has no changes");
              }
              else
              {
                Utils.copyFile(newJarFile, new File(zipPatch, newJarFile.getName()));
              }
            }
            else
            {
              throw new FileNotFoundException(fileName + " has no files in one of the two versions");
            }
          }
          else
          {
            if (Utils.isFolderEqual(newZipFile, oldZipFile))
            {
              LOGGER.log(Level.INFO, fileName + " has no changes");
            }
            else
            {
              Utils.copyAllFiles(newZipFile, zipPatch);
            }
          }
          if (Utils.isEmptyDir(zipPatch))
          {
            LOGGER.log(Level.INFO, fileName + " has no changes");
            zipPatch.delete();
          }
          else
          {
            Utils.zip(zipPatch, new File(modulePatch, fileName));
            Utils.delete(zipPatch);
          }
        }

        // WEB_RESOURCE_EAR
        if (fileName.endsWith(Constant.WEB_RESOURCE_EAR))
        {
          if (Utils.isWebEarEqual(new File(oldModule, fileName), new File(newModule, fileName)))
          {
            LOGGER.log(Level.INFO, fileName + " has no changes");
            createVersionFile(modulePatch, false);
          }
          else
          {
            LOGGER.log(Level.INFO, fileName + " has changes");
            Utils.copyFile(new File(config.getBuildRoot() + Constant.WEB_RESOURCE_EAR_DIR, fileName), new File(modulePatch, fileName));
            createVersionFile(modulePatch, true);
          }
          continue;
        }

        // VIEWER_EAR
        if (fileName.endsWith(Constant.VIEWER_EAR))
        {
          if (Utils.isWebEarEqual(new File(oldModule, fileName), new File(newModule, fileName)))
          {
            LOGGER.log(Level.INFO, fileName + " has no changes");
            createVersionFile(modulePatch, false);
          }
          else
          {
            LOGGER.log(Level.INFO, fileName + " has changes");
            if (isSmartCloud())
            {
              Utils.copyFile(new File(config.getBuildRoot() + Constant.SC_VIEWER_EAR_DIR, fileName), new File(modulePatch, fileName));
            }
            else
            {
              Utils.copyFile(new File(config.getBuildRoot() + Constant.OP_VIEWER_EAR_DIR, fileName), new File(modulePatch, fileName));
            }

            createVersionFile(modulePatch, true);
          }
          continue;
        }

        // other common ears
        if (fileName.endsWith(".ear"))
        {
          createEarPatch(new File(oldModule, fileName), new File(newModule, fileName), new File(modulePatch, fileName));
          continue;
        }

        // jar file compare
        if (Utils.isJar(fileName))
        {
          if (Utils.isJarEqual(new File(oldModule, fileName), new File(newModule, fileName), true))
          {
            LOGGER.log(Level.INFO, fileName + " has no changes");
          }
          else
          {
            Utils.copyFile(new File(newModule, fileName), new File(modulePatch, fileName));
          }
          continue;
        }

      }
    }

    // DocsConversion
    if (modulePatch.getName().equals("DocsConversion"))
    {
      if (isOnPremise() || isSmartCloud() && !Utils.isEmptyDir(modulePatch))
      {
        createVersionFile(modulePatch, true);
      }
    }
    // if this module has no change, delete the module directory
    if (Utils.isEmptyDir(modulePatch))
    {
      LOGGER.log(Level.INFO, newModule + " has no changes");
      modulePatch.delete();
    }

  }

  /**
   * create iFix version file in modulePatch
   *
   * @param modulePatch
   *          : the directory where the ifix version file exists in
   * @param containsTS
   *          : whether the ifix version file contains build_timestamp or not
   * @throws IOException
   */
  private void createVersionFile(File modulePatch, boolean containsTS) throws IOException
  {
    JSONObject versionInfo = new JSONObject();
    if (containsTS)
    {
      versionInfo.put("build_timestamp", getConfig().getCurrentTimestamp());
    }
    if (isOnPremise())
    {
      // only onpremise contains ifix_version
      versionInfo.put("ifix_version", getConfig().getiFixVersion());
      versionInfo.put("build_version", getConfig().getCurrentVersion());
      versionInfo.put("patch_base_build", getConfig().getBaseBuildLabel());
      versionInfo.put("product_name", getConfig().getProductName());
    }
    if (!versionInfo.isEmpty())
    {
      FileWriter fw = null;
      try
      {
        File targetFile = new File(modulePatch, Constant.IFIX_VERSION_FILE);
        if (!targetFile.exists())
        {
          targetFile.getParentFile().mkdirs();
          targetFile.createNewFile();
        }
        fw = new FileWriter(targetFile);
        versionInfo.serialize(fw);
      }
      finally
      {
        IOUtils.closeQuietly(fw);
      }
    }

  }

  /**
   * create conversion remote install zip
   *
   * @param patchFile
   * @throws IOException
   */
  private void createRemoteInstaller(File patchFile) throws IOException
  {
    File conversionPatch = new File(patchFile, "DocsConversion");
    File remoteInstaller = new File(conversionPatch, Constant.REMOTE_INSTALLER);
    File[] files = conversionPatch.listFiles();
    if (files == null || files.length == 0)
    {
      return;
    }
    else
    {
      for (File file : files)
      {
        String fileName = file.getName();
        if (Constant.NATIVE_ZIP.equals(fileName) || fileName.matches(Constant.SYMPHONY_ZIP))
        {
          Utils.copyFile(new File(conversionPatch, fileName), new File(remoteInstaller, fileName));
          new File(conversionPatch, fileName).delete();
        }
      }
    }
    if (remoteInstaller.exists())
    {
      Utils.copyAllFiles(new File(config.getBuildRoot() + Constant.FIXPACK_DIR + "installer"), new File(remoteInstaller, "installer"));
      Utils.zip(remoteInstaller, new File(remoteInstaller.getAbsolutePath() + ".zip"));
      Utils.delete(remoteInstaller);
      Utils.copyFile(new File(config.getBuildRoot() + Constant.FIXPACK_DIR + "installer" + File.separator + Constant.REMOTE_STARTER_PSL),
          new File(conversionPatch, Constant.REMOTE_STARTER_PSL));
      Utils.copyFile(new File(config.getBuildRoot() + Constant.FIXPACK_DIR + "installer" + File.separator + Constant.REMOTE_STARTER_SH),
          new File(conversionPatch, Constant.REMOTE_STARTER_SH));
    }

  }

  /**
   *
   * @param lastProduct
   *          : path of last build
   * @param currentProduct
   *          : path of current build
   * @param patchFile
   *          : path of the patch
   * @throws IOException
   */
  private void createDBPacth(File lastProduct, File currentProduct, File patchFile) throws IOException
  {
    File lastDBFile = new File(lastProduct, Constant.SetupDB_DIR);
    File currentDBFile = new File(currentProduct, Constant.SetupDB_DIR);
    File patchDB = new File(patchFile, Constant.SetupDB_DIR);

    int length1 = lastDBFile.getAbsolutePath().length() + 1;
    Map<String, File> lastMap = Utils.getAllFilesMap(lastDBFile, length1);

    int length2 = currentDBFile.getAbsolutePath().length() + 1;
    Map<String, File> currentMap = Utils.getAllFilesMap(currentDBFile, length2);

    for (String newfileName : currentMap.keySet())
    {
      if (!lastMap.containsKey(newfileName))
      {
        Utils.copyFile(currentMap.get(newfileName), new File(patchDB, newfileName));
      }
    }
    if (Utils.isEmptyDir(patchDB))
    {
      LOGGER.log(Level.INFO, "No changes in SetupDB");
      patchDB.delete();
    }
    else
    {
      File db2Patch = new File(patchDB, "db2");
      File db2 = new File(currentDBFile, "db2");
      if (db2Patch.exists())
      {
        Utils.copyFile(new File(db2, "updateDBSchema.bat"), new File(db2Patch, "updateDBSchema.bat"));
        Utils.copyFile(new File(db2, "updateDBSchema.sh"), new File(db2Patch, "updateDBSchema.sh"));
      }
      File oraclePatch = new File(patchDB, "oracle");
      File oracle = new File(currentDBFile, "oracle");
      if (oraclePatch.exists())
      {
        Utils.copyFile(new File(oracle, "updateDBSchema.bat"), new File(oraclePatch, "updateDBSchema.bat"));
        Utils.copyFile(new File(oracle, "updateDBSchema.sh"), new File(oraclePatch, "updateDBSchema.sh"));
        Utils.copyFile(new File(oracle, "queryProductTag.sql"), new File(oraclePatch, "queryProductTag.sql"));
      }
      File sqlserverPatch = new File(patchDB, "sqlserver");
      File sqlserver = new File(currentDBFile, "sqlserver");
      if (sqlserverPatch.exists())
      {
        Utils.copyFile(new File(sqlserver, "updateDBSchema.bat"), new File(sqlserverPatch, "updateDBSchema.bat"));
      }
    }

  }

  /**
   *
   * @param lastProduct
   * @param currentProduct
   * @param patchFile
   * @throws IOException
   */
  private void createHelpPacth(File lastProduct, File currentProduct, File patchFile) throws IOException
  {
    File lastHelpFile = new File(lastProduct.getAbsolutePath() + File.separator + Constant.DOCS_HELP);
    File currentHelpFile = new File(currentProduct.getAbsolutePath() + File.separator + Constant.DOCS_HELP);
    File patchHelpFile = new File(patchFile.getAbsolutePath() + File.separator + Constant.DOCS_HELP);
    if (!Utils.isFolderEqual(lastHelpFile, currentHelpFile))
    {
      LOGGER.log(Level.INFO, "docs help has changed");
      Utils.copyFile(new File(config.getBuildRoot() + Constant.DOCS_HELP_TARGET), patchHelpFile);
    }
    File lastECMHelpFile = new File(lastProduct.getAbsolutePath() + File.separator + Constant.DOCS_ECM_HELP);
    File currentECMHelpFile = new File(currentProduct.getAbsolutePath() + File.separator + Constant.DOCS_ECM_HELP);
    File patchECMHelpFile = new File(patchFile.getAbsolutePath() + File.separator + Constant.DOCS_ECM_HELP);
    if (!Utils.isFolderEqual(lastECMHelpFile, currentECMHelpFile))
    {
      LOGGER.log(Level.INFO, "docs ecm help has changed");
      Utils.copyAllFiles(new File(config.getBuildRoot() + Constant.DOCS_ECM_HELP_TARGET), patchECMHelpFile);
    }
  }

  /**
   * generate a patch for ear file
   *
   * @param oldEAR
   *          : the absolute path of the ear file
   * @param newEAR
   *          : the absolute path of the ear file
   * @param patchFile
   *          : the absolute path of the patch
   * @throws IOException
   */
  private void createEarPatch(File oldEAR, File newEAR, File patchFile) throws IOException
  {
    if (!oldEAR.exists())
    {
      LOGGER.log(Level.INFO, oldEAR + " does not exist");
      return;
    }
    if (!newEAR.exists())
    {
      LOGGER.log(Level.INFO, newEAR + " does not exist");
      return;
    }
    compareEar(oldEAR, newEAR, patchFile);
    Utils.zip(patchFile, new File(patchFile.getParentFile(), patchFile.getName() + ".zip"));
    Utils.delete(patchFile);
  }

  /**
   * compare two ear, and create the patch file according to the structure that WAS needs
   *
   * @param oldFile
   * @param newFile
   * @param patchFile
   * @throws IOException
   */
  private void compareEar(File oldFile, File newFile, File patchFile) throws IOException
  {
    if (patchFile.exists())
    {
      Utils.delete(patchFile);
    }
    patchFile.mkdirs();
    // including the length of File.separator
    int length1 = oldFile.getAbsolutePath().length() + 1;
    int length2 = newFile.getAbsolutePath().length() + 1;

    Map<String, File> oldMap = Utils.getAllFilesMap(oldFile, length1);
    Map<String, File> newMap = Utils.getAllFilesMap(newFile, length2);
    LOGGER.log(Level.INFO, oldFile.getName() + " in last version contains " + oldMap.size() + " files, " + newFile.getName()
        + " in current version contains " + newMap.size() + " files");

    int errcount = 0;// different files
    int oldonly = 0;// only exist in the old file
    int newonly = 0;// only exist in the new file
    int matchcount = 0;// identical files

    for (String child : oldMap.keySet())
    {
      if (newMap.containsKey(child))
      {
        // both the new file and the old file have a child file with the
        // same name
        File oldChildFile = oldMap.get(child);
        File newChildFile = newMap.get(child);
        newMap.remove(child);
        boolean matchFlag = false;
        if (Utils.isJar(child))
        {
          matchFlag = Utils.isJarEqual(oldChildFile, newChildFile, true);
        }
        else
        {
          matchFlag = Utils.isFileEqual(oldChildFile, newChildFile);
        }

        if (matchFlag)
        {
          // files match
          matchcount++;
        }
        else
        {
          // files differ
          errcount++;
          // copy the different file from the new file to the patch
          // file
          File patchChildFile = new File(patchFile, child);
          Utils.copyFile(newChildFile, patchChildFile);
        }
      }
      else
      {
        // files that only exist in the old file
        oldonly++;
        // create a file to record the files that only exist in the old
        // ear,namely which need to be deleted in the current
        // application
        String expr = null;
        if (File.separator.equals("\\"))
        {
          // windows os
          expr = "\\\\";
        }
        else
        {
          // unix os
          expr = File.separator;
        }
        String[] strArray = child.split(expr, 2);
        if (strArray != null)
        {
          if (strArray.length > 1 && strArray[0].endsWith(".war"))
          {
            // war has files to delete
            File deleteProps = new File(patchFile, strArray[0] + Constant.DELETE_PROPS_FILE);
            Utils.recordToFile(strArray[1], deleteProps);

          }
          else
          {
            // ear has files to delete
            File deleteProps = new File(patchFile, Constant.DELETE_PROPS_FILE);
            Utils.recordToFile(child, deleteProps);
          }
        }

      }
    }

    if (!newMap.isEmpty())
    {
      // files which are added to the new version, copy to the patch file
      for (String child : newMap.keySet())
      {
        newonly++;
        File newChildFile = newMap.get(child);
        File patchChildFile = new File(patchFile, child);
        Utils.copyFile(newChildFile, patchChildFile);
      }
    }
    if (errcount > 0 || newonly > 0 || oldonly > 0)
    {
      // if ear has changed, this file will be included
      File appXML = new File(patchFile, Constant.APP_XML_FILE);
      if (!appXML.exists())
      {
        Utils.copyFile(new File(newFile, Constant.APP_XML_FILE), appXML);
      }
    }
    // if no changes, no patch file
    if (Utils.isEmptyDir(patchFile))
    {
      Utils.delete(patchFile);
    }

    LOGGER.log(Level.INFO, matchcount + " files match, " + errcount + " files do not match, " + oldonly
        + " files only exist in last release, " + newonly + " files only exist in current build ");

  }

  private boolean isOnPremise()
  {
    return Constant.ONPREMISE.equals(config.getEnvType());
  }

  private boolean isSmartCloud()
  {
    return Constant.SMARTCLOUD.equals(config.getEnvType());
  }

  public static void main(String[] args)
  {
    FixPackTool tool = new FixPackTool();

    try
    {
      tool.createPatch();
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "error occurred in create patch: ", e);
    }

  }

}
