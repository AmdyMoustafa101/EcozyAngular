import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> | undefined;

  constructor() {}

  /**
   * Se connecte au serveur WebSocket et retourne le WebSocketSubject.
   * Si la connexion existe déjà, elle la réutilise.
   *
   * @param url L'URL du serveur WebSocket (par défaut 'ws://localhost:8000')
   * @returns WebSocketSubject<any>
   */
  public connect(url: string = 'ws://localhost:8000'): WebSocketSubject<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url,
        // Transformation des messages reçus en objet JSON
        deserializer: (e: MessageEvent) => JSON.parse(e.data),
        // On peut également définir un serializer pour les messages envoyés :
        serializer: (value: any) => JSON.stringify(value),
      });
    }
    return this.socket$;
  }

  /**
   * Ferme la connexion WebSocket.
   */
  public close(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  /**
   * Retourne un Observable qui émet les messages reçus.
   */
  public getMessages(): Observable<any> {
    return this.connect(); // Se connecte et retourne l'Observable
  }
}
