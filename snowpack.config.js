// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    /* ... */
  },
  plugins: [
    [
      '@snowpack/plugin-webpack',
      {
        /** Plugin Options goes here */
        outputPattern: {
          js: "index.js",
          css: "index.css",
        },
        extendConfig: config => {
          delete config.optimization.splitChunks;
          delete config.optimization.runtimeChunk;
          config.module.rules[0] = {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-env'] }
              },
              {
                loader: path.resolve(__dirname, './node_modules/@snowpack/plugin-webpack/plugins/import-meta-fix.js')
              }
            ]
          }
          return config;
        }
      }
    ]
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
