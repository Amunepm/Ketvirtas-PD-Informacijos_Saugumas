const net = require("net");
const { generateKeys, signMessage } = require("./rsa");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const p = await ask("Iveskite pirmini skaiciu p: ");
  const q = await ask("Iveskite pirmini skaiciu q: ");
  const message = await ask("Iveskite pranesima: ");

  const keys = generateKeys(p, q);

  if (keys === null) {
    console.log("Klaida: p ir q turi buti skirtingi pirminiai skaiciai.");
    rl.close();
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

  let signature = signMessage(message, privateKey);

  console.log("Sugeneruotas parasas:", signature.toString());

  const changeSignature = await ask("Ar pakeisti parasa? (t/n): ");

  if (changeSignature === "t") {
    signature = signature + 1n;
    console.log("Parasas pakeistas:", signature.toString());
  }

  const client = net.createConnection({ port: 3000 }, () => {
    console.log("Prisijungta prie gavejo");

    const data = {
      message: message,
      signature: signature.toString(),
      publicKey: {
        e: publicKey.e.toString(),
        n: publicKey.n.toString(),
      },
    };

    client.write(JSON.stringify(data));
    client.end();
  });

  client.on("error", () => {
    console.log("Nepavyko prisijungti prie gavejo");
  });

  rl.close();
}

main();
