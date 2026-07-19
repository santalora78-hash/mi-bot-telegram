const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// ⚙️ CONFIGURACIÓN
const TOKEN = process.env.BOT_TOKEN || '8878480430:AAGnU3GWR2fplLcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980; // TU ID DE TELEGRAM
const WHATSAPP_LINK = 'https://wa.me/+529241043399?text=Hola,%20quiero%20comprar%20una%20key';

// 🖼️ ENLACE DE TU IMAGEN DE DRIP CLIENT
const IMAGEN_DRIP_CLIENT = "";

const bot = new Telegraf(TOKEN);

// ─── BASE DE DATOS ───
const db = {
    users: new Map(),
    stocks: new Map(),
    admins: new Set([ADMIN_ID]),
    saldos: new Map(),
    vip: new Map(),
    sesiones: new Map(),
    historial: []
};

// ─── PRODUCTOS Y PRECIOS ───
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
    res.end('PORTAL ARCEUS encendido ✅'); 
});
server.listen(process.env.PORT || 3000, () => console.log('🌐 Servidor activo'));

// ─── REGISTRAR USUARIO AUTOMÁTICAMENTE AL ENTRAR ───
function registrarUsuarioSiNoExiste(ctx) {
    const userId = ctx.from.id;
    if (!db.users.has(userId)) {
        db.users.set(userId, {
            nombre: ctx.from.first_name,
            usuario: null,
            contraseña: null,
            vip: false,
            saldo: 0,
            bloqueado: false,
            fechaRegistro: new Date().toLocaleDateString('es-MX')
        });
    }
    return db.users.get(userId);
}

// ─── VERIFICAR SI ESTÁ BLOQUEADO ───
function estaBloqueado(userId) {
    const usuario = db.users.get(userId);
    return usuario?.bloqueado === true;
}

