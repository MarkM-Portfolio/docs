package com.ibm.conversion.service.rest.servlet;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.converter.libre.LibreManager;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConversionManager;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;

public class UploadConvertJobHeartBeat
{

  private static final Logger LOG = Logger.getLogger(UploadConvertJobHeartBeat.class.getName());

  private static final UploadConvertJobHeartBeat _instance = new UploadConvertJobHeartBeat();

  private int HB_DELAY;
  private int HB_INTERVAL;
  
  private Timer timer;

  private UploadConvertJobHeartBeat()
  {
    HB_DELAY = 5*1000;
    HB_INTERVAL = 10*1000;
  }

  public static UploadConvertJobHeartBeat getInstance()
  {
    return _instance;
  }

  public void start()
  {
    _instance.startBeating();
  }

  public void cancel()
  {
    _instance.cancelBeating();
  }
  
  private void startBeating()
  {
    timer = new Timer();
    timer.schedule(new HeartBeat(), HB_DELAY, HB_INTERVAL);
  }

  private void cancelBeating()
  {
    if(timer != null)
    {
      timer.cancel();
    }
  }
  
  class HeartBeat extends TimerTask
  {
    private Map<String, ConversionWork> uploadConvertJobQueue = null;
    
    private Map<String, ConversionWork> taskMap = null;
          
    private int lowerIdleSymInstances = 3;
        
    private int lowerIdleLibreInstances = 3;
    
    private int lowerIdleConvLibInstances = 3;
    
    private int lowerIdleJavaThreads = 75;
    
    private int workManagerMaxThreads = 100;
    
    HeartBeat()
    {
      this.uploadConvertJobQueue = ConversionWorkManager.getInstance().getUploadConvertJobQueue();
      this.taskMap = ConversionWorkManager.getInstance().getTaskMap();
      int idleResourcePercent = ConversionWorkManager.getInstance().getIdleResourcePercent();
      this.lowerIdleSymInstances = (SymphonyConversionManager.getInstance().getMaxSymInstances() * idleResourcePercent)/100;
      this.lowerIdleLibreInstances = (LibreManager.getInstance().getMaxStInstanceCount() * idleResourcePercent)/100;
      this.lowerIdleConvLibInstances = (ConversionLibManager.getInstance().getMaxClInstanceCount() * idleResourcePercent)/100;
      this.workManagerMaxThreads = ConversionWorkManager.getInstance().getWorkManagerMaxThreads();
      this.lowerIdleJavaThreads = (workManagerMaxThreads * idleResourcePercent)/100;
    }
    
