$(function () {
    $("#isShowBtn").on("change", function () {
        chrome.storage.local.set({"isShowBtn": $(this)[0].checked}, function () {
        });
    });
    chrome.storage.local.get(['isShowBtn'], function (valueArray) {
        if (valueArray.isShowBtn != undefined) {
            $("#isShowBtn").attr("checked", valueArray.isShowBtn);
        }
    });
});