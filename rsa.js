module.exports = {
  generateKeys,
  signMessage,
  verifySignature,
};

function isPrime(number) {
  if (number < 2n) {
    return false;
  }

  for (let i = 2n; i * i <= number; i++) {
    if (number % i === 0n) {
      return false;
    }
  }

  return true;
}

function gcd(a, b) {
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

function extendedGcd(a, b) {
  if (b === 0n) {
    return { gcd: a, x: 1n, y: 0n };
  }

  const result = extendedGcd(b, a % b);

  return {
    gcd: result.gcd,
    x: result.y,
    y: result.x - (a / b) * result.y,
  };
}

function modInverse(e, phi) {
  const result = extendedGcd(e, phi);

  if (result.gcd !== 1n) {
    return null;
  }

  return ((result.x % phi) + phi) % phi;
}

function modPow(base, exponent, modulus) {
  if (modulus === 1n) {
    return 0n;
  }

  let result = 1n;
  let currentBase = base % modulus;
  let currentExponent = exponent;

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % modulus;
    }

    currentBase = (currentBase * currentBase) % modulus;
    currentExponent = currentExponent / 2n;
  }

  return result;
}

function findPublicExponent(phi) {
  for (let e = 3n; e < phi; e += 2n) {
    if (gcd(e, phi) === 1n) {
      return e;
    }
  }

  return null;
}

function generateKeys(pValue, qValue) {
  if (pValue === "" || qValue === "") {
    return null;
  }

  const p = BigInt(pValue);
  const q = BigInt(qValue);

  if (!isPrime(p) || !isPrime(q)) {
    return null;
  }

  if (p === q) {
    return null;
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const e = findPublicExponent(phi);

  if (e === null) {
    return null;
  }

  const d = modInverse(e, phi);

  if (d === null) {
    return null;
  }

  return { p, q, n, phi, e, d };
}

function getMessageHash(message, n) {
  const crypto = require("crypto");

  const hashHex = crypto.createHash("sha256").update(message).digest("hex");
  const hashNumber = BigInt("0x" + hashHex);

  return hashNumber % n;
}

function signMessage(message, privateKey) {
  const hash = getMessageHash(message, privateKey.n);
  const signature = modPow(hash, privateKey.d, privateKey.n);

  return signature;
}

function verifySignature(message, signature, publicKey) {
  const hash = getMessageHash(message, publicKey.n);
  const check = modPow(signature, publicKey.e, publicKey.n);

  return check === hash;
}
