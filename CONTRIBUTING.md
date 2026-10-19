# 贡献指南

感谢你对 PromptCard 的兴趣！这是一份长线开源项目，欢迎任何形式的参与。

## 如何参与

- **提 Issue**：bug、功能建议、使用疑问都可以
- **提 PR**：修 bug、加功能、改文档都欢迎
- **分享卡片**：把你的好用提示词做成卡片分享出去，让项目被更多人看到

## 本地开发

```bash
git clone <your-fork-url>
cd promptcard
npm install
npm run seed    # 写入示例数据
npm run dev
```

## 代码风格

- TypeScript + 函数式风格
- 组件用函数声明，不用 class
- 提交前确保 `npm run build` 通过

## 提交规范

- `feat: 新功能`
- `fix: 修复 bug`
- `docs: 文档`
- `chore: 杂项`

## 目录结构

参见 README 的「项目结构」一节。核心约定：
- API 路由放 `src/app/api/`
- 数据库相关放 `src/lib/`
- 页面放 `src/app/`

再次感谢你的贡献。
