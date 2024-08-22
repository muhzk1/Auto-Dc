module.exports = class AutoDisconnect extends window.Plugin {
    constructor() {
        super();
        this.targetUserId = null;
    }

    start() {
        this.injectCSS();
        this.loadSettings();

        // Register the chat command
        this.registerCommand('settarget', this.setTarget.bind(this));

        // Listen for voice state updates
        this.voiceStateUpdateListener = (oldState, newState) => {
            this.handleVoiceStateUpdate(oldState, newState);
        };
        window.DiscordAPI.on('voiceStateUpdate', this.voiceStateUpdateListener);
    }

    stop() {
        this.removeCSS();
        this.unregisterCommand('settarget');
        window.DiscordAPI.off('voiceStateUpdate', this.voiceStateUpdateListener);
    }

    injectCSS() {
        const style = `
            /* Your CSS here */
        `;
        const styleElement = document.createElement('style');
        styleElement.innerHTML = style;
        document.head.appendChild(styleElement);
    }

    removeCSS() {
        const styles = document.querySelectorAll('style');
        styles.forEach(style => style.remove());
    }

    async setTarget(args) {
        if (args.length === 0) {
            return 'Please provide a valid user ID.';
        }
        this.targetUserId = args[0].replace(/[<@!>]/g, ''); // Clean up user ID
        return `Target user set to <@${this.targetUserId}>`;
    }

    handleVoiceStateUpdate(oldState, newState) {
        if (this.targetUserId && newState.channel && newState.member.id === this.targetUserId) {
            const channel = newState.channel;
            if (channel) {
                channel.members.forEach(member => {
                    if (member.id !== this.targetUserId) {
                        member.voice.disconnect();
                        console.log(`Disconnected ${member.user.tag} from ${channel.name}`);
                    }
                });
            }
        }
    }

    loadSettings() {
        // Load settings if needed
    }

    // Methods for registering and unregistering chat commands
    registerCommand(name, callback) {
        window.EDCmd.addCommand(name, callback);
    }

    unregisterCommand(name) {
        window.EDCmd.removeCommand(name);
    }
};
