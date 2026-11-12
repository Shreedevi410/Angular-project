import { Component } from '@angular/core';

type CalculatorOperator = '+' | '-' | '×' | '÷';

@Component({
  selector: 'app-calculator',
  standalone: true,
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
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
