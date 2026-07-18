const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const TOKEN = process.env.BOT_TOKEN || '8878480430:AAGnU3GWR2fpILcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980; // 👈 PON TU ID DE TELEGRAM AQUÍ

const bot = new Telegraf(TOKEN);

const db = {
    keys: [],
    users: new Set(),
    pendingVerifications: new Map()
};

const server = http.createServer((req, res) => {
  res.end('Bot encendido ✅');
});
server.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Puerto abierto');
});

bot.start((ctx) => {
    db.users.add(ctx.from.id);
    ctx.replyWithHTML(
        `✅ ¡Hola <b>${ctx.from.first_name}</b>!\n\n` +
        `Tu bot está encendido y funcionando 24/7 🟢\n\n` +
        `📋 <b>Comandos:</b>\n` +
        `/start - Iniciar bot\n` +
        `/login - Iniciar sesión\n` +
        `/getkey - Obtener llave\n` +
        `/status - Estado del bot\n` +
        `/admin - Panel de administrador`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📦 Ver Productos', 'productos')],
            [Markup.button.callback('🔑 Obtener Llave', 'getkey')]
        ])
    );
});

bot.command('login', (ctx) => {
    ctx.reply('🔐 Iniciando sesión...\n\n✅ ¡Sesión iniciada correctamente!\n\nAhora puedes usar todos los comandos del bot. 🎉');
});

bot.command('status', (ctx) => {
    ctx.reply('🟢 El bot está ACTIVO y funcionando 24/7 ✅');
});

bot.command('getkey', (ctx) => {
    const userId = ctx.from.id;
    db.pendingVerifications.set(userId, { time: Date.now() });
    ctx.replyWithHTML(
        `🔑 <b>Solicitud de llave</b>\n\n` +
        `Debes verificar que no eres un robot.\n` +
        `👉 <b>Ver anuncio y espera 5 minutos</b>\n\n` +
        `Cuando termines, escribe: /verify`
    );
});

bot.command('verify', (ctx) => {
    const userId = ctx.from.id;
    if (db.pendingVerifications.has(userId)) {
        const key = 'LLAVE-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        db.keys.push({ user: userId, key, date: new Date() });
        db.pendingVerifications.delete(userId);
        ctx.replyWithHTML(
            `✅ <b>¡Verificado!</b>\n\n` +
            `🔑 Tu llave es: <code>${key}</code>\n\n` +
            `¡Guárdala bien! 📝`
        );
    } else {
        ctx.reply('❌ Primero usa /getkey para iniciar la solicitud');
    }
});

bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
        return ctx.reply('❌ No tienes permiso para usar este comando');
    }
    ctx.replyWithHTML(
        `⚙️ <b>PANEL DE ADMINISTRADOR</b>\n\n` +
        `👥 Usuarios: ${db.users.size}\n` +
        `🔑 Llaves generadas: ${db.keys.length}\n\n` +
        `Comandos de admin:\n` +
        `/listkeys - Ver todas las llaves\n` +
        `/stats - Estadísticas`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📋 Ver Llaves', 'listkeys')],
            [Markup.button.callback('📊 Estadísticas', 'stats')]
        ])
    );
});

bot.command('listkeys', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    if (db.keys.length === 0) {
        return ctx.reply('❌ No hay llaves generadas');
    }
    let texto = '🔑 <b>Lista de llaves:</b>\n\n';
    db.keys.forEach((k, i) => {
        texto += `${i+1}. <code>${k.key}</code>\n└ Usuario: ${k.user}\n`;
    });
    ctx.replyWithHTML(texto);
});

bot.command('stats', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.replyWithHTML(
        `📊 <b>ESTADÍSTICAS</b>\n\n` +
        `👥 Total usuarios: ${db.users.size}\n` +
        `🔑 Llaves generadas: ${db.keys.length}\n` +
        `🟢 Bot: ENCENDIDO`
    );
});

bot.action('getkey', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('🔑 Usa /getkey para obtener tu llave');
});

bot.action('productos', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `📦 <b>Productos Disponibles:</b>\n\n` +
        `🎮 0,7 TEAM BKL SENSI\n` +
        `🎮 PAINEL 07 TEAM\n` +
        `🎮 SCORPION MODS\n` +
        `🎮 ORANGE FOX\n\n` +
        `Escribe el nombre del producto para más información`
    );
});

bot.action('listkeys', (ctx) => {
    ctx.answerCbQuery();
    if (ctx.from.id !== ADMIN_ID) return;
    if (db.keys.length === 0) {
        ctx.reply('❌ No hay llaves generadas');
        return;
    }
    let texto = '🔑 <b>Lista de llaves:</b>\n\n';
    db.keys.forEach((k, i) => {
        texto += `${i+1}. <code>${k.key}</code>\n`;
    });
    ctx.replyWithHTML(texto);
});

bot.action('stats', (ctx) => {
    ctx.answerCbQuery();
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.replyWithHTML(
        `📊 <b>ESTADÍSTICAS</b>\n\n` +
        `👥 Usuarios: ${db.users.size}\n` +
        `🔑 Llaves: ${db.keys.length}`
    );
});

bot.launch().then(() => {
    console.log('✅ BOT ENCENDIDO CORRECTAMENTE 🟢');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
      
