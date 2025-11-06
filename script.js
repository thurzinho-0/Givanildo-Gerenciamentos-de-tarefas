// ========================================
// GERENCIAMENTO DE TAREFAS GENIVALDO
// Versão Premium - FINAL SEM TELEFONE
// ========================================

// Variáveis globais
let currentFilter = 'all';
let currentCategoryFilter = '';
let editingTaskId = null;
let editingCategoryId = null;

// ========== INICIALIZAÇÃO ========== 
window.onload = function() {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeIcon').textContent = '☀️';
    }

    // Carregar contraste salvo
    const savedContrast = localStorage.getItem('contrast');
    if (savedContrast === 'high') {
        document.body.classList.add('high-contrast');
    }

    // Verificar se há usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado) {
        mostrarDashboard(usuarioLogado);
    }
};

// ========== TEMA CLARO/ESCURO ==========
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ========== ALTO CONTRASTE ==========
function toggleContrast() {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('contrast', isHighContrast ? 'high' : 'normal');
    showMessage(
        isHighContrast ? '✅ Alto contraste ativado' : '✅ Contraste normal ativado',
        'success'
    );
}

// ========== VALIDAÇÃO DE E-MAIL EM TEMPO REAL ==========
function validateEmailRealTime(input, iconId, hintId) {
    const email = input.value;
    const icon = document.getElementById(iconId);
    const hint = document.getElementById(hintId);
    
    if (!icon || !hint) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length === 0) {
        icon.textContent = '';
        hint.textContent = '';
        return;
    }

    if (emailRegex.test(email)) {
        icon.textContent = '✅';
        icon.style.color = '#10b981';
        hint.textContent = '';
    } else {
        icon.textContent = '❌';
        icon.style.color = '#ef4444';
        hint.textContent = 'E-mail inválido';
    }
}

// ========== MOSTRAR/OCULTAR SENHA ==========
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
        button.setAttribute('aria-label', 'Ocultar senha');
    } else {
        input.type = 'password';
        button.textContent = '👁️';
        button.setAttribute('aria-label', 'Mostrar senha');
    }
}

// ========== VALIDAÇÃO DE FORÇA DA SENHA ==========
function validatePasswordStrength(input) {
    const password = input.value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!strengthDiv) return;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (hasUpperCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;

    strengthDiv.className = 'password-strength';
    
    if (strength >= 4) {
        strengthDiv.classList.add('strong');
    } else if (strength >= 2) {
        strengthDiv.classList.add('medium');
    } else if (password.length > 0) {
        strengthDiv.classList.add('weak');
    }
}

// ========== VALIDAR SENHAS IGUAIS ==========
function validatePasswordMatch() {
    const password = document.getElementById('cadastroPassword').value;
    const confirmPassword = document.getElementById('cadastroConfirmPassword').value;
    const hint = document.getElementById('passwordMatchHint');

    if (!hint) return;

    if (confirmPassword.length === 0) {
        hint.textContent = '';
        hint.style.color = '';
        return;
    }

    if (password === confirmPassword) {
        hint.textContent = '✅ Senhas coincidem';
        hint.style.color = '#10b981';
    } else {
        hint.textContent = '❌ As senhas não coincidem';
        hint.style.color = '#ef4444';
    }
}

// ========== MOSTRAR LOADING ==========
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// ========== MENSAGENS PERSONALIZADAS ==========
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 4000);
}

// ========== CADASTRO (SEM TELEFONE) ==========
function handleCadastro(event) {
    event.preventDefault();
    showLoading();
    
    const nome = document.getElementById('cadastroNome').value;
    const email = document.getElementById('cadastroEmail').value;
    const password = document.getElementById('cadastroPassword').value;
    const confirmPassword = document.getElementById('cadastroConfirmPassword').value;

    // Validações
    if (password !== confirmPassword) {
        hideLoading();
        showMessage('❌ Ops! As senhas não coincidem. Tente novamente.', 'error');
        return;
    }

    if (password.length < 6) {
        hideLoading();
        showMessage('❌ A senha deve ter no mínimo 6 caracteres!', 'error');
        return;
    }

    // Validar senha forte
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasNumber || !hasSpecial) {
        hideLoading();
        showMessage('❌ A senha deve conter: 1 letra maiúscula, 1 número e 1 caractere especial', 'error');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioExiste = usuarios.find(u => u.email === email);

    if (usuarioExiste) {
        hideLoading();
        showMessage('❌ Este e-mail já está cadastrado! Tente fazer login.', 'error');
        return;
    }

    const novoUsuario = {
        nome: nome,
        email: email,
        password: password
    };

    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    hideLoading();
    showMessage('🎉 Cadastro realizado com sucesso! Bem-vindo(a)!', 'success');
    
    // Limpar formulário
    document.getElementById('cadastroNome').value = '';
    document.getElementById('cadastroEmail').value = '';
    document.getElementById('cadastroPassword').value = '';
    document.getElementById('cadastroConfirmPassword').value = '';
    
    // Limpar validações
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatchHint = document.getElementById('passwordMatchHint');
    const cadastroEmailIcon = document.getElementById('cadastroEmailIcon');
    const cadastroEmailHint = document.getElementById('cadastroEmailHint');
    
    if (passwordStrength) passwordStrength.className = 'password-strength';
    if (passwordMatchHint) passwordMatchHint.textContent = '';
    if (cadastroEmailIcon) cadastroEmailIcon.textContent = '';
    if (cadastroEmailHint) cadastroEmailHint.textContent = '';

    // Voltar para o login
    setTimeout(() => {
        const formToggle = document.getElementById('formToggle');
        if (formToggle) {
            formToggle.checked = false;
        }
    }, 2000);
}

