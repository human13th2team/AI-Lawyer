# Entity Mapping Guide (엔티티 매핑 가이드)

> [!IMPORTANT]
> 본 가이드는 AI 코딩 어시스턴트 사용 시 발생할 수 있는 데이터베이스 매핑 오류를 방지하고 팀 컨벤션을 유지하기 위해 작성되었습니다.

## 1. 대소문자 준수 규칙
Supabase(PostgreSQL)에 정의된 테이블명과 컬럼명은 대소문자를 엄격히 구분합니다.

- **테이블명**: 반드시 **첫 글자 대문자** (PascalCase)로 작성합니다. (예: `User`, `Contract`, `AnalysisReport`)
- **컬럼명**: 반드시 **소문자 및 언더바** (snake_case)로 작성합니다. (예: `user_id`, `created_at`)

## 2. Java Entity 매핑 예시
JPA 엔티티 작성 시 `@Table` 및 `@Column` 어노테이션을 사용하여 명시적으로 매핑합니다.

```java
@Entity
@Table(name = "User") // [주의] 소문자 user가 아닌 대문자 User
public class User {
    @Id
    @Column(name = "user_id")
    private Long id;
    
    @Column(name = "email")
    private String email;
}
```

## 3. AI 인스트럭션 (Instruction)
AI에게 코드를 요청할 때 다음 구문을 포함하세요:
"모든 DB 매핑은 `entity-guide.md`의 규칙을 따르며, 특히 테이블명의 대소문자(PascalCase)를 엄격히 준수해줘."
