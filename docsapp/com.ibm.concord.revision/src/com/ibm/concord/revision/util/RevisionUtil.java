/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.util;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.ListIterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.revision.IRevision;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.concord.platform.revision.RevisionContentDescriptor;
import com.ibm.concord.platform.revision.RevisionDescriptor;
import com.ibm.concord.revision.exception.RevisionDataException;
import com.ibm.concord.revision.service.DocumentRevisionStorageManager;
import com.ibm.concord.revision.service.RevisionService;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.directory.beans.UserBean;

public class RevisionUtil
{
  private static final Logger LOG = Logger.getLogger(RevisionUtil.class.getName());

  public static String getRevisionLabel(int majorNo, int minorNo)
  {
    if (minorNo == 0)
      return String.valueOf(majorNo);
    else
      return majorNo + "." + minorNo;
  }

  public static int[] getRevisionNo(String revisionLable)
  {
    String[] s = revisionLable.split("\\.");
    int minorNo = 0;
    int majorNo = 0;

    majorNo = Integer.parseInt(s[0]);
    if (s.length > 1)
      minorNo = Integer.parseInt(s[1]);

    return new int[] { majorNo, minorNo };
  }

  public static String getContentMediaFolder(UserBean user, IDocumentEntry docEntry, String revision)
  {
    try
    {
      int[] revNo = getRevisionNo(revision);
      int majorNo = revNo[0];
      int minorNo = revNo[1];

      DocumentRevisionStorageManager storageManager = new DocumentRevisionStorageManager(docEntry, user);
      RevisionDescriptor rd = storageManager.getRevisionDescriptor(majorNo, minorNo);
      String contentMediaFolder = storageManager.getContentMediaFolder(rd);
      return contentMediaFolder;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to get revision content path", e);
    }
    return null;
  }

  public final static DraftDescriptor getDraftForRevision(UserBean user, IDocumentEntry docEntry, int major, int minor) throws Exception
  {
    LOG.entering(RevisionUtil.class.getName(), "getDraftForRevision", new Object[] { docEntry.getDocId(), major, minor });
    IRevisionService revisionService = RevisionService.getInstance();
    RevisionContentDescriptor contentDescriptor = revisionService.getRevisionContentDescriptor(user, docEntry, major, minor);
    if (contentDescriptor == null)
    {
      throw new Exception("Failed to get the content information for revision " + docEntry.getDocUri() + "@"
          + RevisionUtil.getRevisionLabel(major, minor));
    }
    else if (!FileUtil.exists(new File(contentDescriptor.getBasepath())))
    {
      if (contentDescriptor.getBaseRevisionNo() == 0)
      {
        // for major revision. If base file doesn't exist, it means there's no draft for this major reversion.
        // But the draft can be recovered from Files
        return null;
      }
      else
      {
        throw new RevisionDataException(RevisionDataException.ERROR_REVISION_DATA_NOT_FOUND, "Failed to get the content for revision "
            + docEntry.getDocUri() + "@" + RevisionUtil.getRevisionLabel(major, minor) + " because the base file "
            + contentDescriptor.getBasepath() + " doesn't exist.");
      }
    }
    else if (contentDescriptor.getDelta() == null || contentDescriptor.getDelta().size() == 0)
    {
      RevisionDescriptor rd = contentDescriptor.getRevisionDescriptor();
      final String path = contentDescriptor.getBasepath();
      return new DraftDescriptor(rd.getCustomId(), rd.getRepository(), rd.getDocId(), path, new String[] { rd.getPrimaryHash(),
          rd.getSecondaryHash() })
      {
        public String getURI()
        {
          return path;
        }
      };
    }
    else
      return null;
  }

  public static List<IRevision> getContentMinorRevisionsChain(final List<IRevision> revisions, int minorNo)
  {
    List<IRevision> contentRevisions = new ArrayList<IRevision>();
    ListIterator li = revisions.listIterator(revisions.size());
    int topRef = -1;    
    while (li.hasPrevious())  // Iterate in reverse.
    {
      IRevision minorRev = (IRevision) li.previous();
      int liMinor = minorRev.getMinorRevisionNo();

      // ignore minors which greater than minorNo
      if (liMinor > minorNo)
        continue;

      // get reference minor
      String referenceRev = minorRev.getReferenceRevision();
      if (referenceRev != null && referenceRev.length() > 0 && topRef == -1)
      {
        int[] revisionNo = getRevisionNo(referenceRev);
        topRef = revisionNo[1];
        contentRevisions.add(minorRev);
        continue;
      }   
            
      if(topRef == -1)
      {// normal minor
        contentRevisions.add(minorRev);
      }       
      else if(topRef == 0)
      {// reference base
        break;
      }
      else
      {
        if(liMinor > topRef)
        {// ignore minors which are between restored and reference minor
          continue;
        }
        else
        {// back to reference             
          contentRevisions.add(minorRev);
          topRef = -1; //clear reference No.
          continue;
        }
      }
    }

    Collections.reverse(contentRevisions);
    return contentRevisions;
  }
  
  public static boolean isRevisionInContentChain(final List<IRevision> revisions, int minorNo)
  {
    return true;
  }

}