// ========== LOGIN ==========
function handleLogin(event) {
    event.preventDefault();
    showLoading();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (!usuario) {
        hideLoading();
        showMessage('❌ Ops! E-mail ou senha incorretos. Tente novamente.', 'error');
        return;
    }

    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    
    hideLoading();
    showMessage(`🎉 Bem-vindo(a) de volta, ${usuario.nome.split(' ')[0]}!`, 'success');

    setTimeout(() => {
        mostrarDashboard(usuario);
    }, 1500);
}

// ========== MOSTRAR DASHBOARD ==========
function mostrarDashboard(usuario) {
    const authWrapper = document.getElementById('authWrapper');
    const dashboard = document.getElementById('dashboard');
    
    if (authWrapper) authWrapper.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');

    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) userName.textContent = usuario.nome;
    if (userEmail) userEmail.textContent = usuario.email;

    initDefaultCategories();
    loadCategories();
    loadTasks();
    updateProgressBar();
}

// ========== LOGOUT ==========
function handleLogout() {
    const confirmLogout = confirm('Tem certeza que deseja sair?');
    if (!confirmLogout) return;

    localStorage.removeItem('usuarioLogado');
    
    const dashboard = document.getElementById('dashboard');
    const authWrapper = document.getElementById('authWrapper');
    
    if (dashboard) dashboard.classList.add('hidden');
    if (authWrapper) authWrapper.classList.remove('hidden');
    
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    
    showMessage('👋 Você saiu do sistema. Até logo!', 'success');
}

// ========== INICIALIZAR CATEGORIAS PADRÃO ==========
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

// ========== ALTERNAR ABAS ==========
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    const tarefasSection = document.getElementById('tarefasSection');
    const categoriasSection = document.getElementById('categoriasSection');
    
    if (tab === 'tarefas') {
        if (tarefasSection) tarefasSection.classList.remove('hidden');
        if (categoriasSection) categoriasSection.classList.add('hidden');
        if (tabs[0]) tabs[0].classList.add('active');
    } else {
        if (tarefasSection) tarefasSection.classList.add('hidden');
        if (categoriasSection) categoriasSection.classList.remove('hidden');
        if (tabs[1]) tabs[1].classList.add('active');
        loadCategoryList();
    }
}

// ========== ATUALIZAR BARRA DE PROGRESSO ==========
function updateProgressBar() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) return;
    
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const tasks = allTasks.filter(t => t.userEmail === usuario.email);
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const progressFill = document.getElementById('progressFill');
    const progressStats = document.getElementById('progressStats');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressStats) progressStats.textContent = `${completedTasks}/${totalTasks} concluídas`;
}

// ========== GERENCIAR CATEGORIAS ==========
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const taskCategorySelect = document.getElementById('taskCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (taskCategorySelect) {
        taskCategorySelect.innerHTML = '<option value="">Sem categoria</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            taskCategorySelect.appendChild(option);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    }
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
                showMessage('❌ Já existe uma categoria com este nome!', 'error');
                return;
            }
            categories[index] = { ...categories[index], name, color };
            showMessage('✅ Categoria atualizada com sucesso!', 'success');
        }
        editingCategoryId = null;
    } else {
        const duplicate = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (duplicate) {
            showMessage('❌ Já existe uma categoria com este nome!', 'error');
            return;
        }
        const newCategory = {
            id: Date.now(),
            name: name,
            color: color
        };
        categories.push(newCategory);
        showMessage('✅ Categoria criada com sucesso!', 'success');
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    
    const categoryForm = document.getElementById('categoryForm');
    const categoryColor = document.getElementById('categoryColor');
    const categoryFormTitle = document.getElementById('categoryFormTitle');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    
    if (categoryForm) categoryForm.reset();
    if (categoryColor) categoryColor.value = '#667eea';
    if (categoryFormTitle) categoryFormTitle.textContent = '➕ Adicionar Nova Categoria';
    if (cancelCategoryBtn) cancelCategoryBtn.style.display = 'none';
    
    loadCategories();
    loadCategoryList();
}

