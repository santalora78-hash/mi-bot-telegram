const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// ⚙️ CONFIGURACIÓN — TU TOKEN YA PUESTO 👇
const TOKEN = process.env.BOT_TOKEN || '8878480430:AAGnU3GWR2fplLcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980; // TU ID DE TELEGRAM
const WHATSAPP_LINK = 'https://wa.me/+529241043399?text=Hola,%20quiero%20comprar%20una%20key';

// 🖼️ ENLACE DE TU IMAGEN DE DRIP CLIENT (déjalo vacío por ahora)
const IMAGEN_DRIP_CLIENT = "";

const bot = new Telegraf(TOKEN);

// ─── BASE DE DATOS ───
const db = {
    users: new Map(),
    stocks: new Map(),
    admins: new Set([ADMIN_ID]),
    sesiones: new Map(),
    historial: []
};

// ─── PRECIOS ACTUALIZADOS ───
const productos = {
    'drip_client': { 
        nombre: 'DRIP CLIENT', 
        precios: { '1d': 0.90, '7d': 4.00, '30d': 9.00 },
        imagen: IMAGEN_DRIP_CLIENT
    },
    'hg_cheats': { 
        nombre: 'HG CHEATS', 
        precios: { '1d': 1.00, '10d': 5.00, '30d': 9.00 }
    },
    'prime_hook': { 
        nombre: 'PRIME HOOK', 
        precios: { '1d': 0.90, '7d': 4.00, '21d': 9.00 }
    },
    'pato_team': { 
        nombre: 'PATO TEAM', 
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    },
    'cuban_proxy': { 
        nombre: 'CUBAN PROXY', 
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    },
    'drip_proxy': { 
        nombre: 'DRIP CLIENT PROXY', 
        precios: { '1d': 1.20, '7d': 4.00, '30d': 8.00 }
    },
    'netflix_proxy': { 
        nombre: 'NETFLIX PROXY', 
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    }
};

const duraciones = {
    '1d': '01 Día',
    '7d': '07 Días',
    '10d': '10 Días',
    '15d': '15 Días',
    '21d': '21 Días',
    '30d': '30 Días'
};

// ─── MANTENER BOT ACTIVO ───
const server = http.createServer((req, res) => { 
    res.end('ELITE SHOP BOT encendido ✅'); 
});
server.listen(process.env.PORT || 3000, () => console.log('🌐 Servidor activo'));

// ─── MENÚ PRINCIPAL CLIENTES ───
function menuPrincipal(ctx) {
    return ctx.replyWithHTML(
        `✅ ¡Hola <b>${ctx.from.first_name}</b>!\n\nBienvenido a <b>ELITE SHOP BOT</b> 🛒`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🛒 Comprar Keys', 'comprarkeys')],
            [Markup.button.callback('🎁 Mis Keys', 'miskeys'), Markup.button.callback('👤 Mi Cuenta', 'micuenta')],
            [Markup.button.callback('📜 Historial de Compras', 'historial')],
            [Markup.button.callback('📞 Soporte', 'soporte')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
}

bot.start((ctx) => menuPrincipal(ctx));
bot.action('menuprincipal', (ctx) => { ctx.answerCbQuery(); menuPrincipal(ctx); });

// ─── COMPRAR KEYS ───
function mostrarProductos(ctx) {
    ctx.replyWithHTML(
        `📦 <b>PRODUCTOS DISPONIBLES</b> 🔥\nSelecciona el artículo específico que deseas:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📱 DRIP CLIENT', 'prod_drip_client')],
            [Markup.button.callback('📱 HG CHEATS', 'prod_hg_cheats')],
            [Markup.button.callback('📱 PRIME HOOK', 'prod_prime_hook')],
            [Markup.button.callback('📱 PATO TEAM', 'prod_pato_team')],
            [Markup.button.callback('📱 CUBAN PROXY', 'prod_cuban_proxy')],
            [Markup.button.callback('📱 DRIP CLIENT PROXY', 'prod_drip_proxy')],
            [Markup.button.callback('📱 NETFLIX PROXY', 'prod_netflix_proxy')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
}
bot.action('comprarkeys', (ctx) => { ctx.answerCbQuery(); mostrarProductos(ctx); });

// ─── MOSTRAR PRECIOS ───
async function mostrarPrecios(ctx, prodKey) {
    const prod = productos[prodKey];
    const duracionesDisponibles = Object.keys(prod.precios);
    
    let texto = `📦 <b>${prod.nombre}</b>\n\n⏳ <b>SELECCIONA LA DURACIÓN DE TU LICENCIA:</b>\n\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    const teclado = [];
    for (const dur of duracionesDisponibles) {
        const stockKey = `${prodKey}_${dur}`;
        const stock = db.stocks.get(stockKey)?.length || 0;
        texto += `⏳ ${duraciones[dur]}   │   $${prod.precios[dur]} USD ${stock === 0 ? '❌ SIN STOCK' : '✅'}\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━\n`;
        if (stock > 0) {
            teclado.push(Markup.button.callback(`⏳ ${duraciones[dur]} - $${prod.precios[dur]}`, `buy_${prodKey}_${dur}`));
        }
    }

    const botones = [];
    for (let i = 0; i < teclado.length; i += 2) {
        botones.push(teclado.slice(i, i + 2));
    }
    botones.push([Markup.button.callback('🔙 Volver a Productos', 'comprarkeys')]);
    botones.push([Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]);

    if (prod.imagen && prod.imagen !== "") {
        try {
            await ctx.replyWithPhoto(prod.imagen, {
                caption: texto,
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard(botones)
            });
            return;
        } catch (e) {
            console.log('No se pudo cargar la imagen');
        }
    }

    ctx.replyWithHTML(texto, Markup.inlineKeyboard(botones));
}

bot.action('prod_drip_client', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'drip_client'); });
bot.action('prod_hg_cheats', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'hg_cheats'); });
bot.action('prod_prime_hook', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'prime_hook'); });
bot.action('prod_pato_team', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'pato_team'); });
bot.action('prod_cuban_proxy', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'cuban_proxy'); });
bot.action('prod_drip_proxy', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'drip_proxy'); });
bot.action('prod_netflix_proxy', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'netflix_proxy'); });

