module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@': './',
                        '@/src': './src',
                        '@/features': './src/features',
                        '@/shared': './src/shared',
                        '@/lib': './src/lib',
                        '@/config': './src/config',
                        '@/store': './src/store',
                        '@/providers': './src/providers',
                    },
                },
            ],
        ],
    };
};
