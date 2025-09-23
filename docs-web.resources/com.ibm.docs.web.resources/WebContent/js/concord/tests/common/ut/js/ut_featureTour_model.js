/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.tests.common.ut.js.ut_featureTour_model");

dojo.require("concord.feature.FeatureDlg");

describe("concord.tests.common.ut.js.featureTour_model", function()
{	
	var fUrl = "../data/json/feature.json";
	window.contextPath = "/docs";
	window.g_bidiOn = false;
	window.g_locale = "en_US";
	
	concord.feature.FeatureController = {};
	concord.feature.FeatureController.getPosition = function(featureID)
	{
		if (featureID == "COMMON_COEDIT")
		{
			return {x: 100, y: 120, tr: true};
		}
		return {x: 100, y: 120};
	};
	
	concord.feature.FeatureController.getFeatureSettingKey = function()
	{
		return "feature_1.3.3";
	};
	
	concord.feature.FeatureController.afterShown = function()
	{
		
	};
	
	beforeEach(function()
	{
		;
	});

	afterEach(function()
	{
		;
	});
	
	it("Loading feature Data(ajax)...", function()
	{
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {
				expect(data).not.toBe(null);
			},
			error: function(error) {
				expect(error).toBe(null); 
			}			
		});
	});	
	
	it("Parsing Presentation Data...", function()
	{	
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {	
				expect(data).not.toBe(null);
				var fdata = data.pres;
				expect(fdata).not.toBe(null);
				var features = fdata.feature;
				expect(features.length).toBe(2);
				
				expect(features[0].versionID).toEqual("1.3.3");
				var featureIDs = features[0].featureIDs;
				expect(featureIDs.length).toBe(5);
				expect(featureIDs).toEqual("[\"PRES_Sorter\",\"PRES_Zoom\",\"PRES_Download\",\"PRES_Toolbar\",\"PRES_Shape\"]");
				
				expect(features[1].versionID).toEqual("1.3.6");
				featureIDs = features[1].featureIDs;
				expect(featureIDs.length).toBe(4);
				expect(featureIDs).toEqual("[\"PRES_NINE_NEW_SHAPE\",\"PRES_HYPERLINK\",\"PRES_LINESPACE\",\"PRES_COMMENTS_ROUNDTRIP\"]");
			},
			error: function(error) {
				expect(error).toBe(null); 
			}			
		});		
	});
	
	it("Parsing Text Data...", function()
	{	
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {	
				expect(data).not.toBe(null);
				var fdata = data.pres;
				expect(fdata).not.toBe(null);
				var features = fdata.feature;
				expect(features.length).toBe(2);
				
				expect(features[0].versionID).toEqual("1.3.3");
				var featureIDs = features[0].featureIDs;
				expect(featureIDs.length).toBe(3);
				expect(featureIDs).toEqual("[\"TEXT_FormatPainter\",\"TEXT_DOWNLOAD\",\"TEXT_ClearFormat\"]");
				
				expect(features[1].versionID).toEqual("1.3.6");
				featureIDs = features[1].featureIDs;
				expect(featureIDs.length).toBe(1);
				expect(featureIDs).toEqual("[\"CREATE_BOOKMARK\"]");
			},
			error: function(error) {
				expect(error).toBe(null); 
			}			
		});		
	});
	
	it("Parsing SpreadSheet Data...", function()
	{	
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {	
				expect(data).not.toBe(null);
				var fdata = data.pres;
				expect(fdata).not.toBe(null);
				var features = fdata.feature;
				expect(features.length).toBe(2);
				
				expect(features[0].versionID).toEqual("1.3.3");
				var featureIDs = features[0].featureIDs;
				expect(featureIDs.length).toBe(2);
				expect(featureIDs).toEqual("[\"SHEET_NEW_FORMULA\",\"SHEET_DOWNLOAD\"]");
				
				expect(features[1].versionID).toEqual("1.3.6");
				featureIDs = features[1].featureIDs;
				expect(featureIDs.length).toBe(2);
				expect(featureIDs).toEqual("[\"SHEET_NEW_MORECOLUMNS\", \"SHEET_NEW_VERTICALMERGE\"]");
			},
			error: function(error) {
				expect(error).toBe(null); 
			}			
		});		
	});
	
	it("Create New Feature Tour...", function()
	{
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {	
				var fdata = data.pres;
				var features = fdata.feature;		
				expect(features[1].versionID).toEqual("1.3.6");
				featureIDs = features[1].featureIDs;
				var tmpNode = document.createElement("div");
				var featureDlg = null;
				try {					
					featureDlg = new concord.feature.FeatureDlg({id:"pFeature_"+ new Date().getTime(), featureIDs: featureIDs},tmpNode);
					expect(featureDlg).not.toBe(null);
				}
				catch(ex)
				{
					expect(featureDlg).not.toBe(null);
				}	
			},
			error: function(error) {
				expect(error).toBe(null); 
			}			
		});			
	});
	
});
