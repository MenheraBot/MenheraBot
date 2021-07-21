module.exports = {
  apps: [
    {
      name: 'Menhera',
      script: './shard.js',
      watch: false,
      max_memory_restart: '4096M',
      interpreter_args: '--max-old-space-size=4096',
    },
  ],
};
