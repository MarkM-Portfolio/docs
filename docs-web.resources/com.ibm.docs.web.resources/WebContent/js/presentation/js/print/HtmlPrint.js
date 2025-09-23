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

dojo.provide("pres.print.HtmlPrint");
dojo.require("concord.widgets.viewPresForHtmlPrint");
dojo.require("concord.widgets.headerfooter.headerfooterUtil");

// Ported from concord.widgets.viewPresForHtmlPrint

dojo.declare("pres.print.HtmlPrint", concord.widgets.viewPresForHtmlPrint, {
	configEvents: function()
	{
	},
	handleSubscriptionEvents: function()
	{
	},
	constructor: function()
	{
		this.loadSlides();
		this.configToolbar();
		this.configToolbarEvents();
	},

	loadSlides: function()
	{
		this.slides = new Array();
		var slidesModels = pe.scene.doc.getSlides();
		var hfu = concord.widgets.headerfooter.headerfooterUtil;
		for ( var i = 0; i < slidesModels.length; i++)
		{
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = slidesModels[i].getHTML(null, false, true, false, 0);
			hfu.updateHeaderFooterDateTimeFields(tempDiv);
			hfu.updatePageNumber(tempDiv, i + 1);
			this.slides.push(tempDiv.firstChild);
		}

		this.numImages = 0;
		var me = this;
		for ( var i = 0; i < this.slides.length; i++)
		{
			var slide = this.slides[i];

			var images = dojo.query('img.draw_image', slide);

			var presURL = this.presDocURLLocation.href;
			presURL = presURL.substring(0, presURL.lastIndexOf('/') + 1);

			for ( var j = 0; j < images.length; j++)
			{
				var imgURL = images[j].getAttribute('src');
				if (imgURL && (imgURL.indexOf('data:image/') == -1))
				{
					if (imgURL.indexOf('http://') == 0)
					{
						var printWinURL = this.presPrintWindow.location.href;
						imgURL = imgURL.substring(presWinURL.lastIndexOf('/') + 1);
					}
					imgURL = presURL + imgURL;

					images[j].setAttribute('src', imgURL);
				}
			}

			var imgTags = dojo.query('img', slide);
			this.numImages += imgTags.length;
		}
		// console.log('Total images in print view: ' + this.numImages);

		// add css files
		pe.scene.hub.attachStyles(this.presPrintDoc);

		var bodyTag = this.presPrintDoc.getElementsByTagName("body")[0];
		dijit.setWaiRole(bodyTag, 'main');
		dijit.setWaiState(bodyTag, 'label', this.nls.PRINT_PRES);

		// add all slides to the printer-friendly view
		var numSlides = this.slides.length;
		for ( var i = 0; i < numSlides; i++)
		{
			var slideDiv = this.addSlide(i, numSlides - 1);
			pres.utils.shapeUtil.scaleShapeForZoom(slideDiv, null, false);
		}
		
		concord.util.A11YUtil.createLabels(bodyTag, this.presPrintDoc);

		// by default do not display speaker notes
		this.switchToSlideView();
	}

});