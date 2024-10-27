import path from 'path'; // Импортируем встроенный модуль path для работы с путями
import { __dirname } from './__dirname.js'; // Импортируем переменную __dirname для получения абсолютного пути
import MiniCssExtractPlugin from 'mini-css-extract-plugin'; // Плагин для извлечения CSS в отдельные файлы
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'; // Плагин для генерации manifest.json
import CopyWebpackPlugin from 'copy-webpack-plugin'; // Плагин для копирования файлов

export default {
  mode: 'production',
  context: path.resolve(__dirname, 'src'), // Устанавливаем контекст по умолчанию на папку src

  entry: {
    home: './index.js',  // Точка входа для index.js
    schedule: './schedule.js',  // Точка входа для schedule.js
  },

  // Настройки для выходных файлов
  output: {
    // Используем функцию для динамического формирования пути в зависимости от точки входа
    filename: (pathData) => {
      return pathData.chunk && pathData.chunk.name === 'schedule'
        ? 'schedule/[name].[contenthash].js'  // Все файлы schedule будут в папке dist/schedule
        : '[name].[contenthash].js'; // Для остальных файлов стандартная структура
    },
    path: path.resolve(__dirname, 'dist'), // Общая папка для выходных файлов
    publicPath: (pathData) => {
      return pathData.chunk && pathData.chunk.name === 'schedule' ? '/schedule/' : '/';
    },
    clean: true, // Очищаем dist перед каждой сборкой
  },

  // Оптимизация сборки
  optimization: {
    minimize: false,
  },

  plugins: [
    // Плагин для извлечения CSS в отдельные файлы
    new MiniCssExtractPlugin({
      // Динамическое имя для CSS файлов
      filename: (pathData) => {
        return pathData.chunk && pathData.chunk.name === 'schedule'
          ? 'schedule/[name].[contenthash].css' // CSS для schedule.js будет в папке dist/schedule
          : '[name].[contenthash].css'; // CSS для остальных точек входа
      },
    }),
    new WebpackManifestPlugin({
      fileName: path.resolve(__dirname, 'manifest.json'), // Путь к manifest.json
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/font'), to: 'font' },
        { from: path.resolve(__dirname, 'src/images'), to: 'images' },
        { from: path.resolve(__dirname, 'src/pages_info'), to: 'pages_info' },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i, // Применяем правило для всех CSS файлов
        use: [
          MiniCssExtractPlugin.loader, // Извлекаем CSS в отдельные файлы
          'css-loader', // Интерпретируем @import и url() как import/require()
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i, // Обработка шрифтов
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            // Проверка доступности pathData.module и resource
            if (pathData.module && pathData.module.resource) {
              return pathData.module.resource.includes('schedule')
                ? 'schedule/font/[name][ext]'  // Шрифты для schedule.js в dist/schedule/font
                : 'font/[name][ext]'; // Шрифты для других точек входа в dist/font
            }
            return 'font/[name][ext]'; // Резервный вариант
          },
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Обработка изображений
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            // Проверка доступности pathData.module и resource
            if (pathData.module && pathData.module.resource) {
              return pathData.module.resource.includes('schedule')
                ? 'schedule/images/[name][ext]'  // Изображения для schedule.js в dist/schedule/images
                : 'images/[name][ext]'; // Изображения для других точек входа в dist/images
            }
            return 'images/[name][ext]'; // Резервный вариант
          },
        },
      },
    ],
  },
};
