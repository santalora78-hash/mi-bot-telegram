const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8878480430:AAGnU3GWR2fplLcRfj3yTPCJRJ4JuGoHE58';
const ADMIN_ID = 7677618980;
const WHATSAPP_NUMBER = '529241043399';
const DIAS_VENDEDOR = 5;

const bot = new Telegraf(BOT_TOKEN);

// ─── BASE DE DATOS ───
const db = {
    usuarios: new Map(),
    vendedores: new Map(),
    productosVendedor: new Map(),
    keysVendedor: new Map(),
    ventasVendedor: new Map(),
    stocks: new Map()
};

// ─── INICIO ───
bot.start((ctx) => {
    ctx.reply(`👋 ¡Bienvenido a 🎮 ELITE SHOP BOT!

🔐 Necesitas iniciar sesión para entrar al menú principal.

Escribe:
/login
user:
contraseña:`);
});

// ─── INICIAR SESIÓN ───
bot.hears(/^\/login\s*user:(.+)\s*contraseña:(.+)$/i, (ctx) => {
    const usuario = ctx.match[1].trim();
    const contraseña = ctx.match[2].trim();
    const datos = db.usuarios.get(usuario);

    if (!datos || datos.contraseña !== contraseña) {
        return ctx.reply(`❌ Usuario o contraseña incorrectos.

Vuelve a intentar:
/login
user:
contraseña:`);
    }

    ctx.session.usuario = usuario;
    const vendedor = db.vendedores.get(usuario);
    const vendedorActivo = vendedor && new Date() < new Date(vendedor.vence);

    const botones = [
        [Markup.button.callback('🛒 Comprar Keys', 'comprar_keys')],
        [Markup.button.callback('🎁 Mis Keys', 'mis_keys')],
        [Markup.button.callback('👤 Mi Cuenta', 'mi_cuenta')],
        [Markup.button.callback('📜 Historial', 'historial')]
    ];

    if (vendedorActivo) {
        botones.push([Markup.button.callback('🏪 Panel de Vendedor', 'panel_vendedor')]);
    }

    ctx.reply(`✅ ¡Bienvenido, ${usuario}!

💰 Tu saldo: $${datos.saldo || 0}.00 USD`, Markup.inlineKeyboard(botones));
});

// ─── NO SE PERMITE CREAR CUENTAS ───
bot.command('registrar', (ctx) => {
    ctx.reply(`❌ No puedes crear cuentas por tu cuenta.
Contacta al administrador de 🎮 ELITE SHOP BOT para crear tu acceso.`);
});

bot.command('nuevacuenta', (ctx) => {
    ctx.reply(`❌ No se permiten crear cuentas adicionales.
Contacta al administrador de 🎮 ELITE SHOP BOT.`);
});

// ─── PANEL DE VENDEDOR ───
bot.action('panel_vendedor', (ctx) => {
    const usuario = ctx.session.usuario;
    const vendedor = db.vendedores.get(usuario);
    const fechaVence = vendedor ? new Date(vendedor.vence).toLocaleDateString('es-MX') : '';
    const activo = vendedor && new Date() < new Date(vendedor.vence);
    const saldo = db.usuarios.get(usuario)?.saldo || 0;

    if (activo) {
        ctx.editMessageText(`👋 BIENVENIDO A TU PANEL DE
ADMINISTRADOR DE VENDEDORES
${usuario}

💰 Tu saldo: $${saldo}.00 USD

✅ ACTIVO — Vence: ${fechaVence}`,
            Markup.inlineKeyboard([
                [Markup.button.callback('🎉 Mostrar Ventas', 'mostrar_ventas')],
                [Markup.button.callback('📦 Mis Productos', 'mis_productos_vendedor')],
                [Markup.button.url('💬 Renovar por WhatsApp', 
                    `https://wa.me/${WHATSAPP_NUMBER}?text=Vengo%20a%20activar%20mi%20panel%20de%20administrador%20de%20vendedor`)],
                [Markup.button.callback('🔙 Volver', 'menu_principal')]
            ])
        );
    } else {
        ctx.editMessageText(`👋 BIENVENIDO A TU PANEL DE
ADMINISTRADOR DE VENDEDORES
${usuario}

💰 Tu saldo: $${saldo}.00 USD

❌ PERMISO VENCIDO

Para activar tu panel de vendedor
toca el enlace de abajo 👇`,
            Markup.inlineKeyboard([
                [Markup.button.url('💬 Activar por WhatsApp', 
                    `https://wa.me/${WHATSAPP_NUMBER}?text=Vengo%20a%20activar%20mi%20panel%20de%20administrador%20de%20vendedor`)],
                [Markup.button.callback('🔙 Volver', 'menu_principal')]
            ])
        );
    }
});

