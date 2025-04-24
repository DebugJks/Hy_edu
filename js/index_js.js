// 모바일 메뉴 토글
document.getElementById('mobileMenuBtn').addEventListener('click', function () {
    document.getElementById('mainNav').classList.toggle('active');
});

// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// 폼 제출 처리
document.querySelector('.contact-form form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
    this.reset();
});


// 아래로 스크롤 할때 헤더 숨기기
let lastScrollTop = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop && currentScroll > 50) {
        // 아래로 스크롤 → 헤더 숨김
        header.classList.add("hide");
    } else {
        // 위로 스크롤 → 헤더 나타남
        header.classList.remove("hide");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // iOS 스크롤 방지
});