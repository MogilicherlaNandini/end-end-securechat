var aes256 = require("aes256");

// The secret key used for encrypting and decrypting messages. 
// For security reasons, ideally, this should be stored in a .env file.
var secret_key = "uI2ooxtwHeI6q69PS98fx9SWVGbpQohO";

// Function to encrypt the message using AES256
export const to_Encrypt = (text) => {
  var encrypted = aes256.encrypt(secret_key, text);
  return encrypted;
};

// Function to decrypt the message using AES256
export const to_Decrypt = (cipher, username) => {
  console.log('Cipher received for decryption:', cipher);

  // If cipher is an object, we assume the text is inside a 'text' property
  if (typeof cipher === 'object' && cipher !== null) {
    console.log('Cipher is an object, extracting text property:', cipher);
    cipher = cipher.text; // Extract the text from the cipher object
  }

  // Check if cipher is a string before attempting to use string methods
  if (typeof cipher !== 'string') {
    console.error('Expected cipher to be a string, but received:', typeof cipher, cipher);
    return; // Exit the function if it's not a string
  }

  // If the cipher is a "Welcome" message, return it as is
  if (cipher.startsWith("Welcome")) {
    return cipher;
  }

  // If the cipher is a username-based message, return it as is
  if (cipher.startsWith(username)) {
    return cipher;
  }

  // Decrypt the message using the AES256 algorithm
  var decrypted = aes256.decrypt(secret_key, cipher);

  // Ensure that the decrypted message is a string
  if (Buffer.isBuffer(decrypted)) {
    decrypted = decrypted.toString('utf-8'); // Convert Buffer to string if necessary
  }

  if (typeof decrypted !== 'string') {
    console.error('Decryption did not return a valid string:', decrypted);
    return;
  }

  return decrypted;
};
