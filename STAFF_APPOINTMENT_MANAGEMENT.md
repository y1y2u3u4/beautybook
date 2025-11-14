# 员工管理和预约分配系统

## 🎯 概述

BeautyBook 现在支持完整的员工管理和预约分配系统，让商户可以：
- 管理团队成员信息
- 将预约分配给特定员工
- 跟踪员工工作量
- 管理预约状态和流程

## ✨ 核心功能

### 1. 员工管理 (`/dashboard/staff`)

商户可以完整管理其团队成员。

#### 功能列表

**查看员工**
- 卡片式布局展示所有员工
- 显示姓名、职位、联系方式
- 专长标签显示
- 在职/离职状态标识

**添加员工**
```typescript
// 必填字段
- 姓名
- 职位（例如：高级发型师、美甲师）
- 邮箱

// 可选字段
- 电话
- 简介
- 专长（多个标签）
- 头像URL
```

**编辑员工**
- 更新所有员工信息
- 修改专长列表
- 更改员工状态（在职/离职）

**删除员工**
- 删除前确认
- 如果员工有已分配的预约，将无法删除
- 需要先重新分配预约

**状态切换**
- 一键切换在职/离职状态
- 离职员工不会出现在预约分配列表
- 保留历史数据

### 2. 预约管理 (`/dashboard/manage-appointments`)

商户可以查看、管理和分配所有通过其分享链接创建的预约。

#### 统计概览

**实时数据看板**
- 📅 即将到来的预约数量
- ⏰ 未分配的预约数量
- ✅ 已完成的预约数量
- 💰 总收入（已支付的预约）

#### 筛选功能

**按状态筛选**
- 全部
- 已安排 (SCHEDULED)
- 已确认 (CONFIRMED)
- 已完成 (COMPLETED)
- 已取消 (CANCELLED)
- 未到店 (NO_SHOW)

**按员工筛选**
- 全部员工
- 未分配
- 特定员工

**按日期范围筛选**（API 支持，前端待实现）
```typescript
GET /api/appointments/manage?startDate=2024-01-01&endDate=2024-01-31
```

#### 预约详情显示

每个预约卡片包含：
- 👤 客户信息（姓名、邮箱、头像）
- 💇 服务名称和时长
- 📅 预约日期
- ⏰ 开始和结束时间
- 💵 预约金额
- 🏷️ 当前状态
- 👥 分配的员工（如有）

#### 预约分配

**分配流程**
1. 点击未分配预约的 "分配员工" 按钮
2. 从下拉菜单选择员工
3. 系统自动更新预约信息
4. 显示已分配员工的姓名和职位

**取消分配**
- 点击已分配员工旁的 X 按钮
- 预约返回未分配状态

**分配验证**
- 只能分配给在职员工
- 只能分配给属于该商户的员工
- API 自动验证权限

#### 状态管理

**更新状态**
- 点击当前状态标签
- 从下拉菜单选择新状态
- 立即更新

**状态说明**
| 状态 | 含义 | 颜色 |
|------|------|------|
| SCHEDULED | 已安排 | 蓝色 |
| CONFIRMED | 已确认 | 绿色 |
| COMPLETED | 已完成 | 灰色 |
| CANCELLED | 已取消 | 红色 |
| NO_SHOW | 未到店 | 橙色 |

#### 预约分组

**即将到来**
- 今天及未来的预约
- 状态不是 CANCELLED 或 COMPLETED
- 按日期升序排列

**历史预约**
- 过去的预约
- 或状态为 COMPLETED 的预约
- 显示为略微透明

## 🗄️ 数据库结构

### Staff 表

