package com.ibm.concord.spreadsheet.partialload.reference;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.util.TokenBuffer;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.partialload.AbstractJsonGeneratorListener;
import com.ibm.concord.spreadsheet.partialload.CellCollector;
import com.ibm.concord.spreadsheet.partialload.JSONObjectGenerator;
import com.ibm.concord.spreadsheet.partialload.JSONUtils;
import com.ibm.concord.spreadsheet.partialload.PartialDeserializer;
import com.ibm.concord.spreadsheet.partialload.RowColIdIndexMeta;
import com.ibm.concord.spreadsheet.partialload.SheetMeta;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * Class handling formula reference related functions, reads in reference.js in
 * Jackson partial. A Jackson version of FormulaReference and ReferenceUtil
 * class.
 */
public class PartialReference {
	private static final Logger LOG = Logger.getLogger(PartialReference.class
			.getName());

	private static Integer NEG_ONE = Integer.valueOf(-1);

	private JsonParser jsonParser;

	private Map<String, ReferenceStruct> referenceBySheetIdMap;

	private JSONObject partRefObject;

	private PartialDeserializer deserializer;

	private JSONArray vRefCells;

	private HashMap<String, JSONObject> vRefCache;

	public PartialReference(File referenceFile, JsonFactory jsonFactory)
			throws JsonParseException, IOException {
		this(new FileInputStream(referenceFile), jsonFactory);
	}

	/**
	 * This constructor reads in reference.js from InputStream, by using
	 * JsonParser.
	 * 
	 * @param referenceInputStream
	 * @param jsonFactory
	 * @throws IOException
	 * @throws JsonParseException
	 */
	public PartialReference(InputStream referenceInputStream,
			JsonFactory jsonFactory) throws JsonParseException, IOException {
		jsonParser = jsonFactory.createJsonParser(referenceInputStream);
		partRefObject = new JSONObject();
		vRefCache = new HashMap<String, JSONObject>();
	}

	public boolean isEmpty() throws JsonParseException, IOException {
		if (referenceBySheetIdMap == null) {
			load();
		}

		return referenceBySheetIdMap.isEmpty();
	}

	public void setPartialDeserializer(PartialDeserializer d) {
		this.deserializer = d;
	}

	/**
	 * Get reference object in reference.sheets.&lt;sheetId&gt;
	 * 
	 * @param sheetId
	 * @return
	 * @throws IOException
	 * @throws JsonParseException
	 */
	public JSONObject get(String sheetId) throws JsonParseException,
			IOException {
		if (referenceBySheetIdMap == null) {
			load();
		}

		ReferenceStruct s = referenceBySheetIdMap.get(sheetId);
		if (s == null) {
			return null;
		}

		JSONObject ret = s.referenceObject;

		if (ret != null) {
			return ret;
		}

		TokenBuffer buf = s.referenceTokenBuffer;
		JsonParser jp = buf.asParser();
		JSONObjectGenerator jg = new JSONObjectGenerator();
		vRefCells = new JSONArray();
		jg.addListener(new VirtualReferenceListener(this, jg));
		jg.writeStartObject();
		jp.nextToken();
		jg.copyCurrentStructure(jp);
		// If partContentObject == null, means PartialDeserializer is not
		// created and this get method is called by updateformula,not collect
		// reference.
		if (deserializer.partContentObject != null)
			parseVRefs();
		ret = jg.getRootObject();
		ret = (JSONObject) ret.get(sheetId);
		s.referenceObject = ret;

		return ret;
	}

	public boolean hasUnParsedVRefs() {
		if (vRefCells != null && vRefCells.size() > 0)
			return true;
		return false;
	}

	public void parseVRefs() throws JsonProcessingException, IOException {
		if (vRefCells != null) {
			int vRefLen = vRefCells.size();
			for (int j = 0; j < vRefLen; j++) {
				JSONObject o = (JSONObject) vRefCells.get(j);
				if (o.containsKey(ConversionConstant.FORMULACELL_REFERNCE_NAME)) {
					JSONArray tokensArray = (JSONArray) o
							.get(ConversionConstant.FORMULACELL_REFERNCE_NAME);
					int len = tokensArray.size();
					Set errIdxs = new HashSet();
					for (int i = 0; i < len; i++) {
						JSONObject token = (JSONObject) tokensArray.get(i);
						Set crStack = new HashSet();
						if (NEG_ONE.equals(token.get(ConversionConstant.INDEX))
								&& !token.containsKey(ConversionConstant.RANGE_ADDRESS)) {
							crStack.add(i);
							calculateVirtualReference(i, tokensArray, crStack, errIdxs);
						}
					}
				}
			}
			vRefCells.clear();
		}
	}
	
