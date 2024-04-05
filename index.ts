interface Reminder {
    completed: boolean;
    id: number;
    text: string;
}

class RemindersList {
    private completedListElement: HTMLUListElement;
    private readonly maxReminders: number = 15;
    private reminders: Reminder[] = [];
    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
        this.completedListElement = this.getElement<HTMLUListElement>('completedList');
        this.loadAndRender();
        this.setupEventListeners();
        this.setupForm();
    }

    private addReminder(text: string): void {
        const newReminder: Reminder = { id: Date.now(), text, completed: false };
        this.reminders.push(newReminder);
        this.saveAndRender();
    }

    private clearCompleted(): void {
        this.reminders = this.reminders.filter(reminder => !reminder.completed);
        this.saveAndRender();
    }

    private getElement<T extends HTMLElement>(id: string): T {
        return document.getElementById(id) as T;
    }

    private isMaxRemindersReached(): boolean {
        return this.reminders.length >= this.maxReminders;
    }

    private loadAndRender(): void {
        const remindersJson = this.storage.getItem('reminders');
        if (remindersJson) {
            this.reminders = JSON.parse(remindersJson);
        }
        this.render();
    }

    private render(): void {
        this.reminders.sort((a, b) => a.text.localeCompare(b.text));
        const reminderList = this.getElement<HTMLUListElement>('remindersList');
        const completedReminders = document.createDocumentFragment();
        const openReminders = document.createDocumentFragment();

        const { completedListElement, reminders } = this;

        completedListElement.innerHTML = '';
        reminderList.innerHTML = '';

        reminders.forEach(reminder => {
            const listItem = document.createElement('li');
            listItem.textContent = reminder.text;
            listItem.addEventListener('click', () => {
                reminder.completed = !reminder.completed;
                this.saveAndRender();
            });

            if (reminder.completed) {
                listItem.classList.add('completed');
                completedReminders.appendChild(listItem);
            } else {
                openReminders.appendChild(listItem);
            }
        });

        completedListElement.appendChild(completedReminders);
        reminderList.appendChild(openReminders);

        this.updateStatus();
    }

    private saveAndRender(): void {
        this.storage.setItem('reminders', JSON.stringify(this.reminders));
        this.render();
    }
    
    private setupEventListeners(): void {
        const showCompletedButton = this.getElement<HTMLButtonElement>('showCompletedButton');
        showCompletedButton.addEventListener('click', () => {
            this.completedListElement.classList.toggle('hidden');
            const hrElement = this.getElement<HTMLHRElement>('hrElement');
            hrElement.classList.toggle('hidden');
        });
        this.getElement<HTMLButtonElement>('clearCompletedButton').addEventListener('click', () => {
            this.clearCompleted();
        });
    }
    
    private setupForm(): void {
        this.setupFormEventListeners();
        this.updateStatus();
    }
    
    private setupFormEventListeners(): void {
        const form = this.getElement<HTMLFormElement>('remindersForm');
        const input = this.getElement<HTMLInputElement>('remindersInput');
        form.addEventListener('submit', (e) => {
            this.addReminder(input.value.trim());
            input.value = '';
            input.focus();
            e.preventDefault();
        });
    }
    
    private updateStatus(): void {
        const form = this.getElement<HTMLFormElement>('remindersForm');
        const input = this.getElement<HTMLInputElement>('remindersInput');
        const isMaxReached = this.isMaxRemindersReached();
    
        isMaxReached ? form.classList.add('disabled') : form.classList.remove('disabled');
        input.disabled = isMaxReached;
    }
}
    
const app = new RemindersList(localStorage);