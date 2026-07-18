const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const TOKEN = process.env.BOT_TOKEN || '8878480430:AAGnU3GWR2fpILcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980; // TU ID DE ADMIN

const bot = new Telegraf(TOKEN);

// BASE DE DATOS
const db = {
    users: new Map(),        // usuario: { pass, saldo, vip: boolean, sesion: boolean, id: telegramId }
    stocks: new Map(),      // nombre: { precio, cantidad, descripcion, tipo }
    admins: new Set([ADMIN_ID]),
    keys: [],
    sesiones: new Map()     // telegramId: { usuario, activa: boolean }
};

// PUERTO PARA RENDER
const server = http.createServer((req, res) => {
  res.end('Bot encendido ✅');
});
server.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Puerto abierto');
});

// ─── MENÚ PRINCIPAL ───

bot.start((ctx) => {
    ctx.replyWithHTML(
        `✅ ¡Hola <b>${ctx.from.first_name}</b>!\n\n` +
        `Bienvenido al bot. Inicia sesión para continuar.\n\n` +
        `📋 <b>Comandos:</b>\n` +
        `/login usuario contraseña - Iniciar sesión\n` +
        `/soporte - Obtener cuenta\n` +
        `/comprarkeys - Ver precios\n` +
        `/verstocks - Productos disponibles`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🛒 Comprar Keys', 'comprarkeys')],
            [Markup.button.callback('📦 Ver Stocks', 'verstocks'), Markup.button.callback('👤 Mi Cuenta', 'micuenta')],
            [Markup.button.callback('📩 Soporte', 'soporte')]
        ])
    );
});

// ─── SOPORTE ───

bot.command('soporte', (ctx) => {
    ctx.replyWithHTML(
        `📩 <b>SOPORTE</b> 📩\n\n` +
        `Para crear tu cuenta, escríbeme directamente:\n` +
        `👉 @TuUsuarioDeTelegram\n\n` +
        `Yo te entrego tu usuario y contraseña.`
    );
});

bot.action('soporte', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `📩 <b>SOPORTE</b> 📩\n\n` +
        `Para crear tu cuenta, escríbeme directamente:\n` +
        `👉 @TuUsuarioDeTelegram\n\n` +
        `Yo te entrego tu usuario y contraseña.`
    );
});

// ─── LOGIN DE USUARIOS ───

bot.command('login', (ctx) => {
    const texto = ctx.message.text.substring(6).trim();
    const partes = texto.split(' ');
    const usuario = partes[0];
    const contraseña = partes[1];

    if (!usuario || !contraseña) {
        return ctx.replyWithHTML(
            `🔐 <b>INICIAR SESIÓN</b>\n\n` +
            `Escribe así:\n` +
            `/login usuario contraseña\n\n` +
            `Ejemplo:\n` +
            `/login juanito123 1348`
        );
    }

    if (!db.users.has(usuario)) {
        return ctx.replyWithHTML(
            `❌ <b>USUARIO O CONTRASEÑA INCORRECTOS</b> ⚠️\n\n` +
            `Este usuario no está registrado.\n\n` +
            `Para crear tu cuenta, escríbeme:\n` +
            `📩 @TuUsuarioDeTelegram`
        );
    }

    const datos = db.users.get(usuario);
    if (datos.contraseña !== contraseña) {
        return ctx.replyWithHTML(
            `❌ <b>USUARIO O CONTRASEÑA INCORRECTOS</b> ⚠️`
        );
    }

    db.sesiones.set(ctx.from.id, { usuario, activa: true });
    ctx.replyWithHTML(
        `✅ <b>¡BIENVENIDO ${usuario}!</b> 🎉\n\n` +
        `Sesión iniciada correctamente.\n` +
        `Ahora puedes usar todos los comandos.`
    );
});

// ─── COMPRAR KEYS (CON PRECIOS) ───

