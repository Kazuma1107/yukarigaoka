const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*", // 本番は自分のドメインに変更
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // プリフライト対応
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const { fileKey } = event.queryStringParameters;
    if (!fileKey) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "fileKey is required" }) };
    }

    // kintone のファイル取得 API
    const resp = await fetch(
      `https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`,
      {
        method: "GET",
        headers: {
          "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN
        }
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: resp.status, headers, body: text };
    }

    // arrayBuffer で取得 → Buffer → Base64
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    return { statusCode: 200, headers, body: base64 };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
