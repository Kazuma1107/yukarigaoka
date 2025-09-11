const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

  try {
    const { fileKey } = event.queryStringParameters;
    if (!fileKey) return { statusCode: 400, headers, body: "fileKey is required" };

    const fileResp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`, {
      headers: { "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN }
    });

    const arrayBuffer = await fileResp.arrayBuffer();

    return {
      statusCode: 200,
      headers,
      body: Buffer.from(arrayBuffer).toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

