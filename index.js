const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const TOKEN = process.env.BOT_TOKEN || '8878480430:AAGnU3GWR2fpILcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980;
const WHATSAPP_LINK = 'https://wa.me/+529241043399?text=Hola,%20quiero%20registrarme%20en%20el%20bot%20de%20telegram';

const bot = new Telegraf(TOKEN);

// ─── SEGURIDAD ───
const intentosFallidos = new Map();
const BLOQUEO_TIEMPO = 5 * 60 * 1000;

const db = {
    users: new Map(),
    admins: new Set([ADMIN_ID]),
    sesiones: new Map()
};

// ─── PRODUCTOS Y PRECIOS ───
const productos = {
    'drip_client': {
        nombre: 'DRIP CLIENT APKMOD',
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    },
    'hg_cheats': {
        nombre: 'HG CHEATS APKMOD',
        precios: { '1d': 2, '7d': 6, '15d': 12, '30d': 15 }
    },
    'prime_hook': {
        nombre: 'PRIME HOOK APKMOD',
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    },
    'pato_team': {
        nombre: 'PATO TEAM APKMOD',
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    },
    'cuban_proxy': {
        nombre: 'CUBAN PROXY APKMOD',
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    },
    'drip_proxy': {
        nombre: 'DRIP CLIENT PROXY APKMOD',
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    },
    'netflix_proxy': {
        nombre: 'NETFLIX PROXY APKMOD',
        precios: { '1d': 3, '7d': 8, '15d': 13, '30d': 17 }
    }
};

// ─── PUERTO ───
const server = http.createServer((req, res) => {
  res.end('Bot encendido ✅');
});
server.listen(process.env.PORT || 3000, () => console.log('🌐 Puerto abierto'));

// ─── MENÚ PRINCIPAL ───
function menuPrincipal(ctx) {
    return ctx.replyWithHTML(
        `✅ ¡Hola <b>${ctx.from.first_name}</b>!\n\nBienvenido al bot. Inicia sesión para continuar.`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🛒 Comprar Keys', 'comprarkeys')],
            [Markup.button.callback('👤 Mi Cuenta', 'micuenta'), Markup.button.callback('📩 Soporte', 'soporte')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
}

bot.start((ctx) => menuPrincipal(ctx));
bot.action('menuprincipal', (ctx) => { ctx.answerCbQuery(); menuPrincipal(ctx); });

// ─── SOPORTE ───
bot.command('soporte', (ctx) => {
    ctx.replyWithHTML(
        `📩 <b>SOPORTE Y REGISTRO</b> 📩\n\n` +
        `¿No tienes cuenta aún? 🤔\n\n` +
        `💡 Escríbeme por WhatsApp y te creo tu usuario al instante:\n` +
        `👤 Usuario + 🔐 Contraseña listos en minutos ⚡\n\n` +
        `👇 <b>TOCA AQUÍ</b> 👇\n` +
        `🔗 <a href="${WHATSAPP_LINK}">💬 Escríbeme por WhatsApp</a>\n\n` +
        `✉️ El mensaje ya viene escrito:\n` +
        `<i>"Hola, quiero registrarme en el bot de telegram"</i> 📝`,
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
    );
});

bot.action('soporte', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `📩 <b>SOPORTE Y REGISTRO</b> 📩\n\n` +
        `¿No tienes cuenta aún? 🤔\n\n` +
        `💡 Escríbeme por WhatsApp y te creo tu usuario al instante:\n` +
        `👤 Usuario + 🔐 Contraseña listos en minutos ⚡\n\n` +
        `👇 <b>TOCA AQUÍ</b> 👇\n` +
        `🔗 <a href="${WHATSAPP_LINK}">💬 Escríbeme por WhatsApp</a>\n\n` +
        `✉️ El mensaje ya viene escrito:\n` +
        `<i>"Hola, quiero registrarme en el bot de telegram"</i> 📝`,
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
    );
});

