dojo.provide("writer.view.update.tools");
writer.view.update.tools.updateDOM=function(container,rootNode){
	writer.view.update.tools._updataMOM2(container,rootNode);
};
writer.view.update.tools.updataMOM1= function(container,rootNode){
	var nodeStr = "";
	var view = container.getFirst();
	while(view){
		var viewNode = view.render();
		view.clearTag && view.clearTag();
		nodeStr+=viewNode.innerHTML;
		view = container.next(view);
	}
	rootNode.innerHTML = nodeStr;
};
writer.view.update.tools._updataMOM2= function(container,rootNode){
	var childNodes =[];
	for(var i=0;i<rootNode.childNodes.length;i++ ){
		childNodes.push(rootNode.childNodes[i]);
	}
	var replaceNodes=[];
	var view = container.getFirst();
	var index = -1;
	while(view){
		var viewNode = view.render();
		view.clearTag && view.clearTag();
		var indexOf = childNodes.indexOf(viewNode);
		if(indexOf==-1){
			replaceNodes.push(viewNode);
		}else{
			index++;
			while(index< indexOf){
				rootNode.removeChild(childNodes[index]);
				index++;
			}
			for(var i=0;i<replaceNodes.length;i++){
				 rootNode.insertBefore(replaceNodes[i],viewNode);
			}
			replaceNodes = [];
			index = indexOf;
			
		}
		view = container.next(view);
	}
	index++;
	for(var i= index;i<childNodes.length; i++){
		rootNode.removeChild(childNodes[i]);
	}
	for(var i=0;i<replaceNodes.length;i++){
		 rootNode.appendChild(replaceNodes[i]);
	}
};
