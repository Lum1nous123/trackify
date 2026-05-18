Tài liệu này định nghĩa các quy tắc và convention bắt buộc khi AI agent làm việc với project Next.js (App Router).
Đọc kỹ toàn bộ file này **trước khi** tạo bất kỳ file, folder, hay viết bất kỳ dòng code nào.

---

## 1. KIỂM TRA DIRECTORY TRƯỚC KHI LÀM BẤT CỨ VIỆC GÌ

### Quy tắc bắt buộc

Trước khi tạo file hoặc folder mới, **luôn luôn** thực hiện theo thứ tự:

1. **Scan cấu trúc hiện tại** — đọc layout của project để hiểu routing, naming, và cách tổ chức hiện tại.
2. **Xác định đúng vị trí** — phân biệt rõ `app/` (routing) với `components/`, `lib/`, `hooks/`, `services/`.
3. **Không tạo duplicate** — kiểm tra component/hook/service tương tự đã tồn tại chưa.
4. **Không phá vỡ routing** — hiểu rõ App Router convention (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) trước khi thêm file vào `app/`.
5. **Báo cáo trước** — với task tạo nhiều file, liệt kê danh sách + vị trí trước rồi mới tạo.

### Cấu trúc chuẩn cần nhận diện

```
src/
├── app/                        # App Router (Next.js routing)
│   ├── (auth)/                 # Route group — không ảnh hưởng URL
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── users/
│   │   │   ├── page.tsx        # /users
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # /users/[id]
│   │   │   └── loading.tsx
│   │   └── layout.tsx
│   ├── api/                    # Route Handlers (Next.js API)
│   │   └── [...]/route.ts
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                     # Shadcn/ui hoặc atomic base components
│   ├── common/                 # Dùng chung nhiều nơi (Header, Footer, ...)
│   └── features/               # Component gắn với feature cụ thể
│       └── users/
│           ├── UserTable.tsx
│           └── UserForm.tsx
├── hooks/                      # Custom hooks (chỉ client-side logic)
├── services/                   # Axios API calls — tất cả HTTP đặt ở đây
│   └── user.service.ts
├── lib/
│   ├── axios.ts                # Axios instance đã cấu hình
│   ├── query-client.ts         # TanStack QueryClient config
│   └── utils.ts                # Helper functions thuần túy
├── types/                      # TypeScript types & interfaces toàn project
├── constants/                  # Hằng số, enum, config tĩnh
├── stores/                     # Zustand stores (nếu có global state)
└── providers/                  # React Providers (QueryClientProvider, ...)
```

---

## 2. AXIOS — BẮT BUỘC DÙNG INSTANCE ĐÃ CẤU HÌNH

### Không bao giờ dùng `fetch` thủ công phía client. Không tự tạo axios mới.

### `lib/axios.ts` — Axios instance chuẩn

```typescript
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — gắn token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Auto refresh token khi 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            refreshToken,
          },
        );
        localStorage.setItem("access_token", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
```

### `services/` — Tất cả HTTP call đặt tại đây

```typescript
// services/user.service.ts
import axiosInstance from "@/lib/axios";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  PaginatedResponse,
} from "@/types/user.type";

export const userService = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    axiosInstance
      .get<PaginatedResponse<UserResponse>>("/users", { params })
      .then((r) => r.data),

  getById: (id: number) =>
    axiosInstance.get<UserResponse>(`/users/${id}`).then((r) => r.data),

  create: (data: CreateUserRequest) =>
    axiosInstance.post<UserResponse>("/users", data).then((r) => r.data),

  update: (id: number, data: UpdateUserRequest) =>
    axiosInstance.put<UserResponse>(`/users/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    axiosInstance.delete(`/users/${id}`).then((r) => r.data),
};
```

---

## 3. TANSTACK QUERY — BẮT BUỘC CHO MỌI DATA FETCHING PHÍA CLIENT

### Tuyệt đối không fetch trong `useEffect`. Không dùng `useState` + `useEffect` để quản lý server state.

### `lib/query-client.ts` — QueryClient config

### Nếu fetch trên server thì xài prefetch query, sau đó truyền hydration xuống các component con.

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút — không refetch khi data còn fresh
      gcTime: 1000 * 60 * 10, // 10 phút — giữ cache sau khi unmount
      retry: 1, // Chỉ retry 1 lần khi lỗi
      refetchOnWindowFocus: false, // Không refetch khi focus lại tab
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### `providers/QueryProvider.tsx`

```typescript
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

