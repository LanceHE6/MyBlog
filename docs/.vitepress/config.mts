import { defineConfig } from 'vitepress'

// 导入主题的配置
import { blogTheme } from './blog-theme'

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  //  部署到 GitHub Pages 时的根路径，默认：'/', 仓库名不为github.io时
  //  需要配置，例如：'/MyBlog/'
  // base: '/MyBlog/',
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  // base,
  lang: 'zh-cn',
  title: "Hycer's Blog",
  description: '照亮你前行的道路，为你的思考指引方向',
  lastUpdated: true,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: '目录'
    },
    // 默认文案修改
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdatedText: '上次更新于',

    // 设置logo
    logo: '/logo.jpg',
    editLink: {
      pattern:
        'https://github.com/LanceHE6/MyBlog/tree/main/docs/:path',
      text: '去 GitHub 上编辑内容'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '工具', items: [
          { text: 'it-tools', link: 'https://it-tools.tech' },
          { text: 'Linux命令查询', link: 'https://linux.hycer.cn' },
          { text: 'BingAI', link: 'https://bing.hycer.cn' }
        ]},
      { text: '资源', items: [
          { text: '清华大学开源软件镜像站', link: 'https://mirrors.tuna.tsinghua.edu.cn/' },
        ]}
      // { text: 'GitHub', link: 'https://github.com/LanceHE6' }
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/LanceHE6'
      }
    ]
  }
})
