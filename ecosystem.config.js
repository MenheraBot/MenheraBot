module.exports = {
  apps: [{
    name: 'Menhera',
    script: './shard.js',
    watch: false,
    max_memory_restart: '768M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    interpreter_args: '--max-old-space-size=768',
  }],
};

