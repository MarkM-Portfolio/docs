/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.common.formulalexer;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;

public class IDMFormulaLexer
{
  public static enum LexFormulaType {
    FORMAT_OOXML, FORMAT_ODF
  };

  public static final IDMFormulaLexer.LexFormulaType InternalFormulaType = IDMFormulaLexer.LexFormulaType.FORMAT_OOXML;

  public static enum State {
    STATE_START, STATE_STRING, STATE_NUM, STATE_NAME, STATE_STOP
  };

  public static void setFuncToken(IDMFormulaToken token)
  {
    /*
     * NSString* text = token.text; try { text = websheet.functions.FormulaTranslate.transFuncNameLocale2En(text); value =
     * websheet.functions.Formulas.getFunc(text); type = this.TOKEN_TYPE.FUNCTION_TYPE; }catch(e) { if(e ==
     * websheet.Constant.ERRORCODE["1001"]) value = e; }
     */
    token.type = IDMFormulaToken.LexTokenType.FUNCTION_TYPE;
    token.text = token.upperText();

  }

  public static String trimFormula(String formula)
  {
    if (!formula.isEmpty())
    {
      if (formula.substring(0, 1) == "=")
      {
        return formula.substring(1);
      }
      else
      {
        return formula;
      }
    }
    else
    {
      return "";
    }
  }

  public static boolean isDigit(char ch)
  {
    return ch >= '0' && ch <= '9';
  }

  public static boolean isLetter(char ch)
  {
    return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
  }

  public static Boolean isLogical(String value)
  {
    if (value.equalsIgnoreCase("TRUE"))
      return true;
    if (value.equalsIgnoreCase("FALSE"))
      return false;
    return null;
  }

  public static List<IDMFormulaToken> parseq(String formulaString, List<IDMFormulaError> errorlist, LexFormulaType formulatype)
  {
    // System.out.println("Parseq:"+formulaString);
    if (formulatype == LexFormulaType.FORMAT_OOXML)
    {
      IDMOOXMLFormulaLexer lexer = new IDMOOXMLFormulaLexer();
      lexer.initWithFormula(lexer.trimFormula(formulaString));
      lexer.parse();
      if (lexer.ferror == null)
        return lexer.tokens;
      else
      {
        if (lexer.ferror != null)
          errorlist.add(lexer.ferror);
        List<IDMFormulaToken> ret = new ArrayList<IDMFormulaToken>();
        return ret;
      }
    }
    else
    {
      IDMODFFormulaLexer lexer = new IDMODFFormulaLexer();
      lexer.initWithFormula(lexer.trimFormula(formulaString));
      lexer.parse();
      if (lexer.ferror == null)
        return lexer.tokens;
      else
      {
        if (lexer.ferror != null)
          errorlist.add(lexer.ferror);
        List<IDMFormulaToken> ret = new ArrayList<IDMFormulaToken>();
        return ret;
      }
    }
  }

