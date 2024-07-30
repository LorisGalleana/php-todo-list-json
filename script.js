const { createApp } = Vue;

createApp({
    data() {
        return {
            tasks: [],
            newTask: '',
            newDescription: '',
            paragraphDescription: '', // Per aggiungere paragrafi alle descrizioni esistenti
            editingTaskId: null // Per tenere traccia della task in modifica
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
                const existingTask = this.tasks.find(task => task.text === this.newTask && !task.completed);

                if (existingTask) {
                    alert('Task with this name already exists. Please add a description to the existing task.');
                } else {
                    const task = {
                        id: Date.now(),
                        text: this.newTask,
                        completed: false,
                        description: this.newDescription ? [this.newDescription] : []
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
            }
        },
        toggleTaskCompletion(task) {
            const updatedTask = { ...task, completed: !task.completed };
            axios.put('api.php', updatedTask)
            .then(response => {
                if (response.data.status === 'success') {
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
            const updatedTask = { 
                id: task.id,
                text: task.text,
                description: task.description, // Mantiene tutti i paragrafi esistenti
                completed: task.completed
            };

            task.isEditing = false;

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
        },
        addParagraphToDescription(task) {
            if (this.paragraphDescription.trim() !== '') {
                task.description.push(this.paragraphDescription);
                this.paragraphDescription = '';
                this.updateTask(task);
                this.startEditing(task);
            }
        },
        removeParagraphFromDescription(task, index) {
            task.description.splice(index, 1);
            this.updateTask(task);
            
        },
        startEditing(task) {
            this.editingTaskId = task.id;
            this.paragraphDescription = '';
            task.isEditing = true;
        }
    },
    mounted() {
        this.fetchTasks();
    }
}).mount('#app');
