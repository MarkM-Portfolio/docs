define([
    "dojo/_base/xhr",
    "writer/filter/JsonToHtml"
], function (xhr, JsonToHtml) {

    var getTestData = function (url) {
        var ret = null;
        xhr.get({
            url: url,
            sync: true,
            handleAs: "json",
            load: function (resp) {
                console.info(resp)
                ret = resp
            }
        })
        return ret;
    };

    describe("Test Copy :: JSON -> Html", function () {

        it("json1", function () {
            var convertor = new JsonToHtml();
            var content = getTestData("copypaste/resources/content1.json").body;
            console.info(content)
            content[0]._fromClip = new Date().valueOf();
            var htmlstring = convertor.toHtml(content);
            console.info(htmlstring);
        });



    });

});