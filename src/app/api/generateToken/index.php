<?php
  require_once 'config.php';
  require_once 'jwt.php';

  function decryptData($encryptedData, $secretKey) {
    $cipher = "AES-256-CBC";
    $urlSafeData = strtr($encryptedData, '-_', '+/'); 

    $padding = strlen($urlSafeData) % 4;
    if ($padding) {
      $urlSafeData .= str_repeat('=', 4 - $padding);
    }

    $decodedData = base64_decode($urlSafeData);

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
    exit('Invalid student or session');
  }

  $now = time();

  $payload = [
    "student_id" => $studentId,
    "session_id" => $sessionId,
    "issued_at"  => $now,
    "expires_at" => $now + 180
  ];

  echo sign_jwt($payload, JWT_SECRET);
?>