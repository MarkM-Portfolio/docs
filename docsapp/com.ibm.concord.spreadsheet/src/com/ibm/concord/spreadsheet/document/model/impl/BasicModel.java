package com.ibm.concord.spreadsheet.document.model.impl;


public abstract class BasicModel 
{
  public static enum Direction
  {
    FORWARD,
    BACKWARD,
    BOTH
  };
  
  //every model has id, for rowModel it means row id, for cell and column mean column id
  protected int id;
  /**
   * get the index of the model
   */
  public abstract int getIndex();
  
  public abstract int getRepeatedNum();
  public abstract void setRepeatedNum(int num);
  public abstract Object getParent();
  /**
   * Remove the model from the document
   */
  public abstract void remove();
  
//  public abstract IDManager getIDManager();
  /**
   * copy all the attributes in the model into current model
   */
//  public abstract void copy(BasicModel model);
  
  
  /*
   * to check if the current model could merge with the previous or latter model
   */
  public abstract boolean isMergable(BasicModel model);
  
  public int getId()
  {
    return id;
  }
}

