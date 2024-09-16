module.exports = {
  apps: [
    {
      name: "SpotMyPet-Backend",
      script: "app.js",
      cwd: "/root/Prj-SpotiPet-Back",
      watch: false,
      env: {
        NODE_ENV: "production",
        DATABASE_URL:
          "mongodb+srv://usuario:contraseña@finalclass.gjvglcn.mongodb.net/SpotMyPet?retryWrites=true&w=majority&appName=SpotMyPet",
        PORT: 9000, // Si usas la variable PORT en tu aplicación
        // Otras variables de entorno
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "/root/.pm2/logs/SpotMyPet-Backend-error.log",
      out_file: "/root/.pm2/logs/SpotMyPet-Backend-out.log",
      merge_logs: true,
    },
  ],
};