  public static String transOOXMLFormulaToODF(String formulaString)
  {
    List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
    List<IDMFormulaToken> tokens = IDMFormulaLexer.parseq(formulaString, ferr, IDMFormulaLexer.LexFormulaType.FORMAT_OOXML);
    StringBuffer out = new StringBuffer();
    for (int i=0; i < tokens.size(); i++)
    {
      IDMFormulaToken token = tokens.get(i);
      if (token.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE)
      {
        IDMFormulaParsedRef ref = (IDMFormulaParsedRef) (token.value);
        int mask = ref.getRefMask();
        mask = mask & ~IDMFormulaParsedRef.MASK_OOXML_FORMAT;
        ref.setRefMask(mask);
        out.append(ref.getAddress());
      }
      else if (token.type == IDMFormulaToken.LexTokenType.ERROR_TYPE || token.type == IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE)
      {
        if (token.text != null && !token.text.isEmpty())
          out.append(token.text);
      }
      else if (token.type == IDMFormulaToken.LexTokenType.STRING_TYPE)
      {
        out.append('\"');
        if (token.text != null && !token.text.isEmpty())
        {
          String outputtext = token.text.replaceAll("\"", "\"\"");
          out.append(outputtext);
        }
        out.append('\"');
      }
      else if (token.type == IDMFormulaToken.LexTokenType.NAME_TYPE &&
               // token.subType == IDMFormulaToken.TokenSubtype.NAME_SHEETNAME &&
               i < tokens.size() - 2)
      { //3d reference, special output
        IDMFormulaToken reftoken = tokens.get(i+2);
        IDMFormulaToken optoken = tokens.get(i+1);
        if (optoken.type == IDMFormulaToken.LexTokenType.OPERATOR_TYPE &&
            optoken.subType == IDMFormulaToken.TokenSubtype.OPERATOR_COLON &&
            reftoken.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE)
        {
          IDMFormulaParsedRef ref = (IDMFormulaParsedRef) (reftoken.value);
          IDMFormulaParsedRef firstref = ref.clone();
          int mask = firstref.getRefMask();
          mask = mask & ~IDMFormulaParsedRef.MASK_OOXML_FORMAT;
          mask = mask & ~IDMFormulaParsedRef.MASK_QUOTE_SHEETNAME;
          mask = mask & ~IDMFormulaParsedRef.MASK_END_COLUMN;
          mask = mask & ~IDMFormulaParsedRef.MASK_END_ROW;
          firstref.setRefMask(mask);
          firstref.setSheetName(token.text);
          out.append(firstref.getAddress());
          out.append(":");
          mask = ref.getRefMask();
          mask = mask & ~IDMFormulaParsedRef.MASK_OOXML_FORMAT;
          mask = mask & ~IDMFormulaParsedRef.MASK_END_COLUMN;
          mask = mask & ~IDMFormulaParsedRef.MASK_END_ROW;
          ref.setRefMask(mask);
          ref.setStartCol(ref.getIntEndCol()-1);
          ref.setStartRow(ref.getIntEndRow()-1);
          out.append(ref.getAddress());
          i=i+2;
        }
        else if (token.text != null && !token.text.isEmpty())
        { // common name type, output directly
          out.append(token.text);
        }
      }
      else
      {
        switch (token.subType)
          {
            case SEPERATOR_ARGUMENTS :
              out.append(';');
              break;
            case SEPERATOR_ARRAY_COL :
              out.append(';');
              break;
            case SEPERATOR_ARRAY_ROW :
              out.append('|');
              break;
            case OPERATOR_INTERSECTION :
              out.append('!');
              if (token.text != null && token.text.length() > 1)
              {
                out.append(token.text.substring(1));
              }
              break;
            case OPERATOR_UNION :
              if (formulaString.startsWith("(")) 
                  out.append(",");  // chart union
              else 
                out.append('~');
              break;
            default:
              if (token.value != null && !token.value.toString().isEmpty())
                out.append(token.value);
              else if (token.text != null && !token.text.isEmpty())
                out.append(token.text);
              else if (token.ch != 0)
                out.append(token.ch);
              break;
          }
      }
    }
    return out.toString();
  }

