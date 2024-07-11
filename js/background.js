let wpUserName = '';
let wpPassword = '';
let wpApiUrl = '';
let collectTag = '';
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request.type);
        if (request.type === "init_setting")
        {
            getSetting();
            sendResponse({ farewell: "Background runtime onMessage!" });
        }
    }
);

function getSetting(callback)
{
    // 获取存储的值
    chrome.storage.local.get('setting', function (data) {
        if(callback) callback();
    });
}