	private boolean calculateVirtualReference(int idx,
			JSONArray tokensArray, Set crStack, Set errIdxs) throws JsonProcessingException, IOException {		
		JSONObject token = (JSONObject) tokensArray.get(idx);
		int lIdx = Integer.parseInt(token.get(ConversionConstant.LEFTTOKENINDEX)
				.toString());
		int rIdx = Integer.parseInt(token.get(ConversionConstant.RIGHTTOKENINDEX)
				.toString());
		JSONObject lToken = (JSONObject) tokensArray.get(lIdx);
		JSONObject rToken = (JSONObject) tokensArray.get(rIdx);
		if (lToken != null && rToken != null
				&& !token.containsKey(ConversionConstant.RANGE_ADDRESS)) {
			boolean allNames = true;
			String text = "";

			String lRefType = (String) lToken.get(ConversionConstant.REFERENCE_TYPE);
			if (ConversionConstant.NAME_RANGE.equals(lRefType)) {
				String name = (String) lToken.get(ConversionConstant.NAMES_REFERENCE);

				lToken = deserializer.getNameRange(name);
				if (lToken == null) {
					LOG.log(Level.WARNING,
							"Did not find name range {0}, ignore.", name);

					return false;
				}
				text += name;
			} else {
				allNames = false;
				if (ConversionConstant.VIRTUAL_REFERENCE.equals(lRefType)
						&& !lToken.containsKey(ConversionConstant.RANGE_ADDRESS)) {
					if(errIdxs.contains(lIdx) || crStack.contains(lIdx))
					{						
						errIdxs.add(idx);
						LOG.log(Level.WARNING,
								"lIdx or rIdx error, idx {0}, tokenArray {1}, ignore.", new Object[]{idx, tokensArray});

						return false;
					}
					crStack.add(lIdx);
					if(!calculateVirtualReference(lIdx, tokensArray, crStack, errIdxs))
					{
						errIdxs.add(idx);
						crStack.remove(lIdx);
						return false;
					}
					crStack.remove(lIdx);
				}
			}
			text += ":";
			String rRefType = (String) rToken.get(ConversionConstant.REFERENCE_TYPE);
			if (ConversionConstant.NAME_RANGE.equals(rRefType)) {
				String name = (String) rToken.get(ConversionConstant.NAMES_REFERENCE);
				rToken = deserializer.getNameRange(name);
				if (rToken == null) {
					LOG.log(Level.WARNING,
							"Did not find name range {0}, ignore.", name);

					return false;
				}
				text += name;
			} else {
				allNames = false;
				if (ConversionConstant.VIRTUAL_REFERENCE.equals(rRefType)
						&& !rToken.containsKey(ConversionConstant.RANGE_ADDRESS)) {
					if(errIdxs.contains(rIdx) || crStack.contains(rIdx))
					{
						errIdxs.add(idx);
						LOG.log(Level.WARNING,
								"lIdx or rIdx error, idx {0}, tokenArray {1}, ignore.", new Object[]{idx, tokensArray});

						return false;
					}
					crStack.add(rIdx);
					if(!calculateVirtualReference(rIdx, tokensArray, crStack, errIdxs))
					{
						errIdxs.add(idx);
						crStack.remove(rIdx);
						return false;
					}
					crStack.remove(rIdx);
				}
			}
			if (allNames && vRefCache.containsKey(text)) {
				JSONObject cachedToken = vRefCache.get(text);
				token.put(ConversionConstant.RANGE_ADDRESS,
						cachedToken.get(ConversionConstant.RANGE_ADDRESS));
				token.put(ConversionConstant.RANGE_STARTROWID,
						cachedToken.get(ConversionConstant.RANGE_STARTROWID));
				token.put(ConversionConstant.RANGE_ENDROWID,
						cachedToken.get(ConversionConstant.RANGE_ENDROWID));
				token.put(ConversionConstant.RANGE_STARTCOLID,
						cachedToken.get(ConversionConstant.RANGE_STARTCOLID));
				token.put(ConversionConstant.RANGE_ENDCOLID,
						cachedToken.get(ConversionConstant.RANGE_ENDCOLID));
				token.put(ConversionConstant.SHEETID, cachedToken.get(ConversionConstant.SHEETID));
				return true;
			}
			if (lToken.containsKey(ConversionConstant.RANGE_ADDRESS)
					&& rToken.containsKey(ConversionConstant.RANGE_ADDRESS)) {
				generateReference(token, lToken, rToken);
				if (allNames && token.containsKey(ConversionConstant.RANGE_ADDRESS))
					vRefCache.put(text, token);
			}
			return true;
		}
		return true;
	}

