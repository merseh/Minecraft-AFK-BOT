const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
      Discord.GatewayIntentBits.DirectMessages,
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildBans,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.MessageContent,
    ],
    partials: [Discord.Partials.Channel],
  });
const fs = require("fs")
const config = require("./config.json")

client.config = config;

const { JsonDatabase } = require("wio.db");

const db = new JsonDatabase({
  databasePath: "database.json"
});

//** SLASH COMMAND HANDLER **\\ > START

client.slashcommands = new Discord.Collection();
const commander = fs.readdirSync("./commands").filter(files => files.endsWith('.js'));
for (const files of commander) {
    const command = require(`./commands/${files}`);
    client.slashcommands.set(command.data.name, command);
    console.log("[BOT] Yüklenen Komut: " + command.data.name)
}


const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(config.token);

//** SLASH COMMAND HANDLER **\\ > END


//** EVENT HANDLER **\\ > START
//require("./handlers/eventHandler")(client)
const files = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of files) {
  const eventName = file.split(".")[0];
  const event = require(`./events/${file}`);
  client.on(eventName, event.bind(null, client));
}
//** COMMAND HANDLER **\\ > END


client.on("interactionCreate", async interaction => {

    const command = client.slashcommands.get(interaction.commandName);
    if (!command) return;

    if(command.developerOnly === true) { 
        if(!config.developers.includes(interaction.user.id)) {
        return interaction.reply({ content: "Bu komutu sadece geliştiricim kullanabilir.", ephemeral: true })
        }
    }

    if(command.enabled === false) return interaction.reply({ content: "Bu komut şuanlık kullanım dışıdır.", ephemeral: true })
  
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'Komutu çalıştırırken hata ile karşılaştım geliştiricime ulaşın.',
        ephemeral: true
      });
    };
})


