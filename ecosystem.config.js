module.exports = {
  apps: [{
    name: 'emergente-api',
    script: './server/src/app.js',
    env_production: { NODE_ENV: 'production' },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
  }],
}
