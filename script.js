const itemInput = document.getElementById('item-input');
const qtyInput = document.getElementById('qty-input');
const priceInput = document.getElementById('price-input');
const addBtn = document.getElementById('add-btn');
const listContainer = document.getElementById('list-container');
const tabs = document.querySelectorAll('.tab');
const itemCountSpan = document.getElementById('item-count');
const clearBtn = document.getElementById('clear-btn');
const priorityCheck = document.getElementById('priority-check');
const voiceBtn = document.getElementById('voice-btn');
const totalQtySpan = document.getElementById('total-qty');
const totalPriceSpan = document.getElementById('total-price');

let groceryList = JSON.parse(localStorage.getItem('smartListPro')) || [];

function getCategory(text) {
    const lower = text.toLowerCase();
    const cats = {
        fruit: ['apple','banana','orange','grape','mango','lemon','berry'],
        veg: ['carrot','potato','onion','tomato','spinach','garlic','cabbage'],
        dairy: ['milk','cheese','egg','butter','yogurt','cream'],
        meat: ['chicken','beef','fish','pork','bacon','mutton'],
        drink: ['water','soda','juice','beer','tea','coffee']
    };
    for (const [cat, items] of Object.entries(cats)) {
        if (items.some(i => lower.includes(i))) return cat;
    }
    return 'General';
}

function renderList(filter = 'all') {
    listContainer.innerHTML = '';
    
    let sorted = groceryList.sort((a, b) => {
        if (a.completed === b.completed) return b.priority - a.priority;
        return a.completed - b.completed;
    });

    const filtered = sorted.filter(item => {
        if (filter === 'pending') return !item.completed;
        if (filter === 'completed') return item.completed;
        return true;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">
            <div class="icon-box"><i class="fa-solid fa-receipt"></i></div>
            <h3>Your list is empty</h3>
            <p>Add items using text or voice</p>
        </div>`;
    } else {
        filtered.forEach(item => {
            const li = document.createElement('li');
            li.className = `list-item ${item.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="item-left">
                    <div class="checkbox-circle" onclick="toggleItem(${item.id})">
                        ${item.completed ? '<i class="fa-solid fa-check" style="font-size:10px"></i>' : ''}
                    </div>
                    <div class="item-info">
                        <span class="item-text">${item.text}</span>
                        <div class="item-meta">
                            <span class="tag">${item.category}</span>
                            ${item.priority ? '<span class="priority-flag"><i class="fa-solid fa-star"></i> Priority</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="item-right">
                    <div class="item-qty-price">
                        <div class="item-qty">x${item.qty}</div>
                        <div class="item-price">₹${(item.price * item.qty).toFixed(2)}</div>
                    </div>
                    <button class="btn-delete" onclick="deleteItem(${item.id})">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            `;
            listContainer.appendChild(li);
        });
    }

    const pending = groceryList.filter(i => !i.completed).length;
    const totalQty = groceryList.reduce((s, i) => s + i.qty, 0);
    const totalPrice = groceryList.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2);

    itemCountSpan.innerText = pending;
    totalQtySpan.innerText = totalQty;
    totalPriceSpan.innerText = '₹' + totalPrice;

    localStorage.setItem('smartListPro', JSON.stringify(groceryList));
}

function addItem() {
    const text = itemInput.value.trim();
    const qty = parseInt(qtyInput.value) || 1;
    const price = parseFloat(priceInput.value) || 0;

    if (!text) return;

    groceryList.push({
        id: Date.now(),
        text, qty, price,
        completed: false,
        priority: priorityCheck.checked,
        category: getCategory(text)
    });

    itemInput.value = '';
    qtyInput.value = '1';
    priceInput.value = '';
    priorityCheck.checked = false;
    renderList();
}

addBtn.onclick = addItem;
itemInput.addEventListener('keypress', e => e.key === 'Enter' && addItem());
priceInput.addEventListener('keypress', e => e.key === 'Enter' && addItem());

window.toggleItem = id => {
    const item = groceryList.find(i => i.id === id);
    if (item) item.completed = !item.completed;
    renderList();
};

window.deleteItem = id => {
    groceryList = groceryList.filter(i => i.id !== id);
    renderList();
};

clearBtn.onclick = () => {
    if (confirm('Clear all completed items?')) {
        groceryList = groceryList.filter(i => !i.completed);
        renderList();
    }
};

tabs.forEach(t => t.onclick = () => {
    document.querySelector('.tab.active').classList.remove('active');
    t.classList.add('active');
    renderList(t.dataset.filter);
});

if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    voiceBtn.onclick = () => {
        voiceBtn.classList.add('listening');
        recognition.start();
    };

    recognition.onresult = e => {
        const text = e.results[0][0].transcript;
        itemInput.value = text;
        voiceBtn.classList.remove('listening');
        addItem();
    };

    recognition.onerror = () => voiceBtn.classList.remove('listening');
}

const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('smartListTheme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeBtn.innerHTML = '<i class="fa-regular fa-sun"></i>';
}

themeBtn.onclick = () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeBtn.innerHTML = isDark ? '<i class="fa-regular fa-sun"></i>' : '<i class="fa-regular fa-moon"></i>';
    localStorage.setItem('smartListTheme', isDark ? 'dark' : 'light');
};

renderList();