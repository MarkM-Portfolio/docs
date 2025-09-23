dojo.provide("writer.plugins.Plugin");
dojo.require("writer.controller.Editor");
/**
 * All controllers should extend this class, 
 * Use constructor if you want to do some "before init" actions
 * Use "init" or "afterinit" if you want to do some other actions, like "addCommand" and "listen event"
 *
 */
dojo.declare("writer.plugins.Plugin",
null, {
	editor : null,
	constructor: function(createParam) {
		this.editor = createParam.editor;
	},
	/* @Abstract */
	init: function(){},
	
	/* @Abstract */
	afterInit: function(){}
});