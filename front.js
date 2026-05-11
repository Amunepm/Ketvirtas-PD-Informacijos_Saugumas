const sendButton = document.getElementById("sendButton");
const result = document.getElementById("result");

sendButton.addEventListener("click", async () => {
  result.textContent = "Siunciama...";

  const data = {
    p: document.getElementById("p").value,
    q: document.getElementById("q").value,
    message: document.getElementById("message").value,
    changeSignature: document.getElementById("changeSignature").checked,
  };

  const response = await fetch("/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const answer = await response.json();

  if (!response.ok) {
    result.textContent = "Rezultatas: " + answer.status;
    return;
  }

  result.textContent =
    "Pranesimas: " +
    answer.message +
    "\nParasas: " +
    answer.signature +
    "\nViesasis raktas: e = " +
    answer.publicKey.e +
    ", n = " +
    answer.publicKey.n +
    "\nRezultatas: " +
    answer.status;
});
