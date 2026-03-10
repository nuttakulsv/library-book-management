# Test Mocks

Mock data สำหรับใช้ใน unit test / e2e test

## ไฟล์

### `test-data.json`

Mock หลัก มี:

| Section | รายละเอียด |
|---------|------------|
| `users` | admin, regular, noEmail, noMemberId, list |
| `usersResponse` | user object ไม่มี password/authToken |
| `auth.login` | valid, invalidUsername, invalidPassword, loginByEmail |
| `auth.register` | valid, shortPassword, duplicateUsername |
| `auth.response` | success response |
| `auth.session` | session object |
| `auth.tokens` | Bearer token ต่างๆ |
| `books` | withCover, noCover, allBorrowed, list |
| `booksDto.create` | minimal, withQuantity, withCoverImage, duplicateIsbn |
| `booksDto.update` | titleOnly, removeCover, quantityChange, fullUpdate |
| `images` | jpeg, png, webp, list |
| `borrowRecords` | active, returned, list |
| `query` | pagination, search, users |
| `requests` | withAuthUser, withRegularUser, noUser, tokenInQuery |
| `responses` | deleteSuccess, logoutSuccess, paginated |
| `errors.messages` | ข้อความ error ต่างๆ |
| `fileUpload` | validJpeg, validPng, invalidType |

### `api-test-cases.json`

เคสทดสอบ API แยกตาม route: auth, books, users, images

แต่ละเคสมี `case`, `input`/`body`/`query`/`params`, `expectedStatus`, `expectedError` (ถ้ามี)

## วิธีใช้

```typescript
// ใน spec file
import * as mocks from '../../test/mocks/test-data.json';

const mockUser = mocks.users.admin;
const loginDto = mocks.auth.login.valid;
const createBookDto = mocks.booksDto.create.minimal;
```

```typescript
// e2e test
import * as testCases from '../mocks/api-test-cases.json';

for (const tc of testCases.auth['POST /auth/login']) {
  it(tc.case, () => { /* ... */ });
}
```
