/**
 * DELTA VPN — Cloudflare Worker (один файл)
 * Домен: https://max.delta-good.workers.dev
 *
 * Эндпоинты:
 *   POST /api/create          — создать ссылку (max 3 устройства)
 *   GET  /sub/{hash}          — подписка + проверка HWID (Happ)
 *   GET  /api/info/{hash}     — сколько устройств занято
 *   DELETE /api/reset/{hash}  — сбросить HWID
 *
 * Требуется:
 *   1. D1 база с binding name = "DB"
 *   2. (опционально) SECRET = "твой_секрет" в Variables
 */

const SECRET = null; // поставь строку, например "delta_secret_2026", чтобы защитить /api/create

// ===================== ВСЕ СЕРВЕРА =====================
const SERVERS = `#profile-title: DELTA VPN • Unlimited
#subscription-userinfo: upload=0; download=0; total=0; expire=0
#profile-update-interval: 6
#announce: ⚡ DELTA VPN
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@q5b-16c-odr.fra.deepl-cdn.com:8443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=deepl.com&fp=qq&pbk=wKPAR2t-xoUMbBqRHV7SLvGuR9dwrcH6bTSknyBO0T8&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%AA%F0%9F%87%BA%20SMART-FRA
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@z5xa-geo-se.cdnvideo.network:443?encryption=none&flow=xtls-rprx-vision&security=tls&type=tcp&sni=geo-se.cdnvideo.network&fp=firefox&alpn=h2%2Chttp%2F1.1#%F0%9F%87%B8%F0%9F%87%AA%20SMART-SE
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@4avf-kdk4.ca.deepl-cdn.com:40443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=deepl.com&fp=qq&pbk=wKPAR2t-xoUMbBqRHV7SLvGuR9dwrcH6bTSknyBO0T8&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%A8%F0%9F%87%A6%20SMART-CA
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@px1t-tab.de-1.deepl-cdn.com:8443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=deepl.com&fp=qq&pbk=DG904eM7xGecwV_nhjX73c-7g_fGEv8BgjbeAmTE8Bs&sid=505c94b8c65afb0a&spx=/#%F0%9F%87%A9%F0%9F%87%AA%20SMART-DE
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@kdk4-geo-ca.cdnvideo.network:443?encryption=none&flow=xtls-rprx-vision&security=tls&type=tcp&sni=geo-ca.cdnvideo.network&fp=firefox&alpn=h2%2Chttp%2F1.1#%F0%9F%87%A8%F0%9F%87%A6%20SMART-CA%20%5BS%2B%5D
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@fn4t29qr8x7vb-mds.us.deepl-cdn.com:40443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=deepl.com&fp=qq&pbk=wKPAR2t-xoUMbBqRHV7SLvGuR9dwrcH6bTSknyBO0T8&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%BA%F0%9F%87%B8%20SMART-US
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@media-bs22-f53l.mx.yndx-cdn.com:20443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=player.mx.yndx-cdn.com&fp=firefox&pbk=DG904eM7xGecwV_nhjX73c-7g_fGEv8BgjbeAmTE8Bs&sid=505c94b8c65afb0a&spx=/#%F0%9F%87%B7%F0%9F%87%BA%20SMART-RU
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@agent-zi6-xr1.ita.deepl-cdn.com:8443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=deepl.com&fp=firefox&pbk=wKPAR2t-xoUMbBqRHV7SLvGuR9dwrcH6bTSknyBO0T8&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%AE%F0%9F%87%B9%20SMART-IT
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@mbt-7z5b-wzm.deepl-cdn.com:40443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=deepl.com&fp=firefox&pbk=wKPAR2t-xoUMbBqRHV7SLvGuR9dwrcH6bTSknyBO0T8&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%A9%F0%9F%87%AA%20SMART-DE2
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@z5xa-b1a-azar11.se.deepl-cdn.com:40443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=deepl.com&fp=qq&pbk=DG904eM7xGecwV_nhjX73c-7g_fGEv8BgjbeAmTE8Bs&sid=505c94b8c65afb0a&spx=/#%F0%9F%87%B8%F0%9F%87%AA%20SMART-SE2
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@bs22-f53l.mx.yndx-cdn.com:20443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=river-3-369.rtbcdn.ru&fp=firefox&pbk=DG904eM7xGecwV_nhjX73c-7g_fGEv8BgjbeAmTE8Bs&sid=505c94b8c65afb0a&spx=/#%F0%9F%87%B7%F0%9F%87%BA%20BRIDGE-RU
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@m221kk29-d4zzaq.gb.userapi.dev:40443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=sun9-39.userapi.com&fp=qq&pbk=DG904eM7xGecwV_nhjX73c-7g_fGEv8BgjbeAmTE8Bs&sid=505c94b8c65afb0a&spx=/#%F0%9F%87%AC%F0%9F%87%A7%20SMART-GB
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@178.248.238.133:10065?encryption=none&security=tls&type=ws&sni=stream-1.kinograd.online&fp=firefox&alpn=h3%2Ch2%2Chttp%2F1.1&host=stream-1.kinograd.online&path=%2Flive%2Fstream%3Fmodule%3Dvideo-cdn%26app_client_id%3Dcc8c59b8-7c86-417b-a522-b0cc29fcc2f8#%F0%9F%87%B7%F0%9F%87%BA%20LTE-24
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@178.248.238.81:2053?encryption=none&security=tls&type=ws&sni=stream.cdnvideo.network&fp=firefox&alpn=h3%2Ch2%2Chttp%2F1.1&host=stream.cdnvideo.network&path=%2Fstream%3Fed%3D2560%26module%3Dvideo-cdn%26app_client_id%3Dcc8c59b8-7c86-417b-a522-b0cc29fcc2f8#%F0%9F%87%B7%F0%9F%87%BA%20LTE-25
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@178.248.238.81:20443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=ads.x5.ru&fp=firefox&pbk=ZSzB9TQPGNcCiC0WLmciF5Jc8doJDvdRgbqTi8SCoEM&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%B7%F0%9F%87%BA%20LTE-8
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@81.161.98.162:10065?encryption=none&security=tls&type=ws&sni=kinograd.online&fp=qq&alpn=h3%2Ch2%2Chttp%2F1.1&host=kinograd.online&path=%2Flive%2Fstream%3Fmodule%3Dvideo-cdn%26app_client_id%3Dcc8c59b8-7c86-417b-a522-b0cc29fcc2f8#%F0%9F%87%B7%F0%9F%87%BA%20LTE-11
hysteria2://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@a0q11-x2rm.ru.mediavitrina.com:20443?sni=ru.mediavitrina.com&alpn=h3&fp=firefox#%F0%9F%87%B3%F0%9F%87%B1%20%23100%20LTE%20%D0%A3%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%5BHYS2%5D
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@za1z61t-m2a3xv.nlt.deepl-cdn.com:40443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=auth.deepl.com&fp=qq&pbk=wKPAR2t-xoUMbBqRHV7SLvGuR9dwrcH6bTSknyBO0T8&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%B3%F0%9F%87%B1%20%F0%9F%8F%B4%E2%80%8D%E2%98%A0%EF%B8%8F%20TORRENT-%D0%9D%D0%B8%D0%B4%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B4%D1%8B
hysteria2://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@m9-a4xm6-kmhu.ru.vkproxy.com:20443?sni=ru.mediavitrina.com&alpn=h3&fp=firefox#%F0%9F%87%B7%F0%9F%87%BA%20%23102%20%D0%A3%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%5BHYS2%5D
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@ww-fra-1.worldwide.yndx-cdn.com:443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=worldwide.yan.ngo&fp=ios&pbk=DG904eM7xGecwV_nhjX73c-7g_fGEv8BgjbeAmTE8Bs&sid=505c94b8c65afb0a&spx=/#%F0%9F%87%AB%F0%9F%87%B7%20%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%8F
hysteria2://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@b1-4xm6-xmhu.ru.vkproxy.com:30443?sni=ru.mediavitrina.com&alpn=h3&fp=firefox#%F0%9F%87%B7%F0%9F%87%BA%20%23103%20%D0%A3%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%5BHYS2%5D
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@ge171301-1624.46.vkproxy.com:8443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=amedia-vod.cdnvideo.ru&fp=qq&pbk=ZSzB9TQPGNcCiC0WLmciF5Jc8doJDvdRgbqTi8SCoEM&sid=a1b2c3d4e5f6789a&spx=/#%F0%9F%87%B3%F0%9F%87%B1%20%D1%83%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%BE%D0%B1%D1%85%D0%BE%D0%B4
hysteria2://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@ddq15-j2mu.ru.mediavitrina.com:20443?sni=ru.mediavitrina.com&alpn=h3&fp=firefox#%F0%9F%87%B3%F0%9F%87%B1%20%23100%20%D0%BE%D0%B1%D1%85%D0%BE%D0%B4
vless://f1ce9769-0e9f-44b1-b3a9-870f7d505c9b@ja4jaa3-61adf1.sg.y-tun.com:8443?encryption=none&flow=xtls-rprx-vision&security=reality&type=tcp&sni=auth.deepl.com&fp=qq&pbk=DG904eM7xGecwV_nhjX73c-7g_fGEv8BgjbeAmTE8Bs&sid=505c94b8c65afb0a&spx=/#%F0%9F%87%B8%F0%9F%87%A7%20%D1%81%D0%B8%D0%BD%D0%B3%D0%B0%D0%BF%D1%83%D1%80
hysteria2://2fed9da7-5cce-4083-ac11-ed11aff2e796@freeshka.i-love-russia.online:443?sni=freeshka.i-love-russia.online&alpn=h3#%F0%9F%87%B7%F0%9F%87%BA%20freeshka%20%5BHYS2%5D
trojan://_YoXP498_Tkk74Xspk5hcDh7qbaCTR45@vell.cishosts.org:8443?security=tls&type=tcp&sni=vell.cishosts.org&fp=qq&alpn=h2%2Chttp%2F1.1#%F0%9F%87%A8%F0%9F%87%AD%20%D0%A8%D0%B2%D0%B5%D0%B9%D1%86%D0%B0%D1%80%D0%B8%D1%8F
`;