// ─── LOGIN ───
bot.command('login', (ctx) => {
    const userId = ctx.from.id;
    
    if (intentosFallidos.has(userId) && Date.now() < intentosFallidos.get(userId)) {
        return ctx.replyWithHTML(
            `❌ <b>DEMASIADOS INTENTOS FALLIDOS</b> ⚠️\n\nInténtalo de nuevo en 5 minutos.`,
            Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
        );
    }

    const texto = ctx.message.text.substring(6).trim();
    const partes = texto.split(' ');
    const usuario = partes[0];
    const contraseña = partes[1];

    if (!usuario || !contraseña) {
        return ctx.replyWithHTML(
            `🔐 <b>INICIAR SESIÓN</b>\n\nEscribe así:\n/login usuario contraseña`,
            Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
        );
    }

    if (!db.users.has(usuario)) {
        let intentos = intentosFallidos.get(userId)?.intentos || 0;
        intentos++;
        if (intentos >= 5) {
            intentosFallidos.set(userId, Date.now() + BLOQUEO_TIEMPO);
            return ctx.replyWithHTML(
                `❌ <b>USUARIO NO REGISTRADO</b> ❌\n\n` +
                `⚠️ Este usuario no existe en nuestro sistema.\n\n` +
                `💬 <b>PARA CREAR TU CUENTA:</b>\n` +
                `📱 Escríbeme por WhatsApp y te doy acceso rápido 🚀\n\n` +
                `👇 <b>TOCA AQUÍ</b> 👇\n` +
                `🔗 <a href="${WHATSAPP_LINK}">💬 Escríbeme por WhatsApp</a>\n\n` +
                `✉️ El mensaje se envía automáticamente ✅\n\nIntentos: ${intentos}/5`,
                Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
            );
        }
        intentosFallidos.set(userId, { intentos });
        return ctx.replyWithHTML(
            `❌ <b>USUARIO NO REGISTRADO</b> ❌\n\n` +
            `⚠️ Este usuario no existe en nuestro sistema.\n\n` +
            `💬 <b>PARA CREAR TU CUENTA:</b>\n` +
            `📱 Escríbeme por WhatsApp y te doy acceso rápido 🚀\n\n` +
            `👇 <b>TOCA AQUÍ</b> 👇\n` +
            `🔗 <a href="${WHATSAPP_LINK}">💬 Escríbeme por WhatsApp</a>\n\n` +
            `✉️ El mensaje se envía automáticamente ✅\n\nIntentos: ${intentos}/5`,
            Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
        );
    }

    const datos = db.users.get(usuario);
    if (datos.contraseña !== contraseña) {
        let intentos = intentosFallidos.get(userId)?.intentos || 0;
        intentos++;
        if (intentos >= 5) {
            intentosFallidos.set(userId, Date.now() + BLOQUEO_TIEMPO);
            return ctx.replyWithHTML(
                `❌ <b>CONTRASEÑA INCORRECTA</b> ❌\n\nBloqueado por 5 minutos.`,
                Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
            );
        }
        intentosFallidos.set(userId, { intentos });
        return ctx.replyWithHTML(
            `❌ <b>CONTRASEÑA INCORRECTA</b> ❌\n\nIntentos: ${intentos}/5`,
            Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
        );
    }

    intentosFallidos.delete(userId);
    db.sesiones.set(userId, { usuario, activa: true });
    ctx.replyWithHTML(
        `✅ <b>¡BIENVENIDO ${usuario}!</b> 🎉\n\nSesión iniciada correctamente.`,
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
    );
});

