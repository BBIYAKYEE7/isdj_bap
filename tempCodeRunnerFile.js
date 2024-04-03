const { IgApiClient } = require('instagram-private-api');
const { createCanvas, loadImage, registerFont } = require('canvas');
var cron = require('node-cron');

function dayToKorean(day) {
    switch (day) {
        case 0:
            return '일요일';
        case 1:
            return '월요일';
        case 2:
            return '화요일';
        case 3:
            return '수요일';
        case 4:
            return '목요일';
        case 5:
            return '금요일';
        case 6:
            return '토요일';
    }
}

const generateMealImage = async () => {
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d');

    // 캔버스에 이미지 그리기 (예시로 단순한 텍스트 출력)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '48px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('일산대진고등학교', 50, 50);
    ctx.fillText('급식표', 50, 100);

    // 식단 정보 그리기 (예시로 오늘 날짜와 요일만 출력)
    const date = new Date();
    const todayDate = `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${dayToKorean(date.getDay())}`;
    ctx.font = '24px Arial';
    ctx.fillText(todayDate, 50, 150);

    // 캔버스를 JPEG 이미지로 변환하여 저장
    const out = fs.createWriteStream('build/meal.jpeg');
    const stream = canvas.createJPEGStream();
    stream.pipe(out);
    await new Promise((resolve, reject) => {
        out.on('finish', resolve);
        out.on('error', reject);
    });
};

const postToInstagram = async () => {
    try {
        // 이미지 생성
        await generateMealImage();

        // Instagram에 게시물 업로드
        const instagram = new IgApiClient();
        instagram.state.generateDevice('daejin_bap'); // Instagram 계정명 직접 지정
        await instagram.account.login('daejin_bap', 'reboot2023!'); // Instagram 비밀번호 직접 지정

        const food = fs.readFileSync('build/meal.jpeg');
        const todayDate = `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${dayToKorean(date.getDay())}`;

        await instagram.publish.photo({
            file: food,
            caption: `일산대진고등학교 오늘의 정보\n\n${todayDate}\n\n#일산대진고 #급식표 #밥밥밥`, // nice caption (optional)
        });

        console.log('✅ 인스타그램에 게시물 성공적으로 업로드 됨');
    } catch (error) {
        console.error('오류 발생:', error);
    }
};

// 즉시 실행
postToInstagram();

// 금요일과 토요일을 제외한 나머지 요일에 매일 자정 00:01분에 실행
cron.schedule('1 0 * * 0-4,6', () => {
    console.log('⏰ Cron job 실행됨');
    postToInstagram();
});
