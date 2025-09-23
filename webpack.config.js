// webpack.config.js

const path = require("path");

module.exports = {
  mode: "development", // 배포 시에는 "production"으로 변경
  target: "electron-renderer", // Electron 렌더러 프로세스용
  entry: "./src/renderer/App.jsx", // React 진입점
  output: {
    path: path.resolve(__dirname, ".tmp/renderer"),
    filename: "bundle.js" // 번들 파일 이름
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // js, jsx 모두 처리
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/, // 나중에 React 컴포넌트에서 CSS import하면 필요
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
  extensions: [".js", ".jsx"],
  fallback: {
    fs: false,
    path: false,
    child_process: false
  }
},
  devtool: "source-map" // 개발 편의
};
