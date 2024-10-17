import path from 'path'; // Импортируем встроенный модуль path для работы с путями
import { __dirname } from './__dirname.js'; // Импортируем переменную __dirname для получения абсолютного пути
import TerserPlugin from 'terser-webpack-plugin'; // Импортируем плагин для минификации JavaScript
import MiniCssExtractPlugin from 'mini-css-extract-plugin'; // Плагин для извлечения CSS в отдельные файлы
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  mode: 'production',
  context: path.resolve(__dirname, 'src'),

  entry: [
    './index.js',
    /* './modules_js/menu.js', */
  ],

  // Настройки для выходного файла
  output: {
    filename: 'main.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '../',
    clean: true,
  },

  // Оптимизация сборки
  optimization: {
    minimize: false,
/*     minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
          compress: true,
        },
        extractComments: false,
      }),
    ], */
  },


  plugins: [
    // Плагин для извлечения CSS в отдельные файлы
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css', // Имя итогового CSS файла
    }),
    new WebpackManifestPlugin({
      fileName: path.resolve(__dirname, 'manifest.json'), // Указываем полный путь к файлу manifest.json
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/font'), to: 'font' }, 
        { from: path.resolve(__dirname, 'src/images'), to: 'images' },
      ]}),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i, // Применяем правило для всех файлов с расширением .css
        use: [
          MiniCssExtractPlugin.loader, // Извлекаем CSS в отдельные файлы
          'css-loader', // Загружаем CSS файлы и интерпретируем @import и url() как import/require()
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i, // Обработка шрифтов
        type: 'asset/resource',
        generator: {
          filename: 'font/[name][ext]', // Путь для шрифтов в dist
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Обработка изображений
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]', // Путь для изображений в dist
        },
      },
    ],
  },
};



