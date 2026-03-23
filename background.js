chrome.runtime.onInstalled.addListener(() => {
  console.log("KnowMe-知我 已安装");
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) {
    return;
  }

  chrome.sidePanel.open({ tabId: tab.id });
});
