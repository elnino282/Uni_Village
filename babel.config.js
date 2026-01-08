// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@/features": "./src/features",
            "@/shared": "./src/shared",
            "@/lib": "./src/lib",
            "@/config": "./src/config",
            "@/store": "./src/store",
            "@/providers": "./src/providers",
            "@/src": "./src",
            "@/components": "./components",
            "@/hooks": "./hooks",
            "@/constants": "./constants",
            "@/assets": "./assets",
            "@": "./",
          },
        },
      ],
    ],
  };
};
