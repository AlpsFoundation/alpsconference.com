<?php
/**
 * Infomaniak Newsletter: POST subscriber to /1/newsletters/{domain}/subscribers
 * Docs: https://developer.infomaniak.com/docs/api/post/1/newsletters/%7Bdomain%7D/subscribers
 *
 * Expects .env next to this file or in the project root (parent of api/).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [];
$envLoadedFrom = null;
$envPaths = [
    __DIR__ . '/.env',
    dirname(__DIR__) . '/.env',
];

foreach ($envPaths as $path) {
    if (is_readable($path)) {
        loadEnvFile($path, $allowedOrigins);
        $envLoadedFrom = $path;
        break;
    }
}

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? '';

if (newsletterDebugEnabled()) {
    newsletterLog(sprintf(
        'request method=%s origin=%s env_file=%s allowed_origins=%s',
        $requestMethod,
        $requestOrigin === '' ? '(none)' : $requestOrigin,
        $envLoadedFrom ?? '(not found)',
        json_encode($allowedOrigins, JSON_UNESCAPED_UNICODE)
    ));
}

if ($requestOrigin !== '') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    if (newsletterOriginAllowed($requestOrigin, $allowedOrigins)) {
        header('Access-Control-Allow-Origin: ' . $requestOrigin);
        header('Vary: Origin');
    }
}

if ($requestMethod === 'OPTIONS') {
    if ($requestOrigin !== '' && !newsletterOriginAllowed($requestOrigin, $allowedOrigins)) {
        newsletterLog(corsRejectionMessage($requestOrigin, $allowedOrigins, $envLoadedFrom));
        http_response_code(403);
        if (newsletterDebugEnabled()) {
            echo json_encode([
                'ok' => false,
                'error' => 'Origin not allowed (preflight)',
                'debug' => corsDebugPayload($requestOrigin, $allowedOrigins, $envLoadedFrom),
            ], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }
    http_response_code(204);
    exit;
}

if ($requestMethod !== 'POST') {
    newsletterLog('405 method=' . $requestMethod);
    jsonResponse(405, ['ok' => false, 'error' => 'Method not allowed'], [
        'reason' => 'method_not_allowed',
        'method' => $requestMethod,
    ]);
}

if ($requestOrigin !== '' && !newsletterOriginAllowed($requestOrigin, $allowedOrigins)) {
    newsletterLog(corsRejectionMessage($requestOrigin, $allowedOrigins, $envLoadedFrom));
    jsonResponse(403, ['ok' => false, 'error' => 'Origin not allowed'], corsDebugPayload($requestOrigin, $allowedOrigins, $envLoadedFrom));
}

$token = getenv('INFOMANIAK_TOKEN') ?: '';
$domain = getenv('INFOMANIAK_NEWSLETTER_DOMAIN') ?: '';
$groupsRaw = getenv('INFOMANIAK_NEWSLETTER_GROUPS') ?: '';

if ($token === '' || $domain === '') {
    newsletterLog('500 missing INFOMANIAK_TOKEN or INFOMANIAK_NEWSLETTER_DOMAIN');
    jsonResponse(500, ['ok' => false, 'error' => 'Server configuration is incomplete'], [
        'reason' => 'missing_env',
        'has_token' => $token !== '',
        'has_domain' => $domain !== '',
        'env_file' => $envLoadedFrom,
    ]);
}

if (!ctype_digit((string) $domain)) {
    newsletterLog('500 INFOMANIAK_NEWSLETTER_DOMAIN is not a positive integer');
    jsonResponse(500, ['ok' => false, 'error' => 'Invalid newsletter domain configuration'], [
        'reason' => 'invalid_domain_format',
    ]);
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
    newsletterLog('400 invalid JSON body length=' . strlen($raw));
    jsonResponse(400, ['ok' => false, 'error' => 'Invalid JSON body'], [
        'reason' => 'invalid_json',
        'body_length' => strlen($raw),
    ]);
}

$email = isset($data['email']) ? trim((string) $data['email']) : '';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    newsletterLog('400 invalid or missing email');
    jsonResponse(400, ['ok' => false, 'error' => 'Please enter a valid email address'], [
        'reason' => 'invalid_email',
    ]);
}

$payload = ['email' => $email];
if ($groupsRaw !== '') {
    $groups = [];
    foreach (array_map('trim', explode(',', $groupsRaw)) as $g) {
        if ($g === '') {
            continue;
        }
        $groups[] = ctype_digit($g) ? (int) $g : $g;
    }
    if ($groups !== []) {
        $payload['groups'] = $groups;
    }
}

$url = 'https://api.infomaniak.com/1/newsletters/' . rawurlencode((string) $domain) . '/subscribers';
$body = json_encode($payload, JSON_THROW_ON_ERROR);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
]);

$responseBody = curl_exec($ch);
$curlErr = curl_error($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);

if ($responseBody === false || $curlErr !== '') {
    newsletterLog('502 curl error: ' . ($curlErr !== '' ? $curlErr : 'empty response'));
    jsonResponse(502, ['ok' => false, 'error' => 'Could not reach newsletter service. Try again later.'], [
        'reason' => 'curl_failed',
        'curl_error' => $curlErr !== '' ? $curlErr : null,
    ]);
}

$decoded = json_decode($responseBody, true);
$result = is_array($decoded) ? ($decoded['result'] ?? '') : '';
$infomaniakOk = is_array($decoded)
    && ($result === 'success' || $result === 'asynchronous')
    && ($status === 200 || $status === 201);
if ($infomaniakOk) {
    if (newsletterDebugEnabled()) {
        newsletterLog(sprintf(
            'Infomaniak ok http=%d result=%s subscriber_id=%s',
            $status,
            $result,
            json_encode($decoded['data']['id'] ?? null)
        ));
    }
    jsonResponse(200, ['ok' => true]);
}

$message = 'Subscription could not be completed.';
if (is_array($decoded)) {
    if (isset($decoded['error']['description']) && is_string($decoded['error']['description'])) {
        $message = $decoded['error']['description'];
    } elseif (isset($decoded['message']) && is_string($decoded['message'])) {
        $message = $decoded['message'];
    }
}

$outStatus = $status >= 400 && $status < 600 ? $status : 502;
newsletterLog(sprintf(
    'Infomaniak error http=%d result=%s body_snip=%s',
    $status,
    is_string($result) ? $result : '(n/a)',
    newsletterTruncateForLog((string) $responseBody, 400)
));

jsonResponse($outStatus, ['ok' => false, 'error' => $message], [
    'reason' => 'infomaniak_api_error',
    'http_status' => $status,
    'api_result' => is_string($result) ? $result : null,
    'response_snippet' => newsletterTruncateForLog((string) $responseBody, 800),
]);

function newsletterDebugEnabled(): bool
{
    $v = strtolower(trim((string) (getenv('NEWSLETTER_DEBUG') ?: '')));
    return $v === '1' || $v === 'true' || $v === 'yes' || $v === 'on';
}

function newsletterLog(string $message): void
{
    error_log('[newsletter-subscribe] ' . $message);
}

function newsletterTruncateForLog(string $s, int $max): string
{
    if (strlen($s) <= $max) {
        return $s;
    }
    return substr($s, 0, $max) . '…';
}

/**
 * @param list<string> $allowedOrigins
 * @return array<string, mixed>
 */
