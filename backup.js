const { IgApiClient } = require('instagram-private-api');
const { exec } = require('child_process');
const fs = require('fs');

function dayToKorean(day) {
    switch (day) {
        case 0:
            return '일요일'
        case 1:
            return '월요일'
        case 2:
            return '화요일'
        case 3:
            return '수요일'
        case 4:
            return '목요일'
        case 5:
            return '금요일'
        case 6:
            return '토요일'
    }
}

const postToInstagram = async () => {
    const date = new Date();
    console.log('🐍 Python 실행 요청됨')
    exec('python3 scripts/image_maker.py', async (err, stdout, stderr) => {
        console.log('🐍 Python 실행 됨')
        if (err) {
            console.log(err)
            return
        }
        const instagram = new IgApiClient();

        instagram.state.generateDevice(process.env.INSTAGRAM_USERNAME); // Instagram 계정명 직접 지정

        await instagram.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD); // .env 파일에서 인스타그램 계정 정보 사용

        const food = fs.readFileSync('build/meal.jpeg');

        console.log('📷 인스타그램에 게시물 올리는 중')

        const todayDate = `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${dayToKorean(date.getDay())}`;

        async function postToInstagram() {
            let koreaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
            koreaTime = new Date(koreaTime);
            // Use koreaTime where needed

            await instagram.publish.photo({
                file: food,
                caption: `일산대진고등학교 오늘의 정보\n\n${koreaTime}\n\n#일산대진고 #급식표 #밥밥밥`, // nice caption (optional)
            }).then((media) => {
                console.log('✅ 인스타그램에 게시물 성공적으로 업로드 됨')
            }).catch((err) => {
                console.error(err)
            });
        }
        postToInstagram();
    });
};
// Code with passion of BBIYAKYEE7
