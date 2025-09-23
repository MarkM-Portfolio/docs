dojo.provide("writer.plugins.Zoom");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.util.BidiUtils");

dojo.declare( "writer.plugins.Zoom", [writer.plugins.Plugin], {
		init: function(){
			var zoomCmd = 
			{
				exec: function(zoom)
				{
					if(zoom != pe.lotusEditor.getScale())
					{
						pe.lotusEditor.inZoom = true;
						
						pe.lotusEditor.setScale(zoom);
						
						pe.scene.updateEditor();
						
						var doc = concord.util.browser.getEditAreaDocument();
						var transform = "transform", zoomVal = "scale(" + zoom + ")";
						if(dojo.isWebKit)
							transform = "-webkit-transform";
						else if(dojo.isIE)
							transform = "-ms-transform";
						
						var editorNode = dojo.byId("editor", doc); // doc.body
						dojo.style(editorNode, transform, zoomVal);
						pe.lotusEditor.inZoom = false;
					}
				}
			};
			
			this.editor.addCommand("Zoom", zoomCmd);	
			
			var zoomMenu = dijit.byId("D_m_Zoom");
			var zoomBtn =  dijit.byId("D_t_Zoom");
			zoomBtn.setLabel("100%");
			var checkedMenu = null;
			
			var zoomVal = [0.5, 0.75, 0.9, 1.0, 1.25, 1.5, 2.0];
			var zoomLabel = ["50%","75%", "90%", "100%", "125%", "150%", "200%"];
			var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
			for (var i=0;i<zoomVal.length;i++){
				var zoom = zoomVal[i];
				var newId="D_i_"+zoom;
				var checked = false;
				if(zoom == 1.0)
					checked = true;
				var subMenu = new dijit.CheckedMenuItem({
				    id:newId,
				    _data: zoom,
				    checked: checked,
				    label: zoomLabel[i],
				    onClick : function(){
				    	zoomBtn.setLabel(this.label);
				    	checkedMenu.attr("checked", false);
				    	checkedMenu = this;
				    	checkedMenu.attr("checked", true);
				    	pe.lotusEditor.execCommand("Zoom", this._data);
				    },
				    dir: dirAttr
				});
				zoomMenu.addChild(subMenu);
				if(checked)
					checkedMenu = subMenu;
			}
		}
});