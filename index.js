const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8878480430:AAGnU3GWR2fplLcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980;

const bot = new Telegraf(BOT_TOKEN);

// ─── BASE DE DATOS ───
const db = {
    usuarios: new Map(),
    stocks: new Map()
};

// ─── INICIO ───
bot.start((ctx) => {
    ctx.reply(`👋 ¡Bienvenido a 🎮 ELITE SHOP BOT!

🔐 Necesitas iniciar sesión para entrar al menú.

Escribe:
/login
user:tu_nombre
contraseña:tu_clave`);
});

// ─── INICIAR SESIÓN ───
bot.hears(/^\/login\s*user:(.+)\s*contraseña:(.+)$/i, (ctx) => {
    const usuario = ctx.match[1].trim();
    const contraseña = ctx.match[2].trim();
    const datos = db.usuarios.get(usuario);

    if (!datos || datos.contraseña !== contraseña) {
        return ctx.reply(`❌ Usuario o contraseña incorrectos.

Vuelve a escribir:
/login
user:
contraseña:`);
    }

    ctx.session.usuario = usuario;

    const botones = [
        [Markup.button.callback('🛒 Comprar Keys', 'comprar_keys')],
        [Markup.button.callback('🎁 Mis Keys', 'mis_keys')],
        [Markup.button.callback('👤 Mi Cuenta', 'mi_cuenta')],
        [Markup.button.callback('📜 Historial', 'historial')]
    ];

    ctx.reply(`✅ ¡Bienvenido, ${usuario}!

💰 Tu saldo: $${datos.saldo || 0}.00 USD`, Markup.inlineKeyboard(botones));
});

// ─── NO SE PUEDE REGISTRAR ───
bot.command('registrar', (ctx) => {
    ctx.reply(`❌ No puedes crear cuentas tú solo.
Pídele al administrador que te cree tu cuenta.`);
});

bot.command('nuevacuenta', (ctx) => {
    ctx.reply(`❌ No se permiten crear cuentas adicionales.
Contacta al administrador.`);
});

// ─── VOLVER AL MENÚ PRINCIPAL ───
bot.action('menu_principal', (ctx) => {
    const usuario = ctx.session.usuario;
    const datos = db.usuarios.get(usuario);

    const botones = [
        [Markup.button.callback('🛒 Comprar Keys', 'comprar_keys')],
        [Markup.button.callback('🎁 Mis Keys', 'mis_keys')],
        [Markup.button.callback('👤 Mi Cuenta', 'mi_cuenta')],
        [Markup.button.callback('📜 Historial', 'historial')]
    ];

    ctx.editMessageText(`✅ ¡Bienvenido, ${usuario}!

💰 Tu saldo: $${datos.saldo || 0}.00 USD`, Markup.inlineKeyboard(botones));
});

// ─── PANEL DE ADMINISTRADOR ───
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply(`✨ PANEL DE CONTROL ✨
🔒 Acceso autorizado — 🎮 ELITE SHOP BOT`,
        Markup.inlineKeyboard([
            [Markup.button.callback('👥 Ver Lista de Usuarios', 'ver_usuarios'), Markup.button.callback('📊 Total de Usuarios', 'total_usuarios')],
            [Markup.button.callback('💰 Agregar Saldo a Usuario', 'agregar_saldo')],
            [Markup.button.callback('📦 Agregar Stock', 'agregar_stock'), Markup.button.callback('📊 Ver Stocks', 'ver_stocks')],
            [Markup.button.callback('🔙 Volver al Menú', 'menu_principal')]
        ])
    );
});

// ─── COMANDOS DE ADMINISTRADOR ───
bot.command('crearusuario', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    const matchUser = ctx.message.text.match(/user:(.+?)(\s|$)/i);
    const matchPass = ctx.message.text.match(/contraseña:(.+)/i);
    if (!matchUser || !matchPass) return ctx.reply('❌ Formato: /crearusuario user:nombre contraseña:clave');
    const usuario = matchUser[1].trim();
    const contraseña = matchPass[1].trim();
    if (db.usuarios.has(usuario)) return ctx.reply('❌ El usuario ya existe');
    db.usuarios.set(usuario, { contraseña, saldo: 0 });
    ctx.reply(`✅ Usuario creado correctamente

👤 Usuario: ${usuario}
🔒 Contraseña: ${contraseña}
💰 Saldo: $0.00 USD`);
});

// ─── RESPUESTAS DE BOTONES ───
bot.action('ver_usuarios', (ctx) => ctx.answerCbQuery('👥 Mostrando lista de usuarios...'));
bot.action('total_usuarios', (ctx) => ctx.answerCbQuery(`📊 Total: ${db.usuarios.size} usuarios`));
bot.action('agregar_saldo', (ctx) => ctx.answerCbQuery('💰 Escribe: /agregarsaldo user:nombre monto:100'));
bot.action('agregar_stock', (ctx) => ctx.answerCbQuery('📦 Escribe: /agregarstock producto:nombre keys:10'));
bot.action('ver_stocks', (ctx) => ctx.answerCbQuery('📊 Mostrando stocks...'));
bot.action('comprar_keys', (ctx) => ctx.answerCbQuery('🛒 Sección de compras'));
bot.action('mis_keys', (ctx) => ctx.answerCbQuery('🎁 Tus keys'));
bot.action('mi_cuenta', (ctx) => ctx.answerCbQuery('👤 Tu cuenta'));
bot.action('historial', (ctx) => ctx.answerCbQuery('📜 Tu historial'));

bot.launch();
console.log('🤖 🎮 ELITE SHOP BOT INICIADO CORRECTAMENTE');

process.on('SIGINT', () => bot.stop('SIGINT'));
process.on('SIGTERM', () => bot.stop('SIGTERM'));
