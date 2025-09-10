# 🚀 Render 배포 가이드

CMF Studio를 Render에 배포하는 방법입니다.

## 📋 배포 준비

### 1. GitHub 저장소 준비
```bash
# 코드가 GitHub에 있는지 확인
git push origin main
```

### 2. 환경 변수 준비
- `GEMINI_API_KEY`: Google Gemini API 키

## 🔧 Render 배포 단계

### Phase 1: 백엔드 배포

1. **Render 대시보드 접속**
   - https://render.com → "New +" → "Web Service"

2. **Git 저장소 연결**
   - GitHub 저장소 선택
   - **Root Directory**: `server` (중요!)

3. **서비스 설정**
   ```
   Name: cmf-studio-backend
   Environment: Node
   Region: Oregon (또는 선호 지역)
   Branch: main
   
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **환경 변수 설정**
   ```
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://cmf-studio-frontend.onrender.com
   ```

5. **배포 실행**
   - "Create Web Service" 클릭
   - 배포 완료까지 5-10분 대기

### Phase 2: 프론트엔드 배포

1. **새로운 Static Site 생성**
   - "New +" → "Static Site"

2. **Git 저장소 연결**
   - 같은 GitHub 저장소 선택
   - **Root Directory**: `/` (루트)

3. **빌드 설정**
   ```
   Name: cmf-studio-frontend
   
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **환경 변수 설정**
   ```
   VITE_API_URL=https://cmf-studio-backend.onrender.com/api
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🔗 URL 확인

배포 완료 후:
- **백엔드**: `https://cmf-studio-backend.onrender.com`
- **프론트엔드**: `https://cmf-studio-frontend.onrender.com`
- **API 테스트**: `https://cmf-studio-backend.onrender.com/api/health`

## ⚠️ 주의사항

### 데이터 지속성
- **현재**: SQLite를 `/tmp`에 저장 (재시작 시 데이터 손실)
- **권장**: Render PostgreSQL 또는 외부 DB 사용

### 파일 업로드
- **현재**: `/tmp` 디렉토리 사용 (임시 저장)
- **권장**: AWS S3, Cloudinary 등 클라우드 스토리지

### 무료 플랜 제한
- **Sleep**: 15분 비활성 후 대기 모드
- **대역폭**: 100GB/월
- **빌드**: 500분/월

## 🔧 배포 후 설정

### API URL 업데이트
실제 백엔드 URL로 프론트엔드 환경변수 수정:
```bash
# Render 프론트엔드 서비스의 Environment에서
VITE_API_URL=https://your-actual-backend-url.onrender.com/api
```

### CORS 설정 확인
백엔드가 프론트엔드 도메인을 허용하는지 확인

## 🚀 고급 설정 (선택사항)

### PostgreSQL 데이터베이스 추가
1. Render에서 PostgreSQL 생성
2. `DATABASE_URL` 환경변수 백엔드에 추가
3. 코드에서 PostgreSQL 지원 추가

### 커스텀 도메인
1. Render에서 도메인 설정
2. DNS 레코드 구성
3. SSL 자동 적용

## 📞 문제 해결

### 일반적인 문제
- **504 Gateway Timeout**: 백엔드 시작 시간 대기
- **CORS 오류**: CLIENT_URL 환경변수 확인
- **빌드 실패**: 종속성 및 Node.js 버전 확인

### 로그 확인
Render 대시보드에서 실시간 로그 모니터링

---

**배포 완료!** 🎉
CMF Studio가 Render에서 실행되고 있습니다.