  public static String transODFFormulaToOOXML(String formulaString)
  {
    List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
    List<IDMFormulaToken> tokens = IDMFormulaLexer.parseq(formulaString, ferr, IDMFormulaLexer.LexFormulaType.FORMAT_ODF);
    StringBuffer out = new StringBuffer();
    for (int i = 0 ; i< tokens.size(); i++)
    {
      IDMFormulaToken token = tokens.get(i);
      if (token.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE)
      {
        // check 3d reference
        if (i < tokens.size() - 2 && 
            tokens.get(i+1).subType == IDMFormulaToken.TokenSubtype.OPERATOR_COLON &&
            tokens.get(i+2).type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE)
        {
          IDMFormulaParsedRef ref1 = (IDMFormulaParsedRef) (token.value);
          IDMFormulaParsedRef ref2 = (IDMFormulaParsedRef) (tokens.get(i+2).value);
          int mask1 = ref1.getRefMask();
          int mask2 = ref2.getRefMask();
          if ( (mask1 & IDMFormulaParsedRef.MASK_START_SHEET ) > 0 &&
               (mask2 & IDMFormulaParsedRef.MASK_START_SHEET ) > 0 &&
               (mask1 & IDMFormulaParsedRef.MASK_END_COLUMN ) == 0 &&
               (mask2 & IDMFormulaParsedRef.MASK_END_COLUMN ) == 0 &&
               (mask1 & IDMFormulaParsedRef.MASK_END_ROW ) == 0 && 
               (mask2 & IDMFormulaParsedRef.MASK_END_ROW ) == 0 )
          {
            // 3d reference
            String sheetname1 = ref1.getSheetName();
            String sheetname2 = ref2.getSheetName();
            String quotestr = "";
            if ( ((mask1 & IDMFormulaParsedRef.MASK_QUOTE_SHEETNAME) > 0) || ((mask2 & IDMFormulaParsedRef.MASK_QUOTE_SHEETNAME) > 0) )
              quotestr = "'";
            out.append(quotestr);
            String quotename1 = sheetname1.replaceAll("\'", "\'\'");
            out.append(quotename1);
            out.append(":");
            String quotename2 = sheetname2.replaceAll("\'", "\'\'");
            out.append(quotename2);
            out.append(quotestr);
            out.append("!");
            mask1 = mask1 & ~IDMFormulaParsedRef.MASK_OUTPUT_SHEETNAME;
            mask2 = mask2 & ~IDMFormulaParsedRef.MASK_OUTPUT_SHEETNAME;
            ref1.setRefMask(mask1);
            ref2.setRefMask(mask2);
            out.append(ref1.getAddress());
            out.append(":");
            out.append(ref2.getAddress());
            i = i + 2;
            continue;
          }
        }
        IDMFormulaParsedRef ref = (IDMFormulaParsedRef) (token.value);
        int mask = ref.getRefMask();
        mask = mask | IDMFormulaParsedRef.MASK_OOXML_FORMAT;
        ref.setRefMask(mask);
        out.append(ref.getAddress());
      }
      else if (token.type == IDMFormulaToken.LexTokenType.ERROR_TYPE || token.type == IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE)
      {
        if (token.text != null && !token.text.isEmpty())
          out.append(token.text);
      }
      else if (token.type == IDMFormulaToken.LexTokenType.STRING_TYPE)
      {
        out.append('\"');
        if (token.text != null && !token.text.isEmpty())
        {
          String outputtext = token.text.replaceAll("\"", "\"\"");
          out.append(outputtext);
        }
        out.append('\"');
      }
      else
      {
        switch (token.subType)
          {
            case SEPERATOR_ARGUMENTS :
              out.append(',');
              break;
            case SEPERATOR_ARRAY_COL :
              out.append(',');
              break;
            case SEPERATOR_ARRAY_ROW :
              out.append(';');
              break;
            case OPERATOR_INTERSECTION :
              out.append(' ');
              if (token.text != null && token.text.length() > 1)
              {
                out.append(token.text.substring(1));
              }
              break;
            case OPERATOR_UNION :
              out.append(',');
              break;
            default:
              if (token.value != null && !token.value.toString().isEmpty())
                out.append(token.value);
              else if (token.text != null && !token.text.isEmpty())
                out.append(token.text);
              else if (token.ch != 0)
                out.append(token.ch);
              break;
          }
      }
    }
    return out.toString();
  }

  public static List<IDMFormulaToken> ranges(String address, char sep)
  {
    List<IDMFormulaToken> ret = new ArrayList<IDMFormulaToken>();
    return ret;
  }

  public static IDMFormulaError errorInstanceByName(String errorName)
  {
    if (errorName.equalsIgnoreCase("#NULL!"))
    {
      return IDMFormulaError.IDMNULError;
    }
    else if (errorName.equalsIgnoreCase("#DIV/0!"))
    {
      return IDMFormulaError.IDMNULError;
    }
    else if (errorName.equalsIgnoreCase("#VALUE!"))
    {
      return IDMFormulaError.IDMVALError;
    }
    else if (errorName.equalsIgnoreCase("#REF!"))
    {
      return IDMFormulaError.IDMREFError;
    }
    else if (errorName.equalsIgnoreCase("#NAME?"))
    {
      return IDMFormulaError.IDMNAMError;
    }
    else if (errorName.equalsIgnoreCase("#NUM!"))
    {
      return IDMFormulaError.IDMNUMError;
    }
    else if (errorName.equalsIgnoreCase("#N/A"))
    {
      return IDMFormulaError.IDMNAError;
    }
    else if (errorName.equalsIgnoreCase("unparse"))
    {
      return IDMFormulaError.IDMUnParseError;
    }
    else if (errorName.equalsIgnoreCase(""))
    {
      return IDMFormulaError.IDMUnSupportError;
    }
    return null;
  };