```prisma
model Staff {
  id          String   @id @default(cuid())
  providerId  String
  provider    ProviderProfile @relation(...)

  // 个人信息
  name        String
  email       String
  phone       String?
  avatar      String?

  // 职业信息
  title       String          // 职位
  bio         String?         // 简介
  specialties String[]        // 专长数组

  // 状态
  active      Boolean  @default(true)

  // 关系
  appointments Appointment[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Appointment 更新

```prisma
model Appointment {
  // ... 原有字段

  assignedToId String?
  assignedTo   Staff?   @relation(fields: [assignedToId], references: [id])

  // ...
}
```

## 🔌 API 接口

### 员工管理 API

#### GET /api/staff
获取商户的所有员工

**响应**
```json
{
  "staff": [
    {
      "id": "...",
      "name": "张三",
      "email": "zhang@example.com",
      "phone": "13800138000",
      "title": "高级发型师",
      "bio": "10年经验...",
      "specialties": ["染发", "烫发", "造型"],
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/staff
创建新员工

**请求体**
```json
{
  "name": "李四",
  "email": "li@example.com",
  "phone": "13900139000",
  "title": "美甲师",
  "bio": "专注日式美甲",
  "specialties": ["日式美甲", "光疗甲"],
  "avatar": "https://..."
}
```

**必填字段**：`name`, `email`, `title`

#### PATCH /api/staff/[id]
更新员工信息

**请求体**（所有字段可选）
```json
{
  "name": "李四",
  "active": false,
  "specialties": ["日式美甲", "光疗甲", "手足护理"]
}
```

#### DELETE /api/staff/[id]
删除员工

**错误响应**
```json
{
  "error": "Cannot delete staff with assigned appointments"
}
```

### 预约管理 API

#### GET /api/appointments/manage
获取商户的所有预约

**查询参数**
- `status` - 筛选状态
- `staffId` - 筛选员工（空字符串表示未分配）
- `startDate` - 开始日期（ISO格式）
- `endDate` - 结束日期（ISO格式）

**示例**
```
GET /api/appointments/manage?status=CONFIRMED&staffId=staff_123
```

**响应**
```json
{
  "appointments": [
    {
      "id": "...",
      "date": "2024-01-15T00:00:00.000Z",
      "startTime": "10:00 AM",
      "endTime": "11:30 AM",
      "status": "CONFIRMED",
      "amount": 150,
      "paymentStatus": "PAID",
      "customer": {
        "id": "...",
        "firstName": "王",
        "lastName": "五",
        "email": "wang@example.com",
        "imageUrl": "https://..."
      },
      "service": {
        "id": "...",
        "name": "精致护理",
        "duration": 90
      },
      "assignedTo": {
        "id": "...",
        "name": "张三",
        "title": "高级发型师"
      }
    }
  ]
}
```

#### PATCH /api/appointments/[id]/assign
分配预约给员工

**请求体**
```json
{
  "staffId": "staff_123"  // 或 null 取消分配
}
```

**验证**
- 预约必须属于该商户
- 员工必须属于该商户
- 员工必须是在职状态

#### PATCH /api/appointments/[id]/status
更新预约状态

**请求体**
```json
{
  "status": "CONFIRMED"
}
```

**有效状态**
- SCHEDULED
- CONFIRMED
- COMPLETED
- CANCELLED
- NO_SHOW

## 🎨 用户界面

### 导航结构

仪表板侧边栏分为3个部分：

**个人**
- My Appointments（我的预约）
- Favorites（收藏）
- My Reviews（我的评价）

**商户功能**
- Manage Appointments（预约管理）⭐ 新功能
- Staff Management（员工管理）⭐ 新功能
- Sharing Center（分享中心）

**账户**
- Profile（个人资料）

### 设计风格

**员工卡片**
- 玻璃态效果（card-glass）
- 渐变头像占位符
- 专长标签（primary-50背景）
- 状态图标（在职/离职）
- 操作按钮（编辑/删除）

**预约卡片**
- 客户头像和信息
- 服务详情网格布局
- 彩色状态标签
- 下拉操作菜单
- 分配员工按钮/显示

**模态框**
- 全屏响应式设计
- 粘性标题栏
- 表单验证
- 标签输入（专长）
- 渐变提交按钮

## 📋 使用流程

### 商户首次设置

1. **添加员工**
   ```
   访问 /dashboard/staff
   → 点击 "添加员工"
   → 填写姓名、职位、邮箱等信息
   → 添加专长标签
   → 保存
   ```

2. **管理预约**
   ```
   访问 /dashboard/manage-appointments
   → 查看所有未分配的预约
   → 为每个预约分配合适的员工
   → 更新预约状态
   ```

### 日常工作流程

**早上**
1. 查看今天的预约列表
2. 确认所有预约已分配
3. 将状态更新为 CONFIRMED

**服务中**
- 员工按照分配的预约提供服务

**服务后**
1. 将完成的预约状态更新为 COMPLETED
2. 跟踪 NO_SHOW 情况

**定期**
- 审查员工工作量
- 平衡预约分配
- 管理员工信息更新

## 🔧 高级功能

### 防止数据完整性问题

**删除员工保护**
```typescript
// 如果员工有分配的预约，删除会失败
try {
  await prisma.staff.delete({ where: { id } });
} catch (error) {
  if (error.code === 'P2003') {
    return { error: 'Cannot delete staff with assigned appointments' };
  }
}
```

**解决方案**
1. 先将员工的所有预约重新分配给其他人
2. 或者将员工状态设为离职（而不是删除）

### 权限验证

所有 API 都验证：
- ✅ 用户已登录（Clerk auth）
- ✅ 用户有商户资料
- ✅ 操作的数据属于该商户

### 性能优化

**数据库查询**
- 使用 `include` 预加载关联数据
- 避免 N+1 查询问题
- 按日期排序以提高查询效率

**前端优化**
- 筛选后自动重新获取数据
- 操作成功后刷新列表
- 加载状态显示

## 📊 数据分析（未来计划）

### 员工绩效追踪

- 每个员工的预约数量
- 完成率统计
- 客户满意度（基于评价）
- 收入贡献

### 预约分析

- 高峰时段识别
- 服务热度排行
- 取消率分析
- 收入趋势

## 🚀 下一步计划

### 短期（P1）

- [ ] 员工日程日历视图
- [ ] 批量预约分配
- [ ] 预约冲突检测
- [ ] 员工可用性设置

### 中期（P2）

- [ ] 员工移动端应用
- [ ] 自动分配算法（基于工作量平衡）
- [ ] 客户偏好记录（指定员工）
- [ ] 员工佣金计算

### 长期（P3）

- [ ] 员工权限系统（登录查看自己的预约）
- [ ] 实时通知（新预约提醒）
- [ ] 员工排班管理
- [ ] KPI 仪表板

## ❓ 常见问题

### Q: 如何处理员工离职？
A: 将员工状态设置为"离职"而不是删除。这样可以保留历史数据，同时该员工不会出现在新的预约分配中。

### Q: 可以将一个预约分配给多个员工吗？
A: 当前版本不支持。每个预约只能分配给一个员工。如需多人服务，请创建多个预约。

### Q: 删除员工时显示"无法删除"怎么办？
A: 该员工有已分配的预约。请先将这些预约重新分配给其他员工或取消，然后再删除。

### Q: 客户可以指定员工吗？
A: 当前版本不支持。预约由商户手动分配。未来版本将支持客户在预约时选择偏好员工。

### Q: 如何导出员工和预约数据？
A: 当前需要通过 API 获取。未来版本将提供 CSV/Excel 导出功能。

### Q: 支持员工小费管理吗？
A: 暂不支持。计划在未来版本中添加小费追踪和分配功能。

## 📞 技术支持

如有问题或建议：
- 查看 [GitHub Issues](项目链接)
- 阅读完整 [API 文档](docs链接)
- 参考 [数据库 Schema](prisma/schema.prisma)

---

**让团队管理更简单，让预约分配更高效！** 💼✨