### Query Keys — tập trung, không rải rác

```typescript
// constants/query-keys.ts
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params: object) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: object) => ["orders", "list", params] as const,
    detail: (id: number) => ["orders", "detail", id] as const,
  },
} as const;
```

### Custom Hooks — bọc useQuery / useMutation

Mọi TanStack Query call đều phải nằm trong custom hook, không gọi thẳng trong component.

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { queryKeys } from "@/constants/query-keys";
import { CreateUserRequest } from "@/types/user.type";
import { toast } from "sonner";

// GET list
export const useUsers = (params?: {
  page?: number;
  size?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.users.list(params ?? {}),
    queryFn: () => userService.getAll(params),
  });
};

// GET single
export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id, // Chỉ fetch khi có id
  });
};

// POST
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("Tạo user thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo user thất bại");
    },
  });
};

// DELETE
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("Xóa user thành công");
    },
  });
};
```

### Cách dùng trong component

```typescript
// components/features/users/UserList.tsx
"use client";

import { useUsers, useDeleteUser } from "@/hooks/useUsers";

export default function UserList() {
  const { data, isLoading, isError } = useUsers({ page: 1, size: 10 });
  const { mutate: deleteUser, isPending } = useDeleteUser();

  if (isLoading) return <UserTableSkeleton />;
  if (isError) return <ErrorMessage />;

  return (
    <div>
      {data?.items.map((user) => (
        <UserRow
          key={user.id}
          user={user}
          onDelete={() => deleteUser(user.id)}
          isDeleting={isPending}
        />
      ))}
    </div>
  );
}
```

---

## 4. SERVER COMPONENT vs CLIENT COMPONENT

### Nguyên tắc phân biệt

| Dùng Server Component khi           | Dùng Client Component khi              |
| ----------------------------------- | -------------------------------------- |
| Fetch data từ DB / API ở server     | Cần `useState`, `useReducer`           |
| Không cần interactivity             | Cần event handlers (`onClick`, ...)    |
| SEO quan trọng                      | Dùng browser API (`localStorage`, ...) |
| Render static / near-static content | Dùng TanStack Query / custom hooks     |
| Giảm bundle JS client               | Cần animation, real-time update        |

### Server Component fetch — dùng `fetch` native của Next.js (chỉ ở server)

```typescript
// app/users/page.tsx — Server Component (không có "use client")
import { userService } from "@/services/user.server.ts"; // Axios server-side instance riêng

export default async function UsersPage() {
  const users = await userService.getAll();   // Fetch ở server, không cần TanStack
  return <UserTable initialData={users} />;
}
```

> **Quy tắc:** `"use client"` chỉ khai báo khi thực sự cần. Đẩy `"use client"` xuống leaf component nhỏ nhất có thể.

---

## 5. TYPESCRIPT — BẮT BUỘC STRICT

### Không dùng `any`. Không bỏ qua type.

```typescript
// types/user.type.ts
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = "ADMIN" | "USER" | "MANAGER";

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface UpdateUserRequest extends Partial<
  Omit<CreateUserRequest, "email">
> {}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// API Error type
export interface ApiError {
  message: string;
  errors?: Record<string, string>;
  statusCode: number;
}
```

### `tsconfig.json` — strict mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 6. FORM HANDLING — REACT HOOK FORM + ZOD

Không dùng controlled input (`useState` cho từng field). Không tự viết validation logic.

```typescript
// lib/validations/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự").max(50),
  role: z.enum(["ADMIN", "USER", "MANAGER"]).default("USER"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
```

```typescript
// components/features/users/CreateUserForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, CreateUserFormValues } from "@/lib/validations/user.schema";
import { useCreateUser } from "@/hooks/useUsers";

export default function CreateUserForm() {
  const { mutate: createUser, isPending } = useCreateUser();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "USER" },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    createUser(values, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} placeholder="Email" />
      {form.formState.errors.email && (
        <p className="text-red-500">{form.formState.errors.email.message}</p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? "Đang tạo..." : "Tạo user"}
      </button>
    </form>
  );
}
```

---

## 7. ERROR HANDLING CHUẨN

### Axios error helper

```typescript
// lib/utils/error.ts
import { AxiosError } from "axios";
import { ApiError } from "@/types/api.type";

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiError)?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra";
}
```

### Error Boundary cho từng feature

```typescript
// app/users/error.tsx
"use client";

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <p className="text-red-500">{error.message}</p>
      <button onClick={reset}>Thử lại</button>
    </div>
  );
}
```

---

## 8. ENVIRONMENT VARIABLES

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1   # Expose ra client
API_SECRET_KEY=secret                               # Chỉ server-side, KHÔNG có NEXT_PUBLIC_
```

