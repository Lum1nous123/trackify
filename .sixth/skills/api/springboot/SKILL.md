Tài liệu này định nghĩa các quy tắc và convention bắt buộc khi AI agent làm việc với project Spring Boot.
Đọc kỹ toàn bộ file này **trước khi** tạo bất kỳ file, folder, hay viết bất kỳ dòng code nào.

---

## 1. KIỂM TRA DIRECTORY TRƯỚC KHI LÀM BẤT CỨ VIỆC GÌ

### Quy tắc bắt buộc

Trước khi tạo file hoặc folder mới, **luôn luôn** thực hiện theo thứ tự:

1. **Scan cấu trúc hiện tại** — đọc toàn bộ layout của project để hiểu package naming, module structure.
2. **Xác định đúng vị trí** — đặt file đúng layer (controller / service / repository / dto / entity / config / ...).
3. **Không tạo duplicate** — kiểm tra file/class tương tự đã tồn tại chưa trước khi tạo mới.
4. **Giữ nguyên package structure** — không đổi tên package gốc, không tạo thêm package tùy tiện nếu không được yêu cầu.
5. **Báo cáo trước khi thực hiện** — nếu task yêu cầu tạo nhiều file, liệt kê danh sách file sẽ tạo và vị trí trước, sau đó mới tạo.

### Cấu trúc chuẩn cần nhận diện

```
src/
└── main/
│   ├── java/com/example/project/
│   │   ├── config/          # Cấu hình Bean, Security, Swagger, ...
│   │   ├── controller/      # REST Controllers (@RestController)
│   │   ├── service/         # Business logic (interface + impl)
│   │   │   └── impl/
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── entity/          # JPA Entities (@Entity)
│   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── request/     # Request DTOs
│   │   │   └── response/    # Response DTOs
│   │   ├── mapper/          # MapStruct / thủ công mappers
│   │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│   │   ├── util/            # Utility classes (stateless, static methods)
│   │   └── constant/        # Hằng số, Enum dùng chung
│   └── resources/
│       ├── application.yml  # Cấu hình chính (ưu tiên .yml hơn .properties)
│       ├── application-dev.yml
│       ├── application-prod.yml
│       └── db/migration/    # Flyway / Liquibase scripts (nếu có)
└── test/
    └── java/com/example/project/
        ├── controller/
        ├── service/
        └── repository/
```

---

## 2. LOMBOK — BẮT BUỘC SỬ DỤNG

Lombok **phải được dùng** ở mọi class phù hợp. Không viết boilerplate thủ công.

### Entity

```java
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String fullName;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

> **Không dùng `@Data` trên Entity** — gây vòng lặp vô tận với `hashCode`/`equals` khi có quan hệ JPA.

### DTO (Request / Response)

```java
// Request DTO — dùng @Data (không có JPA relation)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank
    @Size(min = 6, message = "Password tối thiểu 6 ký tự")
    private String password;
}

// Response DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;
}
```

### Service

```java
@Service
@RequiredArgsConstructor  // Inject qua constructor, không dùng @Autowired
@Slf4j                    // Logger: log.info(), log.error(), ...
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user with email: {}", request.getEmail());
        // ...
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userService.createUser(request)));
    }
}
```

### Lombok Cheat Sheet

| Annotation                 | Dùng ở đâu          | Ghi chú                                             |
| -------------------------- | ------------------- | --------------------------------------------------- |
| `@Getter` / `@Setter`      | Entity              | Thay cho getter/setter thủ công                     |
| `@Data`                    | DTO                 | Includes getter, setter, equals, hashCode, toString |
| `@Builder`                 | Entity, DTO         | Builder pattern                                     |
| `@NoArgsConstructor`       | Entity, DTO         | Bắt buộc cho JPA Entity                             |
| `@AllArgsConstructor`      | DTO, Entity         | Full args constructor                               |
| `@RequiredArgsConstructor` | Service, Controller | Constructor inject final fields                     |
| `@Slf4j`                   | Service, Controller | Tạo `log` field tự động                             |
| `@UtilityClass`            | Util class          | Static utility, private constructor tự động         |

---

## 3. RESPONSE WRAPPER CHUẨN

Luôn wrap response trong một object thống nhất:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

---

## 4. EXCEPTION HANDLING CHUẨN

### Custom Exception

```java
// Base exception
@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}

