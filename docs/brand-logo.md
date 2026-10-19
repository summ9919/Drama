# 小马品牌图标

当前品牌源文件是 `assets/pony-icon.svg`，背景为纯色 `#e5ce4d`。
造型为瘦脸、歪嘴露齿笑的中性全身小马，脖后无鬃毛，马蹄采用同色直筒圆头轮廓。

运行 `npm run brand:generate` 从 SVG 生成全部 PNG：

- `icon.png`、`logo.png`：1024 × 1024，不透明的完整图标。
- `logo_icon.png`：256 × 256，供应用内共用的 BrandIcon 组件使用。
- `favicon.png`：64 × 64，供 Web 使用。
- `adaptive-icon.png`：1024 × 1024，透明前景及安全边距；Android 背景由 app.json 设置为 #e5ce4d。
- `icon-hd-v2.png`、`icon-hd-original-ratio.png`、`logo-hd-v2.png`：2048 × 2048，与当前品牌同步的高清版本。

页面页头、取景器页头、相机导航、相机入口和旧 RainbowBrand 均使用同一个小马品牌图标。
其他文档中的旧版图像生成提示词仅作设计历史记录。
