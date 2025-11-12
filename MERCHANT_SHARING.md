# 商户分享功能指南

## 🎯 功能概述

BeautyBook 现在支持商户专属预约系统，每个商户都可以生成自己的二维码和链接，直接分享给客户进行预约。

## ✨ 核心功能

### 1. 商户专属预约页面

每个商户都有一个独立的预约落地页：

```
https://your-domain.com/book/[商户ID]
```

**特点：**
- 🎨 精美的品牌化设计
- 📱 完全响应式，支持手机扫码访问
- 🚀 简化的预约流程
- ⭐ 展示商户评价和认证信息
- 🔒 安全的 Stripe 支付集成

**访问路径：**
- 直接访问: `/book/[providerId]`
- 区别于平台搜索页面: `/providers/[id]/book`

### 2. 二维码生成

在**分享中心**，商户可以：

✅ 实时生成高清二维码
✅ 下载 PNG 格式图片
✅ 打印后放置在店铺
✅ 添加到社交媒体
✅ 嵌入营销材料

**二维码功能：**
- 256x256 像素高清画质
- 包含纠错功能（Level H）
- 可选添加 Logo
- 适合打印和数字使用

### 3. 链接分享工具

**一键分享到：**
- 📱 WhatsApp
- 💬 微信（通过二维码）
- 📧 电子邮件
- 🔗 直接复制链接

**分享中心位置：**
```
/dashboard/sharing
```

### 4. 快捷分享按钮

在商户仪表板中集成了快捷分享功能，可以：
- 快速复制链接
- 预览预约页面
- 跳转到二维码生成

## 📋 使用指南

### 商户端操作

#### 步骤 1：访问分享中心

1. 登录到商户仪表板
2. 点击侧边栏的 **"Sharing Center"**
3. 查看您的专属预约链接和二维码

#### 步骤 2：下载二维码

1. 在分享中心页面，查看自动生成的二维码
2. 点击 **"下载二维码"** 按钮
3. 保存为 PNG 文件

#### 步骤 3：分享给客户

**线上分享：**
- 复制链接发送到微信、WhatsApp
- 在社交媒体简介中添加链接
- 在电子邮件签名中包含链接
- 发布到 Instagram Story、Facebook 等

**线下推广：**
- 打印二维码展示在店铺
- 添加到名片
- 制作传单或海报
- 放置在收银台

### 客户端体验

#### 扫码预约流程

1. **扫描二维码** 或 **点击链接**
   - 立即进入商户专属预约页面

2. **查看商户信息**
   - 头像、简介、评分
   - 服务年限、认证标识
   - 客户评价

3. **选择服务** (步骤 1)
   - 浏览所有可用服务
   - 查看价格和时长
   - 自动选择（如果只有一个服务）

4. **选择日期** (步骤 2)
   - 未来14天可选
   - 周视图滚动
   - 高亮显示今天

5. **选择时间** (步骤 3)
   - 9:00 AM - 6:00 PM
   - 30分钟时间间隔
   - 实时显示可用性

6. **确认并支付**
   - 查看预约摘要
   - Stripe 安全支付
   - 即时确认

## 🎨 设计特点

### 商户专属页面设计

**视觉风格：**
- 渐变背景（从 primary-50 到 secondary-50）
- 玻璃态卡片效果（card-glass）
- 渐变按钮和图标
- 阴影发光效果（shadow-glow）

**品牌元素：**
- 大尺寸商户头像（32x32 圆角）
- 认证盾牌图标
- 星级评分显示
- 位置和经验信息

**交互体验：**
- 步骤编号（1, 2, 3）随进度变色
- 选中项高亮显示
- 悬停效果
- 加载状态动画

### 分享中心设计

**布局：**
- 左侧：二维码展示和下载
- 右侧：链接、分享选项、统计数据

**组件：**
- 实时二维码预览
- 可复制的链接输入框
- 社交平台快捷分享按钮
- 使用建议列表
- 分享数据统计（占位）

## 📊 数据统计（即将推出）

分享中心预留了数据统计功能：

- 📈 链接访问次数
- 📱 二维码扫描次数
- ✅ 成功预约转化率
- 📅 访问时间分布
- 🌍 访问来源分析

## 🔧 技术实现

### 文件结构

```
app/
├── book/
│   └── [providerId]/
│       └── page.tsx          # 商户专属预约页面
├── dashboard/
│   ├── layout.tsx             # 添加 Sharing Center 导航
│   └── sharing/
│       └── page.tsx          # 分享中心页面
components/
└── ShareButton.tsx            # 可复用分享按钮组件
```

### 关键组件

#### 1. 商户预约页面 (`/book/[providerId]/page.tsx`)

```typescript
// 功能特点
- 动态路由获取商户ID
- 从 mock-data 获取商户信息
- 自动选择单一服务
- 集成 Stripe 支付
- 中英文双语界面
```

