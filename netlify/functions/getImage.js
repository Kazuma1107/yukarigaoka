const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*", // 本番は自分のドメインに変更
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // プリフライトリクエスト対応
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const { recordId } = event.queryStringParameters;
    if (!recordId) return { statusCode: 400, headers, body: "recordId is required" };

    // kintone からレコード取得
    const resp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json?app=${process.env.KINTONE_IMAGE_APP_ID}&id=${recordId}`, {
      headers: { "X-Cybozu-API-Token": process.env.KINTONE_API_TOKEN }
    });

    const data = await resp.json();

    // 添付ファイルの fileKey を取得
    const fileKey = data.record.写真.value[0].fileKey;

    // 画像ファイルを取得
    const fileResp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`, {
      headers: { "X-Cybozu-API-Token": process.env.KINTONE_API_TOKEN }
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
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*", // 本番は自分のドメインに変更
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // プリフライトリクエスト対応
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const { recordId } = event.queryStringParameters;
    if (!recordId) return { statusCode: 400, headers, body: "recordId is required" };

    // kintone からレコード取得
    const resp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json?app=${process.env.KINTONE_IMAGE_APP_ID}&id=${recordId}`, {
      headers: { "X-Cybozu-API-Token": process.env.KINTONE_API_TOKEN }
    });

    const data = await resp.json();

    // 添付ファイルの fileKey を取得
    const fileKey = data.record.写真.value[0].fileKey;

    // 画像ファイルを取得
    const fileResp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`, {
      headers: { "X-Cybozu-API-Token": process.env.KINTONE_API_TOKEN }
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