	/**
	 * combine all the tokens with operator :(colon) to one range
	 * 
	 * @param left
	 * @param right
	 * @return
	 */
	private void generateReference(JSONObject token, JSONObject left,
			JSONObject right) {
		String sSheetId = (String) left.get(ConversionConstant.SHEETID);
		String eSheetId = (String) right.get(ConversionConstant.SHEETID);
		if (sSheetId == null || eSheetId == null) {
			LOG.log(Level.WARNING,
					"ignore cell reference without sheet id, {0}", left);
			LOG.log(Level.WARNING,
					"ignore cell reference without sheet id, {0}", right);
			return;
		}
		String sSheet = getSheetNameByID(sSheetId);
		String eSheet = getSheetNameByID(eSheetId);

		int startRowIndex1 = -1;
		int startColIndex1 = -1;
		int endRowIndex1 = -1;
		int endColIndex1 = -1;
		String refType = (String) left.get(ConversionConstant.REFERENCE_TYPE);
		if (ConversionConstant.REF_TYPE_CELL.equals(refType)) {
			startRowIndex1 = endRowIndex1 = deserializer.getIndexFromReference(
					left, ConversionConstant.ROWID_NAME);
			startColIndex1 = endColIndex1 = deserializer.getIndexFromReference(
					left, ConversionConstant.COLUMNID_NAME);
		} else {
			startRowIndex1 = deserializer.getIndexFromReference(left,
					ConversionConstant.RANGE_STARTROWID);
			startColIndex1 = deserializer.getIndexFromReference(left,
					ConversionConstant.RANGE_STARTCOLID);
			endRowIndex1 = deserializer.getIndexFromReference(left,
					ConversionConstant.RANGE_ENDROWID);
			endColIndex1 = deserializer.getIndexFromReference(left,
					ConversionConstant.RANGE_ENDCOLID);
		}
		// for the case that end row/column id not exists, back to cell
		// reference
		if (endRowIndex1 == deserializer.ID_IS_NULL) {
			endRowIndex1 = startRowIndex1;
		}
		if (endColIndex1 == deserializer.ID_IS_NULL) {
			endColIndex1 = startColIndex1;
		}

		if (startRowIndex1 == -1 || endRowIndex1 == -1 || startColIndex1 == -1
				|| endColIndex1 == -1
				|| startColIndex1 == deserializer.ID_IS_NULL
				|| startRowIndex1 == deserializer.ID_IS_NULL) {
			if (LOG.isLoggable(Level.INFO)) {
				LOG.log(Level.INFO,
						"range address ({0}, {1}):({2}, {3}) contains #REF!, ignore, original object: {4}",
						new Object[] { startRowIndex1, startColIndex1,
								endRowIndex1, endColIndex1, left });
			}
			return;
		}

		int startRowIndex2 = -1;
		int startColIndex2 = -1;
		int endRowIndex2 = -1;
		int endColIndex2 = -1;
		refType = (String) right.get(ConversionConstant.REFERENCE_TYPE);
		if (ConversionConstant.REF_TYPE_CELL.equals(refType)) {
			startRowIndex2 = endRowIndex2 = deserializer.getIndexFromReference(
					right, ConversionConstant.ROWID_NAME);
			startColIndex2 = endColIndex2 = deserializer.getIndexFromReference(
					right, ConversionConstant.COLUMNID_NAME);
		} else {
			startRowIndex2 = deserializer.getIndexFromReference(right,
					ConversionConstant.RANGE_STARTROWID);
			startColIndex2 = deserializer.getIndexFromReference(right,
					ConversionConstant.RANGE_STARTCOLID);
			endRowIndex2 = deserializer.getIndexFromReference(right,
					ConversionConstant.RANGE_ENDROWID);
			endColIndex2 = deserializer.getIndexFromReference(right,
					ConversionConstant.RANGE_ENDCOLID);
		}
		// for the case that end row/column id not exists, back to cell
		// reference
		if (endRowIndex2 == deserializer.ID_IS_NULL) {
			endRowIndex2 = startRowIndex2;
		}
		if (endColIndex2 == deserializer.ID_IS_NULL) {
			endColIndex2 = startColIndex2;
		}

		if (startRowIndex2 == -1 || endRowIndex2 == -1 || startColIndex2 == -1
				|| endColIndex2 == -1
				|| startColIndex2 == deserializer.ID_IS_NULL
				|| startRowIndex2 == deserializer.ID_IS_NULL) {
			if (LOG.isLoggable(Level.INFO)) {
				LOG.log(Level.INFO,
						"range address ({0}, {1}):({2}, {3}) contains #REF!, ignore, original object: {4}",
						new Object[] { startRowIndex2, startColIndex2,
								endRowIndex2, endColIndex2, right });
			}
			return;
		}

		int startCol = Math.min(startColIndex1, startColIndex2);
		int startRow = Math.min(startRowIndex1, startRowIndex2);
		int endCol = Math.max(endColIndex1, endColIndex2);
		int endRow = Math.max(endRowIndex1, endRowIndex2);

		String address = "";
		if (sSheet != null) {
			sSheet = ReferenceParser.formatSheetName(sSheet);
			address += sSheet;
			address += ".";
		}
		address += ReferenceParser.translateCol(startCol) + startRow + ":";
		if (eSheet != null) {
			eSheet = ReferenceParser.formatSheetName(eSheet);
			address += eSheet;
			address += ".";
		}
		address += ReferenceParser.translateCol(endCol) + endRow;

		token.put(ConversionConstant.RANGE_ADDRESS, address);
		token.put(ConversionConstant.RANGE_STARTROWID, deserializer.rowColIdIndexMeta
				.getRowIdbyIndex(sSheetId, startRow));
		token.put(ConversionConstant.RANGE_ENDROWID, deserializer.rowColIdIndexMeta
				.getRowIdbyIndex(eSheetId, endRow));
		token.put(ConversionConstant.RANGE_STARTCOLID, deserializer.rowColIdIndexMeta
				.getColIdbyIndex(sSheetId, startCol));
		token.put(ConversionConstant.RANGE_ENDCOLID, deserializer.rowColIdIndexMeta
				.getColIdbyIndex(eSheetId, endCol));
		token.put(ConversionConstant.SHEETID, sSheetId);
	}

