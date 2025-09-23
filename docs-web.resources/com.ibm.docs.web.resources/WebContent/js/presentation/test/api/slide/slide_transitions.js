/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.test.api.slide.slide_transition");
dojo.require("pres.test.api.utils.util");

apiTest(function() {
	describe("Check import file with transition for slides", function() {
		it.asyncly("check support transition", function() {
			var sorter = app.pe.scene.slideSorter;
			var doc = app.pe.scene.doc;
			var children = sorter.getChildren();
			sorter.selectItems(18, 18);
			expect(doc.getSlides()[18].getTransitionType()).toBe(
					"slideTransitions_notSupported");
			expect(doc.getSlides()[1].getTransitionType()).toBe(
					"slideTransitions_coverDown");
		});
	});
	describe("Set/Unset Transition for slides", function() {
		beforeEach(function() {

			app.pe.scene.hub.slideHandler.doApplySlideTransitions("none",
					"none", "none", true);
		});
		it.asyncly("set transition for one slide with slideWipe Type",
				function() {
					var sorter = app.pe.scene.slideSorter;
					var doc = app.pe.scene.doc;
					var children = sorter.getChildren();
					var slide = doc.getSlides()[1];
					sorter.selectItems(0, 0);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"slideWipe", "fromTop", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_coverDown");
					}, 1000);
					sorter.selectItems(1, 1);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"slideWipe", "fromRight", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_coverLeft");
					}, 1000);
					sorter.selectItems(2, 2);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"slideWipe", "fromBottom", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_coverUp");
					}, 1000);
					sorter.selectItems(3, 3);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"slideWipe", "fromLeft", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_coverRight");
					}, 1000);
					pres.test.api.utils.util.reload();
					return pres.test.api.utils.util
							.verifyWhenLoadFinished(function() {
							});
				});
		it.asyncly("set transition for one slide with pushWipe Type",
				function() {
					var sorter = app.pe.scene.slideSorter;
					var doc = app.pe.scene.doc;
					var children = sorter.getChildren();
					var slide = doc.getSlides()[1];
					sorter.selectItems(0, 0);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"pushWipe", "fromTop", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_pushDown");
					}, 1000);
					sorter.selectItems(1, 1);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"pushWipe", "fromRight", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_pushLeft");
					}, 1000);
					sorter.selectItems(2, 2);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"pushWipe", "fromBottom", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_pushUp");
					}, 1000);
					sorter.selectItems(3, 3);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"pushWipe", "fromLeft", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_pushRight");
					}, 1000);
				});
		it.asyncly("set transition for one slide with barWipe Type",
				function() {
					var sorter = app.pe.scene.slideSorter;
					var doc = app.pe.scene.doc;
					var children = sorter.getChildren();
					var slide = doc.getSlides()[1];
					sorter.selectItems(0, 0);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"barWipe", "topToBottom", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_wipeDown");
					}, 1000);
					sorter.selectItems(1, 1);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"barWipe", "leftToRight", "none", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_wipeRight");
					}, 1000);
					sorter.selectItems(2, 2);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"barWipe", "topToBottom", "reverse", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_wipeUp");
					}, 1000);
					sorter.selectItems(3, 3);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"barWipe", "leftToRight", "reverse", false);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_wipeLeft");
					}, 1000);
				});
		it.asyncly("set transition for all slide with fade Type", function() {
			var sorter = app.pe.scene.slideSorter;
			var doc = app.pe.scene.doc;
			var children = sorter.getChildren();
			var slide = doc.getSlides()[1];
			sorter.selectItems(0, 0);
			app.pe.scene.hub.slideHandler.doApplySlideTransitions("fade",
					"none", "none", true);
			setTimeout(function() {
				expect(slide.getTransitionType()).toBe(
						"slideTransitions_fadeSmoothly");
			}, 1000);
		});
	});

	describe("Change transition for slides", function() {
		it.asyncly("change transition for slides with new transition",
				function() {
					var sorter = app.pe.scene.slideSorter;
					var doc = app.pe.scene.doc;
					var children = sorter.getChildren();
					var slide = doc.getSlides()[1];
					sorter.selectItems(0, 0);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"fade", "none", "none", true);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_fadeSmoothly");
					}, 1000);
					app.pe.scene.hub.slideHandler.doApplySlideTransitions(
							"barWipe", "leftToRight", "none", true);
					setTimeout(function() {
						expect(slide.getTransitionType()).toBe(
								"slideTransitions_wipeRight");
					}, 1000);
				});
	});

});