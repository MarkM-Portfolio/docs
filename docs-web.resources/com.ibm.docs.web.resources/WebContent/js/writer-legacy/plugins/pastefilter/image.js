dojo.provide("writer.plugins.pastefilter.image");
dojo.require("writer.plugins.pastefilter.anchor");

dojo.declare( "writer.plugins.pastefilter.image", [writer.plugins.pastefilter.anchor], {
	cmd : "insertImage",
	/**
	 * is local file url
	 * @param src
	 * @returns
	 */
	isLocalFileImage: function( src ){
		return src && common.tools.startWith(src,['file:///','data:image','webkit-fake-url']);
	},
	/**
	 * upload sync image for different file
	 */
	uploadURLReqSync: function(serverUrl,imageId, srcImgUrl)
  	{
  		if(serverUrl != null && imageId !=null && srcImgUrl !=null){
  			var servletUrl = serverUrl;

  			var obj = new Object();
  			obj.imgId= imageId;
  			obj.uri = srcImgUrl;
  			
  			var newUri;

  			var sData = dojo.toJson(obj);
  			if(window.g_concordInDebugMode)
				console.log('paste plugin.js: submitting paste image upload request to server...');
			dojo.xhrPost({
  				url: servletUrl,
  				handleAs: "json",
  				load: function(r, io) {
  					response = r; 
  					ioArgs = io;
  					newUri = response.uri;
  					if(window.g_concordInDebugMode)
  						console.log('paste plugin.js: received response from server: imageId:'+imgId+' url:'+newUri);
  				},
  				error: function(error,io) {
  					console.log('An error occurred:' + error);
  				},
  				sync: true,
  				contentType: "text/plain",
  				postData: sData
  			});
			
			return newUri;
  	}},
  	/**
  	 * upload image data 
  	 * @param img
  	 * @param data
  	 */
  	uploadImageData: function ( data )
  	{
  		dojo.requireLocalization("concord.widgets","InsertImageDlg");
		var nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
		
  		var result = data.match(/^data:image\/([\w]+);base64/);
  		if( !result )
  			return null;
  			
//  		if( dojo.isMac )
//  		{ //do not support copypaste image in Mac
//  			return null;
//  		}
  		var imgeType;
  		var types = ['bmp', 'jpg', 'jpeg', 'gif', 'png'];
  		for( var i= 0; i<types.length; i++ )
  		{
  			if( types[i] == result[1] )
  			{
  				imgeType = result[1];
  				break;
  			}
  		}
  		if( !imgeType )
  		{
  			pe.scene.showWarningMessage(nls.unsupportedImage,2000);
  			return null;
  		}	
  		var servletUrl = writer.config.config.filebrowserImageUploadUrl + "?method=dataUrl";
  		
  		pe.scene.showWarningMessage(nls.loading);
  		var newUri;
  		
  		dojo.xhrPost({
  			url:servletUrl,
  			handleAs: "json",
  			load: function( response )
  			{
  				newUri = response.uri;
				pe.scene.hideErrorMessage();
  			},
  			error: function(error) {
  				console.log('An error occurred:' + error);
  				pe.scene.hideErrorMessage();
  				ret = null;
  			},
  			sync: true,
  			contentType: "text/plain",
  			postData: data
  		});
  		return newUri;
  	},
  	/**
  	 * set image source 
  	 * @param m
  	 * @param src
  	 */
  	setSrc: function( m, src ){
  		if( m.modelType )
  			m.url = src;
  		else if( m.rt == writer.model.text.Run.IMAGE || m.t == 'numPicBullet'){
  			if( m.pict )
  				m.pict.src = src;
  			else
  			{
  				var graphic = m.inline || m.anchor;
  				graphic.graphicData.pic.src = src;
  			}
  		
  		}
  		else if( m.t == 'pic' )
  			m.src = src;
  	},
  	/**
  	 * get image src
  	 * @param m
  	 */
  	getSrc: function( m ){
  		if( m.modelType  && m.url )
			return m.url;
		else if( m.rt == writer.model.text.Run.IMAGE || m.t == 'numPicBullet' )
		{ //from graphic
			if( m.pict )
				return m.pict.src;
			else
			{
				var graphic = m.inline || m.anchor;
				return graphic && graphic.graphicData && graphic.graphicData.pic && graphic.graphicData.pic.src;
			}
		}
		else if ( m.t == 'pic' )
			return m.src;
  	},
  	
  	/**
  	 * pix to cm unit
  	 * @param n
  	 */
  	pixToCm: function( n ){
  		return (n*0.75)/72*2.54 + "cm" ;
  	},
  	/**
  	 * set width
  	 * @param m
  	 * @param width
  	 */
  	setWidthHeight: function( m, width, height ){
  		var width_cm = this.pixToCm( width );
  		var height_cm = this.pixToCm( height );
  		if( m.modelType == writer.MODELTYPE.IMAGE )
  		{
  			m.width = width_cm;
  			m.height = height_cm;
  		}
  		else{
  			//json
  			if( m.pict ){
  				m.pict.size.width = width + "px";
  				m.pict.size.height = height + "px";
  			}
  			else{
  				var graphic = m.inline || m.anchor;
  				if( graphic ){
  					graphic.extent.cx = width_cm;
  					 graphic.extent.cy = height_cm;
  				}
  			}
  		}
  	},
  	
  	/**
  	 * is anchor image ?
  	 */
  	isAnchor: function( m ){
  		return m.anchor != null ;
  		
  	},

    isChart: function(m){
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
	filter: function( m, webClipBoard, pasteBin ){
		
    if (this.isChart(m))
      return null;

		if( this.isAnchor(m) )
			m = writer.plugins.pastefilter.anchor.prototype.filter.apply( this, [m, webClipBoard, pasteBin ]);
		if( !m )
			return null;
		
		var id = m.id;
		if( !id )
			m.id = WRITER.MSG_HELPER.getUUID();
		
		var url = this.getSrc(m);
		if( !url )
		//no need filter image
			return this.checkAnchorPosition( m );
		
		if ( webClipBoard ) {
			//not local file, internal copy&&paste
			var srcUrl = webClipBoard.href;
			if( url.indexOf("Pictures") >= 0 )
			{
				url = srcUrl.substring(0, srcUrl.lastIndexOf("/"))+ "/" + url;
				
				var pageUrl = window.location.toString();
				var idxFirstSlash = pageUrl.indexOf("/",pageUrl.indexOf("/")+2);
				var context = pageUrl.substring(idxFirstSlash+1, pageUrl.indexOf("/", idxFirstSlash+1));
				
				context = window.location.host+"/"+context+"/";
				if( url.indexOf( context ) >= 0){ 
					// same server
					var docBean = window['pe'].scene.bean;
					if (docBean) {
						if (url.indexOf(docBean.getUri()) < 0) {
						//not same document
							var serverUrl = writer.config.config.urlUploaderUrl;
							
							var newUri = this.uploadURLReqSync(serverUrl,m.id, url );
							 if( newUri ){
								 this.setSrc(m, newUri);
							 }
							 return this.checkAnchorPosition( m );
						}
					}
				}
			}
		}
		else{
			var newUri = this.uploadImageData(url);
			if( newUri ){
				this.setSrc(m, newUri);
				var imgs = dojo.query("img",pasteBin), imgDom;
				for( var i = 0;!imgDom && ( i < imgs.length ); i++ )
				{
					if( imgs[i].src == url )
						imgDom = imgs[i];
				}
				if( imgDom ){
					this.setWidthHeight(m, imgDom.width, imgDom.height );	
				}
			}
			else{
			//TODO: removed
				return null;
			}
		}
		
		function resetShapeId( fmt, ids ){
			for( var i = 0; i< fmt.length; i++ ){
				if( fmt[i].t == "shape" && fmt[i].id ){
					ids[ fmt[i].id ] =WRITER.MSG_HELPER.getUUID().replace("id_","");
					fmt[i].id  = ids[ fmt[i].id ] ;
				}
			}
		}
		
		function updateOLEReferrence( fmt, ids ){
			for( var i = 0; i< fmt.length; i++ ){
				if( fmt[i].t == "OLEObject" && fmt[i].ShapeID ){
					if( ids[ fmt[i].ShapeID ])
						fmt[i].ShapeID = ids[ fmt[i].ShapeID ] ;
				}
			}
		}
		
		if( m.inline && m.inline.graphicData ){
		//check ole object
			var graphicData = m.inline.graphicData,
				isDiscardOle = false,
				selection = pe.lotusEditor.getSelection(),
				viewTools = writer.util.ViewTools;
			
			if (selection)
		    {
		      var range = selection.getRanges()[0];
		      if (range)
		      {
		        var startView = range.getStartView();
		        var startViewObj = startView && startView.obj;

		        isDiscardOle = startViewObj && 
		          (viewTools.getFootNote(startViewObj) || viewTools.getEndNote(startViewObj)
		         || viewTools.getHeader(startViewObj) || viewTools.getFooter(startViewObj));
		      }
		    }
			 
			if( graphicData && graphicData.fmt){
				for( var i =0; i< graphicData.fmt.length; i++ ){
					if( graphicData.fmt[i].t == "object" && graphicData.fmt[i].fmt ){
						var idMaps = {};
						if( isDiscardOle )
							return null;
						resetShapeId( graphicData.fmt[i].fmt, idMaps );
						updateOLEReferrence( graphicData.fmt[i].fmt, idMaps );
					}
				}
			}
		}
		return this.checkAnchorPosition( m );
	}}
);