/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.test.ut_checkpoints");

pres.test.ut_checkpoints = {

    // --------------TABLE----------------------------- //
    tbl_df_classes: [],
    tbl_df_attrs: {},
    tbl_df_inline_style: [],

    // --------------TEXT BOX----------------------------- //
    textbox_default: [{
        nodetype: "DIV",
        classes: ["draw_frame", "layoutClass", "bc"],
        attrs: {
            presentation_class: "textbox",
            pfs: "18",
            draw_layer: "layout",
            text_anchor_type: "paragraph"
        },
        inline_styles: {
            position: "absolute",
            top: "20%",
            left: "20%",
            width: "50%",
            height: "50%"
        }

    }, {
        nodetype: "DIV",
        classes: ["draw_text-box", "contentBoxDataNode"],
        attrs: {
            odf_element: "draw_text-box"
        },
        inline_style: {
            visibility: "visible",
            height: "100%",
            width: "100%"
        }
    }, {
        nodetype: "DIV",
        classes: [],
        attrs: {
            role: "presentation",
            tabindex: "-1"
        },
        inline_style: {
            display: "table",
            height: "100%",
            width: "100%"
        }
    }, {
        nodetype: "DIV",
        classes: ["draw_frame_classes"],
        attrs: {
            role: "presentation",
            tabindex: "-1"
        },
        inline_style: {
            display: "table-cell",
            height: "100%",
            width: "100%"
        }
    }, {
        nodetype: "P",
        classes: ["text_p"],
        attrs: {
            odf_element: "text:p",
            level: "1",
            customstyle: "abs-margin-left:null"
        },
        inline_style: {
            "margin-left": "0%",
            "text-indent": "0%"
        }
    }, {
        nodetype: "SPAN",
        classes: [],
        attrs: {},
        inline_style: {
            "font-size": "1em"
        }
    }, {
        nodetype: "BR",
        classes: ["hideInIE"],
        attrs: {},
        inline_style: {}
    }

    ]

};