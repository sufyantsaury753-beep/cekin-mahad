const localtunnel = require('localtunnel');

async function createTunnel() {
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: 'cekin-mahad-uinssc' });
    console.log('TUNNEL_URL:' + tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed, restarting in 3s...');
      setTimeout(createTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
      setTimeout(createTunnel, 3000);
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err);
    setTimeout(createTunnel, 5000);
  }
}

createTunnel();