// ─── MOSTRAR VENTAS ───
bot.action('mostrar_ventas', (ctx) => {
    const usuario = ctx.session.usuario;
    const ventas = db.ventasVendedor.get(usuario) || [];
    ctx.editMessageText(`🎉 TUS VENTAS REALIZADAS

${ventas.length > 0 ? ventas.map(k => `KEY:${k} VENDIDA`).join('\n') : 'No tienes ventas registradas'}`,
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'panel_vendedor')]])
    );
});

// ─── MIS PRODUCTOS VENDEDOR ───
bot.action('mis_productos_vendedor', (ctx) => {
    const usuario = ctx.session.usuario;
    const productos = db.productosVendedor.get(usuario) || [];
    ctx.editMessageText(`📦 TUS PRODUCTOS

${productos.length > 0 ? productos.join('\n') : 'No tienes productos registrados'}`,
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Volver', 'panel_vendedor')]])
    );
});

// ─── PANEL DE ADMINISTRADOR ───
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply(`✨ PANEL DE CONTROL ✨
🔒 Acceso autorizado — 🎮 ELITE SHOP BOT

══════════════════════════

👤 GESTIÓN DE USUARIOS
──────────────────
👥 Ver Lista de Usuarios
📊 Total de Usuarios
ℹ️ Ver Datos de Usuario

💰 GESTIÓN DE SALDOS
──────────────────
💰 Agregar Saldo a Usuario
⭐ Agregar VIP

🏪 GESTIÓN DE VENDEDORES
──────────────────
✅ Activar Vendedor (5 días)
🔄 Renovar Comisión
❌ Quitar Permiso Vendedor
📅 Ver Vencimientos
💰 Configurar Comisión
📦 Agregar Productos Vendedores
🔑 Agregar Keys de Vendedores

📦 GESTIÓN DE PRODUCTOS
──────────────────
📦 Agregar Stock
✏️ Editar Stock
🗑️ Quitar Stock
📊 Ver Stocks

🛠️ HERRAMIENTAS
──────────────────
📢 Aviso General
🔑 Generar Llaves
🎁 Agregar Case
🔙 Volver al Menú`,
        Markup.inlineKeyboard([
            [Markup.button.callback('✅ Activar Vendedor', 'activar_vendedor_menu')],
            [Markup.button.callback('📦 Agregar Productos Vendedores', 'agregar_productos_vendedor_menu')],
            [Markup.button.callback('🔑 Agregar Keys de Vendedores', 'agregar_keys_vendedor_menu')]
        ])
    );
});

bot.action('agregar_productos_vendedor_menu', (ctx) => {
    ctx.editMessageText(`📦 AGREGAR PRODUCTOS A VENDEDOR

Escribe así:

/user:Juanito contraseña:12881
DRIP CLIENT
HG CHEATS`);
});

bot.action('agregar_keys_vendedor_menu', (ctx) => {
    ctx.editMessageText(`🔑 AGREGAR KEYS DE VENDEDORES

Escribe así:

/agregarkeysvendedor
user:Juanito
contraseña:18273

coloca tus keys en línea 👇🏻

187273737
172727373
187274701`);
});

bot.action('activar_vendedor_menu', (ctx) => {
    ctx.editMessageText(`✅ ACTIVAR VENDEDOR

Escribe así:
/activarvendedor user:Juanito contraseña:12881`);
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
    db.usuarios.set(usuario, { contraseña, saldo: 0, vendedorActivo: false });
    ctx.reply(`✅ Usuario creado correctamente

👤 Usuario: ${usuario}
🔒 Contraseña: ${contraseña}
💰 Saldo: $0.00 USD`);
});

bot.command('activarvendedor', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    const matchUser = ctx.message.text.match(/user:(.+?)(\s|$)/i);
    const matchPass = ctx.message.text.match(/contraseña:(.+)/i);
    if (!matchUser || !matchPass) return ctx.reply('❌ Formato incorrecto');
    const usuario = matchUser[1].trim();
    const contraseña = matchPass[1].trim();
    const vence = new Date(Date.now() + DIAS_VENDEDOR * 24 * 60 * 60 * 1000);
    if (!db.usuarios.has(usuario)) db.usuarios.set(usuario, { contraseña, saldo: 0 });
    else db.usuarios.get(usuario).vendedorActivo = true;
    db.vendedores.set(usuario, { vence });
    ctx.reply(`✅ VENDEDOR ACTIVADO CORRECTAMENTE

👤 Usuario: ${usuario}
📅 Vence: ${vence.toLocaleDateString('es-MX')}`);
});

bot.launch();
console.log('🤖 🎮 ELITE SHOP BOT INICIADO CORRECTAMENTE');

process.on('SIGINT', () => bot.stop('SIGINT'));
process.on('SIGTERM', () => bot.stop('SIGTERM'));
