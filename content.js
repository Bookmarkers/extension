const host = "https://markjoy.herokuapp.com";

function fetchUserBlocked() {
  fetch(`${host}/auth/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.text())
    .then((text) => (text ? JSON.parse(text) : {}))
    .then((user) => {
      if (user.id) {
        fetch(`${host}/api/blocked/user/${user.id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => data.map((blocked) => blocked.url))
          .then((blockedUrls) =>
            window.localStorage.setItem(
              "blockedUrls",
              JSON.stringify(blockedUrls)
            )
          )
          .catch((error) => console.log(error));
      } else {
        throw Error("You're not logged into bookmarq.");
      }
    })
    .catch((error) =>
      console.error(
        "Dear bookmarq user, something went wrong and we couldn't fetch your blocked urls! Here is the error message: " +
          error
      )
    );
}

window.onload = function () {
  document.cookie = "SameSite=None; Secure";

  fetchUserBlocked();

  const blockedUrls = window.localStorage.getItem("blockedUrls");

  if (blockedUrls) {
    if (blockedUrls.indexOf(window.location.href) > -1) {
      window.location.replace(`${host}/delay`);
    }
  }

  if (window.location.href === `${host}/bookmarks`) {
    document
      .getElementById("import-bookmarks")
      .addEventListener("click", async function () {
        console.log("Importing bookmarks...");
        chrome.runtime.sendMessage({ greeting: "import" }, function (response) {
          console.log(response.farewell);
        });
        console.log("Successfully imported bookmarks!");
        window.location.replace(`${host}/importing`);
      });
  }
};
