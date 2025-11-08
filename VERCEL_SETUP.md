# 🚀 Vercel 部署配置指南

## 📋 必需的环境变量

在 Vercel Dashboard 中配置以下环境变量：

### 1️⃣ Supabase 配置（必需）

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jsyxfclzeiyjalxcwkep.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeXhmY2x6ZWl5amFseGN3a2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDY1MzEsImV4cCI6MjA3NTMyMjUzMX0.gHpT54uREX2-Rrjw1GTk9dFiDHycBkbTsKetvrXj8sA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeXhmY2x6ZWl5amFseGN3a2VwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc0NjUzMSwiZXhwIjoyMDc1MzIyNTMxfQ.579nF5uYBLwjLLC63hh67zAivmZP2G1mCEDh_AfIQd8
```

### 2️⃣ Clerk 认证配置（必需）

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGFyaW5nLXN0YXJsaW5nLTYzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_DiDKHl79QmEnspidcOtWtyGIRJi21SV6k1JFvPUx3B
CLERK_WEBHOOK_SECRET=whsec_/ymTgSewD+rpC3shx3NyySP6VxiGPKIT
```

### 3️⃣ 应用配置（必需）

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4️⃣ 数据库连接（可选 - 仅用于服务器端操作）

```bash
POSTGRES_URL=postgres://postgres.jsyxfclzeiyjalxcwkep:531MQFYrbLwqBmTH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
DATABASE_URL=postgres://postgres.jsyxfclzeiyjalxcwkep:531MQFYrbLwqBmTH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

### 5️⃣ 第三方服务（可选 - 按需配置）

#### Stripe 支付
```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

#### SendGrid 邮件
```bash
SENDGRID_API_KEY=SG.your_key_here
```

#### Twilio 短信
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🔧 在 Vercel 中配置环境变量

### 方法 1: 通过 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 选择您的项目 `beautybook`
3. 点击 **Settings** 标签
4. 在左侧菜单选择 **Environment Variables**
5. 添加每个环境变量：
   - **Name**: 变量名（如 `NEXT_PUBLIC_SUPABASE_URL`）
   - **Value**: 变量值
   - **Environments**: 选择 Production, Preview, Development

6. 点击 **Save** 保存每个变量

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 添加环境变量（Production）
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... 添加其他变量

# 重新部署
vercel --prod
```

## ✅ 验证配置

配置完成后：

1. **触发重新部署**
   - 推送新的 commit 到 GitHub，或
   - 在 Vercel Dashboard 点击 **Redeploy**

2. **检查构建日志**
   - 确保没有 "Missing environment variables" 错误
   - 构建应该成功完成

3. **测试部署的应用**
   - 访问 https://your-app.vercel.app
   - 测试提供者列表页面
   - 测试 API 端点

## 🔒 安全注意事项

- ✅ `NEXT_PUBLIC_*` 前缀的变量会暴露给客户端
- ✅ 没有 `NEXT_PUBLIC_` 前缀的变量仅在服务器端可用
- ⚠️ 不要在客户端代码中使用 `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ 不要将 `.env.local` 文件提交到 Git

## 🐛 常见问题

### 问题 1: 构建失败 "Missing Supabase environment variables"

**解决方案**: 确保在 Vercel 中配置了所有 Supabase 相关的环境变量。

### 问题 2: API 运行时错误

**解决方案**:
- 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否配置正确
- 确保 Supabase 项目在线且可访问

### 问题 3: 认证不工作

**解决方案**:
- 确认 Clerk 环境变量配置正确
- 在 Clerk Dashboard 中添加 Vercel 域名到允许的域名列表

## 📝 环境变量清单

必需变量（核心功能）:
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [x] `CLERK_SECRET_KEY`
- [x] `NEXT_PUBLIC_APP_URL`

可选变量（高级功能）:
- [ ] `STRIPE_SECRET_KEY`
- [ ] `SENDGRID_API_KEY`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `POSTGRES_URL`
- [ ] `DATABASE_URL`

---

**准备好部署了吗？** 🚀

1. ✅ 配置所有必需的环境变量
2. ✅ 推送代码到 GitHub
3. ✅ 在 Vercel 中触发部署
4. ✅ 测试已部署的应用

有问题？查看 Vercel 部署日志获取详细错误信息。
