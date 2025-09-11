const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "https://yukarigaoka.netlify.app", // 本番は自分のドメインに変更
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  // プリフライト対応
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    // recordIds はカンマ区切りで複数指定可能
    const recordIds = event.queryStringParameters.recordIds
      ? event.queryStringParameters.recordIds.split(",")
      : [];

    if (!recordIds.length) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "recordIds is required" }) };
    }

    let fileKeys = [];

    for (const id of recordIds) {
      // Kintone API にリクエスト
      const resp = await fetch(
        `https://${process.env.KINTONE_SUBDOMAIN}.cybozu.com/k/v1/record.json?app=${process.env.KINTONE_IMAGE_APP_ID}&id=${id}`,
        {
          headers: {
            "X-Cybozu-API-Token": process.env.KINTONE_IMAGE_API_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );

      if (!resp.ok) {
        const text = await resp.text();
        console.error(`レコード取得エラー: ${id}`, text);
        continue; // 次のレコードへ
      }

      const data = await resp.json();

      // photo フィールドからファイルキーを取得
      if (data.record && data.record.photo && Array.isArray(data.record.photo.value)) {
        const files = data.record.photo.value;
        fileKeys.push(...files.map(f => f.fileKey));
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ fileKeys })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