// ===================== HELPERS =====================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Profile-Update-Interval": "6",
    },
  });
}

function randomHash(len = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) s += chars[arr[i] % chars.length];
  return s;
}

function now() {
  return new Date().toISOString();
}

async function initDB(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      hash TEXT PRIMARY KEY,
      max_devices INTEGER DEFAULT 3,
      note TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      hwid TEXT NOT NULL,
      first_seen TEXT,
      last_seen TEXT,
      UNIQUE(hash, hwid)
    );
  `);
}

// ===================== HANDLERS =====================
async function handleCreate(request, env) {
  if (SECRET) {
    const key = request.headers.get("X-API-Key") || "";
    if (key !== SECRET) return json({ ok: false, error: "unauthorized" }, 401);
  }

  let body = {};
  try {
    body = await request.json();
  } catch (_) {}

  const maxDevices = Math.min(Math.max(parseInt(body.max_devices) || 3, 1), 10);
  const note = (body.note || "").toString().slice(0, 100);
  const hash = randomHash(16);
  const created = now();

  await env.DB.prepare(
    `INSERT INTO subscriptions (hash, max_devices, note, created_at) VALUES (?, ?, ?, ?)`
  )
    .bind(hash, maxDevices, note, created)
    .run();

  const origin = new URL(request.url).origin;
  return json({
    ok: true,
    hash,
    subscription_url: `${origin}/sub/${hash}`,
    max_devices: maxDevices,
    created_at: created,
  });
}

async function handleSub(hash, request, env) {
  const sub = await env.DB.prepare(`SELECT * FROM subscriptions WHERE hash = ?`)
    .bind(hash)
    .first();

  if (!sub) return text("Subscription not found", 404);

  // HWID от Happ (и запасные варианты)
  const hwid =
    request.headers.get("x-hwid") ||
    request.headers.get("X-HWID") ||
    request.headers.get("hwid") ||
    "";

  if (!hwid) {
    // Без HWID всё равно отдаём (некоторые клиенты не шлют)
    return text(SERVERS);
  }

  // Уже есть такой HWID?
  const existing = await env.DB.prepare(
    `SELECT id FROM devices WHERE hash = ? AND hwid = ?`
  )
    .bind(hash, hwid)
    .first();

  if (existing) {
    await env.DB.prepare(`UPDATE devices SET last_seen = ? WHERE id = ?`)
      .bind(now(), existing.id)
      .run();
    return text(SERVERS);
  }

  // Сколько устройств уже привязано
  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM devices WHERE hash = ?`
  )
    .bind(hash)
    .first();

  const count = countRow?.cnt || 0;

  if (count >= sub.max_devices) {
    return json(
      {
        error: "device_limit",
        message: `Максимум ${sub.max_devices} устройства`,
        used: count,
        max: sub.max_devices,
      },
      403
    );
  }

  // Привязываем новое устройство
  await env.DB.prepare(
    `INSERT INTO devices (hash, hwid, first_seen, last_seen) VALUES (?, ?, ?, ?)`
  )
    .bind(hash, hwid, now(), now())
    .run();

  return text(SERVERS);
}

