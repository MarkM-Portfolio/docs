dojo.provide("writer.tests.common.subFuncForVerify");
// Table related function
/**
 * str="border-left:0.6666666666666666px solid #000000"
 * obj = {"width":"0.6666666666666666",style:"solid","color":"rgb(0,0,0)"}
 */


function domBorderToObj (str){
	var temp = str.split(" ");
	var obj = {"width":"" ,"style":"" , "color":""};
	if (temp[0])  obj.width = parseFloat(temp[0].substring(0,temp[0].length-2));
	obj.style = temp[1];
	obj.color = common.tools.RGB2Str(temp[2]+temp[3]+temp[4]);
	//TODO: get changeRGBtoStr() from XieDan;
	return obj;
};

function tableModelBorderToObj (tableObj){
	common.tools.getDPI();
	var objs=[];
	var temp = {"width":"" ,"style":"" , "color":""};
	temp.width= tableObj.tableProperty.leftBorder.width;
	temp.style= tableObj.tableProperty.leftBorder.style;
	temp.color= tableObj.tableProperty.leftBorder.color;
	objs[0] = temp;	
	temp.width= tableObj.tableProperty.rightBorder.width;
	temp.style= tableObj.tableProperty.rightBorder.style;
	temp.color= tableObj.tableProperty.rightBorder.color;
	objs[1] = temp;
	temp.width= tableObj.tableProperty.topBorder.width;
	temp.style= tableObj.tableProperty.topBorder.style;
	temp.color= tableObj.tableProperty.topBorder.color;
	objs[2] = temp;
	temp.width= tableObj.tableProperty.bottomBorder.width;
	temp.style= tableObj.tableProperty.bottomBorder.style;
	temp.color= tableObj.tableProperty.bottomBorder.color;
	objs[3] = temp;
    for(var i =0; i< objs.length-1; i++){
    	var length = objs[i].width.length;
    	if (length >2) {    		
			var pt = objs[i].width.substring(0,length -2);
		    objs[i].width = common.tools.PtToPx(parseFloat(pt));
		}//else objs[i].width = 0;
    };
	
	return objs;
};
function changeStrToObj(str){
	var temp = str.split(" ");
	var obj = {"width":"" ,"style":"" , "color":""};
	if (temp[0])  obj.width = parseFloat(temp[0].substring(0,temp[0].length-2));
	obj.style = temp[1];
	obj.color = common.tools.RGB2Str(temp[2]+temp[3]+temp[4]);
	return obj;
}

function cellModelBorderToObj (cellObj){
	var objs=[];
	var temp = {"width":"" ,"style":"" , "color":""};
	temp.width= cellObj.getBorder().left.width;
	temp.style= cellObj.getBorder().left.style;
	temp.color= cellObj.getBorder().left.color;
	objs[0] = temp;	
	temp.width= cellObj.getBorder().right.width;
	temp.style= cellObj.getBorder().right.style;
	temp.color= cellObj.getBorder().right.color;
	objs[1] = temp;
	temp.width= cellObj.getBorder().top.width;
	temp.style= cellObj.getBorder().top.style;
	temp.color= cellObj.getBorder().top.color;
	objs[2] = temp;
	temp.width= cellObj.getBorder().bottom.width;
	temp.style= cellObj.getBorder().bottom.style;
	temp.color= cellObj.getBorder().bottom.color;
	objs[3] = temp;
    for(var i =0; i< objs.length ; i++){
    	var length = objs[i].width.length;
    	if (length >2) {    		
			var pt = objs[i].width.substring(0,length -2);
			objs[i].width = common.tools.PtToPx(parseFloat(pt));
		}//else objs[i].width = 0;
    };
	
	return objs;		
};


// paragraph related function
function getViewText (model) {
	var text = '';
	
	var allViews = model.getAllViews();
	for(var ownerId in allViews){
		var views = allViews[ownerId];
		var view = views.getFirst();
		while (view != null) {
			if (view.declaredClass == 'view.Tab')
				text += "\t";
			else if (view.declaredClass == 'view.Break')
				text += "\r";
			else {
				var dom = view.domNode;
				if (dom) // Partial rendering will not render all dom
					text += dom.textContent || dom.innerText || '';
				else
					text += view.getText(view.start, view.length);
			}
			view = views.next(view);
		}
	}
	doh.debug("text : " + text);
	return text;
};
// model: need a span object 
var getSpanStyle = function(model) {
	var dom;
	var allViews = model.getAllViews();
	for(var ownerId in allViews){
		var views = allViews[ownerId];
		var view = views.getFirst();
		dom = view.domNode;
		var styleStr = dom.getAttribute('style');
		doh.debug("DomStyle : " + styleStr);
		var domObj = changeStyleStrtoObj(styleStr);
	
		//doh.debug("domObj : " + domObj);
	};
	
	return domObj;
};