```typescript
// lib/env.ts — validate env lúc build
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});
```

---

## 9. NAMING CONVENTIONS

| Thành phần       | Convention                    | Ví dụ                                 |
| ---------------- | ----------------------------- | ------------------------------------- |
| Component file   | PascalCase                    | `UserTable.tsx`, `CreateUserForm.tsx` |
| Page / Layout    | lowercase (Next.js yêu cầu)   | `page.tsx`, `layout.tsx`              |
| Hook             | camelCase, prefix `use`       | `useUsers.ts`, `useAuth.ts`           |
| Service          | camelCase, suffix `.service`  | `user.service.ts`                     |
| Type / Interface | PascalCase                    | `UserResponse`, `ApiError`            |
| Schema (Zod)     | camelCase, suffix `Schema`    | `createUserSchema`                    |
| Constants / Enum | UPPER_SNAKE_CASE              | `MAX_FILE_SIZE`, `API_ROUTES`         |
| CSS class        | kebab-case (Tailwind utility) | `flex`, `text-sm`, `bg-primary`       |
| Folder           | kebab-case                    | `user-management/`, `query-keys/`     |

---

## 10. COMPONENT RULES

- **1 file = 1 component chính** — không nhét nhiều component export default vào cùng file.
- **Props interface luôn đặt tên rõ ràng**, không dùng `Props` chung chung.
- **Không dùng `React.FC`** — khai báo function thường, return type tự infer.
- **Skeleton loading** — mỗi component fetch data phải có skeleton tương ứng.
- **Component không quá 200 dòng** — nếu dài hơn, tách thành sub-components.

```typescript
// Đúng
interface UserTableProps {
  data: User[];
  onDelete: (id: number) => void;
}

export default function UserTable({ data, onDelete }: UserTableProps) { ... }

// Sai
const UserTable: React.FC<{ data: any; onDelete: any }> = ({ data, onDelete }) => { ... }
```

---

## 11. NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG LÀM

- ❌ `fetch` trong `useEffect` — dùng TanStack Query.
- ❌ `useState` + `useEffect` để quản lý server data — đó là việc của TanStack Query.
- ❌ Gọi `axios` trực tiếp — luôn qua instance trong `lib/axios.ts`.
- ❌ Tạo axios instance mới ở nơi khác ngoài `lib/axios.ts`.
- ❌ Dùng `any` trong TypeScript — dùng `unknown` rồi narrow type.
- ❌ Đặt query key dạng string tự do — dùng `queryKeys` constant.
- ❌ Gọi `useQuery` / `useMutation` thẳng trong component — bọc trong custom hook.
- ❌ Hardcode URL API trong service — luôn dùng `process.env.NEXT_PUBLIC_API_URL`.
- ❌ Thêm `"use client"` không cần thiết — giữ Server Component khi có thể.
- ❌ Tạo file vào `app/` mà không hiểu App Router convention.
- ❌ `console.log` trong production code — dùng logger hoặc xóa trước khi commit.

---

## 12. PHÂN TÍCH TASK TRƯỚC KHI THỰC HIỆN

Với mỗi task được giao, AI agent phải tự trả lời:

```
1. Component này là Server hay Client Component?
2. Data fetch ở server (async page) hay client (TanStack Query)?
3. Đã có service / hook tương tự chưa? Có thể tái dụng không?
4. Query key đặt ở queryKeys constant chưa?
5. Type/interface cho request và response đã có trong types/ chưa?
6. Validation schema (Zod) cần tạo mới không?
7. File đặt đúng layer chưa? (service / hook / component / page)
```

Nếu task **không rõ ràng** → hỏi lại trước khi làm, không tự suy diễn rồi tạo code sai.