async function handleInfo(hash, env) {
  const sub = await env.DB.prepare(`SELECT * FROM subscriptions WHERE hash = ?`)
    .bind(hash)
    .first();
  if (!sub) return json({ ok: false, error: "not_found" }, 404);

  const devices = await env.DB.prepare(
    `SELECT hwid, first_seen, last_seen FROM devices WHERE hash = ? ORDER BY first_seen`
  )
    .bind(hash)
    .all();

  return json({
    ok: true,
    hash,
    max_devices: sub.max_devices,
    used: devices.results?.length || 0,
    note: sub.note,
    created_at: sub.created_at,
    devices: devices.results || [],
  });
}

async function handleReset(hash, request, env) {
  if (SECRET) {
    const key = request.headers.get("X-API-Key") || "";
    if (key !== SECRET) return json({ ok: false, error: "unauthorized" }, 401);
  }

  await env.DB.prepare(`DELETE FROM devices WHERE hash = ?`).bind(hash).run();
  return json({ ok: true, message: "devices reset" });
}

// ===================== MAIN =====================
export default {
  async fetch(request, env) {
    if (!env.DB) {
      return json({ error: "D1 database not bound. Set binding name = DB" }, 500);
    }

    // Инициализация таблиц (один раз)
    try {
      await initDB(env.DB);
    } catch (e) {
      // уже существуют — ок
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-API-Key, x-hwid",
        },
      });
    }

    // POST /api/create
    if (method === "POST" && path === "/api/create") {
      return handleCreate(request, env);
    }

    // GET /sub/{hash}
    const subMatch = path.match(/^\/sub\/([a-z0-9]+)$/i);
    if (method === "GET" && subMatch) {
      return handleSub(subMatch[1], request, env);
    }

    // GET /api/info/{hash}
    const infoMatch = path.match(/^\/api\/info\/([a-z0-9]+)$/i);
    if (method === "GET" && infoMatch) {
      return handleInfo(infoMatch[1], env);
    }

    // DELETE /api/reset/{hash}
    const resetMatch = path.match(/^\/api\/reset\/([a-z0-9]+)$/i);
    if (method === "DELETE" && resetMatch) {
      return handleReset(resetMatch[1], request, env);
    }

    // Главная
    if (path === "/" || path === "") {
      return json({
        name: "DELTA VPN API",
        endpoints: {
          "POST /api/create": "Создать ссылку",
          "GET /sub/{hash}": "Подписка (HWID)",
          "GET /api/info/{hash}": "Инфо по ссылке",
          "DELETE /api/reset/{hash}": "Сброс устройств",
        },
      });
    }

    return json({ error: "not_found" }, 404);
  },
};
