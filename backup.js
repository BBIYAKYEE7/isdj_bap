const { IgApiClient } = require('instagram-private-api');
const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config(); // dotenv 패키지 로드

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

const postToInstagram = async () => {
    const date = new Date();
    console.log('🐍 Python 실행 요청됨');
    exec('python scripts/image_maker.py', async (err, stdout, stderr) => {
        console.log('🐍 Python 실행 됨');
        if (err) {
            console.log(err);
            return;
        }
        const instagram = new IgApiClient();

        instagram.state.generateDevice(process.env.INSTAGRAM_USERNAME); // 환경 변수 사용

        await instagram.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD); // 환경 변수 사용

        const food = fs.readFileSync('build/meal.jpeg');

        console.log('📷 인스타그램에 게시물 올리는 중');

        const todayDate = `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${dayToKorean(date.getDay())}`;

        await instagram.publish.photo({
            file: food,
            caption: `일산대진고등학교 오늘의 정보\n\n${todayDate}\n\n#일산대진고 #급식표 #밥밥밥`, // nice caption (optional)
        }).then((media) => {
            console.log('✅ 인스타그램에 게시물 성공적으로 업로드 됨');
        }).catch((err) => {
            console.error(err);
        });
    });
};

// 즉시 실행
postToInstagram();
