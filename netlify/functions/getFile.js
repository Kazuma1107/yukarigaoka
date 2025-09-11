const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "https://yukarigaoka.netlify.app",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const fileKey = event.queryStringParameters.fileKey;
    if (!fileKey) return { statusCode: 400, headers, body: JSON.stringify({ error: "fileKey is required" }) };

    const resp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`, {
      headers: {
        "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN
      }
    });

    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // kintoneのファイル情報も取得
    const fileInfoResp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`, {
      headers: {
        "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN
      }
    });
    const fileInfo = await fileInfoResp.json();
    const name = fileInfo.name;
    const contentType = fileInfo.contentType;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ base64, name, contentType })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
