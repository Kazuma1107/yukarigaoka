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
    const recordIdsParam = event.queryStringParameters.recordIds;
    if (!recordIdsParam) return { statusCode: 400, headers, body: JSON.stringify({ error: "recordIds is required" }) };

    const recordIds = recordIdsParam.split(",").map(id => Number(id));

    const records = [];

    for (const id of recordIds) {
      const resp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json?app=${process.env.KINTONE_IMAGE_APP_ID}&id=${id}`, {
        headers: {
          "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN
        }
      });

      const data = await resp.json();
      // フィールド名は kintone アプリ側で登録した「ファイル」フィールドに合わせてください
      const fileKeys = data.record.写真.value.map(f => f.fileKey);

      records.push({ recordId: id, fileKeys });
    }

    return { statusCode: 200, headers, body: JSON.stringify(records) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
