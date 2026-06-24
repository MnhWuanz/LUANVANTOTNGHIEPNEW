# 🚀 YOEDU Project – Setup Guide (Phase 1)

## 📌 Mục tiêu

Thiết lập môi trường React + TypeScript chuẩn để:

* Code dễ đọc, dễ maintain
* Làm việc nhóm hiệu quả
* Tránh bug cơ bản ngay từ đầu

## 📌 THỐNG NHẤT QUY TẮC ĐẶT TÊN
* 🔠 **UpperCamelCase:** Class, Interface, Type Alias, Enum, Decorator, React/Vue Component.
* 🔡 **lowerCamelCase:** Biến, Tham số (Parameter), Hàm, Thuộc tính (Property), Phương thức (Method).
* 🔤 **CONSTANT_CASE:** Hằng số cấu hình toàn cục tĩnh, bất biến.

---

## 🧱 B1: Tạo project

Sử dụng Vite để khởi tạo project React + TypeScript:

```bash
npm create vite@latest
```

👉 Chọn:

* Framework: React
* Variant: TypeScript

---

## 📦 B2: Cài dependencies

```bash
cd yoedu
npm install
```

---

## ▶️ B3: Chạy project

```bash
npm run dev
```

👉 Truy cập: http://localhost:5173

---

## 🧹 B4: Clean project

Xóa các file không cần thiết:

* `src/assets/`
* `src/App.css`
* `src/index.css` (tuỳ chọn)

---

### Sửa lại `App.tsx`

```tsx
function App() {
  return <div>YOEDU Project</div>;
}

export default App;
```

---

## 📁 B5: Setup cấu trúc folder

```bash
mkdir src/app src/features src/shared
```

### 📂 Ý nghĩa

#### `app/`

Chứa config cấp cao:

* Router
* Provider
* Layout

#### `features/`

Chứa business logic theo từng module:

```
features/
 ├── auth/
 ├── user/
```

#### `shared/`

Chứa code dùng chung:

* components
* hooks
* utils
* constants

---

## 🔗 B6: Cấu hình Alias

### 🎯 Mục tiêu

Giúp import gọn hơn

❌ Trước:

```ts
import Button from '../../../shared/components/Button';
```

✅ Sau:

```ts
import Button from '@/shared/components/Button';
```

---

### ⚙️ vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

👉 Áp dụng khi:

* chạy `npm run dev`
* build production

---

### ⚙️ tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

👉 Giúp TypeScript & VSCode hiểu alias

---

## 🧹 B7: Setup ESLint + Prettier

### 🎯 Mục tiêu

**ESLint**

* Phát hiện bug sớm
* Enforce coding rules

**Prettier**

* Format code tự động
* Đồng nhất style

---

### 📦 Cài đặt

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier eslint-plugin-prettier
```

---

### ⚙️ eslint.config.js

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist'] },

  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],

    files: ['**/*.{ts,tsx}'],

    rules: {
      // React Hooks (QUAN TRỌNG)
      ...reactHooks.configs.recommended.rules,

      // TypeScript
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }
);
```

---

### 🎨 .prettierrc

```json
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "endOfLine": "auto"
}
```

---

## 💡 Lưu ý quan trọng

* ESLint ≠ Prettier
* ESLint → kiểm tra lỗi
* Prettier → format code

👉 Nên dùng cả hai

---

## ✅ Kết quả sau khi setup

* ✅ Project React + TypeScript chạy được
* ✅ Cấu trúc folder rõ ràng
* ✅ Alias import gọn
* ✅ ESLint cảnh báo lỗi
* ✅ Prettier format code tự động

---

## 🚀 Bước tiếp theo

* Setup Router
* Setup Layout
* Làm feature đầu tiên (Auth)

---

## 🎯 Insight

> Setup tốt từ đầu = tiết kiệm rất nhiều thời gian về sau
