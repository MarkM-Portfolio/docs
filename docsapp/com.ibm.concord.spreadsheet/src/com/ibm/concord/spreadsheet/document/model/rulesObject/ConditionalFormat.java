package com.ibm.concord.spreadsheet.document.model.rulesObject;

import java.util.ArrayList;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4CF;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4RulesObj;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import java.util.List;

public class ConditionalFormat extends RulesObj
{
  private static final Logger LOG = Logger.getLogger(ConditionalFormat.class.getName());

  private JSONObject data = null;

  private List<ConditionalCriteria> criterias;

  public ConditionalFormat(SharedFormulaRef4CF area, Document doc)
  {
    super(area, doc);
    usage = RangeUsage.CONDITIONAL_FORMAT;
  }

  public ConditionalFormat(SharedFormulaRef4CF area, Document doc, JSONObject content)
  {
    super(area, doc);
    usage = RangeUsage.CONDITIONAL_FORMAT;
    if (content == null)
    {
      LOG.log(Level.WARNING, "content to create conditional format is null!!!");
      return;
    }
    data = content;

    criterias = new ArrayList<ConditionalCriteria>();
    JSONArray criterias = (JSONArray) data.get(ConversionConstant.CRITERIAS);
    int len = criterias.size();
    for (int i = 0; i < len; i++)
    {
      ConditionalCriteria criteria = new ConditionalCriteria((JSONObject) criterias.get(i));
      this.criterias.add(criteria);
    }
  }

  public ConditionalFormat createNewInstance(SharedFormulaRef4RulesObj range, ArrayList<FormulaToken> refTokens)
  {
    ConditionalFormat conditionalFormat = new ConditionalFormat((SharedFormulaRef4CF) range, doc);
    conditionalFormat.data = (JSONObject) data.clone();
    int size = criterias != null ? criterias.size() : 0;
    if (size != 0)
    {
      List<ConditionalCriteria> newCriterias = new ArrayList<ConditionalCriteria>();
      for (int i = 0; i < size; i++)
      {
        newCriterias.add(criterias.get(i).clone());
      }
      conditionalFormat.criterias = newCriterias;
    }

    conditionalFormat.topRow = range.getStartRow();
    conditionalFormat.leftCol = range.getStartCol();

    return conditionalFormat;
  }

  protected List<FormulaToken> getTokenList(boolean setTokenPos)
  {
    int idx = 0;
    ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>();
    int size = criterias != null ? criterias.size() : 0;
    for (int i = 0; i < size; i++)
    {
      List<FormulaToken> list = setTokenPos ? criterias.get(i).getTokenList(idx) : criterias.get(i).getTokenList();
      tokenList.addAll(list);
      idx += list.size();
    }
    return tokenList;
  }

  protected List<FormulaToken> getTokenList()
  {
    return getTokenList(false);
  }

  public JSONObject toJson()
  {
    int rangeNum = ranges.size();
    SharedFormulaRef4RulesObj range = ranges.get(0);
    if (!range.isValid()) {
    	return data;
    }
    int deltaR = 0;
    int deltaC = 0;
    if (rangeNum > 1)
    {
      parseBaseRef();
      deltaR = range.getStartRow() - topRow;
      deltaC = range.getStartCol() - leftCol;
    }

    List<FormulaToken> tokenList = range.getTokenList();
    int size = criterias != null ? criterias.size() : 0;
    if (size != 0)
    {
      JSONArray criteriasJson = new JSONArray();
      for (int i = 0; i < size; i++)
        criteriasJson.add(criterias.get(i).toJson(tokenList, deltaR, deltaC, doc));
      data.put(ConversionConstant.CRITERIAS, criteriasJson);
    }

    return data;
  }

  public boolean isSplitable(boolean bRow)
  {
    for (int i = 0; i < criterias.size(); i++)
    {
      ConditionalCriteria crt = criterias.get(i);
      if (crt.isRangeBasedCriteria())
      {
        continue;
      }
      List<RuleVal> list = crt.getCfvos();
      if (list != null)
      {
        for (int j = 0; j < list.size(); j++)
        {
            if (bRow){
          	  if (list.get(j).isRelativeRow()) {
          		  return true;
          	  }
            } else {
          	  if (list.get(j).isRelativeColumn()) {
          		  return true;
          	  }
            }
        }
      }
    }
    return false;
  }
}