#### 2. 分享中心 (`/dashboard/sharing/page.tsx`)

```typescript
// 核心功能
- QRCodeCanvas 二维码生成
- Clipboard API 复制链接
- Canvas API 下载二维码
- Web Share API 原生分享
- WhatsApp/微信分享集成
```

#### 3. 分享按钮组件 (`components/ShareButton.tsx`)

```typescript
// Props
interface ShareButtonProps {
  providerId: string;
  providerName: string;
  variant?: 'default' | 'compact';
}

// 使用示例
<ShareButton
  providerId="1"
  providerName="Dr. Sarah Johnson"
  variant="compact"
/>
```

### 依赖库

```json
{
  "dependencies": {
    "qrcode.react": "^3.x",  // QR码生成
    "qrcode": "^1.x"         // QR码工具库
  }
}
```

### API 路由

预约创建仍使用现有 API：

```
POST /api/appointments
```

参数：
```json
{
  "providerId": "string",
  "serviceId": "string",
  "date": "ISO date string",
  "startTime": "string",
  "endTime": "string"
}
```

## 🚀 部署建议

### 环境变量

确保配置以下变量：

```bash
# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Stripe 支付
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Clerk 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### SEO 优化

为每个商户预约页面添加动态 meta 标签：

```typescript
export async function generateMetadata({ params }) {
  const provider = await getProvider(params.providerId);

  return {
    title: `预约 ${provider.name} - BeautyBook`,
    description: provider.bio,
    openGraph: {
      title: `预约 ${provider.name}`,
      description: provider.bio,
      images: [provider.avatar],
    }
  };
}
```

### 性能优化

- 二维码使用客户端渲染（use client）
- 图片使用 Next.js Image 优化
- 静态生成商户列表页
- 动态路由按需生成

## 📱 使用场景

### 美容院/Spa

```
🏪 场景：店内推广
💡 方案：在收银台放置二维码展架
📈 效果：客户离店后仍可扫码预约下次服务
```

### 独立美容师

```
👤 场景：个人品牌推广
💡 方案：在 Instagram 简介添加预约链接
📈 效果：粉丝直接点击链接预约，无需平台搜索
```

### 美甲师

```
💅 场景：客户推荐
💡 方案：通过微信发送预约链接给新客户
📈 效果：客户直接访问，快速完成预约
```

### 移动美容服务

```
🚗 场景：上门服务推广
💡 方案：在名片和传单上印刷二维码
📈 效果：潜在客户扫码即可查看服务并预约
```

## 🎯 营销策略建议

### 1. 社交媒体整合

- 在 Bio 中添加 "📅 Book Now" 链接
- Instagram Story 高亮存储二维码
- Facebook 帖子置顶预约链接
- 小红书笔记配图包含二维码

### 2. 线下推广

- 打印 A4 尺寸二维码海报
- 名片背面印刷二维码
- 收银台放置扫码立牌
- 产品包装贴纸

### 3. 客户沟通

- 服务完成后发送预约链接
- 短信/邮件包含"再次预约"按钮
- WhatsApp 状态更新
- 微信朋友圈推广

### 4. 合作推广

- 与相关商家交换二维码展示
- 参加展会时展示二维码
- 本地社区活动推广
- 联名活动专属链接

## ❓ 常见问题

### Q: 二维码会过期吗？
A: 不会。二维码链接永久有效，除非商户被停用。

### Q: 可以自定义预约页面吗？
A: 目前使用统一模板，未来版本将支持自定义品牌颜色和 Logo。

### Q: 客户必须注册才能预约吗？
A: 目前需要 Clerk 认证。可选：实现游客预约功能。

### Q: 如何追踪哪些预约来自分享链接？
A: 统计功能正在开发中，将支持 UTM 参数追踪。

### Q: 可以为不同服务生成不同链接吗？
A: 当前是商户级别链接。未来可添加服务级别参数：`/book/[providerId]?service=serviceId`

### Q: 支持多语言吗？
A: 当前主要为中文界面，可通过国际化（i18n）添加多语言支持。

## 🔮 未来规划

### 短期（P1）

- [ ] 添加 UTM 参数追踪来源
- [ ] 分享数据统计功能
- [ ] 预约页面自定义主题
- [ ] 批量生成多个服务链接

### 中期（P2）

- [ ] 短链接生成（bit.ly 集成）
- [ ] 社交媒体一键发布
- [ ] 自定义二维码样式（颜色、Logo）
- [ ] A/B 测试不同页面版本

### 长期（P3）

- [ ] 白标解决方案（完全自定义域名）
- [ ] 智能推荐最佳分享时间
- [ ] AI 生成营销文案
- [ ] 与 CRM 系统集成

## 📞 支持

如有问题或建议，请联系：
- GitHub Issues: [项目仓库]
- 文档: [BeautyBook Docs]

---

**让每个商户都能轻松获客，让每个客户都能便捷预约！** 🎉
