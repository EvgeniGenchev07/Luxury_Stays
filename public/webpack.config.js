const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        en: './src/en/index.html',
        bg: './src/bg/index.html',
    },
    output: {
        filename: '[name]/bundle.js', // Output a separate bundle for each entry
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development', // Use 'production' for production build
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/images/[name].[hash].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/fonts/[name].[hash].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        // Plugin for the "en" directory
        new HtmlWebpackPlugin({
            template: './src/en/index.html',
            filename: 'en/index.html', // Output file for the "en" entry
            chunks: ['en'], // Specify the "en" entry for this HTML
        }),
        // Plugin for the "bg" directory
        new HtmlWebpackPlugin({
            template: './src/bg/index.html',
            filename: 'bg/index.html', // Output file for the "bg" entry
            chunks: ['bg'], // Specify the "bg" entry for this HTML
        }),
    ],
};