	private String getSheetNameByID(String sheetId) {
		JSONObject sheets = (JSONObject) deserializer.metaObject
				.get(ConversionConstant.SHEETS);
		Iterator<Map.Entry<String, JSONObject>> itor = sheets.entrySet()
				.iterator();
		while (itor.hasNext()) {
			Map.Entry<String, JSONObject> entry = itor.next();
			String id = entry.getKey();
			if (id.equals(sheetId)) {
				JSONObject sheet = entry.getValue();
				return (String) sheet.get(ConversionConstant.SHEETNAME);
			}
		}
		return null;
	}

	public JSONArray get(String sheetId, String rowId, String colId)
			throws JsonParseException, IOException {
		JSONObject o = get(sheetId);

		Object[] ret = JSONUtils.findPath(o, new String[] { rowId, colId,
				ConversionConstant.CELLS });

		return (JSONArray) ret[2];
	}

	/**
	 * Copied from FormulaReference.
	 * 
	 * @param sheetId
	 * @param rowId
	 * @param columnId
	 * @param formula
	 * @param rowColIdIndexMeta
	 * @param sheetMeta
	 * @return
	 * @throws JsonParseException
	 * @throws IOException
	 */
	public String updateFormula(String sheetId, String rowId, String columnId,
			String formula, RowColIdIndexMeta rowColIdIndexMeta,
			SheetMeta sheetMeta) throws JsonParseException, IOException {
		int copyStartIndex = 0;
		int length = formula.length();
		StringBuffer updatedFormula = new StringBuffer();
		JSONArray refJSONArray = get(sheetId, rowId, columnId);
		if (refJSONArray != null) {
			// sort formula token array by token index
			Object[] sortRefArray = ReferenceUtil.sort(refJSONArray.toArray(),
					ConversionConstant.FORMULA_TOKEN_INDEX, true);

			for (int i = 0; i < sortRefArray.length; i++) {
				try {
					JSONObject tokenJSON = (JSONObject) sortRefArray[i];
					// copy part of the formula which does not related with the
					// tokens
					int tokenIndex = Integer.parseInt(tokenJSON.get(
							ConversionConstant.FORMULA_TOKEN_INDEX).toString());
					String tokenType = tokenJSON.get(ConversionConstant.REFERENCE_TYPE)
							.toString();
					// process the virtual reference
					if (tokenIndex < 0) {
						// just need to update the virtual reference address;
						if ((tokenType.equals(ConversionConstant.CELL_REFERENCE))
								|| (tokenType.equals(ConversionConstant.RANGE_REFERENCE))) {
							ReferenceUtil.updateRangeAddressWhenFlush2Doc(
									tokenJSON, rowColIdIndexMeta, sheetMeta);
						}
						continue;
					}
					updatedFormula.append(formula.substring(copyStartIndex,
							tokenIndex));

					// get cell address by cell id
					String tokenAddress = "";
					String updatedTokenAddress = "";
					// TODO: get absolute or relative cell address by the text
					// of token
					if ((tokenType.equals(ConversionConstant.CELL_REFERENCE))
							|| (tokenType.equals(ConversionConstant.RANGE_REFERENCE))) {
						tokenAddress = (String) tokenJSON
								.get(ConversionConstant.RANGE_ADDRESS);
						updatedTokenAddress = ReferenceUtil
								.updateRangeAddressWhenFlush2Doc(tokenJSON,
										rowColIdIndexMeta, sheetMeta);
					} else if (tokenType.equals(ConversionConstant.NAMES_REFERENCE)) {
						tokenAddress = (String) tokenJSON
								.get(ConversionConstant.NAME_RANGE);
						updatedTokenAddress = tokenAddress;
					}
					// copy the updated tokens to the updatedFormula
					copyStartIndex = tokenIndex + tokenAddress.length();
					String oldToken = tokenAddress;
					if (copyStartIndex >= length)
						oldToken = formula.substring(tokenIndex);
					else
						oldToken = formula
								.substring(tokenIndex, copyStartIndex);
					if (oldToken.equals(tokenAddress)) {
						int updateTokenIndex = updatedFormula.length();
						updatedFormula.append(updatedTokenAddress);
						// also update the reference model with new token
						// address and token index
						tokenJSON.put(ConversionConstant.RANGE_ADDRESS,
								updatedTokenAddress);
						tokenJSON.put(ConversionConstant.FORMULA_TOKEN_INDEX,
								updateTokenIndex);
					} else {
						LOG.log(Level.WARNING,
								"=============the cell at < sheetId :"
										+ sheetId
										+ " rowId : "
										+ rowId
										+ " columnId : "
										+ columnId
										+ " > has the formula + "
										+ formula
										+ " which does not contain the cell address "
										+ tokenAddress);
					}
				} catch (Exception e) {
					LOG.log(Level.WARNING,
							"error occurred when update the formula by the token",
							e);
				}
			}
		}
		// copy the end part of the original formula to the updatedFormula
		if (copyStartIndex < formula.length())
			updatedFormula.append(formula.substring(copyStartIndex));
		return updatedFormula.toString();
	}

