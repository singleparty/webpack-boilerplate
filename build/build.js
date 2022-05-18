const webpack = require('webpack');
const webpackProdConfig = require('./webpack.prod')

const compiler = webpack(webpackProdConfig);
compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.log('构建失败')
  } else {
    console.log('构建成功')
  }
  compiler.close((closeErr) => {

  });
});
