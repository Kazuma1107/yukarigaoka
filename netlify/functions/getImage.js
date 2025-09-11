const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    // クエリから recordIds を取得
    const recordIds = event.queryStringParameters.recordIds
      ? event.queryStringParameters.recordIds.split(",").map(id => Number(id))
      : [];

    if (!recordIds.length) return { statusCode: 400, body: "recordIds is required" };

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

      const record = await resp.json();

      // ここに追加
      console.log(`Record ${id}:`, JSON.stringify(record, null, 2));
       
      if (record.record && record.record["photo"]) {
        const files = record.record["photo"].value || [];
        fileKeys.push(...files.map(f => f.fileKey));
       }

    }

    return { statusCode: 200, body: JSON.stringify({ fileKeys }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
