import "./process.scss";

function Process({ encryptedText, decryptedText, encryptedFile }) {
  return (
    <div className="process">
      <h5>
        {/* Secret Key, keep it in .env for real applications */}
        Secret Key: <span>"uI2ooxtwHeI6q69PS98fx9SWVGbpQohO"</span>
      </h5>
      <div className="incoming">
        <h4>Encrypted Data</h4>
        <p>{encryptedText}</p>
        {encryptedFile && (
          <div className="file">
            <h4>Encrypted File</h4>
            <p>{encryptedFile}</p>
          </div>
        )}
      </div>
      <div className="crypt">
        <h4>Decrypted Data</h4>
        <p>{decryptedText}</p>
      </div>
    </div>
  );
}

export default Process;
