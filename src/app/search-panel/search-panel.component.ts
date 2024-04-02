
import { Component, EventEmitter, Output, Input, SimpleChanges  } from '@angular/core';
@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.css'
})
export class SearchPanelComponent {

  @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() suggestions: string[] = [];
  menuOpacity: number = 0; // Opacité initiale à 100%

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
    this.inputChange.emit(value); // Émettre la valeur à chaque saisie de l'utilisateur
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['suggestions']) {
      // Le changement a été détecté sur la propriété `suggestions`
      if (changes['suggestions'].currentValue.length != 0) {
        this.restoreOpacity();
      }

      // Vous pouvez ici implémenter la logique souhaitée suite au changement
      // Par exemple, mettre à jour une autre propriété du composant ou appeler une fonction
    }
  }

  makeMenuTransparent(): void {
    this.menuOpacity = 0.3; // Change l'opacité à 50%
  }
  restoreOpacity(): void {
    this.menuOpacity = 1; // Restaure l'opacité complète
  }
}
