const {
    SlashCommandBuilder
  } = require('@discordjs/builders');

const Discord = require("discord.js");
const ms = require("ms")
const { ActionRowBuilder, SelectMenuBuilder, EmbedBuilder, TextInputBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");

const db = new JsonDatabase({
  databasePath: "database.json"
});
module.exports = {
    data: new SlashCommandBuilder()
      .setName('commands')
      .setDescription('Use on game command.'),
      enabled: true,
      developerOnly: false,

      async execute(interaction, client, message, member) {
            const selectMenu = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Choose a command')
                    .addOptions([
                        {
                            label: 'Auto Farm',
                            value: 'farming',
                        },
                        {
                            label: 'Auto Mine',
                            value: 'lookaround',
                        },
                        {
                            label: 'Auto Fishing',
                            value: 'blabla',
                        },
                        {
                            label: 'blabla2',
                            value: 'blabla2',
                        },
                    ]),
            );
            const embed = new EmbedBuilder()
            //.setAuthor(message.author.username, message.author.displayAvatarURL())
            .setColor("#fefefe")
            .addFields(
			{ name: 'Categories', value: 'Choose a command' },
			)
            .setThumbnail(member.user.displayAvatarURL())
            interaction.reply({ embeds: [embed], components: [selectMenu]}).then(m => {
            const menuCollector = m.createMessageComponentCollector({ componentType: "SELECT_MENU", time: 15000 });

            menuCollector.on('collect', async u => {
               if(u.user.id === message.author.id) {
                   u.deferUpdate()
                        m.edit({ embeds: [ new EmbedBuilder()
                        .setColor("#fefefe")
                        .setAuthor("Help", message.author.displayAvatarURL())
                        .setDescription(`${u.values[0]} seçtin.`)] 
                    })
                }
            });
        });
}
};
