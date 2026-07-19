const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const TOKEN = process.env.BOT_TOKEN || '8878480430:AAGnU3GWR2fplLcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980;
const WHATSAPP_LINK = 'https://wa.me/+529241043399';

const bot = new Telegraf(TOKEN);

const db = {
    users: new Map(),
    stocks: new Map(),
    admins: new Set([ADMIN_ID]),
    historial: []
};

const productos = {
    'drip_client': { nombre: 'DRIP CLIENT', precios: { '1d': 0.90, '7d': 4.00, '30d': 9.00 } },
    'hg_cheats': { nombre: 'HG CHEATS', precios: { '1d': 1.00, '10d': 5.00, '30d': 9.00 } },
    'prime_hook': { nombre: 'PRIME HOOK', precios: { '1d': 0.90, '7d': 4.00, '21d': 9.00 } },
    'pato_team': { nombre: 'PATO TEAM', precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 } },
    'cuban_proxy': { nombre: 'CUBAN PROXY', precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 } },
    'drip_proxy': { nombre: 'DRIP PROXY', precios: { '1d': 1.20, '7d': 4.00, '30d': 8.00 } },
    'netflix_proxy': { nombre: 'NETFLIX PROXY', precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 } }
};

const duraciones = { '1d': '1 Día', '7d': '7 Días', '10d': '10 Días', '15d': '15 Días', '21d': '21 Días', '30d': '30 Días' };

const server = http.createServer((req, res) => res.end('ENCENDIDO ✅'));
server.listen(process.env.PORT || 3000);

function registrarUsuarioSiNoExiste(ctx) {
    if (!db.users.has(ctx.from.id)) {
        db.users.set(ctx.from.id, { nombre: ctx.from.first_name, usuario: null, contraseña: null, bloqueado: false });
    }
}

function estaBloqueado(id) { return db.users.get(id)?.bloqueado === true; }

function menuPrincipal(ctx) {
    registrarUsuarioSiNoExiste(ctx);
    if (estaBloqueado(ctx.from.id)) return ctx.replyWithHTML('⚠️ <b>TU USUARIO HA SIDO BLOQUEADO POR EL ADMIN</b>');
    ctx.replyWithHTML(`✅ Hola <b>${ctx.from.first_name}</b>!\nPORTAL ARCEUS 🛒`, Markup.inlineKeyboard([
        [Markup.button.callback('🛒 Comprar Keys', 'comprarkeys')],
        [Markup.button.callback('🎁 Mis Keys', 'miskeys'), Markup.button.callback('👤 Mi Cuenta', 'micuenta')],
        [Markup.button.callback('📜 Historial', 'historial')],
        [Markup.button.callback('🔙 Volver al Menú', 'menuprincipal')]
    ]));
}

bot.start(c => menuPrincipal(c));
bot.action('menuprincipal', c => { c.answerCbQuery(); menuPrincipal(c); });

bot.command('admin', c => {
    if (!db.admins.has(c.from.id)) return;
    c.replyWithHTML(`✨ <b>PANEL DE ADMINISTRADOR</b> ✨\n🔒 Tu cuenta está PROTEGIDA\n✨ PORTAL ARCEUS 🚀`, Markup.inlineKeyboard([
        [Markup.button.callback('👤 Crear Usuario', 'crearusuario'), Markup.button.callback('🗑️ Quitar Admin', 'quitaradmin')],
        [Markup.button.callback('⭐ Agregar VIP', 'agregarvip'), Markup.button.callback('💰 Agregar Saldo', 'agregarsaldo')],
        [Markup.button.callback('👥 Ver Usuarios', 'verusuarios'), Markup.button.callback('📊 Total Usuarios', 'totalusuarios')],
        [Markup.button.callback('🗑️ Eliminar Usuario', 'menu_eliminar'), Markup.button.callback('🔒 Bloquear Usuario', 'menu_bloquear')],
        [Markup.button.callback('📦 Agregar Stock', 'agregarstock'), Markup.button.callback('✏️ Editar Stock', 'editarstock')],
        [Markup.button.callback('🗑️ Quitar Stock', 'quitarstock'), Markup.button.callback('📦 Ver Stocks', 'verstocks')],
        [Markup.button.callback('🎁 Agregar Case', 'agregarcase'), Markup.button.callback('🔑 Generar Llaves', 'generarllaves')],
        [Markup.button.callback('🛒 Comprar Keys', 'comprarkeys'), Markup.button.callback('📢 Aviso General', 'avisogeneral')],
        [Markup.button.callback('🔙 Volver al Menú', 'menuprincipal')]
    ]));
});