// ─── COMPRAR Y RECIBIR KEY AUTOMÁTICA ───
bot.action(/^buy_(.+)_(.+)$/, async (ctx) => {
    ctx.answerCbQuery();
    const match = ctx.callbackQuery.data.match(/^buy_(.+)_(.+)$/);
    const prodKey = match[1], duracion = match[2];
    const prod = productos[prodKey];
    const stockKey = `${prodKey}_${duracion}`;
    const stock = db.stocks.get(stockKey) || [];

    if (stock.length === 0) {
        return ctx.replyWithHTML(`❌ <b>PRODUCTO NO DISPONIBLE</b> ⚠️\n\nSin stocks por el momento.\nVuelve más tarde o consulta al soporte.`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver a Productos', 'comprarkeys')]]));
    }

    const key = stock.shift();
    db.stocks.set(stockKey, stock);

    db.historial.push({
        usuario: ctx.from.id,
        nombre: ctx.from.first_name,
        producto: prod.nombre,
        duracion: duraciones[duracion],
        precio: prod.precios[duracion],
        key: key,
        fecha: new Date().toLocaleDateString('es-MX')
    });

    ctx.replyWithHTML(
        `✅ <b>¡COMPRA EXITOSA!</b> 🎉\n\n` +
        `📦 ${prod.nombre}\n` +
        `⏳ ${duraciones[duracion]}\n` +
        `💰 Precio: $${prod.precios[duracion]} USD\n\n` +
        `🔑 <b>TU KEY:</b> <code>${key}</code>\n\n` +
        `⚠️ ¡GUÁRDALA BIEN! ⚠️`,
        Markup.inlineKeyboard([
            [Markup.button.url('💬 Pagar por WhatsApp', WHATSAPP_LINK)],
            [Markup.button.callback('🎁 Mis Keys', 'miskeys')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
});

// ─── AGREGAR STOCK (SOLO ADMIN) ───
bot.command('agregarstocks', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    
    const textoCompleto = ctx.message.text.substring(15).trim();
    const lineas = textoCompleto.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lineas.length < 2) {
        return ctx.replyWithHTML(`❌ <b>FORMATO INCORRECTO</b> ⚠️\n\nEscribe así:\n/agregarstocks DRIP CLIENT 1D\n18276292\n19837373\n19288388`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    }

    const header = lineas[0].toUpperCase();
    let prodKey = null, durKey = null;

    if (header.includes('DRIP CLIENT')) prodKey = 'drip_client';
    else if (header.includes('HG CHEATS')) prodKey = 'hg_cheats';
    else if (header.includes('PRIME HOOK')) prodKey = 'prime_hook';
    else if (header.includes('PATO TEAM')) prodKey = 'pato_team';
    else if (header.includes('CUBAN PROXY')) prodKey = 'cuban_proxy';
    else if (header.includes('DRIP CLIENT PROXY') || header.includes('DRIP PROXY')) prodKey = 'drip_proxy';
    else if (header.includes('NETFLIX PROXY')) prodKey = 'netflix_proxy';

    if (!prodKey) return ctx.reply('❌ Producto no reconocido');

    if (header.includes('1D')) durKey = '1d';
    else if (header.includes('7D')) durKey = '7d';
    else if (header.includes('10D')) durKey = '10d';
    else if (header.includes('15D')) durKey = '15d';
    else if (header.includes('21D')) durKey = '21d';
    else if (header.includes('30D')) durKey = '30d';

    if (!durKey) return ctx.reply('❌ Duración no reconocida. Usa: 1D, 7D, 10D, 15D, 21D o 30D');

    const stockKey = `${prodKey}_${durKey}`;
    const nuevasKeys = lineas.slice(1).filter(k => k.length > 0);
    
    if (!db.stocks.has(stockKey)) db.stocks.set(stockKey, []);
    const stockActual = db.stocks.get(stockKey);
    nuevasKeys.forEach(k => stockActual.push(k));
    db.stocks.set(stockKey, stockActual);

    let respuesta = `✅ <b>${nuevasKeys.length} KEYS AGREGADAS</b> 🎉\n\n` +
        `📦 ${productos[prodKey].nombre} — ${duraciones[durKey]}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n`;
    nuevasKeys.forEach((k, i) => respuesta += `🔑 ${k}\n`);
    respuesta += `━━━━━━━━━━━━━━━━━━━━\n✅ Total en stock: ${stockActual.length} keys`;

    ctx.replyWithHTML(respuesta, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

// ─── PANEL DE ADMIN ───
bot.command('admin', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return ctx.reply('❌ No tienes permiso');
    ctx.replyWithHTML(
        `✨ <b>PANEL DE ADMINISTRADOR</b> ✨\n\n🔒 Tu cuenta está PROTEGIDA\n✨ ELITE SHOP BOT 🚀`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📦 Agregar Stock', 'agregarstock_menu'), Markup.button.callback('📦 Ver Stocks', 'verstocks')],
            [Markup.button.callback('📢 Aviso General', 'avisogeneral')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
});

bot.action('agregarstock_menu', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `📦 <b>AGREGAR STOCK</b> 📦\n\nElige el producto:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📱 DRIP CLIENT', 'stock_drip_client')],
            [Markup.button.callback('📱 HG CHEATS', 'stock_hg_cheats')],
            [Markup.button.callback('📱 PRIME HOOK', 'stock_prime_hook')],
            [Markup.button.callback('📱 PATO TEAM', 'stock_pato_team')],
            [Markup.button.callback('📱 CUBAN PROXY', 'stock_cuban_proxy')],
            [Markup.button.callback('📱 DRIP CLIENT PROXY', 'stock_drip_proxy')],
            [Markup.button.callback('📱 NETFLIX PROXY', 'stock_netflix_proxy')],
            [Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]
        ])
    );
});

function menuDuracionStock(ctx, prodKey) {
    const prod = productos[prodKey];
    const duracionesDisponibles = Object.keys(prod.precios);
    const botones = duracionesDisponibles.map(dur => 
        [Markup.button.callback(`⏳ ${duraciones[dur]}`, `stockdur_${prodKey}_${dur}`)]
    );
    botones.push([Markup.button.callback('🔙 Volver a Productos', 'agregarstock_menu')]);
    botones.push([Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]);

    ctx.replyWithHTML(
        `📦 <b>${productos[prodKey].nombre}</b>\n\nElige la duración:`,
        Markup.inlineKeyboard(botones)
    );
}

bot.action('stock_drip_client', (ctx) => { ctx.answerCbQuery(); menuDuracionStock(ctx, 'drip_client'); });
bot.action('stock_hg_cheats', (ctx) => { ctx.answerCbQuery(); menuDuracionStock(ctx, 'hg_cheats'); });
bot.action('stock_prime_hook', (ctx) => { ctx.answerCbQuery(); menuDuracionStock(ctx, 'prime_hook'); });
bot.action('stock_pato_team', (ctx) => { ctx.answerCbQuery(); menuDuracionStock(ctx, 'pato_team'); });
bot.action('stock_cuban_proxy', (ctx) => { ctx.answerCbQuery(); menuDuracionStock(ctx, 'cuban_proxy'); });
bot.action('stock_drip_proxy', (ctx) => { ctx.answerCbQuery(); menuDuracionStock(ctx, 'drip_proxy'); });
bot.action('stock_netflix_proxy', (ctx) => { ctx.answerCbQuery(); menuDuracionStock(ctx, 'netflix_proxy'); });

bot.action(/^stockdur_(.+)_(.+)$/, (ctx) => {
    ctx.answerCbQuery();
    const match = ctx.callbackQuery.data.match(/^stockdur_(.+)_(.+)$/);
    const prodKey = match[1], durKey = match[2];
    const durTexto = durKey === '1d' ? '1D' : durKey === '7d' ? '7D' : durKey === '10d' ? '10D' : durKey === '15d' ? '15D' : durKey === '21d' ? '21D' : '30D';
    
    ctx.replyWithHTML(
        `📦 <b>AGREGAR STOCK — ${productos[prodKey].nombre} (${duraciones[durKey]})</b>\n\nEscribe las keys una debajo de otra así:\n\n/agregarstocks ${productos[prodKey].nombre} ${durTexto}\n18276292\n19837373\n19288388`,
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver a Duraciones', `stock_${prodKey}`)]])
    );
});

bot.command('verstocks', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    let texto = '📦 <b>STOCK DE PRODUCTOS</b> 📦\n\n';
    db.stocks.forEach((keys, clave) => {
        const [prodKey, durKey] = clave.split('_');
        if (keys.length > 0) {
            texto += `━━━━━━━━━━━━━━━━━━━━\n📦 ${productos[prodKey]?.nombre || prodKey} — ${duraciones[durKey]}\n📊 Cantidad: ${keys.length} keys\n`;
        }
    });
    if (texto === '📦 <b>STOCK DE PRODUCTOS</b> 📦\n\n') texto += '❌ No hay keys en stock';
    ctx.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});
bot.action('verstocks', (ctx) => { ctx.answerCbQuery(); ctx.command('verstocks'); });

bot.action('miskeys', (ctx) => {
    ctx.answerCbQuery();
    const misCompras = db.historial.filter(c => c.usuario === ctx.from.id);
    if (misCompras.length === 0) {
        return ctx.replyWithHTML(`🎁 <b>MIS KEYS</b>\n\n❌ No tienes keys compradas aún.`, Markup.inlineKeyboard([[Markup.button.callback('🛒 Comprar Keys', 'comprarkeys')], [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
    }
    let texto = `🎁 <b>MIS KEYS</b>\n\n`;
    misCompras.forEach(c => {
        texto += `━━━━━━━━━━━━━━━━━━━━\n📦 ${c.producto}\n⏳ ${c.duracion}\n🔑 <code>${c.key}</code>\n📅 ${c.fecha}\n`;
    });
    ctx.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.action('historial', (ctx) => {
    ctx.answerCbQuery();
    const misCompras = db.historial.filter(c => c.usuario === ctx.from.id);
    if (misCompras.length === 0) {
        return ctx.replyWithHTML(`📜 <b>HISTORIAL DE COMPRAS</b>\n\n❌ No tienes compras aún.`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
    }
    let texto = `📜 <b>HISTORIAL DE COMPRAS</b>\n\n`;
    misCompras.forEach(c => {
        texto += `📅 ${c.fecha} — ${c.producto} — $${c.precio} USD\n🔑 ${c.key}\n\n`;
    });
    ctx.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.action('micuenta', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`👤 <b>MI CUENTA</b>\n\n🆔 ID: <code>${ctx.from.id}</code>\n👤 Nombre: ${ctx.from.first_name}\n🤖 Bot: ELITE SHOP BOT`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.action('soporte', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`📞 <b>SOPORTE</b>\n\n💬 Escríbenos por WhatsApp:\n${WHATSAPP_LINK}`, Markup.inlineKeyboard([[Markup.button.url('💬 Ir a WhatsApp', WHATSAPP_LINK)], [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.launch().then(() => console.log('✅ ELITE SHOP BOT ENCENDIDO 🟢'));
            
