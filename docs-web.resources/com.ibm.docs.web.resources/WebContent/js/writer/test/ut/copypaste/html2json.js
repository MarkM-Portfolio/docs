define([
    "dojo/_base/xhr",
    "writer/filter/HtmlToJson"
], function (xhr, HtmlToJson) {

    var getTestData = function (url) {
        var ret = null;
        xhr.get({
            url: url,
            sync: true,
            handleAs: "text",
            load: function (resp) {
                ret = resp
            }
        })
        return ret;
    };

    describe("Test HTML2JSON", function () {

        it("html1", function () {
            var html = getTestData("copypaste/resources/web_page1.html");
            var converter = new HtmlToJson();
            var jsonArray = converter.toJson(html);
            console.info(jsonArray);
        });

        it("html2", function () {
            var html = getTestData("copypaste/resources/web_page2.html");
            var converter = new HtmlToJson();
            var jsonArray = converter.toJson(html);
            console.info(jsonArray);
        });
        
        it("word1", function () {
            var html = getTestData("copypaste/resources/word.txt");
            var converter = new HtmlToJson();
            var jsonArray = converter.toJson(html);
            console.info(jsonArray);
        });


    });

});