<?php
  function b64url_decode($d) {
    return base64_decode(strtr($d, '-_', '+/'));
  }

function verify_jwt($jwt, $secret) {
  $parts = explode('.', $jwt);
  if (count($parts) !== 3) return null;

  [$h, $p, $s] = $parts;
  $payload = json_decode(b64url_decode($p), true);

  $sig = hash_hmac('sha256', "$h.$p", $secret, true);
  if (!hash_equals($sig, b64url_decode($s))) return null;

  return $payload;
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