  public static void main1(String[] args) throws Exception
  {
    List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
    String slot = "D:\\temp\\ka";
    {
      String f1 = "=SUM($'��! (2)'.AX$1:AZ$1048576; $'��!'.$A2:$AMJ8 (name1_unlocked;$'Default Values (2)'.H$1:H$1048576;G$1:G$1048576 ))";
      // String f = "=SUM((F$1:F$1048576~H$1:H$1048576~G$1:G$1048576);name1_unlocked)";
      String f = "=MIN(Sheet2.A1:Sheet2.B3:Sheet2.E5)";
      System.out.println("0) " + f);
      List<IDMFormulaToken> ret = IDMFormulaLexer.parseq(f, ferr, LexFormulaType.FORMAT_ODF);
      for (int i = 0; i < ret.size(); i++)
      {
        System.out.println(i + ")[" + ret.get(i).getOffset() + "] " + ret.get(i).getDescription());
      }
      if (ferr.size() > 0)
      {
        System.out.println("ferr: " + ferr.toString());
      }
    }
    if (true)
      return;
    long begintime = System.nanoTime();
    JsonFactory jf = new JsonFactory();
    JsonParser jp;
    jp = jf.createJsonParser(new File(slot, "content.js"));
    JsonToken jsonToken = jp.nextToken();
    int n = 0;
    int errn = 0;
    while (jsonToken != null)
    {
      if (jsonToken == JsonToken.FIELD_NAME)
      {
        // save the field_name token
        String fieldName = jp.getText();
        if (fieldName.equalsIgnoreCase("v"))
        {
          jsonToken = jp.nextToken();
          String f = jp.getText();
          if (f.startsWith("="))
          {
            ferr.clear();
            n++;
            // System.out.println(n+") "+f);
            List<IDMFormulaToken> ret = IDMFormulaLexer.parseq(f, ferr, LexFormulaType.FORMAT_ODF);
            // for (int i=0;i<ret.size();i++) {
            // System.out.println(i+") "+ret.get(i).getDescription());
            // }
            if (ferr.size() > 0)
              errn++;
          }
        }
      }
      jsonToken = jp.nextToken();
    }
    long endtime = System.nanoTime();
    System.out.println("total spend " + (endtime - begintime) / 1e9 + "s to process " + n + " fomulas with " + errn + " errors");

  }

  public static void checkOneFormula(String f) throws JsonParseException, IOException
  {
    System.out.println("  " + f);
    String ooxmlformula = IDMFormulaLexer.transODFFormulaToOOXML(f);
    System.out.println(" >" + ooxmlformula);
    String odfformula = IDMFormulaLexer.transOOXMLFormulaToODF(ooxmlformula);
    if (!f.equalsIgnoreCase(odfformula))
    {
      System.out.println("Error! formula not match > \n" + f + "\n" + odfformula);
    }
  }

  public static void checkFormula(File cltest) throws Exception
  {
    long begintime = System.nanoTime();
    List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
    JsonFactory jf = new JsonFactory();
    JsonParser jp;
    jp = jf.createJsonParser(cltest);
    JsonToken jsonToken = jp.nextToken();
    int n = 0;
    int errn = 0;
    while (jsonToken != null)
    {
      if (jsonToken == JsonToken.FIELD_NAME)
      {
        // save the field_name token
        String fieldName = jp.getText();
        if (fieldName.equalsIgnoreCase("v"))
        {
          jsonToken = jp.nextToken();
          String f = jp.getText();
          if (f.startsWith("="))
          {
            ferr.clear();
            n++;
            System.out.println(n + ") " + f);
            String ooxmlformula = IDMFormulaLexer.transODFFormulaToOOXML(f);
            System.out.println(n + ")>" + ooxmlformula);
            String odfformula = IDMFormulaLexer.transOOXMLFormulaToODF(ooxmlformula);
            if (!f.equalsIgnoreCase(odfformula))
            {
              System.out.println(n + ") Error! formula not match > " + odfformula + " - " + f);
              errn++;
              // Exception e = new Exception(" formula not match");
              // throw e;
            }
            // if (ferr.size() > 0)
            // errn++;
          }
        }
      }
      jsonToken = jp.nextToken();
    }
    long endtime = System.nanoTime();
    System.out.println("total spend " + (endtime - begintime) / 1e9 + "s to process " + n + " fomulas with " + errn + " errors");
  }

