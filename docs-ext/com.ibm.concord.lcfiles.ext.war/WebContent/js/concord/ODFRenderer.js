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

dojo.subscribe("lconn/share/app/start", function() {
    dojo.require("dojo.i18n");
    dojo.registerModulePath("concord", "/concordfilesext/js/concord");
    dojo.require("concord.global");
    if (!concord.global.showConcordEntry()) return;

    lconn.core.uiextensions.add("lconn/files/renderers/file/inline",

    function(s, d, parentNode, file, app, scene) {
        //var app = opt.app;
        var routes = app.routes;
        //var scene = opt.scene;
        var user = scene.user;

        var nls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord", "ccdfilesext") : dojo.i18n.getLocalization("concord", "ccdfilesext");
        var extension = file.getExtension();
        var draft_format = {
            "ppt": 1,
            "otp": 1,
            "odp": 1,
            "ods": 1,
            "ots": 1,
            "xls": 1,
            "xlsx": 1,
            "docx": 1,
            "doc": 1,
            "odt": 1,
            "ott": 1
        };
        // for IBM Docs not supported documents
        if (extension == "" || draft_format[extension.toLowerCase()] != 1) {
            return false;
        }
        // for other users that is not an EDITOR
        if (!file.getPermissions().Edit) {
            return false;
        }

        var url = glb_concord_url + "/api/docsvr/lcfiles/" + file.getId() + "/draft";
        var handler = function(r, io) {
            if (r instanceof Error) return false;


            var list = r.editors;
            var dirty = r.dirty;

            if (!dirty && list.length <=0 ) return false;

            var div = parentNode.lastChild;
            var table = div.firstChild;
            table.style.tableLayout = "fixed";
            table.style.width = "100%";
            var tbody = table.firstChild;
            var tr = tbody.firstChild;
            
            if (d != null && d.getElementById("draft_indicator_concord") != null) {
            	return false;
            }
            
            //var td = tr.firstChild;
            //td = td.nextSibling;
            var tr_wn = d.createElement("tr");
            tr_wn.id = "draft_indicator_concord";


            var td_wn = d.createElement("td");
            dojo.attr(td_wn, "colSpan", 2);
            //td_wn.style.width="100%";
            var div_wn = d.createElement("div");
            dojo.attr(div_wn, "role", "alert");
            div_wn.style.marginBottom = 0;
            div_wn.className = "lotusMessage lotusWarning";
            var img_wn = d.createElement("img");
            img_wn.src = "";
            img_wn.className = "lconnSprite lconnSprite-iconWarning16";
            div_wn.appendChild(img_wn);

            if (list.length <= 0) {
                //no online editors
                var span_wn = d.createElement("span");
                span_wn.style.display = "inline";
                span_wn.style.marginLeft = "2px";
                span_wn.appendChild(d.createTextNode(nls.draft_unpublished_tip));
                span_wn.appendChild(d.createTextNode("\u00A0\u00A0"));
                var a_wn = d.createElement("a");
                a_wn.href = "javascript:";
                a_wn.appendChild(d.createTextNode(nls.draft_save_action_label));
                var save_draft_url = glb_concord_url + "/api/docsvr/lcfiles/" + file.getId() + "/draft?respect_cache=true";
                var save_draft_func = function() {
                    dojo.xhrPost({
                        url: save_draft_url,
                        handleAs: "json",
                        postData: dojo.toJson({}),
                        headers: {
                            "Content-Type": "application/json"
                        },
                        handle: function(r, io) {
                            document.getElementById("draft_indicator_concord").style.display = "none";
                        }
                    });
                };
                dojo.connect(a_wn, "onclick", save_draft_func);
                span_wn.appendChild(a_wn);
                div_wn.appendChild(span_wn);
            } else {
                var ss = nls.draft_beiing_edited; //new lconn.share.util.DateFormat(createDate).format(nls.TIMESTAMP);
                lconn.share.util.html.substitute(d, div_wn, ss, {
                    user: function() {
                        var span_wn = d.createElement("span");
                        span_wn.style.display = "inline";
                        span_wn.style.marginLeft = "2px";
                        for (var i = 0, len = list.length; i < len; i++) {
                            var editor_a = d.createElement("a");
                            //editor_a.href= "app/person/" + list[i].userId;
                            editor_a.appendChild(d.createTextNode(list[i].displayName));
                            //dojo.addClass(editor_a, "lconnDownloadable");
                            lconn.files.scenehelper.generateUserLink(app, routes, list[i], editor_a);
                            span_wn.appendChild(editor_a);
                            if (len != 1 && i != len - 1) span_wn.appendChild(d.createTextNode(",\u00A0\u00A0"));
                        }
                        return span_wn;
                    }
                });
            }
            td_wn.appendChild(div_wn);
            tr_wn.appendChild(td_wn);
            tbody.insertBefore(tr_wn, tr);

            /* IE8 bug to have an empty row must*/
            var tr_nouse = d.createElement("tr");
            var td_nouse = d.createElement("td");
            var td_nouse2 = d.createElement("td");
            td_nouse.style.width = "64px";
            tr_nouse.appendChild(td_nouse);
            tr_nouse.appendChild(td_nouse2);

            tbody.insertBefore(tr_nouse, tr_wn);
        }

        dojo.xhrGet({
            url: url,
            handle: handler,
            sync: false,
            handleAs: "json",
            preventCache: true
        });
    });
});