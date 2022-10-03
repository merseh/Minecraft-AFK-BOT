const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
let Discord = require("discord.js");
const ms = require("ms")

const { JsonDatabase } = require("wio.db");

const db = new JsonDatabase({
  databasePath: "database.json"
});


module.exports = {
  data: new SlashCommandBuilder()
    .setName('createbot')
    .setDescription('Create AFK accounts.'),
    enabled: true,
    developerOnly: false,
  
    async execute(interaction, client) { 


		const modal = new Discord.ModalBuilder()
			.setCustomId('createbot')
			.setTitle('Afk Bot Oluştur.');

        var usernameVal = db.fetch(`botlar.${interaction.user.id}.name`) || ""
        var hostVal = db.fetch(`botlar.${interaction.user.id}.host`) || ""
        var portVal = db.fetch(`botlar.${interaction.user.id}.port`) || ""
        var commandsVal = db.fetch(`botlar.${interaction.user.id}.commands`) || ""

		const username = new Discord.ActionRowBuilder().addComponents(new Discord.TextInputBuilder()
        .setCustomId('username')
        .setLabel("Username (Example: Merseh)")
        .setMinLength(3)
        .setMaxLength(15)
        .setRequired(true)
        .setValue(usernameVal)
        .setStyle(Discord.TextInputStyle.Short));
		const ip = new Discord.ActionRowBuilder().addComponents(new Discord.TextInputBuilder()
        .setCustomId('ip')
        .setLabel("Server İP Adress (Example: play.hypixel.net)")
        .setRequired(true)
        .setValue(hostVal)
        .setStyle(Discord.TextInputStyle.Short));
		const port = new Discord.ActionRowBuilder().addComponents(new Discord.TextInputBuilder()
        .setCustomId('port/')
        .setLabel("Server Port (Example: 25565)")
        .setRequired(false)
        .setValue(portVal)
        .setStyle(Discord.TextInputStyle.Short));      
		const commands = new Discord.ActionRowBuilder().addComponents(new Discord.TextInputBuilder()
        .setCustomId('commands')
        .setLabel("Commands/Message")
        .setValue(commandsVal)
        .setStyle(Discord.TextInputStyle.Paragraph));               

		modal.addComponents(username, ip, port, commands);

		await interaction.showModal(modal);

    }

};
