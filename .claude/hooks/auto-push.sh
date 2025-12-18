#!/bin/bash

# BeautyBook 自动推送脚本
# 在 Claude 任务完成后自动推送更改到 Git

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

# 检查是否是 git 仓库
if [ ! -d ".git" ]; then
  exit 0
fi

# 获取当前分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$CURRENT_BRANCH" ]; then
  exit 0
fi

# 检查是否有未暂存或未提交的更改
CHANGES=$(git status --porcelain 2>/dev/null)
if [ -z "$CHANGES" ]; then
  # 没有更改，检查是否有未推送的提交
  UNPUSHED=$(git log origin/"$CURRENT_BRANCH"..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')
  if [ "$UNPUSHED" = "0" ]; then
    exit 0
  fi
  # 有未推送的提交，执行推送
  echo "📤 Pushing $UNPUSHED commit(s) to origin/$CURRENT_BRANCH..."
  git push origin "$CURRENT_BRANCH" 2>&1
  echo "✅ Push completed!"
  exit 0
fi

# 有更改，执行构建检查
echo "🔨 Building project before commit..."
if npm run build > /tmp/build-output.txt 2>&1; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed! Skipping auto-push."
  echo "Run '/push' manually to fix and push."
  exit 0
fi

# 添加所有更改
git add -A

# 生成提交信息
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
FILE_COUNT=$(echo "$CHANGES" | wc -l | tr -d ' ')
COMMIT_MSG="🤖 Auto-commit: $FILE_COUNT file(s) changed at $TIMESTAMP

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 提交
git commit -m "$COMMIT_MSG"

# 推送
echo "📤 Pushing to origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH" 2>&1

echo "✅ Auto-push completed!"
exit 0
