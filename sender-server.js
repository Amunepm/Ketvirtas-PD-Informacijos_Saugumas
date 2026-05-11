const http = require("http");
const fs = require("fs");
const path = require("path");
const net = require("net");
const { generateKeys, signMessage } = require("./rsa");

const server = http.createServer((req, res) => {
  if (req.url === "/send" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const input = JSON.parse(body);

      const keys = generateKeys(input.p, input.q);

      if (keys === null) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "Klaida: p ir q turi buti skirtingi pirminiai skaiciai.",
          }),
        );
        return;
      }

      const privateKey = {
        d: keys.d,
        n: keys.n,
      };

      const publicKey = {
        e: keys.e,
        n: keys.n,
      };

      let signature = signMessage(input.message, privateKey);

      if (input.changeSignature) {
        signature = signature + 1n;
      }

      const dataToReceiver = {
        message: input.message,
        signature: signature.toString(),
        publicKey: {
          e: publicKey.e.toString(),
          n: publicKey.n.toString(),
        },
      };

      const client = net.createConnection({ port: 3000 }, () => {
        client.write(JSON.stringify(dataToReceiver));
        client.end();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: input.message,
            signature: signature.toString(),
            publicKey: dataToReceiver.publicKey,
            status: input.changeSignature
              ? "Parasas pakeistas ir issiustas"
              : "Parasas sugeneruotas ir issiustas",
          }),
        );
      });

      client.on("error", () => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "Nepavyko prisijungti prie gavejo. Paleiskite receiver.js.",
          }),
        );
      });
    });

    return;
  }

  let filePath = "index.html";

  if (req.url === "/styles.css") {
    filePath = "styles.css";
  }

  if (req.url === "/front.js") {
    filePath = "front.js";
  }

  fs.readFile(path.join(__dirname, filePath), (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Failas nerastas");
      return;
    }

    res.writeHead(200);
    res.end(content);
  });
});

server.listen(8080, () => {
  console.log("Frontend veikia: http://localhost:8080");
});
