import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Task {
  title: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: number;
}

type TaskFilter = 'all' | 'active' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly storageKey = 'angular-task-list.tasks';
  readonly priorityOrder: Record<TaskPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  taskFilter: TaskFilter = 'all';
  taskPriority: TaskPriority = 'medium';
  taskDueDate = '';
  tasks: Task[] = this.loadTasks();
  searchTerm = '';
  editingTask: Task | null = null;
  draftTaskTitle = '';

  get sortedTasks(): Task[] {
    return [...this.tasks].sort((firstTask, secondTask) => {
      if (firstTask.completed !== secondTask.completed) {
        return Number(firstTask.completed) - Number(secondTask.completed);
      }

      const priorityDifference =
        this.priorityOrder[firstTask.priority] - this.priorityOrder[secondTask.priority];
      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      const firstDueDate = firstTask.dueDate ?? '9999-12-31';
      const secondDueDate = secondTask.dueDate ?? '9999-12-31';
      return firstDueDate.localeCompare(secondDueDate);
    });
  }

  get taskStats(): {
    active: number;
    completed: number;
    dueToday: number;
    highPriority: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      active: this.tasks.filter((task) => !task.completed).length,
      completed: this.tasks.filter((task) => task.completed).length,
      dueToday: this.tasks.filter((task) => this.isDueToday(task.dueDate, today)).length,
      highPriority: this.tasks.filter((task) => task.priority === 'high' && !task.completed).length,
    };
  }

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

  get completionPercentage(): number {
    if (this.tasks.length === 0) {
      return 0;
    }

    return (this.tasks.filter((task) => task.completed).length / this.tasks.length) * 100;
  }

  get remainingTasksCount(): number {
    return this.tasks.filter((task) => !task.completed).length;
  }

  addTask(title: string): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    this.tasks.push({
      title: trimmedTitle,
      completed: false,
      priority: this.taskPriority,
      dueDate: this.taskDueDate || null,
      createdAt: Date.now(),
    });
    this.taskPriority = 'medium';
    this.taskDueDate = '';
    this.saveTasks();
  }

  toggleTask(task: Task): void {
    task.completed = !task.completed;
    this.saveTasks();
  }

  toggleAllTasks(): void {
    const shouldComplete = !this.allTasksCompleted;
    this.tasks = this.tasks.map((task) => ({
      ...task,
      completed: shouldComplete,
    }));
    this.saveTasks();
  }

  startEditingTask(task: Task): void {
    this.editingTask = task;
    this.draftTaskTitle = task.title;
  }

  saveEditedTask(task: Task): void {
    const trimmedTitle = this.draftTaskTitle.trim();

    if (!trimmedTitle) {
      this.cancelEditingTask();
      return;
    }

    task.title = trimmedTitle;
    this.editingTask = null;
    this.draftTaskTitle = '';
    this.saveTasks();
  }

  cancelEditingTask(): void {
    this.editingTask = null;
    this.draftTaskTitle = '';
  }

  removeTask(task: Task): void {
    this.tasks = this.tasks.filter((currentTask) => currentTask !== task);
    if (this.editingTask === task) {
      this.cancelEditingTask();
    }
    this.saveTasks();
  }

  clearCompletedTasks(): void {
    const remainingTasks = this.tasks.filter((task) => !task.completed);
    if (remainingTasks.length !== this.tasks.length) {
      this.tasks = remainingTasks;
      this.saveTasks();
    }
  }

  resetTaskList(): void {
    this.tasks = [];
    this.editingTask = null;
    this.draftTaskTitle = '';
    this.saveTasks();
  }

  getPriorityLabel(priority: TaskPriority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  getDueDateLabel(dueDate: string | null): string {
    if (!dueDate) {
      return '';
    }

    const parsedDate = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const differenceInDays = Math.round((parsedDate.getTime() - today.getTime()) / 86400000);

    if (differenceInDays === 0) {
      return 'Due today';
    }

    if (differenceInDays > 0) {
      return `Due in ${differenceInDays} day${differenceInDays === 1 ? '' : 's'}`;
    }

    return `${Math.abs(differenceInDays)} day${Math.abs(differenceInDays) === 1 ? '' : 's'} overdue`;
  }

  private isDueToday(dueDate: string | null, today: Date): boolean {
    if (!dueDate) {
      return false;
    }

    const parsedDate = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return false;
    }

    const dueDateValue = new Date(parsedDate); 
    dueDateValue.setHours(0, 0, 0, 0);
    return dueDateValue.getTime() === today.getTime();
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
          typeof task.completed === 'boolean' &&
          'priority' in task &&
          (task.priority === 'low' || task.priority === 'medium' || task.priority === 'high') &&
          'dueDate' in task &&
          (typeof task.dueDate === 'string' || task.dueDate === null) &&
          'createdAt' in task &&
          typeof task.createdAt === 'number',
      )
    ) {
      console.error('Saved tasks in local storage have an invalid format.');
      return [];
    }

    return parsedTasks.map((task) => ({
      title: task.title,
      completed: task.completed,
      priority: task.priority ?? 'medium',
      dueDate: task.dueDate ?? null,
      createdAt: task.createdAt ?? Date.now(),
    }));
  }

  private saveTasks(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }
  }
}
