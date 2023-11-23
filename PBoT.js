const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token, ownerId } = require('./config.json'); // Create a config.json file with your bot token and owner ID

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const [command, ...args] = message.content.slice(prefix.length).split(' ');

  // Simple moderation command: purge
  if (command === 'purge' && message.member.hasPermission('MANAGE_MESSAGES')) {
    const deleteCount = parseInt(args[0], 10);
    if (!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply('Please provide a number between 2 and 100 for the number of messages to delete.');

    const fetched = await message.channel.messages.fetch({ limit: deleteCount });
    message.channel.bulkDelete(fetched);
    message.channel.send(`Deleted ${deleteCount} messages.`).then((msg) => msg.delete({ timeout: 3000 }));
  }

  // Welcoming new users
  if (command === 'welcome') {
    if (message.member.hasPermission('MANAGE_CHANNELS')) {
      const welcomeChannel = message.guild.channels.cache.find((channel) => channel.name === 'welcome');
      welcomeChannel.send(`Welcome to the server, ${message.author.username}!`);
    }
  }

  // Custom command for moderators
  if (command === 'customcommand' && message.member.roles.cache.some((role) => role.name === 'Moderator')) {
    // Your custom command logic here
    message.channel.send('This is a custom command for moderators!');
  }

  // Announcement command
  if (command === 'announce' && message.member.hasPermission('ADMINISTRATOR')) {
    const announcementChannel = message.guild.channels.cache.find((channel) => channel.name === 'announcements');
    announcementChannel.send(args.join(' '));
  }

  // Role management
  if (command === 'giverole' && message.member.hasPermission('MANAGE_ROLES')) {
    const roleName = args.join(' ');
    const role = message.guild.roles.cache.find((r) => r.name === roleName);
    if (role) {
      message.member.roles.add(role);
      message.channel.send(`You now have the ${roleName} role!`);
    } else {
      message.channel.send(`Role "${roleName}" not found.`);
    }
  }

  // Your other commands...

});

client.on('guildMemberAdd', (member) => {
  // Invite Tracker
  const inviteChannel = member.guild.channels.cache.find((channel) => channel.name === 'invite-log');
  if (inviteChannel) {
    inviteChannel.send(`User ${member.user.tag} joined using invite code: ${member.user.system ? 'Unknown' : member.user.system}!`);
  }
});

client.login(token);
