package com.ibm.concord.writer.message;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.writer.LogPurify;
import com.ibm.concord.writer.message.impl.AddComment;
import com.ibm.concord.writer.message.impl.AddEvenOdd;
import com.ibm.concord.writer.message.impl.AddStyle;
import com.ibm.concord.writer.message.impl.ApplyStyle;
import com.ibm.concord.writer.message.impl.ArrayOperation;
import com.ibm.concord.writer.message.impl.CheckModel;
import com.ibm.concord.writer.message.impl.AcceptTrackChanges;
import com.ibm.concord.writer.message.impl.DelComment;
import com.ibm.concord.writer.message.impl.DeleteColumn;
import com.ibm.concord.writer.message.impl.DeleteElement;
import com.ibm.concord.writer.message.impl.DeleteRow;
import com.ibm.concord.writer.message.impl.DeleteSection;
import com.ibm.concord.writer.message.impl.DeleteText;
import com.ibm.concord.writer.message.impl.InsertColumn;
import com.ibm.concord.writer.message.impl.InsertElement;
import com.ibm.concord.writer.message.impl.InsertRow;
import com.ibm.concord.writer.message.impl.InsertSection;
import com.ibm.concord.writer.message.impl.InsertText;
import com.ibm.concord.writer.message.impl.KeyOperation;
import com.ibm.concord.writer.message.impl.MergeCellsOperation;
import com.ibm.concord.writer.message.impl.PageCount;
import com.ibm.concord.writer.message.impl.RemoveEvenOdd;
import com.ibm.concord.writer.message.impl.SetAttribute;
import com.ibm.concord.writer.message.impl.SetList;
import com.ibm.concord.writer.message.impl.SetParaTask;
import com.ibm.concord.writer.message.impl.SetTableTask;
import com.ibm.concord.writer.message.impl.SplitCellOperation;
import com.ibm.concord.writer.message.impl.SetTrackChange;
import com.ibm.concord.writer.message.impl.UpdateComment;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.json.java.JSONObject;

public abstract class Operation
{
  protected String type;

  protected String target;

  protected String tableTarget;

  protected boolean isAppend = false;

  public final static String ISAPPEND = "isAppend";

  public final static String TYPE = "t";

  public final static String TARGET = "tid";

  public final static String TABLE_TARGET = "tbId";

  // operation types
  public final static String DELETE_TEXT = "dt";

  public final static String INSERT_TEXT = "it";

  public final static String DELETE_ELEMENT = "de";

  public final static String INSERT_ELEMENT = "ie";

  public final static String SET_ATTRIBUTE = "sa";

  public final static String REMOVE_ATTRIBUTE = "ra";

  public final static String SET_TEXT_ATTRIBUTE = "sta";

  public final static String REMOVE_TEXT_ATTRIBUTE = "rta";

  public final static String INSERT_KEY = "ik";

  public final static String DELETE_KEY = "dk";

  public final static String REPLACE_KEY = "rk";

  public final static String INSERT_ARRAY = "ia";

  public final static String DELETE_ARRAY = "da";

  public final static String ADD_LIST = "al";

  public final static String INDENT_LIST = "il";

  public final static String CHANGE_TYPE = "ct";

  public final static String CHANGE_START = "cs";

  public final static String INDEX = "idx";

  public final static String LENGTH = "len";

  public final static String OBJID = "oid";

  public final static String COMMENT_ID = "cid";

  public final static String COMMENT_PID = "cpid";

  public final static String COMMENT_RCID = "rcid";

  public final static String COMMENT_RUNID = "rid";

  public final static String COMMENT_T = "iS";

  public final static String FORMAT = "fmt";

  public final static String CONTENT = "c";

  public final static String CNT = "cnt";

  public final static String RUN_TYPE = "rt";

  public final static String PATH = "path";

  public final static String KEY_ID = "k";

  public final static String ACTION_ADD_STYLE = "as";

  public final static String TEXTPROPERTY = "rPr";

  public final static String NUMBER_ID = "nid";

  public final static String ABSTRACTNUM_ID = "aid";

  public final static String SUB_TYPE = "st";

  public final static String LEVEL = "lvl";

  public final static String NUM_FMT = "numFmt";

  public final static String LVL_TEXT = "lvlText";

  public final static String PIC_BULLET_ID = "lvlPicBulletId";

  public final static String DEL_SECTION = "deSec";

  public final static String INSERT_SECTION = "iSec";

  public final static String ADD_EVEN_ODD = "ieo";

  public final static String REMOVE_EVEN_ODD = "deo";

  public final static String INSERT_ROW = "ir";

  public final static String DELETE_ROW = "dr";

  public final static String INSERT_COLUMN = "ic";

  public final static String DELETE_COLUMN = "dc";

  public final static String MERGE_CELLS = "tmc";

  public final static String SPLIT_CELLS = "tsc";

  public final static String ADD_COMMENT = "acmt";

  public final static String DEL_COMMENT = "dcmt";

  public final static String UPDATE_COMMENT = "ucmt";

  public final static String SET_PARA_TASK = "sps";

  public final static String SET_TABLE_TASK = "sts";

  public final static String PAGE_COUNT = "pc";

  public final static String TRACK_CHANGE_ON = "trackOn";
  
  public final static String TRACK_CHANGE_OFF = "trackOff";

  public final static String CHECK_MODEL = "cm";

  public final static String ACCEPT_TRACK_CHANGES = "ctc";

  // public final static String BLOCK_ID = "bid";

  // public final static String ELEMENT_LIST = "elist";

