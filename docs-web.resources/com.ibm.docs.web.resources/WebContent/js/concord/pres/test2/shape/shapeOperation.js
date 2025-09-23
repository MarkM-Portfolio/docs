dojo.provide("concord.pres.test2.shape.shapeOperation");
dojo.require("concord.util.events");
dojo.require("concord.pres.test2.common.commonOperation");

function createShape(slideEditor, type){
	if (!slideEditor || !type)
		return null;
	
	slideEditor.shapeType = type;
	slideEditor.shapeTitle = type;
	var pos = {'left':'0', 'top':'0'};
	var shapeObj = slideEditor.createSvgShape(pos);
	return shapeObj;
}

function getShapeType(shapeObj){
	if (!shapeObj) return '';
	return dojo.attr(shapeObj.mainNode, 'draw_type');
}

function getAllShapes(slideEditor){
	if (!slideEditor)
		return;
	var shapes = [];
	for (var i=0; i < slideEditor.CONTENT_BOX_ARRAY.length; i++){
		if (getShapeType(slideEditor.CONTENT_BOX_ARRAY[i]))
			shapes.push(slideEditor.CONTENT_BOX_ARRAY[i]);
	}
	
	return shapes;
}

function deselectShape(shapeObj) {
	if (!shapeObj) return;
	shapeObj.deSelectThisBox();
}

function selectShape(shapeObj) {
	if (!shapeObj) return;
	shapeObj.selectThisBox();
}

function deleteShape(slideEditor){
	if (!slideEditor)
		return;
	slideEditor.deleteSelectedContentBoxes();
}

function getFill(shapeObj){
	if (!shapeObj)
		return '';
	var nodeRect = dojo.query('rect,circle',shapeObj.contentBoxDataNode);
	if (nodeRect.length > 0){
		var svgRect = nodeRect[0];
		return dojo.attr(svgRect, 'fill');
	}
}

function setFill(slideEditor, color){
	if (!slideEditor || !color) return;
	
	slideEditor.setBGColorOnSelectedBox({'color': color});
}