/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png.svm.cmd;

import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.PreMapMode;
import com.ibm.symphony.conversion.converter.svm2png.SVMConst;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class MapMode extends SVMCommand
{
  PreMapMode preMapMode;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    switch(preMapMode.meUnit){
    case SVMConst.MAP_POINT:
        renderer.setOffsetX(-preMapMode.maOriginX);
        renderer.setOffsetY(-preMapMode.maOriginY);
        renderer.setXScale(1.0f/72);
        renderer.setYScale(1.0f/72);
        break;
    case SVMConst.MAP_RELATIVE:
        int offsetX = (int)((-renderer.getOffsetX()) * (1.0f/preMapMode.scaleX)) + preMapMode.maOriginX;
        renderer.setOffsetX(-offsetX);
        int offsetY = (int)((-renderer.getOffsetY()) * (1.0f/preMapMode.scaleY)) + preMapMode.maOriginY;
        renderer.setOffsetY(-offsetY);
        renderer.setXScale(renderer.getXScale()*preMapMode.scaleX);
        renderer.setYScale(renderer.getYScale()*preMapMode.scaleY);
        break;
    }
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    MapMode cmd = new MapMode();
    cmd.id = id;
    
    cmd.preMapMode = new PreMapMode();
    cmd.preMapMode.mnVersion = in.readWORD();
    cmd.preMapMode.mnTotalSize = in.readInt();
    cmd.preMapMode.meUnit = in.readWORD();
    cmd.preMapMode.maOriginX = in.readInt();
    cmd.preMapMode.maOriginY = in.readInt();

    int tmp1, tmp2;
    tmp1 = in.readInt();
    tmp2 = in.readInt();
    cmd.preMapMode.scaleX = (float) tmp1 / (float) tmp2;
    tmp1 = in.readInt();
    tmp2 = in.readInt();
    cmd.preMapMode.scaleY = (float) tmp1 / (float) tmp2;

    byte[] temp = new byte[1];
    in.read(temp);
    cmd.preMapMode.mbSimple = temp[0];
    
    return cmd;
  }
  
}
