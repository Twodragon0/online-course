/**
 * Google Drive 파일 ID 검증 스크립트
 * 사용법: node scripts/check-drive-file.js FILE_ID
 */

const fileId = process.argv[2];

if (!fileId) {
  console.error('사용법: node scripts/check-drive-file.js FILE_ID');
  console.error('예시: node scripts/check-drive-file.js 1er3p4BdWsYmeLUuhMshS10EImWYvWWcU');
  process.exit(1);
}

console.log('\n📋 Google Drive 파일 검증\n');
console.log(`파일 ID: ${fileId}\n`);

const urls = {
  preview: `https://drive.google.com/file/d/${fileId}/preview`,
  view: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
  open: `https://drive.google.com/open?id=${fileId}`,
};

console.log('🔗 링크 확인:');
console.log(`Preview (임베드): ${urls.preview}`);
console.log(`View (공유): ${urls.view}`);
console.log(`Open: ${urls.open}\n`);

console.log('✅ 확인 사항:');
console.log('1. 위 링크들을 브라우저에서 열어 파일이 존재하는지 확인하세요');
console.log('2. 파일이 공유되어 있는지 확인하세요 (공유 설정: "링크가 있는 모든 사용자")');
console.log('3. Preview 링크에서 동영상이 재생되는지 확인하세요\n');

console.log('💡 문제 해결:');
console.log('- 파일이 보이지 않으면: Google Drive에서 파일을 공유하세요');
console.log('- "요청한 파일이 없습니다" 에러: 파일 ID가 잘못되었거나 파일이 삭제되었습니다');
console.log('- 동영상이 재생되지 않으면: 파일 형식(MP4 권장)을 확인하세요\n');