bot.command('comprarkeys', (ctx) => {
    ctx.replyWithHTML(
        `🎁 <b>COMPRAR KEYS</b> 🎁\n\n` +
        `⏳ 1 Día    →   $3 USD\n` +
        `⏳ 7 Días   →   $8 USD\n` +
        `⏳ 15 Días  →  $13 USD\n` +
        `⏳ 30 Días  →  $17 USD\n\n` +
        `Elige la duración:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('⏳ 1 Día - $3', 'dias1')],
            [Markup.button.callback('⏳ 7 Días - $8', 'dias7')],
            [Markup.button.callback('⏳ 15 Días - $13', 'dias15')],
            [Markup.button.callback('⏳ 30 Días - $17', 'dias30')]
        ])
    );
});

bot.action('comprarkeys', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `🎁 <b>COMPRAR KEYS</b> 🎁\n\n` +
        `⏳ 1 Día    →   $3 USD\n` +
        `⏳ 7 Días   →   $8 USD\n` +
        `⏳ 15 Días  →  $13 USD\n` +
        `⏳ 30 Días  →  $17 USD\n\n` +
        `Elige la duración:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('⏳ 1 Día - $3', 'dias1')],
            [Markup.button.callback('⏳ 7 Días - $8', 'dias7')],
            [Markup.button.callback('⏳ 15 Días - $13', 'dias15')],
            [Markup.button.callback('⏳ 30 Días - $17', 'dias30')]
        ])
    );
});

// ─── VER STOCKS ───

bot.command('verstocks', (ctx) => {
    if (db.stocks.size === 0) {
        return ctx.reply('❌ No hay productos disponibles');
    }
    let texto = '📦 <b>PRODUCTOS DISPONIBLES</b> 📦\n\n';
    db.stocks.forEach((prod, nombre) => {
        texto += `━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `📱 <b>${nombre}</b>\n`;
        texto += `   ├─ Precio: ${prod.precio}\n`;
        texto += `   ├─ Stock: ${prod.cantidad}\n`;
        texto += `   └─ ${prod.descripcion}\n`;
    });
    ctx.replyWithHTML(texto);
});

bot.action('verstocks', (ctx) => {
    ctx.answerCbQuery();
    if (db.stocks.size === 0) {
        return ctx.reply('❌ No hay productos disponibles');
    }
    let texto = '📦 <b>PRODUCTOS DISPONIBLES</b> 📦\n\n';
    db.stocks.forEach((prod, nombre) => {
        texto += `━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `📱 <b>${nombre}</b>\n`;
        texto += `   ├─ Precio: ${prod.precio}\n`;
        texto += `   ├─ Stock: ${prod.cantidad}\n`;
        texto += `   └─ ${prod.descripcion}\n`;
    });
    ctx.replyWithHTML(texto);
});

// ─── PANEL DE ADMIN ───

bot.command('admin', (ctx) => {
    if (!db.admins.has(ctx.from.id)) {
        return ctx.reply('❌ No tienes permiso');
    }
    ctx.replyWithHTML(
        `✨ <b>PANEL DE ADMINISTRADOR</b> ✨\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔒 Tu cuenta está PROTEGIDA\n` +
        `✨ PORTAL ARCEUS 🚀`,
        Markup.inlineKeyboard([
            [Markup.button.callback('👤 Crear Usuario', 'crearusuario'), Markup.button.callback('🗑️ Quitar Admin', 'quitaradmin')],
            [Markup.button.callback('⭐ Agregar VIP', 'agregarvip'), Markup.button.callback('💰 Agregar Saldo', 'agregarsaldo')],
            [Markup.button.callback('👥 Ver Usuarios', 'verusuarios'), Markup.button.callback('📊 Total Usuarios', 'totalusuarios')],
            [Markup.button.callback('📦 Agregar Stock', 'agregarstock'), Markup.button.callback('✏️ Editar Stock', 'editarstock')],
            [Markup.button.callback('🗑️ Quitar Stock', 'quitarstock'), Markup.button.callback('📦 Ver Stocks', 'verstocks')],
            [Markup.button.callback('🎁 Agregar Case', 'agregarcase'), Markup.button.callback('🔑 Generar Llaves', 'generarkey')],
            [Markup.button.callback('📢 Aviso General', 'avisogeneral')]
        ])
    );
});

