module.exports = function( client ) {


    const requestEvent = (event) => require(`../events/${event}`)
    client.on('interactionCreate', (interactionCreate) => requestEvent('interactionCreate')(interactionCreate, client));
    
}