  private static final Logger LOG = Logger.getLogger(Operation.class.getName());

  public void throwUnSupported(JSONObject model, ModelObject modelObj)
  {
    throw new java.lang.UnsupportedOperationException("Not supported, "
        + (modelObj == null ? "Opt on null model" : ("Opt on non-supported-obj: " + modelObj.getModelType())) + "\nTarget: "
        + this.getTarget() + ", apply JSON MODEL: " + (model == null ? "null" : ("\n" + LogPurify.purify(model))));
  }

  public void logNoTarget(String id, String modelType)
  {
    LOG.log(Level.WARNING, "==Apply message warn: The target " + id + " (" + modelType + ") is not found in " + this.getType()
        + ", maybe OT/undo/redo code has some leak.");
  }

  public boolean isAppend()
  {
    return this.isAppend;
  }

  public void setAppend(boolean value)
  {
    this.isAppend = value;
  }

  protected void readAppend(JSONObject update)
  {

    if (update.get(ISAPPEND) != null)
    {
      setAppend((Boolean) update.get(ISAPPEND));
    }
    else
    {
      setAppend(false);
    }
  }

  protected void writeAppend(JSONObject update)
  {
    update.put(ISAPPEND, isAppend());
  }

  public String getType()
  {
    return this.type;
  }

  public void setType(String type)
  {
    this.type = type;
  }

  public String getTarget()
  {
    return this.target;
  }

  public void setTarget(String target)
  {
    this.target = target;
  }

  public String getTableTarget()
  {
    return this.tableTarget;
  }

  public void setTableTarget(String tblTarget)
  {
    this.tableTarget = tblTarget;
  }

  public static Operation createOperation(JSONObject jsonUpdate)
  {
    Operation op = null;
    String type = (String) jsonUpdate.get(TYPE);
    if (INSERT_TEXT.equals(type))
    {
      op = new InsertText(jsonUpdate);
    }
    else if (DELETE_TEXT.equals(type))
    {
      op = new DeleteText(jsonUpdate);
    }
    else if (INSERT_KEY.equals(type) || DELETE_KEY.equals(type) || REPLACE_KEY.equals(type))
    {
      op = new KeyOperation(jsonUpdate);
    }
    else if (INSERT_ARRAY.equals(type) || DELETE_ARRAY.equals(type))
    {
      op = new ArrayOperation(jsonUpdate);
    }
    else if (SET_TEXT_ATTRIBUTE.equals(type))
    {
      op = new ApplyStyle(jsonUpdate);
    }
    else if (DELETE_ELEMENT.equals(type))
    {
      op = new DeleteElement(jsonUpdate);
    }
    else if (INSERT_ELEMENT.equals(type))
    {
      op = new InsertElement(jsonUpdate);
    }
    else if (SET_ATTRIBUTE.equals(type))
    {
      op = new SetAttribute(jsonUpdate);
    }
    else if (ADD_LIST.equals(type) || INDENT_LIST.equals(type) || CHANGE_TYPE.equals(type) || CHANGE_START.equals(type))
    {
      op = new SetList(jsonUpdate);
    }
    else if (SET_PARA_TASK.equals(type))
    {
      op = new SetParaTask(jsonUpdate);
    }
    else if (SET_TABLE_TASK.equals(type))
    {
      op = new SetTableTask(jsonUpdate);
    }
    else if (ADD_COMMENT.equals(type))
    {
      op = new AddComment(jsonUpdate);
    }
    else if (DEL_COMMENT.equals(type))
    {
      op = new DelComment(jsonUpdate);
    }
    else if (UPDATE_COMMENT.equals(type))
    {
      op = new UpdateComment(jsonUpdate);
    }
    else if (ACTION_ADD_STYLE.equals(type))
    {
      op = new AddStyle(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.INSERT_ROW))
    {
      op = new InsertRow(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.DELETE_ROW))
    {
      op = new DeleteRow(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.INSERT_COLUMN))
    {
      op = new InsertColumn(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.DELETE_COLUMN))
    {
      op = new DeleteColumn(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.MERGE_CELLS))
    {
      op = new MergeCellsOperation(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.SPLIT_CELLS))
    {
      op = new SplitCellOperation(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.INSERT_SECTION))
    {
      op = new InsertSection(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.DEL_SECTION))
    {
      op = new DeleteSection(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.ADD_EVEN_ODD))
    {
      op = new AddEvenOdd(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(Operation.REMOVE_EVEN_ODD))
    {
      op = new RemoveEvenOdd(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(PAGE_COUNT))
    {
      op = new PageCount(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(TRACK_CHANGE_ON))
    {
      op = new SetTrackChange(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(TRACK_CHANGE_OFF))
    {
      op = new SetTrackChange(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(CHECK_MODEL))
    {
      op = new CheckModel(jsonUpdate);
    }
    else if (type.equalsIgnoreCase(ACCEPT_TRACK_CHANGES))
    {
      op = new AcceptTrackChanges(jsonUpdate);
    }

    if (op != null)
      op.setType(type);
    return op;
  }

  protected void readOp(JSONObject update)
  {
    Object tblId = update.get(TABLE_TARGET);
    if (tblId != null)
      setTableTarget(tblId.toString());
  }

  protected void writeOp(JSONObject update)
  {
    if (update != null && getTableTarget() != null)
      update.put(TABLE_TARGET, getTableTarget());
  }

  abstract protected void apply(JSONObject model) throws Exception;

  abstract public boolean read(JSONObject update);

  abstract public JSONObject write();// for transform
}
