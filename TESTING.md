# BeautyBook 测试指南

## 🧪 测试数据说明

项目包含完整的测试数据，可以在开发环境中快速体验所有功能。

### 测试数据内容

#### Providers（服务提供者）
- **6 个提供者**，涵盖不同服务类型：
  - Dr. Sarah Johnson - 皮肤科医生
  - Emily Rodriguez - 发型师
  - Michelle Chen - 按摩师
  - Jessica Williams - 美甲师
  - David Kim - 化妆师
  - Sophia Martinez - 美容师

#### Services（服务）
- **10+ 种服务**，包括：
  - 面部护理
  - 发型设计
  - 按摩服务
  - 美甲服务
  - 化妆服务

#### Reviews（评价）
- **8 条评价**，展示真实的用户反馈

---

## 🚀 快速开始

### 方式一：使用 Mock 数据（无需数据库）

Mock 数据已内置在代码中，运行开发服务器即可使用：

```bash
npm run dev
```

访问 http://localhost:3000，即可看到：
- 首页展示
- 提供者列表（6 个测试提供者）
- 提供者详情
- 预约流程

### 方式二：使用真实数据库

如果你想测试完整的数据库功能（预约、支付等）：

#### 1. 配置数据库

在 `.env` 文件中设置：

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/beautybook"
```

推荐使用 Supabase 或其他 PostgreSQL 提供商。

#### 2. 推送数据库架构

```bash
npm run db:push
```

#### 3. 填充测试数据

```bash
npm run db:seed
```

这将创建：
- 1 个测试客户
- 6 个服务提供者
- 10+ 种服务
- 8 条评价
- 完整的可用时间表

#### 4. 测试凭据

创建后可使用以下测试凭据：

**客户账户：**
- Email: customer@test.com
- Clerk ID: test_customer_1

**提供者账户：**
- Email: provider1@test.com, provider2@test.com, ...
- Clerk IDs: provider_1, provider_2, ...

---

## 🎯 测试场景

### 1. 浏览和搜索

✅ **测试内容：**
- 访问首页
- 使用搜索框搜索服务（如："facial"）
- 访问提供者列表页
- 使用筛选器（城市、评分、价格等）

✅ **预期结果：**
- 看到 6 个测试提供者
- 筛选功能正常工作
- 可以查看提供者详情

### 2. 提供者详情

✅ **测试内容：**
- 点击任意提供者
- 查看详细资料
- 阅读评价
- 查看服务列表

✅ **预期结果：**
- 显示完整的提供者信息
- 显示教育背景和认证
- 显示相关评价
- 显示可用服务

### 3. 预约流程（需要数据库）

✅ **测试内容：**
- 选择一个提供者
- 点击"预约"按钮
- 选择服务、日期、时间
- 继续到支付页面

⚠️ **注意：**
- 需要配置 Stripe 测试密钥
- 需要配置 Clerk 认证

✅ **预期结果：**
- 可以选择服务和时间
- 创建预约记录
- 跳转到 Stripe 支付页面

### 4. 用户仪表板（需要认证）

✅ **测试内容：**
- 登录后访问 `/dashboard/appointments`
- 查看预约列表
- 筛选预约（全部/即将到来/过去）

✅ **预期结果：**
- 显示用户的预约
- 可以查看预约详情
- 显示提供者信息

---

## 📋 页面测试清单

### 公开页面（无需登录）

- [ ] 首页 `/`
  - [ ] Hero 区域显示正常
  - [ ] 搜索框可用
  - [ ] 热门服务标签可点击
  - [ ] 特性展示正常
  - [ ] CTA 按钮可用

- [ ] 提供者列表 `/providers`
  - [ ] 显示所有提供者
  - [ ] 侧边栏筛选器工作
  - [ ] 排序功能正常
  - [ ] 提供者卡片信息完整

- [ ] 提供者详情 `/providers/[id]`
  - [ ] 头部信息显示
  - [ ] 关于我部分
  - [ ] 服务列表
  - [ ] 资质认证
  - [ ] 客户评价

- [ ] 预约页面 `/providers/[id]/book`
  - [ ] 服务选择
  - [ ] 日期选择
  - [ ] 时间选择
  - [ ] 预约摘要

- [ ] 注册页面 `/register`
  - [ ] 客户注册选项
  - [ ] 提供者注册选项
  - [ ] 功能说明清晰

### 需要认证的页面

- [ ] 用户仪表板 `/dashboard/appointments`
  - [ ] 显示预约列表
  - [ ] 筛选功能
  - [ ] 预约详情卡片

- [ ] 收藏页面 `/dashboard/favorites`
  - [ ] 空状态显示
  - [ ] 引导用户探索

---

## 🐛 常见问题

### Mock 数据相关

**Q: 为什么看不到提供者？**
A: 确保 `lib/mock-data.ts` 文件存在，并且已导入到相关页面。

**Q: Mock 数据可以修改吗？**
A: 可以，直接编辑 `lib/mock-data.ts` 文件。

### 数据库相关

**Q: seed 脚本失败怎么办？**
A: 确保：
1. DATABASE_URL 配置正确
2. 已运行 `npm run db:push`
3. 数据库连接正常

**Q: 如何重置数据库？**
A: 运行 `npm run db:reset` 将清空并重新填充数据。

**Q: 如何查看数据库内容？**
A: 使用 Prisma Studio:
```bash
npx prisma studio
```

---

## 📸 测试头像

测试数据使用 DiceBear API 生成随机头像：
- URL 格式：`https://api.dicebear.com/7.x/avataaars/svg?seed=Name`
- 每个提供者有唯一的头像

