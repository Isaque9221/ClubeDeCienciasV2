import {
  generateSecure10DigitToken,
  hashPassword,
  PBKDF2_ITERATIONS,
} from "../src/seguranca/crypto";

const tokenInformado = process.argv[2]?.trim();

if (tokenInformado && !/^[a-zA-Z0-9]{10}$/.test(tokenInformado)) {
  console.error("O token precisa ter exatamente 10 letras ou números.");
  process.exit(1);
}

const token = tokenInformado || generateSecure10DigitToken();
const hash = await hashPassword(token);
const salt = Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");

console.log("");
console.log("Token do Painel Admin (guarde em local seguro, ele não aparece de novo):");
console.log("  " + token);
console.log("");
console.log(
  `Variáveis para o .env ou para o painel da hospedagem (PBKDF2-SHA-256, ${PBKDF2_ITERATIONS} iterações):`
);
console.log(`  VITE_SECURITY_SALT=${salt}`);
console.log(`  VITE_MASTER_TOKEN_HASH=${hash}`);
console.log("");
