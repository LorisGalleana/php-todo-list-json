const { createApp } = Vue;

createApp({
    data() {
        return {
            tasks: [],         // Lista delle attività
            newTask: '',       // Testo per la nuova attività
            newDescription: '' // Descrizione per la nuova attività
        };
    },
    methods: {
        // Carica le attività dal server e le memorizza nello stato
        fetchTasks() {
            axios.get('api.php')
                .then(response => {
                    if (Array.isArray(response.data)) {
                        // Mappa le attività aggiungendo una proprietà per mostrare/nascondere la descrizione
                        this.tasks = response.data.map(task => ({ ...task, showDescription: false }));
                    } else {
                        console.error('Data format error: expected an array');
                    }
                })
                .catch(error => {
                    console.error('There was an error fetching tasks!', error);
                });
        },

        // Aggiunge una nuova attività al server e alla lista locale
        addTask() {
            if (this.newTask.trim() !== '') {
                const task = {
                    id: Date.now(),    // Usa il timestamp come ID unico per la nuova attività
                    text: this.newTask,
                    completed: false,
                    description: this.newDescription || ''
                };

                axios.post('api.php', { task })
                    .then(response => {
                        if (response.data.status === 'success') {
                            // Aggiunge la nuova attività alla lista e resetta i campi di input
                            this.tasks.push(task);
                            this.newTask = '';
                            this.newDescription = '';
                        } else {
                            alert('Error: ' + response.data.message);
                        }
                    })
                    .catch(error => {
                        console.error('There was an error!', error);
                    });
            }
        },

        // Cambia lo stato di completamento di un'attività
        toggleTaskCompletion(task) {
            const updatedTask = { ...task, completed: !task.completed };

            axios.put('api.php', updatedTask)
                .then(response => {
                    if (response.data.status === 'success') {
                        // Aggiorna lo stato di completamento nella lista locale
                        const index = this.tasks.findIndex(t => t.id === task.id);
                        if (index !== -1) {
                            this.tasks[index].completed = updatedTask.completed;
                        }
                    } else {
                        alert('Error: ' + response.data.message);
                    }
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        },

        // Elimina un'attività se è completata
        deleteTask(task) {
            if (task.completed) {
                axios.delete('api.php', { data: { id: task.id } })
                    .then(response => {
                        if (response.data.status === 'success') {
                            // Rimuove l'attività dalla lista locale
                            this.tasks = this.tasks.filter(t => t.id !== task.id);
                        } else {
                            alert('Error: ' + response.data.message);
                        }
                    })
                    .catch(error => {
                        console.error('There was an error!', error);
                    });
            } else {
                alert('Task must be completed before deletion');
            }
        },

        // Aggiorna un'attività con i nuovi valori
        updateTask(task) {
            // Crea una copia dell'attività corrente con i nuovi valori
            const updatedTask = { 
                id: task.id,
                text: task.text,
                description: task.description,
                completed: task.completed // Mantenere lo stato di completamento se necessario
            };

            // Chiude la modalità di modifica
            task.isEditing = false;

            // Invia l'aggiornamento al server
            axios.put('api.php', updatedTask)
                .then(response => {
                    if (response.data.status === 'success') {
                        // Nessun bisogno di ulteriori aggiornamenti se i dati sono già legati a `task`
                    } else {
                        alert('Error: ' + response.data.message);
                    }
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    },
    
    // Carica le attività quando l'app viene montata
    mounted() {
        this.fetchTasks();
    }
}).mount('#app');
