import { Injectable } from '@nestjs/common';

/** Relógio injetável (facilita testes) */
@Injectable()
export class Clock {
  now(): number {
    return Date.now();
  }
}

/** Fonte de aleatoriedade injetável: devolve número em [0, 1) */
@Injectable()
export class RandomService {
  next(): number {
    return Math.random();
  }
}
