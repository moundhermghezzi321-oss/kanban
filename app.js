// Tableau Kanban — JavaScript natif, sans framework.
// Toutes les tâches vivent dans le tableau `tasks`, puis on redessine l'écran avec render().

const STORAGE_KEY = 'kanban-taches';
const ORDER = ['todo', 'doing', 'done'];

const EXEMPLES = [
  { title: 'Créer le dépôt GitHub du projet', priority: 'haute', status: 'done' },
  { title: 'Écrire le README avec des captures', priority: 'moyenne', status: 'doing' },
  { title: 'Rendre le tableau responsive', priority: 'moyenne', status: 'done' },
  { title: 'Ajouter le glisser-déposer', priority: 'haute', status: 'doing' },
  { title: 'Préparer une candidature en alternance', priority: 'haute', status: 'todo' },
  { title: 'Réviser les bases de React', priority: 'basse', status: 'todo' },
].map((t, i) => ({ ...t, id: crypto.randomUUID?.() ?? String(Date.now() + i), created: Date.now() - i * 86400000 }));

// --- Sauvegarde ---------------------------------------------------------
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EXEMPLES;
  } catch { return EXEMPLES; }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch { /* navigateur privé : on ignore */ }
}

let tasks = load();
let filter = '';

// --- Affichage ----------------------------------------------------------
const tpl = document.getElementById('cardTpl');
const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

function render() {
  for (const status of ORDER) {
    const list = document.querySelector(`[data-list="${status}"]`);
    const items = tasks.filter(t => t.status === status && t.title.toLowerCase().includes(filter));
    list.replaceChildren(...items.map(makeCard));
    if (!items.length) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = filter ? 'Aucun résultat' : 'Déposez une tâche ici';
      list.append(p);
    }
    document.querySelector(`[data-count="${status}"]`).textContent = tasks.filter(t => t.status === status).length;
  }
  const pct = tasks.length ? Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100) : 0;
  document.getElementById('progressPct').textContent = pct + ' %';
  document.getElementById('progressBar').style.width = pct + '%';
}

function makeCard(task) {
  const card = tpl.content.firstElementChild.cloneNode(true);
  card.dataset.id = task.id;
  const prio = card.querySelector('.prio');
  prio.textContent = task.priority;
  prio.classList.add(task.priority);
  const time = card.querySelector('.date');
  time.dateTime = new Date(task.created).toISOString();
  time.textContent = dateFmt.format(task.created);
  card.querySelector('.title').textContent = task.title;
  const i = ORDER.indexOf(task.status);
  card.querySelector('[data-act="left"]').disabled = i === 0;
  card.querySelector('[data-act="right"]').disabled = i === ORDER.length - 1;
  return card;
}

// --- Actions ------------------------------------------------------------
function addTask(title, priority) {
  tasks.unshift({ id: crypto.randomUUID?.() ?? String(Date.now()), title, priority, status: 'todo', created: Date.now() });
  save(); render();
}
function moveTask(id, status) {
  const t = tasks.find(t => t.id === id);
  if (t && t.status !== status) { t.status = status; save(); render(); }
}

document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('taskTitle');
  const title = input.value.trim();
  document.getElementById('formError').hidden = !!title;
  if (!title) return input.focus();
  addTask(title, document.getElementById('taskPriority').value);
  input.value = '';
});

document.getElementById('search').addEventListener('input', e => {
  filter = e.target.value.trim().toLowerCase();
  render();
});

document.getElementById('clearDone').addEventListener('click', () => {
  tasks = tasks.filter(t => t.status !== 'done');
  save(); render();
});

// Boutons des cartes (délégation d'événements : un seul écouteur pour tout le tableau)
const board = document.getElementById('board');
board.addEventListener('click', e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = btn.closest('.card').dataset.id;
  const t = tasks.find(t => t.id === id);
  const i = ORDER.indexOf(t.status);
  if (btn.dataset.act === 'left') moveTask(id, ORDER[i - 1]);
  if (btn.dataset.act === 'right') moveTask(id, ORDER[i + 1]);
  if (btn.dataset.act === 'delete') { tasks = tasks.filter(t => t.id !== id); save(); render(); }
});

// Modifier un titre : on sauvegarde quand on quitte le champ, Entrée valide
board.addEventListener('focusout', e => {
  if (!e.target.classList.contains('title')) return;
  const t = tasks.find(t => t.id === e.target.closest('.card').dataset.id);
  const value = e.target.textContent.trim();
  if (t && value && value !== t.title) { t.title = value; save(); }
  if (!value) e.target.textContent = t.title;
});
board.addEventListener('keydown', e => {
  if (e.target.classList.contains('title') && e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
});

// --- Glisser-déposer (ordinateur) -----------------------------------------
let draggedId = null;
board.addEventListener('dragstart', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  draggedId = card.dataset.id;
  card.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
});
board.addEventListener('dragend', e => {
  e.target.closest('.card')?.classList.remove('dragging');
  document.querySelectorAll('.column.over').forEach(c => c.classList.remove('over'));
});
document.querySelectorAll('.column').forEach(col => {
  col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
  col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('over'); });
  col.addEventListener('drop', e => {
    e.preventDefault();
    col.classList.remove('over');
    if (draggedId) moveTask(draggedId, col.dataset.status);
    draggedId = null;
  });
});

render();
