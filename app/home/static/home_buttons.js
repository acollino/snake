const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const signupBtn = document.querySelector("#signup-btn");
const loginBtn = document.querySelector("#login-btn");

let formInUseTimer;

signupBtn.addEventListener("click", () => {
  signupForm.classList.remove("hidden");
});

loginBtn.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
});

signupForm.addEventListener("mouseleave", () => {
  hideForm(signupForm);
});

loginForm.addEventListener("mouseleave", () => {
  hideForm(loginForm);
});

function hideForm(form) {
  formInUseTimer = setTimeout(function () {
    form.classList.add("hidden");
  }, 200);
}

signupForm.addEventListener("mouseenter", function (e) {
  clearTimeout(formInUseTimer);
});

loginForm.addEventListener("mouseenter", function (e) {
  clearTimeout(formInUseTimer);
});
