/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.utils.imageUtil");
dojo.require("pres.utils.helper");
dojo.requireLocalization("concord.widgets", "InsertImageDlg");
/*
 * This utility provide image operations Including :
 */
pres.utils.imageUtil = {

	DEFAULT_IMAGE_URL: window.contextPath + window.staticRootPath + "/images/imgPlaceholder.png",

	createImage: function(params)
	{
		var imageUrl = params.url;
		var c = pres.constants;
		var defaultpos = {width: c.DEFAULT_IMAGE_WIDTH, height: c.DEFAULT_IMAGE_HEIGHT};
		var pos = params.pos || defaultpos;
		var imageName = params.name || "";
		var hp = pres.utils.helper;
		var tmpDiv = hp.createEle("div");
		dojo.addClass(tmpDiv, 'draw_frame');
		tmpDiv.setAttribute("presentation_class", "graphic");

		var slideNode = pe.scene.slideEditor.slideNode;
		// Check for images too tall or too wide for slide and reset height and width to fit slide
		if ((parseFloat(pos.height) > slideNode.offsetHeight) || (parseFloat(pos.width) > slideNode.offsetWidth)) {
			if ((parseFloat(pos.height)/slideNode.offsetHeight) > (parseFloat(pos.width)/slideNode.offsetWidth)) {
				pos.width = slideNode.offsetHeight*(parseFloat(pos.width)/parseFloat(pos.height));
				pos.height = slideNode.offsetHeight;
			} else {
				pos.height = slideNode.offsetWidth*(parseFloat(pos.height)/parseFloat(pos.width));
				pos.width = slideNode.offsetWidth;
			}
		}
		dojo.style(tmpDiv, {
			'position': 'absolute',
			'height': hp.pxToPercent((parseFloat(pos.height) || c.DEFAULT_IMAGE_HIGHT ), null, false) + "%",
			'width': hp.pxToPercent((parseFloat(pos.width) || c.DEAFULT_IMAGE_WIDTH ), null, true) + "%",
			'left': hp.pxToPercent(slideNode.offsetWidth / 2 - (parseFloat(pos.width) || c.DEAFULT_IMAGE_WIDTH) / 2, null, true) + "%",
			'top': hp.pxToPercent(slideNode.offsetHeight / 2 - (parseFloat(pos.height) || c.DEFAULT_IMAGE_HIGHT ) / 2, null, false) + "%"
		});

		var image = hp.createEle('img');
		image.onload = dojo.hitch(this, this.onImageLoad, image, params);
		image.onerror = dojo.hitch(this, this.onImageError);
		tmpDiv.appendChild(image);

		image.src = encodeURI(decodeURI(imageUrl));
		image.setAttribute('alt', imageName);

		dojo.addClass(image, 'draw_image');
		dojo.addClass(image, 'contentBoxDataNode');

		dojo.style(image, {
			'position': 'relative',
			'height': "100%",
			'width': "100%"
		});

		dojo.attr(image, 'draw_layer', 'layout');

		return tmpDiv;
	},

	onImageLoad: function(dataNode, params)
	{
		var callback = params.callback;
		var isGallery = params.gallery;
		var mainNode = dataNode.parentNode;
		var slideHeight = pe.scene.slideEditor.slideNode.offsetHeight;
		var slideWidth = pe.scene.slideEditor.slideNode.offsetWidth;
		var heightPct = 0;
		var widthPct = 0;
		var leftPct = 0;
		var topPct = 0;
		var hp = pres.utils.helper;

		if (!isGallery)
		{
			var naturalHeight = dataNode.naturalHeight;
			var naturalWidth = dataNode.naturalWidth;

			var viewHeight = null;
			var viewWidth = null;

			if (naturalWidth > slideWidth)
			{
				viewHeight = naturalHeight * slideWidth / naturalWidth;
				viewWidth = slideWidth;
			}
			else
			{
				viewHeight = naturalHeight;
				viewWidth = naturalWidth;
			}

			if (viewHeight > slideHeight)
			{

				viewWidth = viewWidth * slideHeight / viewHeight;
				viewHeight = slideHeight;
			}

			var left = (slideWidth / 2) - (viewWidth / 2);// - 7;
			var top = (slideHeight / 2) - (viewHeight / 2);// - 7;

			heightPct = hp.pxToPercent(viewHeight, null, false);
			dojo.style(mainNode, {
				'height': heightPct + "%"
			});
			widthPct = hp.pxToPercent(viewWidth, null, true);
			dojo.style(mainNode, {
				'width': widthPct + "%"
			});

			leftPct = hp.pxToPercent(left, null, true);
			dojo.style(mainNode, {
				'left': leftPct + "%"
			});

			topPct = hp.pxToPercent(top, null, false);
			dojo.style(mainNode, {
				'top': topPct + "%"
			});
		}
		else
		{
			widthPct = hp.pxToPercent(pres.constants.DEFAULT_IMAGE_WIDTH, null, true);
			dojo.style(mainNode, {
				'width': widthPct + "%"
			});

			var heightPx = dataNode.naturalHeight * pres.constants.DEFAULT_IMAGE_WIDTH / dataNode.naturalWidth;
			heightPct = hp.pxToPercent(heightPx, null, false);
			dojo.style(mainNode, {
				'height': heightPct + "%"
			});

			var left = (slideWidth / 2) - (pres.constants.DEFAULT_IMAGE_WIDTH / 2);
			var top = (slideHeight / 2) - (heightPx / 2);
			leftPct = hp.pxToPercent(left, null, true);
			dojo.style(mainNode, {
				'left': leftPct + "%"
			});
			topPct = hp.pxToPercent(top, null, false);
			dojo.style(mainNode, {
				'top': topPct + "%"
			});

		}

		if (params.pos != null)
		{
			var newDim = this.getImageDimension(mainNode, params.pos);
			this.moveToPosition(mainNode, newDim);
		}

		if (callback)
			callback(mainNode);

	},

	getImageDimension: function(box, pos)
	{
		var hp = pres.utils.helper;
		var slideHeight = pe.scene.slideEditor.slideNode.offsetHeight;
		var slideWidth = pe.scene.slideEditor.slideNode.offsetWidth;
		var dim = {
			'width': null,
			'height': null,
			'top': null,
			'left': null
		};
		var posPx = {
			'width': pos.width * slideWidth / 100,
			'height': pos.height * slideHeight / 100,
			'top': pos.top * slideHeight / 100,
			'left': pos.left * slideWidth / 100
		};

		var imgH = ((dojo.isIE) ? parseFloat(box.style.height) : dojo.style(box, 'height')) * slideHeight / 100;
		var imgW = ((dojo.isIE) ? parseFloat(box.style.width) : dojo.style(box, 'width')) * slideWidth / 100;

		var ratio = imgH / imgW;

		dim.width = posPx.width;
		dim.height = (ratio * posPx.width);

		while (dim.height > posPx.height)
		{
			dim.width = dim.width - 10; // let's reduce by 10 px
			dim.height = (ratio * dim.width); // in px
		}

		var midWayPt = posPx.height / 2;
		var newTop = (midWayPt - (dim.height / 2)) + posPx.top;

		var midWayPt2 = posPx.width / 2;
		var newLeft = (midWayPt2 - (dim.width / 2)) + posPx.left;

		dim.width = hp.pxToPercent(dim.width, null, true);
		dim.height = hp.pxToPercent(dim.height, null, false);
		dim.top = hp.pxToPercent(newTop, null, false);
		dim.left = hp.pxToPercent(newLeft, null, true);

		return dim;
	},

	moveToPosition: function(box, pos)
	{
		var origTop = (pos) ? pos.top : parseFloat(pres.constants.DEFAULT_IMAGE_TOP);
		var origLeft = (pos) ? pos.left : parseFloat(pres.constants.DEFAULT_IMAGE_LEFT);
		var origWidth = (pos) ? pos.width : parseFloat(pres.constants.DEFAULT_IMAGE_WIDTH);
		var origHeight = (pos) ? pos.height : parseFloat(pres.constants.DEFAULT_IMAGE_HEIGHT);

		origTop = (isNaN(origTop)) ? 0 : origTop;
		origLeft = (isNaN(origLeft)) ? 0 : origLeft;
		origWidth = (isNaN(origWidth)) ? 0 : origWidth;
		origHeight = (isNaN(origHeight)) ? 0 : origHeight;

		dojo.style(box, {
			'top': origTop + '%',
			'left': origLeft + '%',
			'height': origHeight + '%',
			'width': origWidth + '%',
			'position': 'absolute'
		});
		if (dojo.isSafari && !concord.util.browser.isMobile() && pe.scene.hub.focusMgr)
		{
			setTimeout(dojo.hitch(this, function()
			{
				var pasteBin = pe.scene.hub.focusMgr.getPasteBin();
				pasteBin.blur();
				pasteBin.focus();
			}), 50);
		}
	},

	onImageError: function(error)
	{
		var nls = dojo.i18n.getLocalization("concord.widgets", "InsertImageDlg");
		var unsupportedImage = nls.unsupportedImage;
		pe.scene.showErrorMessage(unsupportedImage, 5000);
	}

};
