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

dojo.provide("concord.tests.common.ut.js.ut_newUserTour");

dojo.require("concord.feature.NewUserTourDlg");
dojo.require("concord.feature.WelcomeDlg");

describe("concord.tests.common.ut.js.newUserTour", function()
{	
	var fUrl = "../data/json/new_user_tour.json";
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
	
	pe = {};
	pe.settings = {};
	pe.settings.setShowWelcome = function()
	{
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
	
	it("Create dimmer...", function()
			{
				var dimmer = new concord.widgets.dimmer();
				var visible = dimmer.isShown();
				expect(visible).toBe(false);
				dimmer.show();		
				visible = dimmer.isShown();
				expect(visible).toBe(true);	
				dimmer.hide();
				visible = dimmer.isShown();
				expect(visible).toBe(false);					
			});
	
	it("Create welcome dialog for Document...", function()
	{
		var tmpNode = document.createElement("div");
		var dlg = new concord.feature.WelcomeDlg({id:"pWelcome_"+ new Date().getTime(), docType: "text"},tmpNode);
		var visible = dlg.isShown();
		expect(visible).toBe(false);
		dlg._show();		
		visible = dlg.isShown();
		expect(visible).toBe(true);	
		
		var event = {};
		event.target = dlg.leftBtnNode;
		dlg._onclick(event);		
		visible = dlg.isShown();
		expect(visible).toBe(false);					
	});
	
	it("Create welcome dialog for Presentation...", function()
	{
		var tmpNode = document.createElement("div");
		var dlg = new concord.feature.WelcomeDlg({id:"pWelcome_"+ new Date().getTime(), docType: "pres"},tmpNode);
		var visible = dlg.isShown();
		expect(visible).toBe(false);
		dlg._show();
		visible = dlg.isShown();
		expect(visible).toBe(true);
		var e = {};
		e.keyCode = 13;
		e.target = dlg.rightBtnNode;
		dlg._onKeyDown(e);
		visible = dlg.isShown();
		expect(visible).toBe(false);					
	});
	
	it("Create welcome dialog for Spreadsheet...", function()
	{
		var tmpNode = document.createElement("div");
		var dlg = new concord.feature.WelcomeDlg({id:"pWelcome_"+ new Date().getTime(), docType: "sheet"},tmpNode);
		var visible = dlg.isShown();
		expect(visible).toBe(false);
		dlg._show();						
		visible = dlg.isShown();
		expect(visible).toBe(true);	
		dlg._hideMe();
		visible = dlg.isShown();
		expect(visible).toBe(false);									
	});
	
	it("Create New Users Tour for Document...", function()
	{
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {	
				var fdata = data.text;
				var features = fdata.feature;		
				featureIDs = features[0].featureIDs;
				var tmpNode = document.createElement("div");
				var featureDlg = null;
				try {					
					featureDlg = new concord.feature.NewUserTourDlg({id:"pWelcome_"+ new Date().getTime(), featureIDs: featureIDs},tmpNode);
					expect(featureDlg).not.toBe(null);	
					var visible = featureDlg.isShown();
					expect(visible).toBe(false);
					featureDlg._show();
					visible = featureDlg.isShown();
					expect(visible).toBe(true);
					expect(featureDlg.fNumber).toBe(6);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(1);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(2);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(3);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(4);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(5);
					featureDlg._close();
					visible = featureDlg.isShown();
					expect(visible).toBe(false);
					
					var features = ["TEXT_LAYOUT","COMMON_COEDIT","TEXT_COMMENT","TEXT_AUTO_PUBLISH","COMMON_TOUR"];
					featureDlg.setFeatureIDs(features);
					expect(featureDlg.fNumber).toBe(5);
					expect(visible).toBe(false);
					featureDlg._show();
					visible = featureDlg.isShown();
					expect(visible).toBe(true);
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
	
	it("Create New Users Tour for Spreadsheet...", function()
	{
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {	
				var fdata = data.sheet;
				var features = fdata.feature;		
				featureIDs = features[0].featureIDs;
				var tmpNode = document.createElement("div");
				var featureDlg = null;
				try {					
					featureDlg = new concord.feature.NewUserTourDlg({id:"pWelcome_"+ new Date().getTime(), featureIDs: featureIDs},tmpNode);
					expect(featureDlg).not.toBe(null);	
					var visible = featureDlg.isShown();
					expect(visible).toBe(false);
					featureDlg._show();
					visible = featureDlg.isShown();
					expect(visible).toBe(true);
					expect(featureDlg.fNumber).toBe(6);
					visible = !dojo.hasClass(featureDlg.presNode, "hidden");
					expect(visible).toBe(false);
					visible = !dojo.hasClass(featureDlg.nextNode, "hidden");
					expect(visible).toBe(true);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(1);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(2);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(3);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(4);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(5);
					visible = !dojo.hasClass(featureDlg.presNode, "hidden");
					expect(visible).toBe(true);
					visible = !dojo.hasClass(featureDlg.nextNode, "hidden");
					expect(visible).toBe(false);					
					var e = {};
					e.keyCode = 13;
					e.target = featureDlg.nextNode;
					featureDlg._onKeyDown(e);
					expect(featureDlg.fIndex).toBe(5);					
					featureDlg._close();
					visible = featureDlg.isShown();
					expect(visible).toBe(false);
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
	
	it("Create New Users Tour for Presentation...", function()
	{
		dojo.xhrGet({
			url: fUrl,
			handleAs: "json",
			sync: false,
			preventCache: true,
			load: function(data) {	
				var fdata = data.pres;
				var features = fdata.feature;		
				featureIDs = features[0].featureIDs;
				var tmpNode = document.createElement("div");
				var featureDlg = null;
				try {					
					featureDlg = new concord.feature.NewUserTourDlg({id:"pWelcome_"+ new Date().getTime(), featureIDs: featureIDs},tmpNode);
					expect(featureDlg).not.toBe(null);	
					var visible = featureDlg.isShown();
					expect(visible).toBe(false);
					featureDlg._show();
					visible = featureDlg.isShown();
					expect(visible).toBe(true);
					expect(featureDlg.fNumber).toBe(6);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(1);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(2);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(3);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(4);
					featureDlg._next();
					expect(featureDlg.fIndex).toBe(5);
					featureDlg._close();
					visible = featureDlg.isShown();
					expect(visible).toBe(false);
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