	/**
	 * Collect impact cells of sheet "sheetId". It only collects 1st level
	 * impact cells, the collected cells' reference is not collected.
	 * 
	 * @param criteriaRowIdSet
	 * 
	 * @param sheetId
	 * @param cellCollector
	 *            the referenced cells collected
	 * @return
	 * @throws IOException
	 * @throws JsonParseException
	 */
	public CellCollector collectImpactCells(String criteriaSheetId,
			Set<String> criteriaRowIdSet, CellCollector cellCollector,
			PartialDeserializer d) throws JsonParseException, IOException {
		CellCollector impactCellCollector = new CellCollector();
		Set<Map.Entry<String, ReferenceStruct>> entries = referenceBySheetIdMap
				.entrySet();
		boolean sheetCollected, rowCollected, cellCollected;
		String sheetId, rowId, columnId;

		JSONArray impactRef = new JSONArray();
		boolean bCollect = false;
		String refSheetId = null;
		String refStartRowId = null;
		String refEndRowId = null;
		String refStartColId = null;
		String refEndColId = null;
		String refRowId = null;
		String refColId = null;
		String refType = null;
		String refAddr = null;
		String refName = null;
		int refIndex = -1;

		Set<String> nameSet = d.getNameRangeSet();

		for (Iterator iterator = entries.iterator(); iterator.hasNext();) {
			Entry<String, ReferenceStruct> entry = (Entry<String, ReferenceStruct>) iterator
					.next();
			sheetId = entry.getKey();
			if (sheetId.equals(criteriaSheetId)) {
				continue;
			}
			TokenBuffer referenceTokenBuffer = entry.getValue().referenceTokenBuffer;
			JsonParser jp = referenceTokenBuffer.asParser();
			JsonToken jt = jp.nextToken();
			ReferenceState state = ReferenceState.START;
			sheetCollected = cellCollector.lookingSheet(sheetId);
			rowCollected = false;
			cellCollected = false;
			rowId = null;
			columnId = null;

			// state machine processing reference JSON, detailed def refer to
			// project wiki.
			while (jt != null) {
				switch (state) {
				case START:
					if (jt == JsonToken.FIELD_NAME) {
						state = ReferenceState.SHEET_ID;
					}
					break;
				case SHEET_ID:
					if (jt == JsonToken.FIELD_NAME) {
						state = ReferenceState.ROW_ID;
						rowId = jp.getCurrentName();
						if (sheetCollected) {
							rowCollected = cellCollector.lookingRow(rowId);
						}
					}
					break;
				case ROW_ID:
					if (jt == JsonToken.FIELD_NAME) {
						columnId = jp.getCurrentName();
						if (sheetCollected && rowCollected) {
							cellCollected = cellCollector.lookingCell(columnId);
							if (cellCollected) {
								// the cell in the reference is already
								// collected during reference collecting phase,
								// skip this part
								jp.nextToken();
								jp.skipChildren();
							} else {
								state = ReferenceState.COLUMN_ID;
							}
						} else {
							state = ReferenceState.COLUMN_ID;
						}
					} else if (jt == JsonToken.END_OBJECT) {
						state = ReferenceState.SHEET_ID;
					}
					break;
				case COLUMN_ID:
					if (jt == JsonToken.START_ARRAY) {
						impactRef = new JSONArray();
						bCollect = false;
						state = ReferenceState.ARRAY;
					} else if (jt == JsonToken.END_OBJECT) {
						state = ReferenceState.ROW_ID;
					}

					break;
				case ARRAY:
					if (jt == JsonToken.START_OBJECT) {
						refSheetId = null;
						refStartRowId = null;
						refEndRowId = null;
						refStartColId = null;
						refEndColId = null;
						refRowId = null;
						refColId = null;
						refType = null;
						refAddr = null;
						refIndex = -1;
						refName = null;
						state = ReferenceState.OBJECT;
					} else if (jt == JsonToken.END_ARRAY) {
						if (bCollect) {
							writeRefs(impactRef, sheetId, rowId, columnId);
						}
						state = ReferenceState.COLUMN_ID;
					}
					break;
				case OBJECT:
					if (jt == JsonToken.END_OBJECT) {
						if (rowId != null && columnId != null) {
							boolean collect = false;

							if (refName != null && nameSet.contains(refName)) {
							  // collect = true;
							  collect = false;  // do not collect name range
							} else {
								if (criteriaRowIdSet == null
										|| PartialDeserializer.IGNORE_IMPACT_CELLS_IN_CRITERIA_SHEET) {
									if (refSheetId != null
											&& refSheetId
													.equals(criteriaSheetId)) {
										collect = true;
									}
								} else {
									if (refStartRowId != null
											&& criteriaRowIdSet
													.contains(refStartRowId)) {
										collect = true;
									} else if (refRowId != null
											&& criteriaRowIdSet
													.contains(refRowId)) {
										collect = true;
									}
								}
							}

							if (collect) {
								bCollect = true;
								d.updatePartSheetsArray(sheetId, rowId,
										columnId, -1, -1);
								impactCellCollector.collectCell(sheetId, rowId,
										columnId);
							}
						}

						// collect the references of the impact cells
						if (refIndex > -1 &&
						    // do not pick up name range
						    !refType.equals(ConversionConstant.NAMES_REFERENCE)
						) {
							JSONObject ref = new JSONObject();
							ref.put(ConversionConstant.REFERENCE_TYPE, refType);
							ref.put(ConversionConstant.FORMULA_TOKEN_INDEX, refIndex);
							if (refType.equals(ConversionConstant.CELL_REFERENCE)) {
								ref.put(ConversionConstant.RANGE_ADDRESS, refAddr);
								ref.put(ConversionConstant.SHEETID, refSheetId);
								ref.put(ConversionConstant.ROWID_NAME, refRowId);
								ref.put(ConversionConstant.COLUMNID_NAME, refColId);
							} else if (refType
									.equals(ConversionConstant.RANGE_REFERENCE)) {
								ref.put(ConversionConstant.RANGE_ADDRESS, refAddr);
								ref.put(ConversionConstant.SHEETID, refSheetId);
								ref.put(ConversionConstant.RANGE_STARTROWID,
										refStartRowId);
								ref.put(ConversionConstant.RANGE_STARTCOLID,
										refStartColId);
								ref.put(ConversionConstant.RANGE_ENDROWID, refEndRowId);
								ref.put(ConversionConstant.RANGE_ENDCOLID, refEndColId);
							} else if (refType
									.equals(ConversionConstant.NAMES_REFERENCE)) {
								ref.put(ConversionConstant.NAME_RANGE, refName);
							}
							impactRef.add(ref);
						}

						state = ReferenceState.ARRAY;
					} else if (jt == JsonToken.FIELD_NAME) {
						String name = jp.getCurrentName();
						if (name.equals(ConversionConstant.SHEETID))
							state = ReferenceState.REF_SHEET_ID;
						else if (name.equals(ConversionConstant.ROWID_NAME))
							state = ReferenceState.REF_ROW_ID;
						else if (name.equals(ConversionConstant.COLUMNID_NAME))
							state = ReferenceState.REF_COL_ID;
						else if (name.equals(ConversionConstant.RANGE_STARTROWID))
							state = ReferenceState.REF_START_ROW_ID;
						else if (name.equals(ConversionConstant.RANGE_ENDROWID))
							state = ReferenceState.REF_END_ROW_ID;
						else if (name.equals(ConversionConstant.RANGE_STARTCOLID))
							state = ReferenceState.REF_START_COL_ID;
						else if (name.equals(ConversionConstant.RANGE_ENDCOLID))
							state = ReferenceState.REF_END_COL_ID;
						else if (name.equals(ConversionConstant.RANGE_ADDRESS))
							state = ReferenceState.REF_ADDRESS;
						else if (name.equals(ConversionConstant.FORMULA_TOKEN_INDEX))
							state = ReferenceState.REF_INDEX;
						else if (name.equals(ConversionConstant.REFERENCE_TYPE))
							state = ReferenceState.REF_TYPE;
						else if (name.equals(ConversionConstant.NAMES_REFERENCE))
							state = ReferenceState.REF_NAME;
					}
					break;
				case REF_SHEET_ID:
					if (jt == JsonToken.VALUE_STRING)
						refSheetId = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_ROW_ID:
					if (jt == JsonToken.VALUE_STRING)
						refRowId = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_COL_ID:
					if (jt == JsonToken.VALUE_STRING)
						refColId = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_START_ROW_ID:
					if (jt == JsonToken.VALUE_STRING)
						refStartRowId = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_START_COL_ID:
					if (jt == JsonToken.VALUE_STRING)
						refStartColId = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_END_ROW_ID:
					if (jt == JsonToken.VALUE_STRING)
						refEndRowId = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_END_COL_ID:
					if (jt == JsonToken.VALUE_STRING)
						refEndColId = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_ADDRESS:
					if (jt == JsonToken.VALUE_STRING)
						refAddr = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_INDEX:
					if (jt == JsonToken.VALUE_NUMBER_INT)
						refIndex = jp.getIntValue();
					state = ReferenceState.OBJECT;
					break;
				case REF_TYPE:
					if (jt == JsonToken.VALUE_STRING)
						refType = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				case REF_NAME:
					if (jt == JsonToken.VALUE_STRING)
						refName = jp.getText();
					state = ReferenceState.OBJECT;
					break;
				default:
					// never here
					;
				}
				jt = jp.nextToken();
			}
		}

		return impactCellCollector;
	}

