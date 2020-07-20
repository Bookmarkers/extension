// Logic implementation: no one can block the redirect page cause it can cause infinite loop and doesn't make sense.
// I.e. need to check if user is blocking our SPA page and/or the redirection page and not allow for it in the model?
// logic problem 2: correctly match against the canonicalized URLs stored in bookmarks created with the bookmarks API.
// i.e. trimming or adding of forward slashes for regexing the url later.

// very finnicky about where they are
// findall then find one specific one
// callback function for an event firing.
// background script instead of the main content script?
// popup.js

// expecting a return promise
// async await
// pass in string for the gettree

const host = "https://markjoy.herokuapp.com"
// const host = 'http://localhost:8080'

// modularize this function so it can be called when adding a blockedUrl
function fetchUserBlocked() {
  fetch(`${host}/auth/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })
    .then(response => response.text())
    .then(text => (text ? JSON.parse(text) : {}))
    .then(user => {
      if (user.id) {
        fetch(`${host}/api/blocked/user/${user.id}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        })
          .then(response => response.json())
          .then(data => data.map(blocked => blocked.url))
          .then(blockedUrls =>
            window.localStorage.setItem(
              'blockedUrls',
              JSON.stringify(blockedUrls)
            )
          )
          .catch(error => console.log(error))
      } else {
        throw Error("You're not logged into bookmarq.")
      }
    })
    .catch(error =>
      console.error(
        "Dear bookmarq user, something went wrong and we couldn't fetch your blocked urls! Here is the error message: " +
          error
      )
    )
}

window.onload = function() {
  document.cookie = 'SameSite=None; Secure'

  fetchUserBlocked()

  // (async () => {
  //   const src = chrome.runtime.getURL("fetchBlocks.js");
  //   const contentMain = await import(src);
  //   console.log(contentMain.fetchUserBlocked())
  //   contentMain.fetchUserBlocked();
  // })();

  const blockedUrls = window.localStorage.getItem('blockedUrls')

  if (blockedUrls) {
    // console.log('blockedUrls string', blockedUrls)
    // console.log('window.location.href', window.location.href)
    if (blockedUrls.indexOf(window.location.href) > -1) {
      window.location.replace(`${host}/delay`)
      // alert("your url contains the name twitter");
    }
  }
}
