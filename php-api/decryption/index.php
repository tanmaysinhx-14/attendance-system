<?php 
  function encryptData($data, $secretKey) {
    $iv = random_bytes(16);
    $cipher = "AES-256-CBC";
    $encryptedData = openssl_encrypt($data, $cipher, $secretKey, OPENSSL_RAW_DATA, $iv);

    $combinedData = $iv . $encryptedData;

    $encodedData = base64_encode($combinedData);
    $urlSafeData = strtr($encodedData, '+/', '-_');
    $urlSafeData = rtrim($urlSafeData, '=');

    return $urlSafeData;
  }

  function decryptData($encryptedData, $secretKey) {
    $cipher = "AES-256-CBC";
    $urlSafeData = strtr($encryptedData, '-_', '+/'); 

    $padding = strlen($urlSafeData) % 4;
    if ($padding) {
      $urlSafeData .= str_repeat('=', 4 - $padding);
    }

    $decodedData = base64_decode($urlSafeData);

    if ($decodedData === false || strlen($decodedData) < 17) {
      return false;
    }

    $iv = substr($decodedData, 0, 16);
    $cipherText = substr($decodedData, 16);

    $decryptedData = openssl_decrypt($cipherText, $cipher, $secretKey, OPENSSL_RAW_DATA, $iv);

    return $decryptedData;
  }

  header('Content-Type: text/plain');

  if (!isset($_GET['token'])) {
    http_response_code(400);
    exit('Missing token');
  }

  $token = trim($_GET['token']);

  if ($token === '') {
    http_response_code(400);
    exit('Invalid token');
  }

  $qrGenerationEncryptionKey = '916dc48491a9cd78bced685954a896a6f912ef92808067e99bd505e11e1a8985';

  $decryptedData = decryptData($token, $qrGenerationEncryptionKey);
  
  echo $decryptedData ?? null;
?>