  public static void main(String[] args) throws Exception
  {
    // checkOneFormula("=((B23/SUM(Indicator_1))*W1_ + (C23/SUM(Indicator_2))*W2_) / (W1_ + W2_)");
    checkOneFormula("=SUM($Sheet1.B2:C4)");
     checkOneFormula("=SUM($Sheet1.B2:$Sheet2.C4)");
    // checkOneFormula("=ACOSH({9;8;4;0;-1})");
    // checkOneFormula("=ACOSH(a �С��� a)");
    // checkOneFormula("=ACOSH(�� �� ��)");
    String x = IDMFormulaLexer.transOOXMLFormulaToODF("=SUM('Sheet 1:Sheet 3'!A1:D3)");
    String y = IDMFormulaLexer.transODFFormulaToOOXML("=SUM('Sheet 1'.A1:'Sheet 3'.D3)");
    checkOneFormula("=IF(building=$Calcs.B6;\"Avg. # of bedrooms: \";\"# of bedrooms: \")");
    // checkOneFormula("(Sheet1.$A$1,Sheet1.$C$2)");
    String inputdir = "d:\\ut\\allxlsxsamples";
    // String inputdir = "C:\\work\\compare_output\\newdump\\html";

    String outputroot = "d:\\ut\\ooxmlformulatest";
    File inputroot = new File(inputdir);
    File[] files = inputroot.listFiles();
    for (int i = 0; i < files.length; i++)
    {
      // if (files[i].isDirectory())
      {
        String name = files[i].getName();
        if (name.contains("Verlauf_Integrationstest"))
          continue;
        if (!name.endsWith(".xlsx"))
          continue;
        File cloutputfile = new File(outputroot + "\\clout\\" + name + "_json");
        if (!cloutputfile.exists())
        {
          cloutputfile.mkdirs();
          long cltime = doCLTest(files[i], cloutputfile);
        }
        File cltest = new File(cloutputfile, "content.js");
        if (cltest.exists())
        {
          checkFormula(cltest);
        }
        else
        {
          System.out.println("convert " + name + " failed. " + cltest.getCanonicalPath() + " is not exists");
        }
        // File cloutputfile = new File(outputroot+"\\java\\"+name+".json");
      }
    }
  }

  public static long doCLTest(File input, File output)
  {
    long start = System.nanoTime();
    ProcessBuilder builder = new ProcessBuilder();
    builder.redirectErrorStream(true);
    List<String> commandParams = new ArrayList<String>();
    commandParams.add("D:\\temp\\ooxmlconvertor\\OOXMLConvertor.exe");
    commandParams.add(input.getAbsolutePath());
    commandParams.add(output.getAbsolutePath());
    commandParams.add("-DataPath=D:\\temp\\ooxmlconvertor\\data");
    commandParams.add("-FormatJSON=1");
    ProcessBuilder command = builder.command(commandParams);
    try
    {
      StringBuffer result = new StringBuffer();
      Process process = command.start();
      StreamPump inputPump = new StreamPump(result, process.getInputStream());
      StreamPump errorPump = new StreamPump(null, process.getErrorStream());
      inputPump.start();
      errorPump.start();
      int code = -1;
      code = process.waitFor();
      inputPump.join(5000);
      errorPump.join(5000);
      System.out.println("result: " + result.toString());
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    long loadtime = (System.nanoTime() - start) / 1000000;
    return loadtime;
  }

  public static class StreamPump extends Thread
  {
    StringBuffer stringBuffer = null;

    InputStream inputStream = null;

    public StreamPump(StringBuffer stringBuffer, InputStream inputStream)
    {
      this.stringBuffer = stringBuffer;
      this.inputStream = inputStream;
    }

    public void run()
    {
      InputStreamReader reader = null;
      try
      {
        reader = new InputStreamReader(inputStream, "utf-8");
        char[] buf = new char[32 * 1024];
        int count = 0;
        while ((count = reader.read(buf)) != -1)
        {
          // If we need collect the output
          stringBuffer.append(buf, 0, count);
        }
      }
      catch (IOException e)
      {
        // ignore.
      }
      finally
      {
        if (reader != null)
          try
          {
            reader.close();
          }
          catch (IOException e)
          {
            // ignore
          }
      }
    }
  };

}
