dojo.provide("writer.tests.wrapper.session");
dojo.require("concord.net.Session");
var pe;
if( !pe )
	pe = {};
if( !pe.scene )
	pe.scene = {};
if( !pe.scene.session )
{
	pe.scene.session = 
	{
		  createMessage: concord.net.Session.prototype.createMessage,
		  sendMessage:function(){
			  
		  }
			
			
			
			
			
			
			
	};	




}
	