import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Task {
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly storageKey = 'angular-task-list.tasks';
  tasks: Task[] = this.loadTasks();

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
