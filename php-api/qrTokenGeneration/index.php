<?php
  if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      if (str_starts_with(trim($line), '#')) continue;
      [$key, $value] = explode('=', $line, 2);
      putenv(trim($key) . '=' . trim($value));
    }
  }

  define('JWT_SECRET', getenv('JWT_SECRET'));
  define('MAX_CLOCK_SKEW', 30);

  function b64url_decode($d) {
    return base64_decode(strtr($d, '-_', '+/'));
  }

  function sign_jwt(array $payload, $secret) {
    $header = rtrim(strtr(base64_encode(json_encode([
      "alg" => "HS256",
      "typ" => "JWT"
    ])), '+/', '-_'), '=');

    $body = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
    $sig = rtrim(strtr(base64_encode(
      hash_hmac('sha256', "$header.$body", $secret, true)
    ), '+/', '-_'), '=');

    return "$header.$body.$sig";
  }

  header('Content-Type: text/plain');

  $now = time();

  $payload = [
    "issued_at"  => $now,
    "expires_at" => $now + 180
  ];

  echo sign_jwt($payload, JWT_SECRET);
?>