---

## 🔄 更新测试数据

### 添加新提供者

编辑 `lib/mock-data.ts`：

```typescript
export const mockProviders: Provider[] = [
  // ... 现有提供者
  {
    id: '7',
    name: 'Your Name',
    title: 'Your Title',
    // ... 其他字段
  },
];
```

### 添加新服务

```typescript
export const mockServices: Service[] = [
  // ... 现有服务
  {
    id: 's11',
    name: 'New Service',
    description: 'Service description',
    duration: 60,
    price: 100,
    category: 'Category',
  },
];
```

### 添加新评价

```typescript
export const mockReviews: Review[] = [
  // ... 现有评价
  {
    id: '9',
    providerId: '1',
    userId: 'u9',
    userName: 'User Name',
    rating: 5,
    comment: 'Great service!',
    date: new Date(),
    verified: true,
    helpful: 0,
  },
];
```

---

## 🎨 UI 测试提示

### 响应式测试

测试不同屏幕尺寸：
- 📱 Mobile: 375px, 414px
- 📱 Tablet: 768px, 1024px
- 🖥️ Desktop: 1280px, 1920px

### 浏览器测试

建议在以下浏览器测试：
- Chrome/Edge (Chromium)
- Firefox
- Safari

### 性能测试

使用 Lighthouse 检查：
- Performance
- Accessibility
- Best Practices
- SEO

---

## 📝 测试报告模板

```markdown
## 测试报告

**测试日期：** YYYY-MM-DD
**测试人员：** Your Name
**测试环境：** Development / Production

### 功能测试

| 功能 | 状态 | 备注 |
|------|------|------|
| 首页显示 | ✅ / ❌ | |
| 搜索功能 | ✅ / ❌ | |
| 提供者列表 | ✅ / ❌ | |
| 预约流程 | ✅ / ❌ | |

### 发现的问题

1. **问题描述：**
   - 重现步骤：
   - 预期结果：
   - 实际结果：
   - 截图：

### 建议

- 改进建议 1
- 改进建议 2
```

---

## 🚀 下一步

测试完成后：

1. **反馈问题** - 在 GitHub Issues 中报告
2. **建议改进** - 提出功能建议
3. **贡献代码** - 提交 Pull Request

Happy Testing! 🎉