// ─── CREAR USUARIO ───

bot.command('crearusuario', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    const texto = ctx.message.text.substring(13).trim();
    const matchUser = texto.match(/user:\s*(\S+)/i);
    const matchPass = texto.match(/contraseña:\s*(\S+)/i);

    if (!matchUser || !matchPass) {
        return ctx.replyWithHTML(
            `❌ <b>FORMATO INCORRECTO</b> ⚠️\n\n` +
            `Escribe así:\n` +
            `/crearusuario\nuser:nombre\ncontraseña:tucontraseña\n\n` +
            `Ejemplo:\n` +
            `/crearusuario\nuser:juanito123\ncontraseña:1348`
        );
    }

    const usuario = matchUser[1];
    const contraseña = matchPass[1];

    if (db.users.has(usuario)) {
        return ctx.reply('❌ Este usuario ya existe');
    }

    db.users.set(usuario, { contraseña, saldo: 0, vip: false, id: null });
    ctx.replyWithHTML(
        `✅ <b>USUARIO CREADO EXITOSAMENTE</b> 🎉\n\n` +
        `👤 Usuario: ${usuario}\n` +
        `🔐 Contraseña: ${contraseña}\n\n` +
        `¡Entrégaselo al usuario!`
    );
});

// ─── AGREGAR VIP ───

bot.command('agregarvip', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    const texto = ctx.message.text.substring(12).trim();
    const matchUser = texto.match(/user:\s*(\S+)/i);
    const matchPass = texto.match(/contraseña:\s*(\S+)/i);
    const matchSaldo = texto.match(/saldo:\s*(\d+)/i);

    if (!matchUser || !matchPass || !matchSaldo) {
        return ctx.replyWithHTML(
            `❌ <b>FORMATO INCORRECTO</b> ⚠️\n\n` +
            `Escribe así:\n` +
            `/agregarvip\nuser:nombre\ncontraseña:tucontraseña\nsaldo:10\n\n` +
            `Ejemplo:\n` +
            `/agregarvip\nuser:juanito123\ncontraseña:123\nsaldo:10`
        );
    }

    const usuario = matchUser[1];
    const contraseña = matchPass[1];
    const saldo = parseInt(matchSaldo[1]);

    if (db.users.has(usuario)) {
        return ctx.reply('❌ Este usuario ya existe');
    }

    db.users.set(usuario, { contraseña, saldo, vip: true, id: null });
    ctx.replyWithHTML(
        `✅ <b>USUARIO VIP CREADO EXITOSAMENTE</b> 🎉\n\n` +
        `👤 Usuario: ${usuario}\n` +
        `🔐 Contraseña: ${contraseña}\n` +
        `⭐ Estado: VIP ACTIVO\n` +
        `💰 Saldo: ${saldo}\n\n` +
        `¡Guardado correctamente! ✅`
    );
});

// ─── AVISO GENERAL ───

bot.command('avisogeneral', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    const texto = ctx.message.text.substring(14).trim();
    const match = texto.match(/¡(.+)!/);

    if (!match) {
        return ctx.replyWithHTML(
            `❌ <b>FORMATO INCORRECTO</b> ⚠️\n\n` +
            `Escribe así:\n` +
            `/avisogeneral ¡Tu mensaje aquí!\n\n` +
            `Ejemplo:\n` +
            `/avisogeneral ¡Hola a todos! Nueva actualización disponible. 🎉`
        );
    }

    const mensaje = match[1];
    let enviados = 0;

    db.sesiones.forEach((datos, userId) => {
        if (datos.activa) {
            ctx.telegram.sendMessage(userId, `📢 <b>AVISO GENERAL</b>\n\n${mensaje}`, { parse_mode: 'HTML' })
                .then(() => enviados++)
                .catch(() => {});
        }
    });

    ctx.replyWithHTML(`✅ Aviso enviado a ${enviados} usuarios 📢`);
});

// ─── AGREGAR STOCK CON PROTECCIÓN ───

