# CMS 프로젝트 코드 이슈 및 수정 사항

## 수정 완료된 이슈

### 1. [BUILD] Java 버전 불일치 (`build.gradle`)
- **문제**: `build.gradle`에서 Java 17을 요구하지만, 시스템에 Java 21만 설치됨
- **수정**: `JavaLanguageVersion.of(17)` → `JavaLanguageVersion.of(21)`

### 2. [CRASH] ProgramPage - `programProcess.participants` null 접근 (`ProgramPage.tsx:188`)
- **문제**: `programProcess`가 아직 로딩 중일 때 `participants.find()`를 호출하면 크래시 발생
- **수정**: 
  - `programProcessLoading` 체크를 로딩 가드에 추가
  - `programProcess.participants` → `programProcess?.participants?` 로 optional chaining 적용

### 3. [CRASH] AdminCoursePage - `clubCourses.map()` null 접근 (`AdminCoursePage.tsx:86`)
- **문제**: `clubCourses`가 undefined일 때 `.map()` 호출 시 크래시
- **수정**: `clubCourses.map(...)` → `(clubCourses ?? []).map(...)`

### 4. [CRASH] AdminProgramEdit - `courseList.find()` null 접근 (`AdminProgramEdit.tsx:106`)
- **문제**: `programSlug`가 없으면 쿼리가 비활성화되어 `courseList`가 undefined, `.find()` 크래시
- **수정**: `courseList.find(...)` → `(courseList ?? []).find(...)`

### 5. [CRASH] AdminClubSettingPage - `clubData` null 접근 (`AdminClubSettingPage.tsx:151`)
- **문제**: `clubData`가 undefined일 때 `.bannerUrl`, `.id` 접근 시 크래시
- **수정**: `clubData.bannerUrl` → `clubData?.bannerUrl`, `clubData.id` → `clubData?.id`

### 6. [BUG] NextButton - progress/end 비동기 미대기 (`NextButton.tsx:41`)
- **문제**: `fetchBe("/v1/progress/end")` 호출을 await 하지 않아 진도 기록이 되기 전에 다음 페이지로 이동. 에러 발생 시 무시됨.
- **수정**: `await fetchBe(...)` 로 변경

### 7. [BUG] CoursePage - useEffect 무한 재호출 (`CoursePage.tsx:72,103`)
- **문제**: `fetchBe`가 의존성 배열에 포함되어 있어, `navigate`나 `jwtToken` 변경 시 fetchBe 참조가 바뀌면서 useEffect가 재호출됨. courseData 참조도 중복으로 들어가 이중 fetch 발생.
- **수정**: 의존성에서 `fetchBe`와 중복 `courseData` 제거

### 8. [BUG] CoursePage - 댓글 로딩 상태가 반영되지 않음 (`CoursePage.tsx:109`)
- **문제**: `latestComments`가 `[]`로 초기화되어 항상 truthy. `!latestComments`는 항상 false여서 댓글 로딩이 스켈레톤에 반영 안 됨.
- **수정**: `!latestComments` → `latestComments.length === 0`

### 9. [PERF] CommentSection - 전체 댓글 불필요하게 fetch (`CommentSection.tsx:54`)
- **문제**: 쿼리 파라미터 없이 모든 댓글을 가져온 후 클라이언트에서 필터링. 대규모 데이터에서 성능 문제.
- **수정**: `nodeGroupId` 파라미터를 쿼리에 추가하여 서버 측 필터링 활용

### 10. [SECURITY] api.ts - `localStorage.clear()` 과도한 삭제 (`api.ts:58`)
- **문제**: 401 응답 시 `localStorage.clear()`로 모든 로컬 스토리지 데이터 삭제
- **수정**: `localStorage.removeItem("auth")`로 인증 관련 데이터만 삭제

### 11. [TYPE] courseData.types.ts - 필드명 불일치 (`courseData.types.ts:29`)
- **문제**: 프론트엔드 `isCommentPermitted` vs 백엔드 `commentPermitted` 이름 불일치. API 응답 매핑 시 항상 undefined.
- **수정**: `isCommentPermitted` → `commentPermitted`

### 12. [CLEANUP] NodeGroupPage - 중복 useParams 호출 (`NodeGroupPage.tsx:42-46`)
- **문제**: `useParams()`를 두 번 호출하여 각각 다른 파라미터 추출. 불필요한 중복.
- **수정**: 하나의 `useParams<{ nodeGroupUUID: string; club: string }>()` 호출로 통합

---

## 미수정 이슈 (수동 확인 필요)

### 13. [BUG] ClubThumbnail - generation 하드코딩 (`ClubThumbnail.tsx:48`)
- **문제**: `body: { generation: 999 }` 가 하드코딩됨. 동아리 가입 시 실제 기수(generation)를 입력받아야 함.
- **권장**: 사용자 입력 UI를 추가하거나, 동아리별 현재 기수를 서버에서 가져오는 로직 필요

### 14. [DEAD CODE] ProductView.tsx - 존재하지 않는 API 호출 (`ProductView.tsx:18`)
- **문제**: `/products/:id` 엔드포인트가 백엔드에 존재하지 않음. 항상 에러 발생.
- **권장**: 해당 페이지 제거 또는 백엔드 구현

### 15. [TYPE] process.types.ts - `nodeGroupCount: string` (`process.types.ts:44`)
- **문제**: 백엔드에서 number로 반환되지만 프론트엔드 타입이 string으로 정의됨
- **권장**: `string` → `number`로 변경

### 16. [INCONSISTENCY] 라우트 파라미터 이름 불일치 (`main.tsx`)
- **문제**: 
  - NodeGroup 라우트: `/:club/:course_name/:nodeGroupUUID`
  - Course 라우트: `/:clubSlug/:courseSlug`
  - 같은 개념에 대해 다른 이름 사용 (`club` vs `clubSlug`, `course_name` vs `courseSlug`)
- **권장**: 라우트 파라미터 이름을 통일 (예: 모두 `clubSlug`, `courseSlug`로)

### 17. [DEPRECATION] MUI TextField `InputProps` 사용 (`ProfilePage.tsx`, `ProfileRegistrationPage.tsx`)
- **문제**: MUI 7에서 `InputProps`는 deprecated. `slotProps.input`을 사용해야 함.
- **권장**: `InputProps={{ style: {...} }}` → `slotProps={{ input: { style: {...} } }}`

---

## 프론트-백엔드 API 대응 관계

| 프론트엔드 호출 경로 | 백엔드 컨트롤러 | 비고 |
|---|---|---|
| `/v1/clubs/*` | `ClubController` | 정상 |
| `/v1/clubs/{slug}/courses/*` | `CourseController` | 정상 |
| `/v1/clubs/{slug}/programs/*` | `ProgramController` | 정상 |
| `/v1/node-group/*` | `NodeGroupController` | 정상 |
| `/v1/comments/*` | `CommentController` | 정상 |
| `/v1/progress/*` | `ProgressController` | 정상 |
| `/v1/user/*` | `UserController` | 정상 |
| `/v1/s3/*` | `S3Controller` | 정상 |
| `/auth/google/*` | `GoogleLoginController` | 정상 |
| `/products/*` | **없음** | ProductView 페이지 사용 불가 |
