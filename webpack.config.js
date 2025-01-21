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
    cinema_panel: './cinema-panel.js',
    client_panel: './client-panel.js'
  },

  // Настройки для выходных файлов
  output: {
    // Используем функцию для динамического формирования пути в зависимости от точки входа
    filename: (pathData) => {
      if(pathData.chunk && pathData.chunk.name === 'schedule') {
        return 'schedule/[name].[contenthash].js'; // Все файлы schedule будут в папке dist/schedule
      } else if(pathData.chunk && pathData.chunk.name === 'cinema_panel') {
        return 'cinema-panel/[name].[contenthash].js';
      } else if(pathData.chunk && pathData.chunk.name === 'client_panel') {
        return 'client_panel/[name].[contenthash].js';
      } else {
        return '[name].[contenthash].js'; // Для остальных файлов стандартная структура
      }
    },
    path: path.resolve(__dirname, 'dist'), // Общая папка для выходных файлов
    publicPath: (pathData) => {
      if(pathData.chunk && pathData.chunk.name === 'schedule') {
        return '/schedule/';
      } else if(pathData.chunk && pathData.chunk.name === 'cinema_panel') {
        return '/cinema-panel/';
      } else if(pathData.chunk && pathData.chunk.name === 'client_panel') {
        return '/client_panel/';
      }  else {
        return '/';
      }
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
        if(pathData.chunk && pathData.chunk.name === 'schedule') {
          return 'schedule/[name].[contenthash].css';
        } else if (pathData.chunk && pathData.chunk.name === 'cinema_panel') {
          return 'cinema-panel/[name].[contenthash].css';
        } else if (pathData.chunk && pathData.chunk.name === 'client_panel') {
          return 'client_panel/[name].[contenthash].css';
        }else {
          return '[name].[contenthash].css';
        }
      },
    }),
    new WebpackManifestPlugin({
      fileName: path.resolve(__dirname, 'manifest.json'), // Путь к manifest.json
    }),
    new CopyWebpackPlugin({
      patterns: [
/*         { from: path.resolve(__dirname, 'src/images/schedule'), to: 'schedule/images' },
        { from: path.resolve(__dirname, 'src/images/cinema-panel'), to: 'cinema-panel/images' }, */
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
              if(pathData.module.resource.includes('schedule')) {
                return 'schedule/font/[name][ext]';  // Шрифты для schedule.js в dist/schedule/font
              } else if (pathData.module.resource.includes('cinema_panel')) {
                return 'cinema_panel/font/[name][ext]';
              } else if (pathData.module.resource.includes('client_panel')) {
                return 'client_panel/font/[name][ext]';
              }
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
              if(pathData.module.resource.includes('schedule')) {
                return 'schedule/images/[name][ext]'; // Изображения для schedule.js в dist/schedule/images
              } else if(pathData.module.resource.includes('cinema_panel')) {
                return 'cinema-panel/images/[name][ext]';
              }else if(pathData.module.resource.includes('client_panel')) {
                return 'client_panel/images/[name][ext]';
              }
            }
            return 'images/[name][ext]'; // Резервный вариант
          },
        },
      },
    ],
  },
};
