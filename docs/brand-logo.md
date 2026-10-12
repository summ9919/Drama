# 品牌 Logo

当前使用：[`assets/logo.png`](../assets/logo.png)，2172 × 724 像素，横版比例 3:1。

基于用户提供的高清横版修改，保留蓝灰、奶油金、D 字母光圈和“Drama相机”字标，调整左侧图标比例。使用内置 imagegen 生成，保留生成文件原始尺寸，浅色不透明背景。

README 仅指定显示宽度，应用使用 `aspectRatio: 2172 / 724` 和 `resizeMode="contain"` 等比显示。不要独立设置不匹配的宽高，也不要使用 `stretch`。

历史界面截图展示的是截图时的版本；当前品牌素材以此文件为准。

## 最终生成提示词

```text
Edit the provided horizontal Drama camera logo. The user asks for this specific image as the base and insists that the icon must NOT look flattened or stretched.
Make only the necessary proportional correction to the LEFT icon: its outer rounded-square face must be precisely square, equal height and width, straight-on front view. In the reference it is slightly too wide: correct the natural proportions while keeping the distinctive blue-gray draped folds, champagne-gold D with camera shutter aperture, and tiny gold dot. All corners remain fully visible. Preserve the right-hand exact text "Drama相机", its bold dark slate filled type, spacing, approximate size, baseline, and position as closely as possible. Preserve the opaque warm off-white background and 3:1 horizontal canvas, full composition with generous safe margins. Increase the icon height slightly if needed to make it square, rather than flattening or stretching the whole image. No change of design, no new text, no transparency, no cropping. High resolution master, crisp clean contours, no colored fringes, clean shading. Target native resolution 3072x1024 if available.
```