    @Override
    public void run()
    {
      Iterator<Entry<String, ConversionWork>> it = uploadConvertJobQueue.entrySet().iterator();
      LOG.log(Level.FINE, "uploadConvertJobQueue size: " + uploadConvertJobQueue.size());
      while(it.hasNext())
      {
        Entry<String, ConversionWork> entry = it.next();
        String jobId = entry.getKey();
        ConversionWork work = entry.getValue();
        if(work == null || !NFSFileUtil.nfs_assertExistsDirectory(work.getTargetFolder(), NFSFileUtil.NFS_RETRY_SECONDS))
        {
          it.remove();
          LOG.log(Level.INFO," ConversionWork is null pointer or targetFolder does not exist");
          continue;
        }
        //If most of the conversion server resources are idle, then execute upload convert jobs
        int idleJavaThreads = workManagerMaxThreads - ConversionWorkManager.getInstance().getThreadCount();
        if(idleJavaThreads <= lowerIdleJavaThreads)
          continue;
        int idleSymInstances = SymphonyConversionManager.getInstance().getIdleSymphonyNumber();
        int idleLibreInstances = LibreManager.getInstance().getStInstanceCount();
        int idleConvLibInstances = ConversionLibManager.getInstance().getClInstanceCount();
        if(work.isUseStellent() && !work.isUseSymphonyImport())//MS viewer
        {
          if(idleLibreInstances > lowerIdleLibreInstances)
          {
            ConversionWorkManager.getInstance().startWork(jobId, work);
            it.remove();
            LOG.log(Level.INFO,"start to put upload convert job into WorkManager queue - only use Libre:" + jobId);
          }
          else
            LOG.log(Level.FINE, "MS viewer --- idleLibreInstances("+ idleLibreInstances+")<= lowerIdleLibreInstances("+ lowerIdleLibreInstances+")");
        }
        else if(work.isUseStellent() && work.isUseSymphonyImport())//ODF viewer
        {
          if((idleLibreInstances > lowerIdleLibreInstances)
              &&(idleSymInstances > lowerIdleSymInstances))
          {
            ConversionWorkManager.getInstance().startWork(jobId, work);
            it.remove();
            LOG.log(Level.INFO,"start to put upload convert job into WorkManager queue - use both Libre and Symphony:" + jobId);
          }
          else
            LOG.log(Level.FINE, "ODF viewer --- idleLibreInstances("+idleLibreInstances+")<=lowerIdleLibreInstances("+lowerIdleLibreInstances+
                ") or idleSymInstances("+idleSymInstances+")<= lowerIdleSymInstances(" +lowerIdleSymInstances+")");
          
        }
        else if(work.isUseSymphonyImport() && work.isUseJavaConverterImport())//XLS, PPT editing import
        {
          if((idleSymInstances > lowerIdleSymInstances)
            &&(idleJavaThreads > lowerIdleJavaThreads))
          {
            ConversionWorkManager.getInstance().startWork(jobId, work);
            it.remove();
            LOG.log(Level.INFO,"start to put upload convert job into WorkManager queue - use both Symphony and Java converter:" + jobId);
          }
          else
            LOG.log(Level.FINE, "XLS or PPT import --- idleSymInstances("+idleSymInstances+")<= lowerIdleSymInstances("+ lowerIdleSymInstances +
                "), or idleJavaThreads("+idleJavaThreads+")<=lowerIdleJavaThreads(" +lowerIdleJavaThreads +")");
        }
        else if(work.isUseSymphonyImport() && work.isUseConversionLib())//DOC editing import
        {
          if((idleSymInstances > lowerIdleSymInstances)
            &&(idleConvLibInstances > lowerIdleConvLibInstances))
          {
            ConversionWorkManager.getInstance().startWork(jobId, work);
            it.remove();
            LOG.log(Level.INFO,"start to put upload convert job into WorkManager queue - use both Symphony and ConversionLib converter:" + jobId);
          }
          else
            LOG.log(Level.FINE, "DOC import --- idleSymInstances("+idleSymInstances+")<= lowerIdleSymInstances("+ lowerIdleSymInstances +
                "), or idleConvLibInstances("+idleConvLibInstances+")<=lowerIdleConvLibInstances(" +lowerIdleConvLibInstances +")");
        }
        else if(!work.isUseSymphonyImport() && work.isUseJavaConverterImport())//ODS, ODP editing import
        {
          if(idleJavaThreads > lowerIdleJavaThreads)
          {
            ConversionWorkManager.getInstance().startWork(jobId, work);
            it.remove();
            LOG.log(Level.INFO,"start to put upload convert job into WorkManager queue - only use Java converter:" + jobId);
          }
          else
            LOG.log(Level.FINE, "ODS or ODP import --- idleJavaThreads("+ idleJavaThreads +")<= lowerIdleJavaThreads("+lowerIdleJavaThreads+")");
        }
        else if(work.isUseConversionLib())//DOCX/PPTX/XLSX/ODT/TXT editing import when conversionLib is enabled
        {
          if(idleConvLibInstances > lowerIdleConvLibInstances)
          {
            ConversionWorkManager.getInstance().startWork(jobId, work);
            it.remove();
            LOG.log(Level.INFO,"start to put upload convert job into WorkManager queue - only use ConversionLib converter:" + jobId);
          }
          else
            LOG.log(Level.FINE, "DOCX/PPTX/XLSX/ODT/TXT import by conversionLib --- idleConvLibInstances("+ idleConvLibInstances+")<= lowerIdleConvLibInstances("+lowerIdleConvLibInstances+")");
        }
        else//other conversion types, only consider java converter resources
        {
          if(idleJavaThreads > lowerIdleJavaThreads)
          {
            ConversionWorkManager.getInstance().startWork(jobId, work);
            it.remove();
            LOG.log(Level.INFO,"start to put upload convert job into WorkManager queue - unknown converter, deal with like Java converter:" + jobId);
          }
          else
            LOG.log(Level.FINE, "other conversion types --- idleJavaThreads("+ idleJavaThreads +")<= lowerIdleJavaThreads(" + lowerIdleJavaThreads + "),jobId: "+jobId);
        }
      }
    }
  }

}
