/**
 * 이 파일은 웹사이트의 모든 콘텐츠를 관리하는 데이터 파일입니다.
 * 엑셀(Excel)이나 테이블에서 데이터를 복사하여 아래의 각 항목 사이에 붙여넣으세요.
 * 
 * [수정 가이드]
 * 1. 엑셀에서 내용을 복사(Ctrl+C)한 뒤, 백틱(``) 기호 사이에 붙여넣기(Ctrl+V) 하세요.
 * 2. 이미지 파일은 images/ 폴더 안에 넣고 파일명을 확장자까지 적어주세요. (예: work1.jpg)
 */

const SITE_CONFIG = {
    title: "GU | Portfolio",
    logoText: "GU", // 웹사이트 왼쪽 상단 로고 글자
    artistName: "Jiyoo Han", // Contact 섹션 등에 표시될 작가 이름
    email: "oz.hanny0828@gmail.com", // 메일 받을 주소
};

/**
 * [1. Works - 작품 데이터]
 * 엑셀 열 순서: 제목, 크기, 재료, 연도, 이미지파일명
 */
const WORKS_CSV = `
작품제목1, 100x100cm, Oil on canvas, 2023, https://picsum.photos/800/1000
작품제목2, 80x60cm, Acrylic on canvas, 2023, https://picsum.photos/600
작품제목3, 120x90cm, Mixed media, 2022, https://picsum.photos/400/200
작품제목4, 120x90cm, Mixed media, 2022, https://picsum.photos/600/300
작품제목, 120x90cm, Mixed media, 2022, https://picsum.photos/300/600
작품제목, 120x90cm, Mixed media, 2022, https://picsum.photos/400/900
작품제목, 120x90cm, Mixed media, 2022, https://picsum.photos/500/1000
`;

/**
 * [2. CV - 학력]
 * 학력 사항을 한 줄에 하나씩 입력하세요.
 */
const CV_EDUCATION_CSV = `
2015 OO대학교 회화과 졸업
2017 XX대학교 대학원 미술학과 수료
`;

/**
 * [3. CV - 전시 경력]
 * 전시 경력을 한 줄에 하나씩 입력하세요.
 */
const CV_EXHIBITIONS_CSV = `
2023 개인전 <빛의 기록>, OO갤러리, 서울
2022 단체전 <미래의 단면>, XX미술관, 부산
2021 그룹전 <시선>, AA아트센터, 경기
`;

/**
 * [4. CV - 수상 및 기타]
 * 수상 경력 등을 한 줄에 하나씩 입력하세요.
 */
const CV_AWARDS_CSV = `
2022 제 10회 OO미술상 대상
2020 XX재단 신진작가 지원 프로그램 선정
`;
