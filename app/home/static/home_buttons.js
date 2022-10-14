const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const signupBtn = document.querySelector("#signup-btn");
const loginBtn = document.querySelector("#login-btn");
const signupSubmit = document.querySelector("#signup-submit");
const signupCancel = document.querySelector("#signup-cancel");
const loginSubmit = document.querySelector("#login-submit");
const loginCancel = document.querySelector("#login-cancel");

signupBtn.addEventListener("click", () => {
  signupForm.classList.remove("hidden");
});

loginBtn.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
});

function hideForm(event, form, btn) {
  let formVisible = !form.classList.contains("hidden");
  let outsideValidClicks =
    event.target !== btn && !event.composedPath().includes(form);
  if (formVisible && outsideValidClicks) {
    form.classList.add("hidden");
  }
}

document.body.addEventListener("click", (evt) => {
  hideForm(evt, signupForm, signupBtn);
  hideForm(evt, loginForm, loginBtn);
});

signupSubmit.addEventListener("click", (evt) => {
  evt.preventDefault();
  submitForm("signup");
});

loginSubmit.addEventListener("click", (evt) => {
  evt.preventDefault();
  submitForm("login");
});

async function submitForm(formName) {
  let data = {};
  data[`${formName}-username`] = document.querySelector(
    `#${formName}-username`
  ).value;
  data[`${formName}-password`] = document.querySelector(
    `#${formName}-password`
  ).value;
  data[`${formName}-csrf_token`] = document.querySelector(
    `#${formName}-csrf_token`
  ).value;
  let fetchObj = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  let resp = await fetch(`/${formName}`, fetchObj);
  if (resp.redirected === true) {
    window.location.replace(resp.url);
  } else {
    let respData = await resp.json();
    let errors = document.querySelector(`#${formName}-errors`);
    errors.textContent = "";
    for (let error of Object.values(respData)) {
      let text = document.createElement("li");
      text.textContent = error;
      errors.append(text);
    }
  }
}

signupCancel.addEventListener("click", (evt) => {
  clearForm("signup");
});

loginCancel.addEventListener("click", (evt) => {
  clearForm("login");
});

function clearForm(formName) {
  let username = document.querySelector(`#${formName}-username`);
  let password = document.querySelector(`#${formName}-password`);
  let form = document.querySelector(`#${formName}-form`);
  let errors = document.querySelector(`#${formName}-errors`);
  username.value = "";
  password.value = "";
  errors.textContent = "";
  form.classList.add("hidden");
}
