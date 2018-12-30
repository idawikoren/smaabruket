const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')

const production = process.env.NODE_ENV === 'production'

const STYLE_LOADER = production ? MiniCssExtractPlugin.loader : 'style-loader'

const config = {
  mode: production ? 'production' : 'development',
  entry: ['./src/index.tsx'],
  output: {
    path: path.resolve(__dirname, 'public/build/'),
    publicPath: 'build/',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './public',
    hot: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader',
      },
      {
        test: /\.css$/,
        use: [
          STYLE_LOADER,
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          STYLE_LOADER,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins() {
                return [
                  // require('precss'),
                  require('autoprefixer'),
                ]
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [],
  optimization: {},
}

if (production) {
  config.optimization.noEmitOnErrors = true

  // Split CSS to separate files
  config.plugins.push((
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'main.css',
      chunkFilename: 'main.css',
    })
  ))
}

module.exports = config