function loadCategoryList() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryList = document.getElementById('categoryList');
    
    if (!categoryList) return;
    
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
        const categoryName = document.getElementById('categoryName');
        const categoryColor = document.getElementById('categoryColor');
        const categoryFormTitle = document.getElementById('categoryFormTitle');
        const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
        
        if (categoryName) categoryName.value = category.name;
        if (categoryColor) categoryColor.value = category.color;
        if (categoryFormTitle) categoryFormTitle.textContent = '✏️ Editar Categoria';
        if (cancelCategoryBtn) cancelCategoryBtn.style.display = 'inline-block';
        
        editingCategoryId = id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function cancelCategoryEdit() {
    const categoryForm = document.getElementById('categoryForm');
    const categoryColor = document.getElementById('categoryColor');
    const categoryFormTitle = document.getElementById('categoryFormTitle');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    
    if (categoryForm) categoryForm.reset();
    if (categoryColor) categoryColor.value = '#667eea';
    if (categoryFormTitle) categoryFormTitle.textContent = '➕ Adicionar Nova Categoria';
    if (cancelCategoryBtn) cancelCategoryBtn.style.display = 'none';
    
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
    
    showMessage('✅ Categoria excluída com sucesso!', 'success');
    loadCategories();
    loadCategoryList();
    loadTasks();
}

// ========== GERENCIAMENTO DE TAREFAS ==========
function handleTaskSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const categoryId = document.getElementById('taskCategory').value;
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuario) return;
    
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
            showMessage('✅ Tarefa atualizada com sucesso!', 'success');
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
        showMessage('✅ Tarefa criada com sucesso!', 'success');
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    const taskForm = document.getElementById('taskForm');
    const formTitle = document.getElementById('formTitle');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (taskForm) taskForm.reset();
    if (formTitle) formTitle.textContent = '➕ Adicionar Nova Tarefa';
    if (cancelBtn) cancelBtn.style.display = 'none';
    
    loadTasks();
    updateProgressBar();
}

function loadTasks() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) return;
    
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
    if (!taskList) return;

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><h3>Nenhuma tarefa encontrada</h3><p>Adicione sua primeira tarefa!</p></div>';
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {
        const category = categories.find(c => c.id == task.categoryId);
        const categoryTag = category ? 
            `<span class="task-category" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>` : '';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" draggable="true" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="drop(event)" data-id="${task.id}">
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
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskCategory = document.getElementById('taskCategory');
        const formTitle = document.getElementById('formTitle');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (taskTitle) taskTitle.value = task.title;
        if (taskDescription) taskDescription.value = task.description || '';
        if (taskCategory) taskCategory.value = task.categoryId || '';
        if (formTitle) formTitle.textContent = '✏️ Editar Tarefa';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        
        editingTaskId = id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function cancelEdit() {
    const taskForm = document.getElementById('taskForm');
    const formTitle = document.getElementById('formTitle');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (taskForm) taskForm.reset();
    if (formTitle) formTitle.textContent = '➕ Adicionar Nova Tarefa';
    if (cancelBtn) cancelBtn.style.display = 'none';
    
    editingTaskId = null;
}

function deleteTask(id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newTasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
    
    showMessage('✅ Tarefa excluída com sucesso!', 'success');
    loadTasks();
    updateProgressBar();
}

function toggleTaskStatus(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        showMessage(task.completed ? '✅ Tarefa concluída!' : '🔄 Tarefa marcada como pendente!', 'success');
        loadTasks();
        updateProgressBar();
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
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        currentCategoryFilter = categoryFilter.value;
        loadTasks();
    }
}

// ========== DRAG AND DROP ==========
let draggedElement = null;

function dragStart(event) {
    draggedElement = event.target;
    event.target.style.opacity = '0.5';
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    if (event.target.classList.contains('task-item') && event.target !== draggedElement) {
        event.target.parentNode.insertBefore(draggedElement, event.target.nextSibling);
    }
    if (draggedElement) {
        draggedElement.style.opacity = '1';
    }
}
