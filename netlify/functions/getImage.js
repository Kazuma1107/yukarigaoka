const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "https://yukarigaoka.netlify.app", // 本番は自分のドメインに変更
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // プリフライトリクエスト対応
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    // クエリパラメータから recordId を取得
    const { recordId } = event.queryStringParameters;
    if (!recordId) return { statusCode: 400, headers, body: "recordId is required" };

    // kintone からレコード取得
    const resp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json?app=${process.env.KINTONE_IMAGE_APP_ID}&id=${recordId}`, {
      headers: { "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN }
    });

    const data = await resp.json();

    // 添付ファイルフィールド名を正しく指定（例: 写真）
    const fileKey = data.record.photo.value[0].fileKey;

    // 画像ファイルを取得
    const fileResp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/file.json?fileKey=${fileKey}`, {
      headers: { "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN }
    });

    const arrayBuffer = await fileResp.arrayBuffer();

    // base64 に変換して返す
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
