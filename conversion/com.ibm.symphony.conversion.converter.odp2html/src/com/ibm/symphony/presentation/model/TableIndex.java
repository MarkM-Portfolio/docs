/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.presentation.model;

import org.w3c.dom.Element;

public class TableIndex
{
  int x = -1;

  int y = -1;

  int row_num;
  boolean[][] coveredTable;             // Covered cell if true.
  Element[][] coveredTableCellElement;  // If covered cell, Element whose row or column span covers the cell.

  int col_num;

  public TableIndex(int row_num, int col_num)
  {
    this.row_num = row_num;
    this.col_num = col_num;
    coveredTable = new boolean[row_num+1][col_num+1];
    coveredTableCellElement = new Element[row_num+1][col_num+1];
    for(int i = 0;i<= row_num;i++)
      for(int j = 0;j<= col_num;j++)
        coveredTable[i][j] = false;
    for(int i = 0;i<= row_num;i++)
      for(int j = 0;j<= col_num;j++)
        coveredTableCellElement[i][j] = null;
  }


  public void setCoveredTable(Integer rowspan,Integer colspan,Element htmlElement)
  {
    if(rowspan == null && colspan == null)
      return;
    if(colspan == null)
    {
      for(int i = 0; i < rowspan;i++)
      {
        coveredTable[x+i][y] = true;
        coveredTableCellElement[x+i][y] = htmlElement;
      }
    }
    else if(rowspan == null)
    {
      for(int i = 0; i < colspan;i++)
      {
        coveredTable[x][y+i] = true;
        coveredTableCellElement[x][y+i] = htmlElement;
      }
    }
    else
      for(int i=0;i<rowspan;i++)
        for(int j= 0 ;j<colspan;j++)
        {
          coveredTable[x+i][y+j] = true;
          coveredTableCellElement[x+i][y+j] = htmlElement;
        }
  }

  public int getX()
  {
    return x;
  }

  public void setX(int x)
  {
    this.x = x;
  }

  public int getY()
  {
    return y;
  }

  public void setY(int y)
  {
    this.y = y;
  }

  public int increaseXIndex()
  {
    return x++;
  }

  public int increaseYIndex()
  {
    return y++;
  }

  public int increaseXIndex(int increasement)
  {
    return x = x + increasement;
  }

  public int increaseYIndex(int increasement)
  {
    return y = y + increasement;
  }

  public boolean isFirstRow()
  {
    return x == 0;
  }

  public boolean isLastRow()
  {
    return x == row_num;
  }

  public boolean isFirstColumn()
  {
    return y == 0;
  }

  public boolean isLastColumn()
  {
    return y == col_num;
  }

  public boolean isEvenColumn()
  {
    return y % 2 == 0;
  }

  public boolean isEvenRow()
  {
    return x % 2 == 0;
  }

  public boolean isOddColumn()
  {
    return y>0 && y % 2 == 1;
  }

  public boolean isOddRow()
  {
    return x >0 && x % 2 == 1;
  }
  
  public boolean isCovered()
  {
    if(x > row_num || y > col_num)
      return true;
    return coveredTable[x][y];
  }
  
  public Element getCoveredTableCellElement()
  {
    if(x > row_num || y > col_num)
      return null;
    return coveredTableCellElement[x][y];
  }
}
