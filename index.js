const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8878480430:AAGnU3GWR2fplLcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980;

const bot = new Telegraf(BOT_TOKEN);

// BASE DE DATOS
const db = {
    usuarios: new Map()
};

// INICIO
bot.start((ctx) => {
    ctx.reply(`👋 ¡Bienvenido a 🎮 ELITE SHOP BOT!

Escribe:
/login user:tu_nombre contraseña:tu_clave`);
});

// INICIAR SESIÓN
bot.hears(/^\/login\s*user:(.+)\s*contraseña:(.+)$/i, (ctx) => {
    const usuario = ctx.match[1].trim();
    const contraseña = ctx.match[2].trim();
    const datos = db.usuarios.get(usuario);

    if (!datos || datos.contraseña !== contraseña) {
        return ctx.reply('❌ Usuario o contraseña incorrectos');
    }

    ctx.session.usuario = usuario;
    ctx.reply(`✅ ¡Bienvenido, ${usuario}!

💰 Tu saldo: $${datos.saldo || 0}.00 USD`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🛒 Comprar Keys', 'comprar_keys')],
            [Markup.button.callback('🎁 Mis Keys', 'mis_keys')],
            [Markup.button.callback('👤 Mi Cuenta', 'mi_cuenta')],
            [Markup.button.callback('📜 Historial', 'historial')]
        ])
    );
});

// CREAR USUARIO (SOLO ADMIN)
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

// PANEL DE ADMINISTRADOR
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('❌ No eres administrador');
    ctx.reply('🔐 PANEL DE ADMINISTRADOR',
        Markup.inlineKeyboard([
            [Markup.button.callback('👥 Ver Usuarios', 'ver_usuarios')],
            [Markup.button.callback('💰 Agregar Saldo', 'agregar_saldo')]
        ])
    );
});

// RESPUESTAS DE BOTONES
bot.action('comprar_keys', (ctx) => ctx.answerCbQuery('🛒 Comprar Keys'));
bot.action('mis_keys', (ctx) => ctx.answerCbQuery('🎁 Mis Keys'));
bot.action('mi_cuenta', (ctx) => ctx.answerCbQuery('👤 Mi Cuenta'));
bot.action('historial', (ctx) => ctx.answerCbQuery('📜 Historial'));
bot.action('ver_usuarios', (ctx) => ctx.answerCbQuery(`👥 Total: ${db.usuarios.size} usuarios`));
bot.action('agregar_saldo', (ctx) => ctx.answerCbQuery('💰 Escribe: /agregarsaldo user:nombre monto:100'));

bot.launch();
console.log('✅ BOT ENCENDIDO CORRECTAMENTE');

process.on('SIGINT', () => bot.stop('SIGINT'));
process.on('SIGTERM', () => bot.stop('SIGTERM'));
           
