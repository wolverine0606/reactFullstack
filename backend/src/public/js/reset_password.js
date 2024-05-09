const form = document.getElementById("form");
const messageTag = document.getElementById("message");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const notification = document.getElementById("notification");
const submitButton = document.getElementById("submit");

form.style.display = "none";

let token, id;

const passRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^_])[A-Za-z\d@.#$!%*?&^_]{8,}$/;

window.addEventListener("DOMContentLoaded", async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      return searchParams.get(prop);
    },
  });
  token = params.token;
  id = params.id;
  const res = await fetch("/auth/verify-pass-reset-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      id,
    }),
  });
  if (!res.ok) {
    const { message } = await res.json();
    messageTag.innerText = message;
    messageTag.classList.add("error");
    return;
  }

  messageTag.style.display = "none";
  form.style.display = "block";
});

const displayNotification = (text, type) => {
  notification.style.display = "block";
  notification.innerText = text;
  notification.classList.add(type);
};

const handleSubmit = async (evt) => {
  evt.preventDefault();

  if (!passRegex.test(password.value)) {
    return displayNotification(
      "Invalid password! use alpha numeric and special chars!",
      "error"
    );
  }
  if (password.value !== confirmPassword.value) {
    return displayNotification("Password do not match!", "error");
  }

  submitButton.disabled = true;
  submitButton.innerText = "Please wait...";

  const res = await fetch("/auth/reset-pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      id,
      token,
      password: password.value,
    }),
  });
  submitButton.disabled = false;
  submitButton.innerText = "Update password";

  //   console.log(res);
  if (!res.ok) {
    const { message } = await res.json();
    messageTag.style.display = "block";
    messageTag.innerText = message;
  }
  const { message } = await res.json();
  displayNotification(message, "success");
  messageTag.style.display = "block";
  messageTag.innerText = "Your password updated successfully";
  form.style.display = "none";
};

form.addEventListener("submit", handleSubmit);
