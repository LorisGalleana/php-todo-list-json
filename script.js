const { createApp } = Vue;

createApp({
    data() {
        return {
            tasks: [],
            newTask: '',
            newDescription: ''
        };
    },
    methods: {
        fetchTasks() {
            axios.get('api.php')
            .then(response => {
                if (Array.isArray(response.data)) {
                    this.tasks = response.data.map(task => ({ ...task, showDescription: false }));
                } else {
                    console.error('Data format error: expected an array');
                }
            })
            .catch(error => {
                console.error('There was an error fetching tasks!', error);
            });
        },
        addTask() {
            if (this.newTask.trim() !== '') {
                const task = {
                    id: Date.now(),
                    text: this.newTask,
                    completed: false,
                    description: this.newDescription || ''
                };

                axios.post('api.php', { task })
                    .then(response => {
                        if (response.data.status === 'success') {
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
        toggleTaskCompletion(task) {
            const updatedTask = {...task, completed: !task.completed};
            axios.put('api.php', updatedTask)
            .then(response => {
                if (response.data.status === 'success') {
                    const index= this.tasks.findIndex(t => t.id === task.id);
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
        deleteTask(task) {
            if (task.completed) {
                axios.delete('api.php', { data: { id: task.id } })
                .then(response => {
                    if (response.data.status === 'success') {
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
        updateTask(task) {
            // Crea una copia dell'attività corrente e aggiorna solo i campi non vuoti
            const updatedTask = { ...task };
        
            // Solo se i nuovi valori non sono vuoti, aggiorniamo i campi dell'attività
            if (task.newText.trim() !== '') {
                updatedTask.text = task.newText;
            }
            if (task.newDescription.trim() !== '') {
                updatedTask.description = task.newDescription;
            }
        
            // Chiude la modalità di modifica
            updatedTask.isEditing = false;
        
            // Invia l'aggiornamento al server
            axios.put('api.php', updatedTask)
            .then(response => {
                if (response.data.status === 'success') {
                    // Trova l'indice della task aggiornata
                    const index = this.tasks.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        // Aggiorna solo i campi modificati
                        if (task.newText.trim() !== '') {
                            this.tasks[index].text = updatedTask.text;
                        }
                        if (task.newDescription.trim() !== '') {
                            this.tasks[index].description = updatedTask.description;
                        }
                    }
                } else {
                    alert('Error: ' + response.data.message);
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
        }
        //aggiungi qua nuovo method
    },
    
    mounted() {
        this.fetchTasks();
    }
}).mount('#app');