
	let kwIndex = 0;
	// 创建一个空字符串用于拼接 CSV 内容
	let csvContent = "";
	let keywords = '';
	let keywordList = [];
	let collectKeywordList  = [];
	let currentDomain = window.location.hostname;
	
	/**
	 * 获取必要的dom对象
	 * @param type
	 * @returns {Element | NodeListOf<Element>}
	 */
	function getNeetElement(type)
	{
		let result;
		if(type == "search")
		{
			result = document.querySelector('#srf-skip-to-content input[type="text"]');
		}
		else if(type == "recommend")
		{
			result = document.querySelectorAll('div[data-ui-name="DefinitionTable.Body"] > h3');
		}
		return result;
	}

	/**
	 * 搜索关键词
	 * @param keywords
	 */
	async function search(q)
	{
		let searchInput = getNeetElement("search");
		if (searchInput) {
			inputDispatchEventEvent(searchInput,q);
			document.querySelector('#srf-skip-to-content button[type="submit"]').click();
			await sleep(5000);
			let recommendElements = getNeetElement("recommend");
			console.log(recommendElements.length);
			// 遍历每个 div 元素并输出其 TEXT 内容
			for (let element of recommendElements) {
				// 获取所有直接子元素并过滤出div元素
				let directChildDivs = Array.from(element.children).filter(child => child.tagName === 'DIV');
				// 确保有直接子div元素存在
				if (directChildDivs.length > 0) {
					// 获取对象文本
					let kw = directChildDivs[1].innerText;
					let ranking = directChildDivs[3].innerText;
					let sf = directChildDivs[4].innerText;
					let traffic = directChildDivs[5].innerText;
					let searchTraffic = directChildDivs[7].innerText;
					let kd = directChildDivs[8].innerText;
					let url = directChildDivs[9].innerText;
					let item = [kw,ranking,sf,traffic,searchTraffic,kd,url];
					console.log(item);
					collectKeywordList.push(item);
				}
				
			}
			kwIndex++;
			if(kwIndex >= keywordList.length)
			{
				saveCsv(generateCsvContent(collectKeywordList));
				return;
			}
			await searchByCharCode();
		}
	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	//根据数组生成csvContent
	function generateCsvContent(data) {
		data.forEach((item) => {
			const formattedItem = item.map(value => formatCSVValue(value));
			csvContent += formattedItem.join(",") + "\n";
		});
		return csvContent;
	}

	/**
	 * 保存内容为csv文件
	 * @param csvContent
	 */
	function saveCsv(csvContent)
	{
		// 创建一个 Blob 对象，将内容保存为 CSV 文件
		var blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });

		// 生成一个临时下载链接并下载文件
		var link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "data(" + currentDomain+ ").csv";
		link.click();
	}

	/**
	 * 格式化csv内容特殊字符
	 * @param value
	 * @returns {string}
	 */
	function formatCSVValue(value) {
		if (typeof value === 'string') {
			if (/[",\n\t]/.test(value)) {
				value = value.replace(/"/g, '""');
				value = `"${value}"`;
			}
		}
		return value;
	}

	async function searchByCharCode()
	{
		let kw = keywordList[kwIndex];
		await search(kw);
	}


	/**
	 * 收集搜索推荐词
	 * @param data
	 */
	async function collectSearchKeywords(data)
	{
		collectKeywordList = [];
		if (data.keywords) {
			window.focus();
			csvContent = "";
			kwIndex = 0;
			keywords = data.keywords;
			// 修改表头为 "推荐关键词"
			let headers = ["关键词","排名","SF","流量","搜索量","KD","URL"];
			collectKeywordList.push(headers);

			keywordList = keywords.split("\n").filter(function(item) {
				return item.trim() !== "";
			});
			
			console.log(keywordList);
			console.log(kwIndex);
			await searchByCharCode();
			console.log("收集关键词数组：" + collectKeywordList);
		}
	}
	
	/**
	 * input对象输入、改变、键盘事件分发
	 * @param obj
	 * @param value
	 */
	function inputDispatchEventEvent(obj,value)
	{
		let focusEvent = new Event('focus', {
			bubbles: true,
			cancelable: true
		});
		let inputEvent = new InputEvent('input', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertText',
			data:value
		});
		let changeEvent = new Event('change', {
			bubbles: true,
			cancelable: true
		});
		let keyUpEvent = new KeyboardEvent('keyup', {
			key: '',
			bubbles: true,
			cancelable: true
		});
		obj.value = value;
		obj.focus();
		obj.dispatchEvent(focusEvent);
		obj.dispatchEvent(inputEvent);
		obj.dispatchEvent(changeEvent);
		obj.dispatchEvent(keyUpEvent);
		console.log(value + "触发搜索");
	}

	function checkIsUrl(str)
	{
		return str.includes("http://") || str.includes("https://");
	}

	// 引入CSS文件
	function addStylesheet(url) {
		const linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		linkElement.type = "text/css";
		linkElement.href = chrome.runtime.getURL(url);
		document.head.appendChild(linkElement);
	}
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		console.log(message);
		if(message.type == 'collect_search_keywords')
		{
			collectSearchKeywords(message);
		}
	});