// ─── COMPRAR KEYS — LISTA DE PRODUCTOS ───
function mostrarProductos(ctx) {
    ctx.replyWithHTML(
        `🎁 <b>COMPRAR KEYS</b> 🎁\n\nElige el producto que quieres comprar:\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📱 DRIP CLIENT APKMOD\n` +
        `📱 HG CHEATS APKMOD\n` +
        `📱 PRIME HOOK APKMOD\n` +
        `📱 PATO TEAM APKMOD\n` +
        `📱 CUBAN PROXY APKMOD\n` +
        `📱 DRIP CLIENT PROXY APKMOD\n` +
        `📱 NETFLIX PROXY APKMOD\n` +
        `━━━━━━━━━━━━━━━━━━━━`,
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

bot.command('comprarkeys', mostrarProductos);
bot.action('comprarkeys', (ctx) => { ctx.answerCbQuery(); mostrarProductos(ctx); });

// ─── MOSTRAR PRECIOS DE CADA PRODUCTO ───
function mostrarPrecios(ctx, prodKey) {
    const prod = productos[prodKey];
    ctx.replyWithHTML(
        `📱 <b>${prod.nombre}</b>\n\n` +
        `⏳ 1 Día    →   $${prod.precios['1d']} USD\n` +
        `⏳ 7 Días   →   $${prod.precios['7d']} USD\n` +
        `⏳ 15 Días  →  $${prod.precios['15d']} USD\n` +
        `⏳ 30 Días  →  $${prod.precios['30d']} USD\n\nElige la duración:`,
        Markup.inlineKeyboard([
            [Markup.button.callback(`⏳ 1 Día - $${prod.precios['1d']}`, `buy_${prodKey}_1d`)],
            [Markup.button.callback(`⏳ 7 Días - $${prod.precios['7d']}`, `buy_${prodKey}_7d`)],
            [Markup.button.callback(`⏳ 15 Días - $${prod.precios['15d']}`, `buy_${prodKey}_15d`)],
            [Markup.button.callback(`⏳ 30 Días - $${prod.precios['30d']}`, `buy_${prodKey}_30d`)],
            [Markup.button.callback('🔙 Volver a Productos', 'comprarkeys')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
}

// Botones de productos
bot.action('prod_drip_client', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'drip_client'); });
bot.action('prod_hg_cheats', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'hg_cheats'); });
bot.action('prod_prime_hook', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'prime_hook'); });
bot.action('prod_pato_team', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'pato_team'); });
bot.action('prod_cuban_proxy', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'cuban_proxy'); });
bot.action('prod_drip_proxy', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'drip_proxy'); });
bot.action('prod_netflix_proxy', (ctx) => { ctx.answerCbQuery(); mostrarPrecios(ctx, 'netflix_proxy'); });

