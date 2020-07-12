const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: ['webpack/hot/poll?100', './src/main.ts'],
    watch: true,
    target: 'node',
    externals: [
        nodeExternals({
            whitelist: ['webpack/hot/poll?100'],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    getCustomTransformers: (program) => ({
                        before: [require('@nestjs/swagger/plugin').before({}, program)]
                    }),
                },
            },
        ],
    },
    mode: 'development',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/])],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'main.js',
    },
};
