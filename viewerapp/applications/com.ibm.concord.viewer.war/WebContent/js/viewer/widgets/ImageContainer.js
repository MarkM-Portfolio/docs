/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.widgets.ImageContainer");

dojo.requireLocalization("viewer.widgets", "ImageContainer");
dojo.declare(
	"viewer.widgets.ImageContainer",
	[dijit._Widget],
	{
		postMixInProperties: function(){
			var _nlsResources = dojo.i18n.getLocalization("viewer.widgets", "ImageContainer");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},
		
		getPreferredReloadBtnSize: function(containerWidth){
			var buttonSize = 32;
			if (containerWidth < 100){
				buttonSize = 16;
			}else if (containerWidth < 200){
				buttonSize = 24;
			}else if (containerWidth < 800){
				buttonSize = 32;
			}else if (containerWidth < 1600){
				buttonSize = 48;
			}else{
				buttonSize = 64;
			}
			
			return buttonSize;
		},
		
		setReloadBtnSize: function(containerWidth){
			var buttonSize = this.getPreferredReloadBtnSize(containerWidth);
			dojo.attr(this.domNode, 'preferredBtnSize', buttonSize);
		},
		
		createImage: function(attributes, parent){
			var img = null;
			if (attributes && (attributes.onload || attributes.onerror)){
				img = new Image();
				if (attributes.onload)
					img.onload = attributes.onload;
				if (attributes.onerror)
					img.onerror = attributes.onerror;
				for (var item in attributes){
					dojo.attr(img, item, attributes[item]);
				}
				parent.appendChild(img);
			}else{
				img = dojo.create('img', attributes, parent);
			}
			return img;
		}
	});


