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
  tasks: Task[] = [];

  addTask(title: string): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    this.tasks.push({ title: trimmedTitle, completed: false });
  }

  toggleTask(index: number): void {
    const task = this.tasks[index];
    if (task) {
      task.completed = !task.completed;
    }
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
  }
}