	/**
	 * partialRefObject is the partial reference json object corresponding to
	 * the formula cell in the partial content
	 * 
	 * @param obj
	 */
	public JSONObject getPartRefObj() {
		return partRefObject;
	}

	public void resetPartReferenceObject() {
		partRefObject = new JSONObject();
	}

	public void writeReference(String refSheetId, String refRowId,
			String refColId, JSONObject referenceObject) {
		JSONObject sheet = (JSONObject) partRefObject.get(refSheetId);
		if (sheet == null) {
			sheet = new JSONObject();
			partRefObject.put(refSheetId, sheet);
		}
		JSONObject row = (JSONObject) sheet.get(refRowId);
		if (row == null) {
			row = new JSONObject();
			sheet.put(refRowId, row);
		}
		JSONObject cell = (JSONObject) row.get(refColId);
		if (cell == null) {
			cell = new JSONObject();
			row.put(refColId, cell);
		}
		JSONArray refs = (JSONArray) cell.get(ConversionConstant.CELLS);
		if (refs == null) {
			refs = new JSONArray();
			cell.put(ConversionConstant.CELLS, refs);
		}
		refs.add(referenceObject);
	}

	public void writeRefs(JSONArray referenceArray, String shId, String roId,
			String coId) {
		JSONObject sheet = (JSONObject) partRefObject.get(shId);
		if (sheet == null) {
			sheet = new JSONObject();
			partRefObject.put(shId, sheet);
		}
		JSONObject row = (JSONObject) sheet.get(roId);
		if (row == null) {
			row = new JSONObject();
			sheet.put(roId, row);
		}
		JSONObject cell = new JSONObject();
		cell.put(ConversionConstant.CELLS, referenceArray);
		row.put(coId, cell);
	}

