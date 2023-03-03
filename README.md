# chatgpt-api-server

chatgpt 的 API 代理服务器

## `.env` 配置

```
API_KEY=
ACCESS_TOKEN=

```

## API

### 新的聊天任务 POST /api/main/new-chat-task

```ts
// 请求参数
interface Params {
  prompt: string; // 提示词
  conversationId?: string; // 对话ID
  parentMessageId?: string; // 父消息ID
}

// 返回值
interface Results {
  taskId: string; // 任务ID
}
```

### 查询聊天任务 POST /api/main/get-chat-task

```ts
// 请求参数
interface Params {
  taskId: string; // 任务ID
  snapId?: string; // 快照ID（可选），服务器如果比对snapId一致，表示命中了缓存，不会返回完整数据
}

// 返回值
interface Results {
  // 状态码
  // 0 未找到
  // 1 未声明缓存，返回完整的实体
  // 2 未命中缓存，返回完整的实体
  // 3 命中缓存，不返回完整的实体
  code: number;
  msg: string; // 状态消息
  data?: ChatTask; // 任务实体
}

// -----------------

// 任务
interface ChatTask {
  id: string; // 任务ID
  snapId: string; // 快照ID
  status: 'pending' | 'rejected' | 'resolved'; // 任务状态
  msg?: ChatMessage; // 对话消息
}

// 对话消息，由 npm@chatgpt包定义
interface ChatMessage {
  id: string;
  text: string;
  role: Role;
  name?: string;
  delta?: string;
  detail?: any;
  parentMessageId?: string;
  conversationId?: string;
}
```