bot.action('menu_eliminar', c => {
    c.answerCbQuery();
    c.replyWithHTML(`🗑️ <b>ELIMINAR USUARIO</b>\n\nEscribe así:\n/eliminarusuario nombre_usuario`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel', 'admin')]]));
});

bot.command('eliminarusuario', c => {
    if (!db.admins.has(c.from.id)) return;
    const nombre = c.message.text.substring(16).trim();
    if (!nombre) return c.replyWithHTML(`❌ Escribe:\n/eliminarusuario juan77`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
    let encontrado = false;
    for (const [id, datos] of db.users) {
        if (datos.usuario === nombre) { db.users.delete(id); encontrado = true; break; }
    }
    c.replyWithHTML(encontrado ? `✅ <b>USUARIO ELIMINADO</b>` : `❌ <b>No encontrado</b>`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('menu_bloquear', c => {
    c.answerCbQuery();
    c.replyWithHTML(`🔒 <b>BLOQUEAR USUARIO</b>\n\nEscribe así:\n/bloquearusuario nombre_usuario`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel', 'admin')]]));
});

bot.command('bloquearusuario', c => {
    if (!db.admins.has(c.from.id)) return;
    const nombre = c.message.text.substring(16).trim();
    if (!nombre) return c.replyWithHTML(`❌ Escribe:\n/bloquearusuario juan77`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
    let uid = null;
    for (const [id, datos] of db.users) {
        if (datos.usuario === nombre) { datos.bloqueado = true; uid = id; break; }
    }
    if (uid) c.telegram.sendMessage(uid, `⚠️ TU USUARIO HA SIDO BLOQUEADO POR EL ADMIN`);
    c.replyWithHTML(uid ? `✅ <b>USUARIO BLOQUEADO</b>` : `❌ <b>No encontrado</b>`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('crearusuario', c => {
    c.answerCbQuery();
    c.replyWithHTML(`👤 <b>CREAR USUARIO</b>\n\nEscribe así:\n/crearusuario user:nombre contraseña:1234`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.command('crearusuario', c => {
    if (!db.admins.has(c.from.id)) return;
    const texto = c.message.text.substring(14).trim();
    const user = texto.match(/user:\s*(\S+)/i)?.[1];
    const pass = texto.match(/contraseña:\s*(\S+)/i)?.[1];
    if (!user || !pass) return c.replyWithHTML(`❌ Formato:\n/crearusuario user:pedro contraseña:1234`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
    let existe = null;
    for (const [id, d] of db.users) if (d.usuario === user) existe = id;
    if (existe) { db.users.get(existe).contraseña = pass; db.users.get(existe).bloqueado = false; }
    else db.users.set(Date.now(), { nombre: user, usuario: user, contraseña: pass, bloqueado: false });
    c.replyWithHTML(`✅ <b>USUARIO CREADO</b>\n👤 ${user}\n🔑 ${pass}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('verusuarios', c => {
    c.answerCbQuery();
    let texto = `👥 <b>LISTA DE USUARIOS</b>\n\n`;
    if (db.users.size === 0) texto += `❌ Sin usuarios`;
    else db.users.forEach((u, id) => { texto += `👤 ${u.usuario || 'Sin usuario'} — ${u.bloqueado ? '🔒 Bloqueado' : '✅ Activo'}\n🆔 ${id}\n\n`; });
    c.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('totalusuarios', c => {
    c.answerCbQuery();
    const bloq = Array.from(db.users.values()).filter(u => u.bloqueado).length;
    c.replyWithHTML(`📊 <b>TOTAL USUARIOS</b>\n\n👤 Total: ${db.users.size}\n✅ Activos: ${db.users.size - bloq}\n🔒 Bloqueados: ${bloq}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('comprarkeys', c => { c.answerCbQuery(); c.replyWithHTML(`🛒 <b>PRODUCTOS</b>`, Markup.inlineKeyboard([
    [Markup.button.callback('📱 DRIP CLIENT', 'prod_drip_client')],
    [Markup.button.callback('📱 HG CHEATS', 'prod_hg_cheats')],
    [Markup.button.callback('📱 PRIME HOOK', 'prod_prime_hook')],
    [Markup.button.callback('📱 PATO TEAM', 'prod_pato_team')],
    [Markup.button.callback('📱 CUBAN PROXY', 'prod_cuban_proxy')],
    [Markup.button.callback('📱 DRIP PROXY', 'prod_drip_proxy')],
    [Markup.button.callback('📱 NETFLIX PROXY', 'prod_netflix_proxy')],
    [Markup.button.callback('🔙 Volver', 'menuprincipal')]
]))});

bot.action(/^prod_(.+)$/, c => {
    c.answerCbQuery();
    const p = c.callbackQuery.data.split('_')[1];
    const prod = productos[p];
    let texto = `📦 <b>${prod.nombre}</b>\n\n`;
    const botones = [];
    for (const [d, precio] of Object.entries(prod.precios)) {
        const stock = db.stocks.get(`${p}_${d}`)?.length || 0;
        texto += `⏳ ${duraciones[d]} — $${precio} USD ${stock === 0 ? '❌' : '✅'}\n`;
        if (stock > 0) botones.push([Markup.button.callback(`⏳ ${duraciones[d]} — $${precio}`, `buy_${p}_${d}`)]);
    }
    botones.push([Markup.button.callback('🔙 Volver', 'comprarkeys')]);
    c.replyWithHTML(texto, Markup.inlineKeyboard(botones));
});

bot.action(/^buy_(.+)_(.+)$/, c => {
    c.answerCbQuery();
    const [_, p, d] = c.callbackQuery.data.match(/^buy_(.+)_(.+)$/);
    const stockKey = `${p}_${d}`;
    const stock = db.stocks.get(stockKey) || [];
    if (stock.length === 0) return c.replyWithHTML(`❌ SIN STOCK`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', `prod_${p}`)]]));
    const key = stock.shift();
    db.stocks.set(stockKey, stock);
    db.historial.push({ usuario: c.from.id, producto: productos[p].nombre, duracion: duraciones[d], key, fecha: new Date().toLocaleDateString('es-MX') });
    c.replyWithHTML(`✅ <b>COMPRA EXITOSA</b>\n📦 ${productos[p].nombre}\n⏳ ${duraciones[d]}\n🔑 <code>${key}</code>`, Markup.inlineKeyboard([[Markup.button.url('💬 Pagar', WHATSAPP_LINK)], [Markup.button.callback('🎁 Mis Keys', 'miskeys')]]));
});

bot.command('agregarstocks', c => {
    if (!db.admins.has(c.from.id)) return;
    const lineas = c.message.text.substring(15).split('\n').map(l => l.trim()).filter(l => l);
    if (lineas.length < 2) return c.replyWithHTML(`❌ Formato:\n/agregarstocks DRIP CLIENT 1D\nKEY1\nKEY2`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
    const header = lineas[0].toUpperCase();
    let p = null, d = null;
    if (header.includes('DRIP CLIENT')) p = 'drip_client';
    else if (header.includes('HG CHEATS')) p = 'hg_cheats';
    else if (header.includes('PRIME HOOK')) p = 'prime_hook';
    else if (header.includes('PATO TEAM')) p = 'pato_team';
    else if (header.includes('CUBAN PROXY')) p = 'cuban_proxy';
    else if (header.includes('DRIP PROXY')) p = 'drip_proxy';
    else if (header.includes('NETFLIX PROXY')) p = 'netflix_proxy';
    if (!p) return c.reply(`❌ Producto inválido`);
    if (header.includes('1D')) d = '1d';
    else if (header.includes('7D')) d = '7d';
    else if (header.includes('10D')) d = '10d';
    else if (header.includes('15D')) d = '15d';
    else if (header.includes('21D')) d = '21d';
    else if (header.includes('30D')) d = '30d';
    if (!d) return c.reply(`❌ Duración inválida`);
    const stockKey = `${p}_${d}`;
    const keys = lineas.slice(1).filter(k => k);
    if (!db.stocks.has(stockKey)) db.stocks.set(stockKey, []);
    keys.forEach(k => db.stocks.get(stockKey).push(k));
    c.replyWithHTML(`✅ <b>${keys.length} KEYS AGREGADAS</b>\n📦 ${productos[p].nombre} — ${duraciones[d]}\n📊 Total: ${db.stocks.get(stockKey).length}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('agregarstock', c => {
    c.answerCbQuery();
    c.replyWithHTML(`📦 <b>AGREGAR STOCK</b>\n\nElige producto:`, Markup.inlineKeyboard([
        [Markup.button.callback('📱 DRIP CLIENT', 'stock_drip_client')],
        [Markup.button.callback('📱 HG CHEATS', 'stock_hg_cheats')],
        [Markup.button.callback('📱 PRIME HOOK', 'stock_prime_hook')],
        [Markup.button.callback('📱 PATO TEAM', 'stock_pato_team')],
        [Markup.button.callback('📱 CUBAN PROXY', 'stock_cuban_proxy')],
        [Markup.button.callback('📱 DRIP PROXY', 'stock_drip_proxy')],
        [Markup.button.callback('📱 NETFLIX PROXY', 'stock_netflix_proxy')],
        [Markup.button.callback('🔙 Volver', 'admin')]
    ]));
});

bot.action(/^stock_(.+)$/, c => {
    c.answerCbQuery();
    const p = c.callbackQuery.data.split('_')[1];
    const botones = Object.keys(productos[p].precios).map(d => [Markup.button.callback(`⏳ ${duraciones[d]}`, `stockdur_${p}_${d}`)]);
    botones.push([Markup.button.callback('🔙 Volver', 'agregarstock')]);
    c.replyWithHTML(`📦 <b>${productos[p].nombre}</b>\nElige duración:`, Markup.inlineKeyboard(botones));
});

bot.action(/^stockdur_(.+)_(.+)$/, c => {
    c.answerCbQuery();
    const [_, p, d] = c.callbackQuery.data.match(/^stockdur_(.+)_(.+)$/);
    const dur = d === '1d' ? '1D' : d === '7d' ? '7D' : d === '10d' ? '10D' : d === '15d' ? '15D' : d === '21d' ? '21D' : '30D';
    c.replyWithHTML(`📦 <b>AGREGAR STOCK — ${productos[p].nombre} (${duraciones[d]})</b>\n\nEscribe así:\n/agregarstocks ${productos[p].nombre} ${dur}\nKEY1\nKEY2`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('verstocks', c => {
    c.answerCbQuery();
    let texto = `📦 <b>STOCK DE PRODUCTOS</b>\n\n`;
    db.stocks.forEach((keys, clave) => {
        const [p, d] = clave.split('_');
        if (keys.length > 0) texto += `📦 ${productos[p]?.nombre || p} — ${duraciones[d]}\n📊 ${keys.length} keys\n\n`;
    });
    if (texto === `📦 <b>STOCK DE PRODUCTOS</b>\n\n`) texto += `❌ Sin stock`;
    c.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]]));
});

bot.action('miskeys', c => {
    c.answerCbQuery();
    const mis = db.historial.filter(x => x.usuario === c.from.id);
    if (mis.length === 0) return c.replyWithHTML(`🎁 <b>MIS KEYS</b>\n\n❌ No tienes compras`, Markup.inlineKeyboard([[Markup.button.callback('🛒 Comprar', 'comprarkeys')]]));
    let texto = `🎁 <b>MIS KEYS</b>\n\n`;
    mis.forEach(x => texto += `📦 ${x.producto}\n⏳ ${x.duracion}\n🔑 <code>${x.key}</code>\n📅 ${x.fecha}\n\n`);
    c.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'menuprincipal')]]));
});

bot.action('historial', c => {
    c.answerCbQuery();
    const mis = db.historial.filter(x => x.usuario === c.from.id);
    if (mis.length === 0) return c.replyWithHTML(`📜 <b>HISTORIAL</b>\n\n❌ Sin compras`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'menuprincipal')]]));
    let texto = `📜 <b>HISTORIAL</b>\n\n`;
    mis.forEach(x => texto += `📅 ${x.fecha} — ${x.producto} — $${productos[Object.keys(productos).find(k => productos[k].nombre === x.producto)]?.precios?.[x.duracion] || '---'} USD\n🔑 ${x.key}\n\n`);
    c.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'menuprincipal')]]));
});

bot.action('micuenta', c => {
    c.answerCbQuery();
    c.replyWithHTML(`👤 <b>MI CUENTA</b>\n\n🆔 ID: <code>${c.from.id}</code>\n👤 Nombre: ${c.from.first_name}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'menuprincipal')]]));
});

bot.action('quitaradmin', c => { c.answerCbQuery(); c.replyWithHTML(`🗑️ Escribe:\n/quitaradmin ID`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });
bot.action('agregarvip', c => { c.answerCbQuery(); c.replyWithHTML(`⭐ Escribe:\n/agregarvip ID DIAS`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });
bot.action('agregarsaldo', c => { c.answerCbQuery(); c.replyWithHTML(`💰 Escribe:\n/agregarsaldo ID CANTIDAD`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });
bot.action('editarstock', c => { c.answerCbQuery(); c.replyWithHTML(`✏️ Escribe:\n/editardstock PRODUCTO DURACIÓN`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });
bot.action('quitarstock', c => { c.answerCbQuery(); c.replyWithHTML(`🗑️ Escribe:\n/quitarstock PRODUCTO DURACIÓN`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });
bot.action('agregarcase', c => { c.answerCbQuery(); c.replyWithHTML(`🎁 Escribe:\n/agregarcase NOMBRE PRECIO`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });
bot.action('generarllaves', c => { c.answerCbQuery(); c.replyWithHTML(`🔑 Escribe:\n/generarllaves CANTIDAD`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });
bot.action('avisogeneral', c => { c.answerCbQuery(); c.replyWithHTML(`📢 Escribe:\n/avisogeneral Tu mensaje`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'admin')]])); });

bot.launch().then(() => console.log('✅ ENCENDIDO'));
           
