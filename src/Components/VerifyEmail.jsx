import React, { useState, useEffect } from 'react';
import { confirmVerification } from '../lib/auth';

const VerifyEmail = () => {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('secret');
    const userId = urlParams.get('userId');

    confirmVerification(userId, secret).then((response) => {
      setVerified(true);
    });
  }, []);

  return (
    <div>
      {verified ? (
        <h1>Email Verified Successfully!</h1>
      ) : (
        <h1>Verifying Email...</h1>
      )}
    </div>
  );
};

export default VerifyEmail;