client.on("interactionCreate", async interaction => {
    if(!interaction.awaitModalSubmit) return;

    if(interaction.customId == "createbot"){

        if (!interaction.member.roles.cache.some(role => role.id === config.üyelikRolId)) return interaction.reply({ content: "Merhaba, AFK botu oluşturmak için paket satın almanız gerekiyor.", ephemeral: true})

        let channel = interaction.guild.channels.cache.filter(c => c.name == "bot-" + interaction.member.id).first() || await interaction.guild.channels.create({
            name: "bot-"+ interaction.member.id,
            parent: config.afkclient.kategoriId,
            topic: interaction.member.user.tag + " Adlı Müşterinin AFK Botu.",
            rateLimitPerUser: 1,
            permissionOverwrites: [
            {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages"]
            },
            {
                id: interaction.guild.roles.everyone.id,
                deny: ["ViewChannel", "SendMessages"]
            }]
        });
        
        var username = interaction.components[0].components[0].value;
        var host = interaction.components[1].components[0].value;
        var port = interaction.components[2].components[0].value || "25565";
        var commands = interaction.components[3].components[0].value;	

        db.set(`botlar.${interaction.user.id}.name`, username)
        db.set(`botlar.${interaction.user.id}.host`, host)
        db.set(`botlar.${interaction.user.id}.port`, port)
        db.set(`botlar.${interaction.user.id}.commands`, commands)

        await interaction.reply({ content: "Başarıyla afk botunuzu oluşturdunuz <#" + channel.id + ">", ephemeral: true  })
        
        async function sendEmbed(content){
            const embed = new Discord.EmbedBuilder()
            .setColor(client.config.embed.color)
            .setFooter({ text: client.config.embed.footer })
            .setImage("https://media.discordapp.net/attachments/1014232719397490698/1014626235353145435/adada.png?width=1440&height=181")
            await channel.send({ embeds: [embed.setDescription(content)] })
        }

        sendEmbed(`Bot sunucuya giriş yapıyor...\n\n> **Bot Adı:** `+username+"\n> **Girilen Sunucu Adresi:** "+host+":"+port)

        const mineflayer = require('mineflayer')

        const settings = {
            host: host,
            username: username, 
            port: port
        }

        const bot = mineflayer.createBot(settings)

        bindEvents(bot)
        function bindEvents(bot){

            bot.on("login", () => {

                db.set(`botlar.${interaction.user.id}.connected`, true)
                sendEmbed("Sunucuya başarıyla giriş sağladım ✅")
                commands.split("\n").map(cmd => {
                    setTimeout(() => {
                      bot.chat(cmd)
                    }, 1000);
                })

            })

            bot.on("end", reason => {
                db.delete(`botlar.${interaction.user.id}.connected`)
                sendEmbed(`Bot sunucudan atıldı. ❌ \n\`\`\`\n${reason.toString()}\`\`\``)
                sendEmbed(`Bot 10 saniye içerisinde tekrar giriş yapıcaktır.`)
                setTimeout(() => {
                    const bot = mineflayer.createBot(settings)
                    bindEvents(bot)
                }, 10000);
            })

            bot.on("error", error => {
                return channel.send(`Bir hata oluştu. \n\`\`\`${error}\`\`\``)                 
            })
            
            function followPlayer() {
                const playerCI = bot.players

                if(!playerCI || !playerCI.entity) {
                    sendEmbed(`Kimseyi takip edemiyom yarram`)
                    return
                }
                const mcData = require('minecraft-data')(bot.version)
                const movements = new Movements(bot, mcData)
                bot.pathfinder.setMovements(movements);

                const goal = new GoalFollow(playerCI.entity, 1)
                bot.pathfinder.setGoal(goal, true)
            }


            client.on("messageCreate", msg => {
                if(msg.channel.id === channel.id){
                    if(msg.author.bot) return;
                    /*if(!msg.content.startsWith(".")){
                        bot.chat(msg.content)
                    }*/
                    else if(msg.content == config.prefix + "yardım"){
                        sendEmbed(`
                        > **${config.prefix}gir** -> Sunucuya giriş yapar.
                        > **${config.prefix}çık** -> Sunucudan çıkış yapar.
                        > **${config.prefix}hesapbilgi** -> Botun sunucuda ki bilgilerini gösterir.
                        > **${config.prefix}sohbetigörüntüle** -> Sunucuda ki mesajları kanalda görüntüler.
                        > **${config.prefix}etrafabak** -> Sunucuda ki oyuncuları ve yere atılan itemleri kafasıyla takip eder.
                        `)
                    }
                    else if(msg.content == config.prefix + "çık"){
                        bot.quit("Kullanıcı isteği.");
                        sendEmbed(`Başarıyla bot sunucudan çıktı `)
                    }
                    else if(msg.content == config.prefix + "gir"){
                        sendEmbed(`Bot sunucuya giriş yapıyor...`)
                        const bot = mineflayer.createBot(settings)
                        bindEvents(bot)
                    }
                    else if(msg.content == config.prefix + "etrafabak"){
                        bot.on("move",()=> { 
                        let friend = bot.nearestEntity();
                        bot.lookAt(friend.position);
                    });
                    msg.react("👍");
                    }
                    else if(msg.content == config.prefix + "takip"){
                        bot.on('move', followPlayer)
                        msg.react("👍");
                    }
                    else if(msg.content == config.prefix + "hesapbilgi"){
                        const X = bot.entity.position.x.toFixed(1);
                        const Y = bot.entity.position.y.toFixed(1);
                        const Z = bot.entity.position.z.toFixed(1);
                        sendEmbed(`**Ad:** ${bot.username}\n**Can:** ${bot.health}\n**Yemek:** ${bot.food}\n**XP:** ${bot.experience.level}\n **XYZ:** ${X} / ${Y} / ${Z}`);
                        msg.react("👍");
                    }
                    else if(msg.content == config.prefix + "mesajat"){
                        if (msg.author.bot) return;
                        if (!msg.guild) return;

                        if (args.length === 0) {
                            return channel.send(`Gönderilecek mesajı girin`);
                        }
                          let customMessage = args.join(" ");
                          bot.chat(customMessage);
                    }
                    else if(msg.content == config.prefix + "tpa"){
                        const userTo = args.join(" ").split(" ");
                        if (userTo.length !== 1) {
                          return message.reply(`Lütfen isim girin`);
                        }
                        bot.chat(`/tpa ${userTo[0]}`);
                    }
                }
            })
            
        }
        function isEmpty(str) {
            !str.trim().length;
           }

    }

})

client.on("ready", () => {
    console.log(`[BOT] Bot ${client.user.tag} olarak aktif edildi!`)
	
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    client.guilds.cache.forEach(async (guild) => {
        (async () => {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, guild.id),
                    { body: commands },
                );

            } catch (error) {
                   
                return console.error("[BOT] " + guild.name + " isimli sunucuya slash komutları iznim olmadığı için yükleyemedim. " + error);
            }
        })();
    })
})

client.on("guildCreate", async (guild) => {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guild.id),
                { body: commands },
            );

        } catch (error) {
            console.error("[BOT] " + guild.name + " isimli sunucuya slash komutları iznim olmadığı için yükleyemedim. ");
            return
        }
    })();
})



client.login(config.token).catch(err => {
    console.log("[BOT] Token geçerli değil. Hata: " + err)
})