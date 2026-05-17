# 🤖 Hướng dẫn tích hợp Spring AI + Google Gemini Flash

> **Agent đọc file này cần nắm rõ toàn bộ nội dung trước khi implement.**

---

## ⚠️ BẢO MẬT API KEY

## 📋 Thông tin cơ bản

| Thông tin               | Giá trị                                            |
| ----------------------- | -------------------------------------------------- |
| **API Provider**        | Google AI Studio (miễn phí)                        |
| **Model mặc định**      | `gemini-2.0-flash`                                 |
| **Free tier**           | 1,500 requests/ngày, 15 RPM                        |
| **Lấy API Key**         | [aistudio.google.com](https://aistudio.google.com) |
| **Spring AI version**   | `1.0.0`                                            |
| **Java version**        | 17+                                                |
| **Spring Boot version** | 3.x                                                |

---

## 1. Cấu hình Maven (pom.xml)

```xml
<properties>
    <java.version>17</java.version>
    <spring-ai.version>1.0.0</spring-ai.version>
</properties>

<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring AI - Google Gemini -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-google-genai-spring-boot-starter</artifactId>
    </dependency>

    <!-- Webflux (cần cho Streaming) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>${spring-ai.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Repository bắt buộc -->
<repositories>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/milestone</url>
        <snapshots><enabled>false</enabled></snapshots>
    </repository>
</repositories>
```

---

## 2. Cấu hình application.yml

```yaml
spring:
  ai:
    google:
      chat:
        options:
          model: gemini-2.0-flash # Hoặc gemini-1.5-flash
          temperature: 0.7 # 0.0 = chính xác, 1.0 = sáng tạo
          max-output-tokens: 2048 # Số token tối đa trả về
```

### Cách set environment variable

```cmd
set GEMINI_API_KEY=AIzaSyDo5rPdVb6s8WJ_qwrXPZnO515e7N8aHwo
```

**IntelliJ IDEA:**
Run Configuration → Environment Variables → Thêm `GEMINI_API_KEY=your_key`

**File `.env` (dùng với spring-dotenv):**

```
GEMINI_API_KEY=your_api_key_here
```

---

## 3. Các cách sử dụng

### 3.1 Chat đơn giản (Basic)

```java
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ChatClient chatClient;

    public AiController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    // GET /api/ai/ask?question=Xin chào
    @GetMapping("/ask")
    public String ask(@RequestParam String question) {
        return chatClient.prompt()
                .user(question)
                .call()
                .content();
    }
}
```

---

### 3.2 Chat có System Prompt

```java
@PostMapping("/chat")
public String chat(@RequestBody ChatRequest request) {
    return chatClient.prompt()
            .system("""
                Bạn là trợ lý ảo thông minh của hệ thống.
                - Luôn trả lời bằng tiếng Việt
                - Ngắn gọn, súc tích, thân thiện
                - Không bịa đặt thông tin
                """)
            .user(request.getMessage())
            .call()
            .content();
}
```

---

### 3.3 Streaming Response (như ChatGPT gõ từng chữ)

```java
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> stream(@RequestParam String question) {
    return chatClient.prompt()
            .system("Bạn là trợ lý AI hữu ích.")
            .user(question)
            .stream()
            .content();
}
```

> **Lưu ý:** Cần `spring-boot-starter-webflux` trong dependencies.

---

### 3.4 Hội thoại nhiều lượt (Multi-turn Conversation)

```java
@Service
public class ConversationService {

    private final ChatClient chatClient;

    // Lưu lịch sử hội thoại theo sessionId
    private final Map<String, List<Message>> conversationHistory = new ConcurrentHashMap<>();

    public ConversationService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String chat(String sessionId, String userMessage) {
        // Lấy lịch sử hoặc tạo mới
        List<Message> history = conversationHistory.computeIfAbsent(
            sessionId, k -> new ArrayList<>()
        );

        // Thêm tin nhắn user vào lịch sử
        history.add(new UserMessage(userMessage));

        // Gọi API với toàn bộ lịch sử
        String response = chatClient.prompt()
                .system("Bạn là trợ lý AI thân thiện.")
                .messages(history)
                .call()
                .content();

        // Lưu response vào lịch sử
        history.add(new AssistantMessage(response));

        return response;
    }

    public void clearHistory(String sessionId) {
        conversationHistory.remove(sessionId);
    }
}
```

---

### 3.5 Structured Output (trả về JSON/Object)

```java
// Record nhận dữ liệu trả về
public record ProductInfo(
    String name,
    String category,
    double estimatedPrice,
    List<String> features
) {}

@GetMapping("/product-info")
public ProductInfo getProductInfo(@RequestParam String productName) {
    return chatClient.prompt()
            .user("Cung cấp thông tin về sản phẩm: " + productName)
            .call()
            .entity(ProductInfo.class); // Spring AI tự parse JSON
}
```

---

### 3.6 Xử lý hình ảnh (Multimodal)

```java
@PostMapping("/analyze-image")
public String analyzeImage(@RequestParam MultipartFile image) throws IOException {
    // Convert sang base64
    byte[] imageBytes = image.getBytes();
    String base64Image = Base64.getEncoder().encodeToString(imageBytes);

    UserMessage userMessage = new UserMessage(
        "Mô tả chi tiết hình ảnh này",
        List.of(new Media(MimeTypeUtils.IMAGE_JPEG, imageBytes))
    );

    return chatClient.prompt()
            .messages(userMessage)
            .call()
            .content();
}
```

---

## 4. Request/Response DTOs

```java
// ChatRequest.java
public record ChatRequest(
    String message,
    String sessionId  // Dùng cho multi-turn conversation
) {}

// ChatResponse.java
public record ChatResponse(
    String response,
    String sessionId,
    long timestamp
) {}
```

---

## 5. Cấu trúc project đề xuất

```
src/main/java/com/yourapp/
├── controller/
│   └── AiController.java        # REST endpoints
├── service/
│   ├── ChatService.java         # Logic xử lý chat
│   └── ConversationService.java # Quản lý lịch sử hội thoại
├── dto/
│   ├── ChatRequest.java
│   └── ChatResponse.java
└── config/
    └── AiConfig.java            # Custom ChatClient config (nếu cần)
```

---

## 6. Custom Configuration (Nâng cao)

```java
@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem("""
                Bạn là trợ lý AI của công ty XYZ.
                Luôn trả lời bằng tiếng Việt.
                Lịch sự và chuyên nghiệp.
                """)
            .defaultOptions(
                GoogleAiGeminiChatOptions.builder()
                    .model("gemini-2.0-flash")
                    .temperature(0.7)
                    .maxOutputTokens(2048)
                    .build()
            )
            .build();
    }
}
```

---

## 7. Xử lý lỗi (Error Handling)

```java
@RestControllerAdvice
public class AiExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAiException(Exception ex) {
        Map<String, String> error = Map.of(
            "error", "AI service error",
            "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }
}
```

---

## 8. Test nhanh với curl

```bash
# Chat đơn giản
curl "http://localhost:8080/api/ai/ask?question=Xin chào"

# Chat có body
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Giới thiệu về Spring Boot", "sessionId": "session-001"}'

# Streaming
curl "http://localhost:8080/api/ai/stream?question=Kể một câu chuyện ngắn"
```

---

## 9. Các model Gemini hỗ trợ

| Model              | Tốc độ     | Giới hạn free | Dùng khi            |
| ------------------ | ---------- | ------------- | ------------------- |
| `gemini-2.0-flash` | Nhanh nhất | 1500/ngày     | Tác vụ thông thường |
| `gemini-1.5-flash` | Nhanh      | 1500/ngày     | Tác vụ thông thường |
| `gemini-1.5-pro`   | Chậm hơn   | 50/ngày       | Tác vụ phức tạp     |

---

## 10. Lưu ý quan trọng

- ✅ hãy cứ hardcore GEMINI_API_KEY trong application.yaml đi, khi nào mình deploy thì mình sẽ chỉnh lại env sau nhé.
- ✅ Dùng **Google AI Studio** (free) — KHÔNG phải Vertex AI (tính phí)
- ✅ Dữ liệu free tier có thể được Google dùng để train — **đừng gửi dữ liệu nhạy cảm**
- ✅ Luôn handle timeout và retry khi gọi AI API
- ✅ Cache response nếu cùng câu hỏi được hỏi nhiều lần
- ✅ Giới hạn độ dài input từ user để tránh tốn token
- ❌ KHÔNG lưu lịch sử hội thoại trong bộ nhớ ứng dụng khi production → dùng Redis hoặc DB

---

## Tài liệu tham khảo

- [Spring AI Docs](https://docs.spring.io/spring-ai/reference/)
- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
