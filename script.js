// script.js - seu JavaScript separado
let currentFilter = 'all';
let currentCategoryFilter = '';
let editingTaskId = null;
let editingCategoryId = null;

// Inicializar categorias padrão
function initDefaultCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    if (categories.length === 0) {
        const defaultCategories = [
            { id: Date.now() + 1, name: 'Trabalho', color: '#2196F3' },
            { id: Date.now() + 2, name: 'Pessoal', color: '#4caf50' },
            { id: Date.now() + 3, name: 'Estudos', color: '#ff9800' }
        ];
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
}

// Alternar entre login e cadastro
function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const cadastroForm = document.getElementById('cadastroForm');
    
    loginForm.classList.toggle('hidden');
    cadastroForm.classList.toggle('hidden');
    hideMessage();
}

// Mostrar mensagens
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    
    setTimeout(() => {
        hideMessage();
    }, 3000);
}
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message';
}

// Cadastro
function handleCadastro(event) {
    event.preventDefault();
    
    const nome = document.getElementById('cadastroNome').value;
    const email = document.getElementById('cadastroEmail').value;
    const telefone = document.getElementById('cadastroTelefone').value;
    const password = document.getElementById('cadastroPassword').value;
    const confirmPassword = document.getElementById('cadastroConfirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem!', 'error');
        return;
    }
    if (password.length < 6) {
        showMessage('A senha deve ter no mínimo 6 caracteres!', 'error');
        return;
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioExiste = usuarios.find(u => u.email === email);

    if (usuarioExiste) {
        showMessage('Este e-mail já está cadastrado!', 'error');
        return;
    }

    const novoUsuario = {
        nome: nome,
        email: email,
        telefone: telefone,
        password: password
    };

    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    showMessage('Cadastro realizado com sucesso!', 'success');
    
    document.getElementById('cadastroNome').value = '';
    document.getElementById('cadastroEmail').value = '';
    document.getElementById('cadastroTelefone').value = '';
    document.getElementById('cadastroPassword').value = '';
    document.getElementById('cadastroConfirmPassword').value = '';

    setTimeout(() => {
        toggleForm();
    }, 2000);
}

// Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (!usuario) {
        showMessage('E-mail ou senha incorretos!', 'error');
        return;
    }

    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    showMessage('Login realizado com sucesso!', 'success');

    setTimeout(() => {
        mostrarDashboard(usuario);
    }, 1000);
}

// Mostrar Dashboard
function mostrarDashboard(usuario) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('cadastroForm').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    document.getElementById('userName').textContent = usuario.nome;
    document.getElementById('userEmail').textContent = usuario.email;

    initDefaultCategories();
    loadCategories();
    loadTasks();
}

// Logout
function handleLogout() {
    localStorage.removeItem('usuarioLogado');
    
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    showMessage('Você saiu do sistema!', 'success');
}

// Alternar entre abas
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'tarefas') {
        document.getElementById('tarefasSection').classList.remove('hidden');
        document.getElementById('categoriasSection').classList.add('hidden');
        tabs[0].classList.add('active');
    } else {
        document.getElementById('tarefasSection').classList.add('hidden');
        document.getElementById('categoriasSection').classList.remove('hidden');
        tabs[1].classList.add('active');
        loadCategoryList();
    }
}

// Gerenciamento de Categorias
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const taskCategorySelect = document.getElementById('taskCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    
    taskCategorySelect.innerHTML = '<option value="">Sem categoria</option>';
    categoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
    
    categories.forEach(cat => {
        const option1 = document.createElement('option');
        option1.value = cat.id;
        option1.textContent = cat.name;
        taskCategorySelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = cat.id;
        option2.textContent = cat.name;
        categoryFilter.appendChild(option2);
    });
}

function handleCategorySubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const color = document.getElementById('categoryColor').value;
    const categories = JSON.parse(localStorage.getItem('categories')) || [];

    if (editingCategoryId) {
        const index = categories.findIndex(c => c.id === editingCategoryId);
        if (index !== -1) {
            const duplicate = categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingCategoryId);
            if (duplicate) {
                showMessage('Já existe uma categoria com este nome!', 'error');
                return;
            }
            categories[index] = { ...categories[index], name, color };
            showMessage('Categoria atualizada com sucesso!', 'success');
        }
        editingCategoryId = null;
    } else {
        const duplicate = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (duplicate) {
            showMessage('Já existe uma categoria com este nome!', 'error');
            return;
        }
        const newCategory = {
            id: Date.now(),
            name: name,
            color: color
        };
        categories.push(newCategory);
        showMessage('Categoria criada com sucesso!', 'success');
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryColor').value = '#667eea';
    document.getElementById('categoryFormTitle').textContent = '➕ Adicionar Nova Categoria';
    document.getElementById('cancelCategoryBtn').style.display = 'none';
    
    loadCategories();
    loadCategoryList();
}

