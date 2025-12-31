(() => {
  const SUPABASE_URL = 'https://mxkwkaptgevxuyasnelr.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_35K0XJacm_XE46BpY1EhDg_k1g1rGEw';

  if (!window.supabase) {
    console.error('Supabase client not found. Load supabase-js before realtime.js');
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const channels = {};

  function createRoomCode(length = 6) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function getPresenceList(channel) {
    const state = channel.presenceState();
    const entries = Object.values(state).flat();
    return entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      isHost: Boolean(entry.isHost)
    }));
  }

  function connect(game, roomCode, profile, handlers = {}) {
    if (!roomCode) throw new Error('Missing room code');
    const channelName = `room:${game}:${roomCode}`;

    if (channels[game]?.channel) {
      channels[game].channel.unsubscribe();
    }

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: profile.id }
      }
    });

    channel.on('broadcast', { event: 'msg' }, ({ payload }) => {
      if (handlers.onMessage) handlers.onMessage(payload);
    });

    channel.on('presence', { event: 'sync' }, () => {
      const list = getPresenceList(channel);
      if (handlers.onPresence) handlers.onPresence(list);
    });

    channel.subscribe(async (status) => {
      if (handlers.onStatus) handlers.onStatus(status);
      if (status === 'SUBSCRIBED') {
        await channel.track(profile);
      }
    });

    channels[game] = { channel, roomCode, profile };
    return channel;
  }

  function send(game, payload) {
    const channel = channels[game]?.channel;
    if (!channel) return;
    channel.send({ type: 'broadcast', event: 'msg', payload });
  }

  function disconnect(game) {
    const channel = channels[game]?.channel;
    if (channel) channel.unsubscribe();
    delete channels[game];
  }

  window.GPRealtime = {
    supabase,
    createRoomCode,
    connect,
    send,
    disconnect
  };
})();
