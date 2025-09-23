package com.ibm.concord.spreadsheet.calcserver;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import com.ibm.concord.spreadsheet.document.model.MessageDispatcher;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.json.java.JSONObject;

public class DocumentExecutorService extends ThreadPoolExecutor
{
  // An ExecutorServices that itself is a single thread executor.
  // Bound with a document instance, receives task that changes, or destroys the model.
  // The task that destroys the model also shuts down the executor.
  private Document document;

  private MessageDispatcher dispatcher;

  public DocumentExecutorService(Document document)
  {
    super(1, 1, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>());

    dispatcher = new MessageDispatcher();
    dispatcher.setDocument(document);
    this.document = document;
  }

  public Future<?> submit(final String message)
  {
    return submit(new Runnable()
    {
      public void run()
      {
        try
        {
          JSONObject msg = JSONObject.parse(message);

          dispatcher.dispatchMessage(msg);
        }
        catch (IOException e)
        {
          throw new RuntimeException("parse message error, ", e);
        }
      }
    });
  }

  // end the service, kill the document, shutdown the service
  public Future<?> close() throws InterruptedException, ExecutionException
  {
    // submit the last task to do the clean job
    try
    {
      return submit(new Runnable()
      {
        public void run()
        {
          // TODO something needed to do before terminate.
        }
      });
    }
    finally
    {
      // no matter what, shutdown the service, makes the clean job just submitted the last one
      shutdown();
    }
  }
}
