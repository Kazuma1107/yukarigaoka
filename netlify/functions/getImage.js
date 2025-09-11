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
    const results = [];

    for (const id of recordIds) {
      const resp = await fetch(`https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json?app=${process.env.KINTONE_IMAGE_APP_ID}&id=${id}`, {
        headers: {
          "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN
        }
      });

      if (!resp.ok) {
        const text = await resp.text();
        // レコード取得失敗でも処理続行
        results.push({ recordId: id, fileKeys: [], error: text });
        continue;
      }

      const data = await resp.json();
      const fieldCode = "写真"; // kintone のフィールドコードに合わせる
      const fileKeys = (data.record[fieldCode]?.value || []).map(f => f.fileKey);
      results.push({ recordId: id, fileKeys });
    }

    return { statusCode: 200, headers, body: JSON.stringify(results) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
