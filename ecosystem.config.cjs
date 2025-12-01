module.exports = {
  apps: [{
    name: "kpi-dashboard",
    script: "./dist/index.js",
    cwd: "/root/dash-kpi",
    instances: 1,
    exec_mode: "fork"
  }]
};
