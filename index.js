var RemindersList = /** @class */ (function () {
    function RemindersList(storage) {
        this.maxReminders = 15;
        this.reminders = [];
        this.storage = storage;
        this.completedListElement = this.getElement('completedList');
        this.loadAndRender();
        this.setupEventListeners();
        this.setupForm();
    }

    RemindersList.prototype.addReminder = function (text) {
        var newReminder = { id: Date.now(), text: text, completed: false };
        this.reminders.push(newReminder);
        this.saveAndRender();
    };

    RemindersList.prototype.clearCompleted = function () {
        this.reminders = this.reminders.filter(function (reminder) { return !reminder.completed; });
        this.saveAndRender();
    };

    RemindersList.prototype.getElement = function (id) {
        return document.getElementById(id);
    };

    RemindersList.prototype.isMaxRemindersReached = function () {
        return this.reminders.length >= this.maxReminders;
    };

    RemindersList.prototype.loadAndRender = function () {
        var remindersJson = this.storage.getItem('reminders');
        if (remindersJson) {
            this.reminders = JSON.parse(remindersJson);
        }
        this.render();
    };

    RemindersList.prototype.render = function () {
        var _this = this;
        this.reminders.sort(function (a, b) { return a.text.localeCompare(b.text); });
        var reminderList = this.getElement('remindersList');
        var completedReminders = document.createDocumentFragment();
        var openReminders = document.createDocumentFragment();
        var _a = this, completedListElement = _a.completedListElement, reminders = _a.reminders;
        completedListElement.innerHTML = '';
        reminderList.innerHTML = '';
        reminders.forEach(function (reminder) {
            var listItem = document.createElement('li');
            listItem.textContent = reminder.text;
            listItem.addEventListener('click', function () {
                reminder.completed = !reminder.completed;
                _this.saveAndRender();
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
    };

    RemindersList.prototype.saveAndRender = function () {
        this.storage.setItem('reminders', JSON.stringify(this.reminders));
        this.render();
    };

    RemindersList.prototype.setupEventListeners = function () {
        var _this = this;
        var showCompletedButton = this.getElement('showCompletedButton');
        showCompletedButton.addEventListener('click', function () {
            _this.completedListElement.classList.toggle('hidden');
            var hrElement = _this.getElement('hrElement');
            hrElement.classList.toggle('hidden');
        });
        this.getElement('clearCompletedButton').addEventListener('click', function () {
            _this.clearCompleted();
        });
    };

    RemindersList.prototype.setupForm = function () {
        this.setupFormEventListeners();
        this.updateStatus();
    };

    RemindersList.prototype.setupFormEventListeners = function () {
        var _this = this;
        var form = this.getElement('remindersForm');
        var input = this.getElement('remindersInput');
        form.addEventListener('submit', function (e) {
            _this.addReminder(input.value.trim());
            input.value = '';
            input.focus();
            e.preventDefault();
        });
    };

    RemindersList.prototype.updateStatus = function () {
        var form = this.getElement('remindersForm');
        var input = this.getElement('remindersInput');
        var isMaxReached = this.isMaxRemindersReached();
        isMaxReached ? form.classList.add('disabled') : form.classList.remove('disabled');
        input.disabled = isMaxReached;
    };

    return RemindersList;
}());

var app = new RemindersList(localStorage);