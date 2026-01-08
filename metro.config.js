const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

// Enable alias paths
config.resolver.extraNodeModules = {
  "@": __dirname,
  "@/src": path.resolve(__dirname, "src"),
  "@/features": path.resolve(__dirname, "src/features"),
  "@/shared": path.resolve(__dirname, "src/shared"),
  "@/lib": path.resolve(__dirname, "src/lib"),
  "@/config": path.resolve(__dirname, "src/config"),
  "@/store": path.resolve(__dirname, "src/store"),
  "@/providers": path.resolve(__dirname, "src/providers"),
  "@/components": path.resolve(__dirname, "components"),
  "@/hooks": path.resolve(__dirname, "hooks"),
  "@/constants": path.resolve(__dirname, "constants"),
  "@/assets": path.resolve(__dirname, "assets"),
};

module.exports = config;
