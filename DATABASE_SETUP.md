# BeautyBook 数据库设置指南

## 使用 Supabase PostgreSQL 数据库

### 步骤 1: 访问 Supabase SQL 编辑器

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：`jsyxfclzeiyjalxcwkep`
3. 点击左侧菜单的 **SQL Editor**

### 步骤 2: 执行数据库 Schema

1. 在 SQL Editor 中，点击 **New query**
2. 复制 `lib/db/schema.sql` 文件的全部内容
3. 粘贴到 SQL Editor
4. 点击 **Run** 或按 `Cmd/Ctrl + Enter`

### 步骤 3: 验证表创建

执行完成后，你应该看到以下表：

- ✅ `users` - 用户表（与 Clerk 同步）
- ✅ `customer_profiles` - 客户资料
- ✅ `provider_profiles` - 服务提供者资料
- ✅ `education` - 教育背景
- ✅ `certifications` - 认证资质
- ✅ `services` - 服务项目
- ✅ `appointments` - 预约记录
- ✅ `reviews` - 客户评价
- ✅ `favorites` - 收藏
- ✅ `availability` - 可用时间

### 步骤 4: 检查示例数据

SQL 脚本已经插入了 4 个示例服务提供者：

1. **Dr. Sarah Johnson** - 皮肤科医生
2. **Emily Rodriguez** - 美发师
3. **Michelle Chen** - 按摩师
4. **Jessica Williams** - 美甲师

你可以通过 Table Editor 查看数据：
1. 点击左侧菜单的 **Table Editor**
2. 选择 `provider_profiles` 表
3. 查看插入的数据

### 步骤 5: 配置 Row Level Security (RLS)

为了安全，建议启用 RLS：

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Allow public read access to provider profiles (for search/browse)
CREATE POLICY "Public provider profiles are viewable by everyone"
  ON provider_profiles FOR SELECT
  USING (true);

-- Allow public read access to reviews
CREATE POLICY "Public reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Allow public read access to services
CREATE POLICY "Public services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

-- Users can view their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = clerk_id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = clerk_id);
```

### 步骤 6: 测试连接

运行开发服务器并测试：

```bash
npm run dev
```

访问 `http://localhost:3001/providers` 查看提供者列表。

## 数据库架构说明

### 核心实体关系

```
users (Clerk 同步)
  ├── customer_profiles (1:1)
  ├── provider_profiles (1:1)
  │   ├── education (1:N)
  │   ├── certifications (1:N)
  │   ├── services (1:N)
  │   ├── availability (1:N)
  │   └── reviews (1:N)
  ├── appointments (1:N)
  ├── reviews (1:N)
  └── favorites (1:N)
```

### 主要字段说明

**provider_profiles**:
- `verified`: 验证状态（类似 Zocdoc）
- `specialties`: 专业领域数组
- `insurance_accepted`: 接受的保险列表
- `average_rating`: 平均评分
- `review_count`: 评价数量

**appointments**:
- `status`: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
- `payment_status`: PENDING, PAID, REFUNDED, FAILED
- `google_event_id`: Google Calendar 同步 ID

## 下一步

1. ✅ 数据库已配置
2. ⏭️ 集成 Clerk 用户认证
3. ⏭️ 创建 API 路由
4. ⏭️ 实现搜索和筛选功能
5. ⏭️ 集成支付系统

## 故障排除

### 问题: 表已存在

如果表已经存在，可以先删除：

```sql
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS provider_profiles CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

然后重新执行 schema.sql。

### 问题: 权限错误

确保你使用的是 Supabase 的 service_role key 来执行管理操作。

---

**完成后**: 数据库设置完成！现在可以开始开发应用功能了。
