const { Telegraf } = require('telegraf');
const http = require('http');

const TOKEN = process.env.BOT_TOKEN || '8878480430:AAGnU3GWR2fpILcRfj3yTPCJRJ4JuGoHE58';

const bot = new Telegraf(TOKEN);

const server = http.createServer((req, res) => {
  res.end('Bot encendido ✅');
});
server.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Puerto abierto');
});

bot.start((ctx) => {
    ctx.reply('✅ ¡Hola! Tu bot está encendido y funcionando 24/7 🟢');
});

bot.command('help', (ctx) => {
    ctx.reply('📋 Comandos:\n/start - Iniciar\n/help - Ayuda\n/status - Ver estado');
});

bot.command('status', (ctx) => {
    ctx.reply('🟢 El bot está ENCENDIDO y activo 24/7');
});

bot.launch().then(() => {
    console.log('✅ BOT ENCENDIDO CORRECTAMENTE 🟢');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
