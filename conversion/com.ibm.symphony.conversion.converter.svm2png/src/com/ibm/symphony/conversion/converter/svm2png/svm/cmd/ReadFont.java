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

import com.ibm.symphony.conversion.converter.svm2png.SVMFont;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.ByteUtil;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class ReadFont extends SVMCommand
{
  private SVMFont svmFont;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    svmFont.width *= renderer.getScaleRatio()*renderer.getXScale();
    svmFont.height *= renderer.getScaleRatio()*renderer.getYScale();
    renderer.setSVMFont(svmFont);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    ReadFont cmd = new ReadFont();
    cmd.id = id;
    SVMCommandID cmdID=(SVMCommandID)id;
    byte[] params = new byte[(int) cmdID.getSize()];
    in.read(params);
    
    int base = 6;
    cmd.svmFont = new SVMFont();
    
    // family name
    int strLen = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    char familyName[] = new char[strLen];
    for (int i = 0; i < strLen; ++i)
    {
      familyName[i] += params[base + i];
    }
    base += strLen;
    cmd.svmFont.familyName = new String(familyName);

    // style name
    strLen = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    char styleName[] = new char[strLen];
    for (int i = 0; i < strLen; ++i)
    {
      styleName[i] += params[base + i];
    }
    cmd.svmFont.styleName = new String(styleName);
    base += strLen;

    cmd.svmFont.width = ByteUtil.readInt(params[base], params[base + 1], params[base + 2], params[base + 3]);
    base += 4;
    cmd.svmFont.height = ByteUtil.readInt(params[base], params[base + 1], params[base + 2], params[base + 3]);
    base += 4;
    cmd.svmFont.charset = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.family = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.pitch = ByteUtil.readWord(params[base + 2], params[base + 3]);
    base += 2;
    cmd.svmFont.weight = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.underLine = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.strikeOut = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.italic = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.language = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.widthType = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.orientation = ByteUtil.readWord(params[base], params[base + 1]);
    base += 2;
    cmd.svmFont.wordLine = params[base];
    cmd.svmFont.outline = params[base + 1];
    cmd.svmFont.shadow = params[base + 2];
    cmd.svmFont.kerning = params[base + 3];
    
    return cmd;
  }

}
