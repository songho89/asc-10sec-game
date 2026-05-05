let startTime, timerInterval;
let userData = { name: '', id: '', dept: '' };
let currentScore = 0;

// DB 초기화 (localStorage)
let db = JSON.parse(localStorage.getItem('penguinDB')) || [];

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 1. 정보 입력 로직
const inputs = document.querySelectorAll('.info-input');
const nextBtn = document.getElementById('btn-next');

inputs.forEach(input => {
    input.addEventListener('input', () => {
        const allFilled = Array.from(inputs).every(i => i.value.trim() !== "");
        nextBtn.disabled = !allFilled;
        nextBtn.classList.toggle('active', allFilled);
    });
});

document.getElementById('btn-to-input').onclick = () => showScreen('screen-info');
document.getElementById('btn-to-ranking').onclick = () => { updateRankingUI(); showScreen('screen-ranking'); };

nextBtn.onclick = () => {
    userData.name = document.getElementById('input-name').value;
    userData.id = document.getElementById('input-id').value;
    userData.dept = document.getElementById('input-dept').value;
    showScreen('screen-game');
};

// 2. 게임 로직
const timerDisplay = document.getElementById('timer-display');
const stopBtn = document.getElementById('btn-stop');
const gameConfirmBtn = document.getElementById('btn-game-confirm');

document.getElementById('btn-start').onclick = () => {
    if (timerInterval) return;
    startTime = Date.now();
    gameConfirmBtn.classList.add('hidden');
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timerDisplay.innerText = elapsed.toFixed(2).replace('.', ':');
    }, 10);
};

stopBtn.onclick = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    currentScore = parseFloat(timerDisplay.innerText.replace(':', '.'));
    saveToDB(currentScore);
    gameConfirmBtn.classList.remove('hidden');
};

gameConfirmBtn.onclick = () => {
    updateRankingUI();
    showScreen('screen-ranking');
};

// 3. 데이터베이스 및 랭킹 처리
function saveToDB(score) {
    const diff = Math.abs(10 - score);
    const newEntry = { ...userData, score: score, diff: diff, timestamp: Date.now() };
    
    db.push(newEntry);
    // 10초에 가까운 순으로 정렬 (차이가 적을수록 높은 순위)
    db.sort((a, b) => a.diff - b.diff);
    localStorage.setItem('penguinDB', JSON.stringify(db));
}

function updateRankingUI() {
    const top3List = document.getElementById('top3-list');
    const otherList = document.getElementById('rank-list-others');
    top3List.innerHTML = '';
    otherList.innerHTML = '';

    db.forEach((item, index) => {
        const rank = index + 1;
        if (rank <= 3) {
            const types = ['gold', 'silver', 'bronze'];
            const medals = ['🥇', '🥈', '🥉'];
            const card = document.createElement('div');
            card.className = `rank-card ${types[index]}`;
            card.innerHTML = `
                <span class="medal">${medals[index]}</span>
                <div style="font-weight:bold; font-size:14px; margin-top:5px;">${item.name}</div>
                <div style="font-size:11px; color:#666;">${item.dept}</div>
                <div style="font-size:11px; color:#999;">${item.id}</div>
                <div style="font-weight:bold; color:#2c3e50; margin-top:5px;">${item.score.toFixed(2)}s</div>
            `;
            top3List.appendChild(card);
        } else {
            const row = document.createElement('div');
            row.className = 'rank-item';
            // 화살표 애니메이션 (랜덤 시뮬레이션 혹은 이전 기록 대비이나, 여기서는 시각적 요소로 포함)
            const arrow = Math.random() > 0.5 ? '<span class="arrow-up">▲</span>' : '<span class="arrow-down">▼</span>';
            row.innerHTML = `
                <span>${rank} ${arrow}</span>
                <span>${item.name}</span>
                <span>${item.id}</span>
                <span>${item.dept}</span>
                <span style="font-weight:bold;">${item.score.toFixed(2)}</span>
            `;
            otherList.appendChild(row);
        }
    });
}

// 4. 초기화 후 홈으로
document.getElementById('btn-rank-home').onclick = () => {
    // 입력값 초기화
    inputs.forEach(i => i.value = '');
    nextBtn.disabled = true;
    nextBtn.classList.remove('active');
    timerDisplay.innerText = "00:00";
    gameConfirmBtn.classList.add('hidden');
    showScreen('screen-start');
};