module.exports = {
  apps: [
    {
      name: "SpotMyPet-Backend",
      script: "app.js",
      cwd: "/home/appuser/Prj-SpotiPet-Back/src/",
      interpreter: "/home/appuser/.nvm/versions/node/v18.20.4/bin/node",
      watch: false,
      env: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        PORT: 9000,
        TOKEN_SECRET: process.env.TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        // Otras variables de entorno
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
    },
  ],
};
