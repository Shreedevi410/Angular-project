import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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

  isTaskVisible(task: Task): boolean {
    return (
      this.taskFilter === 'all' ||
      (this.taskFilter === 'active' && !task.completed) ||
      (this.taskFilter === 'completed' && task.completed)
    );
  }

  get visibleTaskCount(): number {
    return this.tasks.filter((task) => this.isTaskVisible(task)).length;
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
