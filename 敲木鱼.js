
// 模拟用户数据存储（实际应使用后端数据库）
const users = JSON.parse(localStorage.getItem('users')) || {};
const currentUserKey = 'current_user';

// 初始化页面元素
const authSection = document.getElementById('auth-section');
const loginForm = document.getElementById('login-form');
const gameSection = document.getElementById('game-section');
const playerNameSpan = document.getElementById('player-name');
const playerLevelSpan = document.getElementById('player-level');
const totalCountSpan = document.getElementById('total-count');
const woodenFishImg = document.getElementById('wooden-fish-img');
const knockBtn = document.getElementById('knock-btn');
const viewRankingBtn = document.getElementById('view-ranking');
const logoutBtn = document.getElementById('logout-btn');
const rankingModal = document.getElementById('ranking-modal');
const closeRankingBtn = document.getElementById('close-ranking');
const rankingContent = document.getElementById('ranking-content');
const rankingTabs = document.querySelectorAll('.ranking-tab');

// 切换显示区域
function showSection(section) {
  [authSection, loginForm, gameSection].forEach(s => s.classList.add('hidden'));
  section.classList.remove('hidden');
}

// 获取当前用户信息
function getCurrentUser() {
  const username = localStorage.getItem(currentUserKey);
  return username ? users[username] : null;
}

// 更新用户信息显示
function updateUserInfo() {
  const user = getCurrentUser();
  if (user) {
    playerNameSpan.textContent = user.name;
    playerLevelSpan.textContent = user.level;
    totalCountSpan.textContent = user.totalCount;
  }
}

// 敲击木鱼事件
function handleKnock() {
  const user = getCurrentUser();
  if (!user) return;

  user.totalCount += 1;
  user.level = Math.floor(user.totalCount / 10) + 1; // 每10次升一级
  users[user.name] = user;
  localStorage.setItem('users', JSON.stringify(users));
  updateUserInfo();
}

// 登录处理
function handleLogin(username) {
  if (!username.trim()) {
    alert('请输入用户名');
    return;
  }

  if (users[username]) {
    // 已存在用户，直接登录
    localStorage.setItem(currentUserKey, username);
  } else {
    // 新用户注册
    users[username] = {
      name: username,
      totalCount: 0,
      level: 1,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem(currentUserKey, username);
  }

  showSection(gameSection);
  updateUserInfo();
}

// 退出登录
function handleLogout() {
  localStorage.removeItem(currentUserKey);
  showSection(authSection);
}

// 显示排行榜
function showRanking(type) {
  let sortedUsers = [];
  const now = new Date();

  switch(type) {
    case 'daily':
      sortedUsers = Object.values(users)
        .filter(u => {
          const lastLogin = new Date(u.lastLogin);
          return lastLogin.toDateString() === now.toDateString();
        })
        .sort((a, b) => b.totalCount - a.totalCount);
      break;
    case 'weekly':
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      sortedUsers = Object.values(users)
        .filter(u => new Date(u.lastLogin) >= oneWeekAgo)
        .sort((a, b) => b.totalCount - a.totalCount);
      break;
    case 'monthly':
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      sortedUsers = Object.values(users)
        .filter(u => new Date(u.lastLogin) >= oneMonthAgo)
        .sort((a, b) => b.totalCount - a.totalCount);
      break;
    default: // total
      sortedUsers = Object.values(users).sort((a, b) => b.totalCount - a.totalCount);
  }

  rankingContent.innerHTML = '';
  if (sortedUsers.length === 0) {
    rankingContent.innerHTML = '<p class="text-center text-gray-500">暂无数据</p>';
    return;
  }

  sortedUsers.slice(0, 10).forEach((user, index) => {
    const rankItem = document.createElement('div');
    rankItem.className = 'flex justify-between items-center p-2 border-b';
    rankItem.innerHTML = `
      <span class="font-bold">${index + 1}. ${user.name}</span>
      <span>敲击次数: ${user.totalCount}</span>
    `;
    rankingContent.appendChild(rankItem);
  });
}

// 初始化事件监听器
document.getElementById('guest-login').addEventListener('click', () => {
  const guestName = `游客${Math.floor(Math.random() * 10000)}`;
  handleLogin(guestName);
});

document.getElementById('account-login').addEventListener('click', () => {
  showSection(loginForm);
});

document.getElementById('submit-login').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  handleLogin(username);
});

document.getElementById('back-to-auth').addEventListener('click', () => {
  showSection(authSection);
});

knockBtn.addEventListener('click', handleKnock);
woodenFishImg.addEventListener('click', handleKnock);

viewRankingBtn.addEventListener('click', () => {
  rankingModal.classList.remove('hidden');
  showRanking('total');
});

closeRankingBtn.addEventListener('click', () => {
  rankingModal.classList.add('hidden');
});

logoutBtn.addEventListener('click', handleLogout);

rankingTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    rankingTabs.forEach(t => t.classList.remove('active', 'bg-blue-500', 'text-white'));
    tab.classList.add('active', 'bg-blue-500', 'text-white');
    showRanking(tab.dataset.type);
  });
});

// 页面加载时检查登录状态
window.addEventListener('DOMContentLoaded', () => {
  if (getCurrentUser()) {
    showSection(gameSection);
    updateUserInfo();
  } else {
    showSection(authSection);
  }
});