	private void load() throws JsonParseException, IOException {
		if (referenceBySheetIdMap != null) {
			return;
		}

		referenceBySheetIdMap = new HashMap<String, PartialReference.ReferenceStruct>();
		// reference structure is { "sheets" : { <sheetId> : { ... } } }
		// -> START_OBJECT -> (token is proceeding and we stop at first
		// START_OBJECT)
		jsonParser.nextToken();
		// -> "sheets" ->
		jsonParser.nextToken();
		// -> START_OBJECT ->
		jsonParser.nextToken();
		// -> <sheetId> ->
		jsonParser.nextToken();

		JsonToken token = jsonParser.getCurrentToken();
		while (token != null && token != JsonToken.END_OBJECT) {
			String sheetId = jsonParser.getCurrentName();

			TokenBuffer buf = new TokenBuffer(null);
			buf.copyCurrentStructure(jsonParser);
			ReferenceStruct s = new ReferenceStruct();
			s.referenceTokenBuffer = buf;

			referenceBySheetIdMap.put(sheetId, s);

			// -> <sheetId> -> OR -> END_OBJECT ->
			token = jsonParser.nextToken();
		}
	}

	private class ReferenceStruct {
		public TokenBuffer referenceTokenBuffer;

		public JSONObject referenceObject;
	}

