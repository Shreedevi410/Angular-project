import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Task {
  title: string;
  completed: boolean;
}

type TaskFilter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly storageKey = 'angular-task-list.tasks';
  taskFilter: TaskFilter = 'all';
  tasks: Task[] = this.loadTasks();
  searchTerm = '';
  editingTaskIndex: number | null = null;
  draftTaskTitle = '';

  isTaskVisible(task: Task): boolean {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(this.searchTerm.trim().toLowerCase());

    return matchesSearch && (
      this.taskFilter === 'all' ||
      (this.taskFilter === 'active' && !task.completed) ||
      (this.taskFilter === 'completed' && task.completed)
    );
  }

  get visibleTaskCount(): number {
    return this.tasks.filter((task) => this.isTaskVisible(task)).length;
  }

  get allTasksCompleted(): boolean {
    return this.tasks.length > 0 && this.tasks.every((task) => task.completed);
  }

  addTask(title: string): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    this.tasks.push({ title: trimmedTitle, completed: false });
    this.saveTasks();
  }

  toggleTask(index: number): void {
    const task = this.tasks[index];
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
    }
  }

  toggleAllTasks(): void {
    const shouldComplete = !this.allTasksCompleted;
    this.tasks = this.tasks.map((task) => ({
      ...task,
      completed: shouldComplete,
    }));
    this.saveTasks();
  }

  startEditingTask(index: number): void {
    const task = this.tasks[index];
    if (!task) {
      return;
    }

    this.editingTaskIndex = index;
    this.draftTaskTitle = task.title;
  }

  saveEditedTask(index: number): void {
    const trimmedTitle = this.draftTaskTitle.trim();
    const task = this.tasks[index];

    if (!task || !trimmedTitle) {
      this.cancelEditingTask();
      return;
    }

    task.title = trimmedTitle;
    this.editingTaskIndex = null;
    this.draftTaskTitle = '';
    this.saveTasks();
  }

  cancelEditingTask(): void {
    this.editingTaskIndex = null;
    this.draftTaskTitle = '';
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  clearCompletedTasks(): void {
    const remainingTasks = this.tasks.filter((task) => !task.completed);
    if (remainingTasks.length !== this.tasks.length) {
      this.tasks = remainingTasks;
      this.saveTasks();
    }
  }

  private loadTasks(): Task[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const savedTasks = window.localStorage.getItem(this.storageKey);
    if (savedTasks === null) {
      return [];
    }

    let parsedTasks: unknown;
    try {
      parsedTasks = JSON.parse(savedTasks);
    } catch (error) {
      console.error('Unable to parse saved tasks from local storage.', error);
      return [];
    }

    if (
      !Array.isArray(parsedTasks) ||
      !parsedTasks.every(
        (task: unknown): task is Task =>
          typeof task === 'object' &&
          task !== null &&
          'title' in task &&
          typeof task.title === 'string' &&
          'completed' in task &&
          typeof task.completed === 'boolean',
      )
    ) {
      console.error('Saved tasks in local storage have an invalid format.');
      return [];
    }

    return parsedTasks;
  }

  private saveTasks(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }
  }
}
