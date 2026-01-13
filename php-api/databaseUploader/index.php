<?php
  if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      if (str_starts_with(trim($line), '#')) continue;
      [$key, $value] = explode('=', $line, 2);
      putenv(trim($key) . '=' . trim($value));
    }
  }

  define('MAX_CLOCK_SKEW', 30);

  function b64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
  }

  function verify_jwt($token) {
    $secret = getenv('JWT_SECRET');
    if (!$secret) return null;

    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $sig] = $parts;

    $expected = rtrim(strtr(
      base64_encode(hash_hmac(
        'sha256',
        "$header.$payload",
        $secret,
        true
      )),
      '+/', '-_'
    ), '=');

    if (!hash_equals($expected, $sig)) return null;

    $data = json_decode(b64url_decode($payload), true);
    if (!$data) return null;

    $now = time();

    if (
      $now < $data['issued_at'] - MAX_CLOCK_SKEW ||
      $now > $data['expires_at'] + MAX_CLOCK_SKEW
    ) {
      return null;
    }

    return $data;
  }


  require_once './database.php';

  header('Content-Type: application/json');

  $data = json_decode(file_get_contents("php://input"), true);

  $scanner = $data["scanner"] ?? null;
  $issued  = $data["issued_at"] ?? null;
  $expires = $data["expires_at"] ?? null;

  if (!$scanner || !$issued || !$expires) {
    http_response_code(400);
    echo "Invalid payload";
    exit;
  }

  $now = time();
  if ($now < $issued - 60 || $now > $expires + 60) {
    http_response_code(403);
    echo "QR expired";
    exit;
  }

  // Database insert (example)
  // INSERT INTO attendance (scanner, issued_at, expires_at, created_at)
  // VALUES (?, ?, ?, NOW());

  echo "OK";
?>