const fetch = require("node-fetch");
exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "https://yukarigaoka.netlify.app", // 開発中は "*"、本番は自分のドメインに変更
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // プリフライトリクエスト対応
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const { name } = JSON.parse(event.body); // フォームから送られるJSONを受け取る
    if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: "name is required" }) };

    const resp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Cybozu-API-Token": process.env.KINTONE_API_TOKEN
      },
      body: JSON.stringify({
        app: Number(process.env.KINTONE_APP_ID),
        record: { "氏名": { value: name } }
      })
    });

    const result = await resp.json();
    return { statusCode: resp.status, headers, body: JSON.stringify(result) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
