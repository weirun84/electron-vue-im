chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.type == 'weburl') {
        $.ajax({type: 'get', url: request.url, dataType: request.dataType, timeout: 3000, success: function (data) {
            sendResponse({msg: 'ok', data: data, url: request.url});
        }, error: function () {
            sendResponse({msg: 'error', data: null, url: request.url});
        }});
    } else if (request.type == 'webpost') {
        $.ajax({type: 'POST', url: request.url, data: request.postdata, dataType: request.dataType, timeout: 3000, success: function (data) {
            sendResponse({msg: 'ok', data: data});
        }, error: function () {
            sendResponse({msg: 'error', data: null});
        }});
    }else if (request.type == 'tabnew') {
        chrome.tabs.create({url:request.url}, function(tab){});
    }else if (request.type == 'tabupdate') {
        chrome.tabs.update({url: request.url}, function(){});
    }
});

function showBigOnClick(info, tab) {
	chrome.tabs.query({
        active : true,
        currentWindow : true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type : "RGShowBig",
            url: info.srcUrl
        }, function (response) {});
    });
}
var link = chrome.contextMenus.create({"title": "放大图片/查看图片尺寸", "contexts": ["image"], "onclick": showBigOnClick});