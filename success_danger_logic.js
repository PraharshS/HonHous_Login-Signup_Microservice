document.querySelector(".submit").addEventListener("click", function (event) {
  check(event);
});

function check(e) {
  var error = JSON.parse("<%- JSON.stringify(error) %>");
  console.log(error);
  if (error) {
    console.log("invalid");
    document.querySelector(".danger").classList.add("visible");

    function danger() {
      document.querySelector(".danger").classList.remove("visible");
    }
    setTimeout(danger, 2000);
  } else {
    document.querySelector(".success").classList.add("visible");
    console.log("valid");

    function success() {
      document.querySelector(".success").classList.remove("visible");
    }
    setTimeout(success, 2000);
  }
  // e.preventDefault();
}
