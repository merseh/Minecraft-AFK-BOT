module.exports = (client, member) => {
    
    const { JsonDatabase } = require("wio.db");
	const Discord = require("discord.js")
    
    const db = new JsonDatabase({
      databasePath: "database.json"
    });
    
    const channel = db.fetch(`sunucular.${member.guild.id}.gelen-giden.kanal`)
    const status = db.fetch(`sunucular.${member.guild.id}.gelen-giden.status`)
    const content = db.fetch(`sunucular.${member.guild.id}.giden.content`)
	if(channel){
        
        if(status === true){
            
            const embed = new Discord.MessageEmbed()
			.setColor(client.config.embed.color)
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(content.toString().replaceAll(`%kullanıcı-etiket%`, member).replaceAll(`%kullanıcı-isim%`, member.user.username).replaceAll(`%sunucu-üye%`, member.guild.memberCount))
            try {
                member.guild.channels.cache.get(channel).send({ embeds: [embed] })   
            } catch (error) {
                return
            }
            
        }
        
    }
    
    
};