	private static enum ReferenceState {
		START, SHEET_ID, ROW_ID, COLUMN_ID, ARRAY, OBJECT, REF_SHEET_ID, REF_ROW_ID, REF_COL_ID, REF_START_ROW_ID, REF_START_COL_ID, REF_END_ROW_ID, REF_END_COL_ID, REF_INDEX, REF_TYPE, REF_ADDRESS, REF_NAME, OBJECT_DONE
	};

	private static class VirtualReferenceListener extends
			AbstractJsonGeneratorListener {
		private enum State {
			ROW_ID, COLUMN_ID, CELLS, INDEX, INCELL
		};

		private State state;

		private boolean isVirtualReference;

		private static Integer NEG_ONE = Integer.valueOf(-1);

		private JSONObjectGenerator generator;

		private PartialReference partialReference;

		public VirtualReferenceListener(PartialReference partialReference,
				JSONObjectGenerator g) {
			generator = g;
			this.partialReference = partialReference;
		}

		@Override
		public void onFieldName(String name) {
			if (state == null) {
				state = State.ROW_ID;
			} else {
				switch (state) {
				case ROW_ID:
					state = State.COLUMN_ID;
					break;
				case COLUMN_ID:
					state = State.CELLS;
					isVirtualReference = false;
					break;
				case CELLS:
					if (name.equals(ConversionConstant.INDEX)) {
						state = State.INDEX;
					}
					break;
				default:
					break;
				}
			}

			super.onFieldName(name);
		}

		@Override
		public void onEndObject() {
			if (state != null) {
				switch (state) {
				case INDEX:
				case INCELL:
					state = State.CELLS;
					break;
				case CELLS:
					if (isVirtualReference) {
						JSONObject o = (JSONObject) generator
								.getCurrentObject();
						partialReference.vRefCells.add(o);
					}
					state = State.ROW_ID;
					break;
				case COLUMN_ID:
					state = State.ROW_ID;
					break;
				case ROW_ID:
					state = null;
					break;
				default:
					break;
				}
			}
		}

		@Override
		public void onWriteNumber(Number n) {
			if (state == State.INDEX) {
				isVirtualReference = isVirtualReference || NEG_ONE.equals(n);
				state = State.INCELL;
			}
		}
	}
}