bot.command('agregarstock', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    const texto = ctx.message.text.substring(14).trim();
    const partes = texto.split('|').map(p => p.trim());

    if (partes.length < 4) {
        return ctx.replyWithHTML(
            `❌ <b>FALTAN DATOS</b> ⚠️\n\n` +
            `Escribe así:\n` +
            `/agregarstock NOMBRE | PRECIO | CANTIDAD | DESCRIPCIÓN\n\n` +
            `Ejemplo:\n` +
            `/agregarstock ANDROID APK MOD | 5 | 100 | Mod para Android`
        );
    }

    const [nombre, precio, cantidad, ...descParts] = partes;
    const descripcion = descParts.join(' ');

    if (isNaN(precio) || isNaN(cantidad)) {
        return ctx.reply('❌ El precio y la cantidad deben ser números');
    }

    if (db.stocks.has(nombre)) {
        return ctx.reply('❌ Este producto ya existe');
    }

    db.stocks.set(nombre, { precio, cantidad: parseInt(cantidad), descripcion });
    ctx.replyWithHTML(
        `✅ <b>PRODUCTO GUARDADO</b> 🎉\n\n` +
        `📦 ${nombre}\n` +
        `💰 Precio: ${precio}\n` +
        `📊 Cantidad: ${cantidad}\n` +
        `📝 ${descripcion}`
    );
});

// ─── BOTONES DEL PANEL ───

bot.action('crearusuario', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `👤 <b>CREAR USUARIO</b>\n\n` +
        `Escribe así:\n` +
        `/crearusuario\nuser:nombre\ncontraseña:tucontraseña`
    );
});

bot.action('agregarvip', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `⭐ <b>AGREGAR VIP</b>\n\n` +
        `Escribe así:\n` +
        `/agregarvip\nuser:nombre\ncontraseña:tucontraseña\nsaldo:10`
    );
});

bot.action('avisogeneral', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `📢 <b>AVISO GENERAL</b>\n\n` +
        `Escribe así:\n` +
        `/avisogeneral ¡Tu mensaje aquí!\n\n` +
        `✅ Empieza con ¡ y termina con !`
    );
});

bot.action('agregarstock', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `📦 <b>AGREGAR STOCK</b>\n\n` +
        `Escribe así:\n` +
        `/agregarstock NOMBRE | PRECIO | CANTIDAD | DESCRIPCIÓN`
    );
});

bot.action('verusuarios', (ctx) => {
    ctx.answerCbQuery();
    if (!db.admins.has(ctx.from.id)) return;
    if (db.users.size === 0) return ctx.reply('❌ No hay usuarios');
    let texto = '👥 <b>LISTA DE USUARIOS</b>\n\n';
    db.users.forEach((datos, user) => {
        texto += `👤 ${user} | Saldo: ${datos.saldo} | ${datos.vip ? '⭐ VIP' : 'Usuario'}\n`;
    });
    ctx.replyWithHTML(texto);
});

bot.action('totalusuarios', (ctx) => {
    ctx.answerCbQuery();
    if (!db.admins.has(ctx.from.id)) return;
    ctx.replyWithHTML(`📊 <b>TOTAL USUARIOS:</b> ${db.users.size}`);
});

bot.action('micuenta', (ctx) => {
    ctx.answerCbQuery();
    const sesion = db.sesiones.get(ctx.from.id);
    if (!sesion || !sesion.activa) {
        return ctx.reply('❌ No tienes sesión abierta. Usa /login');
    }
    const datos = db.users.get(sesion.usuario);
    ctx.replyWithHTML(
        `👤 <b>MI CUENTA</b>\n\n` +
        `Usuario: ${sesion.usuario}\n` +
        `Saldo: ${datos.saldo}\n` +
        `Estado: ${datos.vip ? '⭐ VIP' : 'Usuario normal'}`
    );
});

// ─── INICIAR BOT ───

bot.launch().then(() => {
    console.log('✅ BOT ENCENDIDO CORRECTAMENTE 🟢');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