function corsDebugPayload(string $requestOrigin, array $allowedOrigins, ?string $envLoadedFrom): array
{
    return [
        'reason' => 'cors_origin_mismatch',
        'request_origin' => $requestOrigin !== '' ? $requestOrigin : null,
        'allowed_origins' => $allowedOrigins,
        'allowed_origins_empty' => $allowedOrigins === [],
        'env_file' => $envLoadedFrom,
        'hint' => 'ALLOWED_ORIGINS in .env must include the exact Origin sent by the browser '
            . '(scheme + host + port), e.g. http://localhost:4321 matches Astro dev.',
    ];
}

/**
 * @param list<string> $allowedOrigins
 */
function corsRejectionMessage(string $requestOrigin, array $allowedOrigins, ?string $envLoadedFrom): string
{
    return sprintf(
        '403 CORS: origin=%s not in allowed list (%d entries) env_file=%s',
        $requestOrigin === '' ? '(empty)' : $requestOrigin,
        count($allowedOrigins),
        $envLoadedFrom ?? 'none'
    )
        . ' allowed=' . json_encode($allowedOrigins, JSON_UNESCAPED_UNICODE);
}

/**
 * @param list<string> $allowed
 */
function newsletterOriginAllowed(string $origin, array $allowed): bool
{
    if ($origin === '') {
        return true;
    }
    return $allowed !== [] && in_array($origin, $allowed, true);
}

/**
 * @param list<string> $allowedOriginsOut
 */
function loadEnvFile(string $path, array &$allowedOriginsOut): void
{
    $lines = file($path, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        return;
    }
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($key === '') {
            continue;
        }
        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"'))
            || (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }
        putenv("$key=$value");
        $_ENV[$key] = $value;
    }

    $origins = getenv('ALLOWED_ORIGINS') ?: getenv('ALLOWED_ORIGIN') ?: '';
    if ($origins !== '') {
        foreach (array_map('trim', explode(',', $origins)) as $o) {
            if ($o !== '') {
                $allowedOriginsOut[] = $o;
            }
        }
    }
}

/**
 * @param array<string, mixed> $data
 * @param array<string, mixed>|null $debug Appended as "debug" when NEWSLETTER_DEBUG is enabled
 */
function jsonResponse(int $code, array $data, ?array $debug = null): never
{
    if ($debug !== null && newsletterDebugEnabled()) {
        $data['debug'] = $debug;
    }
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
