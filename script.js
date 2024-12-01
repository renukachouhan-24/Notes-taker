const noteContent = document.getElementById('note-content');
const addNoteButton = document.getElementById('add-note');
const clearNotesButton = document.getElementById('clear-notes');
const notesContainer = document.getElementById('notes-container');
const toggleThemeButton = document.getElementById('toggle-theme');
const voiceNoteButton = document.getElementById('voice-note');
const body = document.body;
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const searchNotes = () => {
    const query = searchInput.value.trim().toLowerCase();
    const notes = document.querySelectorAll('.note');

    notes.forEach(note => {
        const text = note.querySelector('textarea').value.toLowerCase();
        if (text.includes(query)) {
            note.style.display = 'block'; 
        } else {
            note.style.display = 'none'; 
        }
    });

    if (query === '') {
        notes.forEach(note => note.style.display = 'block'); 
    }
};

searchButton.addEventListener('click', searchNotes);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchNotes();
    }
});

let isRecording = false;

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const startVoiceNote = () => {
    if (!isRecording) {
        recognition.start();
        isRecording = true;
        voiceNoteButton.textContent = 'Stop Recording';
    } else {
        recognition.stop();
        isRecording = false;
        voiceNoteButton.textContent = '🎙️ Record Voice Note';
    }
};

recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    noteContent.value = speechToText;
};

recognition.onerror = (event) => {
    alert('Error occurred in voice recognition: ' + event.error);
};

const loadNotes = () => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.forEach(note => addNoteToDOM(note));
};

const saveNote = (note) => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
};

const updateNoteInLocalStorage = (oldNote, newNote) => {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    const index = notes.indexOf(oldNote);
    if (index !== -1) {
        notes[index] = newNote;
    }
    localStorage.setItem('notes', JSON.stringify(notes));
};

const deleteNoteFromLocalStorage = (note) => {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = notes.filter(n => n !== note);
    localStorage.setItem('notes', JSON.stringify(notes));
};

const addNoteToDOM = (noteData) => {
    const { text, color } = noteData;
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.style.backgroundColor = color || '#f5f1e7'; 
    noteElement.innerHTML = `
        <textarea readonly>${text}</textarea>
        <div class="note-actions">
            <button class="edit-note">✏️ Edit</button>
            <button class="save-note" style="display: none;">💾 Save</button>
            <button class="delete-note">🗑️ Delete</button>
        </div>
    `;

    const textarea = noteElement.querySelector('textarea');
    const editButton = noteElement.querySelector('.edit-note');
    const saveButton = noteElement.querySelector('.save-note');
    const deleteButton = noteElement.querySelector('.delete-note');

    deleteButton.addEventListener('click', () => {
        deleteNoteFromLocalStorage(noteData);
        notesContainer.removeChild(noteElement);
    });

    editButton.addEventListener('click', () => {
        textarea.removeAttribute('readonly');
        textarea.focus();
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
    });

    saveButton.addEventListener('click', () => {
        const updatedText = textarea.value.trim();
        if (updatedText) {
            noteData.text = updatedText;
            updateNoteInLocalStorage(noteData, { ...noteData, text: updatedText });
            textarea.setAttribute('readonly', true);
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
        } else {
            alert('Note cannot be empty!');
        }
    });

    notesContainer.appendChild(noteElement);
};

addNoteButton.addEventListener('click', () => {
    const noteText = noteContent.value.trim();
    if (noteText !== '') {
        const noteData = { text: noteText, color: '#f5f1e7' };
        saveNote(noteData);
        addNoteToDOM(noteData);
        noteContent.value = '';
    } else {
        alert('Please enter a note!');
    }
});

clearNotesButton.addEventListener('click', () => {
    localStorage.clear();
    notesContainer.innerHTML = '';
});

let isDarkMode = false;
toggleThemeButton.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    body.classList.toggle('dark-mode', isDarkMode);
});
clearNotesButton.addEventListener('click', () => {
  const confirmation = confirm("Are you sure you want to delete all notes?");
  if (confirmation) {
      localStorage.clear();
      notesContainer.innerHTML = '';
  }
});
loadNotes();

voiceNoteButton.addEventListener('click', startVoiceNote);
