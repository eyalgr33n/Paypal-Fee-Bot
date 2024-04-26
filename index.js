const { Client, GatewayIntentBits, Partials, REST, Routes, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { parse: parseHtml } = require("node-html-parser")
const axios = require('axios');

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials)
});

const token = "Your Bot Token Here";
const guildId = "Your Main Guild Id Here";

const commands = [{
    name: 'paypal-fee',
    description: 'paypal fee calculator',
    options: [
        {
            name: 'amount',
            description: 'the amount to pay',
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
}];

const rest = new REST({ version: '10' }).setToken(token);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === 'paypal-fee') {
        const amount = interaction.options.getInteger('amount');
        const amountToGet = await getAmountToGet(amount);
        const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('PayPal Fee Calculator')
        .setDescription(`To Receive **${amount}₪**\nThe Client Need to send: **${amountToGet}₪**`)
        .setFooter({
            text: `Made By: Ech0z.dev#0`
        });
        return interaction.reply({
            embeds: [embed]
        });
    }
});

async function getAmountToGet(amount) {
    const url = `https://www.salecalc.com/paypal?p=${amount}&l=il&r=0&e=0&f=0&m=2&c=0`;
    try {
        const response = await axios.get(url);
        const doc = response.data;
        const root = parseHtml(doc);
        const toReceiveGross = root.querySelector('#toReceiveGross').innerText;
        return toReceiveGross.replace('&#8362;', '');
    } catch (e) {
        console.error(e);
        return null;
    }
}


client.login(token);