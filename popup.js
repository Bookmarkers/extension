let host;
let user;
let chromeMarks = [];

// if (process.env.NODE_ENV === "development") {
// host = "http://localhost:8080";
// } else {
host = "https://markjoy.herokuapp.com";
// }

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
    return user;
  } else {
    user = {};
    return user;
  }
}

window.onload = async () => {
  await fetchUser();
  // --> if user, render "Go to my page" on popup
  // using document.getElementById('auth').innerHTML =
  // <a href=`${host}/home`>My Page</a>
  // <a href=`${host}/auth`>Sign In</a>

  chrome.bookmarks.getTree(function (itemTree) {
    itemTree.forEach(function (item) {
      processNode(item);
    });
  });

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
        imageUrl: 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + node.url,
          // node.url[node.url.length - 1] === "/"
          //   ? node.url + "favicon.ico"
          //   : node.url + "/favicon.ico",
        userId: user.id,
        categoryId: 6,
        createdAt: node.dateAdded
      });
    }
  }
};

async function postData(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
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

async function updateData(url, data = {}) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function deleteData(url, data = {}) {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

let current = { active: true, lastFocusedWindow: true };

function deletingCallback(tabs) {
  let currentTab = tabs[0];
  deleteData(`${host}/api/bookmarks`, {
    url: currentTab.url,
    userId: user.id,
  }).then((data) => {
    console.log(data);
  });
}

function addingCallback(tabs) {
  let currentTab = tabs[0];
  postData(`${host}/api/bookmarks`, {
    url: currentTab.url,
    title: currentTab.title,
    imageUrl: currentTab.favIconUrl,
    userId: user.id,
    categoryId: 6
  }).then((data) => {
    console.log(data);
  });
}

document.getElementById("do-mark").onclick = () => {
  chrome.tabs.query(current, addingCallback);
};

document.getElementById("do-delete").onclick = () => {
  chrome.tabs.query(current, deletingCallback);
};

document.getElementById("do-sync").onclick = async () => {
  const response = await massPostData(`${host}/api/bookmarks/massbulk`, chromeMarks)
  return response.json;
  // if (chromeMarks.length < 300) {
  //   massPostData(`${host}/api/bookmarks/bulk`, chromeMarks);
  // } else {
  //   massPostData(`${host}/api/bookmarks/massbulk`, chromeMarks)
  // }
}
