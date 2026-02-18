document.addEventListener('DOMContentLoaded', () => {
    // 0. 데이터 준비 (CSV 파싱 포함)
    prepareData();

    // 1. 초기 데이터 설정
    initSite();

    // 2. 섹션 전환 네비게이션
    initNavigation();

    // 3. Home: 랜덤 무한 피드
    initHomeFeed();

    // 4. Works: 무한 스크롤 및 그리드 렌더링
    initWorks();

    // 5. CV: 데이터 렌더링
    initCV();

    // 6. Contact: 메일 전송 로직
    initContact();

    // 7. Modal: 닫기 로직
    initModal();
});

// 사이트 기본 정보 설정
function initSite() {
    document.title = SITE_CONFIG.title;
    document.getElementById('site-logo').textContent = SITE_CONFIG.logoText;

    // Contact 정보 설정 (있을 경우만)
    const contactName = document.getElementById('contact-name');
    const contactEmail = document.getElementById('contact-email');
    if (contactName) contactName.textContent = SITE_CONFIG.artistName;
    if (contactEmail) contactEmail.textContent = SITE_CONFIG.email;
}

// 네비게이션 로직
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('data-section');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            // 페이지 상단으로 이동
            window.scrollTo(0, 0);
        });
    });

    document.getElementById('site-logo').addEventListener('click', () => {
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('home').classList.add('active');
        window.scrollTo(0, 0);
    });
}

// 데이터 셔플 함수
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 전역 데이터 관리
let FINAL_WORKS = [];
let SHUFFLED_WORKS = [];
let CV_EDUCATION = [];
let CV_EXHIBITIONS = [];
let CV_AWARDS = [];

function prepareData() {
    // 1. Works CSV 파싱
    if (typeof WORKS_CSV !== 'undefined' && WORKS_CSV.trim() !== '') {
        const lines = WORKS_CSV.trim().split('\n');
        lines.forEach((line, index) => {
            const parts = line.split(/[,\t]/).map(p => p.trim());
            if (parts.length >= 5) {
                FINAL_WORKS.push({
                    id: `csv-${index}`,
                    title: parts[0],
                    size: parts[1],
                    material: parts[2],
                    year: parts[3],
                    image: parts[4].startsWith('http') ? parts[4] : `images/${parts[4]}`
                });
            }
        });
    }

    // 2. CV CSV 파싱
    const parseSimpleCSV = (csv) => {
        if (typeof csv === 'undefined' || csv.trim() === '') return [];
        return csv.trim().split('\n').map(line => line.trim()).filter(line => line !== '');
    };

    CV_EDUCATION = parseSimpleCSV(CV_EDUCATION_CSV);
    CV_EXHIBITIONS = parseSimpleCSV(CV_EXHIBITIONS_CSV);
    CV_AWARDS = parseSimpleCSV(CV_AWARDS_CSV);

    SHUFFLED_WORKS = shuffleArray(FINAL_WORKS);
}

// Side-effect: SHUFFLED_WORKS가 여기서 바로 생성되지 않고 prepareData 호출 시 생성되므로 
// 기존 전역 변수 선언 방식 수정 (위에서 함)

// Home: 랜덤 무한 피드
let homeLoadedCount = 0;
const HOME_LOAD_BATCH = 5;
// const SHUFFLED_WORKS = shuffleArray(WORKS_DATA); // 제거함 (prepareData에서 처리)

function initHomeFeed() {
    const container = document.getElementById('home-feed');
    const sentinel = document.getElementById('sentinel-home');

    const loadBatch = () => {
        const nextBatch = SHUFFLED_WORKS.slice(homeLoadedCount, homeLoadedCount + HOME_LOAD_BATCH);

        nextBatch.forEach(work => {
            const item = document.createElement('div');
            item.className = 'home-feed-item';
            item.innerHTML = `<img src="${work.image}" alt="${work.title}" loading="lazy">`;
            container.appendChild(item);
        });

        homeLoadedCount += nextBatch.length;
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && homeLoadedCount < SHUFFLED_WORKS.length) {
            loadBatch();
        }
    }, { threshold: 0.1 });

    observer.observe(sentinel);
}

// Works: 무한 스크롤 로직 (기존 유지)
let worksLoadedCount = 0;
const WORKS_LOAD_BATCH = 12;

function initWorks() {
    const grid = document.getElementById('works-grid');
    const sentinel = document.getElementById('sentinel');

    const loadMoreWorks = () => {
        const nextBatch = FINAL_WORKS.slice(worksLoadedCount, worksLoadedCount + WORKS_LOAD_BATCH);

        nextBatch.forEach(work => {
            const item = document.createElement('div');
            item.className = 'work-item';
            item.innerHTML = `
                <div class="work-thumb-wrapper">
                    <img src="${work.image}" alt="${work.title}" loading="lazy">
                </div>
                <div class="work-title-small">${work.title}</div>
            `;
            item.addEventListener('click', () => openModal(work));
            grid.appendChild(item);
        });

        worksLoadedCount += nextBatch.length;
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && worksLoadedCount < FINAL_WORKS.length) {
            loadMoreWorks();
        }
    }, { threshold: 0.1 });

    observer.observe(sentinel);
}

// CV 렌더링
function initCV() {
    const container = document.getElementById('cv-content');

    let html = '';

    if (CV_EDUCATION.length > 0) {
        html += `<div class="cv-section"><h3>Education</h3><ul class="cv-list">`;
        CV_EDUCATION.forEach(item => html += `<li>${item}</li>`);
        html += `</ul></div>`;
    }

    if (CV_EXHIBITIONS.length > 0) {
        html += `<div class="cv-section"><h3>Exhibitions</h3><ul class="cv-list">`;
        CV_EXHIBITIONS.forEach(item => html += `<li>${item}</li>`);
        html += `</ul></div>`;
    }

    if (CV_AWARDS.length > 0) {
        html += `<div class="cv-section"><h3>Awards</h3><ul class="cv-list">`;
        CV_AWARDS.forEach(item => html += `<li>${item}</li>`);
        html += `</ul></div>`;
    }

    container.innerHTML = html;
}

// Contact 메일 전송 (mailto)
function initContact() {
    const emailBtn = document.getElementById('contact-email-btn');

    emailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent('[Portfolio Inquiry]')}`;
    });
}

// Modal 로직
function openModal(work) {
    const modal = document.getElementById('work-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDetail = document.getElementById('modal-detail');

    modalImg.src = work.image;
    modalTitle.textContent = work.title;
    modalDetail.textContent = `${work.material}, ${work.size}, ${work.year}`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

function initModal() {
    const modal = document.getElementById('work-modal');
    const closeBtn = document.querySelector('.close-modal');
    const modalImg = document.getElementById('modal-img');

    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    closeBtn.addEventListener('click', closeModal);
    modalImg.addEventListener('click', closeModal); // 이미지 클릭 시 닫기 추가

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}
