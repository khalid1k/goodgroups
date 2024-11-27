document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const submitButton = document.getElementById("submitButton");
  const errorMessage = document.getElementById("passwordError");

  const passwordValidation = (password) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const numeric = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      minLength.test(password) &&
      uppercase.test(password) &&
      numeric.test(password) &&
      specialChar.test(password)
    );
  };

  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    if (passwordValidation(password)) {
      errorMessage.style.display = "none";
      submitButton.disabled = false;
    } else {
      errorMessage.style.display = "block";
      submitButton.disabled = true;
    }
  });
});
