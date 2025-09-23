package com.ibm.concord.spreadsheet.document.model.rulesObject;

import java.util.ArrayList;
import java.util.List;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.Document;

public class ConditionalCriteria
{
  private static final Logger LOG = Logger.getLogger(ConditionalCriteria.class.getName());

  private JSONObject criteria = null;

  private List<RuleVal> cfvos;

  private int tokenPos = 0;

  private String type;

  private final String ABOVE_AVERAGE = "aboveAverage";

  private final String COLOR_SCALE = "colorScale";

  private final String DUPLICATE_VALUES = "duplicateValues";

  private final String UNIQUE_VALUES = "uniqueValues";

  private final String TOP10 = "top10";
  
  private final String ICONSET = "iconSet";
  
  private final String DATABAR = "dataBar";
  
  private final String TIMEPERIOD = "timePeriod";
  
  private final String TEXT = "text";

  public ConditionalCriteria(JSONObject content)
  {
    if (content == null)
    {
      LOG.log(Level.WARNING, "content to create conditional criteria is null!!!");
      return;
    }
    criteria = content;
    type = (String) criteria.get(ConversionConstant.TYPE);
    if (!criteria.containsKey(ConversionConstant.CFVOS))
      return;
    
    // TODO: check criteria and don't create ruleval for aboveaverage?
    cfvos = new ArrayList<RuleVal>();
    
    if (ABOVE_AVERAGE.equalsIgnoreCase(type) || TOP10.equalsIgnoreCase(type) || TIMEPERIOD.equalsIgnoreCase(type))
    	return;
    
    JSONArray cfvos = (JSONArray) criteria.get(ConversionConstant.CFVOS);
    int len = cfvos.size();
    for (int i = 0; i < len; i++)
    {
      JSONObject c = (JSONObject) cfvos.get(i);
      boolean notParse = false;
      if(TEXT.equalsIgnoreCase(type) && TEXT.equalsIgnoreCase((String) c.get(ConversionConstant.TYPE)))
    	  notParse = true;
      RuleVal val = notParse ? new RuleVal(null) : new RuleVal(c.get(ConversionConstant.VAL));
      this.cfvos.add(val);
    }
  }

  public ConditionalCriteria()
  {

  }

  protected ArrayList<FormulaToken> getTokenList(int tokenPos)
  {
    this.tokenPos = tokenPos;
    return getTokenList();
  }

  protected ArrayList<FormulaToken> getTokenList()
  {
    ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>();
    int size = cfvos != null ? cfvos.size() : 0;
    for (int i = 0; i < size; i++)
    {
      RuleVal v = cfvos.get(i);
      List<FormulaToken> list = v.getTokenArray();
      if (list != null)
      {
        tokenList.addAll(list);
      }
    }
    return tokenList;
  }

  protected ConditionalCriteria clone()
  {
    ConditionalCriteria ret = new ConditionalCriteria();
    try
    {
      ret.criteria = JSONObject.parse(criteria.toString());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "clone conditional criteria error!!!", e);
    }
    ret.tokenPos = tokenPos;
    int size = cfvos != null ? cfvos.size() : 0;
    if (size != 0)
    {
      List<RuleVal> newCfvos = new ArrayList<RuleVal>();
      for (int i = 0; i < size; i++)
        newCfvos.add(cfvos.get(i).clone());
      ret.cfvos = newCfvos;
    }
    return ret;
  }

  public JSONObject toJson(List<FormulaToken> tokenList, int deltaR, int deltaC, Document doc)
  {
    int size = cfvos != null ? cfvos.size() : 0;
    int idx = tokenPos;
    JSONArray cfvos = (JSONArray) criteria.get(ConversionConstant.CFVOS);
    for (int i = 0; i < size; i++)
    {
      RuleVal v = this.cfvos.get(i);
      if (!v.isFormula())
        continue;
      List<FormulaToken> list = v.getTokenArray();
      int l = list != null ? list.size() : 0;
      String val = v.updateFormula(tokenList.subList(idx, idx + l), deltaR, deltaC, doc);
      JSONObject c = (JSONObject) cfvos.get(i);
      c.put(ConversionConstant.VAL, val);
      idx += l;
    }

    return criteria;
  }

  public boolean isRangeBasedCriteria()
  {
    if (ABOVE_AVERAGE.equalsIgnoreCase(type) || COLOR_SCALE.equalsIgnoreCase(type) || DUPLICATE_VALUES.equalsIgnoreCase(type)
        || UNIQUE_VALUES.equalsIgnoreCase(type) || TOP10.equalsIgnoreCase(type) || ICONSET.equalsIgnoreCase(type) || DATABAR.equalsIgnoreCase(type))
    {
      return true;
    }
    return false;
  }
  
  public List<RuleVal> getCfvos()
  {
    return cfvos;
  }
}