// ErrorCode enum
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    USER_NOT_FOUND(404, "User không tồn tại"),
    EMAIL_ALREADY_EXISTS(409, "Email đã được sử dụng"),
    UNAUTHORIZED(401, "Không có quyền truy cập"),
    INTERNAL_ERROR(500, "Lỗi hệ thống");

    private final int httpStatus;
    private final String message;
}
```

### Global Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        log.error("AppException: {}", ex.getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(errors)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Lỗi hệ thống, vui lòng thử lại sau"));
    }
}
```

---

## 5. SERVICE LAYER RULES

- **Luôn tạo interface** cho service, impl nằm trong `service/impl/`.
- **Transaction** — đặt `@Transactional` ở method write trong impl, không đặt ở controller.
- **Không để business logic trong controller.**
- **Không gọi repository trực tiếp từ controller.**

```java
// Interface
public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserById(Long id);
    Page<UserResponse> getAllUsers(Pageable pageable);
}

// Impl
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)  // Default read-only, override ở method write
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional  // Override để write
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        User user = User.builder()
                .email(request.getEmail())
                .build();
        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
```

---

## 6. REPOSITORY RULES

```java
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    // Dùng @Query khi cần query phức tạp
    @Query("SELECT u FROM User u WHERE u.createdAt >= :from AND u.createdAt <= :to")
    List<User> findByDateRange(@Param("from") LocalDateTime from,
                               @Param("to") LocalDateTime to);
}
```

- **Không dùng `findAll()` không có điều kiện** trên bảng lớn — luôn dùng `Pageable`.
- Đặt query phức tạp trong `@Query` hoặc Specification, không viết native query trừ khi thực sự cần.

---

## 7. CONFIGURATION RULES

### application.yml (ưu tiên yml hơn properties)

```yaml
spring:
  application:
    name: my-service
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/mydb}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:password}
  jpa:
    hibernate:
      ddl-auto: validate # Production: validate | Dev: update
    show-sql: false # Tắt ở prod
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

server:
  port: 8080

logging:
  level:
    com.example.project: DEBUG
    org.springframework.web: INFO
```

- **Dùng biến môi trường** (`${VAR:default}`) cho thông tin nhạy cảm.
- **Không hardcode** password, secret key, API key vào file config.

---

## 8. NAMING CONVENTIONS

| Thành phần        | Convention                | Ví dụ                                 |
| ----------------- | ------------------------- | ------------------------------------- |
| Class             | PascalCase                | `UserService`, `OrderController`      |
| Method / Variable | camelCase                 | `getUserById`, `orderList`            |
| Constant          | UPPER_SNAKE_CASE          | `MAX_RETRY_COUNT`                     |
| Package           | lowercase                 | `com.example.project.service`         |
| Table (DB)        | snake_case                | `user_orders`, `product_items`        |
| Column (DB)       | snake_case                | `created_at`, `full_name`             |
| API endpoint      | kebab-case                | `/api/v1/user-orders`                 |
| DTO Request       | `<Action><Entity>Request` | `CreateUserRequest`                   |
| DTO Response      | `<Entity>Response`        | `UserResponse`, `OrderDetailResponse` |

---

## 9. PHÂN TÍCH TASK TRƯỚC KHI THỰC HIỆN

Với mỗi task được giao, AI agent phải tự trả lời:

```
1. Task này yêu cầu tạo file mới hay sửa file cũ?
2. Những file nào bị ảnh hưởng (cascade changes)?
3. Có file nào tương tự đã tồn tại không?
4. Package/folder đặt ở đâu là đúng?
5. Cần thêm dependency gì vào pom.xml / build.gradle không?
6. Có migration DB nào cần tạo không?
```

Nếu task **không rõ ràng** → hỏi lại trước khi làm, không tự suy diễn và tạo code sai.

---

## 10. NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG LÀM

- ❌ Dùng `@Autowired` field injection — luôn dùng constructor injection (`@RequiredArgsConstructor`).
- ❌ Dùng `@Data` trên `@Entity` — gây lỗi Hibernate.
- ❌ Gọi `repository` từ `controller`.
- ❌ Tạo file/folder khi chưa scan directory.
- ❌ Hardcode URL, password, secret vào source code.
- ❌ Catch `Exception` rồi bỏ qua (empty catch block).
- ❌ Dùng `System.out.println` để log — luôn dùng `@Slf4j` + `log.info/error/debug`.
- ❌ Trả về `null` từ service — throw exception hoặc trả `Optional`.
- ❌ Để `ddl-auto: create` hay `create-drop` trên môi trường staging/prod.
- ❌ Viết business logic trong controller.
