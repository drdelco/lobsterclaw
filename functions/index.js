const functions = require('firebase-functions');
const admin = require('firebase-admin');
const http = require('http');

admin.initializeApp();
const db = admin.firestore();

// ── Auth helper ──

const ADMINS = ['diegoferrandezsempere@gmail.com', 'drdelco@gmail.com'];

function requireAdmin(context) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  if (!ADMINS.includes(context.auth.token.email))
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
}

// ── Instance resolver ──

/**
 * Get sync server connection info for an instance from Firestore.
 * Returns { host, syncPort, syncToken }
 */
async function getInstanceConnection(instanceId) {
  if (!instanceId) throw new functions.https.HttpsError('invalid-argument', 'instanceId required');
  
  const doc = await db.collection('instances').doc(instanceId).get();
  if (!doc.exists) throw new functions.https.HttpsError('not-found', `Instance "${instanceId}" not found`);
  
  const data = doc.data();
  const host = data.host;
  const syncPort = data.syncPort || 8787;
  const syncToken = data.syncToken;
  
  if (!host) throw new functions.https.HttpsError('failed-precondition', `Instance "${instanceId}" has no host configured`);
  if (!syncToken) throw new functions.https.HttpsError('failed-precondition', `Instance "${instanceId}" has no syncToken configured`);
  
  return { host, syncPort, syncToken };
}

/**
 * Call sync server of a specific instance.
 */
function callInstanceSyncServer(host, port, token, path, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: host,
      port,
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => reject(new Error(`Cannot reach ${host}:${port} - ${e.message}`)));
    req.on('timeout', () => reject(new Error(`Timeout connecting to ${host}:${port}`)));
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Resolve instance and call its sync server.
 * data.instanceId defaults to 'alvi' for backward compat.
 */
async function callInstance(data, path) {
  const instanceId = (data && data.instanceId) || 'alvi';
  const conn = await getInstanceConnection(instanceId);
  return callInstanceSyncServer(conn.host, conn.syncPort, conn.syncToken, path, data);
}

// ── Cloud Functions ──

// Sync config (push workspace files to Firebase)
exports.syncConfig = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/sync/config'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Sync costs
exports.syncCosts = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/sync/costs'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Sync LLMs push (instance → Firebase)
exports.syncLLMs = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/sync/llms'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Sync LLMs pull (Firebase → instance openclaw.json)
exports.syncLLMsPull = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/sync/llms/pull'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Refresh model catalog from provider APIs (shared, but runs on a specific instance)
exports.refreshCatalog = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/sync/catalog'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Full sync (all scripts on one instance)
exports.syncAll = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/sync/all'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Restart gateway on a specific instance
exports.restartGateway = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/instance/restart'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Update OpenClaw on a specific instance (npm update + restart)
exports.updateInstance = functions
  .region('europe-west1')
  .runWith({ timeoutSeconds: 180 })
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    try { return await callInstance(data, '/instance/update'); }
    catch (e) { throw new functions.https.HttpsError('internal', e.message); }
  });

// Get instance status (lightweight ping)
exports.pingInstance = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    requireAdmin(context);
    const instanceId = (data && data.instanceId) || 'alvi';
    try {
      const conn = await getInstanceConnection(instanceId);
      // Use GET for health check
      return await new Promise((resolve, reject) => {
        http.get({
          hostname: conn.host,
          port: conn.syncPort,
          path: '/health',
          timeout: 10000,
        }, (res) => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
            try { resolve({ status: 'ok', instanceId, ...JSON.parse(body) }); }
            catch { resolve({ status: 'ok', instanceId, raw: body }); }
          });
        }).on('error', (e) => resolve({ status: 'unreachable', instanceId, error: e.message }))
          .on('timeout', () => resolve({ status: 'timeout', instanceId }));
      });
    } catch (e) {
      return { status: 'error', instanceId, error: e.message };
    }
  });
