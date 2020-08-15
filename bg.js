let host = "https://markjoy.herokuapp.com";
let user;
let chromeMarks = [];

async function fetchUser() {
  const response = await fetch(`${host}/auth/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const text = await response.text();
  if (text) {
    user = await JSON.parse(text);
  } else {
    user = {};
  }
  return user;
}

async function massPostData(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

function processNode(node) {
  if (node.children) {
    node.children.forEach(function (child) {
      processNode(child);
    });
  }
  if (node.url) {
    chromeMarks.push({
      url: node.url,
      title: node.title,
      imageUrl:
        "https://s2.googleusercontent.com/s2/favicons?domain_url=" + node.url,
      userId: user.id,
      categoryId: 6,
      createdAt: node.dateAdded,
    });
  }
}

async function importBookmarks() {
  await fetchUser();

  chrome.bookmarks.getTree(function (itemTree) {
    itemTree.forEach(function (item) {
      processNode(item);
    });
  });

  const response = await massPostData(
    `${host}/api/bookmarks/massbulk`,
    chromeMarks
  );
  console.log(response)
  return response.json;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.greeting == "import") {
    chrome.runtime.getBackgroundPage(async function (backgroundPage) {
      await importBookmarks();
      sendResponse({ farewell: "goodbye" });
    });
    return true;
  }
});
