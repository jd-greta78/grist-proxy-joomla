const axios = require('axios');

exports.handler = async (event, context) => {
  // ⚠️ TA CLÉ API (sera dans les variables d'environnement Netlify)
  const GRIST_API_KEY = process.env.GRIST_API_KEY;
  const GRIST_SERVER = "https://grist.numerique.gouv.fr/o/greta78";
  const GRIST_DOC_ID = "4qw5vaYoXKN3xDD6mbxq66";

  // Extraire le nom de la table depuis l'URL
  // Ex: "/.netlify/functions/grist-proxy/Table1" → "Table1"
  const pathParts = event.path.split('/');
  const tableIndex = pathParts.indexOf('grist-proxy') + 1;
  const table = tableIndex >= 0 ? pathParts[tableIndex] : 'Table1';

  // Construire l'URL Grist
  const gristUrl = `${GRIST_SERVER}/api/docs/${GRIST_DOC_ID}/tables/${table}/records`;
  const headers = { 'Authorization': `Bearer ${GRIST_API_KEY}` };

  try {
    let response;
    if (event.httpMethod === 'GET') {
      response = await axios.get(gristUrl, { headers });
    } else if (event.httpMethod === 'POST') {
      response = await axios.post(gristUrl, JSON.parse(event.body), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Erreur Grist:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur lors de la requête Grist' })
    };
  }
};
