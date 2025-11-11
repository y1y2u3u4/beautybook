# BeautyBook 部署指南

## 🚀 快速部署到 Vercel

### 1. 准备环境变量

在 Vercel 项目设置中，添加以下环境变量：

#### 必需的环境变量

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Twilio (SMS 通知)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (邮件通知)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 2. 部署步骤

#### 方式一：通过 Vercel Dashboard

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量（如上）
5. 点击 "Deploy"

#### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 3. 数据库设置

#### 使用 Supabase（推荐）

1. 创建 Supabase 项目：https://supabase.com
2. 获取数据库连接字符串（Settings > Database > Connection string）
3. 运行数据库迁移：

```bash
# 本地生成 Prisma Client
npx prisma generate

# 推送数据库架构
npx prisma db push

# 或使用 SQL 脚本
npm run setup-db
```

#### 使用其他 PostgreSQL 提供商

支持的提供商：
- Neon
- Railway
- Render
- AWS RDS
- Azure Database

### 4. Stripe Webhook 配置

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 Developers > Webhooks
3. 添加端点：`https://your-domain.vercel.app/api/webhooks/stripe`
4. 选择事件：
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. 复制 Webhook 签名密钥到 `STRIPE_WEBHOOK_SECRET`

### 5. Clerk 配置

1. 登录 [Clerk Dashboard](https://dashboard.clerk.com)
2. 创建应用或选择现有应用
3. 在 API Keys 页面获取：
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`
4. 配置重定向 URLs：
   - Homepage URL: `https://your-domain.vercel.app`
   - Sign-in URL: `https://your-domain.vercel.app/sign-in`
   - Sign-up URL: `https://your-domain.vercel.app/sign-up`

## 🔧 构建配置

### Prisma 生成

项目已配置自动生成 Prisma Client：

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

这确保在部署时 Prisma Client 会自动生成。

### Next.js 配置

`next.config.mjs` 已配置远程图片域名：
- `images.unsplash.com` - 用于示例图片
- `api.dicebear.com` - 用于头像生成

## 🐛 常见问题

### 1. Prisma Client 未生成

**错误**：`Cannot find module '@prisma/client'`

**解决**：
```bash
npx prisma generate
npm run build
```

### 2. 环境变量未加载

**错误**：API 路由返回 500 错误

**解决**：
- 检查 Vercel 项目设置中的环境变量
- 确保所有必需的变量都已设置
- 重新部署项目

### 3. Clerk 初始化失败

**错误**：`Missing publishableKey`

**解决**：
- 确保 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 已设置
- 检查 key 是否以 `pk_` 开头
- 确保 key 不是 placeholder

### 4. 数据库连接失败

**错误**：`Can't reach database server`

**解决**：
- 检查 `DATABASE_URL` 格式是否正确
- 确保数据库允许来自 Vercel 的连接
- 对于 Supabase，使用 "Transaction" 连接模式

### 5. Stripe Webhook 失败

**错误**：`Invalid signature`

**解决**：
- 确保 `STRIPE_WEBHOOK_SECRET` 正确
- 在 Stripe Dashboard 中验证 webhook URL
- 检查端点是否使用 HTTPS

## 📊 监控和日志

### Vercel 日志

查看实时日志：
```bash
vercel logs your-project-name --follow
```

### Prisma 日志

在 `lib/prisma.ts` 中已配置日志级别：
- 开发环境：`['query', 'error', 'warn']`
- 生产环境：`['error']`

## 🔒 安全检查清单

- [ ] 所有环境变量都使用生产密钥（不是测试密钥）
- [ ] DATABASE_URL 包含强密码
- [ ] Clerk 配置了正确的重定向 URLs
- [ ] Stripe webhook 使用 HTTPS
- [ ] .env 文件已添加到 .gitignore
- [ ] 敏感信息未提交到 Git

## 📈 性能优化

### 已实现的优化

1. **静态生成**：首页和列表页使用静态生成
2. **动态路由**：API 和动态页面标记为 `force-dynamic`
3. **图片优化**：使用 Next.js Image 组件
4. **代码分割**：自动按路由分割

### 建议的优化

1. **Redis 缓存**：缓存热门查询结果
2. **CDN**：使用 Vercel Edge Network
3. **数据库索引**：确保关键字段有索引
4. **连接池**：配置 Prisma 连接池

## 🚦 健康检查

部署后验证这些端点：

```bash
# 首页
curl https://your-domain.vercel.app

# API 健康检查
curl https://your-domain.vercel.app/api/providers

# Stripe webhook
curl -X POST https://your-domain.vercel.app/api/webhooks/stripe
```

## 📞 支持

如果遇到部署问题：

1. 检查 [Vercel 文档](https://vercel.com/docs)
2. 查看 [Next.js 部署指南](https://nextjs.org/docs/deployment)
3. 访问 [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)

## 🔄 持续部署

项目已配置自动部署：

- **主分支推送** → 自动部署到生产环境
- **PR 创建** → 创建预览部署
- **PR 更新** → 更新预览部署

---

**最后更新**：2025-11-11