// ─── MENÚ PRINCIPAL CLIENTES ───
function menuPrincipal(ctx) {
    const usuario = registrarUsuarioSiNoExiste(ctx);
    
    if (estaBloqueado(ctx.from.id)) {
        return ctx.replyWithHTML(
            `⚠️ <b>TU USUARIO Y CONTRASEÑA HA SIDO BLOQUEADO PERMANENTE POR EL ADMIN</b>`,
            Markup.inlineKeyboard([])
        );
    }

    return ctx.replyWithHTML(
        `✅ ¡Hola <b>${ctx.from.first_name}</b>!\n\nBienvenido a <b>PORTAL ARCEUS</b> 🛒`,
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
bot.action('menuprincipal', (ctx) => { 
    ctx.answerCbQuery(); 
    menuPrincipal(ctx); 
});

// ─── COMPRAR KEYS ───
function mostrarProductos(ctx) {
    if (estaBloqueado(ctx.from.id)) return;
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
    if (estaBloqueado(ctx.from.id)) return;
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
    if (estaBloqueado(ctx.from.id)) return;
    
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

// ─── PANEL DE ADMIN — CON ELIMINAR Y BLOQUEAR A LA VISTA ✅ ───
bot.command('admin', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return ctx.reply('❌ No tienes permiso');
    ctx.replyWithHTML(
        `✨ <b>PANEL DE ADMINISTRADOR</b> ✨\n\n🔒 Tu cuenta está PROTEGIDA\n✨ PORTAL ARCEUS 🚀`,
        Markup.inlineKeyboard([
            [Markup.button.callback('👤 Crear Usuario', 'crearusuario'), Markup.button.callback('🗑️ Quitar Admin', 'quitaradmin')],
            [Markup.button.callback('⭐ Agregar VIP', 'agregarvip'), Markup.button.callback('💰 Agregar Saldo', 'agregarsaldo')],
            [Markup.button.callback('👥 Ver Usuarios', 'verusuarios'), Markup.button.callback('📊 Total Usuarios', 'totalusuarios')],
            [Markup.button.callback('🗑️ Eliminar Usuario', 'menu_eliminar_usuario'), Markup.button.callback('🔒 Bloquear Usuario', 'menu_bloquear_usuario')],
            [Markup.button.callback('📦 Agregar Stock', 'agregarstock_menu'), Markup.button.callback('✏️ Editar Stock', 'editarstock')],
            [Markup.button.callback('🗑️ Quitar Stock', 'quitarstock'), Markup.button.callback('📦 Ver Stocks', 'verstocks')],
            [Markup.button.callback('🎁 Agregar Case', 'agregarcase'), Markup.button.callback('🔑 Generar Llaves', 'generarllaves')],
            [Markup.button.callback('🛒 Comprar Keys', 'comprarkeys'), Markup.button.callback('📢 Aviso General', 'avisogeneral')],
            [Markup.button.callback('🔙 Volver al Menú Principal', 'menuprincipal')]
        ])
    );
});

// ─── CREAR USUARIO — FORMATO: user: / contraseña: ───
bot.action('crearusuario', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`👤 <b>CREAR USUARIO</b>\n\nEscribe así:\n/crearusuario\nuser:\ncontraseña:`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.command('crearusuario', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    
    const texto = ctx.message.text.substring(14).trim();
    const matchUser = texto.match(/user:\s*(\S+)/i);
    const matchPass = texto.match(/contraseña:\s*(\S+)/i);
    
    if (!matchUser || !matchPass) {
        return ctx.replyWithHTML(`❌ <b>FORMATO INCORRECTO</b> ⚠️\n\nEscribe así:\n/crearusuario\nuser:Pedro77\ncontraseña:123456`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    }
    
    const usuario = matchUser[1];
    const contraseña = matchPass[1];
    
    let userIdExistente = null;
    for (const [id, datos] of db.users) {
        if (datos.usuario === usuario) {
            userIdExistente = id;
            break;
        }
    }
    
    if (userIdExistente) {
        db.users.get(userIdExistente).contraseña = contraseña;
        db.users.get(userIdExistente).bloqueado = false;
    } else {
        const nuevoId = Date.now();
        db.users.set(nuevoId, {
            nombre: usuario,
            usuario: usuario,
            contraseña: contraseña,
            vip: false,
            saldo: 0,
            bloqueado: false,
            fechaRegistro: new Date().toLocaleDateString('es-MX')
        });
    }
    
    ctx.replyWithHTML(`✅ <b>USUARIO CREADO</b> 🎉\n\n👤 Usuario: ${usuario}\n🔑 Contraseña: ${contraseña}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

// ─── ELIMINAR USUARIO — BOTÓN DIRECTO ───
bot.action('menu_eliminar_usuario', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`🗑️ <b>ELIMINAR USUARIO</b>\n\nEscribe así:\n/eliminarusuario nombre_de_usuario\n\n⚠️ Se eliminarán sus datos y quedará libre para crear otro igual.`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.command('eliminarusuario', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    
    const nombreUsuario = ctx.message.text.substring(16).trim();
    if (!nombreUsuario) {
        return ctx.replyWithHTML(`❌ Escribe el nombre de usuario:\n/eliminarusuario juan77`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    }
    
    let encontrado = false;
    for (const [id, datos] of db.users) {
        if (datos.usuario === nombreUsuario) {
            db.users.delete(id);
            encontrado = true;
            break;
        }
    }
    
    if (encontrado) {
        ctx.replyWithHTML(`✅ <b>USUARIO Y CONTRASEÑA ELIMINADO</b>`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    } else {
        ctx.replyWithHTML(`❌ <b>Usuario no encontrado</b>`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    }
});

// ─── BLOQUEAR USUARIO — BOTÓN DIRECTO ───
bot.action('menu_bloquear_usuario', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`🔒 <b>BLOQUEAR USUARIO</b>\n\nEscribe así:\n/bloquearusuario nombre_de_usuario\n\n⚠️ El usuario ya no podrá entrar al bot.`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.command('bloquearusuario', (ctx) => {
    if (!db.admins.has(ctx.from.id)) return;
    
    const nombreUsuario = ctx.message.text.substring(16).trim();
    if (!nombreUsuario) {
        return ctx.replyWithHTML(`❌ Escribe el nombre de usuario:\n/bloquearusuario juan77`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    }
    
    let usuarioId = null;
    for (const [id, datos] of db.users) {
        if (datos.usuario === nombreUsuario) {
            datos.bloqueado = true;
            usuarioId = id;
            break;
        }
    }
    
    if (usuarioId) {
        ctx.telegram.sendMessage(usuarioId, `⚠️ TU USUARIO Y CONTRASEÑA HA SIDO BLOQUEADO PERMANENTE POR EL ADMIN`);
        ctx.replyWithHTML(`✅ <b>USUARIO BLOQUEADO</b>\n\nEl usuario ya no puede entrar.`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    } else {
        ctx.replyWithHTML(`❌ <b>Usuario no encontrado</b>`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
    }
});

// ─── VER USUARIOS ───
bot.action('verusuarios', (ctx) => {
    ctx.answerCbQuery();
    let texto = `👥 <b>LISTA DE USUARIOS</b>\n\n━━━━━━━━━━━━━━━━━━━━\n`;
    if (db.users.size === 0) {
        texto += `❌ No hay usuarios registrados`;
    } else {
        db.users.forEach((u, id) => {
            const estado = u.bloqueado ? '🔒 Bloqueado' : '✅ Activo';
            const userDisplay = u.usuario || '(Sin usuario)';
            texto += `👤 ${userDisplay} — ${estado}\n🆔 Telegram: ${id}\n━━━━━━━━━━━━━━━━━━━━\n`;
        });
    }
    ctx.replyWithHTML(texto, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

// ─── TOTAL USUARIOS ───
bot.action('totalusuarios', (ctx) => {
    ctx.answerCbQuery();
    const bloqueados = Array.from(db.users.values()).filter(u => u.bloqueado).length;
    ctx.replyWithHTML(`📊 <b>TOTAL DE USUARIOS</b>\n\n👤 Total: ${db.users.size} usuarios\n✅ Activos: ${db.users.size - bloqueados}\n🔒 Bloqueados: ${bloqueados}`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

// ─── RESTO DE FUNCIONES DEL PANEL ───
bot.action('quitaradmin', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`🗑️ <b>QUITAR ADMIN</b>\n\nEscribe así:\n/quitaradmin ID`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.action('agregarvip', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`⭐ <b>AGREGAR VIP</b>\n\nEscribe así:\n/agregarvip ID DIAS`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.action('agregarsaldo', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`💰 <b>AGREGAR SALDO</b>\n\nEscribe así:\n/agregarsaldo ID CANTIDAD`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.action('editarstock', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`✏️ <b>EDITAR STOCK</b>\n\nEscribe así:\n/editardstock PRODUCTO DURACIÓN`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.action('quitarstock', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`🗑️ <b>QUITAR STOCK</b>\n\nEscribe así:\n/quitarstock PRODUCTO DURACIÓN`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.action('agregarcase', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`🎁 <b>AGREGAR CASE</b>\n\nEscribe así:\n/agregarcase NOMBRE PRECIO`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.action('generarllaves', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(`🔑 <b>GENERAR LLAVES</b>\n\nEscribe así:\n/generarllaves CANTIDAD`, Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver al Panel de Admin', 'admin')]]));
});

bot.action('avisogeneral', (ctx) => {
    ctx.answerCb
