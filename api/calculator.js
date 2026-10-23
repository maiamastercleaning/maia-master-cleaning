const crypto = require("node:crypto");

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const password = process.env.CALCULATOR_PASSWORD;

  if (!password) {
    res.statusCode = 503;
    return res.end("Calculator access is not configured yet.");
  }

  const authorization = req.headers.authorization || "";
  let credentials = "";

  if (authorization.startsWith("Basic ")) {
    credentials = Buffer.from(
      authorization.slice(6),
      "base64"
    ).toString("utf8");
  }

  const expected = Buffer.from("maia:" + password);
  const received = Buffer.from(credentials);

  const authorized =
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected);

  if (!authorized) {
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Maia Master Cleaning", charset="UTF-8"'
    );
    res.statusCode = 401;
    return res.end("Please sign in to access the calculator.");
  }

  res.statusCode = 200;
  return res.end(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport"
              content="width=device-width, initial-scale=1">
        <title>Maia Master Cleaning Calculator</title>
      </head>
      <body>
        <h1>Maia Master Cleaning</h1>
        <p>Access granted. Calculator setup is in progress.</p>
      </body>
    </html>
  `);
};
