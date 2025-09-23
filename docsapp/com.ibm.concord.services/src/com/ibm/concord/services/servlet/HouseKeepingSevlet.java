/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.servlet;

import java.io.IOException;
import java.util.Date;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.websphere.scheduler.BeanTaskInfo;
import com.ibm.websphere.scheduler.NotificationException;
import com.ibm.websphere.scheduler.NotificationSinkInvalid;
import com.ibm.websphere.scheduler.Scheduler;
import com.ibm.websphere.scheduler.SchedulerNotAvailableException;
import com.ibm.websphere.scheduler.TaskHandlerHome;
import com.ibm.websphere.scheduler.TaskInfo;
import com.ibm.websphere.scheduler.TaskInfoInvalid;
import com.ibm.websphere.scheduler.TaskInvalid;
import com.ibm.websphere.scheduler.TaskStatus;
import com.ibm.websphere.scheduler.UserCalendarInvalid;
import com.ibm.websphere.scheduler.UserCalendarPeriodInvalid;
import com.ibm.websphere.scheduler.UserCalendarSpecifierInvalid;

public class HouseKeepingSevlet extends HttpServlet
{
  private static final long serialVersionUID = -5925624792195849366L;

  private static final Logger LOG = Logger.getLogger(HouseKeepingSevlet.class.getName());

  private static TaskHandlerHome houseKeepingHome;

  static
  {
    try
    {
      Object hkh = new InitialContext().lookup("java:comp/env/ejb/HouseKeeping");
      houseKeepingHome = (TaskHandlerHome) javax.rmi.PortableRemoteObject.narrow(hkh, TaskHandlerHome.class);
    }
    catch (NamingException e)
    {
      e.printStackTrace();
    }
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    Scheduler hks = Platform.getHouseKeepingScheduler();

    if (hks == null)
    {
      LOG.log(Level.WARNING, "The house keeping scheduler was not found, please check your server configuration.");
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    if (houseKeepingHome == null)
    {
      LOG.log(Level.WARNING, "The house keeping bean was not found, please check <ejb-ref> element in web.xml and ejb-jar.xml.");
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    try
    {
      Iterator<?> existedTasksIter = hks.findTasksByName("house_keeping");
      while (existedTasksIter.hasNext())
      {
        TaskInfo prevTask = (TaskInfo) existedTasksIter.next();
        LOG.log(Level.INFO, "Previous House Keeping Task Found: " + prevTask.getTaskId() + " " + prevTask.getStatus());
        if (TaskStatus.SCHEDULED == prevTask.getStatus())
        {
          LOG.log(Level.INFO, "Request Ignored since the house keeping task was scheduled.");
          return;
        }
        else if (TaskStatus.RUNNING == prevTask.getStatus())
        {
          LOG.log(Level.INFO, "Request Ignored since the house keeping task is running.");
          return;
        }
      }

      BeanTaskInfo hkTaskInfo = (BeanTaskInfo) hks.createTaskInfo(BeanTaskInfo.class);
      hkTaskInfo.setName("house_keeping");
      hkTaskInfo.setQOS(TaskInfo.QOS_ATLEASTONCE);
      hkTaskInfo.setTaskExecutionOptions(TaskInfo.EXECUTION_DELAYEDUPDATE);
      hkTaskInfo.setExpectedDuration(60 * 30);

      String routine = request.getParameter("routine");
      if (routine != null)
      {
        hkTaskInfo.setUserCalendar(null, "CRON");

        /*
         * second minute hourOfDay DayOfMonth Month DayOfWeek
         * 
         * Month: JAN,FEB,MAR,APR,MAY,JUN,JUL,AUG,SEP,OCT,NOV,DEC
         * DayOfWeek: MON,FRI,SAT,SUN
         */
        if ("monthly".equalsIgnoreCase(routine))
        {
          String cronTableEntry = "0 0 23 L * ?";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
        }
        else if ("weekly".equalsIgnoreCase(routine))
        {
          String cronTableEntry = "0 0 23 ? * SUN";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
        }
        else if ("daily".equalsIgnoreCase(routine))
        {
          String cronTableEntry = "0 0 23 * * ?";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
        }
        else if ("hourly".equalsIgnoreCase(routine))
        {
          String cronTableEntry = "0 59 * * * ?";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
        }
        else
        {
          hkTaskInfo.setStartTime(new Date(System.currentTimeMillis() + 30 * 1000));
        }
      }
      else
      {
        hkTaskInfo.setStartTime(new Date(System.currentTimeMillis() + 30 * 1000));
      }

      hkTaskInfo.setTaskHandler(houseKeepingHome);

      TaskStatus ts = hks.create(hkTaskInfo);

      LOG.log(Level.INFO, "House Keeping Task Submitted: " + ts.getTaskId());
    }
    catch (TaskInfoInvalid e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (UserCalendarSpecifierInvalid e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (UserCalendarInvalid e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (UserCalendarPeriodInvalid e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (TaskInvalid e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (SchedulerNotAvailableException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (NotificationSinkInvalid e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (NotificationException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }
}
