dojo.provide("writer.msg.MessageHelper");

dojo.declare("writer.msg.MessageHelper",null,{
	
	getUUID : function() {
		var seedA = Math.random().toString(16);
		var seedB = Math.random().toString(16);
		var uuid = seedA + seedB;
		uuid = uuid.replace(/0\./g, "");
		// Add id_ prefix for export usage.
		return "id_" + uuid.substring(0, 12);
	},

	getBlockTarget: function(modelNode)
	{
		
	},

/**
 * 
 * The same with MessageUtil.getJsonByPath, if you modify here, don't forget to modify there
 * @argument model the JSON root for relations, styles, numbering 
 * @argument path the JSON array for the path
 * @returns the JSON object
 */
	getJsonByPath: function(model, path){
		  if (!model|| !path){
			  console.log("Target not found for the path:"+path);
			  return null;
		  }
		  var current = model;
		  for (var i=0;i<path.length;i++){
			  var pathitem = path[i];
			  if (typeof(pathitem)=="string"){
				  current = current[pathitem];
			  }else if (typeof(pathitem)=="object" && current.length){
				  //pathitem is a JSON object, current is a JSON array
				  for (var j=0;j<current.length;j++){
					  var temp = current[j];
					  var found = true;
					  for( var key in pathitem){
						  if (pathitem[key] != temp[key]){
							  found = false;
							  break;
						  }
					  }
					  if (found){
						  current = temp;
						  break;
					  }
				  }
				  
			  }else{
				  console.log("target not found, since the path is not right");
				  return null;
			  }
			  
			  if (!current ){
				  console.log("target not found, since the path is not right");
				  return null;
			  }else if (typeof(current)=="string"){
				  console.log("target is a string, not support:"+current);
			  }
		  }
		  return current;
	},
	
	getIndex: function(modelNode)
	{
		
	},
	
	insertAt: function(modelNode, index)
	{
		
	},
	
	insertBefore: function(modelNode, relNode)
	{
		
	}
});

(function(){	
	if(typeof WRITER == "undefined")
		WRITER = {};
	if(typeof WRITER.MSG_HELPER == 'undefined')
		WRITER.MSG_HELPER = new writer.msg.MessageHelper();	
})();