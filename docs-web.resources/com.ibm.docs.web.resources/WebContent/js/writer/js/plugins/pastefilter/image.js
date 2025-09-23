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
define([
    "dojo/_base/declare",
    "dojo/i18n!concord/widgets/nls/InsertImageDlg",
    "dojo/json",
    "dojo/query",
    "dojo/request",
    "writer/common/tools",
    "writer/config/config",
    "writer/constants",
    "writer/msg/msgHelper",
    "writer/plugins/pastefilter/anchor",
    "writer/util/ViewTools"
], function(declare, i18nInsertImageDlg, JSON, query, request, tools, config, constants, msgHelper, anchor, ViewTools) {

    var image = declare("writer.plugins.pastefilter.image", anchor, {
        cmd: "insertImage",
        /**
         * is local file url
         * @param src
         * @returns
         */
        isLocalFileImage: function(src) {
            return src && tools.startWith(src, ['file:///', 'data:image', 'webkit-fake-url']);
        },
        /**
         * upload sync image for different file
         */
        uploadURLReqSync: function(serverUrl, imageId, srcImgUrl) {
            if (serverUrl != null && imageId != null && srcImgUrl != null) {
                var servletUrl = serverUrl;

                var obj = new Object();
                obj.imgId = imageId;
                obj.uri = srcImgUrl;

                var newUri;

                var sData = JSON.stringify(obj);
                if (window.g_concordInDebugMode)
                    console.log('paste plugin.js: submitting paste image upload request to server...');
                request(servletUrl, {
                    method: "POST",
                    handleAs: "json",
                    sync: true,
                    headers: {"Content-Type":"text/plain"},
                    data: sData
                }).then(function(r, io) {
                    response = r;
                    ioArgs = io;
                    newUri = response.uri;
                    if (window.g_concordInDebugMode)
                        console.log('paste plugin.js: received response from server: imageId:' + imgId + ' url:' + newUri);
                }, function(error, io) {
                    console.log('An error occurred:' + error);
                });

                return newUri;
            }
        },

        /**
         * upload image data 
         * @param img
         * @param data
         */
        uploadImageData: function(data, ignoreRemote) {
            var nls = i18nInsertImageDlg;

            var result = data.match(/^data:image\/([\w]+);base64/);
            if (!result && !ignoreRemote)
            	this.getImageDataFromRemote(data);

//            	result = this.uploadImageData(this.getImageDataFromRemote(data), true);
            if (!result) {
            	if(data.match(/^https?:\/\//))
            		return data;
            	return null;
            }


            //  		if( dojo.isMac )
            //  		{ //do not support copypaste image in Mac
            //  			return null;
            //  		}
            var imgeType;
            var types = ['bmp', 'jpg', 'jpeg', 'gif', 'png'];
            for (var i = 0; i < types.length; i++) {
                if (types[i] == result[1]) {
                    imgeType = result[1];
                    break;
                }
            }
            if (!imgeType) {
                pe.scene.showWarningMessage(nls.unsupportedImage, 2000);
                return null;
            }
            var servletUrl = config.filebrowserImageUploadUrl + "?method=dataUrl";

            pe.scene.showWarningMessage(nls.loading);
            var newUri;

            request(servletUrl, {
                method: "POST",
                handleAs: "json",
                sync: true,
                headers: {"Content-Type":"text/plain"},
                data: data
            }).then(function(response) {
                newUri = response.uri;
                pe.scene.hideErrorMessage();
            }, function(error) {
                console.log('An error occurred:' + error);
                pe.scene.hideErrorMessage();
                ret = null;
            });
            return newUri;
        },

        getImageDataFromRemote: function(url){
         	var xhr = new XMLHttpRequest();
         	xhr.open('GET', url);
         	xhr.responseType = "arraybuffer";
			var extUri = tools.base64EncodeUri(url);
			var unProssedExtUrl = pe.lotusEditor.document.unProssedExtUrl;
			if(!unProssedExtUrl)
				unProssedExtUrl = pe.lotusEditor.document.unProssedExtUrl = {};
			unProssedExtUrl[extUri] = {"status":"loading"};
			var that = this;
			xhr.send(null);

            xhr.onload = function(lEvt) {
            	if (xhr.status == 200) {   
            		var cType = xhr.getResponseHeader("Content-Type");
	               	var blob = new Blob([xhr.response], {type:cType});
	    			var reader = new FileReader();
	    			reader.onload = function(e){
	    				var state = e.target.readyState;
	    				if(state == FileReader.DONE){
//	    					console.log("image reader onload.");
	    					var newUri = that.uploadImageData(e.target.result);
	    					var unProssedExtUrl = pe.lotusEditor.document.unProssedExtUrl;
	    					if(unProssedExtUrl[extUri] && unProssedExtUrl[extUri]["img"]) {
	    						var imgObj = unProssedExtUrl[extUri]["img"];
	    						imgObj.changeUrl && imgObj.changeUrl(newUri);
	    						delete unProssedExtUrl[extUri]["img"];
	    					}

	    					unProssedExtUrl[extUri] = {"newSrc":newUri, "status":"complete"};
	    				}
	    			};
	    			reader.readAsDataURL(blob);
            	} else
            		console.log("Failed to load image " + url + " " + xhr.status );
    	    };
 
            xhr.onerror = function () {
            	console.log("Failed to load image " + url );
            	if(pe.lotusEditor.document.unProssedExtUrl)
            		delete pe.lotusEditor.document.unProssedExtUrl[extUri];
            };
            return;
        },

        /**
         * set image source 
         * @param m
         * @param src
         */
        setSrc: function(m, src) {
            if (m.modelType)
                m.url = src;
            else if (m.rt == constants.RUNMODEL.IMAGE || m.t == 'numPicBullet') {
                if (m.pict)
                    m.pict.src = src;
                else {
                    var graphic = m.inline || m.anchor;
                    graphic.graphicData.pic.src = src;
                }

            } else if (m.t == 'pic')
                m.src = src;
        },
        /**
         * get image src
         * @param m
         */
        getSrc: function(m) {
            if (m.modelType && m.url)
                return m.url;
            else if (m.rt == constants.RUNMODEL.IMAGE || m.t == 'numPicBullet') { //from graphic
                if (m.pict)
                    return m.pict.src;
                else {
                    var graphic = m.inline || m.anchor;
                    return graphic && graphic.graphicData && graphic.graphicData.pic && graphic.graphicData.pic.src;
                }
            } else if (m.t == 'pic')
                return m.src;
        },

        /**
         * pix to cm unit
         * @param n
         */
        pixToCm: function(n) {
            return (n * 0.75) / 72 * 2.54 + "cm";
        },
        /**
         * set width
         * @param m
         * @param width
         */
        setWidthHeight: function(m, width, height) {
            var width_cm = this.pixToCm(width);
            var height_cm = this.pixToCm(height);
            if (m.modelType == constants.MODELTYPE.IMAGE) {
                m.width = width_cm;
                m.height = height_cm;
            } else {
                //json
                if (m.pict) {
                    m.pict.size.width = width + "px";
                    m.pict.size.height = height + "px";
                } else {
                    var graphic = m.inline || m.anchor;
                    if (graphic) {
                        graphic.extent.cx = width_cm;
                        graphic.extent.cy = height_cm;
                    }
                }
            }
        },

        /**
         * is anchor image ?
         */
        isAnchor: function(m) {
            return m.anchor != null;

        },

        isChart: function(m) {
            var graphic = m.inline || m.anchor;
            if (graphic && graphic.graphicData && graphic.graphicData.chart)
                return true;

            return false;
        },
        /**
         * filter 
         * @param m
         * @returns
         */
        filter: function(m, webClipBoard, pasteBin) {

            if (this.isChart(m))
                return null;

            if (this.isAnchor(m))
                m = anchor.prototype.filter.apply(this, [m, webClipBoard, pasteBin]);
            if (!m)
                return null;

            var id = m.id;
            if (!id)
                m.id = msgHelper.getUUID();

            var url = this.getSrc(m);
            if (!url)
            //no need filter image
                return this.checkAnchorPosition(m);

            if (webClipBoard) {
                //not local file, internal copy&&paste
                if (!webClipBoard.isSameFile) {
                    //paste across document
                	var anchorNode = m.anchor || m.inline;
                    if (anchorNode && anchorNode.graphicData && anchorNode.graphicData.fmt)
                    {
                    	var childs = anchorNode.graphicData.fmt;
                    	if(childs.length >0)
                    	{
                    		var child = childs[0];
                    		if(child.t && child.t == "object")
                    			delete anchorNode.graphicData.fmt;
                    	}
                    }
                }

                var srcUrl = webClipBoard.href;
                if (url.indexOf("Pictures") >= 0) {
                    url = srcUrl.substring(0, srcUrl.lastIndexOf("/")) + "/" + url;

                    var pageUrl = window.location.toString();
                    var idxFirstSlash = pageUrl.indexOf("/", pageUrl.indexOf("/") + 2);
                    var context = pageUrl.substring(idxFirstSlash + 1, pageUrl.indexOf("/", idxFirstSlash + 1));

                    context = window.location.host + "/" + context + "/";
                    if (url.indexOf(context) >= 0) {
                        // same server
                        var docBean = window['pe'].scene.bean;
                        if (docBean) {
                            if (url.indexOf(docBean.getUri()) < 0) {
                                //not same document
                                var serverUrl = config.urlUploaderUrl;

                                var newUri = this.uploadURLReqSync(serverUrl, m.id, url);
                                if (newUri) {
                                    this.setSrc(m, newUri);
                                }
                                return this.checkAnchorPosition(m);
                            }
                        }
                    }
                }
            } else {
                var newUri = this.uploadImageData(url);
                if (newUri) {
                    this.setSrc(m, newUri);
                    var imgs = query("img", pasteBin),
                        imgDom;
                    for (var i = 0; !imgDom && (i < imgs.length); i++) {
                        if (imgs[i].src == url)
                            imgDom = imgs[i];
                    }
                    if (imgDom) {
                        this.setWidthHeight(m, imgDom.width, imgDom.height);
                    }
                } else {
                    //TODO: removed
                    return null;
                }
            }

            function resetShapeId(fmt, ids) {
                for (var i = 0; i < fmt.length; i++) {
                    if (fmt[i].t == "shape" && fmt[i].id) {
                        ids[fmt[i].id] = msgHelper.getUUID().replace("id_", "");
                        fmt[i].id = ids[fmt[i].id];
                    }
                }
            }

            function updateOLEReferrence(fmt, ids) {
                for (var i = 0; i < fmt.length; i++) {
                    if (fmt[i].t == "OLEObject" && fmt[i].ShapeID) {
                        if (ids[fmt[i].ShapeID])
                            fmt[i].ShapeID = ids[fmt[i].ShapeID];
                    }
                }
            }

            if (m.inline && m.inline.graphicData) {
                //check ole object
                var graphicData = m.inline.graphicData,
                    isDiscardOle = false,
                    selection = pe.lotusEditor.getSelection(),
                    viewTools = ViewTools;

                if (selection) {
                    var range = selection.getRanges()[0];
                    if (range) {
                        var startView = range.getStartView();
                        var startViewObj = startView && startView.obj;

                        isDiscardOle = startViewObj &&
                            (viewTools.getFootNote(startViewObj) || viewTools.getEndNote(startViewObj) || viewTools.getHeader(startViewObj) || viewTools.getFooter(startViewObj));
                    }
                }

                if (graphicData && graphicData.fmt) {
                    for (var i = 0; i < graphicData.fmt.length; i++) {
                        if (graphicData.fmt[i].t == "object" && graphicData.fmt[i].fmt) {
                            var idMaps = {};
                            if (isDiscardOle)
                                return null;
                            resetShapeId(graphicData.fmt[i].fmt, idMaps);
                            updateOLEReferrence(graphicData.fmt[i].fmt, idMaps);
                        }
                    }
                }
            }
            return this.checkAnchorPosition(m);
        }
    });
    return image;
});
