const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const { fileKey } = event.queryStringParameters;
    if (!fileKey) return { statusCode: 400, body: "fileKey is required" };

    const resp = await fetch(
      `https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`,
      {
        headers: {
          "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN
        }
      }
    );

    // バイナリとして取得して Base64 に変換
    const buffer = await resp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: base64
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
