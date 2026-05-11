const net = require("net");
const { verifySignature } = require("./rsa");

const server = net.createServer((socket) => {
  console.log("Siuntejas prisijunge");

  socket.on("data", (data) => {
    const text = data.toString();
    const receivedData = JSON.parse(text);

    const message = receivedData.message;
    const signature = BigInt(receivedData.signature);

    const publicKey = {
      e: BigInt(receivedData.publicKey.e),
      n: BigInt(receivedData.publicKey.n),
    };

    const isValid = verifySignature(message, signature, publicKey);

    if (isValid) {
      console.log("Parasas galioja");
    } else {
      console.log("Parasas negalioja");
    }

    console.log("Gautas pranesimas:");
    console.log(receivedData.message);

    console.log("Gautas parasas:");
    console.log(receivedData.signature);

    console.log("Gautas viesasis raktas:");
    console.log(receivedData.publicKey);
  });
});

server.listen(3000, () => {
  console.log("Gavejas laukia duomenu per 3000 porta");
});
