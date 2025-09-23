package com.ibm.docs.viewer.automation;

import java.util.logging.Logger;

import org.junit.runner.Description;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

public class ViewerTestsListener extends RunListener
{
  private static final Logger logger = Logger.getLogger(ViewerTestsListener.class.getName());

  private int total = 0;

  private int fails = 0;

  private long time = 0;

  // private String reportPath;

  public ViewerTestsListener(String reportPath)
  {
    super();
    // this.reportPath = reportPath;
  }

  @Override
  public void testFailure(Failure failure) throws Exception
  {
    super.testFailure(failure);

    logger.info(new StringBuffer("Test failed, ").append(failure.getDescription().getDisplayName()).toString());
  }

  @Override
  public void testFinished(Description description) throws Exception
  {
    super.testFinished(description);
  }

  public int getRunCount()
  {
    return total;
  }

  public int getFailureCount()
  {
    return fails;
  }

  public long getRunTime()
  {
    return time;
  }

  @Override
  public void testRunFinished(Result result) throws Exception
  {
    super.testRunFinished(result);

    // SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    total += result.getRunCount();
    fails += result.getFailureCount();
    time += result.getRunTime();
    // JSONObject json = new JSONObject();
    // JSONObject cases = new JSONObject();

    // JSONObject summary = new JSONObject();
    // summary.put("timestamp", sf.format(System.currentTimeMillis()));
    // summary.put("total", result.getRunCount());
    //
    // summary.put("failure", result.getFailureCount());
    // summary.put("time", result.getRunTime());
    // summary.put("succrate", 1.0 - (float) result.getFailureCount() / (float) result.getRunCount());
    // json.put("Summary", summary);
    // json.put("cases", cases);

    // allSummary.put("total", (Integer) allSummary.get("total") + result.getRunCount());
    // allSummary.put("failure", (Integer) allSummary.get("failure") + result.getFailureCount());
    // FileOutputStream fos = null;
    // File reportFile = null;
    // try
    // {
    // reportFile = new File(reportPath, "summary.json");
    // logger.info("Generating report to " + reportFile.getAbsolutePath());
    // fos = new FileOutputStream(reportFile);
    // json.serialize(fos);
    // }
    // catch (Exception e)
    // {
    // logger.log(Level.WARNING, "Failed to generate report to " + reportFile.getAbsolutePath(), e);
    // }
    // finally
    // {
    // if(fos != null)
    // {
    // try
    // {
    // fos.close();
    // }
    // catch (Exception e)
    // {
    // logger.warning("Failed to close the output stream.");
    // }
    // }
    // }
  }

  @Override
  public void testRunStarted(Description description) throws Exception
  {
    super.testRunStarted(description);
  }

  @Override
  public void testStarted(Description description) throws Exception
  {
    StringBuffer sbf = new StringBuffer("Running test, ").append(description.getDisplayName());
    logger.info(sbf.toString());
    super.testStarted(description);
  }

}
