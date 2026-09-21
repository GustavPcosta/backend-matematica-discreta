import { Injectable, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { EstadoJogo } from '../domain/tipos';

/**
 * Repositório em memória. Se a variável PERSIST_FILE estiver definida,
 * os jogos também são gravados nesse arquivo JSON (persistência simples).
 */
@Injectable()
export class GameRepository implements OnModuleInit {
  private readonly jogos = new Map<string, EstadoJogo>();
  private readonly arquivo = process.env.PERSIST_FILE;

  onModuleInit(): void {
    if (this.arquivo && existsSync(this.arquivo)) {
      const dados = JSON.parse(readFileSync(this.arquivo, 'utf8')) as EstadoJogo[];
      dados.forEach((j) => this.jogos.set(j.id, j));
    }
  }

  find(id: string): EstadoJogo | undefined {
    const jogo = this.jogos.get(id);
    return jogo ? structuredClone(jogo) : undefined;
  }

  save(estado: EstadoJogo): void {
    this.jogos.set(estado.id, structuredClone(estado));
    this.persistir();
  }

  delete(id: string): boolean {
    const removido = this.jogos.delete(id);
    if (removido) this.persistir();
    return removido;
  }

  private persistir(): void {
    if (!this.arquivo) return;
    mkdirSync(dirname(this.arquivo), { recursive: true });
    writeFileSync(this.arquivo, JSON.stringify([...this.jogos.values()]));
  }
}
