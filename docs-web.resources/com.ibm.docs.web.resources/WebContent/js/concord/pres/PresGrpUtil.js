/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.pres.PresGrpUtil");

dojo.declare("concord.pres.PresGrpUtil", null, {
        
    constructor: function() {
        //Adding presentation specific messages to PresGrpUtil 
    	this._checkTimer = null;
    	this._callbacks = [];
    },

    getObjSizeInPx: function( dfNode ){

        //if( this.mainNode.id.indexOf( "group_cust_shape_id")==0)
        //svg
            var data = new Object();
            data.left=0;
            data.top=0;
            data.height=0;
            data.width=0;
            
            var tempNode = dfNode;
            var left_percent=0;
            var top_percent=0;
            var width_percent=1;
            var height_percent=1;
            var wh=false;
            var reset=false;
            while (tempNode  ) {
    
                var computedStyle = dojo.getComputedStyle( tempNode);
                if(computedStyle){
       
                    if( dojo.hasClass(tempNode, "slideEditor") ){//the last node
                        //now tempNode is the slider,and in px
                          var slide_width = parseFloat(computedStyle.width.split('px')[0]);
                          var slide_height= parseFloat(computedStyle.height.split('px')[0]);
                         
                          data.top = data.top+slide_height*top_percent + 'px';
                        
                          data.left = data.left+slide_width*left_percent + 'px';
                        
                          if( !wh ){
                              data.width = slide_width*width_percent + 'px';
                        
                              data.height = slide_height*height_percent + 'px';
                          }
                          break;
                    }
                    if((computedStyle.left.indexOf( 'px' ) >= 0)){
                        if( !wh ){
                            data.width = computedStyle.width;
                            data.height= computedStyle.height;
                        }
                        wh=true;//width and height already got!
                        left_temp = parseFloat(computedStyle.left.split('px')[0]);
                        data.left= data.left+left_temp+parseFloat(computedStyle.width.split('px')[0])*left_percent;
                        top_temp = parseFloat(computedStyle.top.split('px')[0]);
                        data.top= data.top+top_temp+parseFloat(computedStyle.height.split('px')[0])*top_percent;
                        reset=true;//current percent has been calculated to 'px'
                    }else{ //in percent
                        left_temp = parseFloat(computedStyle.left.split('%')[0])/100;
                        top_temp = parseFloat(computedStyle.top.split('%')[0])/100;
                        width_temp = parseFloat(computedStyle.width.split('%')[0])/100;
                        height_temp = parseFloat(computedStyle.height.split('%')[0])/100;
                        if(reset){
                            left_percent = left_temp;
                            top_percent = top_temp;
                            reset=false;
                        }
                        else{
                            left_percent = left_temp!=0 ? left_percent*left_temp : left_percent;
                            height_percent = height_temp!=0 ? height_percent*height_temp : height_percent;
                            width_percent= width_temp!=0 ? width_percent*width_temp : width_percent;
                            height_percent= width_temp!=0 ? height_percent*height_temp : height_percent;
                        }
                            
                    }
                  
                }
                tempNode = tempNode.parentNode;
                
           }
            
        
        return data;
    },
    //
    // adjustContentDataSize sets the size of the image since 100% in IE does not yield the correct needed size as other browsers.
    //
    isObjInGroup: function( node ){
        var tempNode = node;
               
        if( dojo.attr( tempNode, 'in_group') == 'yes'){
            return true;
        }
        while (tempNode && tempNode.nodeName.toLowerCase() != 'body' ) {
             if (  dojo.attr(tempNode, "is_group_obj") == "yes"){
                 return true;
             }

             tempNode = tempNode.parentNode;

        }
        return false;
    },
    
    isTextObjInGroup: function( node ){
        var tempNode = node;

        while (tempNode && tempNode.nodeName.toLowerCase() != 'body' ) {
             if (  dojo.attr(tempNode, "is_group_obj") == "yes"
                 && !dojo.hasClass(node , "resizableGContainer")){
                 //this is node, not tempNode!!! "resizableGContainer" is used for svg
                 return true;
             }
             tempNode = tempNode.parentNode;

        }
        return false;
 }
	
});

(function(){
    PresGrpUtil = new concord.pres.PresGrpUtil();   
})();
