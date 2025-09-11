const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*", // 本番は自分のドメインに変更
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const recordIdsParam = event.queryStringParameters.recordIds;
    if (!recordIdsParam) return { statusCode: 400, headers, body: "recordIds is required" };

    const recordIds = recordIdsParam.split(",").map(id => Number(id));
    let fileKeys = [];

    for (const id of recordIds) {
      const resp = await fetch(
        `https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json?app=${process.env.KINTONE_IMAGE_APP_ID}&id=${id}`,
        {
          headers: {
            "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await resp.json();

      // フィールドコードは "photo" に変更済み
      if (data.record && data.record.photo && Array.isArray(data.record.photo.value)) {
        const files = data.record.photo.value;
        fileKeys.push(...files.map(f => f.fileKey));
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ fileKeys }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
