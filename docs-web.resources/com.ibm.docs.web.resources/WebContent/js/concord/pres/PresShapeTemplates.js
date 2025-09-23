/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) CopyRight IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.pres.PresShapeTemplates");

dojo.declare("concord.pres.PresShapeTemplates", null, {
	// shape types
	SHAPETYPES : {
		LINE : 'line',
		STRAIGNTCONNECTOR1 : 'straightConnector1',
		RECTANGULAR : 'rect',
		TRIANGLE: 'triangle',
		ELLIPSE: 'ellipse',
		DIAMOND: 'diamond',
		FIVEPOINTEDSTAR: 'star5',
		ROUNDRECT: 'roundRect',
		WEDGERECTCALLOUT: 'wedgeRectCallout',
		HEXAGON: 'hexagon'
	},
    // Predefined shape templates
    'rect': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 82.00 82.00" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:1774444;dsp_y:1569357;dsp_height:1041400;dsp_width:1041400;frm_x:1837944;frm_y:1632857;frm_height:914400;frm_width:914400;rot_degree:0;txbox_height:914400;txbox_width:914400;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 0.00 L 72.00 0.00 L 72.00 72.00 L 0.00 72.00 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="0.00" width="72.00" height="72.00"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 0.00 L 72.00 0.00 L 72.00 72.00 L 0.00 72.00 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:6.09756097560976%;left:6.09756097560976%;width:87.8048780487805%;height:87.8048780487805%;'
    },
    'triangle': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 93.52 82.00" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:3374644;dsp_y:1536700;dsp_height:1041400;dsp_width:1187704;frm_x:3438144;frm_y:1600200;frm_height:914400;frm_width:1060704;rot_degree:0;txbox_height:457200;txbox_width:530352;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 72.00 L 41.76 0.00 L 83.52 72.00 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="0.00" width="83.52" height="72.00"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 72.00 L 41.76 0.00 L 83.52 72.00 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:50%;left:27.6732249786142%;width:44.6535500427716%;height:43.9024390243902%;'
    },
    'ellipse': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 82.00 82.00" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:4898644;dsp_y:1569357;dsp_height:1041400;dsp_width:1041400;frm_x:4962144;frm_y:1632857;frm_height:914400;frm_width:914400;rot_degree:0;txbox_height:646578.440716979;txbox_width:646578.440716979;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 36.00 a 36.00 36.00 0.00 0 1 36.00 -36.00 a 36.00 36.00 0.00 0 1 36.00 36.00 a 36.00 36.00 0.00 0 1 -36.00 36.00 a 36.00 36.00 0.00 0 1 -36.00 -36.00 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="-0.00" width="72.00" height="72.00"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 36.00 a 36.00 36.00 0.00 0 1 36.00 -36.00 a 36.00 36.00 0.00 0 1 36.00 36.00 a 36.00 36.00 0.00 0 1 -36.00 36.00 a 36.00 36.00 0.00 0 1 -36.00 -36.00 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:18.9562876552247%;left:18.9562876552248%;width:62.0874246895505%;height:62.0874246895505%;'
    },
    'diamond': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 82.00 82.00" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:6645148;dsp_y:1569357;dsp_height:1041400;dsp_width:1041400;frm_x:6708648;frm_y:1632857;frm_height:914400;frm_width:914400;rot_degree:0;txbox_height:457200;txbox_width:457200;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 36.00 L 36.00 0.00 L 72.00 36.00 L 36.00 72.00 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="0.00" width="72.00" height="72.00"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 36.00 L 36.00 0.00 L 72.00 36.00 L 36.00 72.00 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:28.0487804878049%;left:28.0487804878049%;width:43.9024390243902%;height:43.9024390243902%;'
    },
    'star5': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 82.00 82.00" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:1785330.96715004;dsp_y:3441700;dsp_height:1041397.67672499;dsp_width:1041398.06569991;frm_x:1848830;frm_y:3505200;frm_height:914400;frm_width:914400;rot_degree:0;txbox_height:349263.336601878;txbox_width:349263.485174739;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 27.50 L 27.50 27.50 L 36.00 0.00 L 44.50 27.50 L 72.00 27.50 L 49.75 44.50 L 58.25 72.00 L 36.00 55.00 L 13.75 72.00 L 22.25 44.50 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="0.00" width="72.00" height="72.00"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 27.50 L 27.50 27.50 L 36.00 0.00 L 44.50 27.50 L 72.00 27.50 L 49.75 44.50 L 58.25 72.00 L 36.00 55.00 L 13.75 72.00 L 22.25 44.50 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:39.6362792703796%;left:33.2310287161902%;width:33.5379425676197%;height:33.5379408277775%;'
    },
    'roundRect': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 82.00 82.00" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:3374644;dsp_y:3441700;dsp_height:1041400;dsp_width:1041400;frm_x:3438144;frm_y:3505200;frm_height:914400;frm_width:914400;rot_degree:0;txbox_height:825125.34254256;txbox_width:825125.34254256;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 12.00 a 12.00 12.00 0.00 0 1 12.00 -12.00 L 60.00 0.00 a 12.00 12.00 0.00 0 1 12.00 12.00 L 72.00 60.00 a 12.00 12.00 0.00 0 1 -12.00 12.00 L 12.00 72.00 a 12.00 12.00 0.00 0 1 -12.00 -12.00 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="-0.00" width="72.00" height="72.00"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 12.00 a 12.00 12.00 0.00 0 1 12.00 -12.00 L 60.00 0.00 a 12.00 12.00 0.00 0 1 12.00 12.00 L 72.00 60.00 a 12.00 12.00 0.00 0 1 -12.00 12.00 L 12.00 72.00 a 12.00 12.00 0.00 0 1 -12.00 -12.00 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:10.3838418214634%;left:10.3838418214634%;width:79.2323163570732%;height:79.2323163570732%;'
    },
    'wedgeRectCallout': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 82.00 64.27" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:4963958;dsp_y:3592576;dsp_height:816229;dsp_width:1041400;frm_x:5027458;frm_y:3656076;frm_height:612648;frm_width:914400;rot_degree:0;txbox_height:612648;txbox_width:914400;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 0.00 L 12.00 0.00 L 12.00 0.00 L 30.00 0.00 L 72.00 0.00 L 72.00 28.14 L 72.00 28.14 L 72.00 40.20 L 72.00 48.24 L 30.00 48.24 L 21.00 54.27 L 12.00 48.24 L 0.00 48.24 L 0.00 40.20 L 0.00 28.14 L 0.00 28.14 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="0.00" width="72.00" height="54.27"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 0.00 L 12.00 0.00 L 12.00 0.00 L 30.00 0.00 L 72.00 0.00 L 72.00 28.14 L 72.00 28.14 L 72.00 40.20 L 72.00 48.24 L 30.00 48.24 L 21.00 54.27 L 12.00 48.24 L 0.00 48.24 L 0.00 40.20 L 0.00 28.14 L 0.00 28.14 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:7.77967947720554%;left:6.09756097560976%;width:87.8048780487805%;height:75.058347596079%;'
    },
    'hexagon': {
        'svg': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" contentStyleType="text/css" viewBox="-5.00 -5.00 93.52 82.00" preserveAspectRatio="none" version="1.1" preserve0="dsp_x:6571996;dsp_y:3441700.21316955;dsp_height:1041399.5736609;dsp_width:1187704;frm_x:6635496;frm_y:3505200;frm_height:914400;frm_width:1060704;rot_degree:0;txbox_height:630620.689655172;txbox_width:731520;"><g groupfor="defs"><defs><clipPath><path d="M 0.00 36.00 L 18.00 0.00 L 65.52 0.00 L 83.52 36.00 L 65.52 72.00 L 18.00 72.00 Z "></path></clipPath></defs></g><g groupfor="fill-line-arrow"><g groupfor="fill"><rect stroke="none" x="0.00" fill="#4F81BD" data-fill-chg="1" y="0.00" width="83.52" height="72.00"></rect></g><g groupfor="line"><path stroke="#3a5f8b" d="M 0.00 36.00 L 18.00 0.00 L 65.52 0.00 L 83.52 36.00 L 65.52 72.00 L 18.00 72.00 Z " fill="none" stroke-width="1pt" vector-effect="non-scaling-stroke" stroke-dasharray="none" stroke-linecap="butt" stroke-linejoin="round"></path></g><g groupfor="arrow"></g></g></svg>',
        'textArea': 'top:19.722443449909%;left:19.2044482463644%;width:61.5911035072712%;height:60.5551131001821%;'
    }
});
(function(){
    PresShapeTemplates = new concord.pres.PresShapeTemplates();
})();