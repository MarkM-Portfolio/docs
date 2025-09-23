dojo.provide("concord.chart.lib.tests.Theme");
dojo.require("concord.chart.lib.Theme");
dojo.require("concord.chart.lib.themes.PlotKit.blue");

(function(){
	var dxc=concord.chart.lib;
	var blue=dxc.themes.PlotKit.blue;
	tests.register("concord.chart.lib.tests.Theme", [
		function testDefineColor(t){
			var args={ num:16, cache:false };
			blue.defineColors(args);
			var a=blue.colors;
			var s="<table border=1>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);

			var args={ num:32, cache: false };
			blue.defineColors(args);
			var a=blue.colors;
			var s="<table border=1 style=margin-top:12px;>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);

			var args={ saturation:20, num:32, cache:false };
			blue.defineColors(args);
			var a=blue.colors;
			var s="<table border=1 style=margin-top:12px;>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);

			var args={ low:10, high:90, num:32, cache: false };
			blue.defineColors(args);
			var a=blue.colors;
			var s="<table border=1 style=margin-top:12px;>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);
		}
	]);
})();
