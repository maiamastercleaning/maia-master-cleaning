const crypto = require("node:crypto");

function page(content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Maia Master Cleaning Calculator</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 24px;
      min-height: 100vh;
      display: grid; place-items: center;
      font-family: Arial, sans-serif;
      background: #eff7f8; color: #173e48;
    }
    main {
      width: 100%; max-width: 420px;
      padding: 32px; border-radius: 20px;
      background: white;
      box-shadow: 0 12px 40px #173e4815;
    }
    h1 { font-size: 24px; }
    p { line-height: 1.6; }
    label { display: block; margin-bottom: 10px; }
    input, button {
      width: 100%; padding: 15px;
      font-size: 18px; border-radius: 10px;
    }
    input { border: 1px solid #aac4ca; }
    button {
      margin-top: 16px; border: 0;
      background: #087e8b; color: white;
      cursor: pointer;
    }
    .error { color: #b42318; }
  </style>
</head>
<body><main>${content}</main></body>
</html>`;
}

function login(error = "") {
  return page(`
    <h1>Maia Master Cleaning</h1>
    <p>Cleaning Price Calculator · Private access</p>
    ${error ? '<p class="error">Incorrect password. Try again.</p>' : ""}
    <form method="post" action="/calculator">
      <label for="password">Password / Senha</label>
      <input id="password" name="password"
        type="password" inputmode="numeric"
        autocomplete="current-password"
        maxlength="128" required autofocus>
      <button type="submit">Enter / Entrar</button>
    </form>
  `);
}

module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  const password = process.env.CALCULATOR_PASSWORD;

  if (!password) {
    res.statusCode = 503;
    return res.end(page("<p>Access is not configured yet.</p>"));
  }

  if (req.method === "GET") {
    return res.end(login());
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, POST");
    return res.end("Method not allowed.");
  }

  let submitted = "";
  if (typeof req.body === "string") {
    submitted = new URLSearchParams(req.body).get("password") || "";
  } else if (req.body && typeof req.body.password === "string") {
    submitted = req.body.password;
  }

  const expected = crypto.createHash("sha256").update(password).digest();
  const received = crypto.createHash("sha256").update(submitted).digest();

  if (!crypto.timingSafeEqual(expected, received)) {
    res.statusCode = 401;
    return res.end(login("incorrect"));
  }

  return res.end(page(`
    <h1>Access granted!</h1>
    <p>Your password worked.</p>
    <p>Calculator setup is in progress.</p>
  `));
};
