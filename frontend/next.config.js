/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 添加webpack配置以处理生成的代码
  webpack: (config, { isServer }) => {
    // 修改导入解析器行为
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };

    return config;
  },
};

module.exports = nextConfig;
