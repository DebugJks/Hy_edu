const scriptURL = 'https://script.google.com/macros/s/AKfycbyZOKq9jtYpEMQy0_jNfUATEBp7t9GDr4OCxMc9VMCKapB58eCeNOU0tPuFCCBxDq5XWQ/exec';
const postsPerPage = 10;
let currentPage = 1;
let totalPosts = 0;
let currentBoardType = 'review'; //review

const writeButton = document.getElementById('writeButton');
const postFormContainer = document.getElementById('postFormContainer');
const postForm = document.getElementById('postForm');
const boardTypeInput = document.getElementById('boardType');
const postList = document.getElementById('postList');
const pagination = document.getElementById('pagination');
const tabButtons = document.querySelectorAll('.tab-btn');
const loadingOverlay = document.getElementById('loadingOverlay');

tabButtons.forEach(button => {
    button.addEventListener('click', async () => {
        if (button.classList.contains('active')) return;

        showLoading(); // 여기서 로딩 시작
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        currentBoardType = button.dataset.tab;
        boardTypeInput.value = currentBoardType;
        currentPage = 1;

        fetchPosts(); // 완료될 때까지 기다림
    });
});

function showLoading() {
    loadingOverlay.classList.add('active');
}
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

writeButton.addEventListener('click', toggleWriteForm);
function toggleWriteForm() {
    postFormContainer.classList.toggle('active');
    if (postFormContainer.classList.contains('active')) {
        writeButton.innerHTML = '<i class="fas fa-times"></i> 취소';
        writeButton.style.backgroundColor = '#6c757d';
    } else {
        writeButton.innerHTML = '<i class="fas fa-pen"></i> 글쓰기';
        writeButton.style.backgroundColor = '';
    }
}

postForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
    submitBtn.disabled = true;
    showLoading();

    fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(result => {
            if (result.result === 'success') {
                alert('글이 성공적으로 등록되었습니다.');
                postForm.reset();
                toggleWriteForm();
                fetchPosts();
            } else {
                throw new Error(result.message || '글 작성 실패');
            }
        })
        .catch(error => {
            alert(error.message || '오류 발생');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            hideLoading();
        });
});

function fetchPosts() {
    showLoading();
    const timestamp = new Date().getTime();
    const url = `${scriptURL}?boardType=${currentBoardType}&_=${timestamp}`;
    fetch(url, { method: 'GET', cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) throw new Error("데이터 형식 오류");
            totalPosts = data.length;
            renderPosts(data);
            renderPagination();
        })
        .catch(error => {
            postList.innerHTML = `
                <tr>
                    <td colspan="4" class="error-message">
                        게시글을 불러오는 데 실패했습니다.<br>
                        ${error.message}
                        <button onclick="fetchPosts()" class="retry-btn">다시 시도</button>
                    </td>
                </tr>`;
        })
        .finally(() => hideLoading());
}

function renderPosts(posts) {
    postList.innerHTML = '';
    if (posts.length === 0) {
        postList.innerHTML = `
            <tr><td colspan="4" style="text-align: center;">등록된 게시글이 없습니다.</td></tr>`;
        return;
    }

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = posts.slice().reverse().slice(startIndex, endIndex);

    currentPosts.forEach((post, index) => {
        const row = document.createElement('tr');
        row.className = 'post-item';
        const postNumber = totalPosts - startIndex - index;

        const replyStatus = currentBoardType === 'inquiry' ? 
            `<span class="reply-status ${post["답변"] ? 'answered' : 'pending'}">
                ${post["답변"] ? '답변완료' : '답변대기'}
            </span>` : '';

        row.innerHTML = `
            <td class="num">${postNumber}</td>
            <td class="title">${post["제목"] || '제목 없음'} ${replyStatus}</td>
            <td class="author">${post["작성자"] || '익명'}</td>
            <td class="date">${post["작성일"] ? formatDate(post["작성일"]) : '날짜 없음'}</td>`;

        const detailRow = document.createElement('tr');
        detailRow.className = 'post-detail';
        detailRow.style.display = 'none';

        let detailContent = `
            <div style="margin-bottom: 10px; font-weight: 500;">내용</div>
            <div style="white-space: pre-line;">${post["내용"] || '내용 없음'}</div>`;

        if (currentBoardType === 'inquiry') {
            detailContent += `
                <div style="margin-top: 15px;">
                    <div style="font-weight: 500;">답변</div>
                    <div style="background: #eef; padding: 10px; border-radius: 4px;">
                        ${post["답변"] || '아직 답변이 없습니다.'}
                    </div>
                </div>`;
        }

        detailRow.innerHTML = `<td colspan="4">${detailContent}</td>`;

        row.addEventListener('click', () => {
            const isHidden = detailRow.style.display === 'none';
            document.querySelectorAll('.post-detail').forEach(item => item.style.display = 'none');
            detailRow.style.display = isHidden ? 'table-row' : 'none';
        });

        postList.appendChild(row);
        postList.appendChild(detailRow);
    });
}

function renderPagination() {
    pagination.innerHTML = '';
    if (totalPosts <= postsPerPage) return;

    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
        const half = Math.floor(maxVisiblePages / 2);
        startPage = Math.max(1, currentPage - half);
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    }

    if (currentPage > 1) {
        const prev = document.createElement('li');
        prev.innerHTML = `<a href="#" class="page-link">&laquo;</a>`;
        prev.addEventListener('click', e => {
            e.preventDefault();
            currentPage--;
            fetchPosts();
        });
        pagination.appendChild(prev);
    }

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a href="#" class="page-link">${i}</a>`;
        li.addEventListener('click', e => {
            e.preventDefault();
            currentPage = i;
            fetchPosts();
        });
        pagination.appendChild(li);
    }

    if (currentPage < totalPages) {
        const next = document.createElement('li');
        next.innerHTML = `<a href="#" class="page-link">&raquo;</a>`;
        next.addEventListener('click', e => {
            e.preventDefault();
            currentPage++;
            fetchPosts();
        });
        pagination.appendChild(next);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '날짜 오류';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (tabButtons.length > 0) fetchPosts();
});