function loadCategoryList() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryList = document.getElementById('categoryList');
    
    if (categories.length === 0) {
        categoryList.innerHTML = '<div class="empty-state"><h3>Nenhuma categoria criada</h3><p>Crie sua primeira categoria!</p></div>';
        return;
    }

    categoryList.innerHTML = categories.map(cat => `
        <div class="category-item">
            <div class="category-info">
                <div class="category-color" style="background: ${cat.color}"></div>
                <span class="category-name">${cat.name}</span>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editCategory(${cat.id})">Editar</button>
                <button class="btn-delete" onclick="deleteCategory(${cat.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}

function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const category = categories.find(c => c.id === id);
    
    if (category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryColor').value = category.color;
        document.getElementById('editCategoryId').value = id;
        document.getElementById('categoryFormTitle').textContent = '✏️ Editar Categoria';
        document.getElementById('cancelCategoryBtn').style.display = 'inline-block';
        editingCategoryId = id;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function cancelCategoryEdit() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryColor').value = '#667eea';
    document.getElementById('editCategoryId').value = '';
    document.getElementById('categoryFormTitle').textContent = '➕ Adicionar Nova Categoria';
    document.getElementById('cancelCategoryBtn').style.display = 'none';
    editingCategoryId = null;
}

function deleteCategory(id) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const tasksWithCategory = tasks.filter(t => t.categoryId === id);
    
    if (tasksWithCategory.length > 0) {
        const confirmDelete = confirm(`Existem ${tasksWithCategory.length} tarefa(s) associada(s) a esta categoria. As tarefas ficarão sem categoria. Continuar?`);
        if (!confirmDelete) return;
        
        tasks.forEach(task => {
            if (task.categoryId === id) {
                task.categoryId = null;
            }
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    const newCategories = categories.filter(c => c.id !== id);
    localStorage.setItem('categories', JSON.stringify(newCategories));
    
    showMessage('Categoria excluída com sucesso!', 'success');
    loadCategories();
    loadCategoryList();
    loadTasks();
}

// Gerenciamento de Tarefas
function handleTaskSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const categoryId = document.getElementById('taskCategory').value;
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    if (editingTaskId) {
        const index = tasks.findIndex(t => t.id === editingTaskId);
        if (index !== -1) {
            tasks[index] = {
                ...tasks[index],
                title,
                description,
                categoryId: categoryId || null
            };
            showMessage('Tarefa atualizada com sucesso!', 'success');
        }
        editingTaskId = null;
    } else {
        const newTask = {
            id: Date.now(),
            title: title,
            description: description,
            categoryId: categoryId || null,
            completed: false,
            userEmail: usuario.email,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        showMessage('Tarefa criada com sucesso!', 'success');
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.getElementById('taskForm').reset();
    document.getElementById('formTitle').textContent = '➕ Adicionar Nova Tarefa';
    document.getElementById('cancelBtn').style.display = 'none';
    
    loadTasks();
}

function loadTasks() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const tasks = allTasks.filter(t => t.userEmail === usuario.email);
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    let filteredTasks = tasks;

    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    if (currentCategoryFilter) {
        filteredTasks = filteredTasks.filter(t => t.categoryId == currentCategoryFilter);
    }

    const taskList = document.getElementById('taskList');

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><h3>Nenhuma tarefa encontrada</h3><p>Adicione sua primeira tarefa!</p></div>';
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {
        const category = categories.find(c => c.id == task.categoryId);
        const categoryTag = category ? 
            `<span class="task-category" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>` : '';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <div style="flex: 1;">
                        <span class="task-title">${task.title}</span>
                        ${categoryTag}
                    </div>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-actions">
                    ${task.completed ? 
                        `<button class="btn-pending" onclick="toggleTaskStatus(${task.id})">Marcar Pendente</button>` :
                        `<button class="btn-complete" onclick="toggleTaskStatus(${task.id})">Concluir</button>`
                    }
                    <button class="btn-edit" onclick="editTask(${task.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteTask(${task.id})">Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

function editTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.categoryId || '';
        document.getElementById('editTaskId').value = id;
        document.getElementById('formTitle').textContent = '✏️ Editar Tarefa';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        editingTaskId = id;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function cancelEdit() {
    document.getElementById('taskForm').reset();
    document.getElementById('editTaskId').value = '';
    document.getElementById('formTitle').textContent = '➕ Adicionar Nova Tarefa';
    document.getElementById('cancelBtn').style.display = 'none';
    editingTaskId = null;
}

function deleteTask(id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newTasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
    
    showMessage('Tarefa excluída com sucesso!', 'success');
    loadTasks();
}

function toggleTaskStatus(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        showMessage(task.completed ? 'Tarefa concluída!' : 'Tarefa marcada como pendente!', 'success');
        loadTasks();
    }
}

function filterTasks(filter) {
    currentFilter = filter;
    
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('active');
        if ((filter === 'all' && index === 0) || 
            (filter === 'pending' && index === 1) || 
            (filter === 'completed' && index === 2)) {
            btn.classList.add('active');
        }
    });
    
    loadTasks();
}

function filterByCategory() {
    currentCategoryFilter = document.getElementById('categoryFilter').value;
    loadTasks();
}

// Verificar login ao carregar
window.onload = function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado) {
        mostrarDashboard(usuarioLogado);
    }
};