// Confirmación de compra
bot.action(/^buy_(.+)_(.+)$/, (ctx) => {
    ctx.answerCbQuery();
    const match = ctx.callbackQuery.data.match(/^buy_(.+)_(.+)$/);
    const prodKey = match[1];
    const duracion = match[2];
    const prod = productos[prodKey];
    
    const diasTexto = duracion === '1d' ? '1 Día' : duracion === '7d' ? '7 Días' : duracion === '15d' ? '15 Días' : '30 Días';
    
    ctx.replyWithHTML(
        `✅ <b>¡SOLICITUD ENVIADA!</b> 🎉\n\n` +
        `📱 Producto: ${prod.nombre}\n` +
        `⏳ Duración: ${diasTexto}\n` +
        `💰 Precio: $${prod.precios[duracion]} USD\n\n` +
        `💬 Para pagar y recibir tu key, escríbeme por WhatsApp:`,
        Markup.inlineKeyboard([
            [Markup.button.url('💬 Pagar por WhatsApp', WHATSAPP_LINK)],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
});

// ─── MI CUENTA ───
bot.action('micuenta', (ctx) => {
    ctx.answerCbQuery();
    const sesion = db.sesiones.get(ctx.from.id);
    if (!sesion || !sesion.activa) {
        return ctx.replyWithHTML(
            `❌ No tienes sesión abierta. Usa /login`,
            Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
        );
    }
    const datos = db.users.get(sesion.usuario);
    ctx.replyWithHTML(
        `👤 <b>MI CUENTA</b>\n\n` +
        `Usuario: ${sesion.usuario}\n` +
        `Saldo: ${datos.saldo}\n` +
        `Estado: ${datos.vip ? '⭐ VIP' : 'Usuario normal'}`,
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])
    );
});

// ─── PANEL DE ADMIN ───
bot.command('admin', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return ctx.reply('❌ No tienes permiso');
    ctx.replyWithHTML(
        `✨ <b>PANEL DE ADMINISTRADOR</b> ✨\n\n🔒 Tu cuenta está PROTEGIDA\n✨ PORTAL ARCEUS 🚀`,
        Markup.inlineKeyboard([
            [Markup.button.callback('👤 Crear Usuario', 'crearusuario'), Markup.button.callback('⭐ Agregar VIP', 'agregarvip')],
            [Markup.button.callback('👥 Ver Usuarios', 'verusuarios'), Markup.button.callback('📊 Total Usuarios', 'totalusuarios')],
            [Markup.button.callback('📢 Aviso General', 'avisogeneral')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
});

bot.command('crearusuario', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    const texto = ctx.message.text.substring(13).trim();
    const matchUser = texto.match(/user:\s*(\S+)/i);
    const matchPass = texto.match(/contraseña:\s*(\S+)/i);
    if (!matchUser || !matchPass) return ctx.replyWithHTML(`❌ <b>FORMATO INCORRECTO</b> ⚠️\n\nEscribe así:\n/crearusuario\nuser:nombre\ncontraseña:tucontraseña`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
    const usuario = matchUser[1], contraseña = matchPass[1];
    if (db.users.has(usuario)) return ctx.reply('❌ Este usuario ya existe');
    db.users.set(usuario, { contraseña, saldo: 0, vip: false });
    ctx.replyWithHTML(`✅ <b>USUARIO CREADO</b> 🎉\n\n👤 Usuario: ${usuario}\n🔐 Contraseña: ${contraseña}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.command('agregarvip', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    const texto = ctx.message.text.substring(12).trim();
    const matchUser = texto.match(/user:\s*(\S+)/i);
    const matchPass = texto.match(/contraseña:\s*(\S+)/i);
    const matchSaldo = texto.match(/saldo:\s*(\d+)/i);
    if (!matchUser || !matchPass || !matchSaldo) return ctx.replyWithHTML(`❌ <b>FORMATO INCORRECTO</b> ⚠️\n\nEscribe así:\n/agregarvip\nuser:nombre\ncontraseña:clave\nsaldo:10`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
    const usuario = matchUser[1], contraseña = matchPass[1], saldo = parseInt(matchSaldo[1]);
    if (db.users.has(usuario)) return ctx.reply('❌ Este usuario ya existe');
    db.users.set(usuario, { contraseña, saldo, vip: true });
    ctx.replyWithHTML(`✅ <b>USUARIO VIP CREADO</b> 🎉\n\n👤 Usuario: ${usuario}\n🔐 Contraseña: ${contraseña}\n⭐ VIP ACTIVO\n💰 Saldo: ${saldo}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.command('avisogeneral', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    const match = ctx.message.text.substring(14).trim().match(/¡(.+)!/);
    if (!match) return ctx.replyWithHTML(`❌ <b>FORMATO INCORRECTO</b> ⚠️\n\nEscribe así:\n/avisogeneral ¡Tu mensaje aquí!`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
    const mensaje = match[1];
    let enviados = 0;
    db.sesiones.forEach((datos, userId) => {
        if (datos.activa) ctx.telegram.sendMessage(userId, `📢 <b>AVISO GENERAL</b>\n\n${mensaje}`, { parse_mode: 'HTML' }).then(() => enviados++);
    });
    ctx.replyWithHTML(`✅ Aviso enviado a ${enviados} usuarios 📢`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.action('verusuarios', (ctx) => {
    ctx.answerCbQuery();
    if (!db.admins.has(ctx.from.id)) return;
    if (db.users.size === 0) return ctx.reply('❌ No hay usuarios');
    let texto = '👥 <b>LISTA DE USUARIOS</b>\n\n';
    db.users.forEach((datos, user) => texto += `👤 ${user} | Saldo: ${datos.saldo} | ${datos.vip ? '⭐ VIP' : 'Usuario'}\n`);
    ctx.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.action('totalusuarios', (ctx) => {
    ctx.answerCbQuery();
    if (!db.admins.has(ctx.from.id)) return;
    ctx.replyWithHTML(`📊 <b>TOTAL USUARIOS:</b> ${db.users.size}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.action('crearusuario', (ctx) => { ctx.answerCbQuery(); ctx.replyWithHTML(`👤 <b>CREAR USUARIO</b>\n\nEscribe así:\n/crearusuario\nuser:nombre\ncontraseña:clave`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])); });
bot.action('agregarvip', (ctx) => { ctx.answerCbQuery(); ctx.replyWithHTML(`⭐ <b>AGREGAR VIP</b>\n\nEscribe así:\n/agregarvip\nuser:nombre\ncontraseña:clave\nsaldo:10`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])); });
bot.action('avisogeneral', (ctx) => { ctx.answerCbQuery(); ctx.replyWithHTML(`📢 <b>AVISO GENERAL</b>\n\nEscribe así:\n/avisogeneral ¡Tu mensaje aquí!`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]])); });

bot.catch((err, ctx) => {
    console.log('Error:', err.message);
    ctx.replyWithHTML(`❌ Ocurrió un error. Inténtalo de nuevo.`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]]));
});

bot.launch().then(() => console.log('✅ BOT ENCENDIDO 🟢'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
        
