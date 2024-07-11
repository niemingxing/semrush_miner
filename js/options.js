// options.js
document.addEventListener('DOMContentLoaded', function() {
    var mKeyInput = document.getElementById('mKey');
    var saveButton = document.getElementById('saveButton');


    // 获取保存的密钥值并设置输入框的默认值
    chrome.storage.local.get('semrush_setting', function(result) {
        let setting = result.semrush_setting;
        if (setting) {
            mKeyInput.value = setting.mkey;
            console.log(setting);
        }
    });

    // 保存按钮点击事件处理程序
    saveButton.addEventListener('click', function() {
        //获取 name = level 的radio的值
        let setting = {
            'mkey':  mKeyInput.value
        };
        chrome.storage.local.set({ 'semrush_setting': setting }, function() {
            alert('设置已保存');
        });
    });
});
