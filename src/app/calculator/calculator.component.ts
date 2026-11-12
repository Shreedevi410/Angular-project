import { Component } from '@angular/core';

type CalculatorOperator = '+' | '-' | '×' | '÷';

@Component({
  selector: 'app-calculator',
  standalone: true,
  template: `
    <main class="calculator" aria-label="Calculator">
      <h1>Calculator</h1>
      <output class="calculator__display" aria-live="polite">{{ display }}</output>

      <div class="calculator__keys">
        <button class="calculator__utility" type="button" (click)="clear()">AC</button>
        <button class="calculator__utility" type="button" (click)="deleteLast()" aria-label="Delete last digit">DEL</button>
        <button class="calculator__operator" type="button" (click)="chooseOperator('÷')">÷</button>
        <button class="calculator__operator" type="button" (click)="chooseOperator('×')">×</button>

        <button type="button" (click)="appendDigit('7')">7</button>
        <button type="button" (click)="appendDigit('8')">8</button>
        <button type="button" (click)="appendDigit('9')">9</button>
        <button class="calculator__operator" type="button" (click)="chooseOperator('-')">−</button>

        <button type="button" (click)="appendDigit('4')">4</button>
        <button type="button" (click)="appendDigit('5')">5</button>
        <button type="button" (click)="appendDigit('6')">6</button>
        <button class="calculator__operator" type="button" (click)="chooseOperator('+')">+</button>

        <button type="button" (click)="appendDigit('1')">1</button>
        <button type="button" (click)="appendDigit('2')">2</button>
        <button type="button" (click)="appendDigit('3')">3</button>
        <button class="calculator__equals" type="button" (click)="calculate()">=</button>

        <button class="calculator__zero" type="button" (click)="appendDigit('0')">0</button>
        <button type="button" (click)="appendDecimal()">.</button>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      padding: 32px 16px;
      color: #20283a;
      font-family: Inter, "Segoe UI", sans-serif;
    }

    .calculator {
      width: min(100%, 340px);
      margin: 0 auto;
      padding: 24px;
      border: 1px solid #e8ebf2;
      border-radius: 20px;
      background: #fff;
      box-shadow: 0 16px 48px rgb(34 47 76 / 8%);
    }

    h1 {
      margin: 0 0 18px;
      font-size: 1.25rem;
    }

    .calculator__display {
      display: flex;
      min-height: 64px;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 16px;
      padding: 12px;
      overflow: hidden;
      border-radius: 12px;
      background: #f4f6fb;
      font-size: clamp(1.75rem, 10vw, 2.5rem);
      font-variant-numeric: tabular-nums;
    }

    .calculator__keys {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    button {
      min-height: 52px;
      border: 0;
      border-radius: 10px;
      background: #f4f6fb;
      color: inherit;
      font: inherit;
      font-size: 1.1rem;
      cursor: pointer;
    }

    button:hover {
      filter: brightness(0.96);
    }

    button:focus-visible {
      outline: 3px solid rgb(98 88 217 / 35%);
      outline-offset: 2px;
    }

    .calculator__utility {
      background: #eef0f7;
      color: #5a6376;
    }

    .calculator__operator {
      background: #eef2ff;
      color: #5046c5;
    }

    .calculator__equals {
      grid-row: span 2;
      background: #6258d9;
      color: #fff;
    }

    .calculator__zero {
      grid-column: span 2;
    }
  `],
})
export class CalculatorComponent {
  display = '0';
  private storedValue: number | null = null;
  private operator: CalculatorOperator | null = null;
  private waitingForOperand = false;

  appendDigit(digit: string): void {
    this.display = this.waitingForOperand || this.display === '0' || this.display === 'Error'
      ? digit
      : `${this.display}${digit}`;
    this.waitingForOperand = false;
  }

  appendDecimal(): void {
    if (this.waitingForOperand || this.display === 'Error') {
      this.display = '0.';
      this.waitingForOperand = false;
    } else if (!this.display.includes('.')) {
      this.display += '.';
    }
  }

  chooseOperator(operator: CalculatorOperator): void {
    const currentValue = Number(this.display);

    if (this.operator && !this.waitingForOperand && this.storedValue !== null) {
      const result = this.performCalculation(this.storedValue, currentValue, this.operator);
      if (result === null) {
        this.showError();
        return;
      }
      this.display = this.formatResult(result);
      this.storedValue = result;
    } else {
      this.storedValue = currentValue;
    }

    this.operator = operator;
    this.waitingForOperand = true;
  }

  calculate(): void {
    if (this.operator === null || this.storedValue === null || this.waitingForOperand) {
      return;
    }

    const result = this.performCalculation(this.storedValue, Number(this.display), this.operator);
    if (result === null) {
      this.showError();
      return;
    }

    this.display = this.formatResult(result);
    this.storedValue = null;
    this.operator = null;
    this.waitingForOperand = true;
  }

  clear(): void {
    this.display = '0';
    this.storedValue = null;
    this.operator = null;
    this.waitingForOperand = false;
  }

  deleteLast(): void {
    if (this.display === 'Error' || this.waitingForOperand) {
      this.clear();
      return;
    }

    this.display = this.display.length > 1 ? this.display.slice(0, -1) : '0';
    if (this.display === '-') {
      this.display = '0';
    }
  }

  private performCalculation(
    firstValue: number,
    secondValue: number,
    operator: CalculatorOperator,
  ): number | null {
    if (operator === '÷' && secondValue === 0) {
      return null;
    }

    switch (operator) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
    }
  }

  private formatResult(value: number): string {
    return Number.isFinite(value) ? String(Number(value.toPrecision(10))) : 'Error';
  }

  private showError(): void {
    this.display = 'Error';
    this.storedValue = null;
    this.operator = null;
    this.waitingForOperand = true;
  }
}
